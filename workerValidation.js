const { body, validationResult } = require("express-validator");

exports.registerValidation = [
  body("email")
    .optional()
    .isEmail().withMessage("Please enter a valid email address")
    .normalizeEmail(),

  body("phoneNumber")
    .optional()
    .matches(/^(00213|\+213|0)(5|6|7)[0-9]{8}$/)
    .withMessage("Please enter a valid phone number"),

    
  body().custom((value, { req }) => {
    if (!req.body.email && !req.body.phoneNumber) {
      throw new Error("You must enter at least an email or phone number");
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
  body("email")
    .optional()
    .isEmail().withMessage("Please enter a valid email address")
    .normalizeEmail(),

  body("phoneNumber")
    .optional()
    .matches(/^(00213|\+213|0)(5|6|7)[0-9]{8}$/)
    .withMessage("Please enter a valid phone number"),


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