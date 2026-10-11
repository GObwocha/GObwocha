export const SAFE_SUBMISSION_ERROR_MESSAGES = {
  network:
    'Unable to reach the server. Please check your internet connection and try again, or use the direct email link.',
  rateLimit:
    'Too many requests were sent recently. Please wait a moment before trying again, or reach out directly by email.',
  validation:
    'Please check that all required fields are filled out accurately and meet the character limits before submitting.',
  unavailable:
    'Enquiry submission is temporarily unavailable. Please try again shortly or reach out directly via email.',
} as const;

interface ErrorLike {
  readonly code?: unknown;
  readonly status?: unknown;
  readonly statusCode?: unknown;
  readonly name?: unknown;
  readonly message?: unknown;
}

function extractErrorProperties(error: unknown): {
  code: string;
  status: number | null;
  name: string;
  message: string;
} {
  if (typeof error === 'string') {
    return {
      code: '',
      status: null,
      name: '',
      message: error,
    };
  }

  if (typeof error === 'object' && error !== null) {
    const candidate = error as ErrorLike;
    const code = typeof candidate.code === 'string' ? candidate.code : '';
    const status =
      typeof candidate.status === 'number'
        ? candidate.status
        : typeof candidate.statusCode === 'number'
          ? candidate.statusCode
          : null;
    const name = typeof candidate.name === 'string' ? candidate.name : '';
    const message = typeof candidate.message === 'string' ? candidate.message : '';

    return { code, status, name, message };
  }

  return {
    code: '',
    status: null,
    name: '',
    message: '',
  };
}

/**
 * Maps any unknown error into a safe, actionable, user-facing message.
 * Per AGENTS.md §1.4, never exposes Supabase database errors, PostgREST codes,
 * SQL state codes (PGRST*, 23505, 42501), table names, or stack traces to visitors.
 */
export function sanitizeSubmissionError(error: unknown): string {
  const { code, status, name, message } = extractErrorProperties(error);
  const normalizedCode = code.trim().toUpperCase();
  const normalizedMessage = message.toLowerCase();
  const normalizedName = name.toLowerCase();

  // 1. Rate-limiting errors (HTTP 429 or explicit rate-limit codes)
  if (
    status === 429 ||
    normalizedCode === '429' ||
    normalizedCode === 'OVER_REQUEST_RATE_LIMIT' ||
    normalizedCode === 'RATE_LIMITED' ||
    normalizedMessage.includes('too many requests') ||
    normalizedMessage.includes('rate limit')
  ) {
    return SAFE_SUBMISSION_ERROR_MESSAGES.rateLimit;
  }

  // 2. Network / connectivity / offline errors
  if (
    normalizedName === 'aborterror' ||
    normalizedCode === 'NETWORK_ERROR' ||
    normalizedMessage.includes('failed to fetch') ||
    normalizedMessage.includes('networkerror') ||
    normalizedMessage.includes('network request failed') ||
    normalizedMessage.includes('load failed') ||
    normalizedMessage.includes('fetch failed') ||
    normalizedMessage.includes('offline') ||
    normalizedMessage.includes('timed out') ||
    normalizedMessage.includes('econnrefused') ||
    normalizedMessage.includes('enotfound')
  ) {
    return SAFE_SUBMISSION_ERROR_MESSAGES.network;
  }

  // 3. Input / check-constraint validation errors (e.g., Postgres 23514 check_violation)
  if (normalizedCode === '23514' || normalizedCode === 'VALIDATION_ERROR') {
    return SAFE_SUBMISSION_ERROR_MESSAGES.validation;
  }

  // 4. All database, RLS (42501), PostgREST (PGRST*), unique constraint (23505),
  // configuration, or unexpected internal errors map to a generic, honest message
  // without leaking any internal identifier, table name, or stack trace.
  return SAFE_SUBMISSION_ERROR_MESSAGES.unavailable;
}
