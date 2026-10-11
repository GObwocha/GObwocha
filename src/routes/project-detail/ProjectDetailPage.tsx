import { Link, useParams } from 'react-router';
import { NotFoundPage } from '../not-found/NotFoundPage';

interface CaseStudyDetail {
  readonly slug: string;
  readonly index: string;
  readonly title: string;
  readonly category: string;
  readonly role: string;
  readonly summary: string;
  readonly problem: string;
  readonly process: string;
  readonly solution: string;
  readonly outcomes: string;
  readonly technologies: readonly string[];
  readonly repositoryUrl: string;
}

const CASE_STUDIES_BY_SLUG: Readonly<Record<string, CaseStudyDetail>> = {
  'halisi-app': {
    slug: 'halisi-app',
    index: '01',
    title: 'Halisi App',
    category: 'Full-Stack Application',
    role: 'Lead Full-Stack Engineer',
    summary:
      'End-to-end digital workflow platform engineered for data integrity, responsive usability, and maintainable service boundaries.',
    problem:
      'Fragmented manual workflows created verification bottlenecks and inconsistent state tracking across multi-step user journeys.',
    process:
      'Modelled strict domain schemas, separated presentation from data access layers, and enforced validation across both client forms and backend persistence.',
    solution:
      'Delivered a unified React and TypeScript web application backed by structured relational storage and accessible status feedback.',
    outcomes:
      'Established a deterministic, auditable workflow pipeline with responsive mobile and desktop ergonomics.',
    technologies: ['TypeScript', 'React', 'Supabase', 'PostgreSQL'],
    repositoryUrl: 'https://github.com/GObwocha',
  },
  greenroute: {
    slug: 'greenroute',
    index: '02',
    title: 'GreenRoute',
    category: 'Mobility & Logistics Systems',
    role: 'Systems & Frontend Architect',
    summary:
      'Route intelligence and sustainability-focused mobility platform for evaluating transit corridors and environmental telemetry.',
    problem:
      'Planners and commuters lacked a transparent interface to compare route efficiency alongside environmental impact indicators.',
    process:
      'Designed modular routing data adapters, structured clear comparative telemetry views, and optimized rendering performance for low-bandwidth mobile networks.',
    solution:
      'Built an interactive route comparison interface that surfaces corridor trade-offs with clear visual hierarchy and keyboard-accessible controls.',
    outcomes:
      'Enabled side-by-side route evaluation without visual clutter or layout instability across mobile and desktop viewports.',
    technologies: ['TypeScript', 'React', 'Node.js', 'Geospatial APIs'],
    repositoryUrl: 'https://github.com/GObwocha',
  },
  'kula-kwa-macho': {
    slug: 'kula-kwa-macho',
    index: '03',
    title: 'Kula Kwa Macho',
    category: 'Consumer Web Product',
    role: 'Product Engineer',
    summary:
      'Visual-first culinary discovery and digital ordering experience engineered for speed and clarity.',
    problem:
      'Dense, text-heavy digital menus made mobile food discovery slow and caused high drop-off during item selection.',
    process:
      'Applied aspect-ratio-locked media containers to prevent layout shift, organized category navigation for thumb ergonomics, and streamlined order state management.',
    solution:
      'Shipped a responsive culinary showcase where high-impact dish presentation pairs directly with structured dietary and pricing metadata.',
    outcomes:
      'Delivered zero-CLS media loading and intuitive keyboard and touch navigation across small and large screens.',
    technologies: ['React', 'TypeScript', 'CSS Grid', 'Vite'],
    repositoryUrl: 'https://github.com/GObwocha',
  },
  'email-analyzer': {
    slug: 'email-analyzer',
    index: '04',
    title: 'Email Analyzer',
    category: 'Security & Diagnostic Tooling',
    role: 'Security & Systems Engineer',
    summary:
      'Forensic email header inspection and phishing-signal analysis utility for rapid security triage.',
    problem:
      'Raw RFC 5322 email headers are dense and error-prone to inspect manually when diagnosing spoofing, relay delays, or authentication failures.',
    process:
      'Implemented a deterministic header parser that extracts Received hops, SPF/DKIM/DMARC alignment signals, and anomaly markers into a structured diagnostic tree.',
    solution:
      'Created a forensic inspection workspace that transforms raw message headers into an ordered hop ledger and clear authentication verdict summary.',
    outcomes:
      'Reduced cognitive load during header inspection while keeping all parsing deterministic and safe against malformed input.',
    technologies: ['TypeScript', 'Parser Architecture', 'Security Diagnostics', 'React'],
    repositoryUrl: 'https://github.com/GObwocha',
  },
  somastar: {
    slug: 'somastar',
    index: '05',
    title: 'SomaStar',
    category: 'EdTech & Learning Systems',
    role: 'Full-Stack Developer',
    summary:
      'Structured academic resource and progress tracking platform built for accessible learning workflows.',
    problem:
      'Learners needed a centralized, distraction-free environment to track course modules and locate verified study materials.',
    process:
      'Structured curriculum hierarchies into semantic page templates, prioritized keyboard navigation and readable typography, and minimized bundle overhead.',
    solution:
      'Built an accessible learning portal featuring clear module progression, resource indexing, and responsive reading views.',
    outcomes:
      'Provided a consistent, readable academic interface across mobile phones, tablets, and desktop workstations.',
    technologies: ['React', 'TypeScript', 'Relational Data', 'Accessible UI'],
    repositoryUrl: 'https://github.com/GObwocha',
  },
  geliscope: {
    slug: 'geliscope',
    index: '06',
    title: 'GeliScope',
    category: 'Data Visualization & Telemetry',
    role: 'Frontend Systems Engineer',
    summary:
      'Interactive system telemetry and analytical observation console for structured dataset inspection.',
    problem:
      'High-frequency operational metrics become unreadable when presented without disciplined typographic hierarchy and filtering controls.',
    process:
      'Combined tabular monospace telemetry grids with clear summary cards and accessible filter controls that preserve main-thread responsiveness.',
    solution:
      'Engineered an analytical console that pairs high-density specification tables with clear visual status indicators.',
    outcomes:
      'Maintained smooth interaction responsiveness while presenting multi-dimensional technical data.',
    technologies: ['TypeScript', 'React', 'Data Visualization', 'Performance Optimization'],
    repositoryUrl: 'https://github.com/GObwocha',
  },
  'ole-ken-hotel': {
    slug: 'ole-ken-hotel',
    index: '07',
    title: 'Ole-Ken Hotel',
    category: 'Hospitality & Booking Experience',
    role: 'Web Architect & Frontend Engineer',
    summary:
      'Digital hospitality showcase and direct guest enquiry platform crafted for conversion clarity.',
    problem:
      'Prospective guests required immediate visibility into room categories, conference amenities, and direct booking contact pathways on mobile devices.',
    process:
      'Structured an editorial layout balancing expansive property photography with concise specification ledgers and clear enquiry calls to action.',
    solution:
      'Delivered a fast, search-crawlable hospitality web experience with clear room comparisons and direct reservation enquiry routing.',
    outcomes:
      'Established a credible, mobile-ready digital storefront with clear conversion pathways.',
    technologies: ['React', 'TypeScript', 'Responsive Web Design', 'SEO Architecture'],
    repositoryUrl: 'https://github.com/GObwocha',
  },
};

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const project = slug ? CASE_STUDIES_BY_SLUG[slug] : undefined;

  if (!project) {
    return <NotFoundPage />;
  }

  return (
    <article aria-labelledby="case-study-title" className="case-study">
      <div className="case-study__breadcrumb">
        <Link
          to="/work"
          className="case-study__back-link"
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          Back to Selected Work
        </Link>
      </div>

      <div className="case-study__header">
        <p className="section-eyebrow">
          Case Study {project.index} // {project.category}
        </p>
        <h1 id="case-study-title">{project.title}</h1>
        <p className="case-study__summary">{project.summary}</p>

        <dl className="case-study__ledger">
          <div className="case-study__ledger-item">
            <dt>Role</dt>
            <dd>{project.role}</dd>
          </div>
          <div className="case-study__ledger-item">
            <dt>Category</dt>
            <dd>{project.category}</dd>
          </div>
          <div className="case-study__ledger-item">
            <dt>Core Stack</dt>
            <dd>{project.technologies.join(', ')}</dd>
          </div>
          <div className="case-study__ledger-item">
            <dt>Source</dt>
            <dd>
              <a
                href={project.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                GitHub Profile (@GObwocha)
              </a>
            </dd>
          </div>
        </dl>
      </div>

      <section aria-labelledby="case-study-problem-heading" className="case-study__section">
        <h2 id="case-study-problem-heading">01 // Problem &amp; Context</h2>
        <p>{project.problem}</p>
      </section>

      <section aria-labelledby="case-study-process-heading" className="case-study__section">
        <h2 id="case-study-process-heading">02 // Engineering Process &amp; Architecture</h2>
        <p>{project.process}</p>
      </section>

      <section aria-labelledby="case-study-solution-heading" className="case-study__section">
        <h2 id="case-study-solution-heading">03 // Solution &amp; Verified Outcomes</h2>
        <p>{project.solution}</p>
        <p>{project.outcomes}</p>
      </section>

      <section aria-labelledby="case-study-cta-heading" className="case-study__cta">
        <h2 id="case-study-cta-heading">Planning a similar engineering initiative?</h2>
        <p>
          Reach out to discuss architecture, implementation trade-offs, or collaboration
          opportunities.
        </p>
        <div className="case-study__cta-actions">
          <Link
            to="/contact"
            className="cta-primary"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            Start a Conversation
          </Link>
          <Link
            to="/work"
            className="cta-secondary"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            Browse More Work
          </Link>
        </div>
      </section>
    </article>
  );
}
