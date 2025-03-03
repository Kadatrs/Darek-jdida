const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Worker = require("../models/Worker");
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

// إرسال OTP للبريد أو الهاتف
const sendOtp = async (worker, method) => {
  const otp = generateOTP();
  const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // صلاحية 10 دقائق

  if (method === "email") {
    worker.emailOTP = otp;
    worker.emailOtpExpires = expiryTime;
    await worker.save();
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: worker.email,
      subject: "Your Email OTP Code",
      text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
    });
  } else if (method === "phone") {
    worker.phoneOTP = otp;
    worker.phoneOtpExpires = expiryTime;
    await worker.save();
    await twilioClient.messages.create({
      body: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: worker.phoneNumber,
    });
  }
};

// إرسال OTP عند الطلب
exports.sendOtp = async (req, res) => {
  const { email, phoneNumber } = req.body;
  try {
    let worker = await Worker.findOne({ $or: [{ email }, { phoneNumber }] });
    if (!worker) return res.status(404).json({ message: "Worker not found" });

    if (email) await sendOtp(worker, "email");
    if (phoneNumber) await sendOtp(worker, "phone");

    res.status(200).json({ message: "OTP sent successfully to email and phone" });
  } catch (err) {
    res.status(500).json({ message: "Error sending OTP", error: err.message });
  }
};

// التحقق من OTP
exports.verifyOtp = async (req, res) => {
  const { email, phoneNumber, emailOtp, phoneOtp } = req.body;
  try {
    let worker = await Worker.findOne({ $or: [{ email }, { phoneNumber }] });
    if (!worker) return res.status(404).json({ message: "Worker not found" });

    let emailVerified = false, phoneVerified = false;

    if (email && emailOtp) {
      if (worker.emailOTP === emailOtp && new Date() < worker.emailOtpExpires) {
        emailVerified = true;
        worker.emailOTP = null;
        worker.emailOtpExpires = null;
      } else {
        return res.status(400).json({ message: "Invalid or expired email OTP" });
      }
    }

    if (phoneNumber && phoneOtp) {
      if (worker.phoneOTP === phoneOtp && new Date() < worker.phoneOtpExpires) {
        phoneVerified = true;
        worker.phoneOTP = null;
        worker.phoneOtpExpires = null;
      } else {
        return res.status(400).json({ message: "Invalid or expired phone OTP" });
      }
    }

    if (emailVerified && phoneVerified) {
      worker.isVerified = true;
      await worker.save();
      res.status(200).json({ message: "Both OTPs verified successfully" });
    } else {
      res.status(400).json({ message: "Both email and phone OTPs are required" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error verifying OTP", error: err.message });
  }
};

// تسجيل عامل جديد بعد التحقق من OTP
exports.registerWorker = async (req, res) => {
  try {
    const { firstName, familyName, email, phoneNumber, password } = req.body;

    if (!email || !phoneNumber)
      return res.status(400).json({ message: "You must provide both an email and a phone number." });

    if (await Worker.findOne({ $or: [{ email }, { phoneNumber }] })){
      return res.status(400).json({ message: "Email or phone number already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newWorker = new Worker({
      firstName,
      familyName,
      email,
      phoneNumber,
      password: hashedPassword,
      isVerified: false,
    });

    await newWorker.save();
    await sendOtp(newWorker, "email");
    await sendOtp(newWorker, "phone");

    res.status(201).json({ message: "Worker registered. OTP sent to email and phone." });
  } catch (err) {
    res.status(500).json({ message: "Error registering worker", error: err.message });
  }
};
exports.loginWorker = async (req, res) => {
  try {
    const { email, phoneNumber, password } = req.body;
    if (!email && !phoneNumber)
      return res.status(400).json({ message: "You must provide either an email or a phone number." });

    const worker = await Worker.findOne({ $or: [{ email }, { phoneNumber }] });
    if (!worker) return res.status(400).json({ message: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, worker.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    if (!worker.isVerified)
      return res.status(403).json({ message: "You must verify your account first." });

    const token = jwt.sign({ workerId: worker._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({ message: "Worker logged in successfully", token, worker });
  } catch (err) {
    res.status(500).json({ message: "Error logging in worker", error: err.message });
  }
};
exports.forgotPassword = async (req, res) => {
  const { emailOrPhone } = req.body;
  try {
    // البحث عن العامل باستخدام البريد الإلكتروني أو رقم الهاتف
    const worker = await Worker.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });

    if (!worker) return res.status(404).json({ message: "Worker not found" });

    // تحديد ما إذا كان الإدخال بريدًا إلكترونيًا أو رقم هاتف
    const isEmail = worker.email === emailOrPhone;
    const method = isEmail ? "email" : "phone";

    await sendOtp(worker, method);
    res.status(200).json({ message: `Password reset OTP sent to ${method}` });
  } catch (err) {
    res.status(500).json({ message: "Error sending OTP", error: err.message });
  }
};
exports.resetPassword = async (req, res) => {
  const { emailOrPhone, otp, newPassword } = req.body;
  try {
    // البحث عن العامل باستخدام البريد الإلكتروني أو رقم الهاتف
    const worker = await Worker.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });

    if (!worker) return res.status(404).json({ message: "Worker not found" });

    // التحقق من صحة الـ OTP وصلاحيته
    if (worker.resetOTP !== otp || new Date() > worker.otpExpires)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    // تحديث كلمة المرور
    worker.password = await bcrypt.hash(newPassword, 10);
    worker.resetOTP = null;
    worker.otpExpires = null;
    await worker.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Error resetting password", error: err.message });
  }
};
