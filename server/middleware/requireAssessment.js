const User = require('../models/User');

async function requireAssessment(req, res, next) {
  try {
    if (!req.auth || !req.auth.sub) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    const user = await User.findById(req.auth.sub);
    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }
    if (user.role === 'student' && !user.isAssessed) {
      return res.status(403).json({ error: 'Initial skill assessment required before enrolling in courses or applying for internships.' });
    }
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = requireAssessment;
