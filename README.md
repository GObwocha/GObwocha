# Geoffrey Obwocha — Production Portfolio Website

<!--
**GObwocha/GObwocha** is a ✨ _special_ ✨ repository because its `README.md` (this file) appears on your GitHub profile.
-->

Production portfolio website for **Geoffrey Obwocha** (Systems Architect & Full-Stack Product Engineer), built with **React 19**, **TypeScript**, **Vite**, **React Router v7 (SSG/SSR Pre-rendering)**, and **Supabase**.

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Routing & Rendering:** React Router v7 with deterministic build-time SSG pre-rendering (`src/entry-server.tsx` + `scripts/prerender.mjs`)
- **Backend / Persistence:** Supabase (Postgres with Row Level Security)
- **Validation:** Zod
- **Quality & Testing:** ESLint, Prettier, Vitest, React Testing Library, axe-core, Playwright

## Getting Started

1. Copy `.env.example` to `.env.local` and configure local environment variables:
   ```bash
   cp .env.example .env.local
   ```
2. Install dependencies reproducibly using `npm`:
   ```bash
   npm ci
   ```
3. Start the local development server:
   ```bash
   npm run dev
   ```

## Canonical Validation Commands

```bash
# Install reproducibly using npm
npm ci

# Static quality checks
npm run lint
npm run typecheck
npm run format:check

# Automated unit/component and end-to-end tests
npm run test
npm run test:e2e

# Production client + SSR compilation and static route pre-rendering
npm run build

# Production dependency security audit
npm audit --omit=dev
```
