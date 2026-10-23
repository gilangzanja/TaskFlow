import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';

import { getAuthValidationError } from '../../assets/js/features/authValidation.js';
import { asyncHandler } from '../asyncHandler.js';
import { requireAuth } from '../authMiddleware.js';
import { clearSessionCookies, setSessionCookies, ACCESS_COOKIE, REFRESH_COOKIE } from '../sessionCookies.js';
import { createSupabaseClient } from '../supabase.js';

const publicUser = (user) => ({
  id: user.id,
  email: user.email,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Try again later.' },
});

export const createAuthRouter = (config) => {
  const router = Router();

  router.post(
    '/register',
    authLimiter,
    asyncHandler(async (request, response) => {
      const { email, password } = request.body ?? {};
      const validationError = getAuthValidationError(email ?? '', password ?? '');

      if (validationError) {
        response.status(422).json({ error: validationError });
        return;
      }

      const authClient = createSupabaseClient(config);
      const { data, error } = await authClient.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${config.appOrigin}/`,
        },
      });

      if (error) {
        response.status(400).json({
          error: 'Could not create your account. Check your details and try again.',
        });
        return;
      }

      if (data.session) {
        setSessionCookies(response, data.session, config.isProduction);
      }

      response.status(201).json({
        user: data.user ? publicUser(data.user) : null,
        needsEmailConfirmation: !data.session,
      });
    }),
  );

  router.post(
    '/login',
    authLimiter,
    asyncHandler(async (request, response) => {
      const { email, password } = request.body ?? {};
      const validationError = getAuthValidationError(email ?? '', password ?? '');

      if (validationError) {
        response.status(422).json({ error: validationError });
        return;
      }

      const authClient = createSupabaseClient(config);
      const { data, error } = await authClient.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error || !data.session) {
        response.status(401).json({
          error: 'Email or password is incorrect, or your email has not been confirmed.',
        });
        return;
      }

      setSessionCookies(response, data.session, config.isProduction);
      response.json({ user: publicUser(data.user) });
    }),
  );

  router.get('/session', requireAuth(config, { optional: true }), (request, response) => {
    response.json({ user: request.user ? publicUser(request.user) : null });
  });

  router.post(
    '/logout',
    asyncHandler(async (request, response) => {
      const accessToken = request.cookies[ACCESS_COOKIE];
      const refreshToken = request.cookies[REFRESH_COOKIE];
      let remoteRevoked = true;

      try {
        if (accessToken && refreshToken) {
          const authClient = createSupabaseClient(config);
          const { error: sessionError } = await authClient.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (!sessionError) {
            const { error: signOutError } = await authClient.auth.signOut({ scope: 'local' });
            remoteRevoked = !signOutError;

            if (signOutError) {
              console.error('Supabase could not revoke the signed-out session.', signOutError.status);
            }
          } else {
            remoteRevoked = false;
            console.error('Supabase could not validate the signed-out session.', sessionError.status);
          }
        }
      } catch (error) {
        remoteRevoked = false;
        console.error('Supabase session revocation failed.', {
          name: error.name,
          status: error.status,
        });
      }

      clearSessionCookies(response, config.isProduction);
      response.json({ remoteRevoked });
    }),
  );

  return router;
};
