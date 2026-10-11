# Implementation Plan — Production Portfolio Website

## 1. S0-T1: Baseline Repository & Environment Audit

**Audit Date:** 2026-10-11  
**Workspace:** `e:\Coding_Projects\GObwocha`

### 1.1 Repository Tree

All files and directories present at baseline (excluding `.git` internals):

```text
GObwocha/
├── .agents/
│   └── skills/
│       └── top-design/
│           ├── SKILL.md                             (23,415 bytes)
│           └── references/
│               ├── animation-patterns.md            (15,093 bytes)
│               ├── case-studies.md                  (12,976 bytes)
│               ├── layout-systems.md                (10,120 bytes)
│               ├── technical-stack.md               (11,554 bytes)
│               └── typography.md                    (8,883 bytes)
├── AGENTS.md                                        (35,037 bytes)
└── README.md                                        (458 bytes)
```

### 1.2 Existing Files That Must Be Preserved

Per `AGENTS.md` §1.1, the following existing files and directories must be preserved and never blindly overwritten or deleted:

1. **`AGENTS.md`** — Project governance, architecture requirements, NFR release gates, and sprint board.
2. **`README.md`** — Initial GitHub profile template (`fd247d4 Initial commit`); will be updated with project documentation and canonical scripts as architecture is scaffolded while preserving repository history.
3. **`.agents/skills/top-design/**`** — Design skill and reference documentation (`SKILL.md`, `animation-patterns.md`, `case-studies.md`, `layout-systems.md`, `technical-stack.md`, `typography.md`).

### 1.3 Absence of Application Scaffold & Configuration

The repository currently contains **no application code or tooling scaffold**:

- **Manifest & Lockfiles:** No `package.json`, `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, or `bun.lockb`.
- **Compiler & Bundler Config:** No `tsconfig.json` or `vite.config.*`.
- **Environment Config:** No `.env`, `.env.example`, or `.env.local` files.
- **Application Directories:** No `src/`, `public/`, `supabase/`, `tests/`, or `.github/workflows/` directories; no existing routes, styles, or tests.

Because the repository has no existing application structure, we will scaffold the architecture defined in `AGENTS.md` §6 during `S1-T1` after completing the Sprint 0 decision gates (`S0-T2`, `S0-T3`, `S0-T4`).

### 1.4 Git State

- **Current Branch:** `main` (tracking `origin/main`, up to date)
- **Remote (`origin`):** `https://github.com/GObwocha/GObwocha.git` (fetch & push)
- **Commit History:**
  - `fd247d4` — `Initial commit` (contains `README.md`)
- **Working Tree Status (Pre-Commit):**
  - Untracked: `.agents/`, `AGENTS.md`

### 1.5 System & Package Manager Environment

| Tool | Installed Version / Status | Notes |
|---|---|---|
| OS | Windows (PowerShell) | Working directory `e:\Coding_Projects\GObwocha` |
| `node` | `v24.11.0` | Active runtime |
| `npm` | `11.7.0` | Available; canonical package manager for this project (`package-lock.json`) |
| `pnpm` | Not installed (`CommandNotFoundException`) | Not available on system PATH |
| `yarn` | Not installed (`CommandNotFoundException`) | Not available on system PATH |
| `git` | `2.52.0.windows.1` | Available and configured |

**Package Manager Decision:** Since no lockfile exists yet and `npm` (`11.7.0`) is the only installed Node package manager on the host environment, **`npm` with `package-lock.json`** will be used consistently across all sprints.

### 1.6 Baseline Validation Command Results (`AGENTS.md` §8)

All canonical validation commands from `AGENTS.md` §8 were executed against the un-scaffolded repository to record the honest baseline:

