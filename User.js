
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: { type: String },
  familyName: { type: String },
  email: { type: String, unique: true, sparse: true },
  phoneNumber: { type: String, unique: true, sparse: true },
  password: { type: String, required:true }, 
  googleId: { type: String }, 
  createdAt: { type: Date, default: Date.now },
  resetOTP: { type: String, default: null },
  otpExpires: { type: Date, default: null }
},
{ timestamps: true }
);





UserSchema.pre("save", function (next) {
  if (!this.password && !this.googleId) {
    return next(new Error("Either password or googleId must be provided"));
  }
  next();
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
