const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, trim: true, uppercase: true },
  title: { type: String, required: true, trim: true },
  summary: { type: String, required: true, maxlength: 800 },
  skills: { type: [String], required: true },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  hours: { type: Number, min: 1, required: true },
  credits: { type: Number, min: 1, max: 12, required: true },
  provider: { type: String, default: 'Prashikshan Learning Hub' },
  modules: { type: [String], default: [] },
  published: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
