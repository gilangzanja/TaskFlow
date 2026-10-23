import test from 'node:test';
import assert from 'node:assert/strict';

import { getAuthValidationError } from '../assets/js/features/authValidation.js';

test('requires an email address', () => {
  assert.equal(getAuthValidationError('', 'password123'), 'Enter a valid email address.');
});

test('rejects malformed email addresses', () => {
  assert.equal(getAuthValidationError('not-an-email', 'password123'), 'Enter a valid email address.');
});

test('requires passwords with at least eight characters', () => {
  assert.equal(getAuthValidationError('user@example.com', 'short'), 'Password must be at least 8 characters.');
});

test('accepts valid credentials after trimming the email', () => {
  assert.equal(getAuthValidationError(' user@example.com ', 'password123'), null);
});

test('rejects values that are not strings', () => {
  assert.equal(getAuthValidationError({ email: 'user@example.com' }, 123), 'Enter a valid email address and password.');
});
