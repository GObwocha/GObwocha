# Geoffrey Obwocha — Production Portfolio Website

<!--
**GObwocha/GObwocha** is a ✨ _special_ ✨ repository because its `README.md` (this file) appears on your GitHub profile.
-->

Production portfolio website for **Geoffrey Obwocha** (`@GObwocha` — Systems Architect & Full-Stack Product Engineer, Nairobi, Kenya), engineered with **React 19**, **TypeScript**, **Vite**, **React Router v7 (SSG/SSR Pre-rendering)**, and **Supabase**.

---

## 1. Architecture & Tech Stack

- **Frontend:** React 19 + TypeScript (strict mode, `noUncheckedIndexedAccess`) + Vite 8
- **Rendering Strategy:** React Router v7 with deterministic build-time Static Site Generation (`src/entry-server.tsx` + `scripts/prerender.mjs`) producing crawlable semantic HTML, unique Open Graph (`1200×630`) & Twitter Card metadata, JSON-LD structured data, and `dist/sitemap.xml` across all 11 public routes and `dist/404.html`.
- **Design System:** Custom tokenized CSS architecture (`src/styles/tokens.css`, `typography.css`, `motion.css`, `globals.css`) in Warm Obsidian (`#0A0A09`), Archival Bone (`#F5F3EE`), and International Vermilion (`#FF4D1C`) with WCAG 2.1 AA verified contrast (`>= 4.5:1`), fluid `clamp()` typography, and first-class `prefers-reduced-motion: reduce` support.
- **Backend / Persistence:** Supabase Postgres (`public.contact_submissions`) protected by `FORCE ROW LEVEL SECURITY` (`anon` `INSERT`-only policy; zero public `SELECT`, `UPDATE`, or `DELETE` access).
- **Security & Abuse Controls:** Dual client/database input validation (`zod` + Postgres `CHECK` constraints), honeypot + minimum interaction timing (`1500ms`) + cooldown rate-limiting (`src/lib/security/antiSpam.ts`), sanitized user-facing error handling (`src/lib/security/errors.ts`), and strict edge CSP & HSTS headers (`vercel.json`).
- **Quality & Verification:** ESLint, Prettier, Vitest, React Testing Library, `vitest-axe`, Playwright E2E, and `@axe-core/playwright`.

---

## 2. Featured Engineering Case Studies & Collaborator Credits

All project content is strongly typed in [`src/data/projects.ts`](src/data/projects.ts):

1. **Halisi** (`/work/halisi-app`) — _AI-Powered Brand Impersonation & M-Pesa Fraud Detection_ (`https://github.com/sigangandegwa/HalisiApp`)
   - **Co-Engineered With:** Collins Kimanzi / Collins Mwandikwa (`@Kimanzi-Collins`), Ndegwa Waudo (`@sigangandegwa`), and Dennis Kuria (_Chiromo Tech Club, University of Nairobi_).
2. **GreenRoute** (`/work/greenroute`) — _Eco-Routing & Carbon-Aware Navigation Engine for Nairobi_ (`https://github.com/GObwocha/GreenRoute`, Live: `https://greenroute-production.up.railway.app/`)
   - **Co-Engineered With:** Benson Mose (`@Bemos26`) and Timothy Mwita (`@Tim-cm`).
3. **Kula-Kwa-Macho** (`/work/kula-kwa-macho`) — _Interactive Kenyan Food Discovery & Culinary Platform_ (`https://github.com/GObwocha/Kula-Kwa-Macho`, Live: `https://kula-kwa-macho-zeta.vercel.app`)
4. **SomaStar** (`/work/somastar`) — _Adaptive Learning & AI Exam Intelligence Platform_ (`https://github.com/Emmanuel-Makori-Obiero/somastar`)
   - **Co-Engineered With:** Emmanuel Makori Obiero (`@Emmanuel-Makori-Obiero`).
5. **GeliScope** (`/work/geliscope`) — _AI Vision Assessment Engine & Cognitive Profiling Platform_ (Live: `https://geliscope.up.railway.app/`)
6. **Email Analyzer** (`/work/email-analyzer`) — _Automated AI Academic Inbox Digest Pipeline_ (`https://github.com/GObwocha/Email-Analyzer`)
7. **The Ole~Ken Hotel** (`/work/ole-ken-hotel`) — _Contemporary African Hospitality Website Redesign_ (Live: `https://the-ole-ken-hotel-revamp-rebsite.vercel.app/`, Official Reference: `https://www.theolekenhotel.co.ke/`)

