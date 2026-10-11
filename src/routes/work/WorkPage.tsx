import { Link } from 'react-router';

export interface WorkCaseStudyItem {
  readonly index: string;
  readonly slug: string;
  readonly title: string;
  readonly category: string;
  readonly headline: string;
  readonly summary: string;
  readonly technologies: readonly string[];
}

export const WORK_CASE_STUDIES: readonly WorkCaseStudyItem[] = [
  {
    index: '01',
    slug: 'halisi-app',
    title: 'Halisi App',
    category: 'Full-Stack Application',
    headline: 'End-to-end digital workflow platform built for clarity and data integrity',
    summary:
      'A full-stack application engineered to streamline verification and operational workflows with strict client/server validation.',
    technologies: ['TypeScript', 'React', 'Supabase', 'PostgreSQL'],
  },
  {
    index: '02',
    slug: 'greenroute',
    title: 'GreenRoute',
    category: 'Mobility & Logistics Systems',
    headline: 'Route optimization and environmental telemetry platform',
    summary:
      'An analytical routing application designed to evaluate corridor efficiency, reduce transit friction, and surface actionable route data.',
    technologies: ['TypeScript', 'React', 'Node.js', 'Geospatial APIs'],
  },
  {
    index: '03',
    slug: 'kula-kwa-macho',
    title: 'Kula Kwa Macho',
    category: 'Consumer Web Product',
    headline: 'Visual-first culinary discovery and digital ordering experience',
    summary:
      'An editorial hospitality and food discovery interface crafted for rapid mobile browsing, high-contrast media presentation, and intuitive ordering.',
    technologies: ['React', 'TypeScript', 'CSS Grid', 'Vite'],
  },
  {
    index: '04',
    slug: 'email-analyzer',
    title: 'Email Analyzer',
    category: 'Security & Diagnostic Tooling',
    headline: 'Forensic email header inspection and phishing-signal analysis utility',
    summary:
      'A technical inspection tool that parses raw message headers, authentication records (SPF, DKIM, DMARC), and routing hops into readable diagnostics.',
    technologies: ['TypeScript', 'Parser Architecture', 'Security Diagnostics', 'React'],
  },
  {
    index: '05',
    slug: 'somastar',
    title: 'SomaStar',
    category: 'EdTech & Learning Systems',
    headline: 'Structured academic resource and progress tracking platform',
    summary:
      'An educational platform built to organize learning modules, student milestones, and accessible study workflows across desktop and mobile devices.',
    technologies: ['React', 'TypeScript', 'Relational Data', 'Accessible UI'],
  },
  {
    index: '06',
    slug: 'geliscope',
    title: 'GeliScope',
    category: 'Data Visualization & Telemetry',
    headline: 'Interactive system telemetry and analytical observation console',
    summary:
      'A high-density analytical interface for inspecting structured datasets, monitoring operational signals, and comparing performance metrics.',
    technologies: ['TypeScript', 'React', 'Data Visualization', 'Performance Optimization'],
  },
  {
    index: '07',
    slug: 'ole-ken-hotel',
    title: 'Ole-Ken Hotel',
    category: 'Hospitality & Booking Experience',
    headline: 'Digital hospitality showcase and direct guest enquiry platform',
    summary:
      'A responsive web presence engineered for a premier hospitality brand, prioritizing room discovery, clear amenity ledgers, and direct reservation enquiries.',
    technologies: ['React', 'TypeScript', 'Responsive Web Design', 'SEO Architecture'],
  },
];

export function WorkPage() {
  return (
    <div className="work-page">
      <section aria-labelledby="work-page-heading" className="work-header-section">
        <p className="section-eyebrow">Index // 01 — 07</p>
        <h1 id="work-page-heading">Selected Work &amp; Engineering Case Studies</h1>
        <p className="section-lead">
          An index of software systems, web applications, and technical tooling architected by
          Geoffrey Obwocha. Select any project to inspect its problem context, engineering process,
          and implementation details.
        </p>
      </section>

      <section aria-labelledby="case-study-ledger-heading" className="work-ledger-section">
        <h2 id="case-study-ledger-heading" className="sr-only">
          Project Case Study Ledger
        </h2>

        <div className="work-ledger-grid">
          {WORK_CASE_STUDIES.map((project) => (
            <article key={project.slug} className="work-card">
              <div className="work-card__meta">
                <span className="work-card__index">{project.index}</span>
                <span className="work-card__category">{project.category}</span>
              </div>

              <h3 className="work-card__title">
                <Link
                  to={`/work/${project.slug}`}
                  className="work-card__link"
                  style={{ minHeight: '44px', minWidth: '44px' }}
                >
                  {project.title} — {project.headline}
                </Link>
              </h3>

              <p className="work-card__summary">{project.summary}</p>

              <ul className="work-card__tags" aria-label={`${project.title} technologies`}>
                {project.technologies.map((tech) => (
                  <li key={tech} className="work-card__tag">
                    {tech}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
