import { PROJECT_TYPE_LABELS, type ContactSubmissionInsert } from '../../types/contact';

export interface EmailJsConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

/**
 * Reads public EmailJS client credentials from Vite environment variables.
 */
export function getEmailJsConfig(): EmailJsConfig | null {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (serviceId && templateId && publicKey) {
    return { serviceId, templateId, publicKey };
  }

  return null;
}

/**
 * Dispatches a formatted notification email directly using the EmailJS REST API.
 * - Works directly with personal Gmail accounts without requiring custom domain DNS verification.
 * - Runs in the background without blocking contact form submission UX.
 */
export async function sendEmailWithEmailJs(
  submission: ContactSubmissionInsert,
  configOverride?: EmailJsConfig,
): Promise<{ ok: boolean; error?: string }> {
  const config = configOverride ?? getEmailJsConfig();

  if (!config) {
    // Graceful fallback when EmailJS variables are not yet configured in the environment
    return { ok: false, error: 'EmailJS environment variables are not configured' };
  }

  const projectTypeDisplay = submission.project_type
    ? PROJECT_TYPE_LABELS[submission.project_type]
    : 'General Enquiry';

  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: 'Africa/Nairobi',
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const payload = {
    service_id: config.serviceId,
    template_id: config.templateId,
    user_id: config.publicKey,
    template_params: {
      from_name: submission.name,
      from_email: submission.email,
      reply_to: submission.email,
      project_type: projectTypeDisplay,
      message: submission.message,
      timestamp: `${timestamp} EAT`,
    },
  };

  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return { ok: false, error: errorText || `HTTP error ${res.status}` };
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
