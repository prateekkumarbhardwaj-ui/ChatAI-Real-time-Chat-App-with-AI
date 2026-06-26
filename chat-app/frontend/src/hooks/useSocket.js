import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, setOnlineUsers, setTyping } from "../redux/slices/chatSlice";

let socket;

export const useSocket = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const activeChatRef = useRef(null);
  const { activeChat } = useSelector((s) => s.chat);

 
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    if (!user) return;

    socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000");

    socket.emit("user:online", user._id);

    socket.on("users:online", (userIds) => dispatch(setOnlineUsers(userIds)));

    socket.on("message:receive", (msg) => {
      const chat = activeChatRef.current;
      if (chat?.type === "dm" && chat?.data?._id === msg.sender._id) {
        dispatch(addMessage(msg));
      }
    });

    socket.on("message:sent", (msg) => dispatch(addMessage(msg)));

    socket.on("room:message:receive", (msg) => {
      const chat = activeChatRef.current;
      if (chat?.type === "room") {
        dispatch(addMessage(msg));
      }
    });

    socket.on("typing:start", ({ senderId }) =>
      dispatch(setTyping({ senderId, isTyping: true }))
    );
    socket.on("typing:stop", ({ senderId }) =>
      dispatch(setTyping({ senderId, isTyping: false }))
    );

    return () => socket.disconnect();
  }, [user]);

  return socket;
};

export const getSocket = () => socket;