| Command | Exit Code | Result | Actual Output / Error Summary |
|---|---|---|---|
| `npm ci` | `1` | FAIL | `npm error code EUSAGE` — `The npm ci command can only install with an existing package-lock.json or npm-shrinkwrap.json with lockfileVersion >= 1.` |
| `npm run lint` | `-4058` | FAIL | `npm error code ENOENT` — `Could not read package.json: Error: ENOENT: no such file or directory, open 'E:\Coding_Projects\GObwocha\package.json'` |
| `npm run typecheck` | `-4058` | FAIL | `npm error code ENOENT` — `Could not read package.json: Error: ENOENT: no such file or directory, open 'E:\Coding_Projects\GObwocha\package.json'` |
| `npm run format:check` | `-4058` | FAIL | `npm error code ENOENT` — `Could not read package.json: Error: ENOENT: no such file or directory, open 'E:\Coding_Projects\GObwocha\package.json'` |
| `npm run test` | `-4058` | FAIL | `npm error code ENOENT` — `Could not read package.json: Error: ENOENT: no such file or directory, open 'E:\Coding_Projects\GObwocha\package.json'` |
| `npm run test:e2e` | `-4058` | FAIL | `npm error code ENOENT` — `Could not read package.json: Error: ENOENT: no such file or directory, open 'E:\Coding_Projects\GObwocha\package.json'` |
| `npm run build` | `-4058` | FAIL | `npm error code ENOENT` — `Could not read package.json: Error: ENOENT: no such file or directory, open 'E:\Coding_Projects\GObwocha\package.json'` |
| `npm audit --omit=dev` | `1` | FAIL | `npm error code ENOLOCK` — `This command requires an existing lockfile. Original error: loadVirtual requires existing shrinkwrap file` |

---

## 2. S0-T2: Rendering Architecture & Framework Decision Gate

**Decision Date:** 2026-10-11  
**Status:** APPROVED (`S0-T2` Complete)  
**Selected Stack:** **React 19 + TypeScript + Vite + React Router v7 (Build-Time SSG Pre-rendering & SSR Pipeline)**

### 2.1 Architectural Context & Requirements (`AGENTS.md` §4.4, §5, §6)

Per `AGENTS.md`:
- **Environment Header:** `Frontend: React + TypeScript + Vite`
- **§4.4 SEO and Social Discoverability:** *"Use SSG or SSR so crawlers can access meaningful page content without relying on client-side JavaScript. Every project page needs a unique title, meta description, and Open Graph metadata... Architecture note: Vite + React SPA alone does not satisfy the SSG/SSR requirement. Use a React framework that supports static generation/SSR (recommended: React Router framework mode or Next.js), or choose and document a verified prerendering solution before building pages."*
- **§5 Decision Gate:** *"Before scaffolding, decide the React framework because SSR/SSG is a hard requirement. Record the choice and rationale in `docs/IMPLEMENTATION_PLAN.md`. Do not use a plain SPA without an approved SEO-compatible rendering strategy."*
- **§6 Architecture Rules:** *"Keep portfolio content static and strongly typed unless the owner specifically needs database-driven editing... A project detail route must return meaningful HTML and unique metadata at build/response time. If using static generation, ensure project content is available at build time and define how new projects trigger a rebuild. Server-only code must be impossible to import into browser bundles."*

### 2.2 Candidate Architecture Evaluation Matrix

