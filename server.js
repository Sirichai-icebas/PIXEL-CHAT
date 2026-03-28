const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 5e6, // 5MB for image uploads
});

app.use(express.static(path.join(__dirname, 'public')));

const MAX_MESSAGES = 100;

// rooms: Map<roomId, { id, name, icon, createdBy, createdAt, messages[], users: Map<socketId, user> }>
const rooms = new Map();

// Create a default room
rooms.set('general', {
  id: 'general',
  name: 'General Chat',
  icon: 'home',
  createdBy: 'System',
  createdAt: new Date().toISOString(),
  messages: [],
  users: new Map(),
});

rooms.set('gaming', {
  id: 'gaming',
  name: 'Gaming Zone',
  icon: 'gamepad',
  createdBy: 'System',
  createdAt: new Date().toISOString(),
  messages: [],
  users: new Map(),
});

rooms.set('chill', {
  id: 'chill',
  name: 'Chill Vibes',
  icon: 'coffee',
  createdBy: 'System',
  createdAt: new Date().toISOString(),
  messages: [],
  users: new Map(),
});

// Track which room each socket is in
const socketRoom = new Map(); // socketId -> roomId
const socketUser = new Map(); // socketId -> user info
const dmHistory = new Map(); // conversationKey -> messages[]
const socketLastSeen = new Map(); // socketId -> timestamp (for stale user cleanup)
const STALE_USER_TIMEOUT = 3 * 60 * 1000; // 3 minutes

function getRoomList() {
  const list = [];
  for (const [id, room] of rooms) {
    list.push({
      id: room.id,
      name: room.name,
      icon: room.icon,
      createdBy: room.createdBy,
      userCount: room.users.size,
    });
  }
  return list;
}

