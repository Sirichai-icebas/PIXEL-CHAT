# 💬 ChatRoom — Product Specification

> ห้องแชทสาธารณะ ไม่ต้องสมัครสมาชิก ทุกคนเห็นกันหมด รองรับ Group Voice/Video Call

---

## 1. Overview

**Product Name:** ChatRoom (หรือชื่อที่กำหนดเอง)  
**Type:** Real-time Public Chat Web Application  
**Target Users:** ผู้ใช้ทั่วไปที่ต้องการพูดคุยแบบ Anonymous หรือใช้ชื่อเล่น  
**Core Concept:** ห้องแชทสาธารณะที่ทุกคนในระบบเห็นข้อความพร้อมกัน โดยไม่ต้องสมัครสมาชิกหรือล็อกอิน

---

## 2. Goals & Non-Goals

### ✅ Goals
- ให้ผู้ใช้เข้าใช้งานได้ทันทีโดยไม่ต้องสมัครสมาชิก
- รองรับการตั้งชื่อและเลือก Avatar ก่อนเข้าแชท
- แสดงข้อความแบบ Real-time ให้ทุกคนในระบบเห็นพร้อมกัน
- **Group Voice Call** — ทุกคนในห้องสามารถเปิด/เข้าร่วม voice call พร้อมกันได้
- **Group Video Call** — รองรับ video stream พร้อม mute/camera toggle
- เบา เร็ว ใช้ง่าย

### ❌ Non-Goals
- ไม่มีระบบ Login / สมัครสมาชิก
- ไม่มี Private Message (ในเวอร์ชันแรก)
- ไม่มีการเก็บประวัติย้อนหลังระยะยาว
- ไม่มีระบบ Admin หรือ Moderation ซับซ้อน
- ไม่มี Recording call (เวอร์ชันแรก)
- ไม่มี Screen sharing (เวอร์ชันแรก)

---

## 3. User Flow

```
เปิดเว็บ
    │
    ▼
[หน้า Lobby / Setup]
    ├── กรอกชื่อที่แสดง (Display Name)
    ├── เลือก Avatar
    │       ├── Default Avatar (preset รูปภาพหรือ emoji)
    │       └── อัปโหลดรูปของตัวเอง (optional)
    └── กด "เข้าห้องแชท"
            │
            ▼
    [หน้า Chat Room]
            ├── เห็นข้อความของทุกคนแบบ Real-time
            ├── พิมพ์และส่งข้อความ
            ├── เห็นรายชื่อผู้ใช้ที่ Online อยู่
            └── ปุ่ม "เริ่ม Call" (Voice / Video)
                    │
                    ▼
            [Call Session Panel]
                    ├── แสดง video grid ของผู้เข้าร่วม
                    ├── Mute / Unmute microphone
                    ├── Camera On / Off
                    └── Leave Call
```

---

## 4. Features

### 4.1 หน้า Lobby (Setup Screen)

| Feature | รายละเอียด |
|---|---|
| **ตั้งชื่อ (Display Name)** | Input field กรอกชื่อได้สูงสุด 20 ตัวอักษร |
| **Validation** | ห้ามชื่อว่าง, ห้ามอักขระพิเศษบางตัว |
| **Default Avatar** | มี Avatar สำเร็จรูปให้เลือกอย่างน้อย 12 แบบ (เช่น emoji, illustration, animal) |
| **Custom Avatar** | อัปโหลดรูปภาพเอง (JPG/PNG, ขนาดสูงสุด 2MB), auto-crop เป็น circle |
| **ปุ่มเข้าห้องแชท** | กดแล้วเข้าสู่ Chat Room ได้เลย |

---

### 4.2 หน้า Chat Room

#### 4.2.1 Message Feed
- แสดงข้อความทุกคนแบบ Real-time (WebSocket หรือ polling)
- แต่ละข้อความแสดง: Avatar + ชื่อ + เวลา + เนื้อหา
- ข้อความของตัวเองอยู่ฝั่งขวา, ของคนอื่นฝั่งซ้าย
- Auto-scroll ลงล่างเมื่อมีข้อความใหม่
- แสดง timestamp แบบ relative (เช่น "เมื่อกี้", "2 นาทีที่แล้ว")

#### 4.2.2 Input Area
- Text input พิมพ์ข้อความ (สูงสุด 500 ตัวอักษร)
- ส่งด้วย Enter หรือปุ่ม Send
- รองรับ Emoji picker
- แสดงจำนวนตัวอักษรที่เหลือ

#### 4.2.3 Online Users Panel
- แสดงรายชื่อและ Avatar ของผู้ใช้ที่ Online อยู่
- แสดงจำนวนคนออนไลน์
- อัปเดตแบบ Real-time

#### 4.2.4 Group Call Bar (MVP)