| Criterion | Option 1 (Selected): React 19 + TypeScript + Vite + React Router v7 (SSG Prerender / SSR Pipeline) | Option 2 (Alternative Evaluated): Next.js (App Router) | Option 3 (Rejected Baseline): Plain Vite + React SPA |
|---|---|---|---|
| **Alignment with `AGENTS.md` Stack Header** | **Exact match** (`React + TypeScript + Vite`). Preserves native Vite config, fast HMR, and Vitest shared pipeline. | **Diverges** from Vite stack header; replaces Vite with Webpack/Turbopack and enforces Next-specific conventions. | Matches Vite + React, but **explicitly prohibited** by `AGENTS.md` §4.4 & §5 when used without SSG/SSR. |
| **Alignment with `AGENTS.md` §6 Directory Tree** | **1:1 match** with `src/app/`, `src/routes/`, `src/components/`, `src/data/`, `src/lib/`, `src/styles/`. | Requires `app/` file-system routing conventions or workarounds that conflict with `src/routes/` layout in §6. | Matches directory tree, but fails HTML generation requirements. |
| **Crawlable Build/Server HTML (§4.4)** | **PASS.** Pre-renders every static route and every dynamic `/work/:slug` route at build time via `react-dom/server` (`renderToString`) + React Router static handling, emitting complete semantic HTML files per route. | **PASS.** Supports `generateStaticParams` and SSR out of the box. | **FAIL.** Emits a single `<div id="root"></div>` shell; crawlers and social card scrapers that do not execute JS see an empty page. |
| **Per-Route Unique `<head>` Metadata & Social Cards (§4.4)** | **PASS.** Deterministic build-time head injection populates `<title>`, `<meta name="description">`, `<link rel="canonical">`, Open Graph (`1200×630`), Twitter Card (`summary_large_image`), and JSON-LD directly in the static HTML `<head>` of each route before hydration, and syncs on client navigation. | **PASS.** Supports `generateMetadata` API. | **FAIL.** Meta tags injected only after client JS hydration are ignored by Slack, LinkedIn, X/Twitter, Discord, and non-JS crawlers. |
| **Performance Budgets (`LCP < 1.5s`, `TTI ≤ 2.5s` on 4G, `CLS < 0.05`)** | **Optimal.** Static pre-rendered HTML is served directly from CDN edge with minimal JS bundle overhead, zero server cold-start latency, and immediate First/Largest Contentful Paint. | **Good, but heavier.** Carries a larger base client runtime payload and hydration footprint for a content-driven portfolio. | **Poor LCP/SEO.** Delays content rendering until the entire JS bundle downloads, parses, and executes on 4G. |
| **Hosting & Deployment (`Vercel` / Static + Edge)** | **Zero-config CDN deployment.** Pre-rendered `dist/` artifacts deploy directly to Vercel HTTPS edge with clean URL rewrites/static route resolution and `404.html` support. | Native on Vercel, though locks certain routing/image features to Next runtime. | Deploys easily, but relies on catch-all `index.html` fallback with HTTP 200 for all routes unless overridden. |

#### Summary of Decision
1. **Selected Architecture — React 19 + TypeScript + Vite with React Router v7 (SSG Pre-rendering + SSR Entry Pipeline):**
   - Preserves the exact `React + TypeScript + Vite` toolchain and `src/` directory layout mandated in `AGENTS.md`.
   - Uses a shared route definition (`src/app/routes.tsx`), a browser hydration entry (`src/entry-client.tsx`), a server rendering entry (`src/entry-server.tsx`), and a deterministic Vite SSG pre-render step (`scripts/prerender.mjs` invoked during `npm run build` after client and SSR bundles compile).
   - Whether configured via React Router v7's Vite prerender config or Vite's native `vite build --ssr` + static route generator, every route produces standalone, crawlable HTML containing both semantic body landmarks and route-specific `<head>` tags at build time, followed by seamless React hydration in the browser.
2. **Why Next.js (App Router) Was Not Selected:**
   - While Next.js satisfies SSR/SSG, it abandons the `Vite` bundler specified in `AGENTS.md`, introduces a heavier framework runtime, complicates sharing a unified `vite.config.ts` with `Vitest`, and conflicts with the target `src/routes/` architecture in `AGENTS.md` §6.
3. **Why Plain Vite + React SPA Was Rejected:**
   - Explicitly barred by `AGENTS.md` §4.4 and §5 because client-only rendering emits an empty `<div id="root"></div>` container and sets `<head>` tags only after JavaScript execution, failing social preview bots (Open Graph / Twitter Cards) and search crawlers.

---

### 2.3 Route-by-Route Rendering & Metadata Verification Strategy

Every public route defined in `AGENTS.md` §2 is pre-rendered during `npm run build` into its own HTML artifact with full semantic landmarks and unique `<head>` metadata:

