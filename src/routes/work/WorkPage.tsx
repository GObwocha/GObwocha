import { Link } from 'react-router';
import { ProjectGrid } from '../../components/projects/ProjectGrid';
import { projects } from '../../data/projects';

export interface WorkCaseStudyItem {
  readonly index: string;
  readonly slug: string;
  readonly title: string;
  readonly category: string;
  readonly headline: string;
  readonly summary: string;
  readonly technologies: readonly string[];
}

export const WORK_CASE_STUDIES: readonly WorkCaseStudyItem[] = projects.map((project, idx) => ({
  index: String(idx + 1).padStart(2, '0'),
  slug: project.slug,
  title: project.title,
  category: project.category,
  headline: project.subtitle,
  summary: project.summary,
  technologies: project.technologies,
}));

export function WorkPage() {
  return (
    <div className="work-page">
      <section aria-labelledby="work-page-heading" className="work-header-section">
        <p className="section-eyebrow">Index // 01 — {String(projects.length).padStart(2, '0')}</p>
        <h1 id="work-page-heading">Selected Work &amp; Engineering Case Studies</h1>
        <p className="section-lead">
          An architectural index of AI security platforms, geospatial routing engines, full-stack
          web applications, and automated LLM pipelines engineered by Geoffrey Obwocha. Select any
          case study to inspect its problem context, engineering process, collaborator credits, and
          verified outcomes.
        </p>
      </section>

      <section aria-labelledby="case-study-ledger-heading" className="work-ledger-section">
        <h2 id="case-study-ledger-heading" className="sr-only">
          Project Case Study Ledger
        </h2>

        <ProjectGrid projects={projects} headingLevel="h3" />
      </section>

      <section aria-labelledby="work-cta-heading" className="contact-cta-section">
        <p className="section-eyebrow">Next Step // Initiate Enquiry</p>
        <h2 id="work-cta-heading">Have a complex systems or product challenge in mind?</h2>
        <p>
          Share your technical requirements, timeline, or collaboration scope to start a direct
          conversation.
        </p>
        <Link
          to="/contact"
          className="btn btn-primary cta-primary"
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          Start a Conversation
        </Link>
      </section>
    </div>
  );
}
