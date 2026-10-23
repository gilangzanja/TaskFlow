export const getServerConfig = (environment) => {
  const supabaseUrl = environment.SUPABASE_URL?.trim();
  const supabaseAnonKey = environment.SUPABASE_ANON_KEY?.trim();
  const isProduction = environment.NODE_ENV === 'production';

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Set SUPABASE_URL and SUPABASE_ANON_KEY in the server environment.');
  }

  let parsedSupabaseUrl;

  try {
    parsedSupabaseUrl = new URL(supabaseUrl);
  } catch {
    throw new Error('SUPABASE_URL must be a valid HTTPS URL.');
  }

  if (parsedSupabaseUrl.protocol !== 'https:' || parsedSupabaseUrl.pathname !== '/') {
    throw new Error('SUPABASE_URL must be a valid HTTPS project URL.');
  }

  const configuredOrigin =
    environment.APP_ORIGIN?.trim() || (isProduction ? '' : 'http://localhost:5173');
  let parsedAppOrigin;

  try {
    parsedAppOrigin = new URL(configuredOrigin);
  } catch {
    throw new Error('Set APP_ORIGIN to the exact origin where TaskFlow is served.');
  }

  if (
    !['http:', 'https:'].includes(parsedAppOrigin.protocol) ||
    parsedAppOrigin.username ||
    parsedAppOrigin.password ||
    parsedAppOrigin.pathname !== '/' ||
    parsedAppOrigin.search ||
    parsedAppOrigin.hash
  ) {
    throw new Error('APP_ORIGIN must contain only the TaskFlow scheme, host, and port.');
  }

  if (isProduction && parsedAppOrigin.protocol !== 'https:') {
    throw new Error('APP_ORIGIN must use HTTPS in production.');
  }

  const portValue = environment.PORT?.trim() || '3000';
  const port = Number(portValue);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }

  return {
    supabaseUrl: parsedSupabaseUrl.origin,
    supabaseAnonKey,
    appOrigin: parsedAppOrigin.origin,
    port,
    isProduction,
  };
};
