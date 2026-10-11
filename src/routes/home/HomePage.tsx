import { Link } from 'react-router';
import { getFeaturedProjects, projects } from '../../data/projects';
import { siteConfig } from '../../data/site';

const VERIFIED_DOMAINS = [
  'Full-Stack Web',
  'Backend & RLS Systems',
  'Geospatial & AI Pipelines',
  'Kenyan Fintech & Telecom',
] as const;

export function HomePage() {
  const featuredProjects = getFeaturedProjects();

  return (
    <div
      className="home-page container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-section)',
        paddingBlock: 'var(--space-10)',
      }}
    >
      {/* Above-the-Fold Hero Section */}
      <section
        aria-labelledby="hero-heading"
        className="hero-section"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-6)',
          paddingBottom: 'var(--space-10)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div
          className="hero-meta"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 'var(--space-3)',
          }}
        >
          <p className="eyebrow section-eyebrow">
            {siteConfig.location} // {siteConfig.timezone}
          </p>
          <span
            className="text-mono-label"
            style={{
              padding: 'var(--space-1) var(--space-3)',
              border: '1px solid var(--color-border-strong)',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--color-bg-elevated)',
              color: 'var(--color-text-secondary)',
            }}
          >
            {siteConfig.availability}
          </span>
        </div>

        <h1 id="hero-heading" className="text-display-hero">
          {siteConfig.name} — {siteConfig.role}
        </h1>

        <p className="text-body-lg hero-lead" style={{ color: 'var(--color-text-secondary)' }}>
          {siteConfig.valueProposition}
        </p>

        <div
          className="hero-actions"
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
          <Link
            to="/work"
            className="btn btn-secondary cta-secondary"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            Explore Selected Work
          </Link>
        </div>

        {/* Architectural Telemetry Strip */}
        <div
          className="hero-telemetry"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-4)',
            paddingTop: 'var(--space-6)',
            marginTop: 'var(--space-4)',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <div>
            <p className="text-mono-label">AFFILIATION</p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              {siteConfig.affiliation}
            </p>
          </div>
          <div>
            <p className="text-mono-label">VERIFIED DOMAINS</p>
            <ul
              aria-label="Verified engineering domains"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--space-2)',
                listStyle: 'none',
                marginTop: 'var(--space-1)',
              }}
            >
              {VERIFIED_DOMAINS.map((domain) => (
                <li
                  key={domain}
                  className="text-mono-label"
                  style={{
                    color: 'var(--color-text-primary)',
                    padding: '2px var(--space-2)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xs)',
                  }}
                >
                  {domain}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 01 // Selected Work Section */}
      <section
        aria-labelledby="featured-work-heading"
        className="featured-work-section"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-8)',
          paddingBottom: 'var(--space-10)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div
          className="section-header"
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
        >
          <p className="eyebrow section-eyebrow">01 // Selected Work</p>
          <h2 id="featured-work-heading" className="text-h2">
            Featured Engineering Case Studies
          </h2>
          <p className="text-body-lg section-lead" style={{ color: 'var(--color-text-secondary)' }}>
            Production systems and collaborative platforms examined through problem context,
            architectural decisions, and verified engineering outcomes.
          </p>
        </div>

        <div
          className="project-preview-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 440px), 1fr))',
            gap: 'var(--space-8)',
          }}
        >
          {featuredProjects.map((project, idx) => {
            const indexLabel = String(idx + 1).padStart(2, '0');
            return (
              <article
                key={project.slug}
                className="project-preview-card"
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
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    flexWrap: 'wrap',
                  }}
                >
                  <span className="text-mono-label project-preview-card__index">
                    {indexLabel} // {project.category}
                  </span>
                  <time dateTime={project.publishedAt} className="text-mono-label">
                    {project.publishedAt}
                  </time>
                </div>

                <div
                  className="project-preview-card__media"
                  style={{
                    aspectRatio: '16 / 10',
                    width: '100%',
                    overflow: 'hidden',
                    backgroundColor: 'var(--color-bg-subtle)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xs)',
                  }}
                >
                  <img
                    src={project.coverImage}
                    alt={project.altText}
                    width={800}
                    height={500}
                    loading="lazy"
                    decoding="async"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>

                <h3 className="text-h3">
                  <Link
                    to={`/work/${project.slug}`}
                    className="project-preview-card__link"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      minHeight: '44px',
                      minWidth: '44px',
                    }}
                  >
                    {project.title} — {project.subtitle}
                  </Link>
                </h3>

                <p
                  className="project-preview-card__summary"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {project.summary}
                </p>

                {project.teammates && project.teammates.length > 0 && (
                  <p
                    className="project-preview-card__teammates"
                    style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}
                  >
                    <strong>Collaborative Team:</strong>{' '}
                    {project.teammates
                      .map((member) =>
                        member.githubHandle
                          ? `${member.name} (@${member.githubHandle})`
                          : member.name,
                      )
                      .join(', ')}
                  </p>
                )}

                <ul
                  className="project-preview-card__tags"
                  aria-label={`${project.title} technologies`}
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 'var(--space-2)',
                    listStyle: 'none',
                    marginTop: 'auto',
                    paddingTop: 'var(--space-2)',
                  }}
                >
                  {project.technologies.map((tech) => (
                    <li
                      key={tech}
                      className="text-mono-label project-preview-card__tag"
                      style={{
                        padding: 'var(--space-1) var(--space-2)',
                        border: '1px solid var(--color-border-strong)',
                        borderRadius: 'var(--radius-xs)',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {tech}
                    </li>
                  ))}
                </ul>

                {project.liveUrl && (
                  <div style={{ paddingTop: 'var(--space-2)' }}>
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{ minHeight: '44px', minWidth: '44px' }}
                    >
                      Launch Live Solution — {project.title}
                    </a>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <div className="section-footer">
          <Link
            to="/work"
            className="btn btn-secondary cta-secondary"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            View All {projects.length} Case Studies
          </Link>
        </div>
      </section>

      {/* 02 // Capabilities Section */}
      <section
        aria-labelledby="capabilities-heading"
        className="capabilities-section"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-8)',
          paddingBottom: 'var(--space-10)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div
          className="section-header"
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
        >
          <p className="eyebrow section-eyebrow">02 // Capabilities</p>
          <h2 id="capabilities-heading" className="text-h2">
            Core Engineering Disciplines
          </h2>
          <p className="text-body-lg section-lead" style={{ color: 'var(--color-text-secondary)' }}>
            End-to-end systems architecture and product execution grounded in strict type safety,
            verifiable data boundaries, and accessible interfaces.
          </p>
        </div>

        <div
          className="capabilities-grid"
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
              <p className="eyebrow capability-card__code">CAP // {pillar.index}</p>
              <h3 className="text-h3">{pillar.title}</h3>
              <p style={{ color: 'var(--color-text-secondary)' }}>{pillar.summary}</p>

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
                {pillar.deliverables.map((item) => (
                  <li key={item} style={{ fontSize: 'var(--text-sm)' }}>
                    {item}
                  </li>
                ))}
              </ul>

              <ul
                aria-label={`${pillar.title} technologies`}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--space-2)',
                  listStyle: 'none',
                  marginTop: 'auto',
                  paddingTop: 'var(--space-3)',
                }}
              >
                {pillar.technologies.map((tech) => (
                  <li
                    key={tech}
                    className="text-mono-label"
                    style={{
                      padding: 'var(--space-1) var(--space-2)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-xs)',
                      color: 'var(--color-text-tertiary)',
                    }}
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* 03 // Initiate Enquiry Bottom CTA Section */}
      <section
        aria-labelledby="home-cta-heading"
        className="contact-cta-section"
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
        <p className="eyebrow section-eyebrow">03 // Initiate Enquiry</p>
        <h2 id="home-cta-heading" className="text-h2">
          Ready to build or scale a critical software product?
        </h2>
        <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)' }}>
          Share your project scope, technical constraints, and timeline to start a direct
          engineering conversation with {siteConfig.name}.
        </p>
        <div
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
            Go to Contact Form
          </Link>
          <a
            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${siteConfig.email}&su=Project%20Enquiry%20%E2%80%94%20Geoffrey%20Obwocha`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary cta-secondary"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            Email {siteConfig.email}
          </a>
        </div>
      </section>
    </div>
  );
}
