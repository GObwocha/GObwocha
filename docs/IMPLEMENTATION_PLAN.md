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

## 2. Sprint 0 Overview & Next Ready Tasks (`S0-T2`, `S0-T3`, `S0-T4`)

With `S0-T1` complete, tasks `S0-T2`, `S0-T3`, and `S0-T4` have their dependencies satisfied and are now marked **`READY`**. They must be completed before scaffolding (`S1-T1`) and styling (`S1-T2`).

### 2.1 Task Breakdown & Files Likely to Change

| Task ID | Deliverable | Dependencies | Files to Create / Update | Validation & Acceptance Criteria |
|---|---|---|---|---|
| **S0-T2** | Confirm rendering architecture (Framework decision) | `S0-T1` (DONE) | `docs/IMPLEMENTATION_PLAN.md`, `AGENTS.md`, `docs/SPRINT_LOG.md` | Evaluate React + TypeScript + Vite SSG/SSR options (e.g., React Router v7 framework/prerender mode vs. Vite SSG/prerender vs. Next.js) against `AGENTS.md` §4.4 & §5. Verify how `/`, `/work`, `/work/:slug`, `/about`, `/contact`, and `*` (404) produce crawlable build/server HTML and unique per-route `<head>` metadata (title, description, canonical, OG `1200x630`, Twitter Card). Document trade-offs and final choice. |
| **S0-T3** | Extract requirements and content gaps (Implementation plan + owner-input list) | `S0-T1` (DONE) | `docs/IMPLEMENTATION_PLAN.md`, `docs/NFR_VALIDATION.md` (initial matrix), `AGENTS.md`, `docs/SPRINT_LOG.md` | Map every NFR in `AGENTS.md` §4 (Performance: TTI ≤2.5s on 4G, LCP <1.5s, CLS <0.05, INP <100ms, 60fps, AVIF/WebP ≤300KB; Accessibility: WCAG 2.1 AA, ≥4.5:1 contrast, reduced motion, keyboard nav; Responsiveness: 320–2560px, 44×44px touch targets; SEO: SSG/SSR, OG/Twitter; Security: HTTPS/TLS 1.2+, CSP, Supabase RLS, secret isolation) to implementation and verification methods. Enumerate all missing owner-provided content (`TODO: OWNER INPUT REQUIRED`) so zero facts, metrics, or credentials are invented. |
| **S0-T4** | Inspect visual reference (Design direction brief) | `S0-T1` (DONE) | `docs/DESIGN_DIRECTION.md`, `AGENTS.md`, `docs/SPRINT_LOG.md` | Inspect `https://www.product.inc/` (and synthesize with `.agents/skills/top-design/SKILL.md`). Document visual hierarchy, spacing, typography, image treatment, motion language, and mobile adaptation. Explicitly define our original identity, token direction, layout rules, and anti-copy boundaries. |

### 2.2 Sprint 0 Risks & Mitigations

1. **SPA Crawlability Trap (`S0-T2`):** Plain client-side Vite + React SPA renders an empty `<div id="root"></div>` and relies on client hydration for meta tags, failing `AGENTS.md` §4.4.
   - *Mitigation:* Select a React + Vite architecture with deterministic build-time prerendering/SSG or SSR so every static and dynamic route (`/work/:slug`) emits complete HTML and unique `<head>` tags at build/response time.
2. **Unverified Content / Fabricated Proof (`S0-T3`):** Missing owner biography, project metrics, client names, or testimonials could tempt placeholder fabrication.
   - *Mitigation:* Catalog all required owner inputs explicitly with `TODO: OWNER INPUT REQUIRED` markers in typed data files and track them as release blockers until owner-verified.
3. **Derivative Design or Over-Animation (`S0-T4`):** Copying `product.inc` layouts/assets or adding heavy animations that violate LCP (<1.5s), INP (<100ms), or `prefers-reduced-motion`.
   - *Mitigation:* Define strict originality rules in `docs/DESIGN_DIRECTION.md`, constrain motion to GPU-accelerated `transform`/`opacity` with custom easing (`cubic-bezier(0.16, 1, 0.3, 1)`), and design `prefers-reduced-motion` as a first-class static experience.
