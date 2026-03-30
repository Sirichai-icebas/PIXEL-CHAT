# 💬 ChatRoom — Product Specification (Updated)

> ห้องแชทสาธารณะและส่วนตัว รองรับการแบ่งห้อง (Multi-room), Private Chat, และ Mini-games

---

## 1. Overview

**Product Name:** ChatRoom (Pixel-Chat)  
**Type:** Real-time Social Chat Web Application  
**Target Users:** ผู้ใช้ทั่วไปที่ต้องการพูดคุยแบบ Anonymous หรือใช้ชื่อเล่น  
**Core Concept:** ห้องแชทสาธารณะที่รองรับการแบ่งห้อง (Rooms), การคุยส่วนตัว (DM), และการทำกิจกรรมร่วมกันผ่านเกมและการ Call

---

## 2. Goals & Non-Goals

### ✅ Goals
- ให้ผู้ใช้เข้าใช้งานได้ทันทีโดยไม่ต้องสมัครสมาชิก (Anonymous Session)
- **Multi-room Support** — สามารถเลือกห้องหรือสร้างห้องแชทเองได้ (General, Gaming, Chill, etc.)
- **Advanced Messaging** — รองรับการส่งรูปภาพ (Base64), การ Reply, และ @Mention
- **Private Messaging (DM)** — คุยส่วนตัวแบบ 1:1 พร้อมประวัติแชทล่าสุด
- **Mini-games** — กิจกรรมเล่นเกมทายคำ (Word Guess) และไพ่ป็อกเด้ง (Pok Deng) ภายในห้อง
- **Group & Private Call** — รองรับ Voice/Video Call ทั้งในห้องแชทและแบบส่วนตัว
- **User Status** — แสดงสถานะ Online, Away, Busy และข้อความสถานะ

### ❌ Non-Goals
- ระบบ Login แบบถาวร (เน้น Temporary Session)
- การเก็บประวัติย้อนหลังระยะยาว (Sliding window 50-100 ข้อความ)
- ระบบ Admin/Moderation ที่ซับซ้อน (เวอร์ชันแรก)

---

## 3. User Flow

```
เปิดเว็บ
    │
    ▼
[หน้า Lobby / Setup]
    ├── กรอกชื่อที่แสดง (Display Name)
    ├── เลือก Avatar หรือ อัปโหลดโปรไฟล์ (Base64)
    ├── ตั้งค่าสถานะ (Online/Away/Busy)
    └── กด "เริ่มใช้งาน"
            │
            ▼
    [หน้าเลือกห้อง (Room Browser)]
            ├── ดูรายชื่อห้องที่ว่างอยู่ (General, Gaming, Chill)
            ├── ดูจำนวนคนออนไลน์แต่ละห้อง
            ├── สร้างห้องใหม่ (Custom Room)
            └── เลือก "เข้าห้องแชท"
                    │
                    ▼
            [หน้า Chat Room / DM]
                    ├── เห็นข้อความแบบ Real-time (Text, Image, System)
                    ├── ตอบกลับ (Reply) หรือ แท็ก (@Mention)
                    ├── เล่นมินิเกม (Word Guess, Pok Deng)
                    ├── ดูรายชื่อผู้ใช้ที่ Online ทั้งระบบ
                    └── เริ่ม Voice / Video Call (Group / 1:1)
```

---

## 4. Features

### 4.1 หน้า Lobby (Setup Screen)

| Feature | รายละเอียด |
|---|---|
| **ตั้งชื่อ (Display Name)** | Input field กรอกชื่อได้สูงสุด 20 ตัวอักษร |
| **Profile Photo** | อัปโหลดรูปภาพเอง (Base64), เก็บชั่วคราวใน session |
| **User Status** | เลือกสถานะ Online, Away, Busy, Invisible และข้อความสถานะ (50 ตัวอักษร) |

---

### 4.2 หน้า Chat Room & Multi-room

#### 4.2.1 Message Feed & Interaction
- แสดงข้อความ Real-time: ข้อความปกติ, รูปภาพ (Image), และข้อความระบบ (System)
- **Reply:** อ้างอิงข้อความเดิมในการตอบกลับ
- **Mentions:** แท็กชื่อผู้ใช้อื่นในห้อง
- **Image Sharing:** รองรับการอัปโหลดรูปภาพ (สูงสุด 5MB) ส่งในแชท
- **Typing Indicator:** แสดงสถานะเมื่อมีคนกำลังพิมพ์

#### 4.2.2 Room Management
- มีห้อง Default: **General, Gaming, Chill**
- **Create Room:** ผู้ใช้สามารถสร้างห้องเองได้ (ชื่อ + icon) และระบบจะทำลายห้องเมื่อไม่มีคนเหลือ