| Route Pattern | Build Output Artifact | Rendering Source & Data Input | Semantic Landmarks Required in Generated HTML | Unique `<head>` Metadata Emitted at Build Time |
|---|---|---|---|---|
| `/` | `dist/index.html` | Static route (`src/routes/home/`) + `src/data/site.ts` + featured subset of `src/data/projects.ts` | `<header>`, `<nav aria-label="Primary">`, `<main id="main-content">`, `<h1>` (value proposition), `<section>` (featured work, capabilities, contact CTA), `<footer>` | Unique home `<title>`, `<meta name="description">`, `<link rel="canonical" href="https://<domain>/">`, `og:title`, `og:description`, `og:type="website"`, `og:image` (`/og/default.png`, `1200×630`), `twitter:card="summary_large_image"`, `Person`/`WebSite` JSON-LD |
| `/work` | `dist/work/index.html` | Static route (`src/routes/work/`) + all published items in `src/data/projects.ts` | `<header>`, `<nav>`, `<main id="main-content">`, `<h1>` (Work index heading), `<section>` containing `<article>` cards per project, `<footer>` | Unique work index `<title>`, `<meta name="description">`, `<link rel="canonical" href="https://<domain>/work">`, `og:*`, `twitter:*`, `CollectionPage` JSON-LD |
| `/work/:slug` | `dist/work/<slug>/index.html` (one per project slug) | Dynamic route (`src/routes/project-detail/`) enumerated at build time from `projects.map(p => p.slug)` in `src/data/projects.ts` | `<header>`, `<nav>`, `<main id="main-content">`, `<article>`, `<h1>` (project title), structured `<section>` blocks (Problem, Role, Process, Solution, Outcomes, Tech Stack), `<footer>` | Project-specific `seoTitle`, `seoDescription`, `<link rel="canonical" href="https://<domain>/work/<slug>">`, `og:title`, `og:description`, `og:type="article"`, `og:image` (`/og/projects/<slug>.png`, `1200×630`, `og:image:width="1200"`, `og:image:height="630"`), `twitter:card="summary_large_image"`, `twitter:title`, `twitter:description`, `twitter:image`, `CreativeWork` JSON-LD |
| `/about` | `dist/about/index.html` | Static route (`src/routes/about/`) + `src/data/site.ts` (owner-approved background, values, process, skills) | `<header>`, `<nav>`, `<main id="main-content">`, `<h1>`, `<section>` blocks (Background, Working Approach, Capabilities), `<footer>` | Unique about `<title>`, `<meta name="description">`, `<link rel="canonical" href="https://<domain>/about">`, `og:*`, `twitter:*` |
| `/contact` | `dist/contact/index.html` | Static route (`src/routes/contact/`) + `src/data/site.ts` + `<ContactForm />` initial accessible form markup | `<header>`, `<nav>`, `<main id="main-content">`, `<h1>`, `<section>` containing accessible `<form>` with `<label>` controls, `<footer>` | Unique contact `<title>`, `<meta name="description">`, `<link rel="canonical" href="https://<domain>/contact">`, `og:*`, `twitter:*` |
| `*` (404) | `dist/404.html` | Catch-all route (`src/routes/not-found/`) rendered to `dist/404.html` and matched client-side for unknown paths | `<header>`, `<nav>`, `<main id="main-content">`, `<h1>` (Page Not Found), recovery links to `/` and `/work`, `<footer>` | `<title>Page Not Found | ...</title>`, `<meta name="robots" content="noindex, nofollow">` |

#### Dynamic `/work/:slug` Enumeration, Invalid Slugs, and Deterministic Rebuilds
1. **Build-Time Slug Enumeration:**
   - `src/data/projects.ts` exports a strongly typed ` readonly Project[]` array (`Project` interface in `src/types/project.ts`) and helper functions `getAllProjectSlugs(): string[]` and `getProjectBySlug(slug: string): Project | undefined`.
   - During `npm run build`, the SSG pre-renderer imports `getAllProjectSlugs()` and renders `/work/${slug}` for every published project into `dist/work/${slug}/index.html`.
   - Build validation fails immediately if any project in `src/data/projects.ts` is missing required SEO fields (`seoTitle`, `seoDescription`, `ogImage`, `altText`) or has duplicate slugs.
