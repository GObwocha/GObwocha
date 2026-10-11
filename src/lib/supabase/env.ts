import { z } from 'zod';

const DEFAULT_SITE_URL = 'https://gobwocha.vercel.app';

export interface PublicSupabaseEnv {
  readonly isConfigured: boolean;
  readonly url: string | null;
  readonly anonKey: string | null;
  readonly siteUrl: string;
}

export interface RawPublicEnvInput {
  readonly VITE_SUPABASE_URL?: string | undefined;
  readonly VITE_SUPABASE_ANON_KEY?: string | undefined;
  readonly VITE_SITE_URL?: string | undefined;
  readonly VITE_SUPABASE_SERVICE_ROLE_KEY?: string | undefined;
}

/**
 * Decodes a base64url segment safely in both browser and Node environments.
 */
function decodeBase64UrlSegment(segment: string): string | null {
  try {
    const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
    const padLength = (4 - (normalized.length % 4)) % 4;
    const padded = normalized + '='.repeat(padLength);
    if (typeof atob === 'function') {
      return atob(padded);
    }
    return Buffer.from(padded, 'base64').toString('utf-8');
  } catch {
    return null;
  }
}

/**
 * Ensures a key is never a privileged Supabase service_role or secret key.
 * Throws a SECURITY_VIOLATION error if a secret key is detected.
 */
export function assertNotServiceRoleKey(key: string): void {
  const trimmed = key.trim();
  if (!trimmed) {
    return;
  }

  const lower = trimmed.toLowerCase();

  if (lower.startsWith('sb_secret_') || lower.includes('service_role')) {
    throw new Error(
      'SECURITY_VIOLATION: Supabase service_role or secret key must never be used in a browser client environment.',
    );
  }

  const parts = trimmed.split('.');
  if (parts.length >= 2 && parts[1]) {
    const decodedPayload = decodeBase64UrlSegment(parts[1]);
    if (decodedPayload) {
      try {
        const parsed: unknown = JSON.parse(decodedPayload);
        if (
          typeof parsed === 'object' &&
          parsed !== null &&
          'role' in parsed &&
          (parsed as { role?: unknown }).role === 'service_role'
        ) {
          throw new Error(
            'SECURITY_VIOLATION: JWT with role "service_role" must never be used in a browser client environment.',
          );
        }
      } catch (err) {
        if (err instanceof Error && err.message.startsWith('SECURITY_VIOLATION:')) {
          throw err;
        }
      }

      if (decodedPayload.toLowerCase().includes('"service_role"')) {
        throw new Error(
          'SECURITY_VIOLATION: JWT containing service_role claim must never be used in a browser client environment.',
        );
      }
    }
  }
}

const siteUrlSchema = z
  .string()
  .trim()
  .url()
  .refine((val) => val.startsWith('https://') || val.startsWith('http://'), {
    message: 'VITE_SITE_URL must use http or https protocol.',
  });

const publicSupabaseCredentialsSchema = z.object({
  url: z
    .string()
    .trim()
    .url({ message: 'VITE_SUPABASE_URL must be a valid URL.' })
    .refine((val) => val.startsWith('https://') || val.startsWith('http://'), {
      message: 'VITE_SUPABASE_URL must use http or https protocol.',
    }),
  anonKey: z
    .string()
    .trim()
    .min(10, { message: 'VITE_SUPABASE_ANON_KEY must be a valid publishable/anon key.' })
    .superRefine((val, ctx) => {
      try {
        assertNotServiceRoleKey(val);
      } catch (err) {
        ctx.addIssue({
          code: 'custom',
          message: err instanceof Error ? err.message : 'Invalid Supabase key.',
        });
      }
    }),
});

/**
 * Validates public Supabase environment configuration.
 * - Rejects any service_role key exposure with a SECURITY_VIOLATION error.
 * - Returns `{ isConfigured: false, url: null, anonKey: null, siteUrl }` when credentials are absent
 *   so CI/test/prerender builds work cleanly without `.env.local`.
 * - Strictly validates URL and anonKey when credentials are provided.
 */
export function validatePublicSupabaseEnv(
  rawEnv: RawPublicEnvInput = import.meta.env,
): PublicSupabaseEnv {
  if (
    typeof rawEnv.VITE_SUPABASE_SERVICE_ROLE_KEY === 'string' &&
    rawEnv.VITE_SUPABASE_SERVICE_ROLE_KEY.trim().length > 0
  ) {
    throw new Error(
      'SECURITY_VIOLATION: VITE_SUPABASE_SERVICE_ROLE_KEY is defined in public environment variables. Never prefix server secrets with VITE_.',
    );
  }

  const rawSiteUrl = rawEnv.VITE_SITE_URL?.trim();
  const parsedSiteUrl = rawSiteUrl ? siteUrlSchema.safeParse(rawSiteUrl) : null;
  const siteUrl = parsedSiteUrl?.success
    ? parsedSiteUrl.data.replace(/\/+$/, '')
    : DEFAULT_SITE_URL;

  const rawUrl = rawEnv.VITE_SUPABASE_URL?.trim() ?? '';
  const rawAnonKey = rawEnv.VITE_SUPABASE_ANON_KEY?.trim() ?? '';

  if (rawAnonKey.length > 0) {
    assertNotServiceRoleKey(rawAnonKey);
  }

  if (rawUrl.length === 0 && rawAnonKey.length === 0) {
    return {
      isConfigured: false,
      url: null,
      anonKey: null,
      siteUrl,
    };
  }

  const parsedCredentials = publicSupabaseCredentialsSchema.safeParse({
    url: rawUrl,
    anonKey: rawAnonKey,
  });

  if (!parsedCredentials.success) {
    const issueMessages = parsedCredentials.error.issues.map((issue) => issue.message).join('; ');
    throw new Error(`Invalid public Supabase configuration: ${issueMessages}`);
  }

  return {
    isConfigured: true,
    url: parsedCredentials.data.url.replace(/\/+$/, ''),
    anonKey: parsedCredentials.data.anonKey,
    siteUrl,
  };
}
