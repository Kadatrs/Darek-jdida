
const { body, validationResult } = require("express-validator");

exports.registerValidation = [
  body("firstName")
    .isLength({ min: 2 }).withMessage("First name must be at least 2 characters long")
    .matches(/^[\p{L} ]+$/u).withMessage("First name must contain letters only"),

  body("familyName")
    .isLength({ min: 2 }).withMessage("Last name must be at least 2 characters long")
    .matches(/^[\p{L} ]+$/u).withMessage("Last name must contain letters only"),

  body("email")
    .optional()
    .isEmail().withMessage("Please enter a valid email address")
    .normalizeEmail(),

  body("phoneNumber")
    .optional()
    .matches(/^(00213|\+213|0)(5|6|7)[0-9]{8}$/)
    .withMessage("Please enter a valid Algerian phone number"),

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

  body("job_type")
    .isString().withMessage("Job type must be a string")
    .notEmpty().withMessage("Job type is required"),

  body("experience_years")
    .optional()
    .isNumeric().withMessage("Experience years must be a number")
    .isInt({ min: 0 }).withMessage("Experience years must be at least 0"),

  body("profile_image_url")
    .optional()
    .isURL().withMessage("Profile image URL must be a valid URL"),

  body("address.latitude")
    .optional()
    .isNumeric().withMessage("Latitude must be a number"),

  body("address.longitude")
    .optional()
    .isNumeric().withMessage("Longitude must be a number"),

  body("address.full_address")
    .optional()
    .isString().withMessage("Full address must be a string"),
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
