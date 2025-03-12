
// // const bcrypt = require("bcryptjs");
// // const jwt = require("jsonwebtoken");
// // const User = require("../models/User");

// // // ✅ تسجيل مستخدم جديد
// // exports.registerUser = async (req, res) => {
// //   try {
// //     const { firstName, familyName, email, phoneNumber, password, otpEmail, otpPhone } = req.body;

// //     if (!email && !phoneNumber) {
// //       return res.status(400).json({ message: "You must provide either an email or a phone number." });
// //     }

// //     const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
// //     if (existingUser) {
// //       return res.status(400).json({ message: "Email or phone number already exists" });
// //     }

// //     // ✅ تشفير كلمة المرور قبل الحفظ
// //     const hashedPassword = await bcrypt.hash(password, 10);

// //     const newUser = new User({
// //       firstName,
// //       familyName,
// //       email,
// //       phoneNumber,
// //       password: hashedPassword,
// //       otpEmail,
// //       otpPhone
// //     });

// //     await newUser.save();
// //     res.status(201).json({ message: "User registered successfully" });
// //   } catch (err) {
// //     res.status(500).json({ message: "Error in registering user", error: err.message });
// //   }
// // };





// // exports.loginUser = async (req, res) => {
// //   try {
// //     const { email, phoneNumber, password } = req.body;

// //     if (!email && !phoneNumber) {
// //       return res.status(400).json({ message: "You must provide either an email or a phone number." });
// //     }

// //     const user = await User.findOne({ $or: [{ email }, { phoneNumber }] });
// //     if (!user) {
// //       return res.status(400).json({ message: "Invalid credentials" });
// //     }

// //     // ✅ التحقق من كلمة المرور باستخدام bcrypt
// //     const isMatch = await bcrypt.compare(password, user.password);
// //     if (!isMatch) {
// //       return res.status(400).json({ message: "Invalid credentials" });
// //     }

// //     const token = jwt.sign({ userId: user._id }, "your_jwt_secret", { expiresIn: "7d" });

// //     res.status(200).json({ message: "User logged in successfully", token, user });
// //   } catch (err) {
// //     res.status(500).json({ message: "Error in logging in user", error: err.message });
// //   }
// // };


// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");
// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // Generate OTP
// function generateOTP() {
//   return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
// }

// exports.sendOtpToEmail = async (req, res) => {
//   const { email } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const otp = generateOTP();
//     const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 mins
//   // Store OTP in DB
//   user.resetOTP = otp;
//   user.otpExpires = otpExpires;
//   await user.save();

//   // Send email
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: "Your OTP Code",
//     text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
//   };

//   await transporter.sendMail(mailOptions);
//   res.status(200).json({ message: "OTP sent successfully" });
//   } catch (err) {
//   res.status(500).json({ message: "Error sending OTP", error: err.message });
//   }
//   };

//   // ✅ Verify OTP
//   exports.verifyOtp = async (req, res) => {
//   const { email, otp } = req.body;

//   try {
//   const user = await User.findOne({ email });
//   if (!user) {
//     return res.status(404).json({ message: "User not found" });
//   }

//   if (user.resetOTP !== otp || new Date() > user.otpExpires) {
//     return res.status(400).json({ message: "Invalid or expired OTP" });
//   }

//   // Clear OTP after successful verification
//   user.resetOTP = null;
//   user.otpExpires = null;
//   await user.save();

//   res.status(200).json({ message: "OTP verified successfully" });
//   } catch (err) {
//   res.status(500).json({ message: "Error verifying OTP", error: err.message });
//   }
//   };

// // ✅ تسجيل مستخدم جديد
// exports.registerUser = async (req, res) => {
//   try {
//     const { firstName, familyName, email, phoneNumber, password, otpEmail, otpPhone } = req.body;

//     if (!email && !phoneNumber) {
//       return res.status(400).json({ message: "You must provide either an email or a phone number." });
//     }

//     const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
//     if (existingUser) {
//       return res.status(400).json({ message: "Email or phone number already exists" });
//     }

