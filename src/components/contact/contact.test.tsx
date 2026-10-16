import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import type { AxeMatchers } from 'vitest-axe/matchers';
import * as axeMatchers from 'vitest-axe/matchers';
import {
  checkSubmissionRateLimit,
  isHoneypotTriggered,
  isSubmittedTooFast,
  recordSubmissionAttempt,
  resetRateLimitStateForTests,
} from '../../lib/security/antiSpam';
import { SAFE_SUBMISSION_ERROR_MESSAGES } from '../../lib/security/errors';
import { submitContact, type ContactSupabaseClient } from '../../lib/supabase/submitContact';
import { validateContactInput } from '../../lib/validation/contact';
import { ContactPage } from '../../routes/contact/ContactPage';
import type { ContactSubmissionInsert } from '../../types/contact';
import { ContactForm } from './ContactForm';

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-object-type */
declare module 'vitest' {
  interface Matchers<
    R extends void | Promise<void> = void | Promise<void>,
    T = unknown,
  > extends AxeMatchers {}
}
/* eslint-enable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-object-type */

expect.extend(axeMatchers);

function createMockSupabaseClient(insertError: unknown = null): {
  client: ContactSupabaseClient;
  insertMock: ReturnType<typeof vi.fn>;
  fromMock: ReturnType<typeof vi.fn>;
} {
  const insertMock = vi.fn(async (_rows: readonly ContactSubmissionInsert[]) => ({
    error: insertError,
  }));
  const fromMock = vi.fn((_table: 'contact_submissions') => ({
    insert: insertMock,
  }));

  return {
    client: {
      from: fromMock,
    },
    insertMock,
    fromMock,
  };
}

