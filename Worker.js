const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const workerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: {
    type: String,
    required: true,
    match: /^(00213|\+213|0)(5|6|7)[0-9]{8}$/
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  wilaya: { type: String, required: true },
  workType: {
    type: String,
    required: true,
    enum: ['Plombier', 'Électricien', 'Menuisier', 'Peintre', 'Maçon', 'Jardinier', 'Climatisation', 'Serrurier', 'Carreleur', 'Vitrier']
  },
  isAvailable: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// تشفير كلمة المرور قبل الحفظ
workerSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('Worker', workerSchema);