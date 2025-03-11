
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const twilio = require("twilio");

// Twilio & Nodemailer Setup
const twilioClient = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
}

// Send OTP to Email or Phone
const sendOtp = async (user) => {
  const otp = generateOTP();
  user.resetOTP = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 mins
  await user.save();

  if (user.contact.includes("@")) {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.contact,
      subject: "Your Password Reset OTP",
      text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
    });
  } else {
    await twilioClient.messages.create({
      body: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: user.contact,
    });
  }
};

exports.sendOtp = async (req, res) => {
  const { contact } = req.body;
  try {
    const user = await User.findOne({ contact });
    if (!user) return res.status(404).json({ message: "User not found" });

    await sendOtp(user);

    res.status(200).json({ message: "OTP sent successfully." });
  } catch (err) {
    res.status(500).json({ message: "Error sending OTP", error: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  const { contact, otp } = req.body;

  try {
    const user = await User.findOne({ contact });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.resetOTP !== otp || new Date() > user.otpExpires) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    user.isVerified = true;
    user.resetOTP = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({ message: "Account verified successfully. You can now log in." });
  } catch (err) {
    res.status(500).json({ message: "Error verifying OTP", error: err.message });
  }
};

exports.registerUser = async (req, res) => {
  try {
    const { firstName, familyName, contact, password } = req.body;

    // Ensure contact field is filled
    if (!contact) {
      return res.status(400).json({ message: "Please provide either an email or phone number." });
    }

    // Check if contact is already registered
    const existingUser = await User.findOne({ contact });
    if (existingUser) {
      return res.status(400).json({ message: "This email or phone number is already registered." });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with `isVerified` set to false
    const newUser = new User({
      firstName,
      familyName,
      contact,
      password: hashedPassword,
      isVerified: false,
    });

    await newUser.save();

    // Send OTP
    await sendOtp(newUser);

    res.status(201).json({ message: "User registered. OTP sent for verification." });
  } catch (err) {
    res.status(500).json({ message: "Error registering user", error: err.message });
  }
};


// تسجيل دخول المستخدم
exports.loginUser = async (req, res) => {
  try {
    const { contact, password } = req.body;

    // Ensure contact is provided
    if (!contact) {
      return res.status(400).json({ message: "Please provide either an email or phone number." });
    }

    // Find user by contact
    const user = await User.findOne({ contact });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Ensure user is verified before logging in
    if (!user.isVerified) {
      return res.status(403).json({ message: "You must verify your account first." });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({ message: "Login successful", token, user });
  } catch (err) {
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
};

// 1️⃣ Forgot Password - Send OTP
exports.forgotPassword = async (req, res) => {
  const { contact } = req.body;

  try {
    const user = await User.findOne({ contact });
    if (!user) return res.status(404).json({ message: "User not found" });

    await sendOtp(user);
    res.status(200).json({ message: "OTP sent successfully. Proceed to verification." });

  } catch (err) {
    res.status(500).json({ message: "Error sending OTP", error: err.message });
  }
};

// 2️⃣ Verify OTP Before Reset
exports.verifyResetOtp = async (req, res) => {
  const { contact, otp } = req.body;

  try {
    const user = await User.findOne({ contact });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.resetOTP !== otp || new Date() > user.otpExpires) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    res.status(200).json({ message: "OTP verified successfully. You can now reset your password." });

  } catch (err) {
    res.status(500).json({ message: "Error verifying OTP", error: err.message });
  }
};

// 3️⃣ Reset Password After OTP Verification
exports.resetPassword = async (req, res) => {
  const { contact, newPassword } = req.body;

  try {
    const user = await User.findOne({ contact });
    if (!user) return res.status(404).json({ message: "User not found" });

    // if (user.resetOTP !== otp || new Date() > user.otpExpires) {
    //   return res.status(400).json({ message: "Invalid or expired OTP." });
    // }

    // Hash new password and save
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOTP = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({ message: "Password reset successful. You can now log in." });

  } catch (err) {
    res.status(500).json({ message: "Error resetting password", error: err.message });
  }
};



// exports.loginUser = async (req, res) => {
//   try {
//     const { contact, password } = req.body;

//     if (!contact) {
//       return res.status(400).json({ message: "Please provide an email or phone number." }); 
//     }

//     const user = await User.findOne({ contact });
//     if (!user) {
//       return res.status(400).json({ message: "Invalid credentials." }); 
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid credentials." }); 
//     }

//     if (!user.isVerified) {
//       return res.status(403).json({ message: "You must verify your account first." }); 
//     }

//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" }); //riadh

//     res.status(200).json({ message: "Login successful", token, user }); 
//   } catch (err) {
//     res.status(500).json({ message: "Error logging in", error: err.message }); 
//   }
// };


// // 1️⃣ Forgot Password - Send OTP
// exports.forgotPassword = async (req, res) => {
//   const { contact } = req.body;

//   try {
//     const user = await User.findOne({ contact });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     await sendOtp(user);
//     res.status(200).json({ message: "OTP sent successfully. Proceed to verification." });

//   } catch (err) {
//     res.status(500).json({ message: "Error sending OTP", error: err.message });
//   }
// };

// // 2️⃣ Verify OTP Before Reset
// exports.verifyResetOtp = async (req, res) => {
//   const { contact, otp } = req.body;

//   try {
//     const user = await User.findOne({ contact });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     if (user.resetOTP !== otp || new Date() > user.otpExpires) {
//       return res.status(400).json({ message: "Invalid or expired OTP." });
//     }

//     res.status(200).json({ message: "OTP verified successfully. You can now reset your password." });

//   } catch (err) {
//     res.status(500).json({ message: "Error verifying OTP", error: err.message });
//   }
// };

// // 3️⃣ Reset Password After OTP Verification
// exports.resetPassword = async (req, res) => {
//   const { contact, newPassword } = req.body;

//   try {
//     const user = await User.findOne({ contact });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     // if (user.resetOTP !== otp || new Date() > user.otpExpires) {
//     //   return res.status(400).json({ message: "Invalid or expired OTP." });
//     // }

//     // Hash new password and save
//     user.password = await bcrypt.hash(newPassword, 10);
//     user.resetOTP = null;
//     user.otpExpires = null;
//     await user.save();

//     res.status(200).json({ message: "Password reset successful. You can now log in." });

//   } catch (err) {
//     res.status(500).json({ message: "Error resetting password", error: err.message });
//   }
// };

////////////////////////////////////////////////////////////////////////////////////////////

exports.updateUserLocation = async (req, res) => {
  try {
    const { latitude, longitude, full_address } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.address = { latitude, longitude, full_address };
    await user.save();

    res.status(200).json({ message: "Location updated successfully", address: user.address });
  } catch (err) {
    res.status(500).json({ message: "Error updating location", error: err.message });
  }
};





// ✅ عرض ملف المستخدم الشخصي
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // إخفاء كلمة المرور
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile", error: err.message });
  }
};

// ✅ تحديث ملف المستخدم الشخصي
exports.updateUserProfile = async (req, res) => {
  try {
    const { firstName, familyName } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.firstName = firstName || user.firstName;
    user.familyName = familyName || user.familyName;

    await user.save();
    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Error updating profile", error: err.message });
  }
};









exports.uploadUserProfilePicture = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.profilePicture = `/uploads/${req.file.filename}`;
    await user.save();

    res.status(200).json({ message: "Profile picture updated", profilePicture: user.profilePicture });
  } catch (err) {
    res.status(500).json({ message: "Error uploading profile picture", error: err.message });
  }
};





exports.requestChangeUserContact = async (req, res) => {
  try {
    const { newContact } = req.body;
    if (!newContact) return res.status(400).json({ message: "Provide a new email or phone number" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(00213|\+213|0)(5|6|7)[0-9]{8}$/;

    if (!emailRegex.test(newContact) && !phoneRegex.test(newContact)) {
      return res.status(400).json({ message: "Invalid contact format. Must be a valid email or Algerian phone number." });
    }

    const existingUser = await User.findOne({ contact: newContact });
    if (existingUser) return res.status(400).json({ message: "This contact is already in use." });

    await sendOtp(newContact, user);
    res.status(200).json({ message: "OTP sent for contact update" });
  } catch (err) {
    res.status(500).json({ message: "Error requesting contact change", error: err.message });
  }
};

exports.verifyChangeUserContact = async (req, res) => {
  try {
    const { otp, newContact } = req.body;
    if (!otp || !newContact) return res.status(400).json({ message: "OTP and new contact are required." });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.verificationOTP !== otp || new Date() > user.otpExpires)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    user.contact = newContact;
    user.verificationOTP = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({ message: "Contact updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error verifying contact change", error: err.message });
  }
};
