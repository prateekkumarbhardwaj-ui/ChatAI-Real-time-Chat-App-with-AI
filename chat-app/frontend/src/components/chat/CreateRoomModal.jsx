import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createRoom, searchUsers, fetchRooms } from "../../redux/slices/chatSlice";
import { FiX, FiSearch, FiCheck } from "react-icons/fi";
import toast from "react-hot-toast";

export default function CreateRoomModal({ onClose }) {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { searchResults } = useSelector((s) => s.chat);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = (e) => {
    setQuery(e.target.value);
    if (e.target.value.length > 1) dispatch(searchUsers({ query: e.target.value, token: user.token }));
  };

  const toggleUser = (u) => {
    setSelected((prev) =>
      prev.find((x) => x._id === u._id) ? prev.filter((x) => x._id !== u._id) : [...prev, u]
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) return toast.error("Group name required");
    if (selected.length < 1) return toast.error("Add at least 1 member");
    
    setLoading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    selected.forEach((u) => formData.append("members", u._id));
    
    await dispatch(createRoom({ formData, token: user.token }));
    await dispatch(fetchRooms(user.token));
    
    toast.success("Group created!");
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 rounded-2xl border border-slate-700 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h3 className="text-white font-semibold">Create Group</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><FiX size={20} /></button>
        </div>

        <div className="p-6 space-y-4">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Group name *"
            className="w-full bg-dark-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-primary-500" />

          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)"
            className="w-full bg-dark-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-primary-500" />

          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input value={query} onChange={handleSearch} placeholder="Search users to add..."
              className="w-full bg-dark-900 border border-slate-700 rounded-xl pl-9 pr-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-primary-500" />
          </div>

          {selected.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selected.map((u) => (
                <span key={u._id} className="flex items-center gap-1 bg-primary-600/20 text-primary-400 text-xs px-3 py-1.5 rounded-full border border-primary-600/30">
                  {u.name} <button onClick={() => toggleUser(u)}><FiX size={12} /></button>
                </span>
              ))}
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="bg-dark-900 rounded-xl border border-slate-700 max-h-40 overflow-y-auto">
              {searchResults.map((u) => (
                <button key={u._id} onClick={() => toggleUser(u)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-dark-800 transition">
                  <div className="flex items-center gap-3">
                    <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}&background=4f46e5&color=fff`} className="w-8 h-8 rounded-full" />
                    <span className="text-sm text-white">{u.name}</span>
                  </div>
                  {selected.find((x) => x._id === u._id) && <FiCheck className="text-primary-400" size={16} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition">
            {loading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
}