//     // ✅ تشفير كلمة المرور قبل الحفظ
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = new User({
//       firstName,
//       familyName,
//       email,
//       phoneNumber,
//       password: hashedPassword,
//       otpEmail,
//       otpPhone
//     });

//     //User.markModified("password");  // Ensure Mongoose detects the change

//     await newUser.save();
//     res.status(201).json({ message: "User registered successfully" });
//   } catch (err) {
//     res.status(500).json({ message: "Error in registering user", error: err.message });
//   }
// };





// exports.loginUser = async (req, res) => {
//   try {
//     const { email, phoneNumber, password } = req.body;

//     if (!email && !phoneNumber) {
//       return res.status(400).json({ message: "You must provide either an email or a phone number." });
//     }

//     let user;
//     if (email) {
//       user = await User.findOne({ email });
//     } else if (phoneNumber) {
//       user = await User.findOne({ phoneNumber });
//     }

//     //const user = await User.findOne({ $or: [{ email }, { phoneNumber }] });
//     if (!user) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     // ✅ التحقق من كلمة المرور باستخدام bcrypt
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     const token = jwt.sign({ userId: user._id }, "your_jwt_secret", { expiresIn: "7d" });

//     res.status(200).json({ message: "User logged in successfully", token, user });
//   } catch (err) {
//     res.status(500).json({ message: "Error in logging in user", error: err.message });
//   }
// };

// //------------------------------------------------------------------






// //------------------------------------------------------------------


// exports.forgotPassword = async (req, res) => {
//   const { email } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const otp = generateOTP();
//     const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 mins

//     // Store OTP in DB
//     user.resetOTP = otp;
//     user.otpExpires = otpExpires;
//     await user.save();

//     // Send email
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: "Password Reset OTP",
//       text: `Your password reset OTP is ${otp}. It will expire in 10 minutes.`,
//     };

//     await transporter.sendMail(mailOptions);
//     res.status(200).json({ message: "Password reset OTP sent successfully" });
//   } catch (err) {
//     res.status(500).json({ message: "Error sending OTP", error: err.message });
//   }
// };


// // ✅ Reset Password
// exports.resetPassword = async (req, res) => {
//   const { email, otp, newPassword } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     if (user.resetOTP !== otp || new Date() > user.otpExpires) {
//       return res.status(400).json({ message: "Invalid or expired OTP" });
//     }

//     // Hash new password

//     // Update password & clear OTP fields

//     //user.password = newPassword;
//     user.password =await bcrypt.hash(newPassword, 10) ;

//     user.resetOTP = null;
//     user.otpExpires = null;
//     //User.markModified("password");
//     await user.save();

//     //const updatedUser = await user.save();
//     console.log("Updated User:", user.password); // Debugging

//     res.status(200).json({ message: "Password reset successful" });
//   } catch (err) {
//     res.status(500).json({ message: "Error resetting password", error: err.message });
//   }

// };

// ----------------------------------------------------------------------------------
//----------------------------------------------------------------------------------


// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");
// const nodemailer = require("nodemailer");

// // إعداد خدمة إرسال البريد الإلكتروني
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // توليد OTP عشوائي من 6 أرقام
// function generateOTP() {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// }

// // دالة إرسال OTP عبر البريد أو الهاتف
// const sendOtp = async (user, method) => {
//   const otp = generateOTP();
//   user.resetOTP = otp;
//   user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
//   await user.save();

//   if (method === "email") {
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: user.email,
//       subject: "Your OTP Code",
//       text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
//     };
//     await transporter.sendMail(mailOptions);
//   } else if (method === "phone") {
//     console.log("OTP sent to phone: ${otp}"); // يمكن استبداله بـ Twilio لاحقًا
//   }
// };

// // إرسال OTP عند الطلب
// exports.sendOtp = async (req, res) => {
//   const { email, phoneNumber } = req.body;
//   try {
//     let user = await User.findOne({ $or: [{ email }, { phoneNumber }] });
//     if (!user) return res.status(404).json({ message: "User not found" });
//     const method = email ? "email" : "phone";
//     await sendOtp(user, method);
//     res.status(200).json({ message: `OTP sent successfully to ${method}`});
//   } catch (err) {
//     res.status(500).json({ message: "Error sending OTP", error: err.message });
//   }
// };

// // التحقق من OTP
// exports.verifyOtp = async (req, res) => {
//   const { email, phoneNumber, otp } = req.body;
//   try {
//     let user = await User.findOne({ $or: [{ email }, { phoneNumber }] });
//     if (!user) return res.status(404).json({ message: "User not found" });
//     if (user.resetOTP !== otp || new Date() > user.otpExpires)
//       return res.status(400).json({ message: "Invalid or expired OTP" });
//     user.isVerified = true;
//     user.resetOTP = null;
//     user.otpExpires = null;
//     await user.save();
//     res.status(200).json({ message: "OTP verified successfully" });
//   } catch (err) {
//     res.status(500).json({ message: "Error verifying OTP", error: err.message });
//   }
// };

// // تسجيل مستخدم جديد
// exports.registerUser = async (req, res) => {
//   try {
//     const { firstName, familyName, email, phoneNumber, password } = req.body;
//     if (!email && !phoneNumber)
//       return res.status(400).json({ message: "Provide either an email or a phone number." });
//     console.log(await User.findOne({ $or: [{ email }, { phoneNumber }] }));
//     if (await User.findOne({ $or: [{ email }, { phoneNumber }] }))
//       return res.status(400).json({ message: "Email or phone already exists" });
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = new User({ firstName, familyName, email, phoneNumber, password: hashedPassword, isVerified: false });
//     await newUser.save();
//     await sendOtp(newUser, email ? "email" : "phone");
//     res.status(201).json({ message: "User registered. OTP sent." });
//   } catch (err) {
//     res.status(500).json({ message: "Error registering user", error: err.message });
//   }
// };

// // تسجيل الدخول
// exports.loginUser = async (req, res) => {
//   try {
//     const { email, phoneNumber, password } = req.body;
//     if (!email && !phoneNumber)
//       return res.status(400).json({ message: "Provide either an email or a phone number." });
//     let user = await User.findOne({ $or: [{ email }, { phoneNumber }] });
//     if (!user || !(await bcrypt.compare(password, user.password)))
//       return res.status(400).json({ message: "Invalid credentials" });
//     if (!user.isVerified)
//       return res.status(403).json({ message: "Verify your account first." });
//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
//     res.status(200).json({ message: "Login successful", token, user });
//   } catch (err) {
//     res.status(500).json({ message: "Error logging in", error: err.message });
//   }
// };
// // إعادة تعيين كلمة المرور
// exports.forgotPassword = async (req, res) => {
//   const { email } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: "User not found" });
//     await sendOtp(user, "email");
//     res.status(200).json({ message: "Password reset OTP sent" });
//   } catch (err) {
//     res.status(500).json({ message: "Error sending OTP", error: err.message });
//   }
// };

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



//----------------------------------------------------------------------------------
//----------------------------------------------------------------------------------



// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");
// const nodemailer = require("nodemailer");
// const twilio = require("twilio");

// // إعداد Twilio
// const twilioClient = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// // إعداد Nodemailer للبريد الإلكتروني
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // توليد OTP عشوائي من 6 أرقام
// function generateOTP() {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// }

// // إرسال OTP عبر البريد أو الهاتف
// const sendOtp = async (user) => {
//   const otp = generateOTP();
//   user.resetOTP = otp;
//   user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 mins
//   await user.save();

//   // Check if it's an email or phone number
//   if (user.contact.includes("@")) {
//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: user.contact,
//       subject: "Your OTP Code",
//       text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
//     });
//   } else {
//     await twilioClient.messages.create({
//       body: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
//       from: process.env.TWILIO_PHONE_NUMBER,
//       to: user.contact,
//     });
//   }
// };


// exports.sendOtp = async (req, res) => {
//   const { contact } = req.body;
//   try {
//     const user = await User.findOne({ contact });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     await sendOtp(user);

//     res.status(200).json({ message: "OTP sent successfully." });
//   } catch (err) {
//     res.status(500).json({ message: "Error sending OTP", error: err.message });
//   }
// };

// exports.verifyOtp = async (req, res) => {
//   const { contact, otp } = req.body;

//   try {
//     const user = await User.findOne({ contact });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     if (user.resetOTP !== otp || new Date() > user.otpExpires) {
//       return res.status(400).json({ message: "Invalid or expired OTP." });
//     }

//     user.isVerified = true;
//     user.resetOTP = null;
//     user.otpExpires = null;
//     await user.save();

//     res.status(200).json({ message: "Account verified successfully. You can now log in." });
//   } catch (err) {
//     res.status(500).json({ message: "Error verifying OTP", error: err.message });
//   }
// };


// // تسجيل مستخدم جديد
// exports.registerUser = async (req, res) => {
//   try {
//     const { firstName, familyName, contact, password } = req.body;

//     // Ensure contact field is filled
//     if (!contact) {
//       return res.status(400).json({ message: "Please provide either an email or phone number." });
//     }

//     // Check if contact is already registered
//     const existingUser = await User.findOne({ contact });
//     if (existingUser) {
//       return res.status(400).json({ message: "This email or phone number is already registered." });
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create new user with `isVerified` set to false
//     const newUser = new User({
//       firstName,
//       familyName,
//       contact,
//       password: hashedPassword,
//       isVerified: false,
//     });

//     await newUser.save();

//     // Send OTP
//     await sendOtp(newUser);

//     res.status(201).json({ message: "User registered. OTP sent for verification." });
//   } catch (err) {
//     res.status(500).json({ message: "Error registering user", error: err.message });
//   }
// };


// // تسجيل دخول المستخدم
// exports.loginUser = async (req, res) => {
//   try {
//     const { contact, password } = req.body;

//     // Ensure contact is provided
//     if (!contact) {
//       return res.status(400).json({ message: "Please provide either an email or phone number." });
//     }

//     // Find user by contact
//     const user = await User.findOne({ contact });
//     if (!user) {
//       return res.status(400).json({ message: "Invalid credentials." });
//     }

//     // Check password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid credentials." });
//     }

//     // Ensure user is verified before logging in
//     if (!user.isVerified) {
//       return res.status(403).json({ message: "You must verify your account first." });
//     }

//     // Generate JWT token
//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

//     res.status(200).json({ message: "Login successful", token, user });
//   } catch (err) {
//     res.status(500).json({ message: "Error logging in", error: err.message });
//   }
// };


// // إعادة تعيين كلمة المرور
// exports.forgotPassword = async (req, res) => {
//   const { contact } = req.body;
  
//   try {
//     const user = await User.findOne({ contact });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     // Send OTP
//     await sendOtp(user);
//     res.status(200).json({ message: "OTP sent for password reset." });

//   } catch (err) {
//     res.status(500).json({ message: "Error sending OTP", error: err.message });
//   }
// };



// // // تأكيد إعادة تعيين كلمة المرور
// // exports.resetPassword = async (req, res) => {
// //   const { email, otp, newPassword } = req.body;
// //   try {
// //     const user = await User.findOne({ email });
// //     if (!user || user.resetOTP !== otp || new Date() > user.otpExpires)
// //       return res.status(400).json({ message: "Invalid or expired OTP" });
// //     user.password = await bcrypt.hash(newPassword, 10);
// //     user.resetOTP = null;
// //     user.otpExpires = null;
// //     await user.save();
// //     res.status(200).json({ message: "Password reset successful" });
// //   } catch (err) {
// //     res.status(500).json({ message: "Error resetting password", error: err.message });
// //   }
// // };


// // تأكيد إعادة تعيين كلمة المرور
// exports.resetPassword = async (req, res) => {
//   const { contact, otp, newPassword } = req.body;

//   try {
//     const user = await User.findOne({ contact });
//     if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

//     // Ensure OTP is valid before proceeding
//     if (user.resetOTP !== otp || new Date() > user.otpExpires) {
//       return res.status(400).json({ message: "OTP غير صالح أو منتهي الصلاحية" });
//     }

//     // Hash new password and save
//     user.password = await bcrypt.hash(newPassword, 10);
//     user.resetOTP = null;
//     user.otpExpires = null;
//     await user.save();

//     res.status(200).json({ message: "تمت إعادة تعيين كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن." });

//   } catch (err) {
//     res.status(500).json({ message: "خطأ في إعادة تعيين كلمة المرور", error: err.message });
//   }
// };



//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------

// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");
// const nodemailer = require("nodemailer");
// const twilio = require("twilio");

// // Twilio & Nodemailer Setup
// const twilioClient = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // Generate OTP
// function generateOTP() {
//   return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
// }

// // Send OTP to Email or Phone
// const sendOtp = async (user) => {
//   const otp = generateOTP();
//   user.resetOTP = otp;
//   user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 mins
//   await user.save();

//   if (user.contact.includes("@")) {
//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: user.contact,
//       subject: "Your Password Reset OTP",
//       text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
//     });
//   } else {
//     await twilioClient.messages.create({
//       body: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
//       from: process.env.TWILIO_PHONE_NUMBER,
//       to: user.contact,
//     });
//   }
// };

// exports.sendOtp = async (req, res) => {
//   const { contact } = req.body;
//   try {
//     const user = await User.findOne({ contact });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     await sendOtp(user);

//     res.status(200).json({ message: "OTP sent successfully." });
//   } catch (err) {
//     res.status(500).json({ message: "Error sending OTP", error: err.message });
//   }
// };

// exports.verifyOtp = async (req, res) => {
//   const { contact, otp } = req.body;

//   try {
//     const user = await User.findOne({ contact });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     if (user.resetOTP !== otp || new Date() > user.otpExpires) {
//       return res.status(400).json({ message: "Invalid or expired OTP." });
//     }

//     user.isVerified = true;
//     user.resetOTP = null;
//     user.otpExpires = null;
//     await user.save();

//     res.status(200).json({ message: "Account verified successfully. You can now log in." });
//   } catch (err) {
//     res.status(500).json({ message: "Error verifying OTP", error: err.message });
//   }
// };

// exports.registerUser = async (req, res) => {
//   try {
//     const { firstName, familyName, contact, password } = req.body;

//     // Ensure contact field is filled
//     if (!contact) {
//       return res.status(400).json({ message: "Please provide either an email or phone number." });
//     }

//     // Check if contact is already registered
//     const existingUser = await User.findOne({ contact });
//     if (existingUser) {
//       return res.status(400).json({ message: "This email or phone number is already registered." });
//     }
//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create new user with `isVerified` set to false
//     const newUser = new User({
//       firstName,
//       familyName,
//       contact,
//       password: hashedPassword,
//       isVerified: false,
//     });

//     await newUser.save();

//     // Send OTP
//     await sendOtp(newUser);

//     res.status(201).json({ message: "User registered. OTP sent for verification." });
//   } catch (err) {
//     res.status(500).json({ message: "Error registering user", error: err.message });
//   }
// };


// // تسجيل دخول المستخدم
// exports.loginUser = async (req, res) => {
//   try {
//     const { contact, password } = req.body;

//     // Ensure contact is provided
//     if (!contact) {
//       return res.status(400).json({ message: "Please provide either an email or phone number." });
//     }

//     // Find user by contact
//     const user = await User.findOne({ contact });
//     if (!user) {
//       return res.status(400).json({ message: "Invalid credentials." });
//     }

//     // Check password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid credentials." });
//     }

//     // Ensure user is verified before logging in
//     if (!user.isVerified) {
//       return res.status(403).json({ message: "You must verify your account first." });
//     }

//     // Generate JWT token
//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

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
