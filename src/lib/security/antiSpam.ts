import { SAFE_SUBMISSION_ERROR_MESSAGES } from './errors';

export const MIN_INTERACTION_DURATION_MS = 1500;
export const RATE_LIMIT_COOLDOWN_MS = 15_000;
export const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
export const MAX_SUBMISSIONS_PER_WINDOW = 3;
export const DUPLICATE_SUBMISSION_WINDOW_MS = 5 * 60 * 1000;

export interface RateLimitCheckResult {
  allowed: boolean;
  retryAfterSeconds?: number;
  reason?: string;
}

interface SubmissionAttempt {
  timestampMs: number;
  fingerprint: string;
}

let submissionHistory: SubmissionAttempt[] = [];

function createSubmissionFingerprint(email: string, message: string): string {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedMessage = message.trim().replace(/\s+/g, ' ').toLowerCase();
  return `${normalizedEmail}::${normalizedMessage}`;
}

/**
 * Inspects the hidden honeypot field.
 * Legitimate visitors never see or fill this field; automated bots frequently populate it.
 */
export function isHoneypotTriggered(website?: string): boolean {
  return typeof website === 'string' && website.length > 0;
}

/**
 * Checks whether the form was submitted faster than a human could reasonably complete it.
 */
export function isSubmittedTooFast(
  mountedAtMs: number,
  nowMs: number = Date.now(),
  minDurationMs: number = MIN_INTERACTION_DURATION_MS,
): boolean {
  if (!Number.isFinite(mountedAtMs) || !Number.isFinite(nowMs)) {
    return false;
  }

  const elapsedMs = nowMs - mountedAtMs;
  return elapsedMs < minDurationMs;
}

/**
 * Evaluates client-side rate limits and duplicate-submission guards.
 * Prevents accidental double-sends and rapid automated submission bursts.
 */
export function checkSubmissionRateLimit(
  email: string,
  message: string,
  nowMs: number = Date.now(),
): RateLimitCheckResult {
  // Prune expired records outside the longest tracking window
  const cutoffMs = nowMs - Math.max(RATE_LIMIT_WINDOW_MS, DUPLICATE_SUBMISSION_WINDOW_MS);
  submissionHistory = submissionHistory.filter((entry) => entry.timestampMs > cutoffMs);

  const fingerprint = createSubmissionFingerprint(email, message);

  // 1. Check for duplicate payload within the duplicate suppression window
  const duplicateEntry = submissionHistory.find(
    (entry) =>
      entry.fingerprint === fingerprint &&
      nowMs - entry.timestampMs < DUPLICATE_SUBMISSION_WINDOW_MS,
  );

  if (duplicateEntry) {
    const remainingMs = DUPLICATE_SUBMISSION_WINDOW_MS - (nowMs - duplicateEntry.timestampMs);
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil(remainingMs / 1000)),
      reason: SAFE_SUBMISSION_ERROR_MESSAGES.rateLimit,
    };
  }

  // 2. Check minimum cooldown between consecutive submissions
  const latestAttempt = submissionHistory[submissionHistory.length - 1];
  if (latestAttempt && nowMs - latestAttempt.timestampMs < RATE_LIMIT_COOLDOWN_MS) {
    const remainingMs = RATE_LIMIT_COOLDOWN_MS - (nowMs - latestAttempt.timestampMs);
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil(remainingMs / 1000)),
      reason: SAFE_SUBMISSION_ERROR_MESSAGES.rateLimit,
    };
  }

  // 3. Check rolling window submission count cap
  const recentWindowAttempts = submissionHistory.filter(
    (entry) => nowMs - entry.timestampMs < RATE_LIMIT_WINDOW_MS,
  );
  if (recentWindowAttempts.length >= MAX_SUBMISSIONS_PER_WINDOW) {
    const oldestInWindow = recentWindowAttempts[0];
    const remainingMs = oldestInWindow
      ? RATE_LIMIT_WINDOW_MS - (nowMs - oldestInWindow.timestampMs)
      : RATE_LIMIT_COOLDOWN_MS;
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil(remainingMs / 1000)),
      reason: SAFE_SUBMISSION_ERROR_MESSAGES.rateLimit,
    };
  }

  return { allowed: true };
}

/**
 * Records a confirmed submission attempt for rate-limit and duplicate detection.
 */
export function recordSubmissionAttempt(
  email: string = '',
  message: string = '',
  nowMs: number = Date.now(),
): void {
  submissionHistory.push({
    timestampMs: nowMs,
    fingerprint: createSubmissionFingerprint(email, message),
  });
}

/**
 * Resets in-memory rate-limit state for deterministic unit and integration testing.
 */
export function resetRateLimitStateForTests(): void {
  submissionHistory = [];
}
