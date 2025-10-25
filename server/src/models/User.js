const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String },
  passwordHash: { type: String },
  role: { type: String, enum: ['user', 'authority', 'admin'], default: 'user' },
  karmaPoints: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
