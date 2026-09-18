const express = require('express');
const Internship = require('../models/Internship');
const Application = require('../models/Application');
const User = require('../models/User');
const { requireAuth, allowRoles } = require('../lib/auth');

const router = express.Router();
const normalize = (value) => String(value || '').trim().toLowerCase();
const allowedStatuses = ['shortlisted', 'interview', 'offered', 'accepted', 'rejected', 'in-progress', 'completed'];

function presentation(internship, userSkills = []) {
  const data = internship.toJSON ? internship.toJSON() : internship;
  const matches = data.skills.filter((skill) => userSkills.includes(normalize(skill))).length;
  return { ...data, matchScore: userSkills.length ? Math.round((matches / Math.max(data.skills.length, 1)) * 100) : 0 };
}

router.get('/', async (req, res, next) => {
  try {
    const query = { status: 'published', verified: true, deadline: { $gte: new Date() } };
    if (req.query.skill) query.skills = normalize(req.query.skill);
    if (req.query.mode) query.mode = req.query.mode;
    if (req.query.location) query.location = new RegExp(String(req.query.location), 'i');
    if (req.query.search) query.$or = [{ title: new RegExp(String(req.query.search), 'i') }, { organization: new RegExp(String(req.query.search), 'i') }];
    const internships = await Internship.find(query).sort({ createdAt: -1 });
    return res.json({ internships });
  } catch (error) { next(error); }
});

router.get('/recommended', requireAuth, allowRoles('student'), async (req, res, next) => {
  try {
    const user = await User.findById(req.auth.sub);
    const skills = [...user.skills, ...user.skillProfile.map((item) => item.skill)].map(normalize);
    const internships = await Internship.find({ status: 'published', verified: true, deadline: { $gte: new Date() } });
    return res.json({ internships: internships.map((internship) => presentation(internship, skills)).sort((a, b) => b.matchScore - a.matchScore) });
  } catch (error) { next(error); }
});

router.get('/mine', requireAuth, allowRoles('partner'), async (req, res, next) => {
  try {
    const internships = await Internship.find({ postedBy: req.auth.sub }).sort({ updatedAt: -1 });
    return res.json({ internships });
  } catch (error) { next(error); }
});

router.get('/applications/mine', requireAuth, allowRoles('student'), async (req, res, next) => {
  try {
    const applications = await Application.find({ student: req.auth.sub }).populate('internship').sort({ updatedAt: -1 });
    return res.json({ applications });
  } catch (error) { next(error); }
});

router.get('/applications/received', requireAuth, allowRoles('partner'), async (req, res, next) => {
  try {
    const internships = await Internship.find({ postedBy: req.auth.sub }).select('_id');
    const applications = await Application.find({ internship: { $in: internships.map((item) => item._id) } }).populate('internship').populate('student', 'name email skills skillProfile').sort({ updatedAt: -1 });
    return res.json({ applications });
  } catch (error) { next(error); }
});

router.post('/', requireAuth, allowRoles('partner'), async (req, res, next) => {
  try {
    const partner = await User.findById(req.auth.sub);
    if (!partner.isVerifiedPartner) return res.status(403).json({ error: 'Your organisation must be verified by a coordinator before it can post internships.' });
    const { title, description, skills, location, mode, durationWeeks, stipend, credits, capacity, deadline } = req.body;
    if (!title?.trim() || !description?.trim() || !Array.isArray(skills) || !skills.length || !location?.trim() || !deadline) {
      return res.status(400).json({ error: 'Complete the title, description, skills, location, and deadline.' });
    }
    const internship = await Internship.create({ title: title.trim(), organization: partner.organization, postedBy: partner._id, description: description.trim(), skills: skills.map(normalize), location: location.trim(), mode, durationWeeks, stipend, credits, capacity, deadline, status: 'pending', verified: false });
    return res.status(201).json({ internship, message: 'Submitted for coordinator verification.' });
  } catch (error) { next(error); }
});

router.post('/:id/apply', requireAuth, allowRoles('student'), async (req, res, next) => {
  try {
    const internship = await Internship.findOne({ _id: req.params.id, status: 'published', verified: true, deadline: { $gte: new Date() } });
    if (!internship) return res.status(404).json({ error: 'This verified internship is not available.' });
    const application = await Application.create({ internship: internship._id, student: req.auth.sub, coverLetter: String(req.body.coverLetter || ''), timeline: [{ status: 'applied', note: 'Application submitted', actor: req.auth.sub }] });
    return res.status(201).json({ application });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ error: 'You have already applied for this internship.' });
    return next(error);
  }
});

router.patch('/applications/:id', requireAuth, allowRoles('partner', 'coordinator'), async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).populate('internship');
    if (!application) return res.status(404).json({ error: 'Application not found.' });
    if (req.auth.role === 'partner' && String(application.internship.postedBy) !== req.auth.sub) return res.status(403).json({ error: 'You can only manage applications to your own internships.' });
    const { status, progress, mentorNote, grade, note = '' } = req.body;
    if (status !== undefined && !allowedStatuses.includes(status)) return res.status(400).json({ error: 'Invalid application status.' });
    if (progress !== undefined && (!Number.isFinite(Number(progress)) || Number(progress) < 0 || Number(progress) > 100)) return res.status(400).json({ error: 'Progress must be between 0 and 100.' });
    if (status) application.status = status;
    if (progress !== undefined) application.progress = Number(progress);
    if (mentorNote !== undefined) application.mentorNote = String(mentorNote);
    if (grade !== undefined) application.grade = grade;
    if (application.status === 'completed') {
      application.progress = 100;
      if (!application.creditsAwarded) {
        const user = await User.findById(application.student);
        user.credits.push({ sourceType: 'internship', sourceId: application.internship._id, title: application.internship.title, credits: application.internship.credits, grade: application.grade || 'Completed' });
        await user.save();
        application.creditsAwarded = true;
      }
    }
    if (status || note) application.timeline.push({ status: application.status, note: String(note), actor: req.auth.sub });
    await application.save();
    return res.json({ application });
  } catch (error) { next(error); }
});

module.exports = router;
