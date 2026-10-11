import { Link } from 'react-router';
import type { Project } from '../../types/project';

export interface ProjectCardProps {
  readonly project: Project;
  readonly index: number;
  readonly headingLevel?: 'h2' | 'h3';
}

export function ProjectCard({ project, index, headingLevel = 'h3' }: ProjectCardProps) {
  const formattedIndex = String(index + 1).padStart(2, '0');
  const HeadingTag = headingLevel;
  const hasTeammates = Boolean(project.teammates && project.teammates.length > 0);
  const hasExternalLinks = Boolean(project.liveUrl || project.repositoryUrl);

  return (
    <article
      className="work-card"
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
        className="work-card__media"
        style={{
          aspectRatio: '16 / 10',
          width: '100%',
          overflow: 'hidden',
          backgroundColor: 'var(--color-bg-primary)',
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
          className="work-card__image"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>

      <div
        className="work-card__meta"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-2)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          letterSpacing: 'var(--tracking-mono)',
          textTransform: 'uppercase',
        }}
      >
        <span
          className="work-card__index"
          style={{
            color: 'var(--color-accent)',
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {formattedIndex}
        </span>
        <span className="work-card__category" style={{ color: 'var(--color-text-secondary)' }}>
          {project.category}
        </span>
      </div>

      <HeadingTag className="work-card__title">
        <Link
          to={`/work/${project.slug}`}
          className="work-card__link"
          style={{
            minHeight: '44px',
            minWidth: '44px',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          {project.title} — {project.subtitle}
        </Link>
      </HeadingTag>

      <p className="work-card__summary" style={{ color: 'var(--color-text-secondary)' }}>
        {project.summary}
      </p>

      {hasTeammates && project.teammates && (
        <div
          className="work-card__teammates"
          aria-label={`${project.title} engineering collaborators`}
          style={{
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-bg-subtle)',
            borderLeft: '2px solid var(--color-accent)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <strong style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>
            Co-Engineered With:{' '}
          </strong>
          <span>
            {project.teammates
              .map((teammate) =>
                teammate.githubHandle
                  ? `${teammate.name} (@${teammate.githubHandle})`
                  : teammate.name,
              )
              .join(', ')}
          </span>
          {project.organization ? <span> · {project.organization}</span> : null}
        </div>
      )}

      <ul
        className="work-card__tags"
        aria-label={`${project.title} technologies`}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
          listStyle: 'none',
          padding: 0,
          margin: 0,
          marginTop: 'auto',
        }}
      >
        {project.technologies.map((tech) => (
          <li
            key={tech}
            className="work-card__tag"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              padding: 'var(--space-1) var(--space-2)',
              backgroundColor: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--color-text-secondary)',
            }}
          >
            {tech}
          </li>
        ))}
      </ul>

      {hasExternalLinks && (
        <div
          className="work-card__actions"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--touch-target-gap)',
            paddingTop: 'var(--space-2)',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary work-card__action-link"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              Live Deployment — {project.title}
            </a>
          )}
          {project.repositoryUrl && (
            <a
              href={project.repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary work-card__action-link"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              GitHub Repository — {project.title}
            </a>
          )}
        </div>
      )}
    </article>
  );
}
