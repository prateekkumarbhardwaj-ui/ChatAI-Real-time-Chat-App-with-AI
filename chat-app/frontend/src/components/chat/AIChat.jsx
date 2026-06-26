import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { FiSend, FiTrash2 } from "react-icons/fi";
import { MdSmartToy } from "react-icons/md";
import { format } from "date-fns";

export default function AIChat() {
  const { user } = useSelector((s) => s.auth);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hey! I'm your AI assistant powered by Gemini 🤖\n\nYou can ask me anything — coding help, ideas, questions, or just chat!",
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", text: input.trim(), time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, text: m.text }));
      const res = await axios.post(
        "/api/ai/chat",
        { message: userMsg.text, history },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: res.data.reply, time: new Date() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, I encountered an error. Please try again.", time: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-dark-950 h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-dark-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
            <MdSmartToy size={20} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-white">AI Assistant</p>
            <p className="text-xs text-purple-400">● Powered by Gemini</p>
          </div>
        </div>
        <button
          onClick={() => setMessages([{ role: "assistant", text: "Chat cleared! How can I help you?", time: new Date() }])}
          className="text-slate-400 hover:text-red-400 transition p-1.5"
          title="Clear chat"
        >
          <FiTrash2 size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-end gap-2 mb-4 msg-enter ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center flex-shrink-0 mb-1">
                <MdSmartToy size={14} className="text-white" />
              </div>
            )}
            <div className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-sm lg:max-w-lg rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-primary-600 text-white rounded-br-sm"
                    : "bg-gradient-to-br from-purple-900/80 to-indigo-900/80 border border-purple-700/50 text-slate-100 rounded-bl-sm"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              </div>
              <p className="text-xs text-slate-500 mt-1 px-1">
                {format(msg.time, "hh:mm a")}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-end gap-2 mb-4">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <MdSmartToy size={14} className="text-white" />
            </div>
            <div className="bg-purple-900/50 border border-purple-700/50 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
              <span className="typing-dot w-2 h-2 bg-purple-400 rounded-full" />
              <span className="typing-dot w-2 h-2 bg-purple-400 rounded-full" />
              <span className="typing-dot w-2 h-2 bg-purple-400 rounded-full" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-slate-700/50 bg-dark-800">
        <div className="flex items-center gap-3 bg-dark-900 rounded-2xl px-4 py-2 border border-purple-700/30">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Ask the AI anything..."
            className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none py-2"
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-30 text-white p-2.5 rounded-xl transition"
          >
            <FiSend size={16} />
          </button>
        </div>
        <p className="text-center text-xs text-slate-600 mt-2">Powered by Google Gemini 1.5 Flash</p>
      </div>
    </div>
  );
}
