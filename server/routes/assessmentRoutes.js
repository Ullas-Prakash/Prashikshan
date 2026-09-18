const express = require('express');
const Assessment = require('../models/Assessment');
const User = require('../models/User');
const { getMixedQuiz } = require('../services/quizService');
const { requireAuth, allowRoles } = require('../lib/auth');

const router = express.Router();
const normalizeSkill = (skill) => String(skill || '').trim().toLowerCase();
const levelFromScore = (score) => score >= 80 ? 'advanced' : score >= 50 ? 'intermediate' : 'beginner';

router.post('/start', requireAuth, allowRoles('student'), async (req, res, next) => {
  try {
    const skills = [...new Set((req.body.skills || []).map(normalizeSkill).filter(Boolean))].slice(0, 5);
    if (!skills.length) return res.status(400).json({ error: 'Select at least one skill to begin the assessment.' });
    const questions = skills.flatMap((skill) => getMixedQuiz(skill).map((question) => ({ skill, prompt: question.question, options: question.options, answer: question.answer })));
    if (!questions.length) return res.status(400).json({ error: 'Questions are not available for the selected skills.' });
    const assessment = await Assessment.create({ student: req.auth.sub, questions, expiresAt: new Date(Date.now() + 30 * 60 * 1000) });
    return res.status(201).json({ assessmentId: assessment.id, expiresAt: assessment.expiresAt, questions: assessment.questions.map((question, index) => ({ id: index, skill: question.skill, prompt: question.prompt, options: question.options })) });
  } catch (error) { next(error); }
});

router.post('/:id/submit', requireAuth, allowRoles('student'), async (req, res, next) => {
  try {
    const assessment = await Assessment.findOne({ _id: req.params.id, student: req.auth.sub });
    if (!assessment) return res.status(404).json({ error: 'Assessment not found.' });
    if (assessment.status === 'completed') return res.status(409).json({ error: 'This assessment has already been submitted.' });
    if (assessment.expiresAt < new Date()) return res.status(410).json({ error: 'This assessment has expired. Please start again.' });
    const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
    const answerById = new Map(answers.map((answer) => [Number(answer.id), answer.value]));
    if (assessment.questions.some((_question, index) => !answerById.has(index))) return res.status(400).json({ error: 'Answer every question before submitting.' });
    const buckets = new Map();
    assessment.questions.forEach((question, index) => {
      const current = buckets.get(question.skill) || { skill: question.skill, score: 0, total: 0 };
      current.total += 1;
      if (answerById.get(index) === question.answer) current.score += 1;
      buckets.set(question.skill, current);
    });
    const results = [...buckets.values()].map((item) => {
      const percentage = Math.round((item.score / item.total) * 100);
      return { ...item, percentage, level: levelFromScore(percentage) };
    });
    assessment.results = results;
    assessment.status = 'completed';
    assessment.completedAt = new Date();
    await assessment.save();
    const user = await User.findById(req.auth.sub);
    for (const result of results) {
      const existing = user.skillProfile.find((skill) => skill.skill === result.skill);
      if (existing) Object.assign(existing, { level: result.level, score: result.percentage, assessedAt: new Date() });
      else user.skillProfile.push({ skill: result.skill, level: result.level, score: result.percentage });
    }
    user.skills = [...new Set([...user.skills.map(normalizeSkill), ...results.map((result) => result.skill)])];
    user.credits.push({ sourceType: 'assessment', sourceId: assessment._id, title: 'Skill assessment', credits: 1, grade: 'Completed' });
    await user.save();
    return res.json({ results, creditAwarded: 1 });
  } catch (error) { next(error); }
});

router.get('/history/me', requireAuth, allowRoles('student'), async (req, res, next) => {
  try {
    const assessments = await Assessment.find({ student: req.auth.sub, status: 'completed' }).select('results completedAt').sort({ completedAt: -1 }).limit(12);
    return res.json({ assessments });
  } catch (error) { next(error); }
});

module.exports = router;
