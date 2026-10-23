import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';

import { createApp } from '../server/app.js';

const config = {
  supabaseUrl: 'https://project.supabase.co',
  supabaseAnonKey: 'public-key',
  appOrigin: 'http://localhost:5173',
  port: 3000,
  isProduction: false,
};

let server;
let serverUrl;

before(async () => {
  server = createApp(config).listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  serverUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test('sets security headers and does not expose the Express signature', async () => {
  const response = await fetch(`${serverUrl}/api/not-found`);

  assert.equal(response.status, 404);
  assert.match(response.headers.get('content-security-policy'), /default-src 'self'/);
  assert.equal(response.headers.get('x-powered-by'), null);
});

test('rejects state-changing API requests from another origin', async () => {
  const response = await fetch(`${serverUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      Origin: 'https://attacker.example',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { error: 'Request origin is not allowed.' });
});

test('validates malformed registration input before calling Supabase', async () => {
  const response = await fetch(`${serverUrl}/api/auth/register`, {
    method: 'POST',
    headers: {
      Origin: config.appOrigin,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: { invalid: true }, password: 1 }),
  });

  assert.equal(response.status, 422);
  assert.deepEqual(await response.json(), {
    error: 'Enter a valid email address and password.',
  });
});

test('returns an empty session without treating a signed-out user as a server error', async () => {
  const response = await fetch(`${serverUrl}/api/auth/session`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { user: null });
});

test('rejects task access when no session cookies are present', async () => {
  const response = await fetch(`${serverUrl}/api/tasks`);

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: 'Sign in to continue.' });
});

test('rate-limits repeated registration requests', async () => {
  const responses = [];

  for (let attempt = 0; attempt < 12; attempt += 1) {
    responses.push(
      await fetch(`${serverUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          Origin: config.appOrigin,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'invalid', password: 'short' }),
      }),
    );
  }

  assert.ok(responses.some((response) => response.status === 429));
});
