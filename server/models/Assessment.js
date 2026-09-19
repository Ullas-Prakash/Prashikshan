const mongoose = require('mongoose');

const assessmentQuestionSchema = new mongoose.Schema({
  skill: String,
  prompt: String,
  options: [String],
  answer: String,
}, { _id: false });

const resultSchema = new mongoose.Schema({
  skill: { type: String, trim: true, lowercase: true },
  score: { type: Number, min: 0 },
  total: { type: Number, min: 0 },
  percentage: { type: Number, min: 0, max: 100 },
  // Standardized 3-tier competency levels aligned with User.skillProfile
  level: { type: String, enum: ['beginner', 'intermediate', 'legend'], default: 'beginner' },
}, { _id: false });

const assessmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questions: { type: [assessmentQuestionSchema], required: true },
  results: { type: [resultSchema], default: [] },
  status: { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' },
  expiresAt: { type: Date, required: true },
  completedAt: { type: Date },
}, { timestamps: true });

assessmentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
module.exports = mongoose.model('Assessment', assessmentSchema);
