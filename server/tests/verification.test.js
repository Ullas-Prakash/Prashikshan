const test = require('node:test');
const assert = require('node:assert/strict');
const { predictSkillLevels, localFallbackTier } = require('../services/mlClient');

test('localFallbackTier correctly categorizes scores into 3 tiers', () => {
  assert.equal(localFallbackTier(0.40), 'beginner');
  assert.equal(localFallbackTier(0.50), 'intermediate');
  assert.equal(localFallbackTier(0.79), 'intermediate');
  assert.equal(localFallbackTier(0.80), 'legend');
  assert.equal(localFallbackTier(95), 'legend');
});

test('mlClient transparently falls back to local scoring when Flask service is offline', async () => {
  const result = await predictSkillLevels({
    javascript: 0.85,
    react: 0.40,
    python: 0.65,
    nodejs: 0.90
  });

  assert.equal(result.javascript, 'legend');
  assert.equal(result.react, 'beginner');
  assert.equal(result.python, 'intermediate');
  assert.equal(result.nodejs, 'legend');
});