io.on('connection', (socket) => {
  console.log(`Connected: ${socket.id}`);
  socketLastSeen.set(socket.id, Date.now());

  // Heartbeat: update last seen on any activity
  socket.onAny(() => {
    socketLastSeen.set(socket.id, Date.now());
  });

  // Send room list and global users on connect
  socket.emit('room-list', getRoomList());
  socket.emit('global-users', getGlobalOnlineUsers());

  // User sets their profile
  socket.on('set-profile', (data) => {
    let profilePhoto = data.profilePhoto || null;
    if (profilePhoto && (typeof profilePhoto !== 'string' || !profilePhoto.startsWith('data:image/') || profilePhoto.length > 300000)) {
      profilePhoto = null;
    }
    socketUser.set(socket.id, {
      userId: data.userId,
      displayName: data.displayName,
      avatarId: data.avatarId,
      profilePhoto,
      status: 'online',
      statusMessage: '',
      currentRoom: null,
    });
    broadcastGlobalUsers();
  });

  // Set user status
  socket.on('set-status', (data) => {
    const user = socketUser.get(socket.id);
    if (!user) return;
    const validStatuses = ['online', 'away', 'busy', 'invisible'];
    if (data.status && validStatuses.includes(data.status)) {
      user.status = data.status;
    }
    if (typeof data.statusMessage === 'string') {
      user.statusMessage = data.statusMessage.slice(0, 50);
    }
    broadcastGlobalUsers();
  });

  // Create a new room
  socket.on('create-room', (data) => {
    const user = socketUser.get(socket.id);
    if (!user) return;

    const name = (data.name || '').trim();
    if (!name || name.length > 30) return;

    const roomId = uuidv4().slice(0, 8);
    const icon = data.icon || 'chat';

    rooms.set(roomId, {
      id: roomId,
      name,
      icon,
      createdBy: user.displayName,
      createdAt: new Date().toISOString(),
      messages: [],
      users: new Map(),
    });

    // Broadcast updated room list to everyone
    io.emit('room-list', getRoomList());
    socket.emit('room-created', { roomId });
  });

  // Join a room
  socket.on('join-room', (data) => {
    const user = socketUser.get(socket.id);
    if (!user) return;

    const room = rooms.get(data.roomId);
    if (!room) return;

    // Leave current room first
    const currentRoomId = socketRoom.get(socket.id);
    if (currentRoomId) {
      leaveRoom(socket, currentRoomId);
    }

    // Join new room
    socket.join(data.roomId);
    socketRoom.set(socket.id, data.roomId);
    const userInfo = socketUser.get(socket.id);
    if (userInfo) { userInfo.currentRoom = data.roomId; }
    broadcastGlobalUsers();
    room.users.set(socket.id, user);

    // Send message history
    socket.emit('message-history', room.messages);

    // Send online users for this room
    io.to(data.roomId).emit('online-users', Array.from(room.users.values()));

    // System message
    const sysMsg = {
      id: uuidv4(),
      userId: 'system',
      displayName: 'System',
      avatarId: '',
      content: `${user.displayName} เข้าร่วมห้อง`,
      timestamp: new Date().toISOString(),
      type: 'system',
    };
    room.messages.push(sysMsg);
    if (room.messages.length > MAX_MESSAGES) room.messages.shift();
    io.to(data.roomId).emit('new-message', sysMsg);

    // Update room list for everyone (user counts changed)
    io.emit('room-list', getRoomList());
  });

  // Leave room
  socket.on('leave-room', () => {
    const roomId = socketRoom.get(socket.id);
    if (roomId) {
      removeFromCall(socket, roomId);
      leaveRoom(socket, roomId);
      io.emit('room-list', getRoomList());
    }
    socket.emit('left-room');
  });

  // Send message (text, with optional reply and mentions)
  socket.on('send-message', (data) => {
    const user = socketUser.get(socket.id);
    const roomId = socketRoom.get(socket.id);
    if (!user || !roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    const content = (data.content || '').trim();
    if (!content || content.length > 500) return;

    const msg = {
      id: uuidv4(),
      userId: user.userId,
      displayName: user.displayName,
      avatarId: user.avatarId,
      content,
      timestamp: new Date().toISOString(),
      type: 'message',
    };

    // Reply reference
    if (data.replyTo) {
      const original = room.messages.find((m) => m.id === data.replyTo);
      if (original) {
        msg.replyTo = {
          id: original.id,
          displayName: original.displayName,
          content: (original.content || '').slice(0, 80),
          type: original.type,
          imageUrl: original.imageUrl ? '(รูปภาพ)' : undefined,
        };
      }
    }

    // Mentions
    if (data.mentions && Array.isArray(data.mentions)) {
      msg.mentions = data.mentions.slice(0, 10);
    }

    room.messages.push(msg);
    if (room.messages.length > MAX_MESSAGES) room.messages.shift();
    io.to(roomId).emit('new-message', msg);
  });

  // Send image message
  socket.on('send-image', (data) => {
    const user = socketUser.get(socket.id);
    const roomId = socketRoom.get(socket.id);
    if (!user || !roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    const imageUrl = data.imageUrl;
    if (!imageUrl || typeof imageUrl !== 'string') return;
    // Validate it's a data URL and not too large (max ~4MB base64)
    if (!imageUrl.startsWith('data:image/') || imageUrl.length > 5500000) return;

    const msg = {
      id: uuidv4(),
      userId: user.userId,
      displayName: user.displayName,
      avatarId: user.avatarId,
      content: data.content || '',
      imageUrl,
      timestamp: new Date().toISOString(),
      type: 'image',
    };

    if (data.replyTo) {
      const original = room.messages.find((m) => m.id === data.replyTo);
      if (original) {
        msg.replyTo = {
          id: original.id,
          displayName: original.displayName,
          content: (original.content || '').slice(0, 80),
          type: original.type,
          imageUrl: original.imageUrl ? '(รูปภาพ)' : undefined,
        };
      }
    }

    room.messages.push(msg);
    if (room.messages.length > MAX_MESSAGES) room.messages.shift();
    io.to(roomId).emit('new-message', msg);
  });

  // Typing indicator
  socket.on('typing', () => {
    const user = socketUser.get(socket.id);
    const roomId = socketRoom.get(socket.id);
    if (!user || !roomId) return;
    socket.to(roomId).emit('user-typing', { userId: user.userId, displayName: user.displayName });
  });

  // Word Guess game
  handleWordGuessEvents(socket);

  // Pok Deng card game
  handlePokDengEvents(socket);

  // Voice/Video Call
  handleCallEvents(socket);

  // Private 1:1 Call
  handlePrivateCallEvents(socket);

  // Invite to room
  socket.on('invite-to-room', (data) => {
    const user = socketUser.get(socket.id);
    if (!user) return;
    const targetSocket = io.sockets.sockets.get(data.targetSocketId);
    const targetUser = socketUser.get(data.targetSocketId);
    if (!targetSocket || !targetUser || targetUser.status === 'invisible') return;
    const room = rooms.get(data.roomId);
    if (!room) return;
    targetSocket.emit('room-invitation', {
      fromDisplayName: user.displayName,
      fromAvatarId: user.avatarId,
      fromProfilePhoto: user.profilePhoto,
      roomId: data.roomId,
      roomName: room.name,
    });
  });

  // ===== DIRECT MESSAGES (1:1 Chat) =====

  // DM history store: Map<conversationKey, messages[]>
  // conversationKey = sorted pair of userIds joined by ':'

  socket.on('dm:send', (data) => {
    const user = socketUser.get(socket.id);
    if (!user) return;
    const targetSocket = io.sockets.sockets.get(data.targetSocketId);
    const targetUser = socketUser.get(data.targetSocketId);
    if (!targetSocket || !targetUser) return;

    const content = (data.content || '').trim();
    if (!content || content.length > 500) return;

    const msg = {
      id: uuidv4(),
      fromSocketId: socket.id,
      fromUserId: user.userId,
      fromDisplayName: user.displayName,
      fromAvatarId: user.avatarId,
      fromProfilePhoto: user.profilePhoto,
      toSocketId: data.targetSocketId,
      toUserId: targetUser.userId,
      content,
      timestamp: new Date().toISOString(),
    };

    // Store in DM history
    const key = [user.userId, targetUser.userId].sort().join(':');
    if (!dmHistory.has(key)) dmHistory.set(key, []);
    const history = dmHistory.get(key);
    history.push(msg);
    if (history.length > 50) history.shift();

    // Send to both sender and receiver
    socket.emit('dm:message', msg);
    targetSocket.emit('dm:message', msg);
  });

  socket.on('dm:send-image', (data) => {
    const user = socketUser.get(socket.id);
    if (!user) return;
    const targetSocket = io.sockets.sockets.get(data.targetSocketId);
    const targetUser = socketUser.get(data.targetSocketId);
    if (!targetSocket || !targetUser) return;

    const imageUrl = data.imageUrl;
    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('data:image/') || imageUrl.length > 5500000) return;

    const msg = {
      id: uuidv4(),
      fromSocketId: socket.id,
      fromUserId: user.userId,
      fromDisplayName: user.displayName,
      fromAvatarId: user.avatarId,
      fromProfilePhoto: user.profilePhoto,
      toSocketId: data.targetSocketId,
      toUserId: targetUser.userId,
      content: data.content || '',
      imageUrl,
      timestamp: new Date().toISOString(),
      type: 'image',
    };

    const key = [user.userId, targetUser.userId].sort().join(':');
    if (!dmHistory.has(key)) dmHistory.set(key, []);
    const history = dmHistory.get(key);
    history.push(msg);
    if (history.length > 50) history.shift();

    socket.emit('dm:message', msg);
    targetSocket.emit('dm:message', msg);
  });

  socket.on('dm:history', (data) => {
    const user = socketUser.get(socket.id);
    if (!user) return;
    const targetUser = socketUser.get(data.targetSocketId);
    if (!targetUser) return;

    const key = [user.userId, targetUser.userId].sort().join(':');
    const history = dmHistory.get(key) || [];
    socket.emit('dm:history', { targetSocketId: data.targetSocketId, messages: history });
  });

  socket.on('dm:typing', (data) => {
    const user = socketUser.get(socket.id);
    if (!user) return;
    const targetSocket = io.sockets.sockets.get(data.targetSocketId);
    if (targetSocket) {
      targetSocket.emit('dm:typing', { fromSocketId: socket.id, displayName: user.displayName });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    const roomId = socketRoom.get(socket.id);
    if (roomId) {
      removeFromCall(socket, roomId);
      leaveRoom(socket, roomId);
      io.emit('room-list', getRoomList());
    }
    // Clean up private calls
    for (const [callId, call] of privateCalls) {
      if (call.callerSocketId === socket.id || call.calleeSocketId === socket.id) {
        clearTimeout(call.timeout);
        const otherSocketId = call.callerSocketId === socket.id ? call.calleeSocketId : call.callerSocketId;
        const otherSocket = io.sockets.sockets.get(otherSocketId);
        if (otherSocket) otherSocket.emit('private-call:ended', { callId });
        privateCalls.delete(callId);
      }
    }
    socketUser.delete(socket.id);
    socketLastSeen.delete(socket.id);
    broadcastGlobalUsers();
    console.log(`Disconnected: ${socket.id}`);
  });
});

function leaveRoom(socket, roomId) {
  const room = rooms.get(roomId);
  const user = socketUser.get(socket.id);
  if (!room || !user) return;

  room.users.delete(socket.id);
  socket.leave(roomId);
  socketRoom.delete(socket.id);
  const u = socketUser.get(socket.id);
  if (u) { u.currentRoom = null; }

  // System message
  const sysMsg = {
    id: uuidv4(),
    userId: 'system',
    displayName: 'System',
    avatarId: '',
    content: `${user.displayName} ออกจากห้อง`,
    timestamp: new Date().toISOString(),
    type: 'system',
  };
  room.messages.push(sysMsg);
  if (room.messages.length > MAX_MESSAGES) room.messages.shift();
  io.to(roomId).emit('new-message', sysMsg);
  io.to(roomId).emit('online-users', Array.from(room.users.values()));
  broadcastGlobalUsers();
}

// ===== WORD GUESS MINI GAME =====
const WORD_LIST = [
  { word: 'แอบชอบ', hint: 'ชอบแต่ไม่กล้าบอก 💕', category: 'ความรัก' },
  { word: 'ติ่ง', hint: 'แฟนคลับตัวยง ⭐', category: 'วัยรุ่น' },
  { word: 'จิกหมอน', hint: 'ดูซีรีส์แล้วทำแบบนี้ 😆', category: 'อารมณ์' },
  { word: 'กรีน', hint: 'อิจฉาจนเปลี่ยนสี 🟢', category: 'อารมณ์' },
  { word: 'ป๊อก', hint: 'โชคดีได้เงินเยอะ 🃏', category: 'เกม' },
  { word: 'จุกจิก', hint: 'ละเอียดยิบเรื่องเล็กๆ น้อยๆ 😤', category: 'นิสัย' },
  { word: 'ซุ้มซาม', hint: 'ทำอะไรไม่ค่อยเรียบร้อย 🫣', category: 'นิสัย' },
  { word: 'สปอยล์', hint: 'บอกเนื้อเรื่องก่อนดู 🤐', category: 'วัยรุ่น' },
  { word: 'คลั่งรัก', hint: 'รักจนลืมทุกอย่าง 😍', category: 'ความรัก' },
  { word: 'เมาท์', hint: 'ชอบนินทาคนอื่น 🗣️', category: 'นิสัย' },
  { word: 'แซ่บ', hint: 'อร่อยมากหรือเผ็ดมาก 🌶️', category: 'อาหาร' },
  { word: 'อ้วก', hint: 'ทนไม่ไหวแล้ว 🤮', category: 'อารมณ์' },
  { word: 'ชิมิ', hint: 'ใช่มั้ย ถูกมั้ย~ 🥺', category: 'คำฮิต' },
  { word: 'เท', hint: 'ถูกทิ้ง ถูกปฏิเสธ 💔', category: 'ความรัก' },
  { word: 'อิ้ง', hint: 'ขนลุก ตื่นเต้น 😱', category: 'อารมณ์' },
  { word: 'แบ๊ว', hint: 'น่ารัก ทำตัวเหมือนเด็ก 🧸', category: 'นิสัย' },
  { word: 'ลั้ลลา', hint: 'สนุกสนาน มีความสุข 🎉', category: 'อารมณ์' },
  { word: 'ตบ', hint: 'ทะเลาะกันแรงๆ 👋', category: 'แอคชั่น' },
  { word: 'เกรียน', hint: 'ตลกแบบเด็กๆ ชอบแกล้งคน 🤡', category: 'นิสัย' },
  { word: 'มุ้งมิ้ง', hint: 'หวานจนฟันผุ คู่รักทำกัน 💑', category: 'ความรัก' },
  { word: 'ฟิน', hint: 'อิ่มเอมใจ สมใจอยาก 😌', category: 'อารมณ์' },
  { word: 'ดราม่า', hint: 'เรื่องวุ่นวายในโซเชียล 📱', category: 'คำฮิต' },
  { word: 'ชิปหาย', hint: 'เรือจมแล้ว คู่จิ้นแยกกัน 🚢', category: 'คำฮิต' },
  { word: 'ปั่น', hint: 'หลอก โกหก ทำให้งง 🌀', category: 'แอคชั่น' },
  { word: 'ตุ๋ย', hint: 'เกาะติด ไม่ยอมปล่อย 🐨', category: 'นิสัย' },
  { word: 'งอน', hint: 'โกรธนิดๆ อยากให้ง้อ 😤💢', category: 'อารมณ์' },
  { word: 'เม้น', hint: 'คอมเมนต์ พิมพ์ตอบโต้ 💬', category: 'คำฮิต' },
  { word: 'ฟาด', hint: 'กินอย่างเอร็ดอร่อย หรือตบหน้า 🍗', category: 'แอคชั่น' },
  { word: 'ถอย', hint: 'อย่าเข้ามาใกล้ ไม่โอเค 🙅', category: 'แอคชั่น' },
  { word: 'จีบ', hint: 'พยายามเข้าหาคนที่ชอบ 💐', category: 'ความรัก' },
];

// roomGames: Map<roomId, { word, hint, category, revealed[], guesses[], startedBy, startedAt, maxGuesses, gameOver }>
const roomGames = new Map();

function startNewGame(roomId, startedBy) {
  const wordObj = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
  const revealed = Array(wordObj.word.length).fill(false);
  // Reveal first character
  revealed[0] = true;

  const game = {
    word: wordObj.word,
    hint: wordObj.hint,
    category: wordObj.category,
    revealed,
    guesses: [],
    startedBy,
    startedAt: new Date().toISOString(),
    maxGuesses: 5,
    gameOver: false,
    winner: null,
  };
  roomGames.set(roomId, game);
  return game;
}

function getGameState(game) {
  return {
    display: game.word.split('').map((ch, i) => game.revealed[i] ? ch : '_'),
    hint: game.hint,
    category: game.category,
    guesses: game.guesses,
    maxGuesses: game.maxGuesses,
    remainingGuesses: game.maxGuesses - game.guesses.length,
    gameOver: game.gameOver,
    winner: game.winner,
    word: game.gameOver ? game.word : undefined,
    wordLength: game.word.length,
    startedBy: game.startedBy,
  };
}

function handleWordGuessEvents(socket) {
  // Start a new game
  socket.on('game-start', () => {
    const user = socketUser.get(socket.id);
    const roomId = socketRoom.get(socket.id);
    if (!user || !roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    const game = startNewGame(roomId, user.displayName);
    const state = getGameState(game);
    io.to(roomId).emit('game-state', state);

    // System message
    const sysMsg = {
      id: uuidv4(),
      userId: 'system',
      displayName: 'System',
      avatarId: '',
      content: `🎮 ${user.displayName} เริ่มเกมทายคำ! หมวด: ${game.category} | พิมพ์ /guess คำตอบ เพื่อทาย`,
      timestamp: new Date().toISOString(),
      type: 'system',
    };
    room.messages.push(sysMsg);
    if (room.messages.length > MAX_MESSAGES) room.messages.shift();
    io.to(roomId).emit('new-message', sysMsg);
  });

  // Make a guess
  socket.on('game-guess', (data) => {
    const user = socketUser.get(socket.id);
    const roomId = socketRoom.get(socket.id);
    if (!user || !roomId) return;

    const room = rooms.get(roomId);
    const game = roomGames.get(roomId);
    if (!room || !game || game.gameOver) return;

    const guess = (data.guess || '').trim();
    if (!guess) return;

    const guessEntry = { player: user.displayName, guess, correct: false };

    if (guess === game.word) {
      // Correct!
      guessEntry.correct = true;
      game.revealed = game.revealed.map(() => true);
      game.gameOver = true;
      game.winner = user.displayName;
      game.guesses.push(guessEntry);

      const sysMsg = {
        id: uuidv4(),
        userId: 'system',
        displayName: 'System',
        avatarId: '',
        content: `🎉 ${user.displayName} ทายถูก! คำตอบคือ "${game.word}" 🏆`,
        timestamp: new Date().toISOString(),
        type: 'system',
      };
      room.messages.push(sysMsg);
      if (room.messages.length > MAX_MESSAGES) room.messages.shift();
      io.to(roomId).emit('new-message', sysMsg);
    } else {
      game.guesses.push(guessEntry);

      // Reveal one more character as hint
      const hiddenIndices = game.revealed.map((r, i) => r ? -1 : i).filter((i) => i >= 0);
      if (hiddenIndices.length > 0) {
        const revealIdx = hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)];
        game.revealed[revealIdx] = true;
      }

      if (game.guesses.length >= game.maxGuesses) {
        game.gameOver = true;
        game.revealed = game.revealed.map(() => true);

        const sysMsg = {
          id: uuidv4(),
          userId: 'system',
          displayName: 'System',
          avatarId: '',
          content: `😢 หมดโอกาสทายแล้ว! คำตอบคือ "${game.word}"`,
          timestamp: new Date().toISOString(),
          type: 'system',
        };
        room.messages.push(sysMsg);
        if (room.messages.length > MAX_MESSAGES) room.messages.shift();
        io.to(roomId).emit('new-message', sysMsg);
      } else {
        const sysMsg = {
          id: uuidv4(),
          userId: 'system',
          displayName: 'System',
          avatarId: '',
          content: `❌ ${user.displayName} ทาย "${guess}" — ผิด! เหลืออีก ${game.maxGuesses - game.guesses.length} ครั้ง`,
          timestamp: new Date().toISOString(),
          type: 'system',
        };
        room.messages.push(sysMsg);
        if (room.messages.length > MAX_MESSAGES) room.messages.shift();
        io.to(roomId).emit('new-message', sysMsg);
      }
    }

    io.to(roomId).emit('game-state', getGameState(game));
  });

  // Request current game state
  socket.on('game-get-state', () => {
    const roomId = socketRoom.get(socket.id);
    if (!roomId) return;
    const game = roomGames.get(roomId);
    if (game) {
      socket.emit('game-state', getGameState(game));
    } else {
      socket.emit('game-state', null);
    }
  });
}

// ===== POK DENG CARD GAME =====
const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUIT_COLORS = { '♠': 'black', '♥': 'red', '♦': 'red', '♣': 'black' };

function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, color: SUIT_COLORS[suit] });
    }
  }
  // Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function cardValue(card) {
  if (['J', 'Q', 'K'].includes(card.rank)) return 0;
  if (card.rank === 'A') return 1;
  return parseInt(card.rank);
}

