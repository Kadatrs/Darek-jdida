const express = require("express");
const { createServiceRequest, getServices, getAllRequests, sendOffer, addReview, bookWorker} = require("../controllers/requestController");
const authMiddleware  = require("../middleware/authMiddleware");
const multer = require("multer");
const router = express.Router();



// ✅ إعداد Multer لرفع الصور والفيديوهات
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  });
  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("❌ الملف غير مدعوم، يرجى تحميل صورة أو فيديو فقط."), false);
    }
  };
  const upload = multer({ storage, fileFilter });
  
  // ✅ المستخدم ينشئ طلبًا جديدًا مع تحميل صورة أو فيديو
router.post("/create", authMiddleware, upload.single("mediaFile"), createServiceRequest);
router.get("/services", getServices);
router.get("/", getAllRequests);
router.post("/send-offer", authMiddleware, sendOffer);
router.post("/add-review", authMiddleware, addReview);
router.post("/book-worker", authMiddleware, bookWorker);


///////////////////////////////////////////////////////////////


// router.get("/nearby", authMiddleware, getNearbyRequests);
// router.post("/:id/interest", authMiddleware, expressInterest);
// router.post("/:id/select-worker", authMiddleware, selectWorker);
// router.put("/:id/update-status", authMiddleware, updateRequestStatus);

module.exports = router;