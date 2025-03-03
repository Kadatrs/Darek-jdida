const mongoose = require("mongoose");

const WorkerSchema = new mongoose.Schema({
  firstName: { type: String },
  familyName: { type: String },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true},
  password: { type: String, required:true }, // Not required for Google login
  googleId: { type: String }, // Only required for Google login
  //profilePicture: { type: String }, // Optional
  createdAt: { type: Date, default: Date.now },
  resetOTP: { type: String, default: null },
  otpExpires: { type: Date, default: null }
},
{ timestamps: true }
);

// Ensure either `password` or `googleId` exists
WorkerSchema.pre("save", function (next) {
  if (!this.password && !this.googleId) {
    return next(new Error("Either password or googleId must be provided"));
  }
  next();
});

const Worker = mongoose.model("Worker", WorkerSchema);
module.exports = Worker;
