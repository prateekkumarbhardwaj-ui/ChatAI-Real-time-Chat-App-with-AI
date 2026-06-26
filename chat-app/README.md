# ChatAI — Real-time Chat App with AI 🚀

Full-stack real-time chat application built with MERN Stack + Socket.io + grok AI.

## Features
- ✅ JWT Authentication (Register/Login)
- ✅ Real-time DM messaging (Socket.io)
- ✅ Group Rooms / Channels
- ✅ Online/Offline status
- ✅ Typing indicators
- ✅ AI Assistant (grok)
- ✅ Smart reply suggestions (AI)
- ✅ Image uploads (Cloudinary)
- ✅ Redux state management
- ✅ Dark mode UI (Tailwind CSS)

## Tech Stack
| Layer | Tech |
|-------|------|
| Frontend | React + Vite + Tailwind CSS |
| State | Redux Toolkit |
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| Real-time | Socket.io |
| AI | llama-3.3-70b-versatile |
| File Upload | Cloudinary |

---

## Setup Guide

### Step 1 — Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 2 — Environment Variables

Create `backend/.env` file:
```
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=any_random_secret_string_here
GROK_API_KEY=your_GROK_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
CLIENT_URL=http://localhost:5173
```

**Where to get these:**
- MongoDB URI → https://cloud.mongodb.com → Create cluster → Connect → Copy URI
- grok API Key → https://aistudio.google.com/app/apikey (FREE)
- Cloudinary → https://cloudinary.com → Dashboard (FREE)

### Step 3 — Run the App

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Open: http://localhost:5173

---

## Project Structure

```
chat-app/
├── backend/
│   ├── config/
│   │   ├── db.js           # MongoDB connection
│   │   └── cloudinary.js   # Cloudinary config
│   ├── controllers/
│   │   ├── authController.js   # Register, Login, Profile
│   │   ├── chatController.js   # Messages, Rooms
│   │   └── aiController.js     # grok AI
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT verify
│   ├── models/
│   │   ├── User.js         # User schema
│   │   ├── Message.js      # Message schema
│   │   └── Room.js         # Group room schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── chatRoutes.js
│   │   └── aiRoutes.js
│   ├── socket/
│   │   └── socketHandler.js    # Real-time events
│   └── server.js
│
└── frontend/
    └── src/
        ├── components/chat/
        │   ├── Sidebar.jsx         # Left sidebar
        │   ├── ChatWindow.jsx      # Main chat area
        │   ├── MessageBubble.jsx   # Message component
        │   ├── AIChat.jsx          # AI conversation
        │   └── CreateRoomModal.jsx # Create group
        ├── hooks/
        │   └── useSocket.js        # Socket.io hook
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   └── Chat.jsx
        └── redux/
            ├── store.js
            └── slices/
                ├── authSlice.js
                └── chatSlice.js
```

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| GET | /api/auth/users?search= | Search users |
| GET | /api/chat/messages/:userId | Get DM messages |
| GET | /api/chat/room/:id/messages | Get group messages |
| POST | /api/chat/room | Create group |
| GET | /api/chat/rooms | Get my groups |
| POST | /api/ai/chat | Chat with AI |
| POST | /api/ai/suggest | Get reply suggestions |
| POST | /api/ai/summarize | Summarize chat |

## Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| user:online | Client→Server | Mark user online |
| message:send | Client→Server | Send DM |
| room:message:send | Client→Server | Send group message |
| message:receive | Server→Client | Receive DM |
| room:message:receive | Server→Client | Receive group message |
| typing:start | Both | Typing indicator on |
| typing:stop | Both | Typing indicator off |
| users:online | Server→Client | Online users list |
