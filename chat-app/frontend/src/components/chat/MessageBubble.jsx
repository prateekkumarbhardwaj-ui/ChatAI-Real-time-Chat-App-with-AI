import { useSelector } from "react-redux";
import { format } from "date-fns";
import { FiCheck, FiCheckCircle } from "react-icons/fi";

export default function MessageBubble({ message }) {
  const { user } = useSelector((s) => s.auth);
  const isMine = message.sender?._id === user._id || message.sender === user._id;
  const isAI = message.type === "ai";

  return (
    <div className={`flex items-end gap-2 mb-3 msg-enter ${isMine ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      {!isMine && (
        <img
          src={message.sender?.avatar || `https://ui-avatars.com/api/?name=${message.sender?.name || "AI"}&background=4f46e5&color=fff`}
          className="w-7 h-7 rounded-full flex-shrink-0 mb-1"
          alt="sender"
        />
      )}

      <div className={`max-w-xs lg:max-w-md ${isMine ? "items-end" : "items-start"} flex flex-col`}>
        {/* Sender name in groups */}
        {!isMine && message.sender?.name && (
          <p className="text-xs text-slate-400 mb-1 px-1">{message.sender.name}</p>
        )}

        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isAI
              ? "bg-gradient-to-br from-purple-900/80 to-indigo-900/80 border border-purple-700/50 text-slate-100"
              : isMine
              ? "bg-primary-600 text-white rounded-br-sm"
              : "bg-dark-800 text-slate-100 border border-slate-700/50 rounded-bl-sm"
          }`}
        >
          {message.image && (
            <img src={message.image} className="rounded-lg max-w-full mb-2" alt="attachment" />
          )}
          {message.content && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          )}
        </div>

        {/* Time */}
        <p className="text-xs text-slate-500 mt-1 px-1">
          {message.createdAt ? format(new Date(message.createdAt), "hh:mm a") : "just now"}
        </p>
      </div>
    </div>
  );
}
