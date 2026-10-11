import { Link } from 'react-router';

const ENGINEERING_PRINCIPLES = [
  {
    code: '01',
    title: 'Type-Safe & Verifiable Boundaries',
    description:
      'Every external boundary—from environment configuration to database persistence—is validated with strict TypeScript contracts and runtime schemas.',
  },
  {
    code: '02',
    title: 'Performance as Product Craft',
    description:
      'Fast initial rendering, zero layout shift, and responsive interactions are treated as foundational architecture decisions rather than post-launch patches.',
  },
  {
    code: '03',
    title: 'Inclusive & Semantic Interfaces',
    description:
      'Native HTML semantics, keyboard operability, high-contrast legibility, and reduced-motion support ensure software works for every visitor.',
  },
] as const;

export function AboutPage() {
  return (
    <div className="about-page">
      <section aria-labelledby="about-heading" className="about-hero-section">
        <p className="section-eyebrow">Profile // Systems &amp; Product Engineering</p>
        <h1 id="about-heading">About Geoffrey Obwocha</h1>
        <p className="section-lead">
          Geoffrey Obwocha is a Nairobi-based Systems Architect and Full-Stack Product Engineer
          building resilient web applications, relational data backends, and human-centered digital
          products.
        </p>
      </section>

      <section aria-labelledby="background-heading" className="about-background-section">
        <h2 id="background-heading">01 // Background &amp; Community Leadership</h2>
        <p>
          Grounded in Computer Science at the <strong>University of Nairobi</strong> and active
          within the <strong>Chiromo Tech Club</strong> engineering community, Geoffrey combines
          foundational systems thinking with pragmatic product execution.
        </p>
        <p>
          His work spans full-stack web applications, diagnostic security utilities, mobility
          platforms, and hospitality experiences—always focusing on clean domain modeling,
          maintainable codebases, and measurable user outcomes.
        </p>
      </section>

      <section aria-labelledby="approach-heading" className="about-approach-section">
        <h2 id="approach-heading">02 // Working Approach &amp; Principles</h2>
        <div className="principles-grid">
          {ENGINEERING_PRINCIPLES.map((principle) => (
            <article key={principle.code} className="principle-card">
              <p className="principle-card__code">{principle.code}</p>
              <h3>{principle.title}</h3>
              <p>{principle.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="skills-heading" className="about-skills-section">
        <h2 id="skills-heading">03 // Core Capabilities &amp; Technical Stack</h2>
        <dl className="skills-ledger">
          <div className="skills-ledger__row">
            <dt>Frontend Architecture</dt>
            <dd>
              React, TypeScript, Vite, React Router (SSR/SSG), Semantic HTML5, Modern CSS Grid
            </dd>
          </div>
          <div className="skills-ledger__row">
            <dt>Backend &amp; Data Systems</dt>
            <dd>Supabase, PostgreSQL, Row Level Security (RLS), REST APIs, Node.js, Zod</dd>
          </div>
          <div className="skills-ledger__row">
            <dt>Quality &amp; Verification</dt>
            <dd>Vitest, React Testing Library, Playwright E2E, axe-core Accessibility Auditing</dd>
          </div>
        </dl>

        <div className="about-cta">
          <Link
            to="/contact"
            className="cta-primary"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            Start a Conversation
          </Link>
        </div>
      </section>
    </div>
  );
}
