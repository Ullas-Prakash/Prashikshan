'use strict';
const mongoose = require('mongoose');

// One entry per video the student has legitimately watched ≥90% of.
// completedAt is set by the backend when the track-video endpoint validates the claim.
const watchedVideoSchema = new mongoose.Schema({
  videoId:     { type: String, required: true },
  completedAt: { type: Date,   default: Date.now },
}, { _id: false });

const enrollmentSchema = new mongoose.Schema({
  student:       { type: mongoose.Schema.Types.ObjectId, ref: 'User',        required: true },
  course:        { type: mongoose.Schema.Types.ObjectId, ref: 'Course',      required: true },
  progress:      { type: Number, min: 0, max: 100, default: 0 },
  status:        { type: String, enum: ['enrolled', 'completed'], default: 'enrolled' },
  completedAt:   { type: Date },
  creditAwarded: { type: Boolean, default: false },

  // ── Completion-verification fields ─────────────────────────────────────
  estimatedHours:   { type: Number, default: 0 },
  startedAt:        { type: Date, default: Date.now },
  actualHoursSpent: { type: Number, default: 0 },
  certificateFile:  { type: String, default: '' },   // legacy proof-URL field
  completionNote:   { type: String, default: '' },

  // ── Strict video-tracking (Phase 2 / 3) ─────────────────────────────────
  // Backend-authoritative list of videos the student has watched ≥90% of.
  watchedVideos: { type: [watchedVideoSchema], default: [] },

  // Set once the Certificate document has been generated.
  certificateId: { type: String, default: '' },     // mirrors Certificate.certificateId
}, { timestamps: true });

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
module.exports = mongoose.model('Enrollment', enrollmentSchema);
