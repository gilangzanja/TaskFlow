import { createClient } from '@supabase/supabase-js';

const authOptions = {
  autoRefreshToken: false,
  detectSessionInUrl: false,
  persistSession: false,
};

export const createSupabaseClient = (config) =>
  createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: authOptions,
  });

export const createUserSupabaseClient = (config, accessToken) =>
  createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: authOptions,
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
