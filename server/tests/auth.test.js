const test = require('node:test');
const assert = require('node:assert/strict');
const { hashPassword, verifyPassword, signToken, requireAuth } = require('../lib/auth');

test('password hashes verify without retaining plaintext', async () => {
  const hash = await hashPassword('A-longer-test-password');
  assert.notEqual(hash, 'A-longer-test-password');
  assert.equal(await verifyPassword('A-longer-test-password', hash), true);
  assert.equal(await verifyPassword('wrong-password', hash), false);
});

test('signed token is accepted by the auth middleware', () => {
  const token = signToken({ _id: { toString: () => '507f1f77bcf86cd799439011' }, role: 'student' });
  const req = { headers: { authorization: `Bearer ${token}` } };
  let nextCalled = false;
  requireAuth(req, {}, () => { nextCalled = true; });
  assert.equal(nextCalled, true);
  assert.equal(req.auth.role, 'student');
});
