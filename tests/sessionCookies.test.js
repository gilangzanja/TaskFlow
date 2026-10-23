import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ACCESS_COOKIE,
  clearSessionCookies,
  REFRESH_COOKIE,
  setSessionCookies,
} from '../server/sessionCookies.js';

test('sets bounded HttpOnly strict same-site cookies for production sessions', () => {
  const setCookies = [];
  const response = {
    cookie: (...args) => setCookies.push(args),
  };

  setSessionCookies(
    response,
    {
      access_token: 'access-value',
      refresh_token: 'refresh-value',
      expires_in: 7200,
    },
    true,
  );

  assert.equal(setCookies.length, 2);
  assert.equal(setCookies[0][0], ACCESS_COOKIE);
  assert.equal(setCookies[0][1], 'access-value');
  assert.deepEqual(
    {
      httpOnly: setCookies[0][2].httpOnly,
      secure: setCookies[0][2].secure,
      sameSite: setCookies[0][2].sameSite,
      path: setCookies[0][2].path,
      maxAge: setCookies[0][2].maxAge,
    },
    {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/api',
      maxAge: 60 * 60 * 1000,
    },
  );
  assert.equal(setCookies[1][0], REFRESH_COOKIE);
});

test('clears both cookies with matching security attributes', () => {
  const clearedCookies = [];
  const response = {
    clearCookie: (...args) => clearedCookies.push(args),
  };

  clearSessionCookies(response, true);

  assert.deepEqual(clearedCookies.map(([name]) => name), [ACCESS_COOKIE, REFRESH_COOKIE]);
  assert.equal(clearedCookies[0][1].httpOnly, true);
  assert.equal(clearedCookies[0][1].secure, true);
  assert.equal(clearedCookies[0][1].sameSite, 'strict');
  assert.equal(clearedCookies[0][1].path, '/api');
});