function handScore(cards) {
  const sum = cards.reduce((s, c) => s + cardValue(c), 0);
  return sum % 10;
}

function getHandType(cards) {
  const score = handScore(cards);
  if (cards.length === 2) {
    // Pok 8 or 9
    if (score === 9) return { name: 'ป็อก 9', multiplier: 3 };
    if (score === 8) return { name: 'ป็อก 8', multiplier: 2 };
    // Same suit (tong)
    if (cards[0].suit === cards[1].suit) return { name: 'สองเด้ง', multiplier: 2 };
    // Pair
    if (cards[0].rank === cards[1].rank) return { name: 'ผี', multiplier: 2 };
  }
  if (cards.length === 3) {
    // Three of a kind
    if (cards[0].rank === cards[1].rank && cards[1].rank === cards[2].rank) {
      return { name: 'ตอง', multiplier: 5 };
    }
    // Straight
    const vals = cards.map(c => RANKS.indexOf(c.rank)).sort((a, b) => a - b);
    if (vals[2] - vals[1] === 1 && vals[1] - vals[0] === 1) {
      return { name: 'เรียง', multiplier: 3 };
    }
    // Same suit
    if (cards[0].suit === cards[1].suit && cards[1].suit === cards[2].suit) {
      return { name: 'สามเด้ง', multiplier: 3 };
    }
  }
  return { name: `แต้ม ${score}`, multiplier: 1 };
}

