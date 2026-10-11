import type { Project } from '../types/project';

export const projects: readonly Project[] = [
  {
    slug: 'halisi-app',
    title: 'Halisi',
    subtitle: 'AI-Powered Brand Impersonation & M-Pesa Fraud Detection',
    category: 'Cybersecurity · AI · Kenyan Fintech',
    summary:
      'A multi-layered threat-detection platform built to identify brand impersonation, fraudulent social media accounts, and M-Pesa social-engineering scams targeting Kenyan consumers and businesses.',
    problem:
      'Across Kenya’s mobile-money economy, attackers frequently impersonate trusted banks, telecom operators, and retail brands using lookalike domains, spoofed social media handles, and deceptive M-Pesa payment prompts. Consumers and brand security teams lacked an integrated verification engine geared toward local scam patterns.',
    role: 'Co-Engineer — Detection Pipeline, Backend Verification Services & Full-Stack Integration',
    organization: 'Chiromo Tech Club, University of Nairobi',
    teammates: [
      {
        name: 'Collins Kimanzi (Collins Mwandikwa)',
        githubHandle: 'Kimanzi-Collins',
        githubUrl: 'https://github.com/Kimanzi-Collins',
        role: 'Co-Engineer — Detection Pipeline & Architecture',
      },
      {
        name: 'Ndegwa Waudo',
        githubHandle: 'sigangandegwa',
        githubUrl: 'https://github.com/sigangandegwa',
        role: 'Co-Engineer — Repository Maintainer & Platform Integration',
      },
      {
        name: 'Dennis Kuria',
        role: 'Co-Engineer — Security Research & Threat Analysis',
      },
    ],
    process: [
      'Analyzed common East African phishing vectors, lookalike domain registrations, and fraudulent M-Pesa till/paybill social-engineering scripts.',
      'Architected a multi-signal verification pipeline combining deterministic heuristic checks with LLM-assisted semantic analysis of suspicious messages and URLs.',
      'Built an interactive verification dashboard enabling users and brand teams to inspect risk signals, impersonation indicators, and actionable safety guidance.',
    ],
    solution:
      'Halisi pairs domain and handle similarity heuristics with AI-driven message classification to flag brand impersonation and M-Pesa scam attempts in real time, presenting clear risk explanations rather than opaque scores.',
    outcomes: [
      'Delivered an end-to-end fraud detection and brand verification prototype developed collaboratively with the Chiromo Tech Club at the University of Nairobi.',
      'Unified URL reputation checks, handle impersonation detection, and M-Pesa scam message analysis into a single workflow.',
      'Structured modular verification endpoints so new regional scam signatures can be added without re-architecting the frontend.',
    ],
    technologies: [
      'Python',
      'FastAPI',
      'TypeScript',
      'React',
      'Google Gemini API',
      'M-Pesa Fraud Heuristics',
      'Tailwind CSS',
    ],
    coverImage: '/images/projects/halisi-app-cover.svg',
    gallery: ['/images/projects/halisi-app-cover.svg'],
    altText:
      'Halisi fraud detection interface showing brand impersonation risk analysis and M-Pesa scam verification signals',
    repositoryUrl: 'https://github.com/sigangandegwa/HalisiApp',
    publishedAt: '2025-02-15',
    featured: true,
    seoTitle: 'Halisi — AI Brand Impersonation & M-Pesa Fraud Detection | Geoffrey Obwocha',
    seoDescription:
      'Case study of Halisi, an AI-powered brand impersonation and M-Pesa fraud detection platform built with Collins Kimanzi, Ndegwa Waudo, and Dennis Kuria at the University of Nairobi.',
    ogImage: '/og/projects/halisi-app.png',
  },
  {
    slug: 'greenroute',
    title: 'GreenRoute',
    subtitle: 'Eco-Routing & Carbon-Aware Navigation Engine for Nairobi',
    category: 'Geospatial Systems · Climate Tech · Routing Algorithms',
    summary:
      'A geospatial routing and emissions-telemetry application that computes fuel- and carbon-conscious travel corridors across Nairobi alongside conventional fastest-path navigation.',
    problem:
      'Standard navigation tools optimize exclusively for raw distance or theoretical free-flow speed, ignoring congestion-induced idling and steep elevation or corridor penalties that inflate fuel burn and urban tailpipe emissions in Nairobi.',
    role: 'Lead & Co-Engineer — Geospatial Routing Integration, Emissions Calculation & Map UI',
    teammates: [
      {
        name: 'Benson Mose',
        githubHandle: 'Bemos26',
        githubUrl: 'https://github.com/Bemos26',
        role: 'Co-Engineer — Geospatial Data & Route Modeling',
      },
      {
        name: 'Timothy Mwita',
        githubHandle: 'Tim-cm',
        githubUrl: 'https://github.com/Tim-cm',
        role: 'Co-Engineer — Frontend Mapping & Telemetry Interface',
      },
    ],
    process: [
      'Modeled Nairobi road network segments using OpenStreetMap data and OSRM routing profiles.',
      'Implemented comparative route scoring that weighs distance, estimated travel duration, and projected CO2 output per vehicle profile.',
      'Designed an interactive Leaflet map workspace displaying side-by-side eco-routes versus fastest routes with transparent carbon delta breakdowns.',
    ],
    solution:
      'GreenRoute surfaces alternative urban corridors and quantifies estimated carbon savings per trip, giving commuters and logistics operators actionable visibility into the environmental trade-offs of each route choice.',
    outcomes: [
      'Built an interactive multi-route comparison engine tailored to Nairobi road geometry and traffic corridors.',
      'Delivered real-time visual telemetry comparing distance, estimated travel time, and projected carbon footprint across candidate paths.',
      'Established a clean geospatial architecture separating routing graph queries from emissions estimation models.',
    ],
    technologies: [
      'TypeScript',
      'React',
      'Python',
      'OpenStreetMap',
      'Leaflet',
      'OSRM Routing',
      'Carbon Emission Modeling',
    ],
    coverImage: '/images/projects/greenroute-cover.svg',
    gallery: ['/images/projects/greenroute-cover.svg'],
    altText:
      'GreenRoute geospatial map interface comparing carbon-aware eco-routes and standard routes across Nairobi',
    repositoryUrl: 'https://github.com/GObwocha/GreenRoute',
    publishedAt: '2025-01-20',
    featured: true,
    seoTitle: 'GreenRoute — Carbon-Aware Eco-Routing Engine for Nairobi | Geoffrey Obwocha',
    seoDescription:
      'Case study of GreenRoute, a geospatial eco-routing and carbon-telemetry navigation engine for Nairobi built by Geoffrey Obwocha, Benson Mose, and Timothy Mwita.',
    ogImage: '/og/projects/greenroute.png',
  },
  {
    slug: 'kula-kwa-macho',
    title: 'Kula-Kwa-Macho',
    subtitle: 'Interactive Kenyan Food Discovery & Culinary Platform',
    category: 'Full-Stack Web · Consumer Product · Cultural Discovery',
    summary:
      'A visually rich culinary discovery web application celebrating Kenyan cuisine through editorial photography, curated regional dishes, and frictionless browsing.',
    problem:
      'East African culinary heritage is often underrepresented or fragmented across generic recipe aggregators that lack visual craft, regional context, and responsive mobile performance.',
    role: 'Creator & Full-Stack Product Engineer — UI Architecture, Visual Design & Deployment',
    process: [
      'Structured a strongly-typed catalog of Kenyan dishes with preparation context, ingredients, and cultural notes.',
      'Engineered a responsive, image-first interface inspired by editorial food publications ("Kula Kwa Macho" — Swahili for "feasting with the eyes").',
      'Optimized asset delivery, keyboard-accessible filtering, and instant client transitions deployed on Vercel.',
    ],
    solution:
      'Kula-Kwa-Macho pairs high-contrast editorial typography with fast, mobile-first dish exploration so visitors can discover, filter, and explore Kenyan culinary staples effortlessly.',
    outcomes: [
      'Shipped and deployed a live production web application at kula-kwa-macho-zeta.vercel.app.',
      'Engineered fluid responsive cards and category filters that maintain zero layout shift across mobile and desktop viewports.',
      'Created a reusable data-driven template for showcasing regional African culinary content.',
    ],
    technologies: [
      'React',
      'TypeScript',
      'Vite',
      'Tailwind CSS',
      'Responsive UI Architecture',
      'Vercel',
    ],
    coverImage: '/images/projects/kula-kwa-macho-cover.svg',
    gallery: ['/images/projects/kula-kwa-macho-cover.svg'],
    altText:
      'Kula-Kwa-Macho Kenyan culinary discovery platform displaying curated local dishes and interactive filters',
    liveUrl: 'https://kula-kwa-macho-zeta.vercel.app',
    repositoryUrl: 'https://github.com/GObwocha/Kula-Kwa-Macho',
    publishedAt: '2024-11-10',
    featured: true,
    seoTitle: 'Kula-Kwa-Macho — Interactive Kenyan Culinary Discovery Platform | Geoffrey Obwocha',
    seoDescription:
      'Explore how Geoffrey Obwocha designed and built Kula-Kwa-Macho, an interactive Kenyan food discovery web platform deployed on Vercel.',
    ogImage: '/og/projects/kula-kwa-macho.png',
  },
  {
    slug: 'somastar',
    title: 'SomaStar',
    subtitle: 'Adaptive Learning & AI Exam Intelligence Platform',
    category: 'EdTech · AI Assessment · Full-Stack Platform',
    summary:
      'An adaptive study and exam-preparation platform that transforms curriculum materials into structured practice assessments, mastery tracking, and targeted revision feedback.',
    problem:
      'Students preparing for rigorous university and national examinations often rely on static past papers without diagnostic feedback on which underlying concepts require reinforcement.',
    role: 'Co-Engineer — Assessment Workflows, Full-Stack Feature Engineering & Data Modeling',
    teammates: [
      {
        name: 'Emmanuel Makori Obiero',
        githubHandle: 'Emmanuel-Makori-Obiero',
        githubUrl: 'https://github.com/Emmanuel-Makori-Obiero',
        role: 'Co-Engineer — Platform Architecture & Repository Lead',
      },
    ],
    process: [
      'Collaborated on the domain model for courses, topic hierarchies, question banks, and learner attempt histories.',
      'Built interactive quiz and revision views that capture topic-level performance and surface targeted study recommendations.',
      'Integrated AI-assisted question generation and explanation workflows with structured validation.',
    ],
    solution:
      'SomaStar turns passive reading into active recall by pairing curriculum-aligned practice sessions with immediate conceptual explanations and topic mastery progression.',
    outcomes: [
      'Co-engineered a modular full-stack learning platform supporting structured revision and adaptive question flows.',
      'Implemented clear learner progress views that highlight weak topic areas after each assessment session.',
      'Maintained strict separation between assessment grading logic and presentation components.',
    ],
    technologies: [
      'TypeScript',
      'React',
      'Node.js',
      'PostgreSQL',
      'AI Assessment Pipelines',
      'Tailwind CSS',
    ],
    coverImage: '/images/projects/somastar-cover.svg',
    gallery: ['/images/projects/somastar-cover.svg'],
    altText:
      'SomaStar adaptive learning interface showing topic mastery analytics and interactive exam preparation',
    repositoryUrl: 'https://github.com/Emmanuel-Makori-Obiero/somastar',
    publishedAt: '2025-01-05',
    featured: true,
    seoTitle: 'SomaStar — Adaptive Learning & AI Exam Intelligence Platform | Geoffrey Obwocha',
    seoDescription:
      'Case study of SomaStar, an adaptive learning and AI exam intelligence platform co-engineered by Geoffrey Obwocha and Emmanuel Makori Obiero.',
    ogImage: '/og/projects/somastar.png',
  },
  {
    slug: 'geliscope',
    title: 'GeliScope',
    subtitle: 'Multi-Role AI Educational Diagnostic & Socratic Tutoring Portal',
    category: 'EdTech · Multimodal AI · Vue 3 Architecture',
    summary:
      'A role-based educational platform built with Vue 3 and Gemini Vision that combines rubric-aligned assignment diagnostics for educators with a Bloom’s Taxonomy Socratic tutor for learners.',
    problem:
      'Generic AI chat interfaces often hand students direct answers—undermining genuine comprehension—while teachers spend hours manually grading handwritten or uploaded coursework against multi-criteria rubrics.',
    role: 'Lead Architect & Full-Stack Engineer — Vue 3 Frontend, Pinia State & Gemini Vision Prompts',
    process: [
      'Architected distinct role portals (Student, Educator, Administrator) using Vue 3 Composition API, TypeScript, Pinia, and Vuetify 3.',
      'Engineered a multimodal Gemini Vision grading pipeline that evaluates uploaded student work against structured rubric criteria.',
      'Designed a Socratic tutoring state machine grounded in Bloom’s Taxonomy (Remember, Understand, Apply, Analyze, Evaluate, Create) that guides students via questions rather than spoiling solutions.',
    ],
    solution:
      'GeliScope empowers teachers with structured AI rubric diagnostics while giving students a guided Socratic dialogue engine that builds deep conceptual mastery step by step.',
    outcomes: [
      'Delivered a multi-role Vue 3 + TypeScript educational portal with dedicated workflows for instructors and learners.',
      'Implemented structured JSON schema validation for Gemini Vision rubric evaluations and Bloom’s Taxonomy progression.',
      'Prevented direct answer leakage in student tutoring sessions through guardrailed Socratic prompt orchestration.',
    ],
    technologies: [
      'Vue 3',
      'TypeScript',
      'Vuetify 3',
      'Pinia',
      'Google Gemini Vision',
      "Bloom's Taxonomy Socratic Engine",
    ],
    coverImage: '/images/projects/geliscope-cover.svg',
    gallery: ['/images/projects/geliscope-cover.svg'],
    altText:
      'GeliScope educational portal showing multimodal rubric grading and Socratic tutoring stages across Bloom’s Taxonomy',
    publishedAt: '2024-12-01',
    featured: false,
    seoTitle: 'GeliScope — AI Educational Diagnostic & Socratic Tutoring Portal | Geoffrey Obwocha',
    seoDescription:
      'Case study of GeliScope, a Vue 3, TypeScript, and Gemini Vision educational platform featuring rubric-based grading and Bloom’s Taxonomy Socratic tutoring.',
    ogImage: '/og/projects/geliscope.png',
  },
  {
    slug: 'email-analyzer',
    title: 'Email Analyzer',
    subtitle: 'Automated AI Academic Inbox Digest Pipeline',
    category: 'Workflow Automation · LLM Pipelines · Developer Tooling',
    summary:
      'An automated inbox triage and digest pipeline running on Google Apps Script, Node.js, and Gemini 1.5 Flash that distills high-volume university email threads into prioritized daily action summaries.',
    problem:
      'University of Nairobi students and academic club coordinators receive dozens of daily circulars, timetable revisions, scholarship notices, and project threads—making it easy to miss time-sensitive deadlines buried in long email bodies.',
    role: 'Creator & Systems Engineer — Pipeline Architecture, Apps Script Automation & Gemini Integration',
    process: [
      'Built a scheduled Google Apps Script and Node.js ingestion workflow that securely queries unread academic and organizational threads.',
      'Engineered structured Gemini 1.5 Flash extraction prompts to classify emails by urgency, extract concrete deadlines, and summarize required actions.',
      'Formatted the synthesized output into a scannable daily digest delivered automatically on a cron schedule.',
    ],
    solution:
      'Email Analyzer runs zero-maintenance in the background, converting noisy academic inbox traffic into a concise, deadline-first executive briefing.',
    outcomes: [
      'Automated daily inbox classification and deadline extraction with zero manual copy-pasting.',
      'Engineered deterministic fallback handling for rate limits and malformed email payloads.',
      'Published the open-source automation pipeline and setup documentation on GitHub.',
    ],
    technologies: [
      'Google Apps Script',
      'Node.js',
      'JavaScript',
      'Gemini 1.5 Flash',
      'Gmail API',
      'Scheduled Automation',
    ],
    coverImage: '/images/projects/email-analyzer-cover.svg',
    gallery: ['/images/projects/email-analyzer-cover.svg'],
    altText:
      'Email Analyzer pipeline diagram and automated daily academic inbox digest with extracted deadlines',
    repositoryUrl: 'https://github.com/GObwocha/Email-Analyzer',
    publishedAt: '2024-10-18',
    featured: false,
    seoTitle: 'Email Analyzer — Automated AI Academic Inbox Digest Pipeline | Geoffrey Obwocha',
    seoDescription:
      'How Geoffrey Obwocha built Email Analyzer, an automated Google Apps Script, Node.js, and Gemini 1.5 Flash pipeline for triaging university inbox deadlines.',
    ogImage: '/og/projects/email-analyzer.png',
  },
  {
    slug: 'ole-ken-hotel',
    title: 'The Ole~Ken Hotel',
    subtitle: 'Contemporary African Hospitality Website Redesign',
    category: 'Hospitality Web · Conversion Design · Next.js 14',
    summary:
      'A modern hospitality web redesign and direct-booking experience for The Ole~Ken Hotel in Nakuru, Kenya, engineered with Next.js 14, TypeScript, Tailwind CSS, and a streamlined WhatsApp reservation engine.',
    problem:
      'Regional hospitality websites frequently suffer from slow page loads, cluttered navigation, and high-friction reservation forms that cause mobile guests to abandon direct bookings in favor of third-party OTAs.',
    role: 'Lead Frontend & Conversion Engineer — Next.js 14 Architecture, Visual Redesign & Booking UX',
    process: [
      'Audited the existing hospitality journey for The Ole~Ken Hotel (Nakuru) to identify mobile navigation bottlenecks and booking drop-off points.',
      'Designed a warm, editorial African hospitality interface in Next.js 14 showcasing suites, dining, conferencing, and curated local experiences.',
      'Built a structured WhatsApp and direct-inquiry booking composer that pre-populates room selection, check-in/out dates, and guest counts for instant concierge confirmation.',
    ],
    solution:
      'The Ole~Ken Hotel redesign elevates brand perception with fast Next.js rendering, tactile typography, and a high-conversion direct reservation flow tailored to how Kenyan and international travelers book.',
    outcomes: [
      'Engineered a responsive Next.js 14 + TypeScript hospitality platform with structured room, dining, and conference showcases.',
      'Reduced booking friction by integrating a pre-validated WhatsApp concierge reservation builder alongside standard inquiries.',
      'Implemented semantic hospitality schema markup and optimized image loading across mobile and desktop viewports.',
    ],
    technologies: [
      'Next.js 14',
      'TypeScript',
      'Tailwind CSS',
      'Framer Motion',
      'WhatsApp Booking Engine',
      'Hospitality SEO',
    ],
    coverImage: '/images/projects/ole-ken-hotel-cover.svg',
    gallery: ['/images/projects/ole-ken-hotel-cover.svg'],
    altText:
      'The Ole~Ken Hotel hospitality website redesign showing luxury suite showcase and direct WhatsApp booking flow',
    referenceUrl: 'https://www.theolekenhotel.co.ke/',
    publishedAt: '2024-09-25',
    featured: false,
    seoTitle: 'The Ole~Ken Hotel — Contemporary Hospitality Website Redesign | Geoffrey Obwocha',
    seoDescription:
      'Case study of The Ole~Ken Hotel website redesign in Next.js 14 and TypeScript, featuring a contemporary African hospitality aesthetic and WhatsApp booking engine.',
    ogImage: '/og/projects/ole-ken-hotel.png',
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  const normalized = slug.trim().toLowerCase();
  return projects.find((project) => project.slug === normalized);
}

export function getFeaturedProjects(): readonly Project[] {
  return projects.filter((project) => project.featured);
}

export function getAllProjectSlugs(): string[] {
  return projects.map((project) => project.slug);
}
