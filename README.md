# PIXEL CHAT

Real-time public chatroom with a pixel-art inspired UI. No sign-up required — just pick a name, choose your character, and start chatting!

## Features

- **Instant Access** — No registration or login needed
- **Pixel Avatars** — 12 Roblox-style block characters to choose from
- **Multiple Rooms** — Join existing rooms or create your own
- **Real-time Messaging** — Powered by WebSocket (Socket.io)
- **Online Users** — See who's in the room in real-time
- **Responsive Design** — Works on desktop and mobile
- **Thai Language UI** — Built with Thai-first interface

## Screenshots

### Lobby — Pick your name and avatar
![Lobby](https://raw.githubusercontent.com/Sirichai-icebas/PIXEL-CHAT/main/screenshots/01-lobby.png)

### Room List — Browse and create chat rooms
![Room List](https://raw.githubusercontent.com/Sirichai-icebas/PIXEL-CHAT/main/screenshots/02-rooms.png)

### Chat Room — Real-time messaging with online users panel
![Chat Room](https://raw.githubusercontent.com/Sirichai-icebas/PIXEL-CHAT/main/screenshots/03-chatroom.png)

## Tech Stack

- **Frontend:** Vanilla JS + HTML/CSS
- **Backend:** Node.js + Express
- **Real-time:** Socket.io (WebSocket)
- **Session:** UUID-based temporary identity (no database)

## Getting Started

```bash
# Install dependencies
npm install

# Start the server
npm start
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

1. Enter a display name and select a pixel avatar
2. Browse available chat rooms or create a new one
3. Join a room and start chatting in real-time
4. All messages are visible to everyone in the room
5. Messages are kept in memory (last 100 per room)