// roomPokDeng: Map<roomId, game>
const roomPokDeng = new Map();

function handlePokDengEvents(socket) {
  // Create a new Pok Deng game (waiting for players)
  socket.on('pokdeng-create', () => {
    const user = socketUser.get(socket.id);
    const roomId = socketRoom.get(socket.id);
    if (!user || !roomId) return;
    const room = rooms.get(roomId);
    if (!room) return;

    const existing = roomPokDeng.get(roomId);
    if (existing && existing.phase !== 'finished') return; // game in progress

    const game = {
      phase: 'waiting', // waiting -> playing -> reveal -> finished
      dealer: { socketId: socket.id, ...user, cards: [], stood: false, drawnThird: false },
      players: [],
      deck: [],
      maxPlayers: 5,
      createdAt: new Date().toISOString(),
    };
    roomPokDeng.set(roomId, game);

    const sysMsg = {
      id: uuidv4(), userId: 'system', displayName: 'System', avatarId: '',
      content: `🃏 ${user.displayName} เปิดโต๊ะป็อกเด้ง! กดปุ่ม 🃏 เพื่อเข้าร่วม`,
      timestamp: new Date().toISOString(), type: 'system',
    };
    room.messages.push(sysMsg);
    if (room.messages.length > MAX_MESSAGES) room.messages.shift();
    io.to(roomId).emit('new-message', sysMsg);
    io.to(roomId).emit('pokdeng-state', getPokDengPublicState(roomId, null));
  });

  // Join an existing game
  socket.on('pokdeng-join', () => {
    const user = socketUser.get(socket.id);
    const roomId = socketRoom.get(socket.id);
    if (!user || !roomId) return;
    const game = roomPokDeng.get(roomId);
    if (!game || game.phase !== 'waiting') return;
    if (game.dealer.socketId === socket.id) return;
    if (game.players.find(p => p.socketId === socket.id)) return;
    if (game.players.length >= game.maxPlayers) return;

    game.players.push({ socketId: socket.id, ...user, cards: [], stood: false, drawnThird: false });

    const room = rooms.get(roomId);
    const sysMsg = {
      id: uuidv4(), userId: 'system', displayName: 'System', avatarId: '',
      content: `🃏 ${user.displayName} เข้าร่วมโต๊ะป็อกเด้ง (${game.players.length + 1} คน)`,
      timestamp: new Date().toISOString(), type: 'system',
    };
    room.messages.push(sysMsg);
    if (room.messages.length > MAX_MESSAGES) room.messages.shift();
    io.to(roomId).emit('new-message', sysMsg);
    broadcastPokDengState(roomId);
  });

  // Dealer starts dealing
  socket.on('pokdeng-deal', () => {
    const user = socketUser.get(socket.id);
    const roomId = socketRoom.get(socket.id);
    if (!user || !roomId) return;
    const game = roomPokDeng.get(roomId);
    if (!game || game.phase !== 'waiting') return;
    if (game.dealer.socketId !== socket.id) return;
    if (game.players.length === 0) return;

    game.phase = 'playing';
    game.deck = createDeck();

    // Deal 2 cards to each
    const allPlayers = [game.dealer, ...game.players];
    for (let i = 0; i < 2; i++) {
      for (const p of allPlayers) {
        p.cards.push(game.deck.pop());
      }
    }

    // Check for Pok (8 or 9) — auto stand
    for (const p of allPlayers) {
      const score = handScore(p.cards);
      if (score >= 8) p.stood = true;
    }

    const room = rooms.get(roomId);
    const sysMsg = {
      id: uuidv4(), userId: 'system', displayName: 'System', avatarId: '',
      content: `🃏 แจกไพ่แล้ว! ผู้เล่นเลือก "จั่ว" หรือ "หงาย"`,
      timestamp: new Date().toISOString(), type: 'system',
    };
    room.messages.push(sysMsg);
    if (room.messages.length > MAX_MESSAGES) room.messages.shift();
    io.to(roomId).emit('new-message', sysMsg);
    broadcastPokDengState(roomId);
  });

  // Player draws a third card
  socket.on('pokdeng-draw', () => {
    const roomId = socketRoom.get(socket.id);
    if (!roomId) return;
    const game = roomPokDeng.get(roomId);
    if (!game || game.phase !== 'playing') return;

    const player = findPokDengPlayer(game, socket.id);
    if (!player || player.stood || player.drawnThird) return;

    player.cards.push(game.deck.pop());
    player.drawnThird = true;
    player.stood = true;

    checkAllStood(roomId, game);
    broadcastPokDengState(roomId);
  });

  // Player stands (no draw)
  socket.on('pokdeng-stand', () => {
    const roomId = socketRoom.get(socket.id);
    if (!roomId) return;
    const game = roomPokDeng.get(roomId);
    if (!game || game.phase !== 'playing') return;

    const player = findPokDengPlayer(game, socket.id);
    if (!player || player.stood) return;

    player.stood = true;

    checkAllStood(roomId, game);
    broadcastPokDengState(roomId);
  });

  // Get current state
  socket.on('pokdeng-get-state', () => {
    const roomId = socketRoom.get(socket.id);
    if (!roomId) return;
    socket.emit('pokdeng-state', getPokDengPublicState(roomId, socket.id));
  });
}