แสดงเป็น floating bar หรือ panel ด้านบน/ด้านข้างของ Chat Room

| Feature | รายละเอียด |
|---|---|
| **ปุ่ม Start Call** | ปุ่มในห้องแชท กดเพื่อเริ่ม Voice/Video call |
| **ปุ่ม Join Call** | แสดงเมื่อมี call ที่กำลังดำเนินอยู่ในห้อง |
| **Call Notification** | System message แจ้งทุกคนในห้องเมื่อมีคนเริ่ม call |
| **Video Grid** | แสดง video tile ของผู้เข้าร่วมแต่ละคน (ชื่อ + avatar fallback เมื่อปิดกล้อง) |
| **Mute Toggle** | Mute / Unmute microphone ของตัวเอง |
| **Camera Toggle** | เปิด / ปิดกล้อง (fallback แสดง Avatar แทน) |
| **Leave Call** | ออกจาก call โดยไม่ต้องออกจากห้องแชท |
| **Participant Count** | แสดงจำนวนคนที่อยู่ใน call ปัจจุบัน |

> **MVP Scope:** รองรับ call สูงสุด **8 คน** ต่อห้อง ใช้ WebRTC แบบ Mesh (P2P) หรือ SFU ขึ้นกับ infra

---

#### 4.2.5 System Messages
- แจ้งเมื่อมีคนเข้าหรือออกจากห้อง เช่น `"Alex เข้าร่วมห้อง"`
- แจ้งเมื่อมีการเริ่ม/จบ call เช่น `"Alex เริ่ม Voice Call 📞"` หรือ `"Call สิ้นสุดแล้ว"`
- ข้อความระบบแสดงตรงกลางด้วย style แตกต่างจากข้อความปกติ

---

## 5. Technical Requirements

### 5.1 Frontend
- Framework: React หรือ Vanilla JS + HTML/CSS
- Responsive Design: รองรับ Mobile และ Desktop
- Realtime: WebSocket (Socket.io) หรือ Firebase Realtime DB / Supabase
- **WebRTC API** สำหรับ Voice/Video call (built-in browser API)

### 5.2 Backend
- Node.js + Express + Socket.io **หรือ** Firebase/Supabase (no-backend approach)
- เก็บข้อความล่าสุดได้ไม่เกิน 100 ข้อความ (sliding window)
- ไม่มี User authentication
- **Signaling Server** (ผ่าน Socket.io เดิม) สำหรับแลก SDP offer/answer และ ICE candidates ระหว่าง peers

### 5.5 WebRTC & Call Infrastructure

| Component | รายละเอียด |
|---|---|
| **Signaling** | ใช้ Socket.io server เดิม ส่ง `call:offer`, `call:answer`, `call:ice-candidate` events |
| **STUN Server** | ใช้ Google STUN ฟรี (`stun:stun.l.google.com:19302`) สำหรับ NAT traversal |
| **TURN Server** | Optional สำหรับ MVP — ใช้ Cloudflare TURN หรือ coturn self-hosted หากต้องการ reliability สูง |
| **Topology** | **Mesh P2P** สำหรับ MVP (ง่ายกว่า, เหมาะกับผู้ใช้ไม่เกิน 8 คน) |
| **Media Constraints** | Audio: always on, Video: optional (user toggle) |
| **Codec** | ใช้ default browser codec (VP8/H.264 สำหรับ video, Opus สำหรับ audio) |

### 5.3 Session Management
- ใช้ `localStorage` หรือ `sessionStorage` เก็บ `displayName` และ `avatarId`
- สร้าง `userId` แบบ UUID ชั่วคราว (หมดอายุเมื่อปิด browser หรือ clear storage)

### 5.4 Avatar Storage
- Default avatars: เก็บเป็น static assets บน server
- Custom upload: ใช้ Base64 หรือ object URL ชั่วคราว (ไม่ต้องเก็บถาวร)

---

## 6. Data Model

### Message Object
```json
{
  "id": "uuid-v4",
  "userId": "temp-uuid",
  "displayName": "Alex",
  "avatarUrl": "/avatars/default_3.png",
  "content": "สวัสดีทุกคน!",
  "timestamp": "2026-03-26T10:00:00Z",
  "type": "message" // or "system"
}
```

### User Session (localStorage)
```json
{
  "userId": "temp-uuid",
  "displayName": "Alex",
  "avatarUrl": "/avatars/default_3.png",
  "joinedAt": "2026-03-26T10:00:00Z"
}
```

### Call Session Object (in-memory, server-side)
```json
{
  "callId": "uuid-v4",
  "roomId": "default",
  "type": "video",
  "startedBy": "temp-uuid",
  "startedAt": "2026-03-26T10:05:00Z",
  "participants": [
    {
      "userId": "temp-uuid",
      "displayName": "Alex",
      "avatarUrl": "/avatars/default_3.png",
      "isMuted": false,
      "isCameraOff": false
    }
  ],
  "status": "active"
}
```

