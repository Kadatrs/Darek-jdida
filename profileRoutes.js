const express = require("express");
const multer = require("multer");
const { getUserProfile, updateUserProfile, updateUserLocation, requestChangeUserContact, verifyChangeUserContact, uploadUserProfilePicture } = require("../controllers/userController");
const { getWorkerProfile, updateWorkerProfile, updateWorkerLocation, requestChangeWorkerContact, verifyChangeWorkerContact, uploadWorkerProfilePicture } = require("../controllers/workerController");
const {authMiddleware} = require("../middleware/authMiddleware");

const router = express.Router();



// ✅ إعداد `multer` لتخزين الصور في مجلد `uploads/`
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/"); // حفظ الصور في مجلد `uploads`
    },
    filename: (req, file, cb) => {
      cb(null, `${req.user.id}-${Date.now()}-${file.originalname}`);
    }
  });
  
  const upload = multer({ storage });
  
// ✅ مسارات المستخدم
router.get("/user", authMiddleware, getUserProfile);
router.put("/user", authMiddleware, updateUserProfile);
router.put("/user/location", authMiddleware, updateUserLocation);

// ✅ مسارات العامل
router.get("/worker", authMiddleware, getWorkerProfile);
router.put("/worker", authMiddleware, updateWorkerProfile);
router.put("/worker/location", authMiddleware, updateWorkerLocation);

router.post("/user/request-change-contact", authMiddleware, requestChangeUserContact);
router.post("/user/verify-change-contact", authMiddleware, verifyChangeUserContact);
router.put("/user/upload-profile-picture", authMiddleware, upload.single("profilePicture"), uploadUserProfilePicture);


router.post("/worker/request-change-contact", authMiddleware, requestChangeWorkerContact);
router.post("/worker/verify-change-contact", authMiddleware, verifyChangeWorkerContact);
router.put("/worker/upload-profile-picture", authMiddleware, upload.single("profilePicture"), uploadWorkerProfilePicture);



module.exports = router;