function findPokDengPlayer(game, socketId) {
  if (game.dealer.socketId === socketId) return game.dealer;
  return game.players.find(p => p.socketId === socketId);
}

function checkAllStood(roomId, game) {
  const allPlayers = [game.dealer, ...game.players];
  if (allPlayers.every(p => p.stood)) {
    // Reveal phase
    game.phase = 'finished';
    const dealerScore = handScore(game.dealer.cards);
    const dealerType = getHandType(game.dealer.cards);

    game.results = game.players.map(p => {
      const pScore = handScore(p.cards);
      const pType = getHandType(p.cards);
      let result;
      if (pScore > dealerScore) result = 'win';
      else if (pScore < dealerScore) result = 'lose';
      else result = 'draw';
      return { displayName: p.displayName, cards: p.cards, score: pScore, type: pType, result };
    });
    game.dealerResult = { displayName: game.dealer.displayName, cards: game.dealer.cards, score: dealerScore, type: dealerType };

    // System message with results
    const room = rooms.get(roomId);
    let resultText = `🃏 ผลป็อกเด้ง!\nเจ้ามือ ${game.dealer.displayName}: ${dealerType.name} (${dealerScore} แต้ม)\n`;
    game.results.forEach(r => {
      const icon = r.result === 'win' ? '🏆' : r.result === 'lose' ? '💀' : '🤝';
      resultText += `${icon} ${r.displayName}: ${r.type.name} (${r.score} แต้ม) — ${r.result === 'win' ? 'ชนะ' : r.result === 'lose' ? 'แพ้' : 'เสมอ'}\n`;
    });

    const sysMsg = {
      id: uuidv4(), userId: 'system', displayName: 'System', avatarId: '',
      content: resultText.trim(),
      timestamp: new Date().toISOString(), type: 'system',
    };
    room.messages.push(sysMsg);
    if (room.messages.length > MAX_MESSAGES) room.messages.shift();
    io.to(roomId).emit('new-message', sysMsg);
  }
}