2. **Invalid Slug / 404 Handling:**
   - When `getProjectBySlug(slug)` returns `undefined` (either on a direct request to an ungenerated `/work/non-existent-slug` path or via client-side navigation), the route renders the branded `<NotFoundPage />` component with `<meta name="robots" content="noindex, nofollow">` and clear links back to `/work` and `/`.
   - At the CDN/hosting layer (Vercel), requests matching static files serve the pre-rendered HTML with `HTTP 200`, while unmatched routes serve `dist/404.html` (with `HTTP 404` status for non-existent static pages or SPA fallback hydration into the 404 route view).
3. **How Adding or Updating Projects Triggers a Rebuild:**
   - Because portfolio content lives in strongly typed source control (`src/data/projects.ts` and `public/og/projects/`), any content update committed and pushed to `main` (or opened as a PR) automatically triggers the GitHub Actions CI workflow (`.github/workflows/ci.yml`) and Vercel's Git integration, running a fresh `npm run build` that deterministically regenerates all static routes, `/work/:slug` case studies, `sitemap.xml`, and `robots.txt`.
   - If optional Supabase-hosted project assets or external webhooks are added later, a Vercel Deploy Hook URL can also trigger on-demand static regeneration without code changes.

---

### 2.4 Strict Client / Server Boundary Enforcement (`AGENTS.md` §1.4, §6, §9)

To guarantee that server-only credentials (such as `SUPABASE_SERVICE_ROLE_KEY` or private administrative helpers) **can never enter the browser bundle**:

1. **Physical Module Separation:**
   - `src/lib/supabase/client.ts`: Imports only `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`. Configured with `persistSession: false` and `autoRefreshToken: false` for anonymous public contact form inserts protected by Postgres RLS.
   - `src/lib/supabase/server.ts`: Dedicated to server-only / build-time / Edge contexts. Reads `process.env.SUPABASE_SERVICE_ROLE_KEY` (notice: **no `VITE_` prefix**, so Vite never exposes it to client code).
2. **Build-Time & Runtime Guardrails:**
   - `src/lib/supabase/server.ts` includes an explicit browser-environment guard (`if (typeof window !== 'undefined') throw new Error('Server-only module imported in browser context')`).
   - Vite configuration and ESLint `no-restricted-imports` rules forbid importing `src/lib/supabase/server` from any file in `src/components/`, `src/routes/`, or `src/entry-client.tsx`.
   - `npm run build` verification inspects compiled client chunks in `dist/assets/*.js` to assert zero occurrences of `SUPABASE_SERVICE_ROLE_KEY` or `service_role`.

---

## 3. Target Repository Architecture & Sprint 1 (`S1-T1`–`S1-T4`) Implementation Plan

### 3.1 Adapted Repository Tree (`AGENTS.md` §6)

Adapted for **React 19 + TypeScript + Vite + React Router v7 (SSG/SSR Prerender Mode)** while preserving existing `.agents/`, `AGENTS.md`, and `README.md`:

