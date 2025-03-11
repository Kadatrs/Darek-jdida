
const mongoose = require("mongoose");


const ReviewSchema = new mongoose.Schema({
  service_provider_id: { type: mongoose.Schema.Types.ObjectId, ref: "Worker", required: true },
  review: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
}, { timestamps: true });



const UserSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  firstName: { type: String, required: function () { return !this.googleId; }, trim: true }, 
  familyName: { type: String, required: function () { return !this.googleId; }, trim: true }, 
  name: { type: String, default: "", trim: true }, 

  contact: { 
    type: String, 
    unique: true, 
    required: function () { return !this.googleId; }, 
    trim: true, 
    sparse: true
  },

  password: { type: String, required: function () { return !this.googleId; } }, 
  googleId: { type: String, default: null }, 
  createdAt: { type: Date, default: Date.now }, 
  isVerified: { type: Boolean, default: false }, 
  resetOTP: { type: String, default: null }, 
  otpExpires: { type: Date, default: null }, 
  profile_image_url: { type: String, default: "" },
  address: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    full_address: { type: String, default: "" }
  },
  total_requests: { type: Number, default: 0 },
  completed_requests: { type: Number, default: 0 },
  average_rating: { type: Number, default: 0 },
  reviews: [ReviewSchema],
  verified: { type: Boolean, default: false },

}, { timestamps: true });

// ✅ تحديث `name` عند تعديل `firstName` أو `familyName`
UserSchema.pre("save", function (next) {
  if (this.isModified("firstName") || this.isModified("familyName")) {
    this.name = `${this.firstName} ${this.familyName}`.trim();
  }
  next();
});

// ✅ التحقق من صحة `contact` (يجب أن يكون بريدًا إلكترونيًا أو رقم هاتف جزائري)
UserSchema.pre("validate", function (next) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^(00213|\+213|0)(5|6|7)[0-9]{8}$/;

  if (!this.googleId) {
    // ✅ تأكد من أن `contact` ليس فارغًا أو يحتوي فقط على مسافات بيضاء
    if (!this.contact || !this.contact.trim()) {
      return next(new Error("Contact is required."));
    }

    // ✅ التحقق مما إذا كان `contact` ليس بريدًا إلكترونيًا أو رقم هاتف صحيحًا
    if (!emailRegex.test(this.contact) && !phoneRegex.test(this.contact)) {
      return next(new Error("Contact must be either a valid email or phone number."));
    }
  }

  next();
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
