const express = require("express");
const { sendMessage, getMessages } = require("../controllers/chatController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ إرسال رسالة جديدة
router.post("/send", authMiddleware, sendMessage);

// ✅ جلب الرسائل بين المستخدم والعامل
router.get("/:receiver", authMiddleware, getMessages);

module.exports = router;