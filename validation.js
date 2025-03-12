
// const { body, validationResult } = require("express-validator");

// // ✅ التحقق من البيانات عند تسجيل مستخدم جديد
// exports.registerValidation = [
//   body("email")
//     .optional()
//     .isEmail().withMessage("يرجى إدخال بريد إلكتروني صالح")
//     .normalizeEmail(),

//   body("phoneNumber")
//     .optional()
//     .matches(/^(00213|\+213|0)(5|6|7)[0-9]{8}$/)
//     .withMessage("يرجى إدخال رقم هاتف جزائري صالح"),

//   body("password")
//     .isLength({ min: 6 }).withMessage("يجب أن تكون كلمة المرور مكونة من 6 أحرف على الأقل")
//     .matches(/[0-9]/).withMessage("يجب أن تحتوي كلمة المرور على رقم")
//     .matches(/[a-zA-Z]/).withMessage("يجب أن تحتوي كلمة المرور على حرف"),

//   body("firstName")
//     .matches(/^[\p{L} ]+$/u).withMessage("الاسم الأول يجب أن يحتوي على أحرف فقط"),

//   body("familyName")
//     .matches(/^[\p{L} ]+$/u).withMessage("اسم العائلة يجب أن يحتوي على أحرف فقط"),
// ];

// // ✅ التحقق من البيانات عند تسجيل الدخول
// exports.loginValidation = [
//   body("email")
//     .optional()
//     .isEmail().withMessage("يرجى إدخال بريد إلكتروني صالح")
//     .normalizeEmail(),

//   body("phoneNumber")  // ❌ كان مكتوب "phone" بدلاً من "phoneNumber"
//     .optional()
//     .matches(/^(00213|\+213|0)(5|6|7)[0-9]{8}$/)
//     .withMessage("يرجى إدخال رقم هاتف جزائري صالح"),

//   body("password")
//     .isLength({ min: 6 }).withMessage("يجب أن تكون كلمة المرور مكونة من 6 أحرف على الأقل")
//     .matches(/[0-9]/).withMessage("يجب أن تحتوي كلمة المرور على رقم")
//     .matches(/[a-zA-Z]/).withMessage("يجب أن تحتوي كلمة المرور على حرف"),
// ];


// exports.resetPasswordValidation = [
//   body("contact")
//     .notEmpty().withMessage("يرجى إدخال بريد إلكتروني أو رقم هاتف"),

//   body("otp")
//     .notEmpty().withMessage("يرجى إدخال رمز OTP الصحيح"),

//   body("newPassword")
//     .isLength({ min: 6 }).withMessage("يجب أن تكون كلمة المرور مكونة من 6 أحرف على الأقل")
//     .matches(/[0-9]/).withMessage("يجب أن تحتوي كلمة المرور على رقم")
//     .matches(/[a-zA-Z]/).withMessage("يجب أن تحتوي كلمة المرور على حرف"),
// ];



// // ✅ التحقق من الأخطاء في البيانات
// exports.handleValidationErrors = (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }
//   next();
// };

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------

// const { body, validationResult } = require("express-validator");

// exports.registerValidation = [
//   body("email")
//     .optional()
//     .isEmail().withMessage("يرجى إدخال بريد إلكتروني صالح")
//     .normalizeEmail(),

//   body("phoneNumber")
//     .optional()
//     .matches(/^(00213|\+213|0)(5|6|7)[0-9]{8}$/)
//     .withMessage("يرجى إدخال رقم هاتف جزائري صالح"),

//   body("password")
//     .isLength({ min: 6 }).withMessage("يجب أن تكون كلمة المرور مكونة من 6 أحرف على الأقل")
//     .matches(/[0-9]/).withMessage("يجب أن تحتوي كلمة المرور على رقم")
//     .matches(/[a-zA-Z]/).withMessage("يجب أن تحتوي كلمة المرور على حرف"),

//   body("firstName")
//     .matches(/^[\p{L} ]+$/u).withMessage("الاسم الأول يجب أن يحتوي على أحرف فقط"),

//   body("familyName")
//     .matches(/^[\p{L} ]+$/u).withMessage("اسم العائلة يجب أن يحتوي على أحرف فقط"),
// ];

// exports.loginValidation = [
//   body("email")
//     .optional()
//     .isEmail().withMessage("يرجى إدخال بريد إلكتروني صالح")
//     .normalizeEmail(),

//   body("phoneNumber")  // ❌ كان مكتوب "phone" بدلاً من "phoneNumber"
//     .optional()
//     .matches(/^(00213|\+213|0)(5|6|7)[0-9]{8}$/)
//     .withMessage("يرجى إدخال رقم هاتف جزائري صالح"),

//   body("password")
//     .isLength({ min: 6 }).withMessage("يجب أن تكون كلمة المرور مكونة من 6 أحرف على الأقل")
//     .matches(/[0-9]/).withMessage("يجب أن تحتوي كلمة المرور على رقم")
//     .matches(/[a-zA-Z]/).withMessage("يجب أن تحتوي كلمة المرور على حرف"),
// ];

// // ✅ Forgot Password Validation (Step 1)
// exports.forgotPasswordValidation = [
//   body("contact")
//     .notEmpty().withMessage("Please provide either an email or phone number"),
// ];

// // ✅ Verify OTP Validation (Step 2)
// exports.verifyOtpValidation = [
//   body("contact")
//     .notEmpty().withMessage("Please provide either an email or phone number"),

//   body("otp")
//     .notEmpty().withMessage("Please enter the OTP code"),
// ];

// // ✅ Reset Password Validation (Step 3)
// exports.resetPasswordValidation = [
//   body("contact")
//     .notEmpty().withMessage("Please provide either an email or phone number"),

//   body("otp")
//     .notEmpty().withMessage("Please enter the OTP code"),

//   body("newPassword")
//     .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
//     .matches(/[0-9]/).withMessage("Password must contain at least one number")
//     .matches(/[a-zA-Z]/).withMessage("Password must contain at least one letter"),
// ];

// // ✅ Handle Validation Errors
// exports.handleValidationErrors = (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }
//   next();
// };


const { body, validationResult } = require("express-validator");

exports.registerValidation = [
  body("contact")
  .notEmpty().withMessage("Contact is required") 
  .custom(value => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(00213|\+213|0)(5|6|7)[0-9]{8}$/;
    if (!emailRegex.test(value) && !phoneRegex.test(value)) {
      throw new Error("Please enter a valid email or phone number."); //riadh
    }
    return true;
  }),

  body("password")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
    .matches(/[0-9]/).withMessage("Password must contain a number")
    .matches(/[a-zA-Z]/).withMessage("Password must contain a letter"),

  body("firstName")
    .matches(/^[\p{L} ]+$/u).withMessage("First name must contain letters only"),

  body("familyName")
    .matches(/^[\p{L} ]+$/u).withMessage("Last name must contain letters only"),
];



exports.loginValidation = [
  body("contact")
  .notEmpty().withMessage("Contact is required") 
  .custom(value => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(00213|\+213|0)(5|6|7)[0-9]{8}$/;
    if (!emailRegex.test(value) && !phoneRegex.test(value)) {
      throw new Error("Please enter a valid email or phone number."); //riadh
    }
    return true;
  }),

  body("password")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
    .matches(/[0-9]/).withMessage("Password must contain a number")
    .matches(/[a-zA-Z]/).withMessage("Password must contain a letter"),
];

exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