```text
GObwocha/
├── .agents/
│   └── skills/
│       └── top-design/              # Preserved design skill & references
├── .github/
│   └── workflows/
│       └── ci.yml                   # Lint, typecheck, format, unit tests, build, e2e, audit
├── docs/
│   ├── DESIGN_DIRECTION.md          # S0-T4 deliverable
│   ├── IMPLEMENTATION_PLAN.md       # S0-T1 / S0-T2 / S0-T3 deliverable (this file)
│   ├── NFR_VALIDATION.md            # S0-T3 deliverable & ongoing NFR evidence log
│   ├── RELEASE_CHECKLIST.md         # Pre-launch gate tracking
│   ├── SECURITY_REVIEW.md           # S5-T3 security verification
│   └── SPRINT_LOG.md                # Chronological task execution log
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   ├── sitemap.xml                  # Generated/verified at build time
│   ├── site.webmanifest
│   ├── og/
│   │   ├── default.png              # 1200x630 default Open Graph image
│   │   └── projects/                # 1200x630 project-specific OG previews
│   └── images/
│       └── placeholders/            # Temporary clearly-marked dev assets (removed before release)
├── scripts/
│   └── prerender.mjs                # Deterministic build-time SSG HTML & sitemap generator
├── src/
│   ├── entry-client.tsx             # Browser hydration entry point
│   ├── entry-server.tsx             # Server/build-time renderToString + head extraction entry
│   ├── vite-env.d.ts                # Strict ImportMetaEnv type declarations
│   ├── app/
│   │   ├── App.tsx                  # Root shell, providers, route outlet
│   │   └── routes.tsx               # Central route configuration (/, /work, /work/:slug, /about, /contact, *)
│   ├── routes/
│   │   ├── home/
│   │   ├── work/
│   │   ├── project-detail/
│   │   ├── about/
│   │   ├── contact/
│   │   └── not-found/
│   ├── components/
│   │   ├── layout/                  # Header, Footer, PageContainer, SkipLink
│   │   ├── navigation/              # DesktopNav, MobileNav
│   │   ├── projects/                # ProjectCard, ProjectGrid, CaseStudySection
│   │   ├── contact/                 # ContactForm, FormFeedback
│   │   ├── motion/                  # Reduced-motion-aware wrappers
│   │   ├── seo/                     # RouteHead / SEO metadata & JSON-LD schema helpers
│   │   └── ui/                      # Accessible reusable primitives (Button, Badge, SectionHeading)
│   ├── data/
│   │   ├── site.ts                  # Owner-approved profile & site metadata (with explicit TODO markers)
│   │   └── projects.ts              # Strongly-typed project case study repository
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts            # Browser-safe anon client
│   │   │   └── server.ts            # Server-only client (blocked from client bundle)
│   │   ├── validation/              # Zod schemas for env, project content, and contact form
│   │   ├── security/                # Safe error sanitizer, honeypot & rate-limit helpers
│   │   └── utils/
│   ├── styles/
│   │   ├── tokens.css               # Design tokens (color, fluid type, spacing, motion, focus)
│   │   ├── globals.css              # Reset, landmarks, reduced-motion & responsive rules
│   │   ├── typography.css           # Editorial type scale & utility classes
│   │   └── motion.css               # GPU-safe transitions & prefers-reduced-motion overrides
│   ├── types/
│   │   ├── project.ts
│   │   ├── contact.ts
│   │   └── seo.ts
│   └── test/
│       ├── setup.ts                 # Vitest + Testing Library + axe setup
│       ├── fixtures/
│       └── helpers/
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   └── YYYYMMDDHHMMSS_create_contact_submissions.sql
│   ├── seed.sql
│   └── tests/
├── tests/
│   ├── e2e/
│   │   ├── navigation.spec.ts
│   │   ├── projects.spec.ts
│   │   ├── contact.spec.ts
│   │   └── responsive-a11y.spec.ts
│   ├── accessibility/
│   └── performance/
├── .env.example
├── .gitignore
├── AGENTS.md
├── README.md
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── playwright.config.ts
├── prettier.config.js
├── tsconfig.json
└── vite.config.ts
```

---

### 3.2 Planned Dependencies & Rationale (`AGENTS.md` §1.4 & §5)

Every dependency has a clear, documented purpose:

