import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildEmailContent,
  escapeHtml,
  extractRecord,
  formatTimestamp,
  getProjectTypeLabel,
  handleNotifyEnquiry,
  isAuthorized,
  isRecentDuplicate,
  PROJECT_TYPE_LABELS,
  resetProcessedSubmissionsForTests,
} from '../../../supabase/functions/notify-enquiry/index';

describe('notify-enquiry Edge Function (Option A)', () => {
  beforeEach(() => {
    resetProcessedSubmissionsForTests();
  });
  describe('extractRecord', () => {
    it('extracts record from Supabase Database Webhook INSERT payload', () => {
      const webhookPayload = {
        type: 'INSERT',
        table: 'contact_submissions',
        schema: 'public',
        record: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Jane Doe',
          email: 'jane@example.com',
          project_type: 'full-stack-web',
          message: 'We need a production React and Supabase web platform.',
          created_at: '2026-10-16T12:00:00.000Z',
        },
      };

      const extracted = extractRecord(webhookPayload);
      expect(extracted).not.toBeNull();
      expect(extracted?.name).toBe('Jane Doe');
      expect(extracted?.email).toBe('jane@example.com');
      expect(extracted?.project_type).toBe('full-stack-web');
      expect(extracted?.message).toBe('We need a production React and Supabase web platform.');
      expect(extracted?.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('extracts record from direct flat JSON payload', () => {
      const directPayload = {
        name: 'Alex Kariuki',
        email: 'alex@example.co.ke',
        project_type: 'backend-api-systems',
        message: 'Looking to architect high-throughput FastAPI and Postgres services.',
      };

      const extracted = extractRecord(directPayload);
      expect(extracted).not.toBeNull();
      expect(extracted?.name).toBe('Alex Kariuki');
      expect(extracted?.email).toBe('alex@example.co.ke');
      expect(extracted?.project_type).toBe('backend-api-systems');
      expect(extracted?.message).toBe(
        'Looking to architect high-throughput FastAPI and Postgres services.',
      );
    });

    it('returns null when required fields are missing or empty', () => {
      expect(extractRecord(null)).toBeNull();
      expect(extractRecord({})).toBeNull();
      expect(extractRecord({ name: 'Alex' })).toBeNull(); // missing email & message
      expect(extractRecord({ name: 'Alex', email: 'alex@test.com', message: '   ' })).toBeNull(); // whitespace message
    });
  });

  describe('escapeHtml', () => {
    it('properly sanitizes HTML entities and potential script injection', () => {
      const dangerous = '<script>alert("xss")</script> & \'quotes\'';
      const safe = escapeHtml(dangerous);

      expect(safe).not.toContain('<script>');
      expect(safe).toContain('&lt;script&gt;');
      expect(safe).toContain('&quot;xss&quot;');
      expect(safe).toContain('&#039;quotes&#039;');
      expect(safe).toContain('&amp;');
    });
  });

  describe('getProjectTypeLabel', () => {
    it('maps known project types to human-readable strings', () => {
      expect(getProjectTypeLabel('full-stack-web')).toBe('Full-Stack Web Application');
      expect(getProjectTypeLabel('backend-api-systems')).toBe('Backend & API Architecture');
      expect(getProjectTypeLabel('ai-data-pipeline')).toBe('AI / Data Pipeline Integration');
      expect(getProjectTypeLabel('technical-consulting')).toBe('Technical Consulting & Audit');
      expect(getProjectTypeLabel('other')).toBe('Other Enquiry');
      expect(getProjectTypeLabel(null)).toBe('General Enquiry');
      expect(getProjectTypeLabel(undefined)).toBe('General Enquiry');
    });

    it('preserves all project types matching PROJECT_TYPE_LABELS', () => {
      for (const [key, label] of Object.entries(PROJECT_TYPE_LABELS)) {
        expect(getProjectTypeLabel(key)).toBe(label);
      }
    });
  });

  describe('formatTimestamp', () => {
    it('produces both EAT (Africa/Nairobi) and UTC time representations', () => {
      const times = formatTimestamp('2026-10-16T12:00:00.000Z');
      expect(times.utc).toContain('GMT');
      expect(times.eat).toBeTruthy();
    });

    it('gracefully handles missing or invalid date strings', () => {
      const times = formatTimestamp('invalid-date');
      expect(times.eat).toBeTruthy();
      expect(times.utc).toBeTruthy();
    });
  });

  describe('buildEmailContent', () => {
    it('builds subject, HTML template, and text version with accurate metadata', () => {
      const record = {
        name: 'Sarah Connor',
        email: 'sarah@cyberdyne.io',
        project_type: 'ai-data-pipeline',
        message: 'Need an AI vision pipeline with rubric-based cognitive profiling.',
        id: 'rec-001',
        created_at: '2026-10-16T14:30:00.000Z',
      };

      const { subject, html, text } = buildEmailContent(record);

      expect(subject).toBe('[Portfolio Enquiry] Sarah Connor — AI / Data Pipeline Integration');

      // HTML validations
      expect(html).toContain('Sarah Connor');
      expect(html).toContain('sarah@cyberdyne.io');
      expect(html).toContain('AI / Data Pipeline Integration');
      expect(html).toContain('Need an AI vision pipeline');
      expect(html).toContain('rec-001');
      expect(html).toContain('GEOFFREY OBWOCHA // SYSTEMS ARCHITECT');
      expect(html).toContain('mailto:sarah%40cyberdyne.io');

      // Plain-text validations
      expect(text).toContain('NEW PORTFOLIO ENQUIRY — GEOFFREY OBWOCHA');
      expect(text).toContain('Client Name:    Sarah Connor');
      expect(text).toContain('Client Email:   sarah@cyberdyne.io');
      expect(text).toContain('Project Scope:  AI / Data Pipeline Integration');
      expect(text).toContain('Need an AI vision pipeline');
    });

    it('escapes user input in the generated HTML template', () => {
      const record = {
        name: '<b>Malicious</b>',
        email: 'attacker@evil.com"><script>alert(1)</script>',
        message: '<img src=x onerror=alert(1)>',
      };

      const { html } = buildEmailContent(record);

      expect(html).not.toContain('<b>Malicious</b>');
      expect(html).toContain('&lt;b&gt;Malicious&lt;/b&gt;');
      expect(html).not.toContain('<script>alert(1)</script>');
      expect(html).not.toContain('<img src=x onerror=alert(1)>');
    });
  });

  describe('isAuthorized', () => {
    it('allows request when no secret is configured', () => {
      const req = new Request('http://localhost', { method: 'POST' });
      expect(isAuthorized(req, undefined)).toBe(true);
      expect(isAuthorized(req, '')).toBe(true);
    });

    it('allows request when x-webhook-secret matches', () => {
      const req = new Request('http://localhost', {
        method: 'POST',
        headers: { 'x-webhook-secret': 'my-secret-key-123' },
      });
      expect(isAuthorized(req, 'my-secret-key-123')).toBe(true);
      expect(isAuthorized(req, 'wrong-key')).toBe(false);
    });

    it('allows request when Authorization Bearer matches', () => {
      const req = new Request('http://localhost', {
        method: 'POST',
        headers: { authorization: 'Bearer my-secret-key-123' },
      });
      expect(isAuthorized(req, 'my-secret-key-123')).toBe(true);
      expect(isAuthorized(req, 'wrong-key')).toBe(false);
    });
  });

  describe('handleNotifyEnquiry (HTTP Handler)', () => {
    it('responds to OPTIONS preflight with CORS headers', async () => {
      const req = new Request('http://localhost', { method: 'OPTIONS' });
      const res = await handleNotifyEnquiry(req);

      expect(res.status).toBe(200);
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(res.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    });

    it('rejects non-POST HTTP methods with 405', async () => {
      const req = new Request('http://localhost', { method: 'GET' });
      const res = await handleNotifyEnquiry(req);

      expect(res.status).toBe(405);
      const json = await res.json();
      expect(json.error).toBe('Method Not Allowed');
    });

    it('rejects invalid JSON payload with 400', async () => {
      const req = new Request('http://localhost', {
        method: 'POST',
        body: 'invalid-json{{{',
        headers: { 'Content-Type': 'application/json' },
      });
      const res = await handleNotifyEnquiry(req);

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('Invalid JSON payload');
    });

    it('rejects missing contact fields with 400', async () => {
      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ name: 'Only Name' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const res = await handleNotifyEnquiry(req);

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('Missing or invalid contact fields');
    });

    it('returns 401 when webhook secret fails authorization', async () => {
      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Jane Doe',
          email: 'jane@example.com',
          message: 'Hello Geoffrey',
        }),
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-secret': 'wrong-secret',
        },
      });

      const res = await handleNotifyEnquiry(req, {
        WEBHOOK_SECRET: 'correct-secret',
      });

      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe('Unauthorized webhook request');
    });

    it('returns 500 when RESEND_API_KEY is not configured', async () => {
      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Jane Doe',
          email: 'jane@example.com',
          message: 'Hello Geoffrey, this is a valid enquiry message.',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await handleNotifyEnquiry(req, {
        RESEND_API_KEY: '',
      });

      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.error).toContain('RESEND_API_KEY is not configured');
    });

    it('successfully calls Resend and returns 200 on valid email dispatch', async () => {
      const originalFetch = globalThis.fetch;
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ id: 'email_resend_12345' }),
      });
      globalThis.fetch = fetchMock;

      try {
        const req = new Request('http://localhost', {
          method: 'POST',
          body: JSON.stringify({
            record: {
              id: 'uuid-1234',
              name: 'Dennis Kiprop',
              email: 'dennis@example.com',
              project_type: 'backend-api-systems',
              message: 'Looking to hire you for systems design.',
            },
          }),
          headers: { 'Content-Type': 'application/json' },
        });

        const res = await handleNotifyEnquiry(req, {
          RESEND_API_KEY: 're_test_key_abc123',
          NOTIFICATION_RECIPIENT_EMAIL: 'ondiekobwocha@gmail.com',
        });

        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.ok).toBe(true);
        expect(json.id).toBe('email_resend_12345');
        expect(json.recipient).toBe('ondiekobwocha@gmail.com');

        // Check fetch payload
        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
        expect(url).toBe('https://api.resend.com/emails');
        expect(options.headers).toMatchObject({
          Authorization: 'Bearer re_test_key_abc123',
          'Content-Type': 'application/json',
        });

        const parsedBody = JSON.parse(options.body as string);
        expect(parsedBody.to).toEqual(['ondiekobwocha@gmail.com']);
        expect(parsedBody.reply_to).toBe('Dennis Kiprop <dennis@example.com>');
        expect(parsedBody.subject).toContain('Dennis Kiprop');
        expect(parsedBody.subject).toContain('Backend & API Architecture');
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it('returns 502 with Resend error message if Resend rejects the request', async () => {
      const originalFetch = globalThis.fetch;
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          message: 'Sender domain onboarding@resend.dev requires verified domain.',
        }),
      });
      globalThis.fetch = fetchMock;

      try {
        const req = new Request('http://localhost', {
          method: 'POST',
          body: JSON.stringify({
            name: 'Dennis Kiprop',
            email: 'dennis@example.com',
            message: 'Looking to hire you for systems design.',
          }),
          headers: { 'Content-Type': 'application/json' },
        });

        const res = await handleNotifyEnquiry(req, {
          RESEND_API_KEY: 're_test_key_abc123',
        });

        expect(res.status).toBe(502);
        const json = await res.json();
        expect(json.ok).toBe(false);
        expect(json.error).toContain(
          'Sender domain onboarding@resend.dev requires verified domain.',
        );
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it('deduplicates rapid dual-triggers without calling Resend twice', async () => {
      const originalFetch = globalThis.fetch;
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ id: 'email_first_call' }),
      });
      globalThis.fetch = fetchMock;

      try {
        const payload = JSON.stringify({
          name: 'Dual Trigger User',
          email: 'dual@example.com',
          message: 'This payload arrives both via direct invoke and DB webhook.',
        });

        // First call (e.g. from client direct invoke)
        const res1 = await handleNotifyEnquiry(
          new Request('http://localhost', {
            method: 'POST',
            body: payload,
            headers: { 'Content-Type': 'application/json' },
          }),
          { RESEND_API_KEY: 're_test_key_123' },
        );
        expect(res1.status).toBe(200);
        const json1 = await res1.json();
        expect(json1.ok).toBe(true);
        expect(json1.id).toBe('email_first_call');

        // Second call within seconds (e.g. from Database Webhook)
        const res2 = await handleNotifyEnquiry(
          new Request('http://localhost', {
            method: 'POST',
            body: payload,
            headers: { 'Content-Type': 'application/json' },
          }),
          { RESEND_API_KEY: 're_test_key_123' },
        );
        expect(res2.status).toBe(200);
        const json2 = await res2.json();
        expect(json2.ok).toBe(true);
        expect(json2.deduplicated).toBe(true);

        // Fetch should ONLY have been called ONCE
        expect(fetchMock).toHaveBeenCalledTimes(1);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });

  describe('isRecentDuplicate unit tests', () => {
    it('returns false on first submission and true on duplicate within 30s window', () => {
      const email = 'client@example.com';
      const msg = 'Need systems architecture audit.';

      expect(isRecentDuplicate(email, msg, 1000)).toBe(false);
      expect(isRecentDuplicate(email, msg, 5000)).toBe(true); // 4s later (< 30s)
      expect(isRecentDuplicate(email, msg, 20000)).toBe(true); // 19s later (< 30s)
      expect(isRecentDuplicate(email, msg, 32000)).toBe(false); // 31s later (> 30s window expired)
    });
  });
});
