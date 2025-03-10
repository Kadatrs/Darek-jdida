// const express = require("express");
// const passport = require("passport");
// const router = express.Router();
// const { registerWorker, loginWorker, forgotPassword, resetPassword } = require("../controllers/workerController");
// const { registerValidation, loginValidation, handleValidationErrors } = require("../middleware/workerValidation");



// // Forgot Password Routes
// router.post("/worker/forgot-password", forgotPassword);
// router.post("/worker/reset-password", resetPassword);




// // Standard registration & login
// router.post("/register", registerValidation, handleValidationErrors, registerWorker);
// router.post("/login", loginValidation, handleValidationErrors, loginWorker);

// // Google Authentication Routes
// router.get(
//   "/google", 
//   passport.authenticate("google-worker", { 
//     scope: ["profile", "email"] ,
//     prompt: "select_account",
//   })
// );

// router.get(
//   "/google/callback",
//   passport.authenticate("google-worker", { failureRedirect: "/login" }),
//   (req, res) => {
//     console.log(" *** Google Login Successful:");
//     res.redirect("http://localhost:5000/"); 
//   }
// );

// router.get("/logout", (req, res) => {
//   req.logout(function (err) {
//     if (err) {
//       return res.status(500).json({ message: "Error logging out" });
//     }
//     req.session.destroy(() => {
//       res.status(200).json({ message: "Logged out successfully" });
//     });
//   });
// });

// module.exports = router;



const express = require("express");
const passport = require("passport");
const router = express.Router();
const { registerWorker,verifyOtp, loginWorker } = require("../controllers/workerController");
const { registerValidation, loginValidation, handleValidationErrors } = require("../middleware/workerValidation");

const { forgotPassword, verifyResetOtp, resetPassword } = require("../controllers/workerController");


// Forgot Password Routes
router.post("/worker/forgot-password", forgotPassword);
router.post("/worker/reset-password", resetPassword);




// Standard registration & login
router.post("/register", registerValidation, handleValidationErrors, registerWorker);
router.post("/verify-otp", verifyOtp);
router.post("/login", loginValidation, handleValidationErrors, loginWorker);

// Google Authentication Routes
router.get(
  "/google", 
  passport.authenticate("google-worker", { 
    scope: ["profile", "email"] ,
    prompt: "select_account",
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google-worker", { failureRedirect: "/login" }),
  (req, res) => {
    console.log("✅ Google Login Successful:");
    res.redirect("http://localhost:5000/");  // 🔥 Redirect to your frontend
  }
);

router.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return res.status(500).json({ message: "Error logging out" });
    }
    req.session.destroy(() => {
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
});

module.exports = router;