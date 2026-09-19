const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  skill: { type: String, required: true },
  prompt: { type: String, required: true },
  options: [{ type: String, required: true }],
  answer: { type: String, required: true },
}, { _id: false });

const dailyRevisionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true, index: true }, // Format YYYY-MM-DD
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  questions: [questionSchema],
  score: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  creditAwarded: { type: Boolean, default: false },
}, { timestamps: true });

dailyRevisionSchema.index({ student: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyRevision', dailyRevisionSchema);
