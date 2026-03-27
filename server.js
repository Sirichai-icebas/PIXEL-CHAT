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
});

app.use(express.static(path.join(__dirname, 'public')));

const MAX_MESSAGES = 100;

// rooms: Map<roomId, { id, name, icon, createdBy, createdAt, messages[], users: Map<socketId, user> }>
const rooms = new Map();

// Create a default room
rooms.set('general', {
  id: 'general',
  name: 'General Chat',
  icon: '🏠',
  createdBy: 'System',
  createdAt: new Date().toISOString(),
  messages: [],
  users: new Map(),
});

rooms.set('gaming', {
  id: 'gaming',
  name: 'Gaming Zone',
  icon: '🎮',
  createdBy: 'System',
  createdAt: new Date().toISOString(),
  messages: [],
  users: new Map(),
});

rooms.set('chill', {
  id: 'chill',
  name: 'Chill Vibes',
  icon: '☕',
  createdBy: 'System',
  createdAt: new Date().toISOString(),
  messages: [],
  users: new Map(),
});

// Track which room each socket is in
const socketRoom = new Map(); // socketId -> roomId
const socketUser = new Map(); // socketId -> user info

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

  // Send room list on connect
  socket.emit('room-list', getRoomList());

  // User sets their profile
  socket.on('set-profile', (data) => {
    socketUser.set(socket.id, {
      userId: data.userId,
      displayName: data.displayName,
      avatarId: data.avatarId,
    });
  });

  // Create a new room
  socket.on('create-room', (data) => {
    const user = socketUser.get(socket.id);
    if (!user) return;

    const name = (data.name || '').trim();
    if (!name || name.length > 30) return;

    const roomId = uuidv4().slice(0, 8);
    const icon = data.icon || '💬';

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
      leaveRoom(socket, roomId);
      io.emit('room-list', getRoomList());
    }
    socket.emit('left-room');
  });

  // Send message
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
    room.messages.push(msg);
    if (room.messages.length > MAX_MESSAGES) room.messages.shift();
    io.to(roomId).emit('new-message', msg);
  });

  // Disconnect
  socket.on('disconnect', () => {
    const roomId = socketRoom.get(socket.id);
    if (roomId) {
      leaveRoom(socket, roomId);
      io.emit('room-list', getRoomList());
    }
    socketUser.delete(socket.id);
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
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
