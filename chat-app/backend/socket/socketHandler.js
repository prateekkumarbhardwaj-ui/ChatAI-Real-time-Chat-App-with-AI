const Message = require("../models/Message");
const Room = require("../models/Room");
const User = require("../models/User");

const onlineUsers = new Map();

const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 Connected:", socket.id);

    socket.on("user:online", async (userId) => {
      onlineUsers.set(userId, socket.id);
      await User.findByIdAndUpdate(userId, { isOnline: true });
      io.emit("users:online", Array.from(onlineUsers.keys()));
    });

    socket.on("room:join", (roomId) => {
      socket.join(roomId);
      console.log(`🏠 Joined room: ${roomId}`);
    });

    // DM message
    socket.on("message:send", async (data) => {
      try {
        const { senderId, receiverId, content, image } = data;
        const message = await Message.create({
          sender: senderId,
          receiver: receiverId,
          content,
          image: image || "",
          type: image ? "image" : "text",
        });

        const populated = await Message.findById(message._id)
          .populate("sender", "name avatar");

        const receiverSocket = onlineUsers.get(receiverId);
        if (receiverSocket) {
          io.to(receiverSocket).emit("message:receive", populated);
        }
        socket.emit("message:sent", populated);
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    // Group message — FIXED
    socket.on("room:message:send", async (data) => {
      try {
        const { senderId, roomId, content, image } = data;
        const message = await Message.create({
          sender: senderId,
          room: roomId,
          content,
          image: image || "",
          type: image ? "image" : "text",
        });

        await Room.findByIdAndUpdate(roomId, { lastMessage: message._id });

        const populated = await Message.findById(message._id)
          .populate("sender", "name avatar");

        // room field add karo taaki frontend identify kar sake
        const msgObj = { ...populated.toObject(), room: roomId };
        io.to(roomId).emit("room:message:receive", msgObj);
      } catch (err) {
        console.error("room:message:send error:", err);
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("typing:start", ({ senderId, receiverId, roomId }) => {
      if (roomId) {
        socket.to(roomId).emit("typing:start", { senderId });
      } else {
        const receiverSocket = onlineUsers.get(receiverId);
        if (receiverSocket) io.to(receiverSocket).emit("typing:start", { senderId });
      }
    });

    socket.on("typing:stop", ({ senderId, receiverId, roomId }) => {
      if (roomId) {
        socket.to(roomId).emit("typing:stop", { senderId });
      } else {
        const receiverSocket = onlineUsers.get(receiverId);
        if (receiverSocket) io.to(receiverSocket).emit("typing:stop", { senderId });
      }
    });

    socket.on("message:read", async ({ messageId, userId }) => {
      await Message.findByIdAndUpdate(messageId, { $addToSet: { readBy: userId } });
      socket.broadcast.emit("message:read:ack", { messageId, userId });
    });

    socket.on("disconnect", async () => {
      for (const [userId, sId] of onlineUsers.entries()) {
        if (sId === socket.id) {
          onlineUsers.delete(userId);
          await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
          io.emit("users:online", Array.from(onlineUsers.keys()));
          console.log(`❌ User offline: ${userId}`);
          break;
        }
      }
    });
  });
};

module.exports = { initSocket };
