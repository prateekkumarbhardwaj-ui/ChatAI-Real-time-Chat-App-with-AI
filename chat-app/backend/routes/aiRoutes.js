const express = require("express");
const router = express.Router();
const { aiChat, summarizeChat, suggestReplies } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

router.post("/chat", protect, aiChat);
router.post("/summarize", protect, summarizeChat);
router.post("/suggest", protect, suggestReplies);

module.exports = router;
