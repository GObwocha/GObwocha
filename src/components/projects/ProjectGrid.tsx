import type { Project } from '../../types/project';
import { ProjectCard } from './ProjectCard';

export interface ProjectGridProps {
  readonly projects: readonly Project[];
  readonly headingLevel?: 'h2' | 'h3';
}

export function ProjectGrid({ projects, headingLevel = 'h3' }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div
        className="work-ledger-empty"
        role="status"
        aria-live="polite"
        style={{
          padding: 'var(--space-8)',
          backgroundColor: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--color-text-secondary)',
        }}
      >
        <p>No projects match the selected filter criteria.</p>
      </div>
    );
  }

  return (
    <div
      className="work-ledger-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 22rem), 1fr))',
        gap: 'var(--grid-gap)',
        width: '100%',
      }}
    >
      {projects.map((project, index) => (
        <ProjectCard
          key={project.slug}
          project={project}
          index={index}
          headingLevel={headingLevel}
        />
      ))}
    </div>
  );
}
