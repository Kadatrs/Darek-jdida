
const mongoose = require("mongoose");


const ReviewSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  review: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
}, { timestamps: true });


const WorkerSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
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

  isVerified: { type: Boolean, default: false },
  profile_image_url: { type: String, default: "" },
  address: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    full_address: { type: String, default: "" }
  },
  job_type: { type: String, required: true },
  experience_years: { type: Number, default: 0 },
  total_jobs_completed: { type: Number, default: 0 },
  average_rating: { type: Number, default: 0 },
  reviews: [{
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    review: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
  }],
  // verified: { type: Boolean, default: false },
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
