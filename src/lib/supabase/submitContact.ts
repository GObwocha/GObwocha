import type { SupabaseClient } from '@supabase/supabase-js';
import {
  checkSubmissionRateLimit,
  isHoneypotTriggered,
  isSubmittedTooFast,
  recordSubmissionAttempt,
} from '../security/antiSpam';
import { SAFE_SUBMISSION_ERROR_MESSAGES, sanitizeSubmissionError } from '../security/errors';
import { validateContactInput } from '../validation/contact';
import type {
  ContactSubmissionInput,
  ContactSubmissionInsert,
  ContactSubmissionResult,
} from '../../types/contact';
import { getSupabaseBrowserClient } from './client';
import { sendEmailWithEmailJs } from '../email/emailjs';

export interface ContactInsertQueryBuilder {
  insert(
    values: readonly ContactSubmissionInsert[],
  ): PromiseLike<{ error: unknown }> | Promise<{ error: unknown }>;
}

export interface ContactSupabaseClient {
  from(table: 'contact_submissions'): ContactInsertQueryBuilder;
}

export interface SubmitContactOptions {
  mountedAtMs?: number;
  nowMs?: number;
  client?: Pick<SupabaseClient, 'from'> | ContactSupabaseClient | null;
}

/**
 * Validates, rate-limits, and persists a visitor enquiry to Supabase `public.contact_submissions`.
 * - Enforces anti-spam controls (honeypot, minimum interaction duration, duplicate/cooldown rate limit).
 * - Validates input fields on the client boundary using shared Zod schemas.
 * - Never fakes success when Supabase is unconfigured or returns an error (AGENTS.md §2).
 * - Sanitizes all database/network errors before returning user-facing messages (AGENTS.md §1.4).
 */
export async function submitContact(
  input: ContactSubmissionInput,
  options?: SubmitContactOptions,
): Promise<ContactSubmissionResult> {
  const nowMs = options?.nowMs ?? Date.now();

  // Step 1a: Inspect hidden honeypot field
  if (isHoneypotTriggered(input.website)) {
    return {
      ok: false,
      errorMessage: SAFE_SUBMISSION_ERROR_MESSAGES.validation,
    };
  }

  // Step 1b: Enforce minimum human interaction timing when mountedAtMs is provided
  if (typeof options?.mountedAtMs === 'number' && isSubmittedTooFast(options.mountedAtMs, nowMs)) {
    return {
      ok: false,
      errorMessage: SAFE_SUBMISSION_ERROR_MESSAGES.rateLimit,
    };
  }

  // Step 2: Validate and normalize untrusted input before rate-limit fingerprint or DB call
  const validation = validateContactInput(input);
  if (!validation.success) {
    return {
      ok: false,
      errorMessage: validation.errorMessage,
      fieldErrors: validation.fieldErrors,
    };
  }

  // Step 1c: Check client-side rate-limit & duplicate submission guard
  const rateLimit = checkSubmissionRateLimit(validation.data.email, validation.data.message, nowMs);
  if (!rateLimit.allowed) {
    return {
      ok: false,
      errorMessage: rateLimit.reason ?? SAFE_SUBMISSION_ERROR_MESSAGES.rateLimit,
    };
  }

  try {
    // Step 3: Obtain browser-safe anon Supabase client (or test/custom override)
    const client = options?.client !== undefined ? options.client : getSupabaseBrowserClient();

    // Step 4: Never imply a form message was sent unless Supabase confirms insertion
    if (!client) {
      return {
        ok: false,
        errorMessage: SAFE_SUBMISSION_ERROR_MESSAGES.unavailable,
      };
    }

    // Step 5: Insert row without .select() so anon insert succeeds under strict insert-only RLS
    const table = (client as ContactSupabaseClient).from('contact_submissions');
    const { error } = await table.insert([validation.data]);

    if (error !== null && error !== undefined) {
      return {
        ok: false,
        errorMessage: sanitizeSubmissionError(error),
      };
    }

    recordSubmissionAttempt(validation.data.email, validation.data.message, nowMs);

    // Step 6: Dispatch notification email via EmailJS (if configured)
    // Non-blocking fire-and-forget so visitor UX remains instantaneous (< 150ms)
    sendEmailWithEmailJs(validation.data).catch((err) => {
      console.warn('Email notification dispatch skipped or failed:', err);
    });

    return {
      ok: true,
    };
  } catch (err) {
    return {
      ok: false,
      errorMessage: sanitizeSubmissionError(err),
    };
  }
}
