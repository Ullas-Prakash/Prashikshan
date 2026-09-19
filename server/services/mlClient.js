const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000/predict';
const TIMEOUT_MS = 2000;

function localFallbackTier(score) {
  const percentage = score > 1.0 ? score : score * 100;
  if (percentage >= 80) return 'legend';
  if (percentage >= 50) return 'intermediate';
  return 'beginner';
}

/**
 * Evaluates skill scores via Python ML service with resilient timeout and local fallback.
 * @param {Object} skillScores - Map of skill names to scores (0.0 to 1.0 or 0 to 100)
 * @returns {Promise<Object>} Map of skill names to tier labels ('beginner', 'intermediate', 'legend')
 */
async function predictSkillLevels(skillScores = {}) {
  const normalizedScores = {};
  for (const [key, val] of Object.entries(skillScores)) {
    const rawVal = Number(val);
    const num = Number.isFinite(rawVal) ? rawVal : 0;
    normalizedScores[key.toLowerCase().trim()] = num > 1.0 ? num / 100.0 : num;
  }

  try {
    const response = await axios.post(
      ML_SERVICE_URL,
      { skills: normalizedScores },
      { timeout: TIMEOUT_MS, headers: { 'Content-Type': 'application/json' } }
    );

    if (response.data && response.data.levels) {
      const levels = {};
      for (const [skill, level] of Object.entries(response.data.levels)) {
        const normLevel = String(level).toLowerCase();
        levels[skill] = ['beginner', 'intermediate', 'legend'].includes(normLevel) ? normLevel : localFallbackTier(normalizedScores[skill] || 0);
      }
      return levels;
    }
  } catch (error) {
    console.warn(`[ML Client] Flask service unreachable or timed out (${error.message}). Falling back to local deterministic scoring.`);
  }

  // Fallback to local rule-based evaluation
  const fallbackLevels = {};
  for (const [skill, score] of Object.entries(normalizedScores)) {
    fallbackLevels[skill] = localFallbackTier(score);
  }
  return fallbackLevels;
}

module.exports = { predictSkillLevels, localFallbackTier };
