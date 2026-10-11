import { describe, expect, it } from 'vitest';
import { PROJECT_TYPES, PROJECT_TYPE_LABELS } from '../../types/contact';
import { SAFE_SUBMISSION_ERROR_MESSAGES, sanitizeSubmissionError } from '../security/errors';
import { getSupabaseBrowserClient } from './client';
import { assertNotServiceRoleKey, validatePublicSupabaseEnv } from './env';
import { assertServerEnvironment, createServerSupabaseClient } from './server';

/**
 * Helper to create a synthetic unsigned JWT with a given payload object for testing.
 */
function createTestJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.signature_placeholder`;
}

describe('S3-T1: Supabase Configuration, Server Boundary Guard & Safe Error Handling', () => {
  describe('validatePublicSupabaseEnv & assertNotServiceRoleKey', () => {
    it('passes validation when valid VITE_SUPABASE_URL and anon JWT key are provided', () => {
      const validAnonJwt = createTestJwt({
        role: 'anon',
        iss: 'supabase',
        exp: 1999999999,
      });

      const result = validatePublicSupabaseEnv({
        VITE_SUPABASE_URL: 'https://example-project.supabase.co/',
        VITE_SUPABASE_ANON_KEY: validAnonJwt,
        VITE_SITE_URL: 'https://gobwocha.vercel.app/',
      });

      expect(result).toEqual({
        isConfigured: true,
        url: 'https://example-project.supabase.co',
        anonKey: validAnonJwt,
        siteUrl: 'https://gobwocha.vercel.app',
      });
    });

    it('passes validation with modern publishable key (sb_publishable_...)', () => {
      const result = validatePublicSupabaseEnv({
        VITE_SUPABASE_URL: 'https://example-project.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'sb_publishable_1234567890abcdef',
      });

      expect(result.isConfigured).toBe(true);
      expect(result.url).toBe('https://example-project.supabase.co');
      expect(result.anonKey).toBe('sb_publishable_1234567890abcdef');
    });

    it('cleanly returns isConfigured: false when env vars are missing or empty', () => {
      const emptyResult = validatePublicSupabaseEnv({
        VITE_SUPABASE_URL: '',
        VITE_SUPABASE_ANON_KEY: '',
      });

      expect(emptyResult).toEqual({
        isConfigured: false,
        url: null,
        anonKey: null,
        siteUrl: 'https://gobwocha.vercel.app',
      });

      const undefinedResult = validatePublicSupabaseEnv({});
      expect(undefinedResult.isConfigured).toBe(false);
      expect(undefinedResult.url).toBeNull();
      expect(undefinedResult.anonKey).toBeNull();
    });

    it('immediately rejects sb_secret_ keys in assertNotServiceRoleKey and validatePublicSupabaseEnv', () => {
      const secretKey = 'sb_secret_super_sensitive_server_key_999';

      expect(() => assertNotServiceRoleKey(secretKey)).toThrow(/SECURITY_VIOLATION/);
      expect(() =>
        validatePublicSupabaseEnv({
          VITE_SUPABASE_URL: 'https://example-project.supabase.co',
          VITE_SUPABASE_ANON_KEY: secretKey,
        }),
      ).toThrow(/SECURITY_VIOLATION/);
    });

    it('immediately rejects JWT keys with "role":"service_role"', () => {
      const serviceRoleJwt = createTestJwt({
        role: 'service_role',
        iss: 'supabase',
        exp: 1999999999,
      });

      expect(() => assertNotServiceRoleKey(serviceRoleJwt)).toThrow(/SECURITY_VIOLATION/);
      expect(() =>
        validatePublicSupabaseEnv({
          VITE_SUPABASE_URL: 'https://example-project.supabase.co',
          VITE_SUPABASE_ANON_KEY: serviceRoleJwt,
        }),
      ).toThrow(/SECURITY_VIOLATION/);
    });

    it('rejects accidental VITE_SUPABASE_SERVICE_ROLE_KEY exposure in public env', () => {
      expect(() =>
        validatePublicSupabaseEnv({
          VITE_SUPABASE_URL: 'https://example-project.supabase.co',
          VITE_SUPABASE_ANON_KEY: 'sb_publishable_1234567890abcdef',
          VITE_SUPABASE_SERVICE_ROLE_KEY: 'sb_secret_leaked',
        }),
      ).toThrow(/SECURITY_VIOLATION/);
    });

    it('throws a configuration error when only one of URL or anonKey is provided', () => {
      expect(() =>
        validatePublicSupabaseEnv({
          VITE_SUPABASE_URL: 'https://example-project.supabase.co',
          VITE_SUPABASE_ANON_KEY: '',
        }),
      ).toThrow(/Invalid public Supabase configuration/);
    });
  });

  describe('getSupabaseBrowserClient', () => {
    it('returns null when public Supabase env vars are not configured', () => {
      const client = getSupabaseBrowserClient({
        VITE_SUPABASE_URL: '',
        VITE_SUPABASE_ANON_KEY: '',
      });
      expect(client).toBeNull();
    });

    it('returns a configured SupabaseClient when valid public credentials are provided', () => {
      const validAnonJwt = createTestJwt({ role: 'anon', iss: 'supabase' });
      const client = getSupabaseBrowserClient({
        VITE_SUPABASE_URL: 'https://example-project.supabase.co',
        VITE_SUPABASE_ANON_KEY: validAnonJwt,
      });
      expect(client).not.toBeNull();
    });

    it('throws SECURITY_VIOLATION if a service_role key is passed to the browser client', () => {
      const serviceRoleJwt = createTestJwt({ role: 'service_role', iss: 'supabase' });
      expect(() =>
        getSupabaseBrowserClient({
          VITE_SUPABASE_URL: 'https://example-project.supabase.co',
          VITE_SUPABASE_ANON_KEY: serviceRoleJwt,
        }),
      ).toThrow(/SECURITY_VIOLATION/);
    });
  });

  describe('createServerSupabaseClient browser boundary guard', () => {
    it('throws SECURITY_VIOLATION when called in the jsdom browser environment (typeof window !== "undefined")', () => {
      expect(typeof window).not.toBe('undefined');
      expect(() => assertServerEnvironment()).toThrow(
        'SECURITY_VIOLATION: src/lib/supabase/server.ts cannot be executed in a browser environment.',
      );
      expect(() =>
        createServerSupabaseClient({
          SUPABASE_URL: 'https://example-project.supabase.co',
          SUPABASE_SERVICE_ROLE_KEY: 'sb_secret_valid_server_key',
        }),
      ).toThrow(
        'SECURITY_VIOLATION: src/lib/supabase/server.ts cannot be executed in a browser environment.',
      );
    });
  });

  describe('sanitizeSubmissionError', () => {
    it('strips PostgREST and Postgres codes (PGRST301, 42501, 23505), table names, and stack traces', () => {
      const rlsError = {
        code: '42501',
        message:
          'new row violates row-level security policy for table "contact_submissions" in schema "public"',
        details: 'Failing row contains (uuid, test@example.com, ...)',
        hint: 'Check policy on public.contact_submissions',
      };

      const sanitizedRls = sanitizeSubmissionError(rlsError);
      expect(sanitizedRls).toBe(SAFE_SUBMISSION_ERROR_MESSAGES.unavailable);
      expect(sanitizedRls).not.toContain('42501');
      expect(sanitizedRls).not.toContain('contact_submissions');
      expect(sanitizedRls).not.toContain('row-level security');

      const postgrestError = {
        code: 'PGRST301',
        message: 'JWT expired or invalid signature at PostgREST line 42',
      };
      const sanitizedPostgrest = sanitizeSubmissionError(postgrestError);
      expect(sanitizedPostgrest).toBe(SAFE_SUBMISSION_ERROR_MESSAGES.unavailable);
      expect(sanitizedPostgrest).not.toContain('PGRST301');
      expect(sanitizedPostgrest).not.toContain('JWT');

      const duplicateError = new Error(
        'error: duplicate key value violates unique constraint "contact_submissions_pkey" (SQLSTATE 23505)\n    at Connection.parseE (/app/node_modules/pg/lib/connection.js:614:13)',
      );
      const sanitizedDuplicate = sanitizeSubmissionError(duplicateError);
      expect(sanitizedDuplicate).toBe(SAFE_SUBMISSION_ERROR_MESSAGES.unavailable);
      expect(sanitizedDuplicate).not.toContain('23505');
      expect(sanitizedDuplicate).not.toContain('contact_submissions_pkey');
      expect(sanitizedDuplicate).not.toContain('node_modules');
    });

    it('maps HTTP 429 and rate-limit errors to a safe rate-limit message', () => {
      expect(sanitizeSubmissionError({ status: 429, message: 'Too Many Requests' })).toBe(
        SAFE_SUBMISSION_ERROR_MESSAGES.rateLimit,
      );
      expect(sanitizeSubmissionError({ code: 'over_request_rate_limit' })).toBe(
        SAFE_SUBMISSION_ERROR_MESSAGES.rateLimit,
      );
    });

    it('maps network/offline fetch failures to a safe connectivity message', () => {
      expect(sanitizeSubmissionError(new TypeError('Failed to fetch'))).toBe(
        SAFE_SUBMISSION_ERROR_MESSAGES.network,
      );
      expect(
        sanitizeSubmissionError(new Error('NetworkError when attempting to fetch resource')),
      ).toBe(SAFE_SUBMISSION_ERROR_MESSAGES.network);
    });

    it('maps Postgres 23514 check constraint errors to a safe validation message without exposing SQL details', () => {
      const checkError = {
        code: '23514',
        message:
          'new row for relation "contact_submissions" violates check constraint "contact_submissions_message_check"',
      };
      const sanitized = sanitizeSubmissionError(checkError);
      expect(sanitized).toBe(SAFE_SUBMISSION_ERROR_MESSAGES.validation);
      expect(sanitized).not.toContain('23514');
      expect(sanitized).not.toContain('contact_submissions');
    });
  });

  describe('Contact domain types', () => {
    it('defines all expected canonical project types and human-readable labels', () => {
      expect(PROJECT_TYPES).toEqual([
        'full-stack-web',
        'backend-api-systems',
        'ai-data-pipeline',
        'technical-consulting',
        'other',
      ]);
      for (const type of PROJECT_TYPES) {
        expect(PROJECT_TYPE_LABELS[type]).toBeTruthy();
      }
    });
  });
});
