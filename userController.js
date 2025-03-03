const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const twilio = require("twilio");

// إعداد Twilio
const twilioClient = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// إعداد Nodemailer للبريد الإلكتروني
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// توليد OTP عشوائي من 6 أرقام
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// إرسال OTP عبر البريد أو الهاتف
const sendOtp = async (user, method) => {
  const otp = generateOTP();
  user.resetOTP = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // صلاحية 10 دقائق
  await user.save();

  if (method === "email") {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Your OTP Code",
      text: Your OTP code is ${otp}. It will expire in 10 minutes.,
    });
  } else if (method === "phone") {
    await twilioClient.messages.create({
      body: Your OTP code is ${otp}. It will expire in 10 minutes.,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: user.phoneNumber,
    });
  }
};

// إرسال OTP عند الطلب
exports.sendOtp = async (req, res) => {
  const { email, phoneNumber } = req.body;
  try {
    let user = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (!user) return res.status(404).json({ message: "User not found" });

    const method = email ? "email" : "phone";
    await sendOtp(user, method);

    res.status(200).json({ message: OTP sent successfully to ${method} });
  } catch (err) {
    res.status(500).json({ message: "Error sending OTP", error: err.message });
  }
};

// التحقق من OTP
exports.verifyOtp = async (req, res) => {
  const { email, phoneNumber, otp } = req.body;
  try {
    let user = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.resetOTP !== otp  new Date() > user.otpExpires)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    user.isVerified = true;
    user.resetOTP = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error verifying OTP", error: err.message });
  }
};

// تسجيل مستخدم جديد
exports.registerUser = async (req, res) => {
  try {
    const { firstName, familyName, email, phoneNumber, password } = req.body;

    if (!email && !phoneNumber)
      return res.status(400).json({ message: "You must provide either an email or a phone number." });

    if (await User.findOne({ $or: [{ email }, { phoneNumber }] }))
      return res.status(400).json({ message: "Email or phone number already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      familyName,
      email,
      phoneNumber,
      password: hashedPassword,
      isVerified: false,
    });

    await newUser.save();
    await sendOtp(newUser, email ? "email" : "phone");

    res.status(201).json({ message: "User registered. OTP sent." });
  } catch (err) {
    res.status(500).json({ message: "Error registering user", error: err.message });
  }
};

// تسجيل دخول المستخدم
exports.loginUser = async (req, res) => {
  try {
    const { email, phoneNumber, password } = req.body;
    if (!email && !phoneNumber)
      return res.status(400).json({ message: "You must provide either an email or a phone number." });

    const user = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isVerified)
      return res.status(403).json({ message: "You must verify your account first." });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({ message: "User logged in successfully", token, user });
  } catch (err) {
    res.status(500).json({ message: "Error logging in user", error: err.message });
  }
};

// إعادة تعيين كلمة المرور
exports.forgotPassword = async (req, res) => {
  const { email, phoneNumber } = req.body;
  try {
    let user;
    if (email) {
      user = await User.findOne({ email });
    } else if (phoneNumber) {
      user = await User.findOne({ phoneNumber });
    } else {
      return res.status(400).json({ message: "Please provide either email or phone number." });
    }

    if (!user) return res.status(404).json({ message: "User not found" });

    // تحديد طريقة إرسال OTP بناءً على ما تم تسجيله (email أو phone)
    const method = user.email ? "email" : "phone";
    await sendOtp(user, method); // إرسال OTP عبر البريد أو الهاتف

    res.status(200).json({ message: `${method} OTP sent successfully` });
  } catch (err) {
    res.status(500).json({ message: "Error sending OTP", error: err.message });
  }
};


// // تأكيد إعادة تعيين كلمة المرور
// exports.resetPassword = async (req, res) => {
//   const { email, otp, newPassword } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user || user.resetOTP !== otp || new Date() > user.otpExpires)
//       return res.status(400).json({ message: "Invalid or expired OTP" });
//     user.password = await bcrypt.hash(newPassword, 10);
//     user.resetOTP = null;
//     user.otpExpires = null;
//     await user.save();
//     res.status(200).json({ message: "Password reset successful" });
//   } catch (err) {
//     res.status(500).json({ message: "Error resetting password", error: err.message });
//   }
// };


// تأكيد إعادة تعيين كلمة المرور
exports.resetPassword = async (req, res) => {
  const { email, phoneNumber, otp, newPassword } = req.body;

  try {
    let user;
    if (email) {
      user = await User.findOne({ email });
    } else if (phoneNumber) {
      user = await User.findOne({ phoneNumber });
    } else {
      return res.status(400).json({ message: "Please provide either email or phone number." });
    }

    if (!user) return res.status(404).json({ message: "User not found" });

    // التحقق من صحة الـ OTP وعدم انتهاء صلاحيته
    if (user.resetOTP !== otp || new Date() > user.otpExpires) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // تحديث كلمة المرور بعد التحقق من OTP
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOTP = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Error resetting password", error: err.message });
  }
};
