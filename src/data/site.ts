export interface CapabilityPillar {
  id: string;
  index: string;
  title: string;
  summary: string;
  deliverables: readonly string[];
  technologies: readonly string[];
}

export interface SocialLink {
  label: string;
  url: string;
  handle: string;
  external: boolean;
}

export interface SiteConfig {
  name: string;
  handle: string;
  role: string;
  tagline: string;
  valueProposition: string;
  location: string;
  timezone: string;
  affiliation: string;
  availability: string;
  email: string;
  githubUrl: string;
  siteUrl: string;
  defaultOgImage: string;
  defaultOgImageWidth: 1200;
  defaultOgImageHeight: 630;
  defaultOgImageAlt: string;
  biography: readonly string[];
  workingPrinciples: readonly {
    title: string;
    description: string;
  }[];
  capabilities: readonly CapabilityPillar[];
  socials: readonly SocialLink[];
  privacyNotice: string;
}

export const siteConfig: SiteConfig = {
  name: 'Geoffrey Obwocha',
  handle: 'GObwocha',
  role: 'Systems Architect & Full-Stack Product Engineer',
  tagline:
    'Engineering resilient backend systems, AI-native workflows, and high-craft web products.',
  valueProposition:
    'I design and build production-grade software systems—from AI fraud-detection engines and geospatial routing tools to responsive web platforms tailored for East African and global markets.',
  location: 'Nairobi, Kenya',
  timezone: 'EAT (UTC+3)',
  affiliation: 'Computer Science at the University of Nairobi | Chiromo Tech Club',
  availability:
    'Available for select software engineering, systems architecture, and product engagements',
  email: 'ondiekobwocha@gmail.com',
  githubUrl: 'https://github.com/GObwocha',
  siteUrl: 'https://gobwocha.vercel.app',
  defaultOgImage: '/og/default.png',
  defaultOgImageWidth: 1200,
  defaultOgImageHeight: 630,
  defaultOgImageAlt:
    'Geoffrey Obwocha — Systems Architect & Full-Stack Product Engineer based in Nairobi, Kenya',
  biography: [
    'Geoffrey Obwocha is a Systems Architect and Full-Stack Product Engineer based in Nairobi, Kenya, studying Computer Science at the University of Nairobi and building collaborative engineering systems with the Chiromo Tech Club.',
    'His work spans multi-layered fraud detection for mobile money ecosystems, carbon-aware urban routing engines, adaptive AI educational diagnostics, and high-conversion web applications.',
    'Every system is engineered around strict type safety, verifiable data boundaries, accessible interfaces, and measurable real-world utility rather than decorative complexity.',
  ],
  workingPrinciples: [
    {
      title: 'Architectural Clarity First',
      description:
        'Model data schemas, trust boundaries, and failure modes explicitly before writing UI or API integration code.',
    },
    {
      title: 'Performance as a Product Feature',
      description:
        'Deliver static or server-rendered HTML, disciplined asset budgets, and sub-100ms interactions that work reliably on constrained 4G connections.',
    },
    {
      title: 'Context-Aware Engineering',
      description:
        'Build for real operating conditions—whether defending Kenyan consumers against M-Pesa social-engineering fraud or optimizing commuter routes across Nairobi.',
    },
  ],
  capabilities: [
    {
      id: 'backend-systems',
      index: '01',
      title: 'Backend & Systems Engineering',
      summary:
        'Designing type-safe APIs, relational data models, row-level security policies, and resilient automation pipelines.',
      deliverables: [
        'RESTful & event-driven service architecture',
        'PostgreSQL & Supabase schema design with strict RLS',
        'Scheduled ingestion & background digest pipelines',
      ],
      technologies: ['Python', 'FastAPI', 'Node.js', 'TypeScript', 'PostgreSQL', 'Supabase'],
    },
    {
      id: 'fullstack-web',
      index: '02',
      title: 'Full-Stack Web Architecture',
      summary:
        'Building crawlable, accessible, high-speed web applications with modern React, Next.js, and Vue 3 toolchains.',
      deliverables: [
        'SSG/SSR web applications with per-route SEO metadata',
        'WCAG 2.1 AA accessible component systems',
        'Responsive layouts engineered from 320px to 2560px',
      ],
      technologies: ['React 19', 'TypeScript', 'Next.js 14', 'Vue 3', 'Vite', 'Tailwind CSS'],
    },
    {
      id: 'data-geospatial-ai',
      index: '03',
      title: 'Data, Geospatial & AI Integration',
      summary:
        'Integrating multimodal LLMs, rubric-based diagnostic engines, and OpenStreetMap routing graphs into deterministic product workflows.',
      deliverables: [
        'AI Vision assessment & automated exam marking pipelines',
        'Geospatial route optimization & carbon telemetry modeling',
        'Cognitive & skill profiling analytics and adaptive assessments',
      ],
      technologies: [
        'Google Gemini API',
        'OpenStreetMap',
        'OSRM',
        'Leaflet',
        'Prompt & Schema Engineering',
      ],
    },
    {
      id: 'fintech-telecom',
      index: '04',
      title: 'Kenyan Fintech & Telecom Integrations',
      summary:
        'Connecting digital products to mobile money, messaging workflows, and real-time anti-impersonation verification.',
      deliverables: [
        'M-Pesa transaction & brand-impersonation risk scoring',
        'WhatsApp & SMS conversational booking and alert flows',
        'Domain, sender-ID, and phishing heuristic verification',
      ],
      technologies: [
        'Safaricom Daraja API',
        'M-Pesa Workflows',
        'Phishing Heuristics',
        'WhatsApp Deep-Link Engines',
      ],
    },
  ],
  socials: [
    {
      label: 'GitHub',
      url: 'https://github.com/GObwocha',
      handle: '@GObwocha',
      external: true,
    },
    {
      label: 'Email',
      url: 'mailto:ondiekobwocha@gmail.com',
      handle: 'ondiekobwocha@gmail.com',
      external: false,
    },
  ],
  privacyNotice:
    'Enquiry details are stored securely in Supabase solely to respond to your message, retained for up to 12 months, and never shared with third parties. Request deletion anytime via ondiekobwocha@gmail.com.',
};
