import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDMMessages, fetchRoomMessages, addMessage } from "../../redux/slices/chatSlice";
import { getSocket } from "../../hooks/useSocket";
import MessageBubble from "./MessageBubble";
import AIChat from "./AIChat";
import { FiSend, FiImage, FiCpu, FiUsers, FiX } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";

export default function ChatWindow() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { activeChat, messages, typingUsers } = useSelector((s) => s.chat);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!activeChat) return;
    if (activeChat.type === "dm") {
      dispatch(fetchDMMessages({ userId: activeChat.data._id, token: user.token }));
    } else if (activeChat.type === "room") {
      dispatch(fetchRoomMessages({ roomId: activeChat.data._id, token: user.token }));
      const socket = getSocket();
      socket?.emit("room:join", activeChat.data._id);
    }
    setSuggestions([]);
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last.sender?._id !== user._id && last.sender !== user._id && last.content) {
        fetchSuggestions(last.content);
      }
    }
  }, [messages]);

  const fetchSuggestions = async (lastMsg) => {
    try {
      const res = await axios.post("/api/ai/suggest", { lastMessage: lastMsg }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSuggestions(res.data.suggestions || []);
    } catch { setSuggestions([]); }
  };

  const handleTyping = () => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit("typing:start", {
      senderId: user._id,
      receiverId: activeChat.type === "dm" ? activeChat.data._id : null,
      roomId: activeChat.type === "room" ? activeChat.data._id : null,
    });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("typing:stop", {
        senderId: user._id,
        receiverId: activeChat.type === "dm" ? activeChat.data._id : null,
        roomId: activeChat.type === "room" ? activeChat.data._id : null,
      });
    }, 1500);
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData
    );
    return res.data.secure_url;
  };

  const sendMessage = async () => {
    if (!text.trim() && !imageFile) return;
    if (sending) return;

    const socket = getSocket();
    setSending(true);

    try {
      let imageUrl = "";
      if (imageFile) {
        imageUrl = await uploadToCloudinary(imageFile);
      }

      const payload = {
        senderId: user._id,
        content: text.trim(),
        image: imageUrl,
      };

      if (activeChat.type === "dm") {
        socket?.emit("message:send", { ...payload, receiverId: activeChat.data._id });
      } else {
        socket?.emit("room:message:send", { ...payload, roomId: activeChat.data._id });
      }

      setText("");
      setImageFile(null);
      setImagePreview(null);
      setSuggestions([]);
    } catch (err) {
      toast.error("Image upload failed. Try again.");
    } finally {
      setSending(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size 5MB se zyada nahi honi chahiye");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-dark-950">
        <div className="text-6xl mb-4">💬</div>
        <h2 className="text-xl font-semibold text-white mb-2">Welcome to ChatAI</h2>
        <p className="text-slate-400 text-sm">Select a conversation or search for users to start chatting</p>
      </div>
    );
  }

  if (activeChat.type === "ai") return <AIChat />;

  const isTyping = typingUsers.length > 0;

  return (
    <div className="flex-1 flex flex-col bg-dark-950 h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-700/50 bg-dark-800">
        {activeChat.type === "room" ? (
          <div className="w-10 h-10 rounded-full bg-primary-700 flex items-center justify-center text-white font-bold">
            {activeChat.data.name[0]}
          </div>
        ) : (
          <img
            src={activeChat.data.avatar || `https://ui-avatars.com/api/?name=${activeChat.data.name}&background=4f46e5&color=fff`}
            className="w-10 h-10 rounded-full object-cover"
          />
        )}
        <div>
          <p className="font-semibold text-white">{activeChat.data.name}</p>
          <p className="text-xs text-slate-400">
            {activeChat.type === "room"
              ? `${activeChat.data.members?.length || 0} members`
              : "Direct Message"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.map((msg, i) => (
          <MessageBubble key={msg._id || i} message={msg} />
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-end gap-2 mb-3">
            <div className="bg-dark-800 border border-slate-700/50 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
              <span className="typing-dot w-2 h-2 bg-slate-400 rounded-full" />
              <span className="typing-dot w-2 h-2 bg-slate-400 rounded-full" />
              <span className="typing-dot w-2 h-2 bg-slate-400 rounded-full" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div className="px-6 py-2 flex gap-2 flex-wrap border-t border-slate-700/30">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => { setText(s); setSuggestions([]); }}
              className="text-xs bg-primary-600/20 text-primary-400 border border-primary-600/30 rounded-full px-3 py-1.5 hover:bg-primary-600/30 transition flex items-center gap-1"
            >
              <FiCpu size={11} /> {s}
            </button>
          ))}
        </div>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <div className="px-4 pb-2 border-t border-slate-700/30 pt-2">
          <div className="relative inline-block">
            <img src={imagePreview} alt="preview" className="h-24 rounded-xl border border-slate-600 object-cover" />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center transition"
            >
              <FiX size={11} />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-4 border-t border-slate-700/50 bg-dark-800">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleImageSelect}
        />
        <div className="flex items-center gap-3 bg-dark-900 rounded-2xl px-4 py-2 border border-slate-700">
          <button
            onClick={() => fileInputRef.current.click()}
            className="text-slate-400 hover:text-primary-400 transition flex-shrink-0"
          >
            <FiImage size={18} />
          </button>
          <input
            value={text}
            onChange={(e) => { setText(e.target.value); handleTyping(); }}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder={`Message ${activeChat.data.name}...`}
            className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none py-2"
          />
          <button
            onClick={sendMessage}
            disabled={!text.trim() && !imageFile}
            className="bg-primary-600 hover:bg-primary-700 disabled:opacity-30 text-white p-2.5 rounded-xl transition"
          >
            {sending ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin block" />
            ) : (
              <FiSend size={16} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}