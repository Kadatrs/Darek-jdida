const mongoose = require("mongoose");

const WorkerSchema = new mongoose.Schema({
  firstName: { type: String },
  familyName: { type: String },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String  },
  password: { type: String, required:true }, // Not required for Google login
  googleId: { type: String }, // Only required for Google login
  //profilePicture: { type: String }, // Optional
  createdAt: { type: Date, default: Date.now },
  resetOTP: { type: String, default: null },
  otpExpires: { type: Date, default: null },

  verificationOTP: {  // ✅ For email & phone OTPs during registration
    type: Object,
    default: { email: null, phone: null }
  },

  isVerified: { type: Boolean, default: false }
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
