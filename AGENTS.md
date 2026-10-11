# AGENTS.md — Production Portfolio Website

> **Mission:** Build, validate, and ship a production-grade personal portfolio that converts visitors into credible client enquiries. Use the visual ambition of [product.inc](https://www.product.inc/) as inspiration—not as a template to copy. Build an original identity, original copy, original layouts, and original motion.
>
> **Agent environment:** Antigravity 2.0, Gemini Flash 3.8  
> **Frontend:** React + TypeScript + Vite  
> **Backend / data:** Supabase (Postgres, Storage, optional Edge Functions)  
> **Deployment target:** Vercel or an equivalent HTTPS-capable production host  
> **Operating rule:** Work in small, verifiable sprints. Do not claim a task is complete until its validation criteria pass and the sprint board is updated.

---

## 1. How the agent must work

### 1.1 Start by inspecting; never blindly overwrite

Before changing files:

1. Inspect the repository tree, `package.json`, lockfile, TypeScript config, Vite config, existing routes, styles, tests, and Git status.
2. Identify the package manager from the lockfile and use it consistently.
3. Read existing project documentation and this file. Preserve working code and conventions unless there is a clear, documented reason to change them.
4. If the repository is empty, scaffold the architecture in §6. If it already has a structure, adapt the plan to it and record any deliberate deviations.
5. Create or update `docs/IMPLEMENTATION_PLAN.md` with the current sprint, files likely to change, dependencies, risks, and validation commands before major implementation.
6. Do not delete, replace, or mass-reformat unrelated code.

### 1.2 Sprint execution protocol

For every task on the sprint board:

1. **Select one task** whose dependencies are complete.
2. **Define the change**: state the expected user-visible or engineering outcome and list files to touch.
3. **Implement the smallest complete slice**. Avoid speculative abstractions and unnecessary dependencies.
4. **Validate** using the task's specific tests plus relevant regression checks.
5. **Inspect the result**: review the diff, browser console, network requests, accessibility, and responsive behavior where applicable.
6. **Fix failures** before proceeding. Do not skip, fake, or weaken tests to obtain a green result.
7. **Update the board**: mark `DONE` only when all acceptance criteria pass. If blocked, mark `BLOCKED`, record the reason, and specify the next action.
8. **Report** a concise summary of changed files, test commands and outcomes, known limitations, and the next ready task.

Do not attempt the whole site in one giant generation. Do not start a task whose dependencies are incomplete unless the dependency itself is being resolved in the same task.

### 1.3 Status vocabulary

- `TODO` — not started
- `READY` — dependencies met; safe to start
- `IN_PROGRESS` — currently being implemented
- `BLOCKED` — cannot proceed; blocker and resolution required
- `DONE` — acceptance criteria and validation passed

Keep the sprint board in this file current. Also keep a detailed execution log in `docs/SPRINT_LOG.md`; do not overwrite earlier entries.

### 1.4 Non-negotiable engineering rules

- TypeScript strict mode; avoid `any`. If unavoidable, isolate it and explain why.
- Use semantic HTML and accessible native controls wherever possible.
- Use reusable components only when reuse or separation of concerns justifies them.
- Keep components focused; separate data access, presentation, and validation.
- Do not commit secrets, `.env` files, service-role keys, access tokens, or private customer data.
- The Supabase **service-role key must never reach the browser**. Use only the anon/publishable key client-side, protected by RLS.
- Validate all untrusted input on both client and server/database boundaries. Client validation is UX, not security.
- Never use placeholder links such as `href="#"`, fake testimonials, fabricated client logos, invented awards, or unverified metrics in production.
- Every visible button/link must do something real and understandable. Remove decorative controls that imply functionality.
- No `console` errors, unhandled promise rejections, broken images, dead routes, or unexplained TypeScript/test failures at release.
- Prefer stable, maintained dependencies. Explain the value of any new dependency before adding it.
- Do not use copied source code, branding, images, copy, or distinctive layouts from the reference site. Use it for broad art direction only.
- Do not invent personal biography, client names, results, credentials, or project outcomes. Keep content in a clearly identified editable data file until confirmed.
- Never expose Supabase database errors, stack traces, or internal implementation details to visitors.

---

## 2. Product goals and visitor journeys

### Primary outcome

Help potential customers quickly understand who the portfolio owner is, what problems they solve, the quality of their work, and how to start a conversation.

### Primary visitor journeys

1. **First impression:** visitor lands on the home page, understands the value proposition, and finds a clear contact action.
2. **Evaluate work:** visitor scans featured projects, opens a case study, and understands the problem, role, process, technologies, and verifiable outcome.
3. **Build trust:** visitor reviews skills, background, process, and only genuine testimonials or credentials.
4. **Enquire:** visitor completes the contact form or follows a direct contact link and receives clear feedback.
5. **Owner maintenance:** portfolio owner can update project content and assets without unsafe code changes. Build an admin CMS only if it is explicitly required; do not silently expand scope.

### Required public pages

- `/` — Home / introduction / featured work / capabilities / contact CTA
- `/work` — project index with useful project summaries
- `/work/:slug` — project case study with unique metadata
- `/about` — background, values, working approach, relevant skills
- `/contact` — contact form and alternative contact channels
- `*` — branded, useful 404 page

If a page is unnecessary for the owner's confirmed content, document the decision rather than generating filler.

### Conversion requirements

- Clear primary CTA above the fold.
- Contact CTA repeated at sensible points without becoming spammy.
- Project cards show what was built and why it matters—not just technology badges.
- Contact form explains what information is needed and what happens after submission.
- Provide a visible success state and actionable error state.
- Never imply a form message was sent unless Supabase confirms successful insertion.

---

## 3. Design direction: inspired by product.inc, not copied

First open and inspect `https://www.product.inc/` in the available browser/research workflow. Record observations in `docs/DESIGN_DIRECTION.md` before implementing visual details. If the site cannot be inspected, note that limitation and proceed using the direction below.

### Art direction

Aim for a distinctive, editorial, premium digital-product feel:

- Bold typography with deliberate scale contrast and concise copy.
- Strong composition, intentional negative space, and a clear visual hierarchy.
- A small, disciplined color system; do not add gradients, glow, glassmorphism, and random accent colors by default.
- Large, well-art-directed project imagery and layouts that make the work the hero.
- Subtle, purposeful transitions and micro-interactions that reinforce navigation or hierarchy.
- A clear visual rhythm between hero, work, capabilities, proof, and contact.
- Use a restrained motion language. Animation must never obstruct reading, interaction, or page performance.
- Create a responsive identity, not a desktop layout squeezed onto mobile.

### Design rules

- Build an original design token system in `src/styles/tokens.css`.
- Use fluid typography and spacing with `clamp()` where appropriate.
- Use a consistent content width, grid, spacing scale, border treatment, and interaction states.
- Define hover, focus-visible, active, disabled, loading, error, and success states.
- Ensure project images are real assets, owner-provided work, licensed assets, or clearly marked temporary placeholders removed before launch.
- Use `prefers-reduced-motion` as a first-class design mode.
- Avoid cursor hijacking, scroll hijacking, auto-playing audio, mandatory pre-loaders, and motion that blocks the user.
- If a custom cursor is added, retain normal cursor behavior on touch devices and provide full keyboard access.
- Do not add WebGL/3D solely for spectacle. It must have a clear design purpose, pass performance checks, and degrade gracefully.

### Content model

Create a typed content source (e.g. `src/data/projects.ts`) with fields such as:

- `slug`, `title`, `summary`, `problem`, `role`, `process`, `solution`, `outcomes`
- `technologies`, `coverImage`, `gallery`, `altText`
- `liveUrl`, `repositoryUrl` (optional and verified)
- `publishedAt`, `featured`, `seoTitle`, `seoDescription`, `ogImage`

Do not invent missing facts. Use explicit `TODO: OWNER INPUT REQUIRED` markers during development and make the release checklist fail if visible placeholders remain.

---

## 4. Non-functional requirements — release gates

The requirements below are sourced from the attached **My Websites' NFRs** document. Treat these as target requirements, not as claims that the current hosting provider guarantees them. Record measured results and any constraints in `docs/NFR_VALIDATION.md`.

### 4.1 Performance and rendering

- Time to Interactive (TTI): fully interactive within **2.5 seconds on a 4G connection**.
- Largest Contentful Paint (LCP): **under 1.5 seconds**.
- Cumulative Layout Shift (CLS): **under 0.05**.
- Interaction to Next Paint (INP): **under 100 ms**.
- Animation frame rate: target consistent **60 FPS** on mid-tier hardware.
- Images served in **AVIF/WebP**, with each hero image payload **≤ 300 KB**.
- 3D models, if used: Draco-compressed GLTF/GLB and **≤ 2 MB per scene**.
- Lazy-load off-screen media and non-critical JavaScript.
- The source document calls for a custom initial loader if the initial asset payload exceeds 1 MB. Prefer reducing the initial payload first; only add a loader if necessary, and never use it to conceal slow loading. Any loader must be accessible, brief, and skippable where appropriate.

**Implementation notes:** Use Lighthouse/PageSpeed or equivalent lab checks, then measure field data after launch when available. Do not treat a single Lighthouse run as proof of real-user performance. Set image dimensions/aspect ratios to avoid layout shift. Code-split non-critical routes and expensive features.

### 4.2 Accessibility and inclusion

- Target **WCAG 2.1 AA**.
- Respect `prefers-reduced-motion`; replace parallax, WebGL, and continuous motion with static layouts or simple transitions when requested.
- All interactive controls must be keyboard navigable with visible custom `:focus-visible` states.
- Text and interactive icon contrast must be at least **4.5:1** against the background, per the supplied document.
- Custom UI must provide semantic HTML fallbacks and appropriate accessible names/ARIA. Hide decorative visuals from assistive technology.
- Do not use color alone to communicate meaning.
- Forms need persistent labels, useful error messages, and programmatic error associations.

**Validation:** run automated axe checks, keyboard-only walkthroughs, reduced-motion checks, contrast checks, and a screen-reader smoke test. Automated checks do not prove full WCAG conformance.

### 4.3 Responsiveness and device support

- Support viewport widths from **320 px to 2560 px** without broken layout or horizontal overflow.
- Use fluid layout, typography, and spacing.
- Interactive mobile targets: at least **44 × 44 px**, with at least **8 px** spacing between targets.
- Support the latest two versions of Chrome, Safari, Firefox, and Edge.
- If WebGL/hardware acceleration is unavailable or a capability check fails, use a DOM-based fallback rather than a broken canvas.

**Validation:** test at 320, 375/390, 768, 1024, 1440, and 2560 px; test current available browser engines and document any unavailable device/browser test.

### 4.4 SEO and social discoverability

- Use **SSG or SSR** so crawlers can access meaningful page content without relying on client-side JavaScript.
- Every project page needs a unique title, meta description, and Open Graph metadata.
- Every URL should have a specific, optimized social preview where relevant, with OG images at **1200 × 630 px**. The source document also asks for Twitter Card metadata; implement current `twitter:card` metadata (`summary_large_image`) plus title, description, and image.
- Use semantic HTML5 landmarks and content elements (`nav`, `main`, `article`, `section`, `footer`).

**Architecture note:** Vite + React SPA alone does not satisfy the SSG/SSR requirement. Use a React framework that supports static generation/SSR (recommended: **React Router framework mode or Next.js**), or choose and document a verified prerendering solution before building pages. Since the requested stack is React + Supabase, the framework choice remains React-compatible. Do not mark SEO complete merely because meta tags are set after client hydration.

### 4.5 Security and reliability

- Enforce HTTPS with **TLS 1.2 or higher** at the hosting edge.
- Implement a restrictive **Content Security Policy (CSP)** allowing only required external domains, including any font or analytics providers actually used.
- Hosting target: **99.9% uptime**. Verify the selected provider's plan/SLA and monitoring; do not claim an uptime guarantee without evidence.
- Supabase Row Level Security (RLS) must be enabled for every table exposed through the API.
- Keep secrets server-side; never ship service-role credentials to the client.
- Add input validation, basic anti-spam/rate-limiting strategy, safe error handling, and dependency auditing.
- Minimize collected personal data and define retention/cleanup expectations for enquiries.

**Validation:** inspect deployed response headers, CSP reports/console, HTTPS configuration, Supabase policies, public API exposure, dependency audit output, and production error behavior.

---

## 5. Recommended implementation choices

Use these defaults unless the repository already has a sound equivalent:

- React + TypeScript, with a React-compatible framework that supports SSG/SSR.
- Supabase Postgres for contact enquiries and any content that genuinely needs persistence.
- Supabase Storage for owner-controlled project images only if it provides a real benefit; optimize images before upload.
- A small animation library only if native CSS cannot reasonably deliver the interaction. Keep reduced-motion support explicit.
- Unit/component tests with Vitest and React Testing Library (or the framework's equivalent).
- End-to-end tests with Playwright.
- Accessibility checks with axe-core integration.
- ESLint + Prettier, strict TypeScript, and a production build in CI.
- Lighthouse CI or repeatable Lighthouse reports for performance budgets.
- Vercel or comparable hosting with HTTPS, preview deployments, environment separation, and rollback support.

**Decision gate:** Before scaffolding, decide the React framework because SSR/SSG is a hard requirement. Record the choice and rationale in `docs/IMPLEMENTATION_PLAN.md`. Do not use a plain SPA without an approved SEO-compatible rendering strategy.

---

## 6. Target project architecture

Adapt this tree to the chosen framework. Do not force a directory structure that conflicts with its conventions.

```text
portfolio/
├── AGENTS.md
├── README.md
├── package.json
├── lockfile
├── tsconfig.json
├── eslint.config.js
├── prettier.config.js
├── .gitignore
├── .env.example
├── .env.local                 # local only; never commit
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   ├── site.webmanifest
│   ├── og/
│   │   ├── default.png
│   │   └── projects/          # project-specific 1200x630 previews
│   └── images/
│       └── placeholders/      # temporary only; remove before release
├── docs/
│   ├── DESIGN_DIRECTION.md
│   ├── IMPLEMENTATION_PLAN.md
│   ├── SPRINT_LOG.md
│   ├── NFR_VALIDATION.md
│   ├── SECURITY_REVIEW.md
│   └── RELEASE_CHECKLIST.md
├── src/
│   ├── app/                   # root layout, providers, route configuration
│   ├── routes/
│   │   ├── home/
│   │   ├── work/
│   │   ├── project-detail/
│   │   ├── about/
│   │   ├── contact/
│   │   └── not-found/
│   ├── components/
│   │   ├── layout/            # Header, Footer, PageContainer
│   │   ├── navigation/        # desktop/mobile navigation
│   │   ├── projects/          # ProjectCard, ProjectGrid, CaseStudySection
│   │   ├── contact/           # ContactForm, form feedback
│   │   ├── motion/            # reduced-motion-aware motion wrappers
│   │   ├── seo/               # metadata helpers/schema
│   │   └── ui/                # small reusable primitives
│   ├── data/
│   │   ├── site.ts            # owner-approved profile and site metadata
│   │   └── projects.ts        # typed project content
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts      # browser-safe anon/publishable client
│   │   │   └── server.ts      # server-only client if needed
│   │   ├── validation/        # shared schemas and input validation
│   │   ├── security/          # safe error handling, anti-spam helpers
│   │   └── utils/
│   ├── styles/
│   │   ├── tokens.css
│   │   ├── globals.css
│   │   ├── typography.css
│   │   └── motion.css
│   ├── types/
│   │   ├── project.ts
│   │   └── contact.ts
│   └── test/
│       ├── setup.ts
│       ├── fixtures/
│       └── helpers/
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   └── YYYYMMDDHHMMSS_create_contact_submissions.sql
│   ├── seed.sql               # fake development data only
│   └── tests/                  # database/RLS tests where supported
├── tests/
│   ├── e2e/
│   │   ├── navigation.spec.ts
│   │   ├── projects.spec.ts
│   │   ├── contact.spec.ts
│   │   └── responsive-a11y.spec.ts
│   ├── accessibility/
│   └── performance/
└── .github/
    └── workflows/
        └── ci.yml
```

### Architecture rules

- Keep portfolio content static and strongly typed unless the owner specifically needs database-driven editing.
- Keep contact submissions in Supabase; never expose other visitors' submissions publicly.
- A project detail route must return meaningful HTML and unique metadata at build/response time.
- If using static generation, ensure project content is available at build time and define how new projects trigger a rebuild.
- Server-only code must be impossible to import into browser bundles.
- Use migrations for schema changes; do not rely on undocumented manual dashboard edits.
- Store only the data needed to respond to an enquiry (for example name, email, project type, message, created timestamp, and status if an admin workflow exists).

---

## 7. Sprint board

**Board policy:** The board is the source of truth. Work top-to-bottom unless a task is explicitly marked parallelizable. Keep each task independently testable. Record the actual validation result and commit/PR reference in `docs/SPRINT_LOG.md`.

| ID | Sprint / task | Deliverable | Dependencies | Status | Definition of done and validation |
|---|---|---|---|---|---|
| S0-T1 | Audit repository and environment | Baseline report | None | DONE | Inspect tree, scripts, package manager, Git status, existing tests. Run existing lint/typecheck/tests/build if available. Record baseline failures without hiding them. |
| S0-T2 | Confirm rendering architecture | Framework decision | S0-T1 | DONE | Select React-compatible SSG/SSR solution. Verify project routes can produce crawlable HTML and unique metadata. Document trade-offs. |
| S0-T3 | Extract requirements and content gaps | Implementation plan + owner-input list | S0-T1 | DONE | Map every NFR to an implementation and validation method. Identify missing biography, projects, images, contact channels, and claims. No invented content. |
| S0-T4 | Inspect visual reference | Design direction brief | S0-T1 | DONE | Inspect product.inc where accessible; document hierarchy, spacing, typography, image treatment, motion, and mobile behavior. Explicitly define original design decisions and what not to copy. |
| S1-T1 | Scaffold app and quality tooling | Runnable app, scripts, CI baseline | S0-T2 | DONE | Install dependencies; configure strict TS, lint, formatting, tests, production build. Verify clean install and all baseline scripts pass. |
| S1-T2 | Add design tokens and global styles | Tokenized responsive foundation | S1-T1, S0-T4 | READY | Define colors, type scale, spacing, grids, focus states, breakpoints, and reduced-motion tokens. Test at 320/1440/2560 px; no overflow; contrast audit. |
| S1-T3 | Establish route/layout shell | Header, footer, page container, routes | S1-T1 | READY | All required routes render, navigation works by keyboard and touch, active/current states are meaningful, 404 route works. Add route tests. |
| S1-T4 | Establish SEO foundation | Metadata and semantic layout helpers | S1-T1, S0-T2 | READY | Validate server/build HTML for title, description, canonical URL, OG/Twitter tags, semantic landmarks, and crawlable content. |
| S2-T1 | Build home hero and CTA | Responsive hero section | S1-T2, S1-T3 | TODO | Hero communicates role/value proposition without fabricated claims. CTA navigates to real contact route. Test keyboard, reduced motion, mobile layout, and image loading. |
| S2-T2 | Build project card and grid system | Project listing components | S1-T2, S1-T3 | TODO | Cards have descriptive links, meaningful alt text, consistent aspect ratios, keyboard focus, and no layout shift. Unit and responsive tests pass. |
| S2-T3 | Add typed project content | Approved project data | S2-T2 | TODO | Type-check every project. No broken URLs, fake metrics, missing required fields, or production placeholders. Empty-state behavior is tested. |
| S2-T4 | Build project detail/case study | Dynamic/static project route | S1-T4, S2-T3 | TODO | Valid slug renders complete case study and unique SEO/social metadata in generated/server HTML. Invalid slug returns useful 404. E2E test covers direct deep link. |
| S2-T5 | Build About and capabilities sections | About page/sections | S1-T2, S1-T3 | TODO | Uses owner-approved information only. Responsive and semantic tests pass; no invented qualifications. |
| S3-T1 | Create Supabase project configuration | Safe environment setup | S1-T1 | READY | Add `.env.example`, typed environment validation, browser-safe client, server-only separation. Confirm no secrets in Git or client bundle. |
| S3-T2 | Create contact table migration and RLS | Versioned schema + policies | S3-T1 | TODO | Migration applies cleanly. RLS enabled. Anonymous users can submit only allowed fields through intended path; public users cannot read, update, or delete submissions. Test policy behavior. |
| S3-T3 | Implement contact validation and submission | Contact form with real persistence | S3-T2, S1-T3 | TODO | Required fields and length limits validated client/server-side; safe errors; loading, success, failure, and duplicate-submit states work. Test valid/invalid submissions and DB result. |
| S3-T4 | Add spam/abuse controls | Proportionate anti-spam protection | S3-T3 | TODO | Add honeypot and/or CAPTCHA/rate limiting appropriate to deployment. Test rejection path; ensure no sensitive data in logs. Document limitations. |
| S4-T1 | Optimize imagery and fonts | Optimized assets | S2-T1, S2-T2 | TODO | Hero images AVIF/WebP and ≤300 KB each; image dimensions reserved; fonts subset/preloaded only if critical; off-screen assets lazy-loaded. Verify payloads in Network panel. |
| S4-T2 | Implement motion and micro-interactions | Motion layer | S1-T2, S2-T1, S2-T2 | TODO | Motion is purposeful, non-blocking, reduced-motion compliant, and keyboard-safe. Test with reduced motion enabled; profile animations on mid-tier hardware. |
| S4-T3 | Responsive and browser QA | Device/browser test report | S2-T1–T5 | TODO | Test 320, 375/390, 768, 1024, 1440, 2560 px and latest two available versions of Chrome/Safari/Firefox/Edge. Record unavailable tests and fixes. |
| S4-T4 | Accessibility audit | Accessibility report | S1-T3, S2-T1–T5, S3-T3 | TODO | Automated axe checks, keyboard-only test, contrast verification, focus visibility, labels/errors, screen-reader smoke test, reduced-motion test. Resolve critical/serious findings. |
| S5-T1 | Performance profiling and budgets | Lighthouse/performance report | S4-T1, S4-T2 | TODO | Measure LCP <1.5s, CLS <0.05, INP <100ms where measurable, TTI ≤2.5s on defined 4G profile, and animation target ~60 FPS. Record device, throttling, run count, and failures. |
| S5-T2 | SEO, social cards, crawlability | Per-route SEO validation | S1-T4, S2-T4 | TODO | Validate generated HTML, unique project metadata, 1200×630 OG images, Twitter Card tags, canonical URLs, robots.txt, sitemap, and structured data where appropriate. |
| S5-T3 | Security review | Security checklist and fixes | S3-T1–T4 | TODO | Verify HTTPS/TLS, CSP, security headers, RLS, secret isolation, input validation, dependency audit, safe errors, and public API permissions. Document exceptions. |
| S5-T4 | Production observability and recovery | Monitoring + rollback plan | S5-T3 | TODO | Configure uptime/error monitoring appropriate to budget, production alerts, backup/export approach, deployment rollback, and owner handoff. Verify provider SLA before any 99.9% claim. |
| S6-T1 | End-to-end and regression suite | CI-ready tests | S2-T4, S3-T3, S4-T4 | TODO | Playwright covers navigation, project deep links, contact success/failure, 404, keyboard flow, and mobile menu. Run reliably in CI without production secrets. |
| S6-T2 | Production preview and acceptance | Preview deployment | S5-T1–T4, S6-T1 | TODO | Deploy preview with production-like environment. Test form against safe test data, inspect headers, logs, links, responsive behavior, and all release checklist items. |
| S6-T3 | Launch and verify | Production release | S6-T2 | TODO | Configure domain/HTTPS, verify redirects, sitemap/robots, analytics only if approved, real contact submission, error monitoring, and post-launch smoke test. |
| S6-T4 | Handover and documentation | README + maintenance guide | S6-T3 | TODO | Document local setup, env vars, migrations, content updates, deployment, rollback, backups, known limitations, and owner actions. No unresolved release blockers. |

### Task completion template

Append one entry per task to `docs/SPRINT_LOG.md`:

```md
## YYYY-MM-DD — Sx-Ty: Task title
- Status: DONE | BLOCKED
- Summary:
- Files changed:
- Validation commands:
- Results: PASS/FAIL, include relevant output/metrics
- Manual checks:
- Known limitations / follow-up:
- Commit or PR:
- Next ready task:
```

### Sprint exit criteria

A sprint is not complete because the UI looks finished. Every task must have passing checks, reviewed changes, and a board update. Any skipped test must be recorded with a reason and risk assessment. Never label the whole project production-ready while a release gate is failing.

---

## 8. Validation command contract

Adapt command names to the selected framework and package manager, then document the canonical commands in `README.md`. The agent must run the equivalent of all applicable checks before marking work complete.

Typical scripts:

```bash
# Install reproducibly using the repository's package manager
npm ci

# Static quality
npm run lint
npm run typecheck
npm run format:check

# Automated tests
npm run test
npm run test:e2e

# Production compilation
npm run build

# Dependency security review
npm audit --omit=dev
```

If a script does not exist, add it or document the appropriate equivalent. Do not report a command as passed if it was not run. Do not hide failures with `|| true`, blanket lint disables, or weakened assertions.

### Minimum validation by change type

- **UI/component:** component test, keyboard test, responsive smoke test, console check.
- **Routing/SEO:** direct deep-link test and generated/server HTML inspection.
- **Supabase/schema:** migration test, RLS authorization tests, invalid-input tests, secret-leak check.
- **Animation/media:** reduced-motion test, payload measurement, layout-shift check, frame profiling if animated.
- **Security/configuration:** inspect production bundle and response headers; verify secrets and permissions.
- **Release:** all automated checks, manual acceptance, production-like environment test, rollback path confirmed.

---

## 9. Supabase data and security baseline

### Contact submissions

Start with the minimum schema needed, for example:

- `id` — UUID primary key
- `name` — bounded text, required
- `email` — bounded text, required
- `project_type` — optional bounded text or constrained enum
- `message` — bounded text, required
- `created_at` — timestamp with time zone, default `now()`
- `status` — only if an authenticated owner workflow is implemented

Do not store sensitive personal information that is not needed to respond.

### Access-control expectations

- Enable RLS on exposed tables.
- Anonymous visitors may insert only permitted contact fields through the intended submission flow.
- Anonymous visitors must not select, update, or delete enquiries.
- Restrict status changes and administrative access to a verified owner identity with least privilege.
- Never rely on hiding an admin route as authorization.
- Keep service-role operations in server-only contexts, never in React client code.
- Add database constraints for required fields and reasonable lengths.
- Use migrations for all schema/policy changes and test both allowed and denied operations.

If direct anonymous inserts create unacceptable abuse risk, use a server-side/Edge Function submission endpoint with validation and rate limiting. Do not invent an unavailable rate-limit feature; implement and verify the chosen mechanism.

---

## 10. SEO and content release checks

- [ ] Every public route has a meaningful, unique title and description.
- [ ] Each project detail route has project-specific Open Graph and Twitter Card metadata.
- [ ] Each required social image is 1200 × 630 px, compressed, and publicly accessible.
- [ ] Main content exists in generated/server HTML.
- [ ] One clear H1 per page; headings follow a logical hierarchy.
- [ ] Canonical URL and production domain are correct.
- [ ] `robots.txt` and sitemap are valid and reflect the intended indexing policy.
- [ ] Internal links work; external links use appropriate `rel` attributes when opened in a new tab.
- [ ] No placeholder text, fake proof, unverified metrics, broken image assets, or empty project case studies remain.
- [ ] Images have meaningful alt text where informative and empty alt text when decorative.
- [ ] No page is indexable while still marked as a staging/preview page.

---

## 11. Production release checklist

Do not launch until each applicable item is checked or explicitly documented as an accepted limitation.

### Functionality
- [ ] All required routes work on direct load and refresh.
- [ ] All navigation and CTA links lead to real destinations.
- [ ] Contact submission succeeds against production Supabase and shows a truthful confirmation.
- [ ] Invalid form data is rejected; database failures are handled safely.
- [ ] 404 page works; no dead-end user journeys.
- [ ] No console errors, unhandled rejections, or failed critical network requests.

### Performance and accessibility
- [ ] NFR performance measurements recorded in `docs/NFR_VALIDATION.md`.
- [ ] Hero imagery meets the 300 KB limit and uses AVIF/WebP.
- [ ] LCP, CLS, INP, and TTI measurements meet the stated targets or have documented evidence-based remediation plans.
- [ ] Reduced-motion mode works.
- [ ] Keyboard navigation and focus states verified.
- [ ] Contrast and mobile touch-target requirements checked.
- [ ] 320–2560 px layout checked; no unintended horizontal scrolling.
- [ ] Browser support matrix recorded.

### SEO and security
- [ ] SSG/SSR/prerendered content verified.
- [ ] Unique metadata and social cards verified on every project route.
- [ ] HTTPS and TLS configuration verified.
- [ ] CSP and other security headers inspected on the deployed site.
- [ ] Supabase RLS and denied-access cases tested.
- [ ] No service-role key or other secret in source control, logs, or browser bundle.
- [ ] Dependency audit reviewed; high/critical unresolved issues addressed or documented.
- [ ] Privacy notice and data handling details added if required for the contact form and applicable law.

### Operations
- [ ] Production environment variables configured separately from development/preview.
- [ ] Domain, redirects, canonical host, sitemap, and robots policy verified.
- [ ] Error/uptime monitoring and rollback process documented.
- [ ] Backup/export and data retention approach documented.
- [ ] Owner knows how to update projects, deploy changes, and recover from a failed release.
- [ ] Final production smoke test completed after deployment.

---

## 12. Definition of production-ready

The portfolio is production-ready only when:

1. Core visitor journeys work end-to-end on the production deployment.
2. All required content is accurate and approved by the owner.
3. No critical or high-severity accessibility, security, or functional defects remain.
4. The NFR report contains measured evidence, not unsupported assertions.
5. SEO metadata is present in crawlable HTML and project-specific social previews work.
6. Supabase policies have been tested for both allowed and denied access.
7. Production monitoring, deployment recovery, and owner documentation exist.
8. All sprint tasks are `DONE` or any exception is explicitly approved, risk-assessed, and documented.

**Final agent response format:** summarize the implementation, list files changed, show the exact validation commands and real results, identify remaining owner-input items or risks, and name the next task. Never claim production readiness solely because a build succeeds.