---

## 3. Local Setup & Environment Configuration

### Prerequisites

- **Node.js:** `>= 20.x` (verified on `v24.11.0`)
- **Package Manager:** `npm` (locked via `package-lock.json`)

### Installation

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Populate `.env.local` with your public Supabase project URL and publishable `anon` key:
   ```dotenv
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-publishable-key
   VITE_SITE_URL=https://gobwocha.vercel.app
   ```
   > **Security Rule:** Never place `SUPABASE_SERVICE_ROLE_KEY` or `sb_secret_*` keys in any `VITE_*` variable or client-side file. `src/lib/supabase/env.ts` automatically rejects `service_role` keys at runtime.
3. Install dependencies reproducibly:
   ```bash
   npm ci
   ```
4. Start the local development server:
   ```bash
   npm run dev
   ```

---

## 4. Canonical Validation Commands

```bash
# 1. Reproducible dependency install
npm ci

# 2. Static quality gates
npm run lint
npm run typecheck
npm run format:check

# 3. Automated unit, component, SEO, security, and accessibility tests (Vitest + vitest-axe)
npm run test

# 4. Production client + SSR build and static route pre-rendering (dist/ + dist/sitemap.xml)
npm run build

# 5. End-to-end, responsive (320px-2560px), reduced-motion, and axe-core tests (Playwright)
npm run test:e2e

# 6. Production dependency vulnerability audit
npm audit --omit=dev
```

---

## 5. Supabase Database Migration & Maintenance Guide

### Applying the Contact Submissions Schema & RLS Policies

The versioned migration [`supabase/migrations/20261011000000_create_contact_submissions.sql`](supabase/migrations/20261011000000_create_contact_submissions.sql) creates `public.contact_submissions` with bounded `CHECK` constraints and strict `INSERT`-only Row Level Security for anonymous visitors.

To apply via Supabase CLI:

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

Or paste the contents of `supabase/migrations/20261011000000_create_contact_submissions.sql` directly into the **Supabase Dashboard → SQL Editor** and click **Run**.

### Updating Portfolio Content & Adding Projects

1. Edit [`src/data/projects.ts`](src/data/projects.ts) (for case studies) or [`src/data/site.ts`](src/data/site.ts) (for biography, availability, or capabilities).
2. Place project cover illustrations (`800×500` SVG/AVIF/WebP, `≤ 300 KB`) in `public/images/projects/`.
3. Regenerate `1200×630` Open Graph social preview PNGs (`public/og/**/*.png`):
   ```bash
   node scripts/generate-og-assets.mjs
   ```
4. Run `npm run test && npm run build` to verify TypeScript schema compliance, pre-render the new static `/work/<slug>/index.html` route, and update `dist/sitemap.xml`.

### Deployment, Backups & Instant Rollback

- **Deployment (Vercel):** Push to `main` after CI passes. Ensure `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_SITE_URL` are configured in Vercel Project Settings → Environment Variables.
- **Database Backups & Retention:** Export enquiries periodically from **Supabase Dashboard → Table Editor → `contact_submissions` → Export to CSV**, and run the 12-month retention cleanup SQL documented in [`docs/SECURITY_REVIEW.md`](docs/SECURITY_REVIEW.md).
- **Instant Rollback:** Run `npx vercel rollback` or promote the previous healthy deployment in **Vercel Dashboard → Deployments → Instant Rollback**.

---

## 6. Architecture & Governance Documentation

- [`AGENTS.md`](AGENTS.md) — Governing specification, sprint board, and release gates
- [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) — Rendering architecture decision and sprint plan
- [`docs/DESIGN_DIRECTION.md`](docs/DESIGN_DIRECTION.md) — _Architectural Precision_ design direction and token blueprint
- [`docs/NFR_VALIDATION.md`](docs/NFR_VALIDATION.md) — Measured performance, accessibility, responsive, SEO, and security evidence
- [`docs/SECURITY_REVIEW.md`](docs/SECURITY_REVIEW.md) — Threat model, CSP/HSTS headers, RLS audit, SLA review, and recovery plan
- [`docs/RELEASE_CHECKLIST.md`](docs/RELEASE_CHECKLIST.md) — Pre-launch verification checklist and owner cutover steps
- [`docs/SPRINT_LOG.md`](docs/SPRINT_LOG.md) — Chronological sprint execution and test log
