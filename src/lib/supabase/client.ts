import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { validatePublicSupabaseEnv, type RawPublicEnvInput } from './env';

let cachedBrowserClient: SupabaseClient | null = null;

/**
 * Creates or returns a browser-safe Supabase client using only the public anon/publishable key.
 * - Configured with `persistSession: false`, `autoRefreshToken: false`, and `detectSessionInUrl: false`
 *   for anonymous visitor operations protected by Postgres Row Level Security (RLS).
 * - Returns `null` when public Supabase environment variables are not configured.
 * - Throws if a `service_role` or `sb_secret_` key is ever supplied.
 */
export function getSupabaseBrowserClient(envOverride?: RawPublicEnvInput): SupabaseClient | null {
  const env = validatePublicSupabaseEnv(envOverride ?? import.meta.env);

  if (!env.isConfigured || !env.url || !env.anonKey) {
    return null;
  }

  if (envOverride) {
    return createClient(env.url, env.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }

  if (!cachedBrowserClient) {
    cachedBrowserClient = createClient(env.url, env.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }

  return cachedBrowserClient;
}
