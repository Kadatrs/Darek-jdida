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