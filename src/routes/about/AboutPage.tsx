import { Link } from 'react-router';
import { siteConfig } from '../../data/site';

export function AboutPage() {
  return (
    <div
      className="about-page container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-section)',
        paddingBlock: 'var(--space-10)',
      }}
    >
      {/* Hero & Biography Section */}
      <section
        aria-labelledby="about-heading"
        className="about-hero-section"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-6)',
          paddingBottom: 'var(--space-10)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <p className="eyebrow section-eyebrow">
          Profile // {siteConfig.location} ({siteConfig.timezone})
        </p>

        <h1 id="about-heading" className="text-h1">
          About {siteConfig.name}
        </h1>

        <p className="text-body-lg section-lead" style={{ color: 'var(--color-text-primary)' }}>
          <strong>{siteConfig.role}</strong> — {siteConfig.tagline}
        </p>

        <div
          className="about-biography"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
            color: 'var(--color-text-secondary)',
          }}
        >
          {siteConfig.biography.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      {/* 01 // Academic & Engineering Community Section */}
      <section
        aria-labelledby="background-heading"
        className="about-background-section"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-6)',
          paddingBottom: 'var(--space-10)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <p className="eyebrow section-eyebrow">01 // Academic &amp; Community Foundation</p>
          <h2 id="background-heading" className="text-h2">
            University of Nairobi &amp; Chiromo Tech Club
          </h2>
        </div>

        <p style={{ color: 'var(--color-text-secondary)' }}>
          Grounded in <strong>Computer Science at the University of Nairobi</strong> and active in
          collaborative systems engineering with the <strong>Chiromo Tech Club</strong>,{' '}
          {siteConfig.name} pairs formal computer science fundamentals with practical engineering
          for East African and global digital ecosystems.
        </p>

        <dl
          className="about-affiliation-ledger"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'var(--space-6)',
            padding: 'var(--space-6)',
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <div>
            <dt className="text-mono-label">Academic Discipline</dt>
            <dd style={{ marginTop: 'var(--space-1)', color: 'var(--color-text-primary)' }}>
              Computer Science — University of Nairobi
            </dd>
          </div>

          <div>
            <dt className="text-mono-label">Engineering Community</dt>
            <dd style={{ marginTop: 'var(--space-1)', color: 'var(--color-text-primary)' }}>
              Chiromo Tech Club, University of Nairobi
            </dd>
          </div>

          <div>
            <dt className="text-mono-label">Location &amp; Timezone</dt>
            <dd style={{ marginTop: 'var(--space-1)', color: 'var(--color-text-primary)' }}>
              {siteConfig.location} // {siteConfig.timezone}
            </dd>
          </div>

          <div>
            <dt className="text-mono-label">Availability</dt>
            <dd style={{ marginTop: 'var(--space-1)', color: 'var(--color-text-primary)' }}>
              {siteConfig.availability}
            </dd>
          </div>
        </dl>
      </section>

      {/* 02 // Working Approach & Principles */}
      <section
        aria-labelledby="approach-heading"
        className="about-approach-section"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-8)',
          paddingBottom: 'var(--space-10)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <p className="eyebrow section-eyebrow">02 // Operating Philosophy</p>
          <h2 id="approach-heading" className="text-h2">
            Working Approach &amp; Engineering Principles
          </h2>
        </div>

        <div
          className="principles-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--space-6)',
          }}
        >
          {siteConfig.workingPrinciples.map((principle, idx) => {
            const code = String(idx + 1).padStart(2, '0');
            return (
              <article
                key={principle.title}
                className="principle-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-6)',
                  backgroundColor: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <p className="eyebrow principle-card__code">PRINCIPLE // {code}</p>
                <h3 className="text-h3">{principle.title}</h3>
                <p style={{ color: 'var(--color-text-secondary)' }}>{principle.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* 03 // Detailed Capabilities & Technical Stack Matrix */}
      <section
        aria-labelledby="skills-heading"
        className="about-skills-section"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-8)',
          paddingBottom: 'var(--space-10)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <p className="eyebrow section-eyebrow">03 // Technical Matrix</p>
          <h2 id="skills-heading" className="text-h2">
            Core Capabilities &amp; Technical Stack
          </h2>
        </div>

        <div
          className="capabilities-matrix"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: 'var(--space-6)',
          }}
        >
          {siteConfig.capabilities.map((pillar) => (
            <article
              key={pillar.id}
              className="capability-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
                padding: 'var(--space-6)',
                backgroundColor: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <p className="eyebrow">CAP // {pillar.index}</p>
              <h3 className="text-h3">{pillar.title}</h3>
              <p style={{ color: 'var(--color-text-secondary)' }}>{pillar.summary}</p>

              <div>
                <p className="text-mono-label" style={{ marginBottom: 'var(--space-2)' }}>
                  Key Deliverables
                </p>
                <ul
                  aria-label={`${pillar.title} deliverables`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-2)',
                    paddingLeft: 'var(--space-4)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {pillar.deliverables.map((deliverable) => (
                    <li key={deliverable} style={{ fontSize: 'var(--text-sm)' }}>
                      {deliverable}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: 'var(--space-2)' }}>
                <p className="text-mono-label" style={{ marginBottom: 'var(--space-2)' }}>
                  Verified Technologies
                </p>
                <ul
                  aria-label={`${pillar.title} technologies`}
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 'var(--space-2)',
                    listStyle: 'none',
                  }}
                >
                  {pillar.technologies.map((tech) => (
                    <li
                      key={tech}
                      className="text-mono-label"
                      style={{
                        padding: 'var(--space-1) var(--space-2)',
                        border: '1px solid var(--color-border-strong)',
                        borderRadius: 'var(--radius-xs)',
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 04 // Direct Contact & GitHub CTA */}
      <section
        aria-labelledby="about-cta-heading"
        className="about-cta-section"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          padding: 'var(--space-8)',
          backgroundColor: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border-strong)',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        <p className="eyebrow section-eyebrow">04 // Initiate Enquiry</p>
        <h2 id="about-cta-heading" className="text-h2">
          Discuss an engineering role, system architecture, or product build
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Connect directly to review project requirements, technical trade-offs, or open-source work
          on GitHub.
        </p>
        <div
          className="about-cta"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
            paddingTop: 'var(--space-2)',
          }}
        >
          <Link
            to="/contact"
            className="btn btn-primary cta-primary"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            Start a Conversation
          </Link>
          <a
            href={siteConfig.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary cta-secondary"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            Explore GitHub (@{siteConfig.handle})
          </a>
        </div>
      </section>
    </div>
  );
}
