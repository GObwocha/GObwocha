import { ContactForm, type ContactFormProps } from '../../components/contact/ContactForm';
import { siteConfig } from '../../data/site';

export type ContactPageProps = ContactFormProps;

export function ContactPage({ client, mountedAtMs, onSuccess }: ContactPageProps = {}) {
  return (
    <div
      className="contact-page"
      style={{
        display: 'grid',
        gap: 'var(--space-10)',
        paddingBlock: 'var(--space-8)',
      }}
    >
      <section aria-labelledby="contact-heading" className="contact-hero-section">
        <p className="section-eyebrow">
          Enquiries // {siteConfig.location} ({siteConfig.timezone})
        </p>
        <h1 id="contact-heading">Contact &amp; Project Enquiries</h1>
        <p className="section-lead">
          Have a software product to architect, a web platform to refine, or an engineering
          collaboration in mind? Share the context of your project below or reach out directly via
          email.
        </p>
      </section>

      <section
        aria-labelledby="enquiry-form-heading"
        className="contact-form-section"
        style={{
          display: 'grid',
          gap: 'var(--space-6)',
        }}
      >
        <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
          <h2 id="enquiry-form-heading">01 // Send a Project Enquiry</h2>
          <p>
            To help evaluate scope and timeline quickly, include your project goals, current
            technical stack or constraints, and target delivery window. After submission, your
            enquiry is recorded in our database and reviewed directly by {siteConfig.name} for a
            personal response.
          </p>
        </div>

        <ContactForm client={client} mountedAtMs={mountedAtMs} onSuccess={onSuccess} />

        <p
          className="contact-privacy-notice"
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-sm)',
          }}
        >
          {siteConfig.privacyNotice}
        </p>
      </section>

      <section
        aria-labelledby="direct-channels-heading"
        className="contact-channels-section"
        style={{
          display: 'grid',
          gap: 'var(--space-4)',
        }}
      >
        <h2 id="direct-channels-heading">02 // Direct Contact Channels</h2>
        <p>
          Prefer direct correspondence or reviewing open-source work first? Reach out through any of
          the verified channels below:
        </p>
        <dl
          className="contact-channels-ledger"
          style={{
            display: 'grid',
            gap: 'var(--space-4)',
          }}
        >
          <div className="contact-channels-ledger__item">
            <dt style={{ fontWeight: 600 }}>Direct Email</dt>
            <dd>
              <a
                href={`mailto:${siteConfig.email}`}
                style={{
                  minHeight: '44px',
                  minWidth: '44px',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                {siteConfig.email}
              </a>
            </dd>
          </div>
          <div className="contact-channels-ledger__item">
            <dt style={{ fontWeight: 600 }}>GitHub</dt>
            <dd>
              <a
                href={siteConfig.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  minHeight: '44px',
                  minWidth: '44px',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                {siteConfig.githubUrl}
              </a>
            </dd>
          </div>
          <div className="contact-channels-ledger__item">
            <dt style={{ fontWeight: 600 }}>Location &amp; Timezone</dt>
            <dd>
              {siteConfig.location} ({siteConfig.timezone})
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