function getPokDengPublicState(roomId, viewerSocketId) {
  const game = roomPokDeng.get(roomId);
  if (!game) return null;

  const isFinished = game.phase === 'finished';
  const isDealer = viewerSocketId === game.dealer?.socketId;

  function maskCards(player, canSee) {
    if (isFinished || canSee) return player.cards;
    return player.cards.map(() => ({ suit: '?', rank: '?', color: 'black' }));
  }

  return {
    phase: game.phase,
    dealer: {
      displayName: game.dealer.displayName,
      avatarId: game.dealer.avatarId,
      cards: maskCards(game.dealer, isDealer),
      stood: game.dealer.stood,
      score: (isFinished || isDealer) ? handScore(game.dealer.cards) : null,
      type: isFinished ? getHandType(game.dealer.cards) : null,
      isMe: isDealer,
    },
    players: game.players.map(p => {
      const isMe = viewerSocketId === p.socketId;
      return {
        displayName: p.displayName,
        avatarId: p.avatarId,
        cards: maskCards(p, isMe),
        stood: p.stood,
        score: (isFinished || isMe) ? handScore(p.cards) : null,
        type: isFinished ? getHandType(p.cards) : null,
        result: isFinished ? (game.results?.find(r => r.displayName === p.displayName)?.result) : null,
        isMe,
      };
    }),
    playerCount: game.players.length + 1,
    maxPlayers: game.maxPlayers,
    results: isFinished ? game.results : null,
    dealerResult: isFinished ? game.dealerResult : null,
  };
}

function broadcastPokDengState(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;
  // Send personalized state to each socket
  for (const [sid] of room.users) {
    const s = io.sockets.sockets.get(sid);
    if (s) s.emit('pokdeng-state', getPokDengPublicState(roomId, sid));
  }
}

// ===== VOICE/VIDEO CALL =====
const roomCalls = new Map(); // roomId -> { callId, startedBy, startedAt, participants: Map<socketId, { userId, displayName, avatarId, isMuted, isCameraOff }> }
const MAX_CALL_PARTICIPANTS = 8;

const privateCalls = new Map(); // callId -> { callId, callerSocketId, calleeSocketId, callerUser, calleeUser, status, timeout }

function getCallState(roomId) {
  const call = roomCalls.get(roomId);
  if (!call) return null;
  return {
    callId: call.callId,
    startedBy: call.startedBy,
    participants: Array.from(call.participants.entries()).map(([sid, p]) => ({
      socketId: sid,
      displayName: p.displayName,
      avatarId: p.avatarId,
      isMuted: p.isMuted,
      isCameraOff: p.isCameraOff,
    })),
  };
}

function removeFromCall(socket, roomId) {
  const call = roomCalls.get(roomId);
  if (!call || !call.participants.has(socket.id)) return;

  const user = call.participants.get(socket.id);
  call.participants.delete(socket.id);

  io.to(roomId).emit('call:user-left', { socketId: socket.id, displayName: user.displayName });

  const room = rooms.get(roomId);
  if (room) {
    const sysMsg = {
      id: uuidv4(), userId: 'system', displayName: 'System', avatarId: '',
      content: `📞 ${user.displayName} ออกจาก Call`,
      timestamp: new Date().toISOString(), type: 'system',
    };
    room.messages.push(sysMsg);
    if (room.messages.length > MAX_MESSAGES) room.messages.shift();
    io.to(roomId).emit('new-message', sysMsg);
  }

  if (call.participants.size === 0) {
    roomCalls.delete(roomId);
    io.to(roomId).emit('call:ended');
    if (room) {
      const sysMsg = {
        id: uuidv4(), userId: 'system', displayName: 'System', avatarId: '',
        content: '📞 Call สิ้นสุดแล้ว',
        timestamp: new Date().toISOString(), type: 'system',
      };
      room.messages.push(sysMsg);
      if (room.messages.length > MAX_MESSAGES) room.messages.shift();
      io.to(roomId).emit('new-message', sysMsg);
    }
  } else {
    io.to(roomId).emit('call:state', getCallState(roomId));
  }
}