### Socket.io Events สำหรับ Call

| Event | Direction | Payload |
|---|---|---|
| `call:start` | client → server → all | `{ callId, type, startedBy }` |
| `call:join` | client → server → all | `{ callId, userId }` |
| `call:leave` | client → server → all | `{ callId, userId }` |
| `call:offer` | client → server → peer | `{ callId, to, sdp }` |
| `call:answer` | client → server → peer | `{ callId, to, sdp }` |
| `call:ice-candidate` | client → server → peer | `{ callId, to, candidate }` |
| `call:toggle-media` | client → server → all | `{ callId, userId, isMuted, isCameraOff }` |
| `call:end` | server → all | `{ callId }` |

---

## 7. UI/UX Guidelines

| หัวข้อ | แนวทาง |
|---|---|
| **Theme** | Modern dark หรือ light theme, เลือกได้ |
| **Font** | อ่านง่าย, รองรับภาษาไทย เช่น Noto Sans Thai, Sarabun |
| **Color** | Primary accent color 1 สี + neutral background |
| **Loading State** | Skeleton loader ขณะโหลดข้อความเก่า |
| **Error State** | Toast notification เมื่อส่งข้อความไม่สำเร็จ |
| **Empty State** | แสดงข้อความชวนเริ่มแชทเมื่อยังไม่มีข้อความ |

---

## 8. Default Avatars

มี Avatar สำเร็จรูปอย่างน้อย **12 แบบ** แบ่งเป็น:

| ประเภท | จำนวน | ตัวอย่าง |
|---|---|---|
| Animal Illustrations | 6 | 🐱 🐶 🐼 🦊 🐸 🐧 |
| Abstract / Geometric | 3 | สีสันต่างกัน |
| Emoji-style | 3 | 😊 🤖 👾 |

> ทุก default avatar มี `id` และ `label` สำหรับ accessibility

---

## 9. Edge Cases & Rules

| กรณี | การจัดการ |
|---|---|
| ชื่อซ้ำกัน | อนุญาต (ไม่มี unique constraint) |
| ข้อความว่าง | ปุ่ม Send disabled |
| ข้อความยาวเกิน 500 ตัว | ไม่อนุญาตพิมพ์เพิ่ม + แสดงเตือน |
| ผู้ใช้ออกจากห้อง | แสดง system message + ลบออกจาก online list |
| Connection หลุด | แสดง reconnecting indicator + retry อัตโนมัติ |
| รูป upload ขนาดเกิน | แจ้ง error + ไม่อัปโหลด |
| **ผู้ใช้ปิด browser ระหว่าง call** | ระบบ auto-remove peer จาก call + แจ้ง system message |
| **ผู้ใช้ปฏิเสธ camera/mic permission** | เข้าร่วมได้เฉพาะ audio-only หรือ listen-only พร้อมแสดง warning |
| **Call ไม่มีคนเหลือ** | จบ call session อัตโนมัติ + แจ้ง system message |
| **ผู้ใช้เกิน 8 คน** | แสดงปุ่ม Join ไม่ได้ + แจ้ง "Call เต็มแล้ว (8/8)" |
| **Browser ไม่รองรับ WebRTC** | แสดง error message พร้อมแนะนำ browser ที่รองรับ |
| **ICE connection ล้มเหลว** | retry 3 ครั้ง, ถ้าไม่สำเร็จแสดง "เชื่อมต่อไม่ได้" + ปุ่ม Rejoin |

---

## 10. Out of Scope (Future Versions)

- [ ] หลายห้องแชท (Multiple Rooms)
- [ ] Private / Direct Message
- [ ] Reactions (👍 ❤️ 😂)
- [ ] Message Reply / Thread
- [ ] ระบบ Moderator / Ban user
- [ ] Push Notifications
- [ ] ประวัติแชทย้อนหลังแบบถาวร
- [ ] Screen Sharing ระหว่าง call
- [ ] Call Recording
- [ ] Raise Hand / React ใน call
- [ ] รองรับผู้เข้าร่วม call มากกว่า 8 คน (SFU architecture)

---

## 11. Success Metrics

| Metric | Target |
|---|---|
| Time to first message | < 30 วินาทีหลังเปิดเว็บ |
| Message delivery latency | < 500ms |
| Uptime | 99% |
| Mobile usability score | > 90 (Lighthouse) |
| Call join latency | < 3 วินาทีหลังกด Join (LAN/good connection) |
| Audio quality | ไม่มี echo หรือ feedback loop (browser echo cancellation) |
| Max concurrent call participants | 8 คน ต่อห้อง |

---

*Spec version 1.1 — วันที่ 28 มีนาคม 2569 (เพิ่ม Group Voice/Video Call MVP)*
