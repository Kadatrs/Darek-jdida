const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema({
  firstName: String,
  familyName: String,
  email: { type: String, unique: true, required: true },
  phoneNumber: { type: String, unique: true, required: true },
  password: String,
  isVerified: { type: Boolean, default: false },
  emailOTP: String,
  emailOtpExpires: Date,
  phoneOTP: String,
  phoneOtpExpires: Date,
});

module.exports = mongoose.model("Worker", workerSchema);
