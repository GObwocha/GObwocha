import { Link, useParams } from 'react-router';
import { getProjectBySlug, projects } from '../../data/projects';
import { NotFoundPage } from '../not-found/NotFoundPage';

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const project = slug ? getProjectBySlug(slug) : undefined;

  if (!project) {
    return <NotFoundPage />;
  }

  const currentIndex = projects.findIndex((item) => item.slug === project.slug);
  const formattedIndex = String((currentIndex >= 0 ? currentIndex : 0) + 1).padStart(2, '0');
  const previousProject = currentIndex > 0 ? projects[currentIndex - 1] : undefined;
  const nextProject =
    currentIndex >= 0 && currentIndex < projects.length - 1
      ? projects[currentIndex + 1]
      : undefined;

  const hasExternalLinks = Boolean(
    project.liveUrl || project.repositoryUrl || project.referenceUrl,
  );

  return (
    <article
      aria-labelledby="case-study-title"
      className="case-study container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-10)',
        paddingBlock: 'var(--space-10)',
      }}
    >
      <div className="case-study__breadcrumb">
        <Link
          to="/work"
          className="btn btn-secondary case-study__back-link"
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          Back to Selected Work
        </Link>
      </div>

      <div
        className="case-study__header"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-6)',
          paddingBottom: 'var(--space-8)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <p className="eyebrow section-eyebrow">
          Case Study {formattedIndex} // {project.category}
        </p>

        <h1 id="case-study-title" className="text-h1">
          {project.title} — {project.subtitle}
        </h1>

        <p
          className="text-body-lg case-study__summary"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {project.summary}
        </p>

        <figure
          className="case-study__cover"
          style={{
            aspectRatio: '16 / 10',
            width: '100%',
            overflow: 'hidden',
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <img
            src={project.coverImage}
            alt={project.altText}
            width={1200}
            height={750}
            loading="eager"
            decoding="async"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </figure>

        {/* Forensic Specification Ledger */}
        <dl
          className="case-study__ledger"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--space-6)',
            padding: 'var(--space-6)',
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <div className="case-study__ledger-item">
            <dt className="text-mono-label">Role</dt>
            <dd style={{ marginTop: 'var(--space-1)', color: 'var(--color-text-primary)' }}>
              {project.role}
            </dd>
          </div>

          <div className="case-study__ledger-item">
            <dt className="text-mono-label">Category</dt>
            <dd style={{ marginTop: 'var(--space-1)', color: 'var(--color-text-primary)' }}>
              {project.category}
            </dd>
          </div>

          <div className="case-study__ledger-item">
            <dt className="text-mono-label">Published</dt>
            <dd style={{ marginTop: 'var(--space-1)', color: 'var(--color-text-primary)' }}>
              <time dateTime={project.publishedAt}>{project.publishedAt}</time>
            </dd>
          </div>

          <div className="case-study__ledger-item">
            <dt className="text-mono-label">Core Stack</dt>
            <dd style={{ marginTop: 'var(--space-1)', color: 'var(--color-text-primary)' }}>
              {project.technologies.join(' · ')}
            </dd>
          </div>

          {project.organization && (
            <div className="case-study__ledger-item">
              <dt className="text-mono-label">Organization</dt>
              <dd style={{ marginTop: 'var(--space-1)', color: 'var(--color-text-primary)' }}>
                {project.organization}
              </dd>
            </div>
          )}

          {hasExternalLinks && (
            <div className="case-study__ledger-item">
              <dt className="text-mono-label">Verified Links</dt>
              <dd
                style={{
                  marginTop: 'var(--space-1)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--space-3)',
                }}
              >
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      minHeight: '44px',
                      minWidth: '44px',
                    }}
                  >
                    Live Deployment
                  </a>
                )}
                {project.repositoryUrl && (
                  <a
                    href={project.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      minHeight: '44px',
                      minWidth: '44px',
                    }}
                  >
                    GitHub Repository
                  </a>
                )}
                {project.referenceUrl && (
                  <a
                    href={project.referenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      minHeight: '44px',
                      minWidth: '44px',
                    }}
                  >
                    Official Reference Site
                  </a>
                )}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Teammates & Collaborative Credits Section */}
      {project.teammates && project.teammates.length > 0 && (
        <section
          aria-labelledby="case-study-team-heading"
          className="case-study__section case-study__team"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
            padding: 'var(--space-6)',
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border-strong)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <p className="eyebrow">Collaborative Engineering Credits</p>
          <h2 id="case-study-team-heading" className="text-h2">
            Engineering Team &amp; Co-Contributors
          </h2>
          {project.organization && (
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Engineered collaboratively within <strong>{project.organization}</strong>.
            </p>
          )}
          <ul
            aria-label={`${project.title} engineering teammates`}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 'var(--space-4)',
              listStyle: 'none',
            }}
          >
            {project.teammates.map((teammate) => {
              const profileUrl =
                teammate.githubUrl ??
                (teammate.githubHandle ? `https://github.com/${teammate.githubHandle}` : undefined);

              return (
                <li
                  key={teammate.githubHandle ?? teammate.name}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-1)',
                    padding: 'var(--space-4)',
                    backgroundColor: 'var(--color-bg-primary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xs)',
                  }}
                >
                  {profileUrl ? (
                    <a
                      href={profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        minHeight: '44px',
                        minWidth: '44px',
                        fontWeight: 700,
                      }}
                    >
                      {teammate.name}
                      {teammate.githubHandle ? ` (@${teammate.githubHandle})` : ''}
                    </a>
                  ) : (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        minHeight: '44px',
                        fontWeight: 700,
                      }}
                    >
                      {teammate.name}
                    </span>
                  )}
                  <span
                    style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}
                  >
                    {teammate.role}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* 01 // Problem & Context */}
      <section
        aria-labelledby="case-study-problem-heading"
        className="case-study__section"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          paddingBottom: 'var(--space-8)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <h2 id="case-study-problem-heading" className="text-h2">
          01 // Problem &amp; Context
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>{project.problem}</p>
      </section>

      {/* 02 // Engineering Process & Architecture */}
      <section
        aria-labelledby="case-study-process-heading"
        className="case-study__section"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          paddingBottom: 'var(--space-8)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <h2 id="case-study-process-heading" className="text-h2">
          02 // Engineering Process &amp; Architecture
        </h2>
        <ol
          className="case-study__process-list"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
            paddingLeft: 'var(--space-5)',
            color: 'var(--color-text-secondary)',
          }}
        >
          {project.process.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      {/* 03 // Solution & Verified Outcomes */}
      <section
        aria-labelledby="case-study-solution-heading"
        className="case-study__section"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          paddingBottom: 'var(--space-8)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <h2 id="case-study-solution-heading" className="text-h2">
          03 // Solution &amp; Verified Outcomes
        </h2>
        <p className="text-body-lg" style={{ color: 'var(--color-text-primary)' }}>
          {project.solution}
        </p>
        <ul
          className="case-study__outcomes-list"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
            paddingLeft: 'var(--space-5)',
            color: 'var(--color-text-secondary)',
          }}
        >
          {project.outcomes.map((outcome) => (
            <li key={outcome}>{outcome}</li>
          ))}
        </ul>

        {project.liveUrl && (
          <div
            className="case-study__solution-deployment"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-4)',
              padding: 'var(--space-5)',
              marginTop: 'var(--space-2)',
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border-strong)',
              borderLeft: '3px solid var(--color-accent)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <p className="eyebrow">Live Solution Deployment</p>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                Explore the deployed {project.title} solution live in your browser:
              </p>
            </div>
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary case-study__solution-link"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              Launch Live Solution — {project.title}
            </a>
          </div>
        )}
      </section>

      {/* Next / Previous Case Study Navigation */}
      <nav
        aria-label="Adjacent case studies"
        className="case-study__adjacent-nav"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
        }}
      >
        {previousProject ? (
          <Link
            to={`/work/${previousProject.slug}`}
            className="btn btn-secondary"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            Previous: {previousProject.title}
          </Link>
        ) : (
          <span />
        )}
        {nextProject && (
          <Link
            to={`/work/${nextProject.slug}`}
            className="btn btn-secondary"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            Next: {nextProject.title}
          </Link>
        )}
      </nav>

      {/* Conversion CTA Section */}
      <section
        aria-labelledby="case-study-cta-heading"
        className="case-study__cta"
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
        <p className="eyebrow">Next Step // Initiate Enquiry</p>
        <h2 id="case-study-cta-heading" className="text-h2">
          Planning a similar engineering initiative?
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Reach out to discuss system architecture, implementation trade-offs, or collaboration
          opportunities.
        </p>
        <div
          className="case-study__cta-actions"
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
            Browse All Work
          </Link>
        </div>
      </section>
    </article>
  );
}
