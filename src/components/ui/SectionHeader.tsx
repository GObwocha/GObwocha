import type { ReactNode } from 'react';

export type SectionHeadingLevel = 'h1' | 'h2' | 'h3';

export interface SectionHeaderProps {
  readonly id: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly lead?: ReactNode;
  readonly actions?: ReactNode;
  readonly headingLevel?: SectionHeadingLevel;
  readonly className?: string;
}

const HEADING_CLASS_BY_LEVEL: Record<SectionHeadingLevel, string> = {
  h1: 'text-h1 section-header__title',
  h2: 'text-h2 section-header__title',
  h3: 'text-h3 section-header__title',
};

/**
 * Three-tier architectural section header enforcing GObwocha's editorial hierarchy:
 * 1. Uppercase monospace telemetry eyebrow (`.eyebrow.section-eyebrow`)
 * 2. High-contrast display heading (`#id` for parent `<section aria-labelledby={id}>`)
 * 3. Optional reading-measure lead statement (`.text-body-lg.section-lead`) and action slot
 */
export function SectionHeader({
  id,
  eyebrow,
  title,
  lead,
  actions,
  headingLevel: HeadingTag = 'h2',
  className,
}: SectionHeaderProps) {
  const containerClassName = ['section-header', className].filter(Boolean).join(' ');

  return (
    <div className={containerClassName}>
      <div className="section-header__body">
        <p className="eyebrow section-eyebrow">{eyebrow}</p>
        <HeadingTag id={id} className={HEADING_CLASS_BY_LEVEL[HeadingTag]}>
          {title}
        </HeadingTag>
        {lead ? <p className="text-body-lg section-lead">{lead}</p> : null}
      </div>
      {actions ? <div className="section-header__actions">{actions}</div> : null}
    </div>
  );
}