function handleCallEvents(socket) {
  socket.on('call:start', () => {
    const user = socketUser.get(socket.id);
    const roomId = socketRoom.get(socket.id);
    if (!user || !roomId) return;
    const room = rooms.get(roomId);
    if (!room) return;

    // Don't start if call already active
    if (roomCalls.has(roomId)) return;

    const call = {
      callId: uuidv4(),
      startedBy: user.displayName,
      startedAt: new Date().toISOString(),
      participants: new Map(),
    };
    call.participants.set(socket.id, {
      userId: user.userId, displayName: user.displayName, avatarId: user.avatarId,
      isMuted: false, isCameraOff: false,
    });
    roomCalls.set(roomId, call);

    const sysMsg = {
      id: uuidv4(), userId: 'system', displayName: 'System', avatarId: '',
      content: `📞 ${user.displayName} เริ่ม Voice/Video Call — กดปุ่ม 📞 เพื่อเข้าร่วม`,
      timestamp: new Date().toISOString(), type: 'system',
    };
    room.messages.push(sysMsg);
    if (room.messages.length > MAX_MESSAGES) room.messages.shift();
    io.to(roomId).emit('new-message', sysMsg);
    io.to(roomId).emit('call:state', getCallState(roomId));
  });

  socket.on('call:join', () => {
    const user = socketUser.get(socket.id);
    const roomId = socketRoom.get(socket.id);
    if (!user || !roomId) return;
    const call = roomCalls.get(roomId);
    if (!call) return;
    if (call.participants.has(socket.id)) return;
    if (call.participants.size >= MAX_CALL_PARTICIPANTS) {
      socket.emit('call:error', { message: 'Call เต็มแล้ว (8/8)' });
      return;
    }

    // Notify existing participants to send offers to the new joiner
    const existingParticipants = Array.from(call.participants.keys());
    call.participants.set(socket.id, {
      userId: user.userId, displayName: user.displayName, avatarId: user.avatarId,
      isMuted: false, isCameraOff: false,
    });

    // Tell the new joiner who is already in the call
    socket.emit('call:existing-participants', existingParticipants);

    // Tell existing participants to create offers to new joiner
    io.to(roomId).emit('call:user-joined', {
      socketId: socket.id, displayName: user.displayName, avatarId: user.avatarId,
    });

    const room = rooms.get(roomId);
    if (room) {
      const sysMsg = {
        id: uuidv4(), userId: 'system', displayName: 'System', avatarId: '',
        content: `📞 ${user.displayName} เข้าร่วม Call (${call.participants.size} คน)`,
        timestamp: new Date().toISOString(), type: 'system',
      };
      room.messages.push(sysMsg);
      if (room.messages.length > MAX_MESSAGES) room.messages.shift();
      io.to(roomId).emit('new-message', sysMsg);
    }

    io.to(roomId).emit('call:state', getCallState(roomId));
  });

  socket.on('call:leave', () => {
    const roomId = socketRoom.get(socket.id);
    if (!roomId) return;
    removeFromCall(socket, roomId);
  });

  // Signaling relay — just forward to target socket
  socket.on('call:offer', (data) => {
    if (!data.to || !data.sdp) return;
    io.to(data.to).emit('call:offer', { from: socket.id, sdp: data.sdp });
  });

  socket.on('call:answer', (data) => {
    if (!data.to || !data.sdp) return;
    io.to(data.to).emit('call:answer', { from: socket.id, sdp: data.sdp });
  });

  socket.on('call:ice-candidate', (data) => {
    if (!data.to || !data.candidate) return;
    io.to(data.to).emit('call:ice-candidate', { from: socket.id, candidate: data.candidate });
  });

  socket.on('call:toggle-media', (data) => {
    const roomId = socketRoom.get(socket.id);
    if (!roomId) return;
    const call = roomCalls.get(roomId);
    if (!call) return;
    const participant = call.participants.get(socket.id);
    if (!participant) return;
    if (typeof data.isMuted === 'boolean') participant.isMuted = data.isMuted;
    if (typeof data.isCameraOff === 'boolean') participant.isCameraOff = data.isCameraOff;
    io.to(roomId).emit('call:media-update', {
      socketId: socket.id,
      isMuted: participant.isMuted,
      isCameraOff: participant.isCameraOff,
    });
  });

  socket.on('call:get-state', () => {
    const roomId = socketRoom.get(socket.id);
    if (!roomId) return;
    socket.emit('call:state', getCallState(roomId));
  });
}

// ===== GLOBAL USERS =====

function getGlobalOnlineUsers() {
  const users = [];
  for (const [sid, u] of socketUser) {
    if (u.status === 'invisible') continue;
    users.push({
      socketId: sid,
      userId: u.userId,
      displayName: u.displayName,
      avatarId: u.avatarId,
      profilePhoto: u.profilePhoto,
      status: u.status,
      statusMessage: u.statusMessage,
      currentRoom: u.currentRoom,
      currentRoomName: u.currentRoom ? (rooms.get(u.currentRoom)?.name || null) : null,
    });
  }
  return users;
}

let globalUsersBroadcastTimer = null;
function broadcastGlobalUsers() {
  if (globalUsersBroadcastTimer) return;
  globalUsersBroadcastTimer = setTimeout(() => {
    globalUsersBroadcastTimer = null;
    io.emit('global-users', getGlobalOnlineUsers());
  }, 300);
}

