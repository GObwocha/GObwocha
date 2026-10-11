import type { Project } from '../types/project';

export const projects: readonly Project[] = [
  {
    slug: 'halisi-app',
    title: 'Halisi',
    subtitle: 'AI-Powered Brand Impersonation & M-Pesa Fraud Detection',
    category: 'Cybersecurity · AI · Kenyan Fintech',
    summary:
      'A multi-layered threat-detection platform built with FastAPI, Supabase pgvector, CLIP ViT-B-32, and NVIDIA NIM Llama 3.1 8B to identify brand impersonation, spoofed social accounts, and M-Pesa social-engineering scams across Kenya.',
    problem:
      'Across Kenya’s mobile-money economy, attackers frequently impersonate trusted banks, telecom operators, and retail brands using lookalike domains, cloned brand logos, spoofed social media handles, and deceptive M-Pesa paybill/till prompts. Consumers and brand security teams lacked an integrated verification engine geared toward local scam patterns and accessible on both web and USSD.',
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
      'Engineered an asynchronous Playwright headless crawler and ingestion pipeline to capture suspect domains, social profiles, and visual brand assets.',
      'Implemented 512-dimensional visual logo and layout similarity indexing in Supabase PostgreSQL using pgvector HNSW indexes and CLIP ViT-B-32 embeddings alongside NVIDIA NIM Llama 3.1 8B semantic scam classification.',
      'Integrated Safaricom Daraja API verification checks, Africa’s Talking USSD/SMS alerting, and a Python Telegram Bot interface with a React and TypeScript security dashboard.',
    ],
    solution:
      'Halisi combines CLIP ViT-B-32 vector similarity search, NVIDIA NIM Llama 3.1 8B natural-language threat analysis, and Safaricom Daraja / Africa’s Talking telecom integrations to detect brand impersonation and M-Pesa fraud in real time.',
    outcomes: [
      'Delivered an end-to-end fraud detection and brand verification platform developed collaboratively with the Chiromo Tech Club at the University of Nairobi.',
      'Unified Playwright web scraping, Supabase pgvector visual matching, Llama 3.1 8B scam analysis, and multi-channel alerting (Web, SMS, USSD, Telegram) into a cohesive FastAPI architecture.',
      'Structured modular verification endpoints so regional M-Pesa scam signatures and brand fingerprints can be indexed without re-architecting client workflows.',
    ],
    technologies: [
      'Python',
      'FastAPI',
      'Supabase pgvector',
      'CLIP ViT-B-32',
      'NVIDIA NIM Llama 3.1 8B',
      'Safaricom Daraja API',
      "Africa's Talking USSD/SMS",
      'Telegram Bot API',
      'Playwright',
      'React',
      'TypeScript',
      'Tailwind CSS',
    ],
    coverImage: '/images/projects/halisi-app-cover.png',
    gallery: ['/images/projects/halisi-app-cover.png'],
    altText:
      'Halisi architecture diagram showing FastAPI, Supabase pgvector CLIP ViT-B-32 visual matching, NVIDIA NIM Llama 3.1 8B classification, and Safaricom Daraja / Africa’s Talking channels',
    repositoryUrl: 'https://github.com/sigangandegwa/HalisiApp',
    publishedAt: '2025-02-15',
    featured: true,
    seoTitle: 'Halisi — AI Brand Impersonation & M-Pesa Fraud Detection | Geoffrey Obwocha',
    seoDescription:
      'Case study of Halisi, an AI-powered brand impersonation and M-Pesa fraud detection platform built with FastAPI, Supabase pgvector, CLIP ViT-B-32, and Llama 3.1 8B at the University of Nairobi.',
    ogImage: '/og/projects/halisi-app.png',
  },
  {
    slug: 'greenroute',
    title: 'GreenRoute',
    subtitle: 'Eco-Routing & Carbon-Aware Navigation Engine for Nairobi',
    category: 'Geospatial Systems · Climate Tech · Routing Algorithms',
    summary:
      'A geospatial routing and emissions-telemetry engine built with Django, OSMnx, and NetworkX A* search over nairobi_eco_map.graphml that computes fuel- and carbon-conscious corridors across Nairobi.',
    problem:
      'Standard navigation tools optimize exclusively for raw distance or theoretical free-flow speed, ignoring steep road grade penalties and congestion-induced idling that inflate fuel burn and urban tailpipe CO2 emissions across Nairobi.',
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
      'Constructed a persistent Nairobi street network graph (nairobi_eco_map.graphml) using OSMnx and enriched edge weights with Open-Elevation grade profiles and live TomTom Traffic API congestion telemetry.',
      'Implemented a custom NetworkX A* eco-weighted routing algorithm in Django that minimizes projected fuel burn and CO2 output rather than raw distance alone, paired with Photon (Komoot) geocoding.',
      'Designed an interactive Leaflet.js map workspace displaying side-by-side eco-routes versus standard fastest routes with transparent carbon delta telemetry.',
    ],
    solution:
      'GreenRoute executes custom A* graph traversal over Nairobi’s road network to surface low-emission corridors and quantify per-trip carbon and fuel savings alongside conventional navigation paths.',
    outcomes: [
      'Built an interactive multi-route comparison engine tailored to Nairobi road geometry, elevation gradients, and live traffic corridors.',
      'Delivered real-time visual telemetry comparing distance, estimated travel duration, and projected CO2 footprint across candidate paths.',
      'Established a clean geospatial architecture separating NetworkX graph traversal on nairobi_eco_map.graphml from external TomTom and Photon telemetry adapters.',
    ],
    technologies: [
      'Python',
      'Django',
      'OSMnx',
      'NetworkX A* Routing',
      'nairobi_eco_map.graphml',
      'TomTom Traffic API',
      'Open-Elevation API',
      'Photon Geocoding',
      'Leaflet.js',
      'JavaScript',
    ],
    coverImage: '/images/projects/greenroute-cover.png',
    gallery: ['/images/projects/greenroute-cover.png'],
    altText:
      'GreenRoute geospatial map architecture comparing NetworkX A* carbon-aware eco-routes and standard routes across Nairobi road segments',
    liveUrl: 'https://greenroute-production.up.railway.app/',
    repositoryUrl: 'https://github.com/GObwocha/GreenRoute',
    publishedAt: '2025-01-20',
    featured: true,
    seoTitle: 'GreenRoute — Carbon-Aware Eco-Routing Engine for Nairobi | Geoffrey Obwocha',
    seoDescription:
      'Case study of GreenRoute, a Django, OSMnx, and NetworkX A* geospatial eco-routing engine for Nairobi built by Geoffrey Obwocha, Benson Mose, and Timothy Mwita.',
    ogImage: '/og/projects/greenroute.png',
  },
  {
    slug: 'kula-kwa-macho',
    title: 'Kula-Kwa-Macho',
    subtitle: 'Interactive Kenyan Food Discovery & Culinary Platform',
    category: 'Full-Stack Web · Consumer Product · Cultural Discovery',
    summary:
      'A visually rich Kenyan culinary discovery and ordering application built with Next.js App Router and Supabase SSR Auth, featuring an interactive Craving Quiz and localized rider personas Boda Bob and Captain Chapati.',
    problem:
      'East African culinary heritage is often underrepresented or fragmented across generic food delivery apps that lack visual craft, cultural storytelling, and playful, mobile-first discovery.',
    role: 'Creator & Full-Stack Product Engineer — Next.js Architecture, Supabase Auth & Visual Design',
    process: [
      'Architected a Next.js App Router application with TypeScript and Supabase SSR cookie-based authentication (@supabase/ssr) for seamless session persistence across server and client components.',
      'Engineered an interactive Craving Quiz that matches a visitor’s mood, spice tolerance, and texture preferences to curated Kenyan dishes ("Kula Kwa Macho" — Swahili for "feasting with the eyes").',
      'Crafted a localized checkout and dispatch tracking experience featuring Kenyan delivery rider personas including Boda Bob and Captain Chapati, deployed on Vercel.',
    ],
    solution:
      'Kula-Kwa-Macho pairs high-contrast editorial food presentation with an interactive Craving Quiz, Supabase SSR authentication, and culturally grounded Kenyan delivery workflows.',
    outcomes: [
      'Shipped and deployed a live production web application at kula-kwa-macho-zeta.vercel.app.',
      'Engineered zero-CLS dish cards, interactive Craving Quiz filtering, and humorous Kenyan rider dispatch personas (Boda Bob & Captain Chapati).',
      'Implemented secure cookie-backed Supabase SSR authentication and protected ordering flows across mobile and desktop viewports.',
    ],
    technologies: [
      'Next.js App Router',
      'TypeScript',
      'React',
      'Supabase SSR Auth',
      'Tailwind CSS',
      'Craving Quiz Engine',
      'Vercel',
    ],
    coverImage: '/images/projects/kula-kwa-macho-cover.png',
    gallery: ['/images/projects/kula-kwa-macho-cover.png'],
    altText:
      'Kula-Kwa-Macho Kenyan culinary discovery platform showing Craving Quiz recommendations, Supabase SSR cart, and Boda Bob and Captain Chapati rider telemetry',
    liveUrl: 'https://kula-kwa-macho-zeta.vercel.app',
    repositoryUrl: 'https://github.com/GObwocha/Kula-Kwa-Macho',
    publishedAt: '2024-11-10',
    featured: true,
    seoTitle: 'Kula-Kwa-Macho — Interactive Kenyan Culinary Discovery Platform | Geoffrey Obwocha',
    seoDescription:
      'Explore how Geoffrey Obwocha designed and built Kula-Kwa-Macho with Next.js App Router, Supabase SSR Auth, an interactive Craving Quiz, and localized Kenyan rider personas.',
    ogImage: '/og/projects/kula-kwa-macho.png',
  },
  {
    slug: 'somastar',
    title: 'SomaStar',
    subtitle: 'Adaptive Learning & AI Exam Intelligence Platform',
    category: 'EdTech · AI Assessment · Full-Stack Platform',
    summary:
      'An adaptive study and exam-intelligence platform built with React 19, FastAPI, SQLAlchemy 2.0, and Recharts that transforms curriculum materials into diagnostic assessments and visual mastery analytics.',
    problem:
      'Students preparing for rigorous university and national examinations often rely on static past papers without diagnostic telemetry on which underlying topics require targeted reinforcement.',
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
      'Collaborated on the relational domain model in FastAPI and SQLAlchemy 2.0 covering courses, topic hierarchies, question banks, and timestamped learner attempt histories.',
      'Built interactive React 19 quiz and revision workflows with Recharts analytics dashboards that visualize topic-level mastery and historical exam performance.',
      'Integrated structured question validation and diagnostic explanation pipelines to guide post-assessment revision.',
    ],
    solution:
      'SomaStar turns passive reading into active recall by pairing FastAPI + SQLAlchemy 2.0 assessment services with React 19 and Recharts mastery visualizations.',
    outcomes: [
      'Co-engineered a modular full-stack learning platform supporting structured revision, timed practice exams, and adaptive question flows.',
      'Implemented Recharts visual analytics views that pinpoint weak curriculum topics immediately after each assessment session.',
      'Maintained strict separation between FastAPI/SQLAlchemy 2.0 grading persistence and React 19 presentation components.',
    ],
    technologies: [
      'React 19',
      'TypeScript',
      'FastAPI',
      'SQLAlchemy 2.0',
      'Python',
      'Recharts',
      'Tailwind CSS',
    ],
    coverImage: '/images/projects/somastar-cover.svg',
    gallery: ['/images/projects/somastar-cover.svg'],
    altText:
      'SomaStar adaptive learning interface showing React 19 and Recharts topic mastery analytics backed by FastAPI and SQLAlchemy 2.0',
    repositoryUrl: 'https://github.com/Emmanuel-Makori-Obiero/somastar',
    publishedAt: '2025-01-05',
    featured: true,
    seoTitle: 'SomaStar — Adaptive Learning & AI Exam Intelligence Platform | Geoffrey Obwocha',
    seoDescription:
      'Case study of SomaStar, a React 19, FastAPI, SQLAlchemy 2.0, and Recharts adaptive exam intelligence platform co-engineered by Geoffrey Obwocha and Emmanuel Makori Obiero.',
    ogImage: '/og/projects/somastar.svg',
  },
  {
    slug: 'geliscope',
    title: 'GeliScope',
    subtitle: 'Multi-Role AI Educational Diagnostic & Socratic Tutoring Portal',
    category: 'EdTech · Multimodal AI · Vue 3 Architecture',
    summary:
      'A role-based educational platform built with Vue 3, Vuetify 3, Pinia, and Google Gemini Vision that combines rubric-aligned coursework diagnostics for educators with a Bloom’s Taxonomy Socratic tutor for learners.',
    problem:
      'Generic AI chat interfaces often hand students direct answers—undermining genuine comprehension—while teachers spend hours manually grading handwritten or uploaded coursework against multi-criteria rubrics.',
    role: 'Lead Architect & Full-Stack Engineer — Vue 3 Frontend, Pinia State & Gemini Vision Prompts',
    process: [
      'Architected distinct role portals (Student, Educator, Administrator) using Vue 3 Composition API, TypeScript, Pinia state stores, and Vuetify 3 components.',
      'Engineered a multimodal Google Gemini Vision rubric grading pipeline that evaluates uploaded student coursework against structured educator criteria.',
      'Designed a Socratic tutoring state machine grounded in Bloom’s Taxonomy (Remember, Understand, Apply, Analyze, Evaluate, Create) that guides learners through probing questions rather than spoiling solutions.',
    ],
    solution:
      'GeliScope empowers teachers with structured Gemini Vision rubric diagnostics while giving students a guardrailed Bloom’s Taxonomy Socratic dialogue engine in Vue 3 and Vuetify 3.',
    outcomes: [
      'Delivered a multi-role Vue 3 + Vuetify 3 + Pinia educational portal with dedicated workflows for instructors, learners, and administrators.',
      'Implemented structured JSON schema validation for Gemini Vision rubric evaluations and 6-tier Bloom’s Taxonomy cognitive progression.',
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
    coverImage: '/images/projects/geliscope-cover.png',
    gallery: ['/images/projects/geliscope-cover.png'],
    altText:
      'GeliScope Vue 3 and Vuetify 3 educational portal showing Gemini Vision rubric grading and Bloom’s Taxonomy Socratic tutoring stages',
    liveUrl: 'https://geliscope.up.railway.app/',
    publishedAt: '2024-12-01',
    featured: false,
    seoTitle: 'GeliScope — AI Educational Diagnostic & Socratic Tutoring Portal | Geoffrey Obwocha',
    seoDescription:
      'Case study of GeliScope, a Vue 3, Vuetify 3, Pinia, and Gemini Vision educational platform featuring rubric-based grading and Bloom’s Taxonomy Socratic tutoring.',
    ogImage: '/og/projects/geliscope.png',
  },
  {
    slug: 'email-analyzer',
    title: 'Email Analyzer',
    subtitle: 'Automated AI Academic Inbox Digest Pipeline',
    category: 'Workflow Automation · LLM Pipelines · Developer Tooling',
    summary:
      'An automated inbox triage and scheduled EAT daily digest pipeline built with Google Apps Script, Node.js, and Gemini 1.5 Flash that distills high-volume university email threads into prioritized action summaries.',
    problem:
      'University of Nairobi students and academic club coordinators receive dozens of daily circulars, timetable revisions, scholarship notices, and project threads—making it easy to miss time-sensitive deadlines buried in long email bodies.',
    role: 'Creator & Systems Engineer — Pipeline Architecture, Apps Script Automation & Gemini Integration',
    process: [
      'Built a scheduled Google Apps Script and Node.js ingestion workflow that securely queries unread academic and organizational Gmail threads on an East Africa Time (EAT / UTC+3) cron trigger.',
      'Engineered structured Gemini 1.5 Flash extraction prompts to classify emails by urgency, extract concrete deadlines, and summarize required actions.',
      'Implemented deterministic rate-limit backoff and malformed-payload fallback handling before dispatching the daily executive briefing.',
    ],
    solution:
      'Email Analyzer runs zero-maintenance in the background on a scheduled EAT trigger, converting noisy academic inbox traffic into a concise, deadline-first daily digest powered by Gemini 1.5 Flash.',
    outcomes: [
      'Automated daily East Africa Time (EAT) inbox classification and deadline extraction with zero manual copy-pasting.',
      'Engineered deterministic fallback handling for API rate limits and malformed email bodies across Google Apps Script and Node.js.',
      'Published the open-source automation pipeline and setup documentation on GitHub.',
    ],
    technologies: [
      'Google Apps Script',
      'Node.js',
      'JavaScript',
      'Gemini 1.5 Flash',
      'Gmail API',
      'EAT Scheduled Cron',
    ],
    coverImage: '/images/projects/email-analyzer-cover.png',
    gallery: ['/images/projects/email-analyzer-cover.png'],
    altText:
      'Email Analyzer pipeline architecture showing Google Apps Script, Node.js, and Gemini 1.5 Flash scheduled EAT daily academic inbox digest',
    repositoryUrl: 'https://github.com/GObwocha/Email-Analyzer',
    publishedAt: '2024-10-18',
    featured: false,
    seoTitle: 'Email Analyzer — Automated AI Academic Inbox Digest Pipeline | Geoffrey Obwocha',
    seoDescription:
      'How Geoffrey Obwocha built Email Analyzer, an automated Google Apps Script, Node.js, and Gemini 1.5 Flash scheduled EAT pipeline for triaging university inbox deadlines.',
    ogImage: '/og/projects/email-analyzer.png',
  },
  {
    slug: 'ole-ken-hotel',
    title: 'The Ole~Ken Hotel',
    subtitle: 'Contemporary African Hospitality Website Redesign',
    category: 'Hospitality Web · Conversion Design · Next.js 14',
    summary:
      'A modern hospitality web redesign and direct-booking experience for The Ole~Ken Hotel in Nakuru, Kenya, engineered with Next.js 14, TypeScript, Tailwind CSS, Framer Motion, and a streamlined WhatsApp reservation engine.',
    problem:
      'Regional hospitality websites frequently suffer from slow page loads, cluttered navigation, and high-friction reservation forms that cause mobile guests to abandon direct bookings in favor of third-party OTAs.',
    role: 'Lead Frontend & Conversion Engineer — Next.js 14 Architecture, Visual Redesign & Booking UX',
    process: [
      'Audited the guest journey for The Ole~Ken Hotel (Nakuru, Kenya) to identify mobile navigation bottlenecks and reservation drop-off points.',
      'Designed a warm, editorial African hospitality interface in Next.js 14 with Tailwind CSS and restrained Framer Motion transitions showcasing suites, dining, and conferencing.',
      'Built a structured WhatsApp concierge booking engine that pre-populates room category, check-in/out dates, and guest counts for instant reservation confirmation.',
    ],
    solution:
      'The Ole~Ken Hotel redesign elevates brand perception with fast Next.js 14 rendering, editorial typography, Framer Motion polish, and a high-conversion WhatsApp direct reservation flow.',
    outcomes: [
      'Engineered a responsive Next.js 14 + TypeScript + Tailwind CSS hospitality platform with structured room, dining, and conference showcases.',
      'Reduced booking friction by integrating a pre-validated WhatsApp concierge reservation builder alongside direct enquiries.',
      'Implemented semantic hospitality schema markup and zero-CLS image loading across mobile and desktop viewports.',
    ],
    technologies: [
      'Next.js 14',
      'TypeScript',
      'Tailwind CSS',
      'Framer Motion',
      'WhatsApp Booking Engine',
      'Hospitality SEO',
    ],
    coverImage: '/images/projects/ole-ken-hotel-cover.png',
    gallery: ['/images/projects/ole-ken-hotel-cover.png'],
    altText:
      'The Ole~Ken Hotel hospitality website redesign in Next.js 14 showing luxury suite showcase and direct WhatsApp concierge booking flow',
    liveUrl: 'https://the-ole-ken-hotel-revamp-rebsite.vercel.app/',
    repositoryUrl: 'https://github.com/GObwocha/The-Ole-Ken-Hotel-Revamp-Website',
    referenceUrl: 'https://www.theolekenhotel.co.ke/',
    publishedAt: '2024-09-25',
    featured: false,
    seoTitle: 'The Ole~Ken Hotel — Contemporary Hospitality Website Redesign | Geoffrey Obwocha',
    seoDescription:
      'Case study of The Ole~Ken Hotel website redesign in Next.js 14, TypeScript, Tailwind CSS, and Framer Motion with a direct WhatsApp booking engine.',
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
