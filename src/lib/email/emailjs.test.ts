import { describe, expect, it, vi } from 'vitest';
import { getEmailJsConfig, sendEmailWithEmailJs } from './emailjs';

describe('EmailJS Integration', () => {
  const sampleSubmission = {
    name: 'Brian Njoroge',
    email: 'brian@example.com',
    project_type: 'full-stack-web' as const,
    message: 'We want to build a high-performance web product with React and Supabase.',
  };

  const sampleConfig = {
    serviceId: 'service_abc123',
    templateId: 'template_xyz789',
    publicKey: 'user_pubkey_456',
  };

  it('returns null when EmailJS environment variables are not configured', () => {
    expect(getEmailJsConfig()).toBeNull();
  });

  it('returns false gracefully when configuration is missing', async () => {
    const result = await sendEmailWithEmailJs(sampleSubmission);
    expect(result.ok).toBe(false);
    expect(result.error).toContain('not configured');
  });

  it('formats payload with from_name, from_email, reply_to, and timestamps', async () => {
    const originalFetch = globalThis.fetch;
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => 'OK',
    });
    globalThis.fetch = fetchMock;

    try {
      const result = await sendEmailWithEmailJs(sampleSubmission, sampleConfig);

      expect(result.ok).toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://api.emailjs.com/api/v1.0/email/send');
      expect(options.method).toBe('POST');
      expect(options.headers).toEqual({ 'Content-Type': 'application/json' });

      const body = JSON.parse(options.body as string);
      expect(body.service_id).toBe('service_abc123');
      expect(body.template_id).toBe('template_xyz789');
      expect(body.user_id).toBe('user_pubkey_456');
      expect(body.template_params.from_name).toBe('Brian Njoroge');
      expect(body.template_params.from_email).toBe('brian@example.com');
      expect(body.template_params.reply_to).toBe('brian@example.com');
      expect(body.template_params.project_type).toBe('Full-Stack Web Application');
      expect(body.template_params.message).toBe(
        'We want to build a high-performance web product with React and Supabase.',
      );
      expect(body.template_params.timestamp).toContain('EAT');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('handles HTTP error responses from EmailJS', async () => {
    const originalFetch = globalThis.fetch;
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => 'The service is unavailable or invalid template ID',
    });
    globalThis.fetch = fetchMock;

    try {
      const result = await sendEmailWithEmailJs(sampleSubmission, sampleConfig);
      expect(result.ok).toBe(false);
      expect(result.error).toContain('invalid template ID');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('catches network exceptions without throwing', async () => {
    const originalFetch = globalThis.fetch;
    const fetchMock = vi.fn().mockRejectedValue(new Error('Network offline'));
    globalThis.fetch = fetchMock;

    try {
      const result = await sendEmailWithEmailJs(sampleSubmission, sampleConfig);
      expect(result.ok).toBe(false);
      expect(result.error).toBe('Network offline');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
