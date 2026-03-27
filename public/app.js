(() => {
  // Roblox-style block character avatars
  const AVATARS = [
    { id: 'noob',     headColor: '#f5cd30', bodyColor: '#0057a6', legColor: '#00872e', label: 'Noob' },
    { id: 'red',      headColor: '#e8e8e8', bodyColor: '#c80000', legColor: '#333',    label: 'Red Hero' },
    { id: 'blue',     headColor: '#e8e8e8', bodyColor: '#3b82f6', legColor: '#1e40af', label: 'Blue' },
    { id: 'green',    headColor: '#e8e8e8', bodyColor: '#00b06f', legColor: '#006644', label: 'Green' },
    { id: 'purple',   headColor: '#e8e8e8', bodyColor: '#8b5cf6', legColor: '#5b21b6', label: 'Purple' },
    { id: 'pink',     headColor: '#e8e8e8', bodyColor: '#ec4899', legColor: '#9d174d', label: 'Pink' },
    { id: 'orange',   headColor: '#e8e8e8', bodyColor: '#f97316', legColor: '#9a3412', label: 'Orange' },
    { id: 'dark',     headColor: '#555',    bodyColor: '#222',    legColor: '#111',    label: 'Shadow' },
    { id: 'gold',     headColor: '#fbbf24', bodyColor: '#f59e0b', legColor: '#92400e', label: 'Gold' },
    { id: 'cyan',     headColor: '#e8e8e8', bodyColor: '#06b6d4', legColor: '#0e7490', label: 'Cyan' },
    { id: 'white',    headColor: '#f0f0f0', bodyColor: '#e0e0e0', legColor: '#bbb',    label: 'Ghost' },
    { id: 'rainbow',  headColor: '#ef4444', bodyColor: '#8b5cf6', legColor: '#3b82f6', label: 'Rainbow' },
  ];

  const ROOM_ICONS = ['🏠','🎮','☕','🚀','🔥','⚡','🌟','💎','🎵','🎨','🏆','💬'];

  // State
  let selectedAvatar = null;
  let userId = null;
  let displayName = '';
  let currentRoomId = null;
  let selectedRoomIcon = '💬';
  let socket = null;

  // DOM refs
  const lobby = document.getElementById('lobby');
  const roomListScreen = document.getElementById('roomList');
  const chatroom = document.getElementById('chatroom');
  const nameInput = document.getElementById('displayName');
  const nameCount = document.getElementById('nameCount');
  const avatarGrid = document.getElementById('avatarGrid');
  const joinBtn = document.getElementById('joinBtn');
  const userBadge = document.getElementById('userBadge');
  const roomGrid = document.getElementById('roomGrid');
  const createRoomBtn = document.getElementById('createRoomBtn');
  const createModal = document.getElementById('createModal');
  const roomNameInput = document.getElementById('roomName');
  const iconGrid = document.getElementById('iconGrid');
  const modalCancel = document.getElementById('modalCancel');
  const modalCreate = document.getElementById('modalCreate');
  const roomNameHeader = document.getElementById('roomNameHeader');
  const leaveBtn = document.getElementById('leaveBtn');
  const messagesArea = document.getElementById('messagesArea');
  const emptyState = document.getElementById('emptyState');
  const msgInput = document.getElementById('msgInput');
  const charRemain = document.getElementById('charRemain');
  const sendBtn = document.getElementById('sendBtn');
  const onlineCount = document.getElementById('onlineCount');
  const usersPanelCount = document.getElementById('usersPanelCount');
  const usersList = document.getElementById('usersList');
  const usersPanel = document.getElementById('usersPanel');
  const toggleUsers = document.getElementById('toggleUsers');
  const reconnecting = document.getElementById('reconnecting');

  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  function relativeTime(ts) {
    const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
    if (diff < 10) return 'เมื่อกี้';
    if (diff < 60) return `${diff} วินาทีที่แล้ว`;
    if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`;
    return new Date(ts).toLocaleString('th-TH');
  }

  function esc(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // Render a mini Roblox character as HTML
  function renderChar(av, size = 'normal') {
    if (!av) av = AVATARS[0];
    const s = size === 'small' ? 0.65 : 1;
    return `<div class="roblox-char" style="transform:scale(${s})">
      <div class="rc-head" style="background:${av.headColor}"></div>
      <div class="rc-body" style="background:${av.bodyColor}"></div>
      <div class="rc-legs"><div class="rc-leg" style="background:${av.legColor}"></div><div class="rc-leg" style="background:${av.legColor}"></div></div>
    </div>`;
  }

  function getAvatar(avatarId) {
    return AVATARS.find((a) => a.id === avatarId) || AVATARS[0];
  }

  // ===== LOBBY =====

  AVATARS.forEach((av) => {
    const btn = document.createElement('button');
    btn.className = 'avatar-option';
    btn.innerHTML = renderChar(av);
    btn.setAttribute('aria-label', av.label);
    btn.setAttribute('title', av.label);
    btn.addEventListener('click', () => {
      document.querySelectorAll('.avatar-option').forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedAvatar = av.id;
      updateJoinBtn();
    });
    avatarGrid.appendChild(btn);
  });

  nameInput.addEventListener('input', () => {
    nameCount.textContent = nameInput.value.length;
    updateJoinBtn();
  });

  function updateJoinBtn() {
    const name = nameInput.value.trim();
    joinBtn.disabled = !(name.length > 0 && name.length <= 20 && selectedAvatar);
  }

  joinBtn.addEventListener('click', () => {
    displayName = nameInput.value.trim();
    if (!displayName || !selectedAvatar) return;
    userId = generateUUID();
    sessionStorage.setItem('pixelchat', JSON.stringify({ userId, displayName, avatarId: selectedAvatar }));
    enterRoomList();
  });

  // Restore session
  const saved = sessionStorage.getItem('pixelchat');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      if (data.userId && data.displayName && data.avatarId) {
        userId = data.userId;
        displayName = data.displayName;
        selectedAvatar = data.avatarId;
        enterRoomList();
      }
    } catch (e) { /* ignore */ }
  }

  // ===== SCREEN TRANSITIONS =====

  function showScreen(screen) {
    lobby.style.display = 'none';
    roomListScreen.style.display = 'none';
    chatroom.style.display = 'none';
    if (screen === lobby) lobby.style.display = 'flex';
    else if (screen === roomListScreen) roomListScreen.style.display = 'block';
    else if (screen === chatroom) chatroom.style.display = 'flex';
  }

  function enterRoomList() {
    showScreen(roomListScreen);
    const av = getAvatar(selectedAvatar);
    userBadge.innerHTML = `${renderChar(av, 'small')} ${esc(displayName)}`;
    connectSocket();
  }

  function enterChatRoom(roomId, roomName) {
    currentRoomId = roomId;
    roomNameHeader.textContent = roomName;
    messagesArea.innerHTML = '';
    emptyState.style.display = 'flex';
    messagesArea.appendChild(emptyState);
    showScreen(chatroom);
    socket.emit('join-room', { roomId });
    msgInput.focus();
  }

  function leaveChatRoom() {
    if (socket) socket.emit('leave-room');
    currentRoomId = null;
    showScreen(roomListScreen);
  }

  // ===== SOCKET =====

  function connectSocket() {
    if (socket) return;
    socket = io({
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      reconnecting.style.display = 'none';
      socket.emit('set-profile', { userId, displayName, avatarId: selectedAvatar });
      // Re-join room after reconnect
      if (currentRoomId) {
        socket.emit('join-room', { roomId: currentRoomId });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (currentRoomId) reconnecting.style.display = 'flex';
    });

    socket.on('room-list', (rooms) => {
      renderRoomList(rooms);
    });

    socket.on('room-created', (data) => {
      createModal.style.display = 'none';
    });

    socket.on('left-room', () => {
      // already handled
    });

    socket.on('message-history', (msgs) => {
      messagesArea.innerHTML = '';
      emptyState.style.display = msgs.length === 0 ? 'flex' : 'none';
      messagesArea.appendChild(emptyState);
      msgs.forEach((m) => appendMessage(m));
      scrollToBottom();
    });

    socket.on('new-message', (msg) => {
      appendMessage(msg);
      scrollToBottom();
    });

    socket.on('online-users', (users) => {
      renderOnlineUsers(users);
    });
  }

  // ===== ROOM LIST =====

  function renderRoomList(rooms) {
    roomGrid.innerHTML = '';
    rooms.forEach((room) => {
      const card = document.createElement('div');
      card.className = 'room-card';
      card.innerHTML = `
        <div class="room-card-users">👤 ${room.userCount}</div>
        <div class="room-card-icon">${room.icon}</div>
        <div class="room-card-name">${esc(room.name)}</div>
        <div class="room-card-info">สร้างโดย ${esc(room.createdBy)}</div>
        <button class="room-card-join">เข้าร่วม</button>
      `;
      card.querySelector('.room-card-join').addEventListener('click', (e) => {
        e.stopPropagation();
        enterChatRoom(room.id, room.name);
      });
      card.addEventListener('click', () => {
        enterChatRoom(room.id, room.name);
      });
      roomGrid.appendChild(card);
    });
  }

  // ===== CREATE ROOM MODAL =====

  // Render icon grid
  ROOM_ICONS.forEach((icon) => {
    const btn = document.createElement('button');
    btn.className = 'icon-option';
    btn.textContent = icon;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.icon-option').forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedRoomIcon = icon;
    });
    iconGrid.appendChild(btn);
  });
  // Select first icon by default
  iconGrid.querySelector('.icon-option')?.classList.add('selected');

  createRoomBtn.addEventListener('click', () => {
    roomNameInput.value = '';
    createModal.style.display = 'flex';
    roomNameInput.focus();
  });

  modalCancel.addEventListener('click', () => {
    createModal.style.display = 'none';
  });

  createModal.addEventListener('click', (e) => {
    if (e.target === createModal) createModal.style.display = 'none';
  });

  modalCreate.addEventListener('click', () => {
    const name = roomNameInput.value.trim();
    if (!name || !socket) return;
    socket.emit('create-room', { name, icon: selectedRoomIcon });
  });

  roomNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') modalCreate.click();
  });

  // ===== LEAVE ROOM =====

  leaveBtn.addEventListener('click', leaveChatRoom);

  // ===== MESSAGES =====

  function appendMessage(msg) {
    emptyState.style.display = 'none';

    if (msg.type === 'system') {
      const div = document.createElement('div');
      div.className = 'system-msg';
      div.textContent = msg.content;
      messagesArea.appendChild(div);
      return;
    }

    const isOwn = msg.userId === userId;
    const av = getAvatar(msg.avatarId);
    const div = document.createElement('div');
    div.className = `msg ${isOwn ? 'own' : 'other'}`;
    div.innerHTML = `
      <div class="msg-avatar">${renderChar(av, 'small')}</div>
      <div class="msg-body">
        <div class="msg-meta">
          <span>${esc(msg.displayName)}</span>
          <span>${relativeTime(msg.timestamp)}</span>
        </div>
        <div class="msg-bubble">${esc(msg.content)}</div>
      </div>
    `;
    messagesArea.appendChild(div);
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      messagesArea.scrollTop = messagesArea.scrollHeight;
    });
  }

  // ===== INPUT =====

  msgInput.addEventListener('input', () => {
    const remaining = 500 - msgInput.value.length;
    charRemain.textContent = remaining;
    charRemain.parentElement.classList.toggle('warn', remaining < 50);
    sendBtn.disabled = msgInput.value.trim().length === 0;
  });

  msgInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  sendBtn.addEventListener('click', sendMessage);

  function sendMessage() {
    const content = msgInput.value.trim();
    if (!content || !socket) return;
    socket.emit('send-message', { content });
    msgInput.value = '';
    charRemain.textContent = '500';
    sendBtn.disabled = true;
    msgInput.focus();
  }

  // ===== ONLINE USERS =====

  function renderOnlineUsers(users) {
    onlineCount.textContent = `${users.length} ออนไลน์`;
    usersPanelCount.textContent = users.length;
    usersList.innerHTML = '';
    users.forEach((u) => {
      const av = getAvatar(u.avatarId);
      const li = document.createElement('li');
      li.innerHTML = `<span class="user-avatar-sm">${renderChar(av, 'small')}</span> ${esc(u.displayName)}`;
      usersList.appendChild(li);
    });
  }

  toggleUsers.addEventListener('click', () => {
    usersPanel.classList.toggle('hidden');
    usersPanel.classList.toggle('show');
  });
  if (window.innerWidth <= 640) {
    usersPanel.classList.add('hidden');
  }
})();
