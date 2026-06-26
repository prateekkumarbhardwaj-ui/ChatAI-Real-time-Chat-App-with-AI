const express = require("express");
const router = express.Router();
const { register, login, getMe, searchUsers, updateProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: "chat-avatars", allowed_formats: ["jpg", "png", "webp"] },
});
const upload = multer({ storage });

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/users", protect, searchUsers);
router.put("/profile", protect, upload.single("avatar"), updateProfile);

module.exports = router;
