export const ACCESS_COOKIE = 'taskflow-access';
export const REFRESH_COOKIE = 'taskflow-refresh';

const refreshCookieMaxAge = 7 * 24 * 60 * 60 * 1000;

const cookieOptions = (isProduction, maxAge) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: 'strict',
  path: '/api',
  maxAge,
});

export const setSessionCookies = (response, session, isProduction) => {
  const accessMaxAge = Math.min(
    Math.max(Number(session.expires_in) || 3600, 1) * 1000,
    60 * 60 * 1000,
  );

  response.cookie(
    ACCESS_COOKIE,
    session.access_token,
    cookieOptions(isProduction, accessMaxAge),
  );
  response.cookie(
    REFRESH_COOKIE,
    session.refresh_token,
    cookieOptions(isProduction, refreshCookieMaxAge),
  );
};

export const clearSessionCookies = (response, isProduction) => {
  response.clearCookie(ACCESS_COOKIE, cookieOptions(isProduction));
  response.clearCookie(REFRESH_COOKIE, cookieOptions(isProduction));
};
