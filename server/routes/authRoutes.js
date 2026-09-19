const express = require('express');
const User = require('../models/User');
const { hashPassword, verifyPassword, signToken, requireAuth } = require('../lib/auth');

const router = express.Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(user) {
  const data = user.toJSON ? user.toJSON() : user;
  return {
    id: data._id || data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    organization: data.organization,
    department: data.department,
    bio: data.bio,
    skills: data.skills || [],
    interests: data.interests || [],
    skillProfile: data.skillProfile || [],
    creditTotal: (data.credits || []).reduce((sum, item) => sum + item.credits, 0),
    credits: data.credits || [],
    isAssessed: Boolean(data.isAssessed),
    isVerifiedPartner: Boolean(data.isVerifiedPartner),
    createdAt: data.createdAt,
  };
}

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role = 'student', organization = '', department = '' } = req.body;
    if (!name?.trim() || !emailPattern.test(String(email || '').toLowerCase()) || typeof password !== 'string') {
      return res.status(400).json({ error: 'Please provide a name, a valid email address, and a password.' });
    }
    if (password.length < 8) return res.status(400).json({ error: 'Password must contain at least 8 characters.' });
    if (!['student', 'partner'].includes(role)) return res.status(400).json({ error: 'This account type cannot be created publicly.' });
    if (role === 'partner' && !organization.trim()) return res.status(400).json({ error: 'Organisation name is required for an industry account.' });

    const normalizedEmail = email.trim().toLowerCase();
    const exists = await User.exists({ email: normalizedEmail });
    if (exists) return res.status(409).json({ error: 'An account already exists for this email.' });

    const user = await User.create({
      name: name.trim(), email: normalizedEmail, passwordHash: await hashPassword(password), role,
      organization: organization.trim(), department: department.trim(), isVerifiedPartner: false,
    });
    return res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
});

router.post('/bootstrap-coordinator', async (req, res, next) => {
  try {
    const { name, email, password, inviteCode, organization = 'Prashikshan' } = req.body;
    if (!process.env.COORDINATOR_INVITE_CODE || inviteCode !== process.env.COORDINATOR_INVITE_CODE) {
      return res.status(403).json({ error: 'A valid coordinator invite code is required.' });
    }
    if (!name?.trim() || !emailPattern.test(String(email || '').toLowerCase()) || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Provide a name, valid email, and password of at least 8 characters.' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ error: 'An account already exists for this email.' });
    const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash: await hashPassword(password), role: 'coordinator', organization: organization.trim(), isVerifiedPartner: true });
    return res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email || '').trim().toLowerCase() }).select('+passwordHash');
    if (!user || !(await verifyPassword(password || '', user.passwordHash))) return res.status(401).json({ error: 'Invalid email or password.' });
    return res.json({ token: signToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.auth.sub);
    if (!user) return res.status(401).json({ error: 'Your account no longer exists.' });
    return res.json({ user: publicUser(user) });
  } catch (error) { next(error); }
});

router.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.auth.sub);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const fields = ['name', 'department', 'bio', 'interests'];
    for (const field of fields) if (req.body[field] !== undefined) user[field] = req.body[field];
    if (user.role === 'partner' && req.body.organization !== undefined) user.organization = req.body.organization;
    await user.save();
    return res.json({ user: publicUser(user) });
  } catch (error) { next(error); }
});

module.exports = { router, publicUser };
