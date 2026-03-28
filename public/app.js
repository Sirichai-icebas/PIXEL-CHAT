(() => {
  // Legacy avatar presets (backward compat)
  const LEGACY_AVATARS = {
    noob:    { headColor: '#f5cd30', bodyColor: '#0057a6', legColor: '#00872e' },
    red:     { headColor: '#e8e8e8', bodyColor: '#c80000', legColor: '#333' },
    blue:    { headColor: '#e8e8e8', bodyColor: '#3b82f6', legColor: '#1e40af' },
    green:   { headColor: '#e8e8e8', bodyColor: '#00b06f', legColor: '#006644' },
    purple:  { headColor: '#e8e8e8', bodyColor: '#8b5cf6', legColor: '#5b21b6' },
    pink:    { headColor: '#e8e8e8', bodyColor: '#ec4899', legColor: '#9d174d' },
    orange:  { headColor: '#e8e8e8', bodyColor: '#f97316', legColor: '#9a3412' },
    dark:    { headColor: '#555',    bodyColor: '#222',    legColor: '#111' },
    gold:    { headColor: '#fbbf24', bodyColor: '#f59e0b', legColor: '#92400e' },
    cyan:    { headColor: '#e8e8e8', bodyColor: '#06b6d4', legColor: '#0e7490' },
    white:   { headColor: '#f0f0f0', bodyColor: '#e0e0e0', legColor: '#bbb' },
    rainbow: { headColor: '#ef4444', bodyColor: '#8b5cf6', legColor: '#3b82f6' },
  };

  // Character builder palettes
  const SKIN_COLORS = ['#f5cd30','#fdd09a','#e8a47c','#c68c53','#8d5524','#555','#e8e8e8','#ef4444'];
  const SHIRT_COLORS = ['#c80000','#3b82f6','#00b06f','#8b5cf6','#ec4899','#f97316','#06b6d4','#222','#f59e0b','#e0e0e0'];
  const PANTS_COLORS = ['#333','#1e40af','#006644','#5b21b6','#9d174d','#9a3412','#0e7490','#111','#92400e','#bbb'];
  const ACCESSORIES = [
    { id: null, label: 'ไม่มี' },
    { id: 'hat', label: 'หมวก' },
    { id: 'crown', label: 'มงกุฎ' },
    { id: 'bandana', label: 'ผ้าคาด' },
    { id: 'cape', label: 'ผ้าคลุม' },
    { id: 'bow', label: 'โบว์' },
    { id: 'headphones', label: 'หูฟัง' },
  ];

  // Builder state
  let builderHead = '#f5cd30';
  let builderBody = '#0057a6';
  let builderLegs = '#00872e';
  let builderAcc = null;

  // SVG icon helper
  const ICONS = {
    home: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    gamepad: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="6" width="20" height="12" rx="2"/><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><circle cx="15" cy="11" r="1" fill="currentColor"/><circle cx="18" cy="13" r="1" fill="currentColor"/></svg>',
    coffee: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>',
    rocket: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/></svg>',
    flame: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
    zap: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    star: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    gem: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 18 3 22 9 12 22 2 9"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="12" y1="22" x2="8" y2="9"/><line x1="12" y1="22" x2="16" y2="9"/></svg>',
    music: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    palette: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/></svg>',
    trophy: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
    chat: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    reply: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>',
    user: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    micOff: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .76-.12 1.5-.35 2.18"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>',
    camOff: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34m-7.72-2.06a4 4 0 1 1-5.56-5.56"/></svg>',
  };

  // Room icon identifiers (no emoji)
  const ROOM_ICON_IDS = ['home','gamepad','coffee','rocket','flame','zap','star','gem','music','palette','trophy','chat'];

  function renderIcon(iconId, size) {
    const svg = ICONS[iconId] || ICONS.chat;
    if (size) {
      return svg.replace(/width="\d+"/, `width="${size}"`).replace(/height="\d+"/, `height="${size}"`);
    }
    return svg;
  }

  // Legacy: keep ROOM_ICONS for backward compat with server-stored emoji icons
  const ROOM_ICONS = ROOM_ICON_IDS;

  // State
  let selectedAvatar = null;
  let userId = null;
  let displayName = '';
  let currentRoomId = null;
  let selectedRoomIcon = 'chat';
  let socket = null;
  let replyingTo = null; // { id, displayName, content }
  let onlineUsers = []; // current room's online users
  let mentionIndex = -1; // active index in mention dropdown
  let mentionFilteredUsers = [];

  // Call state
  let localStream = null;
  let peers = new Map();
  let inCall = false;
  let isMuted = false;
  let isCameraOff = false;
  let currentCallState = null;

  // Global users & status
  let globalOnlineUsers = [];
  let myStatus = 'online';
  let myStatusMessage = '';
  let profilePhoto = null;

  // Private call state
  let privateCallId = null;
  let privateCallPeer = null; // RTCPeerConnection
  let privateCallStream = null;
  let pcLocalStream = null;
  let pcIsMuted = false;
  let pcIsCameraOff = false;
  let pcTimerInterval = null;
  let pcStartTime = null;

  // Invitation state
  let pendingInvite = null;

  // DOM refs
  const lobby = document.getElementById('lobby');
  const roomListScreen = document.getElementById('roomList');
  const chatroom = document.getElementById('chatroom');
  const nameInput = document.getElementById('displayName');
  const nameCount = document.getElementById('nameCount');
  const builderPreview = document.getElementById('builderPreview');
  const skinPicker = document.getElementById('skinPicker');
  const shirtPicker = document.getElementById('shirtPicker');
  const pantsPicker = document.getElementById('pantsPicker');
  const accessoryPicker = document.getElementById('accessoryPicker');
  const typingIndicator = document.getElementById('typingIndicator');
  const tabPhoto = document.getElementById('tabPhoto');
  const tabChar = document.getElementById('tabChar');
  const photoSection = document.getElementById('photoSection');
  const charSection = document.getElementById('charSection');
  const photoPreview = document.getElementById('photoPreview');
  const profilePhotoInput = document.getElementById('profilePhotoInput');
  const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
  const statusBtn = document.getElementById('statusBtn');
  const statusMenu = document.getElementById('statusMenu');
  const myStatusDot = document.getElementById('myStatusDot');
  const myStatusText = document.getElementById('myStatusText');
  const statusMsgInput = document.getElementById('statusMsgInput');
  const globalUsersPanel = document.getElementById('globalUsersPanel');
  const globalUsersList = document.getElementById('globalUsersList');
  const globalUserCount = document.getElementById('globalUserCount');
  const inviteToast = document.getElementById('inviteToast');
  const inviteToastAvatar = document.getElementById('inviteToastAvatar');
  const inviteToastFrom = document.getElementById('inviteToastFrom');
  const inviteToastRoom = document.getElementById('inviteToastRoom');
  const inviteAccept = document.getElementById('inviteAccept');
  const inviteDecline = document.getElementById('inviteDecline');
  const privateCallIncoming = document.getElementById('privateCallIncoming');
  const pcIncomingAvatar = document.getElementById('pcIncomingAvatar');
  const pcIncomingName = document.getElementById('pcIncomingName');
  const pcAcceptBtn = document.getElementById('pcAcceptBtn');
  const pcRejectBtn = document.getElementById('pcRejectBtn');
  const privateCallPanel = document.getElementById('privateCallPanel');
  const pcPeerName = document.getElementById('pcPeerName');
  const pcTimer = document.getElementById('pcTimer');
  const pcRemoteVideoEl = document.getElementById('pcRemoteVideoEl');
  const pcRemoteAvatar = document.getElementById('pcRemoteAvatar');
  const pcSelfVideoEl = document.getElementById('pcSelfVideoEl');
  const pcMuteBtn = document.getElementById('pcMuteBtn');
  const pcCameraBtn = document.getElementById('pcCameraBtn');
  const pcEndBtn = document.getElementById('pcEndBtn');
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
  const replyBar = document.getElementById('replyBar');
  const replyBarName = document.getElementById('replyBarName');
  const replyBarText = document.getElementById('replyBarText');
  const replyBarClose = document.getElementById('replyBarClose');
  const imageInput = document.getElementById('imageInput');
  const imageBtn = document.getElementById('imageBtn');
  const mentionDropdown = document.getElementById('mentionDropdown');
  const gamePanel = document.getElementById('gamePanel');
  const gameContent = document.getElementById('gameContent');
  const gameBtn = document.getElementById('gameBtn');
  const gameStartBtn = document.getElementById('gameStartBtn');
  const gamePanelClose = document.getElementById('gamePanelClose');
  const callBtn = document.getElementById('callBtn');
  const callBar = document.getElementById('callBar');
  const callJoinBtn = document.getElementById('callJoinBtn');
  const callBarCount = document.getElementById('callBarCount');
  const callPanel = document.getElementById('callPanel');
  const videoGrid = document.getElementById('videoGrid');
  const callParticipantCount = document.getElementById('callParticipantCount');
  const callMuteBtn = document.getElementById('callMuteBtn');
  const callCameraBtn = document.getElementById('callCameraBtn');
  const callLeaveBtn = document.getElementById('callLeaveBtn');
  const callMinimize = document.getElementById('callMinimize');

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

  const DEFAULT_AVATAR = { headColor: '#f5cd30', bodyColor: '#0057a6', legColor: '#00872e', acc: null };

  function getAvatar(avatarId) {
    if (!avatarId) return DEFAULT_AVATAR;
    if (typeof avatarId === 'object' && avatarId.h) {
      return { headColor: avatarId.h, bodyColor: avatarId.b, legColor: avatarId.l, acc: avatarId.a || null };
    }
    if (typeof avatarId === 'string' && LEGACY_AVATARS[avatarId]) {
      return { ...LEGACY_AVATARS[avatarId], acc: null };
    }
    return DEFAULT_AVATAR;
  }

  function renderAccessory(acc) {
    if (!acc) return '';
    const styles = {
      hat:        '<div class="rc-acc rc-hat"></div>',
      crown:      '<div class="rc-acc rc-crown"></div>',
      bandana:    '<div class="rc-acc rc-bandana"></div>',
      cape:       '<div class="rc-acc rc-cape"></div>',
      bow:        '<div class="rc-acc rc-bow"></div>',
      headphones: '<div class="rc-acc rc-headphones"></div>',
    };
    return styles[acc] || '';
  }

  function renderChar(av, size = 'normal') {
    if (!av) av = DEFAULT_AVATAR;
    const s = size === 'small' ? 0.65 : 1;
    return `<div class="roblox-char" style="transform:scale(${s})">
      ${renderAccessory(av.acc)}
      <div class="rc-head" style="background:${av.headColor}"></div>
      <div class="rc-body" style="background:${av.bodyColor}"></div>
      <div class="rc-legs"><div class="rc-leg" style="background:${av.legColor}"></div><div class="rc-leg" style="background:${av.legColor}"></div></div>
    </div>`;
  }

  // Render avatar (photo or character)
  function renderAvatar(user, size = 'normal') {
    const px = size === 'small' ? 28 : 40;
    if (user && user.profilePhoto) {
      return `<img class="avatar-photo" src="${user.profilePhoto}" alt="" style="width:${px}px;height:${px}px;" />`;
    }
    const av = getAvatar(user?.avatarId);
    return renderChar(av, size);
  }

  // Parse @mentions in text and return HTML
  function parseMentions(text) {
    const escaped = esc(text);
    return escaped.replace(/@(\S+)/g, (match, name) => {
      const isSelf = name === displayName;
      return `<span class="mention" data-mention="${esc(name)}">@${esc(name)}</span>`;
    });
  }

  // Check if current user is mentioned
  function isMentioned(msg) {
    if (!msg.mentions || !Array.isArray(msg.mentions)) return false;
    return msg.mentions.includes(displayName);
  }

  // ===== LOBBY =====

  // Character builder init
  function initCharacterBuilder() {
    function makeColorPicker(container, colors, current, onPick) {
      colors.forEach(c => {
        const dot = document.createElement('button');
        dot.className = 'color-dot' + (c === current ? ' selected' : '');
        dot.style.background = c;
        dot.addEventListener('click', () => {
          container.querySelectorAll('.color-dot').forEach(d => d.classList.remove('selected'));
          dot.classList.add('selected');
          onPick(c);
          updateBuilderPreview();
        });
        container.appendChild(dot);
      });
    }
    makeColorPicker(skinPicker, SKIN_COLORS, builderHead, c => { builderHead = c; });
    makeColorPicker(shirtPicker, SHIRT_COLORS, builderBody, c => { builderBody = c; });
    makeColorPicker(pantsPicker, PANTS_COLORS, builderLegs, c => { builderLegs = c; });

    ACCESSORIES.forEach(acc => {
      const btn = document.createElement('button');
      btn.className = 'acc-btn' + (acc.id === builderAcc ? ' selected' : '');
      btn.textContent = acc.label;
      btn.addEventListener('click', () => {
        accessoryPicker.querySelectorAll('.acc-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        builderAcc = acc.id;
        updateBuilderPreview();
      });
      accessoryPicker.appendChild(btn);
    });

    updateBuilderPreview();
    selectedAvatar = getBuilderAvatar();
  }

  function getBuilderAvatar() {
    return { h: builderHead, b: builderBody, l: builderLegs, a: builderAcc };
  }

  function updateBuilderPreview() {
    selectedAvatar = getBuilderAvatar();
    const av = getAvatar(selectedAvatar);
    builderPreview.innerHTML = renderChar(av);
    updateJoinBtn();
  }

  initCharacterBuilder();

  // Avatar tab switching
  tabPhoto.addEventListener('click', () => {
    tabPhoto.classList.add('active');
    tabChar.classList.remove('active');
    photoSection.style.display = '';
    charSection.style.display = 'none';
  });
  tabChar.addEventListener('click', () => {
    tabChar.classList.add('active');
    tabPhoto.classList.remove('active');
    charSection.style.display = '';
    photoSection.style.display = 'none';
  });

  // Photo upload
  uploadPhotoBtn.addEventListener('click', () => profilePhotoInput.click());
  profilePhotoInput.addEventListener('change', () => {
    const file = profilePhotoInput.files[0];
    if (!file) return;
    profilePhotoInput.value = '';
    if (file.size > 2 * 1024 * 1024) { alert('ไฟล์ใหญ่เกินไป (สูงสุด 2MB)'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      // Resize to 128x128
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 128; canvas.height = 128;
        const ctx = canvas.getContext('2d');
        const s = Math.min(img.width, img.height);
        const sx = (img.width - s) / 2, sy = (img.height - s) / 2;
        ctx.drawImage(img, sx, sy, s, s, 0, 0, 128, 128);
        profilePhoto = canvas.toDataURL('image/jpeg', 0.7);
        photoPreview.innerHTML = `<img src="${profilePhoto}" alt="profile" />`;
        updateJoinBtn();
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  nameInput.addEventListener('input', () => {
    nameCount.textContent = nameInput.value.length;
    updateJoinBtn();
  });

  function updateJoinBtn() {
    const name = nameInput.value.trim();
    joinBtn.disabled = !(name.length > 0 && name.length <= 20);
  }

  joinBtn.addEventListener('click', () => {
    displayName = nameInput.value.trim();
    if (!displayName) return;
    selectedAvatar = getBuilderAvatar();
    userId = generateUUID();
    sessionStorage.setItem('pixelchat', JSON.stringify({ userId, displayName, avatarId: selectedAvatar, profilePhoto }));
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
        profilePhoto = data.profilePhoto || null;
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
    userBadge.innerHTML = `${renderAvatar({ avatarId: selectedAvatar, profilePhoto }, 'small')} ${esc(displayName)}`;
    connectSocket();
  }

  function enterChatRoom(roomId, roomName) {
    currentRoomId = roomId;
    roomNameHeader.textContent = roomName;
    messagesArea.innerHTML = '';
    emptyState.style.display = 'flex';
    messagesArea.appendChild(emptyState);
    clearReply();
    showScreen(chatroom);
    socket.emit('join-room', { roomId });
    socket.emit('call:get-state');
    msgInput.focus();
  }

  function leaveChatRoom() {
    if (inCall) leaveCall();
    if (socket) socket.emit('leave-room');
    currentRoomId = null;
    clearReply();
    callBar.style.display = 'none';
    callPanel.style.display = 'none';
    currentCallState = null;
    typingUsers.clear();
    renderTypingIndicator();
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
      socket.emit('set-profile', { userId, displayName, avatarId: selectedAvatar, profilePhoto });
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
      onlineUsers = users;
      renderOnlineUsers(users);
    });

    socket.on('game-state', (state) => {
      if (state && gamePanel.style.display === 'none') {
        gamePanel.style.display = 'flex';
      }
      renderGameState(state);
    });

    // Typing indicator
    socket.on('user-typing', (data) => {
      if (data.userId === userId) return;
      const existing = typingUsers.get(data.userId);
      if (existing) clearTimeout(existing.timer);
      const timer = setTimeout(() => {
        typingUsers.delete(data.userId);
        renderTypingIndicator();
      }, 2000);
      typingUsers.set(data.userId, { displayName: data.displayName, timer });
      renderTypingIndicator();
    });

    // Call events
    socket.on('call:state', (state) => updateCallUI(state));

    socket.on('call:user-joined', (data) => {
      if (inCall && data.socketId !== socket.id) {
        createOffer(data.socketId);
      }
    });

    socket.on('call:user-left', (data) => {
      const peer = peers.get(data.socketId);
      if (peer) { peer.pc.close(); peers.delete(data.socketId); }
      removeVideoTile(data.socketId);
    });

    socket.on('call:ended', () => {
      if (inCall) cleanupCall();
      currentCallState = null;
      callBar.style.display = 'none';
      callPanel.style.display = 'none';
    });

    socket.on('call:existing-participants', () => {
      // Existing participants will send offers to me via call:user-joined
    });

    socket.on('call:offer', async (data) => {
      if (!inCall) return;
      await handleOffer(data.from, data.sdp);
    });

    socket.on('call:answer', async (data) => {
      if (!inCall) return;
      await handleAnswer(data.from, data.sdp);
    });

    socket.on('call:ice-candidate', (data) => {
      if (!inCall) return;
      handleIceCandidate(data.from, data.candidate);
    });

    socket.on('call:media-update', (data) => {
      const tile = videoGrid.querySelector(`[data-peer-id="${data.socketId}"]`);
      if (tile) {
        tile.classList.toggle('camera-off', data.isCameraOff);
        const info = tile.querySelector('.video-tile-info');
        const muteIcon = tile.querySelector('.muted-icon');
        if (data.isMuted && !muteIcon && info) {
          info.insertAdjacentHTML('beforeend', '<span class="muted-icon">${ICONS.micOff}</span>');
        } else if (!data.isMuted && muteIcon) {
          muteIcon.remove();
        }
      }
    });

    socket.on('call:error', (data) => alert(data.message));

    // Global users
    socket.on('global-users', (users) => {
      globalOnlineUsers = users;
      renderGlobalUsers();
    });

    // Room invitation
    socket.on('room-invitation', (data) => {
      pendingInvite = data;
      inviteToastAvatar.innerHTML = renderAvatar({ avatarId: data.fromAvatarId, profilePhoto: data.fromProfilePhoto }, 'small');
      inviteToastFrom.textContent = data.fromDisplayName;
      inviteToastRoom.textContent = data.roomName;
      inviteToast.style.display = 'flex';
      setTimeout(() => { if (inviteToast.style.display !== 'none') inviteToast.style.display = 'none'; }, 15000);
    });

    // Private call events
    socket.on('private-call:incoming', (data) => {
      privateCallId = data.callId;
      pcIncomingAvatar.innerHTML = renderAvatar({ avatarId: data.caller.avatarId, profilePhoto: data.caller.profilePhoto });
      pcIncomingName.textContent = `${data.caller.displayName} กำลังโทรหาคุณ...`;
      privateCallIncoming.style.display = 'flex';
    });

    socket.on('private-call:ringing', (data) => {
      privateCallId = data.callId;
    });

    socket.on('private-call:start', async (data) => {
      privateCallIncoming.style.display = 'none';
      privateCallId = data.callId;
      pcPeerName.textContent = data.peer.displayName;
      pcRemoteAvatar.innerHTML = renderAvatar({ avatarId: data.peer.avatarId, profilePhoto: data.peer.profilePhoto });
      privateCallPanel.style.display = 'flex';

      // Get media if not already
      if (!pcLocalStream) {
        pcLocalStream = await getMedia();
        if (!pcLocalStream) { endPrivateCall(); return; }
      }
      pcSelfVideoEl.srcObject = pcLocalStream;
      pcIsMuted = false; pcIsCameraOff = !pcLocalStream.getVideoTracks().length;

      // Create peer connection
      const pc = new RTCPeerConnection(rtcConfig);
      privateCallPeer = pc;
      pcLocalStream.getTracks().forEach(t => pc.addTrack(t, pcLocalStream));
      pc.onicecandidate = (e) => {
        if (e.candidate && socket) socket.emit('private-call:ice-candidate', { to: data.peerSocketId, candidate: e.candidate });
      };
      pc.ontrack = (e) => { pcRemoteVideoEl.srcObject = e.streams[0]; privateCallStream = e.streams[0]; };

      // Caller creates offer
      if (socket.id !== data.peerSocketId) {
        // I'm on the side that needs to create the offer — check: the server sends peerSocketId of the OTHER party
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('private-call:offer', { to: data.peerSocketId, sdp: pc.localDescription });
      }

      startPcTimer();
    });

    socket.on('private-call:offer', async (data) => {
      if (!privateCallPeer) return;
      await privateCallPeer.setRemoteDescription(new RTCSessionDescription(data.sdp));
      const answer = await privateCallPeer.createAnswer();
      await privateCallPeer.setLocalDescription(answer);
      socket.emit('private-call:answer', { to: data.from, sdp: privateCallPeer.localDescription });
    });

    socket.on('private-call:answer', async (data) => {
      if (!privateCallPeer) return;
      await privateCallPeer.setRemoteDescription(new RTCSessionDescription(data.sdp));
    });

    socket.on('private-call:ice-candidate', (data) => {
      if (!privateCallPeer) return;
      privateCallPeer.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(console.warn);
    });

    socket.on('private-call:media-update', (data) => {
      const remoteEl = document.getElementById('pcRemoteVideo');
      if (remoteEl) remoteEl.classList.toggle('camera-off', data.isCameraOff);
    });

    socket.on('private-call:rejected', () => {
      alert('สายถูกปฏิเสธ');
      cleanupPrivateCall();
    });

    socket.on('private-call:ended', () => {
      cleanupPrivateCall();
    });

    socket.on('private-call:timeout', () => {
      privateCallIncoming.style.display = 'none';
      cleanupPrivateCall();
    });

    socket.on('private-call:error', (data) => alert(data.message));
  }

  // ===== ROOM LIST =====

  function renderRoomList(rooms) {
    roomGrid.innerHTML = '';
    rooms.forEach((room) => {
      const card = document.createElement('div');
      card.className = 'room-card';
      const iconSvg = ICONS[room.icon] ? renderIcon(room.icon, 32) : renderIcon('chat', 32);
      card.innerHTML = `
        <div class="room-card-users">${ICONS.user} ${room.userCount}</div>
        <div class="room-card-icon">${iconSvg}</div>
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

  ROOM_ICON_IDS.forEach((iconId) => {
    const btn = document.createElement('button');
    btn.className = 'icon-option';
    btn.innerHTML = renderIcon(iconId, 20);
    btn.addEventListener('click', () => {
      document.querySelectorAll('.icon-option').forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedRoomIcon = iconId;
    });
    iconGrid.appendChild(btn);
  });
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

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn.addEventListener('click', () => {
    if (currentRoomId) leaveChatRoom();
    if (socket) { socket.disconnect(); socket = null; }
    sessionStorage.removeItem('pixelchat');
    userId = '';
    displayName = '';
    selectedAvatar = null;
    profilePhoto = null;
    globalOnlineUsers = [];
    myStatus = 'online';
    myStatusMessage = '';
    showScreen(lobby);
  });

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
    const mentioned = isMentioned(msg);
    const div = document.createElement('div');
    div.className = `msg ${isOwn ? 'own' : 'other'}`;
    div.setAttribute('data-msg-id', msg.id);

    let replyHTML = '';
    if (msg.replyTo) {
      const replyContent = msg.replyTo.imageUrl || esc(msg.replyTo.content || '');
      replyHTML = `<div class="msg-reply" data-reply-id="${esc(msg.replyTo.id)}">
        <span class="msg-reply-name">${esc(msg.replyTo.displayName)}</span>
        <span class="msg-reply-text">${replyContent}</span>
      </div>`;
    }

    let contentHTML = '';
    if (msg.type === 'image') {
      contentHTML = msg.content ? `<div class="msg-text-content">${parseMentions(msg.content)}</div>` : '';
      contentHTML += `<img class="msg-image" src="${msg.imageUrl}" alt="รูปภาพ" loading="lazy" />`;
    } else {
      contentHTML = parseMentions(msg.content);
    }

    const bubbleClass = `msg-bubble${mentioned ? ' mentioned' : ''}`;

    div.innerHTML = `
      <div class="msg-avatar">${renderAvatar(msg, 'small')}</div>
      <div class="msg-body">
        <div class="msg-meta">
          <span>${esc(msg.displayName)}</span>
          <span>${relativeTime(msg.timestamp)}</span>
        </div>
        <div class="msg-wrapper">
          ${replyHTML}
          <div class="${bubbleClass}">${contentHTML}</div>
          <div class="msg-actions">
            <button class="btn-reply" data-msg-id="${msg.id}" data-msg-name="${esc(msg.displayName)}" data-msg-content="${esc((msg.content || '').slice(0, 80))}">${ICONS.reply} ตอบ</button>
          </div>
        </div>
      </div>
    `;

    // Reply button click
    const replyBtn = div.querySelector('.btn-reply');
    replyBtn.addEventListener('click', () => {
      setReply(msg.id, msg.displayName, msg.type === 'image' ? '(รูปภาพ)' : (msg.content || '').slice(0, 80));
    });

    // Reply preview click -> scroll to original
    const replyPreview = div.querySelector('.msg-reply');
    if (replyPreview) {
      replyPreview.addEventListener('click', () => {
        const targetId = replyPreview.getAttribute('data-reply-id');
        const targetEl = messagesArea.querySelector(`[data-msg-id="${targetId}"]`);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetEl.style.outline = '2px solid var(--green)';
          setTimeout(() => { targetEl.style.outline = ''; }, 1500);
        }
      });
    }

    // Image click -> fullscreen preview
    const imgEl = div.querySelector('.msg-image');
    if (imgEl) {
      imgEl.addEventListener('click', () => {
        showImagePreview(imgEl.src);
      });
    }

    // Mention click -> insert @mention in input
    div.querySelectorAll('.mention').forEach((el) => {
      el.addEventListener('click', () => {
        const name = el.getAttribute('data-mention');
        msgInput.value += `@${name} `;
        msgInput.focus();
      });
    });

    messagesArea.appendChild(div);
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      messagesArea.scrollTop = messagesArea.scrollHeight;
    });
  }

  // ===== REPLY =====

  function setReply(msgId, name, content) {
    replyingTo = { id: msgId, displayName: name, content };
    replyBarName.textContent = name;
    replyBarText.textContent = content;
    replyBar.style.display = 'flex';
    msgInput.focus();
  }

  function clearReply() {
    replyingTo = null;
    replyBar.style.display = 'none';
  }

  replyBarClose.addEventListener('click', clearReply);

  // ===== IMAGE PREVIEW =====

  function showImagePreview(src) {
    const overlay = document.createElement('div');
    overlay.className = 'image-preview-overlay';
    overlay.innerHTML = `<img src="${src}" alt="preview" />`;
    overlay.addEventListener('click', () => overlay.remove());
    document.body.appendChild(overlay);
  }

  // ===== IMAGE UPLOAD =====

  imageBtn.addEventListener('click', () => imageInput.click());

  imageInput.addEventListener('change', () => {
    const file = imageInput.files[0];
    if (!file) return;
    imageInput.value = '';

    if (file.size > 4 * 1024 * 1024) {
      alert('ไฟล์ใหญ่เกินไป (สูงสุด 4MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = reader.result;
      const data = { imageUrl, content: msgInput.value.trim() };
      if (replyingTo) {
        data.replyTo = replyingTo.id;
      }
      socket.emit('send-image', data);
      msgInput.value = '';
      charRemain.textContent = '500';
      sendBtn.disabled = true;
      clearReply();
    };
    reader.readAsDataURL(file);
  });

  // ===== MENTION AUTOCOMPLETE =====

  function getMentionQuery() {
    const val = msgInput.value;
    const pos = msgInput.selectionStart;
    const before = val.slice(0, pos);
    const match = before.match(/@(\S*)$/);
    if (!match) return null;
    return { query: match[1].toLowerCase(), start: match.index, end: pos };
  }

  function updateMentionDropdown() {
    const mq = getMentionQuery();
    if (!mq || onlineUsers.length === 0) {
      mentionDropdown.style.display = 'none';
      mentionIndex = -1;
      return;
    }

    mentionFilteredUsers = onlineUsers.filter((u) =>
      u.displayName.toLowerCase().includes(mq.query) && u.displayName !== displayName
    );

    // Also allow mentioning self if typed
    const selfMatch = displayName.toLowerCase().includes(mq.query);
    if (selfMatch && !mentionFilteredUsers.find((u) => u.displayName === displayName)) {
      // Don't add self — optional, skip
    }

    if (mentionFilteredUsers.length === 0) {
      mentionDropdown.style.display = 'none';
      mentionIndex = -1;
      return;
    }

    mentionIndex = 0;
    mentionDropdown.innerHTML = '';
    mentionFilteredUsers.forEach((u, i) => {
      const item = document.createElement('div');
      item.className = `mention-dropdown-item${i === 0 ? ' active' : ''}`;
      item.innerHTML = `<span class="user-avatar-sm">${renderAvatar(u, 'small')}</span> ${esc(u.displayName)}`;
      item.addEventListener('click', () => insertMention(u.displayName));
      mentionDropdown.appendChild(item);
    });
    mentionDropdown.style.display = 'block';
  }

  function insertMention(name) {
    const mq = getMentionQuery();
    if (!mq) return;
    const val = msgInput.value;
    const before = val.slice(0, mq.start);
    const after = val.slice(mq.end);
    msgInput.value = `${before}@${name} ${after}`;
    msgInput.focus();
    const newPos = mq.start + name.length + 2;
    msgInput.setSelectionRange(newPos, newPos);
    mentionDropdown.style.display = 'none';
    mentionIndex = -1;
    updateSendBtn();
  }

  function updateSendBtn() {
    const remaining = 500 - msgInput.value.length;
    charRemain.textContent = remaining;
    charRemain.parentElement.classList.toggle('warn', remaining < 50);
    sendBtn.disabled = msgInput.value.trim().length === 0;
  }

  // ===== INPUT =====

  // Typing indicator
  let typingTimeout = null;
  let typingUsers = new Map(); // userId -> { displayName, timer }

  function emitTyping() {
    if (!socket) return;
    if (typingTimeout) clearTimeout(typingTimeout);
    socket.emit('typing');
    typingTimeout = setTimeout(() => { typingTimeout = null; }, 800);
  }

  function renderTypingIndicator() {
    if (typingUsers.size === 0) {
      typingIndicator.style.display = 'none';
      return;
    }
    const names = Array.from(typingUsers.values()).map(u => u.displayName);
    let text;
    if (names.length === 1) text = `${names[0]} กำลังพิมพ์`;
    else if (names.length === 2) text = `${names[0]} และ ${names[1]} กำลังพิมพ์`;
    else text = `${names.length} คนกำลังพิมพ์`;
    typingIndicator.innerHTML = `<span class="typing-dots"><span></span><span></span><span></span></span> ${esc(text)}`;
    typingIndicator.style.display = 'flex';
  }

  msgInput.addEventListener('input', () => {
    updateSendBtn();
    updateMentionDropdown();
    if (msgInput.value.trim()) emitTyping();
  });

  msgInput.addEventListener('keydown', (e) => {
    // Handle mention dropdown navigation
    if (mentionDropdown.style.display !== 'none' && mentionFilteredUsers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        mentionIndex = (mentionIndex + 1) % mentionFilteredUsers.length;
        updateMentionHighlight();
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        mentionIndex = (mentionIndex - 1 + mentionFilteredUsers.length) % mentionFilteredUsers.length;
        updateMentionHighlight();
        return;
      }
      if (e.key === 'Tab' || (e.key === 'Enter' && mentionIndex >= 0)) {
        e.preventDefault();
        if (mentionFilteredUsers[mentionIndex]) {
          insertMention(mentionFilteredUsers[mentionIndex].displayName);
        }
        return;
      }
      if (e.key === 'Escape') {
        mentionDropdown.style.display = 'none';
        mentionIndex = -1;
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  function updateMentionHighlight() {
    const items = mentionDropdown.querySelectorAll('.mention-dropdown-item');
    items.forEach((item, i) => {
      item.classList.toggle('active', i === mentionIndex);
    });
    // scroll active into view
    items[mentionIndex]?.scrollIntoView({ block: 'nearest' });
  }

  sendBtn.addEventListener('click', sendMessage);

  function extractMentions(text) {
    const matches = text.match(/@(\S+)/g);
    if (!matches) return [];
    return [...new Set(matches.map((m) => m.slice(1)))];
  }

  function sendMessage() {
    const content = msgInput.value.trim();
    if (!content || !socket) return;
    mentionDropdown.style.display = 'none';

    const data = { content, mentions: extractMentions(content) };
    if (replyingTo) {
      data.replyTo = replyingTo.id;
    }
    socket.emit('send-message', data);
    msgInput.value = '';
    charRemain.textContent = '500';
    sendBtn.disabled = true;
    clearReply();
    msgInput.focus();
  }

  // ===== ONLINE USERS =====

  function renderOnlineUsers(users) {
    onlineCount.textContent = `${users.length} ออนไลน์`;
    usersPanelCount.textContent = users.length;
    usersList.innerHTML = '';
    users.forEach((u) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="user-avatar-sm">${renderAvatar(u, 'small')}</span> ${esc(u.displayName)}`;
      li.style.cursor = 'pointer';
      li.addEventListener('click', () => {
        msgInput.value += `@${u.displayName} `;
        msgInput.focus();
        updateSendBtn();
      });
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

  // Close mention dropdown on click outside
  document.addEventListener('click', (e) => {
    if (!mentionDropdown.contains(e.target) && e.target !== msgInput) {
      mentionDropdown.style.display = 'none';
      mentionIndex = -1;
    }
  });

  // ===== WORD GUESS GAME =====

  gameBtn.addEventListener('click', () => {
    const isVisible = gamePanel.style.display !== 'none';
    gamePanel.style.display = isVisible ? 'none' : 'flex';
    if (!isVisible && socket) {
      socket.emit('game-get-state');
    }
  });

  gamePanelClose.addEventListener('click', () => {
    gamePanel.style.display = 'none';
  });

  gameStartBtn.addEventListener('click', () => {
    if (socket) socket.emit('game-start');
  });

  function renderGameState(state) {
    if (!state) {
      gameContent.innerHTML = `
        <div class="game-idle">
          <p>ยังไม่มีเกม — กดเริ่มเลย!</p>
          <button class="btn-play btn-sm" id="gameStartBtn2">${ICONS.rocket} เริ่มเกมใหม่</button>
        </div>`;
      gameContent.querySelector('#gameStartBtn2').addEventListener('click', () => {
        if (socket) socket.emit('game-start');
      });
      return;
    }

    let html = '';

    // Category badge
    html += `<div class="game-category">หมวด: ${esc(state.category)}</div>`;

    // Word display
    html += '<div class="game-word-display">';
    state.display.forEach((ch) => {
      if (ch === '_') {
        html += '<div class="game-letter blank">_</div>';
      } else {
        html += `<div class="game-letter revealed">${esc(ch)}</div>`;
      }
    });
    html += '</div>';

    // Hint
    html += `<div class="game-hint"><div class="game-hint-label">คำใบ้</div>${esc(state.hint)}</div>`;

    // Result or guesses remaining
    if (state.gameOver) {
      html += `<div class="game-answer">"${esc(state.word)}"</div>`;
      if (state.winner) {
        html += `<div class="game-result win">${ICONS.trophy} ${esc(state.winner)} ทายถูก!</div>`;
      } else {
        html += `<div class="game-result lose">หมดโอกาสแล้ว</div>`;
      }
      html += `<button class="btn-play btn-sm" id="gameStartBtn2">${ICONS.rocket} เล่นอีกครั้ง</button>`;
    } else {
      html += `<div class="game-guesses-left">เหลืออีก <strong>${state.remainingGuesses}</strong> ครั้ง</div>`;

      // Input
      html += `<div class="game-input-row">
        <input type="text" id="gameGuessInput" placeholder="พิมพ์คำตอบ..." autocomplete="off" maxlength="20" />
        <button id="gameGuessBtn">ทาย</button>
      </div>`;
    }

    // Guess history
    if (state.guesses.length > 0) {
      html += '<div class="game-guess-list">';
      state.guesses.forEach((g) => {
        const cls = g.correct ? 'correct' : 'wrong';
        const icon = g.correct ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2d9a3e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF4458" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
        html += `<div class="game-guess-item ${cls}">
          <span class="game-guess-player">${esc(g.player)}</span>
          <span>${icon} ${esc(g.guess)}</span>
        </div>`;
      });
      html += '</div>';
    }

    gameContent.innerHTML = html;

    // Bind events
    const guessInput = document.getElementById('gameGuessInput');
    const guessBtn = document.getElementById('gameGuessBtn');
    const startBtn2 = document.getElementById('gameStartBtn2');

    if (guessInput && guessBtn) {
      guessBtn.addEventListener('click', () => {
        const guess = guessInput.value.trim();
        if (guess && socket) {
          socket.emit('game-guess', { guess });
          guessInput.value = '';
        }
      });
      guessInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          guessBtn.click();
        }
      });
      guessInput.focus();
    }

    if (startBtn2) {
      startBtn2.addEventListener('click', () => {
        if (socket) socket.emit('game-start');
      });
    }
  }

  // ===== VOICE/VIDEO CALL =====

  const rtcConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

  callBtn.addEventListener('click', () => {
    if (inCall) return; // already in call
    if (currentCallState && currentCallState.participants.length > 0) {
      joinCall();
    } else {
      startCall();
    }
  });

  callJoinBtn.addEventListener('click', () => joinCall());
  callLeaveBtn.addEventListener('click', () => leaveCall());

  callMuteBtn.addEventListener('click', () => {
    if (!localStream) return;
    isMuted = !isMuted;
    localStream.getAudioTracks().forEach(t => { t.enabled = !isMuted; });
    callMuteBtn.innerHTML = isMuted ? ICONS.micOff : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>';
    callMuteBtn.classList.toggle('active', isMuted);
    if (socket) socket.emit('call:toggle-media', { isMuted, isCameraOff });
  });

  callCameraBtn.addEventListener('click', () => {
    if (!localStream) return;
    isCameraOff = !isCameraOff;
    localStream.getVideoTracks().forEach(t => { t.enabled = !isCameraOff; });
    callCameraBtn.innerHTML = isCameraOff ? ICONS.camOff : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>';
    callCameraBtn.classList.toggle('active', isCameraOff);
    const myTile = videoGrid.querySelector('.video-tile.self');
    if (myTile) myTile.classList.toggle('camera-off', isCameraOff);
    if (socket) socket.emit('call:toggle-media', { isMuted, isCameraOff });
  });

  callMinimize.addEventListener('click', () => {
    callPanel.style.display = 'none';
    if (inCall) callBar.style.display = 'flex';
  });

  async function getMedia() {
    try {
      return await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    } catch (e) {
      console.warn('Camera denied, trying audio only:', e);
      try {
        isCameraOff = true;
        return await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      } catch (e2) {
        alert('ไม่สามารถเข้าถึงไมค์หรือกล้องได้');
        return null;
      }
    }
  }

  async function startCall() {
    const stream = await getMedia();
    if (!stream) return;
    localStream = stream;
    inCall = true;
    isMuted = false;
    isCameraOff = !stream.getVideoTracks().length;

    callMuteBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>';
    callMuteBtn.classList.remove('active');
    callCameraBtn.innerHTML = isCameraOff ? ICONS.camOff : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>';
    callCameraBtn.classList.toggle('active', isCameraOff);

    showCallPanel();
    addVideoTile('self', stream, displayName, selectedAvatar, true);
    socket.emit('call:start');
  }

  async function joinCall() {
    const stream = await getMedia();
    if (!stream) return;
    localStream = stream;
    inCall = true;
    isMuted = false;
    isCameraOff = !stream.getVideoTracks().length;

    callMuteBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>';
    callMuteBtn.classList.remove('active');
    callCameraBtn.innerHTML = isCameraOff ? ICONS.camOff : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>';
    callCameraBtn.classList.toggle('active', isCameraOff);

    showCallPanel();
    addVideoTile('self', stream, displayName, selectedAvatar, true);
    socket.emit('call:join');
  }

  function leaveCall() {
    if (socket) socket.emit('call:leave');
    cleanupCall();
  }

  function cleanupCall() {
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
      localStream = null;
    }
    peers.forEach(({ pc }) => pc.close());
    peers.clear();
    videoGrid.innerHTML = '';
    inCall = false;
    isMuted = false;
    isCameraOff = false;
    callPanel.style.display = 'none';
    // Show call bar if call still active
    if (currentCallState && currentCallState.participants.length > 0) {
      callBar.style.display = 'flex';
    } else {
      callBar.style.display = 'none';
    }
  }

  function showCallPanel() {
    callPanel.style.display = 'flex';
    callBar.style.display = 'none';
  }

  function createPeerConnection(remoteSocketId) {
    const pc = new RTCPeerConnection(rtcConfig);

    if (localStream) {
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    }

    pc.onicecandidate = (e) => {
      if (e.candidate && socket) {
        socket.emit('call:ice-candidate', { to: remoteSocketId, candidate: e.candidate });
      }
    };

    pc.ontrack = (e) => {
      const existing = peers.get(remoteSocketId);
      if (existing) existing.stream = e.streams[0];
      // Find participant info from call state
      const pInfo = currentCallState?.participants?.find(p => p.socketId === remoteSocketId);
      const name = pInfo?.displayName || '?';
      const avatar = pInfo?.avatarId || 'noob';
      addVideoTile(remoteSocketId, e.streams[0], name, avatar, false);
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
        console.warn(`ICE ${pc.iceConnectionState} for ${remoteSocketId}`);
      }
    };

    peers.set(remoteSocketId, { pc, stream: null });
    return pc;
  }

  async function createOffer(remoteSocketId) {
    const pc = createPeerConnection(remoteSocketId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('call:offer', { to: remoteSocketId, sdp: pc.localDescription });
  }

  async function handleOffer(fromSocketId, sdp) {
    const pc = createPeerConnection(fromSocketId);
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit('call:answer', { to: fromSocketId, sdp: pc.localDescription });
  }

  async function handleAnswer(fromSocketId, sdp) {
    const peer = peers.get(fromSocketId);
    if (peer) {
      await peer.pc.setRemoteDescription(new RTCSessionDescription(sdp));
    }
  }

  function handleIceCandidate(fromSocketId, candidate) {
    const peer = peers.get(fromSocketId);
    if (peer) {
      peer.pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.warn);
    }
  }

  function addVideoTile(id, stream, name, avatarId, isSelf) {
    // Remove existing tile for this id
    const existing = videoGrid.querySelector(`[data-peer-id="${id}"]`);
    if (existing) existing.remove();

    const av = getAvatar(avatarId);
    const tile = document.createElement('div');
    tile.className = `video-tile${isSelf ? ' self' : ''}${(isSelf && isCameraOff) ? ' camera-off' : ''}`;
    tile.setAttribute('data-peer-id', id);

    const video = document.createElement('video');
    video.autoplay = true;
    video.playsInline = true;
    if (isSelf) video.muted = true;
    video.srcObject = stream;

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'video-avatar';
    avatarDiv.innerHTML = renderChar(av);

    const info = document.createElement('div');
    info.className = 'video-tile-info';
    info.innerHTML = `<span>${esc(name)}${isSelf ? ' (คุณ)' : ''}</span>`;

    tile.appendChild(video);
    tile.appendChild(avatarDiv);
    tile.appendChild(info);
    videoGrid.appendChild(tile);
  }

  function removeVideoTile(id) {
    const tile = videoGrid.querySelector(`[data-peer-id="${id}"]`);
    if (tile) tile.remove();
  }

  function updateCallUI(state) {
    currentCallState = state;
    if (!state || state.participants.length === 0) {
      currentCallState = null;
      callBar.style.display = 'none';
      if (!inCall) callPanel.style.display = 'none';
      return;
    }
    const count = state.participants.length;
    callBarCount.textContent = `${count} คน`;
    callParticipantCount.textContent = count;

    const amInCall = state.participants.some(p => p.socketId === socket.id);
    if (!amInCall && !inCall) {
      callBar.style.display = 'flex';
    } else if (inCall) {
      callBar.style.display = 'none';
    }

    // Update media state for remote tiles
    state.participants.forEach(p => {
      if (p.socketId === socket.id) return;
      const tile = videoGrid.querySelector(`[data-peer-id="${p.socketId}"]`);
      if (tile) {
        tile.classList.toggle('camera-off', p.isCameraOff);
        const muteIcon = tile.querySelector('.muted-icon');
        if (p.isMuted && !muteIcon) {
          const info = tile.querySelector('.video-tile-info');
          if (info) info.innerHTML += '<span class="muted-icon">${ICONS.micOff}</span>';
        } else if (!p.isMuted && muteIcon) {
          muteIcon.remove();
        }
      }
    });
  }

  // ===== GLOBAL ONLINE USERS (MSN-style) =====

  function renderGlobalUsers() {
    if (!globalUsersList) return;
    globalUserCount.textContent = globalOnlineUsers.length;
    globalUsersList.innerHTML = '';

    const groups = { online: [], away: [], busy: [] };
    globalOnlineUsers.forEach(u => {
      if (u.userId === userId) return; // skip self
      const g = groups[u.status] || groups.online;
      g.push(u);
    });

    const labels = { online: 'ออนไลน์', away: 'ไม่อยู่', busy: 'ห้ามรบกวน' };
    for (const [status, users] of Object.entries(groups)) {
      if (users.length === 0) continue;
      const header = document.createElement('div');
      header.className = 'gu-group-header';
      header.innerHTML = `<span class="status-dot status-${status}"></span> ${labels[status]} (${users.length})`;
      globalUsersList.appendChild(header);

      users.forEach(u => {
        const item = document.createElement('div');
        item.className = 'gu-user';
        const roomInfo = u.currentRoomName ? `<span class="gu-room">📍 ${esc(u.currentRoomName)}</span>` : '';
        const statusMsg = u.statusMessage ? `<span class="gu-status-msg">${esc(u.statusMessage)}</span>` : '';
        item.innerHTML = `
          <div class="gu-user-info">
            <span class="gu-avatar">${renderAvatar(u, 'small')}</span>
            <div class="gu-user-text">
              <span class="gu-name">${esc(u.displayName)}</span>
              ${statusMsg}${roomInfo}
            </div>
          </div>
          <div class="gu-actions">
            <button class="gu-btn gu-call-btn" title="โทรหา">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </button>
            ${currentRoomId ? `<button class="gu-btn gu-invite-btn" title="เชิญเข้าห้อง">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg>
            </button>` : ''}
          </div>
        `;
        // Call button
        item.querySelector('.gu-call-btn').addEventListener('click', () => {
          if (privateCallId) { alert('คุณมีสายอยู่แล้ว'); return; }
          initiatePrivateCall(u.socketId);
        });
        // Invite button
        const invBtn = item.querySelector('.gu-invite-btn');
        if (invBtn) {
          invBtn.addEventListener('click', () => {
            if (!currentRoomId || !socket) return;
            socket.emit('invite-to-room', { targetSocketId: u.socketId, roomId: currentRoomId });
            invBtn.textContent = 'ส่งแล้ว';
            invBtn.disabled = true;
          });
        }
        globalUsersList.appendChild(item);
      });
    }
  }

  // ===== STATUS =====

  statusBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    statusMenu.style.display = statusMenu.style.display === 'none' ? 'block' : 'none';
  });

  document.addEventListener('click', (e) => {
    if (!statusMenu.contains(e.target) && e.target !== statusBtn) statusMenu.style.display = 'none';
  });

  document.querySelectorAll('.status-option').forEach(opt => {
    opt.addEventListener('click', () => {
      myStatus = opt.getAttribute('data-status');
      const labels = { online: 'ออนไลน์', away: 'ไม่อยู่', busy: 'ห้ามรบกวน', invisible: 'ซ่อนตัว' };
      myStatusDot.className = `status-dot status-${myStatus}`;
      myStatusText.textContent = labels[myStatus];
      statusMenu.style.display = 'none';
      if (socket) socket.emit('set-status', { status: myStatus, statusMessage: myStatusMessage });
    });
  });

  function saveStatusMessage() {
    myStatusMessage = statusMsgInput.value.trim().slice(0, 50);
    if (socket) socket.emit('set-status', { status: myStatus, statusMessage: myStatusMessage });
    statusMenu.style.display = 'none';
  }
  document.getElementById('statusMsgSave').addEventListener('click', (e) => {
    e.stopPropagation();
    saveStatusMessage();
  });
  statusMsgInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); saveStatusMessage(); }
  });
  statusMsgInput.addEventListener('click', (e) => e.stopPropagation());

  // ===== INVITATION =====

  inviteAccept.addEventListener('click', () => {
    if (pendingInvite) {
      if (currentRoomId) leaveChatRoom();
      enterChatRoom(pendingInvite.roomId, pendingInvite.roomName);
    }
    inviteToast.style.display = 'none';
    pendingInvite = null;
  });

  inviteDecline.addEventListener('click', () => {
    inviteToast.style.display = 'none';
    pendingInvite = null;
  });

  // ===== PRIVATE CALL =====

  function initiatePrivateCall(targetSocketId) {
    if (!socket) return;
    socket.emit('private-call:initiate', { targetSocketId });
  }

  pcAcceptBtn.addEventListener('click', async () => {
    if (!privateCallId || !socket) return;
    privateCallIncoming.style.display = 'none';
    // Get media
    pcLocalStream = await getMedia();
    if (!pcLocalStream) return;
    pcSelfVideoEl.srcObject = pcLocalStream;
    socket.emit('private-call:accept', { callId: privateCallId });
  });

  pcRejectBtn.addEventListener('click', () => {
    if (privateCallId && socket) socket.emit('private-call:reject', { callId: privateCallId });
    privateCallIncoming.style.display = 'none';
    privateCallId = null;
  });

  pcEndBtn.addEventListener('click', () => endPrivateCall());

  pcMuteBtn.addEventListener('click', () => {
    if (!pcLocalStream) return;
    pcIsMuted = !pcIsMuted;
    pcLocalStream.getAudioTracks().forEach(t => { t.enabled = !pcIsMuted; });
    pcMuteBtn.classList.toggle('active', pcIsMuted);
    if (socket) socket.emit('private-call:toggle-media', { isMuted: pcIsMuted, isCameraOff: pcIsCameraOff });
  });

  pcCameraBtn.addEventListener('click', () => {
    if (!pcLocalStream) return;
    pcIsCameraOff = !pcIsCameraOff;
    pcLocalStream.getVideoTracks().forEach(t => { t.enabled = !pcIsCameraOff; });
    pcCameraBtn.classList.toggle('active', pcIsCameraOff);
    document.getElementById('pcSelfVideo').classList.toggle('camera-off', pcIsCameraOff);
    if (socket) socket.emit('private-call:toggle-media', { isMuted: pcIsMuted, isCameraOff: pcIsCameraOff });
  });

  function endPrivateCall() {
    if (privateCallId && socket) socket.emit('private-call:end', { callId: privateCallId });
    cleanupPrivateCall();
  }

  function cleanupPrivateCall() {
    if (pcLocalStream) { pcLocalStream.getTracks().forEach(t => t.stop()); pcLocalStream = null; }
    if (privateCallPeer) { privateCallPeer.close(); privateCallPeer = null; }
    privateCallStream = null;
    privateCallId = null;
    pcIsMuted = false; pcIsCameraOff = false;
    privateCallPanel.style.display = 'none';
    privateCallIncoming.style.display = 'none';
    pcSelfVideoEl.srcObject = null;
    pcRemoteVideoEl.srcObject = null;
    stopPcTimer();
  }

  function startPcTimer() {
    pcStartTime = Date.now();
    pcTimerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - pcStartTime) / 1000);
      const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const s = String(elapsed % 60).padStart(2, '0');
      pcTimer.textContent = `${m}:${s}`;
    }, 1000);
  }

  function stopPcTimer() {
    if (pcTimerInterval) { clearInterval(pcTimerInterval); pcTimerInterval = null; }
    pcTimer.textContent = '00:00';
  }

})();
