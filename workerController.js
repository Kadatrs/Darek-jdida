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

// إرسال OTP عبر البريد أو الهاتف
// const sendOtp = async (worker, method) => {
//   const otp = generateOTP();
//   worker.resetOTP = otp;
//   worker.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // صلاحية 10 دقائق
//   await worker.save();

//   if (method === "email") {
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: worker.email,
//       subject: "Your OTP Code",
//       text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
//     };
//     await transporter.sendMail(mailOptions);
//   } else if (method === "phone") {
//     await twilioClient.messages.create({
//       body: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
//       from: process.env.TWILIO_PHONE_NUMBER,
//       to: worker.phoneNumber,
//     });
//   }
// };

const sendOtp = async (worker) => {
  const otpEmail = generateOTP();
  const otpPhone = generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  worker.verificationOTP = { email: otpEmail, phone: otpPhone }; // ✅ Store both OTPs
  worker.otpExpires = otpExpires;
  await worker.save();

  // Send OTP via Email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: worker.email,
    subject: "Your OTP Code",
    text: `Your Email OTP: ${otpEmail}. It will expire in 10 minutes.`,
  };
  await transporter.sendMail(mailOptions);

  // Send OTP via SMS
  await twilioClient.messages.create({
    body: `Your Phone OTP: ${otpPhone}. It will expire in 10 minutes.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: worker.phoneNumber,
  });
};


// إرسال OTP عند الطلب
exports.sendOtp = async (req, res) => {
  const { email, phoneNumber } = req.body;
  try {
    let worker = await Worker.findOne({ $or: [{ email }, { phoneNumber }] });
    if (!worker) return res.status(404).json({ message: "Worker not found" });

    const method = email ? "email" : "phone";
    await sendOtp(worker, method);

    res.status(200).json({ message: "OTP sent successfully to ${method}" });
  } catch (err) {
    res.status(500).json({ message: "Error sending OTP", error: err.message });
  }
};

// التحقق من OTP
// exports.verifyOtp = async (req, res) => {
//   const { email, phoneNumber, otp } = req.body;
//   try {
//     let worker = await Worker.findOne({ $or: [{ email }, { phoneNumber }] });
//     if (!worker) return res.status(404).json({ message: "Worker not found" });

//     if (worker.resetOTP !== otp || new Date() > worker.otpExpires)
//       return res.status(400).json({ message: "Invalid or expired OTP" });

//     worker.isVerified = true;
//     worker.resetOTP = null;
//     worker.otpExpires = null;
//     await worker.save();

//     res.status(200).json({ message: "OTP verified successfully" });
//   } catch (err) {
//     res.status(500).json({ message: "Error verifying OTP", error: err.message });
//   }
// };

exports.verifyOtp = async (req, res) => {
  const { email, phoneNumber, otpEmail, otpPhone } = req.body;

  try {
    // ✅ Find worker using email OR phoneNumber
    let worker = await Worker.findOne({ 
      $or: [{ email }, { phoneNumber }] 
    });

    if (!worker) return res.status(404).json({ message: "Worker not found" });

    if (new Date() > worker.otpExpires)
      return res.status(400).json({ message: "OTP has expired" });

    // ✅ Check OTP based on the method used
    if (email && worker.verificationOTP.email !== otpEmail)
      return res.status(400).json({ message: "Invalid email OTP" });

    if (phoneNumber && worker.verificationOTP.phone !== otpPhone)
      return res.status(400).json({ message: "Invalid phone OTP" });

    // ✅ Mark worker as verified after checking the correct OTP
    worker.isVerified = true;
    worker.verificationOTP = { email: null, phone: null };
    worker.otpExpires = null;
    await worker.save();

    res.status(200).json({ message: "Worker verified successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error verifying OTP", error: err.message });
  }
};



// تسجيل عامل جديد بعد التحقق من OTP
// exports.registerWorker = async (req, res) => {
//   try {
//     const { firstName, familyName, email, phoneNumber, password } = req.body;

//     if (!email || !phoneNumber)
//       return res.status(400).json({ message: "You must provide both an email and a phone number." });

//     if (await Worker.findOne({ $or: [{ email }, { phoneNumber }] }))
//       return res.status(400).json({ message: "Email or phone number already exists" });

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newWorker = new Worker({
//       firstName,
//       familyName,
//       email,
//       phoneNumber,
//       password: hashedPassword,
//       isVerified: false,
//     });

//     await newWorker.save();
//     await sendOtp(newWorker, "email");
//     await sendOtp(newWorker, "phone");

//     res.status(201).json({ message: "Worker registered. OTP sent to email and phone." });
//   } catch (err) {
//     res.status(500).json({ message: "Error registering worker", error: err.message });
//   }
// };

exports.registerWorker = async (req, res) => {
  try {
    const { firstName, familyName, email, phoneNumber, password } = req.body;

    if (!email || !phoneNumber)
      return res.status(400).json({ message: "You must provide both an email and a phone number." });

    if (await Worker.findOne({ $or: [{ email }, { phoneNumber }] }))
      return res.status(400).json({ message: "Email or phone number already exists" });

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
    await sendOtp(newWorker); // ✅ Send OTP to both email & phone

    res.status(201).json({ message: "Worker registered. OTP sent to email and phone." });
  } catch (err) {
    res.status(500).json({ message: "Error registering worker", error: err.message });
  }
};


// تسجيل دخول العامل
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
