import test from 'node:test';
import assert from 'node:assert/strict';

import { getServerConfig } from '../server/config.js';

test('loads the Supabase and application settings from the server environment', () => {
  assert.deepEqual(
    getServerConfig({
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_ANON_KEY: 'public-key',
      APP_ORIGIN: 'http://localhost:5173',
      PORT: '3001',
      NODE_ENV: 'development',
    }),
    {
      supabaseUrl: 'https://project.supabase.co',
      supabaseAnonKey: 'public-key',
      appOrigin: 'http://localhost:5173',
      port: 3001,
      isProduction: false,
    },
  );
});

test('requires the Supabase URL and anon key', () => {
  assert.throws(
    () => getServerConfig({ APP_ORIGIN: 'http://localhost:5173' }),
    /SUPABASE_URL and SUPABASE_ANON_KEY/,
  );
});

test('requires HTTPS origins and Supabase URLs in production', () => {
  assert.throws(
    () =>
      getServerConfig({
        SUPABASE_URL: 'https://project.supabase.co',
        SUPABASE_ANON_KEY: 'public-key',
        APP_ORIGIN: 'http://taskflow.example.com',
        NODE_ENV: 'production',
      }),
    /APP_ORIGIN must use HTTPS in production/,
  );
});

test('rejects invalid server ports', () => {
  assert.throws(
    () =>
      getServerConfig({
        SUPABASE_URL: 'https://project.supabase.co',
        SUPABASE_ANON_KEY: 'public-key',
        APP_ORIGIN: 'http://localhost:5173',
        PORT: 'not-a-port',
      }),
    /PORT must be an integer between 1 and 65535/,
  );
});
