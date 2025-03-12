const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { createServiceRequest, getNearbyRequests, expressInterest, selectWorker, updateRequestStatus } = require("../controllers/serviceRequestController");

console.log("🔍 Imported protect middleware:", protect);

// 📌 User creates a request
router.post("/", protect, createServiceRequest);

// 📌 Worker fetches nearby requests
router.get("/nearby", protect, getNearbyRequests);

// 📌 Worker expresses interest in a request
router.put("/:requestId/interest", protect, expressInterest);

// 📌 User selects a worker
router.put("/:requestId/select-worker", protect, selectWorker);

// 📌 Update request status (pending, accepted, completed)
router.put("/:requestId/status", protect, updateRequestStatus);

module.exports = router;
