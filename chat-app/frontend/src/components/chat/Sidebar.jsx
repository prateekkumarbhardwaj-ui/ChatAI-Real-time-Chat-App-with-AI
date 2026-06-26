import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchContacts, fetchRooms, searchUsers, setActiveChat, clearSearch } from "../../redux/slices/chatSlice";
import { logout } from "../../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiLogOut, FiUsers, FiMessageSquare, FiPlus } from "react-icons/fi";
import { MdSmartToy } from "react-icons/md";
import CreateRoomModal from "./CreateRoomModal";

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { contacts, rooms, searchResults, onlineUsers, activeChat } = useSelector((s) => s.chat);

  const [tab, setTab] = useState("dms");
  const [query, setQuery] = useState("");
  const [showCreateRoom, setShowCreateRoom] = useState(false);

  useEffect(() => {
    dispatch(fetchContacts(user.token));
    dispatch(fetchRooms(user.token));
  }, []);

  useEffect(() => {
    if (query.trim().length > 1) {
      dispatch(searchUsers({ query, token: user.token }));
    } else {
      dispatch(clearSearch());
    }
  }, [query]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const isOnline = (id) => onlineUsers.includes(String(id));

  return (
    <div className="w-80 bg-dark-800 border-r border-slate-700/50 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=4f46e5&color=fff`}
              className="w-9 h-9 rounded-full object-cover"
              alt="avatar"
            />
            <div>
              <p className="font-semibold text-white text-sm">{user.name}</p>
              <p className="text-xs text-green-400">● Online</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition p-1.5">
            <FiLogOut size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full bg-dark-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
          />
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="absolute top-36 left-4 w-72 bg-dark-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
          <p className="text-xs text-slate-400 px-4 py-2 border-b border-slate-700">Search Results</p>
          {searchResults.map((u) => (
            <button
              key={u._id}
              onClick={() => {
                dispatch(setActiveChat({ type: "dm", data: u }));
                setQuery("");
                dispatch(clearSearch());
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-dark-900 transition"
            >
              <div className="relative">
                <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}&background=4f46e5&color=fff`} className="w-9 h-9 rounded-full" />
                {isOnline(u._id) && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-dark-800" />}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">{u.name}</p>
                <p className="text-xs text-slate-400">{u.email}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-700/50">
        <button
          onClick={() => setTab("dms")}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition ${tab === "dms" ? "text-primary-400 border-b-2 border-primary-500" : "text-slate-400 hover:text-white"}`}
        >
          <FiMessageSquare size={15} /> DMs
        </button>
        <button
          onClick={() => setTab("rooms")}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition ${tab === "rooms" ? "text-primary-400 border-b-2 border-primary-500" : "text-slate-400 hover:text-white"}`}
        >
          <FiUsers size={15} /> Groups
        </button>
        <button
          onClick={() => setTab("ai")}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition ${tab === "ai" ? "text-primary-400 border-b-2 border-primary-500" : "text-slate-400 hover:text-white"}`}
        >
          <MdSmartToy size={15} /> AI
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === "dms" && (
          <div>
            {contacts.length === 0 ? (
              <p className="text-center text-slate-500 text-sm mt-8">Search users to start chatting</p>
            ) : (
              contacts.map((contact) => (
                <button
                  key={contact._id}
                  onClick={() => dispatch(setActiveChat({ type: "dm", data: contact }))}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-dark-900 transition ${activeChat?.data?._id === contact._id ? "bg-dark-900 border-l-2 border-primary-500" : ""}`}
                >
                  <div className="relative flex-shrink-0">
                    <img src={contact.avatar || `https://ui-avatars.com/api/?name=${contact.name}&background=4f46e5&color=fff`} className="w-10 h-10 rounded-full object-cover" />
                    {isOnline(contact._id) && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-dark-800" />}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{contact.name}</p>
                    <p className="text-xs text-slate-400">{isOnline(contact._id) ? "Online" : "Offline"}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {tab === "rooms" && (
          <div>
            <button
              onClick={() => setShowCreateRoom(true)}
              className="w-full flex items-center gap-3 px-4 py-3 border-b border-slate-700/50 text-primary-400 hover:bg-dark-900 transition"
            >
              <FiPlus size={16} /> Create Group
            </button>
            {rooms.length === 0 ? (
              <p className="text-center text-slate-500 text-sm mt-8">No groups yet — create one!</p>
            ) : (
              rooms.map((room) => (
                <button
                  key={room._id}
                  onClick={() => dispatch(setActiveChat({ type: "room", data: room }))}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-dark-900 transition ${activeChat?.data?._id === room._id ? "bg-dark-900 border-l-2 border-primary-500" : ""}`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {room.name[0].toUpperCase()}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{room.name}</p>
                    <p className="text-xs text-slate-400">{room.members?.length} members</p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {tab === "ai" && (
          <button
            onClick={() => dispatch(setActiveChat({ type: "ai", data: { name: "AI Assistant", _id: "ai-bot" } }))}
            className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-dark-900 transition ${activeChat?.type === "ai" ? "bg-dark-900 border-l-2 border-primary-500" : ""}`}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <MdSmartToy size={20} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-white">AI Assistant</p>
              <p className="text-xs text-slate-400">Powered by Groq AI</p>
            </div>
          </button>
        )}
      </div>

      {/* ✅ FIX — fetchRooms after modal close */}
      {showCreateRoom && (
        <CreateRoomModal
          onClose={() => {
            setShowCreateRoom(false);
            dispatch(fetchRooms(user.token));
          }}
        />
      )}
    </div>
  );
}