#### Production Dependencies (`dependencies`)
| Package | Purpose & Justification |
|---|---|
| `react`, `react-dom` (`^19.0.0`) | Core UI library and server rendering (`react-dom/server` for SSG/SSR pre-rendering and `hydrateRoot` for client hydration). |
| `react-router` (`^7.x`) | Declarative & data routing supporting both browser navigation (`BrowserRouter` / `RouterProvider`) and static server/build-time rendering (`StaticRouter` / static handlers). |
| `@supabase/supabase-js` (`^2.x`) | Official Supabase client for persisting validated contact enquiries to Postgres under RLS (`AGENTS.md` §5, §9). |
| `zod` (`^3.x`) | Runtime schema validation for untrusted contact form inputs, environment variables, and build-time content integrity (`AGENTS.md` §1.4). |

#### Development & Quality Tooling (`devDependencies`)
| Package | Purpose & Justification |
|---|---|
| `typescript` (`^5.7.x`) | Strict static typechecking (`strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`). |
| `vite`, `@vitejs/plugin-react` | Fast dev server, production asset bundler, and SSR/SSG build pipeline. |
| `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event` | Unit, component, and DOM interaction testing (`AGENTS.md` §5). |
| `vitest-axe` / `axe-core`, `@axe-core/playwright` | Automated WCAG 2.1 AA accessibility assertions in both unit/component tests and Playwright E2E tests (`AGENTS.md` §4.2, §5). |
| `@playwright/test` | End-to-end browser verification across desktop/mobile viewports, keyboard navigation, and generated HTML metadata checks (`AGENTS.md` §5). |
| `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y` | Static code quality, React hook safety, semantic/accessibility linting, and server-import boundary enforcement. |
| `prettier` | Deterministic code formatting enforced in CI (`npm run format:check`). |

---

### 3.3 Canonical Validation Command Contract (`AGENTS.md` §8)

All scripts will be wired in `package.json` during `S1-T1` using `npm`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build && vite build --ssr src/entry-server.tsx --outDir dist-ssr && node scripts/prerender.mjs",
    "preview": "vite preview",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

And verified via the canonical `AGENTS.md` §8 sequence:
1. `npm ci`
2. `npm run lint`
3. `npm run typecheck`
4. `npm run format:check`
5. `npm run test`
6. `npm run test:e2e`
7. `npm run build`
8. `npm audit --omit=dev`

---

### 3.4 Sprint 0 & Sprint 1 Step-by-Step Execution Plan

#### Sprint 0 Completion Summary (`S0-T1`–`S0-T4`)
| Task ID | Deliverable | Dependencies | Status | Files Touched | Commit |
|---|---|---|---|---|---|
| **S0-T1** | Audit repository and environment | None | `DONE` | `docs/IMPLEMENTATION_PLAN.md`, `docs/SPRINT_LOG.md`, `AGENTS.md` | `04867c5` |
| **S0-T2** | Confirm rendering architecture | `S0-T1` | `DONE` | `docs/IMPLEMENTATION_PLAN.md` | `9ab0717` |
| **S0-T3** | Extract requirements and content gaps | `S0-T1` | `DONE` | `docs/NFR_VALIDATION.md` | `2bede98` |
| **S0-T4** | Inspect visual reference | `S0-T1` | `DONE` | `docs/DESIGN_DIRECTION.md` | `5451db6` |

#### Sprint 1 Execution Plan (`S1-T1`–`S1-T4`)

