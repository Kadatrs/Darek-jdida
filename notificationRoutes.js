const express = require("express");
const {
  getUserNotifications,
  getWorkerNotifications,
  markNotificationAsRead,
  sendNotification,
  serviceAcceptedNotification,
  serviceCompletedNotification,
  updateRequestStatusNotification,
  notifyWorkerRequestAbandoned,
  sendWelcomeNotification
} = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* ✅ Get notifications for a user */
router.get("/user", authMiddleware, getUserNotifications);

/* ✅ Get notifications for a worker */
router.get("/worker", authMiddleware, getWorkerNotifications);

/* ✅ Mark a notification as read */
router.put("/:id/read", authMiddleware, markNotificationAsRead);

/* ✅ Send a general notification to a user or worker */
router.post("/send", authMiddleware, sendNotification);

/* ✅ Send a notification when a service request is accepted */
router.post("/service-accepted", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await serviceAcceptedNotification(user);
    res.status(200).json({ message: "Service acceptance notification sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "❌ Error sending notification", error: error.message });
  }
});

/* ✅ Send a notification when a service request is completed */
router.post("/service-completed", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await serviceCompletedNotification(user);
    res.status(200).json({ message: "Service completion notification sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "❌ Error sending notification", error: error.message });
  }
});

/* ✅ Send a notification when the request status is updated */
router.post("/update-status", authMiddleware, async (req, res) => {
  try {
    const { userId, newStatus } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await updateRequestStatusNotification(user, newStatus);
    res.status(200).json({ message: "Request status update notification sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "❌ Error sending notification", error: error.message });
  }
});

/* ✅ Send a notification to the worker if a user cancels a request */
router.post("/request-abandoned", authMiddleware, async (req, res) => {
  try {
    const { workerId, requestDetails } = req.body;
    const worker = await Worker.findById(workerId);
    if (!worker) return res.status(404).json({ message: "Worker not found" });

    await notifyWorkerRequestAbandoned(worker, requestDetails);
    res.status(200).json({ message: "Request cancellation notification sent to worker successfully" });
  } catch (error) {
    res.status(500).json({ message: "❌ Error sending notification", error: error.message });
  }
});

/* ✅ Send a welcome notification when a new user or worker registers */
router.post("/welcome", authMiddleware, async (req, res) => {
  try {
    const { userId, userType } = req.body;
    const user = userType === "User" ? await User.findById(userId) : await Worker.findById(userId);
    if (!user) return res.status(404).json({ message: "User or worker not found" });

    await sendWelcomeNotification(user, userType);
    res.status(200).json({ message: "Welcome notification sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "❌ Error sending notification", error: error.message });
  }
});

module.exports = router;