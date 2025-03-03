const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    familyName: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    phoneNumber: { type: String, unique: true, sparse: true }, 
    password: { type: String, required: true },
    googleId: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    resetOTP: { type: String, default: null },
    otpExpires: { type: Date, default: null }
  },
  { timestamps: true }
);


UserSchema.pre("validate", function (next) {
  if (!this.email && !this.phoneNumber) {
    return next(new Error("Either email or phone number is required."));
  }
  if (this.email && this.phoneNumber) {
    return next(new Error("You can only provide either email or phone number, not both."));
  }
  next();
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
