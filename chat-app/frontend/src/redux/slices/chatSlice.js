import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const getHeaders = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const fetchDMMessages = createAsyncThunk("chat/fetchDM", async ({ userId, token }) => {
  const res = await axios.get(`/api/chat/messages/${userId}`, getHeaders(token));
  return res.data;
});

export const fetchRoomMessages = createAsyncThunk("chat/fetchRoom", async ({ roomId, token }) => {
  const res = await axios.get(`/api/chat/room/${roomId}/messages`, getHeaders(token));
  return res.data;
});

export const fetchRooms = createAsyncThunk("chat/fetchRooms", async (token) => {
  const res = await axios.get("/api/chat/rooms", getHeaders(token));
  return res.data;
});

export const fetchContacts = createAsyncThunk("chat/fetchContacts", async (token) => {
  const res = await axios.get("/api/chat/contacts", getHeaders(token));
  return res.data;
});

export const searchUsers = createAsyncThunk("chat/searchUsers", async ({ query, token }) => {
  const res = await axios.get(`/api/auth/users?search=${query}`, getHeaders(token));
  return res.data;
});

export const createRoom = createAsyncThunk("chat/createRoom", async ({ formData, token }) => {
  const res = await axios.post("/api/chat/room", formData, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
  });
  return res.data;
});

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [],
    rooms: [],
    contacts: [],
    searchResults: [],
    activeChat: null,     // { type: 'dm'|'room', data: user/room object }
    onlineUsers: [],
    typingUsers: [],
    loading: false,
  },
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
      state.messages = [];
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    setTyping: (state, action) => {
      const { senderId, isTyping } = action.payload;
      if (isTyping && !state.typingUsers.includes(senderId)) {
        state.typingUsers.push(senderId);
      } else {
        state.typingUsers = state.typingUsers.filter((id) => id !== senderId);
      }
    },
    clearSearch: (state) => { state.searchResults = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDMMessages.fulfilled, (state, action) => { state.messages = action.payload; })
      .addCase(fetchRoomMessages.fulfilled, (state, action) => { state.messages = action.payload; })
      .addCase(fetchRooms.fulfilled, (state, action) => { state.rooms = action.payload; })
      .addCase(fetchContacts.fulfilled, (state, action) => { state.contacts = action.payload; })
      .addCase(searchUsers.fulfilled, (state, action) => { state.searchResults = action.payload; })
      .addCase(createRoom.fulfilled, (state, action) => { state.rooms.unshift(action.payload); });
  },
});

export const { setActiveChat, addMessage, setOnlineUsers, setTyping, clearSearch } = chatSlice.actions;
export default chatSlice.reducer;
