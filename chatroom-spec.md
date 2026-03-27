# 💬 ChatRoom — Product Specification

> ห้องแชทสาธารณะ ไม่ต้องสมัครสมาชิก ทุกคนเห็นกันหมด

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
- เบา เร็ว ใช้ง่าย

### ❌ Non-Goals
- ไม่มีระบบ Login / สมัครสมาชิก
- ไม่มี Private Message (ในเวอร์ชันแรก)
- ไม่มีการเก็บประวัติย้อนหลังระยะยาว
- ไม่มีระบบ Admin หรือ Moderation ซับซ้อน

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
            └── เห็นรายชื่อผู้ใช้ที่ Online อยู่
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

#### 4.2.4 System Messages
- แจ้งเมื่อมีคนเข้าหรือออกจากห้อง เช่น `"Alex เข้าร่วมห้อง"`
- ข้อความระบบแสดงตรงกลางด้วย style แตกต่างจากข้อความปกติ

---

## 5. Technical Requirements

### 5.1 Frontend
- Framework: React หรือ Vanilla JS + HTML/CSS
- Responsive Design: รองรับ Mobile และ Desktop
- Realtime: WebSocket (Socket.io) หรือ Firebase Realtime DB / Supabase

### 5.2 Backend
- Node.js + Express + Socket.io **หรือ** Firebase/Supabase (no-backend approach)
- เก็บข้อความล่าสุดได้ไม่เกิน 100 ข้อความ (sliding window)
- ไม่มี User authentication

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

---

## 10. Out of Scope (Future Versions)

- [ ] หลายห้องแชท (Multiple Rooms)
- [ ] Private / Direct Message
- [ ] Reactions (👍 ❤️ 😂)
- [ ] Message Reply / Thread
- [ ] ระบบ Moderator / Ban user
- [ ] Push Notifications
- [ ] ประวัติแชทย้อนหลังแบบถาวร

---

## 11. Success Metrics

| Metric | Target |
|---|---|
| Time to first message | < 30 วินาทีหลังเปิดเว็บ |
| Message delivery latency | < 500ms |
| Uptime | 99% |
| Mobile usability score | > 90 (Lighthouse) |

---

*Spec version 1.0 — วันที่ 26 มีนาคม 2569*
