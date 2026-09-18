const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 140 },
  organization: { type: String, required: true, trim: true, maxlength: 120 },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: { type: String, required: true, trim: true, maxlength: 3000 },
  skills: { type: [String], required: true },
  location: { type: String, required: true, trim: true },
  mode: { type: String, enum: ['remote', 'hybrid', 'onsite'], default: 'remote' },
  durationWeeks: { type: Number, required: true, min: 1, max: 104 },
  stipend: { type: Number, min: 0, default: 0 },
  credits: { type: Number, min: 1, max: 20, default: 4 },
  capacity: { type: Number, min: 1, default: 1 },
  deadline: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'published', 'rejected', 'closed'], default: 'pending' },
  verified: { type: Boolean, default: false },
  verificationNote: { type: String, default: '' },
}, { timestamps: true });

internshipSchema.index({ status: 1, verified: 1, deadline: 1 });
module.exports = mongoose.model('Internship', internshipSchema);
