import { Link } from 'react-router';

interface FeaturedProjectPreview {
  readonly index: string;
  readonly slug: string;
  readonly title: string;
  readonly outcomeHeadline: string;
  readonly summary: string;
  readonly stack: readonly string[];
}

const FEATURED_PROJECTS: readonly FeaturedProjectPreview[] = [
  {
    index: '01',
    slug: 'halisi-app',
    title: 'Halisi App',
    outcomeHeadline: 'Full-stack product engineering for reliable digital workflows',
    summary:
      'Architected and delivered an end-to-end application focused on resilient data integrity, responsive interfaces, and maintainable service boundaries.',
    stack: ['TypeScript', 'React', 'Supabase', 'PostgreSQL'],
  },
  {
    index: '02',
    slug: 'greenroute',
    title: 'GreenRoute',
    outcomeHeadline: 'Route intelligence and sustainability-focused mobility platform',
    summary:
      'Engineered a spatial and logistics routing experience designed to surface efficient corridors and actionable environmental telemetry.',
    stack: ['TypeScript', 'React', 'Node.js', 'REST APIs'],
  },
  {
    index: '03',
    slug: 'kula-kwa-macho',
    title: 'Kula Kwa Macho',
    outcomeHeadline: 'Visual-first culinary discovery and ordering experience',
    summary:
      'Designed and built a high-contrast, fast-loading web platform that turns visual menu exploration into streamlined customer orders.',
    stack: ['React', 'TypeScript', 'Responsive UI', 'Vite'],
  },
];

const CAPABILITY_PILLARS = [
  {
    code: 'CAP // 01',
    title: 'Full-Stack Web Application Architecture',
    description:
      'End-to-end delivery of React and TypeScript applications with SSR/SSG crawlability, strict type safety, and predictable state management.',
  },
  {
    code: 'CAP // 02',
    title: 'Database & API Systems Engineering',
    description:
      'Relational schema design in PostgreSQL and Supabase enforced with Row Level Security (RLS), validated boundaries, and resilient API contracts.',
  },
  {
    code: 'CAP // 03',
    title: 'Performance & Accessible Product Craft',
    description:
      'WCAG 2.1 AA compliant interfaces engineered for sub-1.5s Largest Contentful Paint, zero layout shift, and reduced-motion fidelity.',
  },
] as const;

export function HomePage() {
  return (
    <div className="home-page">
      <section aria-labelledby="hero-heading" className="hero-section">
        <p className="section-eyebrow">Nairobi, Kenya // Systems &amp; Product Engineering</p>
        <h1 id="hero-heading">
          Geoffrey Obwocha — Systems Architect &amp; Full-Stack Product Engineer
        </h1>
        <p className="hero-lead">
          Designing and shipping resilient web software, data-driven platforms, and high-craft
          digital products with architectural rigor.
        </p>
        <div className="hero-actions">
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
            Explore Selected Work
          </Link>
        </div>
      </section>

      <section aria-labelledby="featured-work-heading" className="featured-work-section">
        <div className="section-header">
          <p className="section-eyebrow">01 // Selected Work</p>
          <h2 id="featured-work-heading">Featured Engineering Case Studies</h2>
          <p className="section-lead">
            Production systems and product prototypes examined through problem context,
            architectural trade-offs, and verified implementation outcomes.
          </p>
        </div>

        <div className="project-preview-grid">
          {FEATURED_PROJECTS.map((project) => (
            <article key={project.slug} className="project-preview-card">
              <p className="project-preview-card__index">{project.index}</p>
              <h3>
                <Link
                  to={`/work/${project.slug}`}
                  className="project-preview-card__link"
                  style={{ minHeight: '44px', minWidth: '44px' }}
                >
                  {project.title} — {project.outcomeHeadline}
                </Link>
              </h3>
              <p className="project-preview-card__summary">{project.summary}</p>
              <ul
                className="project-preview-card__tags"
                aria-label={`${project.title} technologies`}
              >
                {project.stack.map((tech) => (
                  <li key={tech} className="project-preview-card__tag">
                    {tech}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="section-footer">
          <Link
            to="/work"
            className="cta-secondary"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            View All Case Studies
          </Link>
        </div>
      </section>

      <section aria-labelledby="capabilities-heading" className="capabilities-section">
        <div className="section-header">
          <p className="section-eyebrow">02 // Capabilities</p>
          <h2 id="capabilities-heading">Core Engineering Disciplines</h2>
        </div>

        <div className="capabilities-grid">
          {CAPABILITY_PILLARS.map((pillar) => (
            <article key={pillar.code} className="capability-card">
              <p className="capability-card__code">{pillar.code}</p>
              <h3>{pillar.title}</h3>
              <p>{pillar.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="home-cta-heading" className="contact-cta-section">
        <p className="section-eyebrow">03 // Initiate Enquiry</p>
        <h2 id="home-cta-heading">Ready to build or scale a critical software product?</h2>
        <p>
          Share your project scope, technical constraints, and timeline to start a direct
          engineering conversation.
        </p>
        <Link to="/contact" className="cta-primary" style={{ minHeight: '44px', minWidth: '44px' }}>
          Go to Contact Form
        </Link>
      </section>
    </div>
  );
}
