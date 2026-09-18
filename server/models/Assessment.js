const mongoose = require('mongoose');

const assessmentQuestionSchema = new mongoose.Schema({
  skill: String,
  prompt: String,
  options: [String],
  answer: String,
}, { _id: false });

const resultSchema = new mongoose.Schema({
  skill: String,
  score: Number,
  total: Number,
  percentage: Number,
  level: String,
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