describe('Contact enquiries: migration & RLS, anti-spam, validation, and form UX (S3-T2, S3-T3, S3-T4)', () => {
  beforeEach(() => {
    resetRateLimitStateForTests();
  });

  describe('S3-T2: Supabase contact_submissions migration and RLS policies', () => {
    const migrationPath = resolve(
      process.cwd(),
      'supabase/migrations/20261011000000_create_contact_submissions.sql',
    );
    const migrationSql = readFileSync(migrationPath, 'utf-8');

    it('enables and forces Row Level Security on public.contact_submissions', () => {
      expect(migrationSql).toMatch(
        /alter\s+table\s+public\.contact_submissions\s+enable\s+row\s+level\s+security/i,
      );
      expect(migrationSql).toMatch(
        /alter\s+table\s+public\.contact_submissions\s+force\s+row\s+level\s+security/i,
      );
    });

    it('enforces bounded CHECK constraints and data minimization columns', () => {
      expect(migrationSql).toMatch(/char_length\(btrim\(name\)\)\s+between\s+2\s+and\s+120/i);
      expect(migrationSql).toMatch(/char_length\(btrim\(email\)\)\s+between\s+5\s+and\s+254/i);
      expect(migrationSql).toMatch(/char_length\(btrim\(message\)\)\s+between\s+20\s+and\s+4000/i);
      expect(migrationSql).toMatch(/'full-stack-web'/);
      expect(migrationSql).toMatch(/'backend-api-systems'/);
      expect(migrationSql).toMatch(/'ai-data-pipeline'/);
      expect(migrationSql).toMatch(/'technical-consulting'/);
      expect(migrationSql).toMatch(/12\s+months/i);
    });

    it('grants ONLY column-scoped INSERT to anon and defines zero SELECT, UPDATE, or DELETE policies', () => {
      expect(migrationSql).toMatch(
        /revoke\s+all\s+on\s+table\s+public\.contact_submissions\s+from\s+public,\s*anon,\s*authenticated/i,
      );
      expect(migrationSql).toMatch(
        /grant\s+insert\s*\(\s*name,\s*email,\s*project_type,\s*message\s*\)\s+on\s+table\s+public\.contact_submissions\s+to\s+anon,\s*authenticated/i,
      );
      expect(migrationSql).toMatch(
        /create\s+policy\s+allow_anon_insert_contact_submissions[\s\S]*?for\s+insert[\s\S]*?to\s+anon,\s*authenticated/i,
      );
      expect(migrationSql).not.toMatch(/for\s+select/i);
      expect(migrationSql).not.toMatch(/for\s+update/i);
      expect(migrationSql).not.toMatch(/for\s+delete/i);
      expect(migrationSql).not.toMatch(/for\s+all/i);
    });
  });

  describe('S3-T4: Proportionate anti-spam & abuse controls', () => {
    it('detects populated honeypot inputs and blocks submission before hitting Supabase', async () => {
      expect(isHoneypotTriggered(undefined)).toBe(false);
      expect(isHoneypotTriggered('')).toBe(false);
      expect(isHoneypotTriggered('https://spam.example')).toBe(true);

      const { client, fromMock } = createMockSupabaseClient();
      const result = await submitContact(
        {
          name: 'Bot User',
          email: 'bot@example.com',
          message: 'Automated promotional spam message that exceeds twenty characters.',
          website: 'https://spam.example',
        },
        { client },
      );

      expect(result.ok).toBe(false);
      expect(fromMock).not.toHaveBeenCalled();
    });

    it('rejects submissions completed faster than the minimum human interaction duration', async () => {
      const mountedAtMs = 1_000_000;
      expect(isSubmittedTooFast(mountedAtMs, mountedAtMs + 300)).toBe(true);
      expect(isSubmittedTooFast(mountedAtMs, mountedAtMs + 2000)).toBe(false);

      const { client, fromMock } = createMockSupabaseClient();
      const result = await submitContact(
        {
          name: 'Fast Script',
          email: 'fast@example.com',
          message: 'Looking to build a production web application with your team.',
        },
        {
          client,
          mountedAtMs,
          nowMs: mountedAtMs + 250,
        },
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errorMessage).toBe(SAFE_SUBMISSION_ERROR_MESSAGES.rateLimit);
      }
      expect(fromMock).not.toHaveBeenCalled();
    });

    it('prevents duplicate and rapid-fire submissions within the rate-limit window', async () => {
      const nowMs = 5_000_000;
      const { client, insertMock } = createMockSupabaseClient();

      const validPayload = {
        name: 'Wanjiku Mwangi',
        email: 'wanjiku@example.co.ke',
        projectType: 'full-stack-web' as const,
        message: 'We need a high-conversion web platform with static route pre-rendering.',
      };

      const firstResult = await submitContact(validPayload, {
        client,
        mountedAtMs: nowMs - 5000,
        nowMs,
      });
      expect(firstResult.ok).toBe(true);
      expect(insertMock).toHaveBeenCalledTimes(1);

      // Immediate duplicate attempt should be blocked before calling Supabase again
      const duplicateResult = await submitContact(validPayload, {
        client,
        mountedAtMs: nowMs - 5000,
        nowMs: nowMs + 2000,
      });
      expect(duplicateResult.ok).toBe(false);
      if (!duplicateResult.ok) {
        expect(duplicateResult.errorMessage).toBe(SAFE_SUBMISSION_ERROR_MESSAGES.rateLimit);
      }
      expect(insertMock).toHaveBeenCalledTimes(1);

      // Direct check on checkSubmissionRateLimit after 3 attempts in window
      resetRateLimitStateForTests();
      recordSubmissionAttempt(
        'user1@example.com',
        'First distinct message over twenty chars',
        nowMs,
      );
      recordSubmissionAttempt(
        'user2@example.com',
        'Second distinct message over twenty chars',
        nowMs + 20_000,
      );
      recordSubmissionAttempt(
        'user3@example.com',
        'Third distinct message over twenty chars',
        nowMs + 40_000,
      );

      const fourthCheck = checkSubmissionRateLimit(
        'user4@example.com',
        'Fourth distinct message over twenty chars',
        nowMs + 60_000,
      );
      expect(fourthCheck.allowed).toBe(false);
      expect(fourthCheck.retryAfterSeconds).toBeGreaterThan(0);
    });
  });

  describe('S3-T3: Shared validation and Supabase persistence', () => {
    it('validates and normalizes valid contact payloads and rejects invalid fields', () => {
      const valid = validateContactInput({
        name: '  Geoffrey Tester  ',
        email: '  TESTER@Example.com ',
        projectType: 'backend-api-systems',
        message: '  Designing an event-driven payment verification pipeline in Nairobi.  ',
      });

      expect(valid.success).toBe(true);
      if (valid.success) {
        expect(valid.data).toEqual({
          name: 'Geoffrey Tester',
          email: 'tester@example.com',
          project_type: 'backend-api-systems',
          message: 'Designing an event-driven payment verification pipeline in Nairobi.',
        });
      }

      const shortName = validateContactInput({
        name: 'A',
        email: 'valid@example.com',
        message: 'Valid project description with more than twenty characters.',
      });
      expect(shortName.success).toBe(false);
      if (!shortName.success) {
        expect(shortName.fieldErrors.name).toBeDefined();
      }

      const invalidEmail = validateContactInput({
        name: 'Valid Name',
        email: 'not-an-email',
        message: 'Valid project description with more than twenty characters.',
      });
      expect(invalidEmail.success).toBe(false);
      if (!invalidEmail.success) {
        expect(invalidEmail.fieldErrors.email).toBeDefined();
      }

      const shortMessage = validateContactInput({
        name: 'Valid Name',
        email: 'valid@example.com',
        message: 'Too short',
      });
      expect(shortMessage.success).toBe(false);
      if (!shortMessage.success) {
        expect(shortMessage.fieldErrors.message).toBeDefined();
      }

      const oversizedMessage = validateContactInput({
        name: 'Valid Name',
        email: 'valid@example.com',
        message: 'x'.repeat(4001),
      });
      expect(oversizedMessage.success).toBe(false);
      if (!oversizedMessage.success) {
        expect(oversizedMessage.fieldErrors.message).toBeDefined();
      }
    });

    it('persists valid enquiries to Supabase and sanitizes database/RLS errors', async () => {
      const { client, insertMock } = createMockSupabaseClient();

      const successResult = await submitContact(
        {
          name: 'Amina Hassan',
          email: 'amina@fintech.co.ke',
          projectType: 'ai-data-pipeline',
          message:
            'We want to integrate a multimodal fraud detection workflow into our onboarding.',
        },
        { client },
      );

      expect(successResult).toEqual({ ok: true });
      expect(insertMock).toHaveBeenCalledWith([
        {
          name: 'Amina Hassan',
          email: 'amina@fintech.co.ke',
          project_type: 'ai-data-pipeline',
          message:
            'We want to integrate a multimodal fraud detection workflow into our onboarding.',
        },
      ]);

      resetRateLimitStateForTests();

      // Simulate RLS / Postgres 42501 error and verify no raw codes or table names leak
      const rlsErrorClient = createMockSupabaseClient({
        code: '42501',
        message: 'new row violates row-level security policy for table "contact_submissions"',
      });

      const rlsResult = await submitContact(
        {
          name: 'Amina Hassan',
          email: 'amina@fintech.co.ke',
          message:
            'We want to integrate a multimodal fraud detection workflow into our onboarding.',
        },
        { client: rlsErrorClient.client },
      );

      expect(rlsResult.ok).toBe(false);
      if (!rlsResult.ok) {
        expect(rlsResult.errorMessage).toBe(SAFE_SUBMISSION_ERROR_MESSAGES.unavailable);
        expect(rlsResult.errorMessage).not.toContain('42501');
        expect(rlsResult.errorMessage).not.toContain('contact_submissions');
      }
    });

    it('never fakes success when Supabase client is unconfigured (client: null)', async () => {
      const unconfiguredResult = await submitContact(
        {
          name: 'Kevin Otieno',
          email: 'kevin@example.com',
          message: 'Enquiring about technical architecture consulting for our Q4 launch.',
        },
        { client: null },
      );

      expect(unconfiguredResult.ok).toBe(false);
      if (!unconfiguredResult.ok) {
        expect(unconfiguredResult.errorMessage).toBe(SAFE_SUBMISSION_ERROR_MESSAGES.unavailable);
      }
    });

    it('renders accessible labels, shows programmatic validation errors, and transitions to success state', async () => {
      const user = userEvent.setup();
      const { client, insertMock } = createMockSupabaseClient();

      render(<ContactForm client={client} />);

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const scopeSelect = screen.getByLabelText(/project scope \/ category/i);
      const messageInput = screen.getByLabelText(/project details & timeline/i);
      const submitButton = screen.getByRole('button', { name: /send enquiry/i });

      // 1. Submit empty form to trigger accessible validation errors
      await user.click(submitButton);

      expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      expect(messageInput).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getAllByRole('alert').length).toBeGreaterThanOrEqual(3);
      expect(insertMock).not.toHaveBeenCalled();

      // 2. Fill valid details and submit
      await user.type(nameInput, 'Grace Njeri');
      await user.type(emailInput, 'grace.njeri@example.com');
      await user.selectOptions(scopeSelect, 'technical-consulting');
      await user.type(
        messageInput,
        'We need an architectural review of our PostgreSQL row-level security and API gateway.',
      );

      await user.click(submitButton);

      expect(insertMock).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('status')).toHaveTextContent(/enquiry received/i);
    }, 15000);
  });

  describe('Accessibility (vitest-axe) across ContactPage states', () => {
    it('has zero axe accessibility violations in default, error, and success states', async () => {
      const user = userEvent.setup();
      const { client } = createMockSupabaseClient();

      const { container } = render(<ContactPage client={client} />);

      // 1. Default state
      expect(await axe(container)).toHaveNoViolations();

      // 2. Validation error state
      await user.click(screen.getByRole('button', { name: /send enquiry/i }));
      expect(screen.getByLabelText(/full name/i)).toHaveAttribute('aria-invalid', 'true');
      expect(await axe(container)).toHaveNoViolations();

      // 3. Confirmed submission success state
      await user.type(screen.getByLabelText(/full name/i), 'Daniel Kiprop');
      await user.type(screen.getByLabelText(/email address/i), 'daniel@example.com');
      await user.type(
        screen.getByLabelText(/project details & timeline/i),
        'Looking to partner on a new full-stack logistics and routing web platform.',
      );
      await user.click(screen.getByRole('button', { name: /send enquiry/i }));

      expect(screen.getByRole('status')).toHaveTextContent(/enquiry received/i);
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
