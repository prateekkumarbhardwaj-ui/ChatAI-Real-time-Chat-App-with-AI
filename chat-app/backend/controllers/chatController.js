const Message = require("../models/Message");
const Room = require("../models/Room");
const User = require("../models/User");

const getDMMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id },
      ],
    })
      .populate("sender", "name avatar")
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRoomMessages = async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.roomId })
      .populate("sender", "name avatar")
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// FIXED createRoom
const createRoom = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    
    const membersArray = Array.isArray(members) ? members : [members];
    
    const room = await Room.create({
      name,
      description,
      admin: req.user._id,
      members: [...membersArray, req.user._id.toString()],
      avatar: req.file?.path || "",
    });

    const populated = await Room.findById(room._id)
      .populate("members", "name avatar email")
      .populate("admin", "name");

    res.status(201).json(populated);
  } catch (error) {
    console.error("createRoom error:", error);
    res.status(500).json({ message: error.message });
  }
};

const getMyRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.user._id })
      .populate("members", "name avatar")
      .populate("admin", "name")
      .populate("lastMessage");
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getContacts = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    });

    const userIds = new Set();
    messages.forEach((m) => {
      if (m.sender?.toString() !== req.user._id.toString()) {
        userIds.add(m.sender?.toString());
      }
      if (m.receiver?.toString() !== req.user._id.toString()) {
        userIds.add(m.receiver?.toString());
      }
    });

    const contacts = await User.find({
      _id: { $in: Array.from(userIds) }
    }).select("-password");

    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addReaction = async (req, res) => {
  try {
    const { messageId, emoji } = req.body;
    const message = await Message.findById(messageId);
    const existingIdx = message.reactions.findIndex(
      (r) => r.user.toString() === req.user._id.toString() && r.emoji === emoji
    );
    if (existingIdx >= 0) {
      message.reactions.splice(existingIdx, 1);
    } else {
      message.reactions.push({ emoji, user: req.user._id });
    }
    await message.save();
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDMMessages, getRoomMessages, createRoom, getMyRooms, getContacts, addReaction };