import test from 'node:test';
import assert from 'node:assert/strict';

import { requireAuth } from '../server/authMiddleware.js';
import { REFRESH_COOKIE } from '../server/sessionCookies.js';

const config = {
  supabaseUrl: 'https://project.supabase.co',
  supabaseAnonKey: 'public-key',
  appOrigin: 'http://localhost:5173',
  isProduction: false,
};

test('refreshes an expired access cookie using the HttpOnly refresh cookie', async () => {
  let refreshTokenUsed;
  let refreshedCookies = 0;
  const request = {
    cookies: {
      [REFRESH_COOKIE]: 'valid-refresh-token',
    },
  };
  const response = {
    cookie: () => {
      refreshedCookies += 1;
    },
    clearCookie: () => {},
    json: () => {},
    status: () => response,
  };
  const middleware = requireAuth(config, {
    createAuthClient: () => ({
      auth: {
        getUser: async () => {
          assert.fail('getUser should be skipped when the access cookie has expired');
        },
        refreshSession: async ({ refresh_token }) => {
          refreshTokenUsed = refresh_token;
          return {
            data: {
              session: {
                access_token: 'renewed-access-token',
                refresh_token: 'rotated-refresh-token',
                expires_in: 3600,
                user: { id: 'user-123' },
              },
            },
            error: null,
          };
        },
      },
    }),
    createUserClient: (_serverConfig, accessToken) => ({ accessToken }),
  });
  let nextError;

  await middleware(request, response, (error) => {
    nextError = error;
  });

  assert.equal(nextError, undefined);
  assert.equal(refreshTokenUsed, 'valid-refresh-token');
  assert.equal(request.user.id, 'user-123');
  assert.equal(request.taskClient.accessToken, 'renewed-access-token');
  assert.equal(refreshedCookies, 2);
});
