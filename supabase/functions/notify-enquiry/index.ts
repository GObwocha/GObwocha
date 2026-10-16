// Supabase Edge Function: notify-enquiry
// Dispatches structured email notifications to Geoffrey Obwocha (ondiekobwocha@gmail.com) via Resend
// Triggered automatically by Supabase Database Webhooks on public.contact_submissions INSERT.

declare const Deno:
  | {
      env: {
        get(key: string): string | undefined;
      };
      serve(handler: (req: Request) => Promise<Response> | Response): void;
    }
  | undefined;

export interface ContactRecord {
  id?: string;
  name: string;
  email: string;
  project_type?: string | null;
  message: string;
  created_at?: string;
}

export interface WebhookPayload {
  type?: string;
  table?: string;
  schema?: string;
  record?: Partial<ContactRecord>;
  old_record?: unknown;
}

export const PROJECT_TYPE_LABELS: Record<string, string> = {
  'full-stack-web': 'Full-Stack Web Application',
  'backend-api-systems': 'Backend & API Architecture',
  'ai-data-pipeline': 'AI / Data Pipeline Integration',
  'technical-consulting': 'Technical Consulting & Audit',
  other: 'Other Enquiry',
};

export const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-webhook-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/**
 * Escapes HTML characters to prevent XSS/injection in email viewers.
 */
export function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Resolves human-readable label for project type enum.
 */
export function getProjectTypeLabel(type?: string | null): string {
  if (!type) return 'General Enquiry';
  return PROJECT_TYPE_LABELS[type] ?? type;
}

/**
 * Formats timestamps into readable EAT (UTC+3) and UTC representations.
 */