1. **`S1-T1` — Scaffold app and quality tooling** (`Dependencies: S0-T2` — **`READY`**)
   - **Outcome:** Runnable React 19 + TypeScript + Vite SSG/SSR application with strict TypeScript, ESLint, Prettier, Vitest, Playwright, and `.github/workflows/ci.yml`.
   - **Files to Create/Update:** `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `eslint.config.js`, `prettier.config.js`, `.gitignore`, `.env.example`, `playwright.config.ts`, `index.html`, `src/entry-client.tsx`, `src/entry-server.tsx`, `scripts/prerender.mjs`, `src/test/setup.ts`, `.github/workflows/ci.yml`.
   - **Validation:** Clean `npm ci`, `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run test`, `npm run build`, and `npm audit --omit=dev` all pass with exit code `0`.

2. **`S1-T2` — Add design tokens and global styles** (`Dependencies: S1-T1, S0-T4`)
   - **Outcome:** Original editorial design token system implementing the direction in `docs/DESIGN_DIRECTION.md` (disciplined color palette with ≥4.5:1 contrast, `clamp()` fluid typography and spacing, 12-column responsive layout grid, high-contrast `:focus-visible` outlines, and `prefers-reduced-motion: reduce` overrides).
   - **Files to Create/Update:** `src/styles/tokens.css`, `src/styles/globals.css`, `src/styles/typography.css`, `src/styles/motion.css`, plus style/responsive verification tests.
   - **Validation:** Zero horizontal overflow across `320px`, `375px`, `768px`, `1024px`, `1440px`, and `2560px`; contrast ratio verification ≥ 4.5:1; reduced-motion media query check.

3. **`S1-T3` — Establish route/layout shell** (`Dependencies: S1-T1`)
   - **Outcome:** Accessible semantic layout shell (`<Header />` with `<SkipLink />`, desktop/mobile `<Navigation />` with `44×44px` touch targets and `aria-current="page"`, `<PageContainer />` with `<main id="main-content">`, `<Footer />`) and route stubs for `/`, `/work`, `/work/:slug`, `/about`, `/contact`, and `*` (404).
   - **Files to Create/Update:** `src/app/App.tsx`, `src/app/routes.tsx`, `src/components/layout/*`, `src/components/navigation/*`, `src/routes/{home,work,project-detail,about,contact,not-found}/*`, and route/navigation unit + E2E tests.
   - **Validation:** All required routes render without console errors; keyboard tab order, Escape-to-close mobile menu, active link states, and 404 fallback pass unit and Playwright tests.

4. **`S1-T4` — Establish SEO foundation** (`Dependencies: S1-T1, S0-T2`)
   - **Outcome:** Strongly-typed SEO metadata architecture (`src/types/seo.ts`, `src/components/seo/RouteHead.tsx`, and build-time head serialization in `src/entry-server.tsx` + `scripts/prerender.mjs`), `public/robots.txt`, `public/site.webmanifest`, and generated `dist/sitemap.xml`.
   - **Files to Create/Update:** `src/types/seo.ts`, `src/components/seo/*`, `src/data/site.ts`, `src/data/projects.ts` (initial typed schema), `src/entry-server.tsx`, `scripts/prerender.mjs`, `public/robots.txt`, `public/site.webmanifest`, and build-output HTML metadata tests.
   - **Validation:** Automated inspection of compiled `dist/**/index.html` files confirms every route has a unique `<title>`, `<meta name="description">`, `<link rel="canonical">`, Open Graph (`1200×630` image tags), Twitter Card (`summary_large_image`), single `<h1>`, and semantic HTML5 landmarks in raw pre-rendered HTML before any client JS executes.

---

### 3.5 Companion Sprint 0 Deliverables (`S0-T3` & `S0-T4`)

- **NFR Matrix & Owner-Input Content Gaps (`S0-T3`):** See [`docs/NFR_VALIDATION.md`](./NFR_VALIDATION.md) for the complete mapping of all 34 non-functional requirements across `AGENTS.md` §4.1–§4.5 (`PERF-01..09`, `A11Y-01..07`, `RESP-01..05`, `SEO-01..05`, `SEC-01..08`) and the 13 owner-input content gaps (`GAP-01..13`) governed by the `TODO: OWNER INPUT REQUIRED` contract.
- **Visual Reference Inspection & Original Design Direction (`S0-T4`):** See [`docs/DESIGN_DIRECTION.md`](./DESIGN_DIRECTION.md) for the empirical analysis of `https://www.product.inc/`, the 4 design pillars (*Architectural Precision*), WCAG 2.1 AA contrast-verified color tokens (`#0A0A09` Warm Obsidian / `#F5F3EE` Archival Stone / `#FF4D1C` International Vermilion), fluid typography (`Syne` + `Plus Jakarta Sans` + `JetBrains Mono`), 60 FPS GPU motion curves, and explicit anti-copy boundaries.

