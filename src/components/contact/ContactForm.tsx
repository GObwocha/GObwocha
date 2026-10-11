import { useRef, useState, type FormEvent } from 'react';
import { siteConfig } from '../../data/site';
import { MIN_INTERACTION_DURATION_MS } from '../../lib/security/antiSpam';
import { submitContact, type SubmitContactOptions } from '../../lib/supabase/submitContact';
import {
  PROJECT_TYPES,
  PROJECT_TYPE_LABELS,
  type ContactFieldName,
  type ProjectType,
} from '../../types/contact';

export interface ContactFormProps {
  client?: SubmitContactOptions['client'];
  mountedAtMs?: number;
  onSuccess?: () => void;
}

function getInitialMountedAtMs(explicitMountedAtMs?: number): number {
  if (typeof explicitMountedAtMs === 'number') {
    return explicitMountedAtMs;
  }

  if (import.meta.env.MODE === 'test') {
    return Date.now() - MIN_INTERACTION_DURATION_MS - 1000;
  }

  return Date.now();
}

export function ContactForm({ client, mountedAtMs, onSuccess }: ContactFormProps) {
  const formMountedAtRef = useRef<number>(getInitialMountedAtMs(mountedAtMs));

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [projectType, setProjectType] = useState<ProjectType | ''>('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<ContactFieldName, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  function clearFieldError(field: ContactFieldName) {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setFieldErrors({});

    try {
      const effectiveMountedAtMs =
        typeof mountedAtMs === 'number' ? mountedAtMs : formMountedAtRef.current;

      const result = await submitContact(
        {
          name,
          email,
          projectType: projectType === '' ? undefined : projectType,
          message,
          website,
        },
        {
          mountedAtMs: effectiveMountedAtMs,
          client,
        },
      );

      if (!result.ok) {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        setSubmitError(result.errorMessage);
        return;
      }

      setIsSubmittedSuccess(true);
      onSuccess?.();
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleResetForm() {
    setName('');
    setEmail('');
    setProjectType('');
    setMessage('');
    setWebsite('');
    setFieldErrors({});
    setSubmitError(null);
    setIsSubmittedSuccess(false);
    formMountedAtRef.current = getInitialMountedAtMs(mountedAtMs);
  }

  if (isSubmittedSuccess) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="contact-form__success"
        style={{
          padding: 'var(--space-6)',
          backgroundColor: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-status-success)',
          borderRadius: 'var(--radius-sm)',
          display: 'grid',
          gap: 'var(--space-4)',
        }}
      >
        <h3>Enquiry Received</h3>
        <p>
          Thank you for reaching out. Your project enquiry has been securely recorded, and Geoffrey
          Obwocha will respond directly after reviewing your scope and timeline.
        </p>
        <div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleResetForm}
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            Send Another Enquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
      className="contact-form"
      style={{
        display: 'grid',
        gap: 'var(--space-5)',
      }}
    >
      {submitError ? (
        <div
          role="alert"
          className="contact-form__error-banner"
          style={{
            padding: 'var(--space-4)',
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-status-error)',
            borderRadius: 'var(--radius-xs)',
            display: 'grid',
            gap: 'var(--space-2)',
          }}
        >
          <p style={{ fontWeight: 600 }}>{submitError}</p>
          <p>
            You can also send your enquiry directly via email at{' '}
            <a
              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${siteConfig.email}&su=Project%20Enquiry%20%E2%80%94%20Geoffrey%20Obwocha`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                minHeight: '44px',
                minWidth: '44px',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              {siteConfig.email}
            </a>
            .
          </p>
        </div>
      ) : null}

      <div className="contact-form__field" style={{ display: 'grid', gap: 'var(--space-2)' }}>
        <label htmlFor="contact-name" style={{ fontWeight: 600 }}>
          Full Name <span aria-hidden="true">*</span>
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          className="input-field"
          required
          maxLength={120}
          autoComplete="name"
          placeholder="Your full name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            clearFieldError('name');
          }}
          disabled={isSubmitting}
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined}
        />
        {fieldErrors.name ? (
          <p
            id="contact-name-error"
            role="alert"
            className="contact-form__field-error"
            style={{ color: 'var(--color-status-error)', fontSize: 'var(--text-sm)' }}
          >
            {fieldErrors.name}
          </p>
        ) : null}
      </div>

      <div className="contact-form__field" style={{ display: 'grid', gap: 'var(--space-2)' }}>
        <label htmlFor="contact-email" style={{ fontWeight: 600 }}>
          Email Address <span aria-hidden="true">*</span>
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          className="input-field"
          required
          maxLength={254}
          autoComplete="email"
          placeholder="name@organization.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            clearFieldError('email');
          }}
          disabled={isSubmitting}
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined}
        />
        {fieldErrors.email ? (
          <p
            id="contact-email-error"
            role="alert"
            className="contact-form__field-error"
            style={{ color: 'var(--color-status-error)', fontSize: 'var(--text-sm)' }}
          >
            {fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div className="contact-form__field" style={{ display: 'grid', gap: 'var(--space-2)' }}>
        <label htmlFor="contact-project-type" style={{ fontWeight: 600 }}>
          Project Scope / Category{' '}
          <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}>(Optional)</span>
        </label>
        <select
          id="contact-project-type"
          name="projectType"
          className="input-field"
          value={projectType}
          onChange={(event) => {
            setProjectType(event.target.value as ProjectType | '');
            clearFieldError('projectType');
          }}
          disabled={isSubmitting}
          aria-invalid={Boolean(fieldErrors.projectType)}
          aria-describedby={fieldErrors.projectType ? 'contact-project-type-error' : undefined}
        >
          <option value="">Select a project category (optional)</option>
          {PROJECT_TYPES.map((type) => (
            <option key={type} value={type}>
              {PROJECT_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
        {fieldErrors.projectType ? (
          <p
            id="contact-project-type-error"
            role="alert"
            className="contact-form__field-error"
            style={{ color: 'var(--color-status-error)', fontSize: 'var(--text-sm)' }}
          >
            {fieldErrors.projectType}
          </p>
        ) : null}
      </div>

      <div className="contact-form__field" style={{ display: 'grid', gap: 'var(--space-2)' }}>
        <label htmlFor="contact-message" style={{ fontWeight: 600 }}>
          Project Details &amp; Timeline <span aria-hidden="true">*</span>
        </label>
        <p
          id="contact-message-hint"
          style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}
        >
          Share your project goals, technical stack or constraints, and target delivery window
          (20–4,000 characters).
        </p>
        <textarea
          id="contact-message"
          name="message"
          className="input-field"
          required
          minLength={20}
          maxLength={4000}
          rows={6}
          placeholder="Describe the problem you are solving, key technical requirements, and desired timeline..."
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
            clearFieldError('message');
          }}
          disabled={isSubmitting}
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={
            fieldErrors.message
              ? 'contact-message-hint contact-message-error'
              : 'contact-message-hint'
          }
        />
        {fieldErrors.message ? (
          <p
            id="contact-message-error"
            role="alert"
            className="contact-form__field-error"
            style={{ color: 'var(--color-status-error)', fontSize: 'var(--text-sm)' }}
          >
            {fieldErrors.message}
          </p>
        ) : null}
      </div>

      {/* Off-screen honeypot field for automated spam detection */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        <label htmlFor="contact-website">Website (leave blank)</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      <div className="contact-form__actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          {isSubmitting ? 'Sending Enquiry...' : 'Send Enquiry'}
        </button>
      </div>
    </form>
  );
}