export function formatTimestamp(isoString?: string): { eat: string; utc: string } {
  const date = isoString ? new Date(isoString) : new Date();
  if (isNaN(date.getTime())) {
    const fallback = new Date();
    return {
      eat: fallback.toLocaleString('en-US', { timeZone: 'Africa/Nairobi' }),
      utc: fallback.toUTCString(),
    };
  }

  const eat = date.toLocaleString('en-US', {
    timeZone: 'Africa/Nairobi',
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const utc = date.toUTCString();

  return { eat, utc };
}

/**
 * Extracts and validates a ContactRecord from either a Database Webhook payload or a direct POST.
 */
export function extractRecord(body: unknown): ContactRecord | null {
  if (!body || typeof body !== 'object') {
    return null;
  }

  const payload = body as Record<string, unknown>;

  // Check for Supabase Database Webhook shape: { record: { ... } }
  const candidate = (
    payload.record && typeof payload.record === 'object' ? payload.record : payload
  ) as Record<string, unknown>;

  const name = typeof candidate.name === 'string' ? candidate.name.trim() : '';
  const email = typeof candidate.email === 'string' ? candidate.email.trim() : '';
  const message = typeof candidate.message === 'string' ? candidate.message.trim() : '';
  const project_type =
    typeof candidate.project_type === 'string' ? candidate.project_type.trim() : null;
  const id = typeof candidate.id === 'string' ? candidate.id : undefined;
  const created_at = typeof candidate.created_at === 'string' ? candidate.created_at : undefined;

  if (!name || !email || !message) {
    return null;
  }

  return {
    id,
    name,
    email,
    project_type,
    message,
    created_at,
  };
}

/**
 * Generates email subject, HTML template, and plain-text fallback.
 */
export function buildEmailContent(record: ContactRecord): {
  subject: string;
  html: string;
  text: string;
} {
  const projectTypeDisplay = getProjectTypeLabel(record.project_type);
  const time = formatTimestamp(record.created_at);
  const subject = `[Portfolio Enquiry] ${record.name} — ${projectTypeDisplay}`;

  const safeName = escapeHtml(record.name);
  const safeEmail = escapeHtml(record.email);
  const safeScope = escapeHtml(projectTypeDisplay);
  const safeMessage = escapeHtml(record.message);
  const safeId = record.id ? escapeHtml(record.id) : 'N/A';

  const replyMailtoUrl = `mailto:${encodeURIComponent(record.email)}?subject=${encodeURIComponent(
    `Re: Portfolio Enquiry — Geoffrey Obwocha`,
  )}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0A0A09; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F5F3EE; line-height: 1.6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0A0A09; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #121210; border: 1px solid #262522; border-radius: 8px; overflow: hidden;">
          
          <!-- Brand Header -->
          <tr>
            <td style="padding: 24px 28px; background-color: #181815; border-bottom: 2px solid #FF4D1C;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-family: monospace; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: #FF4D1C; font-weight: bold; display: block; margin-bottom: 4px;">
                      GEOFFREY OBWOCHA // SYSTEMS ARCHITECT
                    </span>
                    <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #F5F3EE; letter-spacing: -0.02em;">
                      New Client Enquiry Received
                    </h1>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="display: inline-block; padding: 4px 10px; background-color: #262522; color: #B8B3A8; font-family: monospace; font-size: 11px; border-radius: 4px;">
                      EAT (UTC+3)
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Client Ledger Table -->
          <tr>
            <td style="padding: 24px 28px 16px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #8A857A; width: 130px; font-weight: 500;">Client Name:</td>
                  <td style="padding: 8px 0; color: #F5F3EE; font-weight: 600;">${safeName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #8A857A; font-weight: 500;">Client Email:</td>
                  <td style="padding: 8px 0;">
                    <a href="mailto:${safeEmail}" style="color: #FF4D1C; text-decoration: none; font-weight: 600;">${safeEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #8A857A; font-weight: 500;">Project Scope:</td>
                  <td style="padding: 8px 0;">
                    <span style="display: inline-block; padding: 2px 8px; background-color: #1A1A18; border: 1px solid #3D3B36; color: #F5F3EE; font-size: 12px; border-radius: 4px;">
                      ${safeScope}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #8A857A; font-weight: 500;">Received:</td>
                  <td style="padding: 8px 0; color: #B8B3A8; font-size: 13px;">${time.eat} EAT <span style="color: #5C5850;">(${time.utc})</span></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #8A857A; font-weight: 500;">Enquiry ID:</td>
                  <td style="padding: 8px 0; color: #5C5850; font-family: monospace; font-size: 12px;">${safeId}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Box -->
          <tr>
            <td style="padding: 8px 28px 24px 28px;">
              <div style="font-size: 11px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.1em; color: #8A857A; margin-bottom: 8px;">
                Client Message
              </div>
              <div style="background-color: #0A0A09; border-left: 3px solid #FF4D1C; border-top: 1px solid #262522; border-right: 1px solid #262522; border-bottom: 1px solid #262522; border-radius: 0 4px 4px 0; padding: 18px 20px; font-size: 15px; color: #F5F3EE; white-space: pre-wrap; line-height: 1.65;">
${safeMessage}
              </div>
            </td>
          </tr>

          <!-- Quick Action CTA -->
          <tr>
            <td style="padding: 0 28px 28px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <a href="${replyMailtoUrl}" style="display: inline-block; background-color: #FF4D1C; color: #0A0A09; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 4px; letter-spacing: 0.02em;">
                      Reply Directly to ${safeName} &rarr;
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 12px; font-size: 12px; color: #8A857A; line-height: 1.5;">
                    💡 <strong>Quick Reply:</strong> You can also hit <em>Reply</em> in your email client. The <code>Reply-To</code> header is already configured to <strong>${safeName} &lt;${safeEmail}&gt;</strong>.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Metadata -->
          <tr>
            <td style="padding: 16px 28px; background-color: #0E0E0C; border-top: 1px solid #262522; font-size: 12px; color: #5C5850; text-align: center;">
              Dispatched automatically by Supabase Edge Function (<code>notify-enquiry</code>) for
              <a href="https://gobwocha.vercel.app" style="color: #8A857A; text-decoration: underline;">gobwocha.vercel.app</a>.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `NEW PORTFOLIO ENQUIRY — GEOFFREY OBWOCHA
============================================================
Client Name:    ${record.name}
Client Email:   ${record.email}
Project Scope:  ${projectTypeDisplay}
Received (EAT): ${time.eat} EAT
Received (UTC): ${time.utc}
Enquiry ID:     ${record.id || 'N/A'}

MESSAGE:
------------------------------------------------------------
${record.message}
------------------------------------------------------------

HOW TO REPLY:
Simply hit "Reply" in your email client, or write directly to:
${record.email}

--
Dispatched by Supabase Edge Function (notify-enquiry) for gobwocha.vercel.app`;

  return { subject, html, text };
}

/**
 * Validates request authorization header against optional WEBHOOK_SECRET.
 */
export function isAuthorized(req: Request, webhookSecret?: string): boolean {
  if (!webhookSecret || webhookSecret.trim() === '') {
    // If no secret configured, allow (standard development or unauthenticated webhook)
    return true;
  }

  const authHeader = req.headers.get('authorization') ?? '';
  const xSecretHeader = req.headers.get('x-webhook-secret') ?? '';

  if (xSecretHeader === webhookSecret) {
    return true;
  }

  if (authHeader.startsWith('Bearer ') && authHeader.slice(7) === webhookSecret) {
    return true;
  }

  return false;
}

/**
 * Main request handler for notify-enquiry Edge Function.
 */
export async function handleNotifyEnquiry(
  req: Request,
  envOverride?: Record<string, string | undefined>,
): Promise<Response> {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, error: 'Method Not Allowed' }), {
      status: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  const getEnv = (key: string): string | undefined => {
    if (envOverride && key in envOverride) {
      return envOverride[key];
    }
    if (typeof Deno !== 'undefined' && Deno?.env) {
      return Deno.env.get(key);
    }
    return undefined;
  };

  // Optional webhook secret check
  const webhookSecret = getEnv('WEBHOOK_SECRET');
  if (!isAuthorized(req, webhookSecret)) {
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized webhook request' }), {
      status: 401,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  // Parse JSON body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON payload' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  const record = extractRecord(body);
  if (!record) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'Missing or invalid contact fields (name, email, and message are required)',
      }),
      {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      },
    );
  }

  const resendApiKey = getEnv('RESEND_API_KEY');
  if (!resendApiKey) {
    console.error('ERROR: RESEND_API_KEY environment variable is not configured.');
    return new Response(
      JSON.stringify({
        ok: false,
        error:
          'RESEND_API_KEY is not configured in Supabase Edge Functions secrets. Set via: supabase secrets set RESEND_API_KEY=re_...',
      }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      },
    );
  }

  const recipientEmail = getEnv('NOTIFICATION_RECIPIENT_EMAIL') || 'ondiekobwocha@gmail.com';
  const senderEmail =
    getEnv('NOTIFICATION_SENDER_EMAIL') || 'Portfolio Enquiries <onboarding@resend.dev>';

  const emailContent = buildEmailContent(record);

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: senderEmail,
        to: [recipientEmail],
        reply_to: `${record.name} <${record.email}>`,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      }),
    });

    const resendData = (await resendRes.json()) as { id?: string; message?: string; name?: string };

    if (!resendRes.ok) {
      console.error('Resend API error:', resendData);
      return new Response(
        JSON.stringify({
          ok: false,
          error: resendData.message || 'Failed to dispatch email via Resend',
        }),
        {
          status: 502,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        },
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        message: 'Notification email dispatched successfully',
        id: resendData.id,
        recipient: recipientEmail,
      }),
      {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      },
    );
  } catch (err) {
    console.error('Network or fetch error connecting to Resend:', err);
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'Network failure communicating with email service provider',
      }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      },
    );
  }
}

// In Deno runtime, start server automatically
if (typeof Deno !== 'undefined' && typeof Deno.serve === 'function') {
  Deno.serve((req: Request) => handleNotifyEnquiry(req));
}
