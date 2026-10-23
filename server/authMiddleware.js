import { asyncHandler } from './asyncHandler.js';
import { clearSessionCookies, REFRESH_COOKIE, ACCESS_COOKIE, setSessionCookies } from './sessionCookies.js';
import { createSupabaseClient, createUserSupabaseClient } from './supabase.js';

const sendUnauthorized = (response, isProduction, optional) => {
  clearSessionCookies(response, isProduction);

  if (optional) {
    response.json({ user: null });
    return;
  }

  response.status(401).json({ error: 'Sign in to continue.' });
};

export const requireAuth = (
  config,
  {
    optional = false,
    createAuthClient = () => createSupabaseClient(config),
    createUserClient = createUserSupabaseClient,
  } = {},
) =>
  asyncHandler(async (request, response, next) => {
    let accessToken = request.cookies[ACCESS_COOKIE];
    const refreshToken = request.cookies[REFRESH_COOKIE];

    if (!refreshToken) {
      sendUnauthorized(response, config.isProduction, optional);
      return;
    }

    const authClient = createAuthClient();
    let user = null;

    if (accessToken) {
      const { data, error } = await authClient.auth.getUser(accessToken);
      user = data?.user ?? null;

      if (error && ![401, 403].includes(error.status)) {
        next(error);
        return;
      }
    }

    if (!user) {
      const { data: refreshed, error: refreshError } = await authClient.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (refreshError && ![400, 401, 403].includes(refreshError.status)) {
        next(refreshError);
        return;
      }

      if (!refreshed.session) {
        sendUnauthorized(response, config.isProduction, optional);
        return;
      }

      accessToken = refreshed.session.access_token;
      user = refreshed.session.user;
      setSessionCookies(response, refreshed.session, config.isProduction);
    }

    request.user = user;
    request.taskClient = createUserClient(config, accessToken);
    next();
  });