#### 4.2.3 Mini-games & Activities (In-room)
- **Word Guess:** เกมทายคำจากคำใบ้ (มีการจำกัดจำนวนครั้งทายและเฉลย)
- **Pok Deng:** เกมไพ่ป็อกเด้ง รองรับผู้เล่นสูงสุด 5 คน (มีระบบ Dealer, จั่วไพ่, และสรุปผล)
- **Poker Planning (Scrum):** เครื่องมือประมาณการ Story Points สำหรับทีม (0, 1, 2, 3, 5, 8, 13, 21, ?, ☕) รองรับ Blind Vote, Reveal, สถิติ (Average/Min/Max), และ Reset รอบใหม่

---

### 4.3 Direct Messages (DM) & Private Calls

#### 4.3.1 Private Chat
- คุยส่วนตัว 1:1 โดยคลิกที่ชื่อผู้ใช้
- เก็บประวัติแชทล่าสุด 50 ข้อความ (In-memory)
- รองรับการส่งรูปภาพใน DM

#### 4.3.2 Private 1:1 Call
- ระบบสั่นเตือน (Ringing) เมื่อมีคนโทรเข้า
- รองรับ Voice และ Video Call แบบ P2P (WebRTC)
- Timeout อัตโนมัติ (30 วินาที) หากผู้รับไม่ตอบรับ

---

### 4.4 Group & Private Call — Advanced Features

| Feature | รายละเอียด |
|---|---|
| **Screen Sharing** | แชร์หน้าจอใน Group Call ผ่าน `getDisplayMedia()` (แสดง Cursor) |
| **Camera Switching** | สลับกล้องหน้า/หลังบนมือถือ (facingMode: user/environment) |
| **Participant Pinning** | ปักหมุดผู้เข้าร่วมให้แสดงภาพใหญ่ (Auto-pin เมื่อมี Screen Share) |
| **Media Toggles** | Mute ไมค์ / ปิดกล้อง ระหว่างสนทนา |
| **Room Invitation** | เชิญผู้ใช้เข้าห้องจาก Global Users list |

---

## 5. Technical Requirements

### 5.1 Communication Stack
- **Realtime:** Socket.io (Websocket/Polling)
- **Signaling:** แลกเปลี่ยน SDP และ ICE Candidates ผ่าน Socket Server
- **WebRTC:** Mesh P2P สำหรับทั้ง Group Call และ Private Call

### 5.2 Storage & Memory
- **In-memory (Server):** เก็บข้อมูลห้อง (Rooms), เกม (Games), และ DM History
- **Client Side:** ใช้ `localStorage` เก็บโปรไฟล์ผู้ใช้เบื้องต้น
- **Cleanup:** มีระบบ Stale User Cleanup (ลบผู้ใช้ที่ไม่มีความเคลื่อนไหวเกิน 3 นาที)

---

## 6. Data Model

### Message Object (Advanced)
```json
{
  "id": "uuid-v4",
  "userId": "temp-uuid",
  "displayName": "Alex",
  "content": "สวัสดีทุกคน!",
  "imageUrl": "data:image/...", // Optional
  "replyTo": { "id": "msg-id", "displayName": "Bob", "content": "..." }, // Optional
  "mentions": ["userId-1", "userId-2"], // Optional
  "type": "message" // message, image, system
}
```

### Game State (Pok Deng Example)
```json
{
  "phase": "waiting", // waiting, playing, reveal, finished
  "dealer": { "socketId": "...", "cards": [], "stood": false },
  "players": [ { "socketId": "...", "cards": [], "stood": false } ],
  "deck": [...]
}
```

---

## 7. Socket.io Events (Summary)

| Category | Events |
|---|---|
| **Room** | `join-room`, `leave-room`, `create-room`, `room-list`, `online-users` |
| **Chat** | `send-message`, `new-message`, `send-image`, `typing`, `message-history` |
| **DM** | `dm:send`, `dm:send-image`, `dm:message`, `dm:history`, `dm:typing` |
| **Call** | `call:start`, `call:join`, `call:leave`, `call:offer`, `call:answer`, `call:ice-candidate`, `call:toggle-media`, `call:toggle-screen`, `call:get-state` |
| **Private Call** | `private-call:initiate`, `private-call:accept`, `private-call:reject`, `private-call:end`, `private-call:offer`, `private-call:answer`, `private-call:ice-candidate`, `private-call:toggle-media` |
| **Games** | `game-start`, `game-guess`, `game-get-state`, `pokdeng-create`, `pokdeng-join`, `pokdeng-deal`, `pokdeng-draw`, `pokdeng-stand`, `pokdeng-get-state` |
| **Poker Planning** | `poker:start`, `poker:vote`, `poker:reveal`, `poker:reset`, `poker:get-state` |
| **Social** | `invite-to-room`, `room-invitation` |

---

*Spec version 1.4 (Updated) — วันที่ 30 มีนาคม 2569 (ซิงค์ข้อมูลกับฟีเจอร์ปัจจุบันในระบบ — เพิ่ม Screen Sharing, Camera Switch, Pin Participant, Poker Planning, Room Invitation)*