// ===== STALE USER & CALL CLEANUP (every 30s) =====
setInterval(() => {
  const now = Date.now();
  let changed = false;

  // Clean up stale users (no activity for 3 minutes)
  for (const [sid, lastSeen] of socketLastSeen) {
    if (now - lastSeen > STALE_USER_TIMEOUT) {
      const sock = io.sockets.sockets.get(sid);
      if (!sock || !sock.connected) {
        // User socket is gone — clean up
        const roomId = socketRoom.get(sid);
        if (roomId) {
          const room = rooms.get(roomId);
          if (room) room.users.delete(sid);
          socketRoom.delete(sid);
        }
        socketUser.delete(sid);
        socketLastSeen.delete(sid);
        changed = true;
        console.log(`Stale user removed: ${sid}`);
      }
    }
  }

  // Clean up stale private calls (active for more than 3 minutes with disconnected participants)
  for (const [callId, call] of privateCalls) {
    const callerSocket = io.sockets.sockets.get(call.callerSocketId);
    const calleeSocket = io.sockets.sockets.get(call.calleeSocketId);
    const callerGone = !callerSocket || !callerSocket.connected;
    const calleeGone = !calleeSocket || !calleeSocket.connected;

    if (callerGone || calleeGone) {
      clearTimeout(call.timeout);
      call.status = 'ended';
      // Notify the remaining party
      if (!callerGone && callerSocket) callerSocket.emit('private-call:ended', { callId });
      if (!calleeGone && calleeSocket) calleeSocket.emit('private-call:ended', { callId });
      privateCalls.delete(callId);
      changed = true;
      console.log(`Stale call removed: ${callId}`);
    }
  }

  if (changed) broadcastGlobalUsers();
}, 30000);

// ===== PRIVATE 1:1 CALL =====
function handlePrivateCallEvents(socket) {
  socket.on('private-call:initiate', (data) => {
    const user = socketUser.get(socket.id);
    if (!user) return;
    const targetSocket = io.sockets.sockets.get(data.targetSocketId);
    const targetUser = socketUser.get(data.targetSocketId);
    if (!targetSocket || !targetUser || targetUser.status === 'invisible') {
      socket.emit('private-call:error', { message: 'ผู้ใช้ไม่ออนไลน์' });
      return;
    }
    // Check if either party is already in a private call
    for (const [, call] of privateCalls) {
      if (call.status !== 'ended' && (call.callerSocketId === socket.id || call.calleeSocketId === socket.id || call.callerSocketId === data.targetSocketId || call.calleeSocketId === data.targetSocketId)) {
        socket.emit('private-call:error', { message: 'มีสายอยู่แล้ว' });
        return;
      }
    }
    const callId = uuidv4();
    const call = {
      callId,
      callerSocketId: socket.id,
      calleeSocketId: data.targetSocketId,
      callerUser: { displayName: user.displayName, avatarId: user.avatarId, profilePhoto: user.profilePhoto },
      calleeUser: { displayName: targetUser.displayName, avatarId: targetUser.avatarId, profilePhoto: targetUser.profilePhoto },
      status: 'ringing',
      timeout: setTimeout(() => {
        if (call.status === 'ringing') {
          call.status = 'ended';
          socket.emit('private-call:timeout', { callId });
          targetSocket.emit('private-call:timeout', { callId });
          privateCalls.delete(callId);
        }
      }, 30000),
    };
    privateCalls.set(callId, call);
    socket.emit('private-call:ringing', { callId, targetUser: call.calleeUser });
    targetSocket.emit('private-call:incoming', { callId, callerSocketId: socket.id, caller: call.callerUser });
  });

  socket.on('private-call:accept', (data) => {
    const call = privateCalls.get(data.callId);
    if (!call || call.status !== 'ringing' || call.calleeSocketId !== socket.id) return;
    clearTimeout(call.timeout);
    call.status = 'active';
    const callerSocket = io.sockets.sockets.get(call.callerSocketId);
    if (callerSocket) {
      callerSocket.emit('private-call:start', { callId: call.callId, peerSocketId: socket.id, peer: call.calleeUser });
    }
    socket.emit('private-call:start', { callId: call.callId, peerSocketId: call.callerSocketId, peer: call.callerUser });
  });

  socket.on('private-call:reject', (data) => {
    const call = privateCalls.get(data.callId);
    if (!call || call.status !== 'ringing') return;
    clearTimeout(call.timeout);
    call.status = 'ended';
    const callerSocket = io.sockets.sockets.get(call.callerSocketId);
    if (callerSocket) callerSocket.emit('private-call:rejected', { callId: call.callId });
    privateCalls.delete(call.callId);
  });

  socket.on('private-call:end', (data) => {
    const call = privateCalls.get(data.callId);
    if (!call) return;
    clearTimeout(call.timeout);
    call.status = 'ended';
    const otherSocketId = call.callerSocketId === socket.id ? call.calleeSocketId : call.callerSocketId;
    const otherSocket = io.sockets.sockets.get(otherSocketId);
    if (otherSocket) otherSocket.emit('private-call:ended', { callId: call.callId });
    privateCalls.delete(call.callId);
  });

  // Signaling relay for private calls
  socket.on('private-call:offer', (data) => {
    if (!data.to || !data.sdp) return;
    io.to(data.to).emit('private-call:offer', { from: socket.id, sdp: data.sdp });
  });

  socket.on('private-call:answer', (data) => {
    if (!data.to || !data.sdp) return;
    io.to(data.to).emit('private-call:answer', { from: socket.id, sdp: data.sdp });
  });

  socket.on('private-call:ice-candidate', (data) => {
    if (!data.to || !data.candidate) return;
    io.to(data.to).emit('private-call:ice-candidate', { from: socket.id, candidate: data.candidate });
  });

  socket.on('private-call:toggle-media', (data) => {
    // Find the call this socket is in
    for (const [, call] of privateCalls) {
      if (call.status !== 'active') continue;
      const otherSocketId = call.callerSocketId === socket.id ? call.calleeSocketId : (call.calleeSocketId === socket.id ? call.callerSocketId : null);
      if (otherSocketId) {
        io.to(otherSocketId).emit('private-call:media-update', {
          socketId: socket.id,
          isMuted: data.isMuted,
          isCameraOff: data.isCameraOff,
        });
        break;
      }
    }
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
