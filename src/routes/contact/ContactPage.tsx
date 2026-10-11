export function ContactPage() {
  return (
    <div className="contact-page">
      <section aria-labelledby="contact-heading" className="contact-hero-section">
        <p className="section-eyebrow">Enquiries // Nairobi, Kenya (EAT / UTC+3)</p>
        <h1 id="contact-heading">Contact &amp; Project Enquiries</h1>
        <p className="section-lead">
          Have a software product to architect, a web platform to refine, or an engineering
          collaboration in mind? Share the context of your project below or reach out directly via
          email.
        </p>
      </section>

      <section aria-labelledby="enquiry-process-heading" className="contact-enquiry-section">
        <h2 id="enquiry-process-heading">01 // What to Include in Your Enquiry</h2>
        <p>
          To help evaluate scope and timeline quickly, include your project goals, current technical
          stack or constraints, and target delivery window. Every enquiry receives a direct response
          after review.
        </p>
      </section>

      <section aria-labelledby="direct-channels-heading" className="contact-channels-section">
        <h2 id="direct-channels-heading">02 // Direct Contact Channels</h2>
        <dl className="contact-channels-ledger">
          <div className="contact-channels-ledger__item">
            <dt>Direct Email</dt>
            <dd>
              <a
                href="mailto:ondiekobwocha@gmail.com"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                ondiekobwocha@gmail.com
              </a>
            </dd>
          </div>
          <div className="contact-channels-ledger__item">
            <dt>GitHub</dt>
            <dd>
              <a
                href="https://github.com/GObwocha"
                target="_blank"
                rel="noopener noreferrer"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                https://github.com/GObwocha
              </a>
            </dd>
          </div>
          <div className="contact-channels-ledger__item">
            <dt>Location</dt>
            <dd>Nairobi, Kenya</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
