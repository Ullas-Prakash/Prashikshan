const express = require('express');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const { requireAuth, allowRoles } = require('../lib/auth');

const router = express.Router();
const normalize = (value) => String(value || '').trim().toLowerCase();

router.get('/', async (req, res, next) => {
  try {
    const query = { published: true };
    if (req.query.level) query.level = req.query.level;
    if (req.query.skill) query.skills = normalize(req.query.skill);
    const courses = await Course.find(query).sort({ level: 1, title: 1 });
    return res.json({ courses });
  } catch (error) { next(error); }
});

router.get('/recommended', requireAuth, allowRoles('student'), async (req, res, next) => {
  try {
    const user = await User.findById(req.auth.sub);
    const courses = await Course.find({ published: true });
    const enrollmentIds = new Set((await Enrollment.find({ student: user._id }).select('course')).map((enrollment) => String(enrollment.course)));
    const profile = new Map(user.skillProfile.map((item) => [item.skill, item]));
    const interests = user.interests.map(normalize);
    const ranked = courses.map((course) => {
      const matches = course.skills.filter((skill) => profile.has(normalize(skill)) || interests.includes(normalize(skill))).length;
      const growthNeed = course.skills.reduce((score, skill) => score + (100 - (profile.get(normalize(skill))?.score || 0)), 0) / course.skills.length;
      return { ...course.toJSON(), matchScore: Math.round(matches * 30 + growthNeed / 5), enrolled: enrollmentIds.has(course.id) };
    }).sort((a, b) => b.matchScore - a.matchScore);
    return res.json({ courses: ranked });
  } catch (error) { next(error); }
});

router.get('/me/enrollments', requireAuth, allowRoles('student'), async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ student: req.auth.sub }).populate('course').sort({ updatedAt: -1 });
    return res.json({ enrollments });
  } catch (error) { next(error); }
});

router.post('/', requireAuth, allowRoles('coordinator'), async (req, res, next) => {
  try {
    const course = await Course.create({ ...req.body, skills: (req.body.skills || []).map(normalize) });
    return res.status(201).json({ course });
  } catch (error) { next(error); }
});

router.post('/:courseId/enroll', requireAuth, allowRoles('student'), async (req, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.courseId, published: true });
    if (!course) return res.status(404).json({ error: 'Course not found.' });
    const enrollment = await Enrollment.create({ student: req.auth.sub, course: course._id });
    return res.status(201).json({ enrollment: await enrollment.populate('course') });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ error: 'You are already enrolled in this course.' });
    return next(error);
  }
});

router.patch('/enrollments/:id', requireAuth, allowRoles('student'), async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findOne({ _id: req.params.id, student: req.auth.sub }).populate('course');
    if (!enrollment) return res.status(404).json({ error: 'Enrollment not found.' });
    const progress = Number(req.body.progress);
    if (!Number.isFinite(progress) || progress < 0 || progress > 100) return res.status(400).json({ error: 'Progress must be between 0 and 100.' });
    enrollment.progress = progress;
    if (progress === 100 && enrollment.status !== 'completed') {
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();
      if (!enrollment.creditAwarded) {
        const user = await User.findById(req.auth.sub);
        user.credits.push({ sourceType: 'course', sourceId: enrollment.course._id, title: enrollment.course.title, credits: enrollment.course.credits, grade: 'Completed' });
        await user.save();
        enrollment.creditAwarded = true;
      }
    }
    await enrollment.save();
    return res.json({ enrollment });
  } catch (error) { next(error); }
});

module.exports = router;
