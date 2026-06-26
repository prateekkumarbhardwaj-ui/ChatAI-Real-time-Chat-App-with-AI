const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();

const {
  getDMMessages, getRoomMessages, createRoom,
  getMyRooms, getContacts, addReaction
} = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

router.get("/messages/:userId", protect, getDMMessages);
router.get("/room/:roomId/messages", protect, getRoomMessages);
router.post("/room", protect, upload.none(), createRoom);
router.get("/rooms", protect, getMyRooms);
router.get("/contacts", protect, getContacts);
router.post("/react", protect, addReaction);

module.exports = router;