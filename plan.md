# 🗺️ Pixel-Chat Development Plan & Backlog

## 🚀 Project Vision
**"Anonymous, Interactive, and Frictionless Social Space"**
สร้างพื้นที่ทางสังคมที่เข้าใช้งานง่าย (Frictionless), มีกิจกรรมที่น่าดึงดูด (Interactive), และมีความปลอดภัยสำหรับผู้ใช้ทุกคน (Safe)

---

## 📋 Feature Backlog & Current State

### 🏷️ Status Tags:
- ✅ **DONE:** Feature complete and functional.
- ⚠️ **LITE:** Basic implementation exists (e.g., In-memory only, limited functionality).
- ⏳ **BACKLOG:** Planned for future sprints (High/Medium Priority).
- 🌟 **NEW:** Proposed feature to add future value.

---

### 1. Epic: Infrastructure & Core (ระบบพื้นฐาน)
| Feature | State | Description |
|---|---|---|
| **Anonymous Session** | ✅ **DONE** | No login required, uses temporary display names. |
| **Multi-room System** | ✅ **DONE** | Default rooms (General, Gaming, Chill) + Custom rooms. |
| **User Profile & Status** | ✅ **DONE** | Name, Profile Photo (Base64), and Online/Away/Busy status. |
| **Message Persistence** | ⚠️ **LITE** | Currently stores 100 messages in-memory (lost on restart). |
| **Stale User Cleanup** | ✅ **DONE** | Automatically removes inactive users after 3 minutes. |
| **Database Integration** | ⏳ **BACKLOG** | **(CRITICAL)** Connect MongoDB/Redis for persistent history. |
| **Auto-reconnect Logic** | ⏳ **BACKLOG** | Intelligent socket reconnection without page refresh. |

### 2. Epic: Messaging & Social (การสื่อสาร)
| Feature | State | Description |
|---|---|---|
| **Real-time Text Chat** | ✅ **DONE** | Instant messaging via Socket.io. |
| **Image Sharing** | ✅ **DONE** | Send images (Base64) up to 5MB. |
| **Reply & Mentions** | ✅ **DONE** | Message threading and user tagging (@name). |
| **Direct Messages (DM)** | ✅ **DONE** | 1:1 Private chat with recent history. |
| **Typing Indicator** | ✅ **DONE** | "User is typing..." status for Rooms and DMs. |
| **Voice Messages** | ⏳ **BACKLOG** | **(HIGH PRIORITY)** Push-to-talk voice notes. |
| **Sticker Support** | ⏳ **BACKLOG** | Rich sticker sets and improved Emoji Picker. |

### 3. Epic: Calling & WebRTC (ระบบโทร)
| Feature | State | Description |
|---|---|---|
| **Group Voice/Video Call** | ✅ **DONE** | In-room calls (Mesh P2P) up to 8 participants. |
| **Private 1:1 Call** | ✅ **DONE** | Private calling with Ringing notification. |
| **Media Toggles** | ✅ **DONE** | Mute mic and toggle camera during calls. |
| **Call Quality Monitor** | 🌟 **NEW** | Visual indicator for peer connection strength. |
| **Screen Sharing** | ✅ **DONE** | Desktop screen sharing via `getDisplayMedia()` with cursor, auto-pin on share. |
| **Camera Switching** | ✅ **DONE** | Toggle front/back camera on mobile (facingMode). |
| **Participant Pinning** | ✅ **DONE** | Pin participant to spotlight view, auto-pin on screen share. |

### 4. Epic: Interactive & Games (กิจกรรม)
| Feature | State | Description |
|---|---|---|
| **Word Guess Game** | ✅ **DONE** | Hint-based word guessing with scoring. |
| **Pok Deng Card Game** | ✅ **DONE** | Card game (Dealer vs Players) with result summary. |
| **Poker Planning (Scrum)** | ✅ **DONE** | Story point voting (0-21, ?, ☕), blind vote, reveal with stats, reset. |
| **Game Spectator Mode** | 🌟 **NEW** | Allow non-players to watch and chat during games. |
| **Global Explore Page** | 🌟 **NEW** | Dashboard for trending activities in different rooms. |

### 5. Epic: Security & Moderation (ความปลอดภัย)
| Feature | State | Description |
|---|---|---|
| **System Messages** | ✅ **DONE** | Notifications for join/leave and game activities. |
| **User Mute/Ignore** | ⏳ **BACKLOG** | **(HIGH PRIORITY)** Allow users to hide messages from specific peers. |
| **Report System** | ⏳ **BACKLOG** | Mechanism to report abusive users. |
| **Rate Limiting** | ⏳ **BACKLOG** | Anti-spam protection for messages and game actions. |

---

## 🗺️ Roadmap

### Phase 1: Stability & Trust (Current Focus)
- [ ] **Database Integration:** Move from In-memory to MongoDB/Redis.
- [ ] **User Mute/Ignore:** Implement client-side muting for better moderation.
- [ ] **Rate Limiting:** Protect the server from message spam.

### Phase 2: Engagement & UX Polish
- [ ] **Voice Messages:** Implement recording and sending of voice notes.
- [ ] **Auto-reconnect:** Improve UX when connection is unstable.
- [ ] **Dark Mode:** Add UI theme switching support.

### Phase 3: Social Growth & Hooks
- [ ] **Game Spectator Mode:** Increase engagement for mini-games.
- [ ] **Global Explore Page:** Help users find active communities easily.
- [x] **Screen Sharing:** ~~Enhance calling utility for productivity or shared viewing.~~ ✅ Done

---

## 📊 Priority Matrix (PO's Pick)

1. **Moderation (Mute/Ignore)** - Security & Safety first.
2. **Database Persistence** - Professional infra foundation.
3. **Voice Messages** - Key social engagement feature.
4. **Spectator Mode** - Boosting current game interaction.

---
*Last Updated: 30 March 2026 by PO*
