import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const BROWSER_EXECUTION_ERROR =
  'SECURITY_VIOLATION: src/lib/supabase/server.ts cannot be executed in a browser environment.';

/**
 * Verifies that execution is occurring strictly on the server (Node/SSR/Edge)
 * and never inside a browser window context.
 */
export function assertServerEnvironment(): void {
  if (typeof window !== 'undefined') {
    throw new Error(BROWSER_EXECUTION_ERROR);
  }
}

// Immediately block execution if loaded in a real browser runtime outside unit test runners.
if (typeof window !== 'undefined' && import.meta.env.MODE !== 'test') {
  throw new Error(BROWSER_EXECUTION_ERROR);
}

export interface ServerSupabaseEnvInput {
  readonly SUPABASE_URL?: string | undefined;
  readonly VITE_SUPABASE_URL?: string | undefined;
  readonly SUPABASE_SERVICE_ROLE_KEY?: string | undefined;
}

/**
 * Creates a server-only Supabase client using `process.env.SUPABASE_SERVICE_ROLE_KEY`.
 * Never reads `VITE_SUPABASE_SERVICE_ROLE_KEY` from `import.meta.env`.
 */
export function createServerSupabaseClient(envOverride?: ServerSupabaseEnvInput): SupabaseClient {
  assertServerEnvironment();

  const sourceEnv: ServerSupabaseEnvInput = envOverride ?? process.env;
  const supabaseUrl = (sourceEnv.SUPABASE_URL ?? sourceEnv.VITE_SUPABASE_URL ?? '').trim();
  const serviceRoleKey = (sourceEnv.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing server Supabase credentials: SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY are required.',
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
