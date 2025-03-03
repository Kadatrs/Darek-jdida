const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    familyName: { type: String, required: true },
    email: { type: String, unique: true, sparse: true, required: false },
    phoneNumber: { type: String, unique: true, sparse: true, required: false },
    password: { type: String, required: true },
    googleId: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    resetOTP: { type: String, default: null },
    otpExpires: { type: Date, default: null }
  },
  { timestamps: true }
);

function validateOneExists(value, helpers) {
  if (!value.email && !value.phoneNumber) {
    throw new Error("Either email or phone number is required.");
  }
  if (value.email && value.phoneNumber) {
    throw new Error("You can only provide either email or phone number, not both.");
  }
}

UserSchema.pre("validate", function (next) {
  try {
    validateOneExists(this);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
