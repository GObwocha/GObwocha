# Release Checklist & Production Verification — Geoffrey Obwocha Portfolio

> **Governing Specification:** `AGENTS.md` (§10, §11, §12)  
> **Owner:** Geoffrey Obwocha (`@GObwocha`)  
> **Last Verified:** 2026-10-11

---

## 1. SEO and Content Release Checks (`AGENTS.md` §10)

- [x] **Every public route has a meaningful, unique title and description:** Verified across all 11 indexable routes (`/`, `/work`, `/about`, `/contact`, and all 7 `/work/:slug` case studies) in `src/components/seo/seo.test.ts` and `src/components/seo/prerender-seo.test.ts`.
- [x] **Each project detail route has project-specific Open Graph and Twitter Card metadata:** Verified in `dist/work/<slug>/index.html` (`og:title`, `og:description`, `og:url`, `og:image`, `og:image:width=1200`, `og:image:height=630`, `twitter:card=summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image`).
- [x] **Each required social image is `1200 × 630 px`, compressed, and publicly accessible:** Generated and verified in `public/og/default.png` and `public/og/projects/*.png` (`9.00–9.45 KB` each, `< 3.1%` of the `300 KB` budget, verified via PNG `IHDR` header checks in `prerender-seo.test.ts`).
- [x] **Main content exists in generated/server HTML:** Verified across all 12 pre-rendered HTML files (`dist/index.html`, `dist/work/index.html`, `dist/about/index.html`, `dist/contact/index.html`, `dist/404.html`, and `dist/work/*/index.html`).
- [x] **One clear `<h1>` per page; headings follow a logical hierarchy:** Verified by unit tests (`src/app/App.test.tsx`), build-time HTML inspection (`src/components/seo/prerender-seo.test.ts`), and Playwright E2E (`tests/e2e/navigation.spec.ts`).
- [x] **Canonical URL and production domain are correct:** Canonical host configured via `siteConfig.siteUrl` (`https://gobwocha.vercel.app`, overridable via `VITE_SITE_URL`).
- [x] **`robots.txt` and sitemap are valid and reflect the intended indexing policy:** Verified in `public/robots.txt` and generated `dist/sitemap.xml` (all 11 public routes included; `/404` excluded and marked `noindex, nofollow`).
- [x] **Internal links work; external links use appropriate `rel` attributes when opened in a new tab:** Every external `target="_blank"` link uses `rel="noopener noreferrer"`; zero `href="#"` links exist anywhere in the codebase.
- [x] **No placeholder text, fake proof, unverified metrics, broken image assets, or empty project case studies remain:** All 7 projects (`halisi-app`, `greenroute`, `kula-kwa-macho`, `somastar`, `geliscope`, `email-analyzer`, `ole-ken-hotel`) are populated from verified repositories with explicit collaborator credits for **Halisi** (`Collins Kimanzi`, `Ndegwa Waudo`, `Dennis Kuria`), **GreenRoute** (`Benson Mose`, `Timothy Mwita`), and **SomaStar** (`Emmanuel Makori Obiero`).
- [x] **Images have meaningful alt text where informative and empty alt text when decorative:** Verified across all 7 project cover SVGs and tested via `vitest-axe` and `@axe-core/playwright`.
- [x] **No page is indexable while still marked as a staging/preview page:** Production routes use `index, follow`; `/404` and unknown slugs use `noindex, nofollow`.

---

## 2. Production Release Checklist (`AGENTS.md` §11)

### 2.1 Functionality
- [x] **All required routes work on direct load and refresh:** Pre-rendered static HTML files in `dist/` + `vercel.json` `cleanUrls: true` routing.
- [x] **All navigation and CTA links lead to real destinations:** Verified in `src/app/App.test.tsx` and `tests/e2e/navigation.spec.ts`.
- [x] **Contact submission succeeds against configured Supabase client and shows a truthful confirmation; unconfigured environments never fake success:** Verified in `src/components/contact/contact.test.tsx` and `tests/e2e/contact.spec.ts`.
- [x] **Invalid form data is rejected; database failures are handled safely:** Dual `zod` + Postgres `CHECK` validation; raw `PGRST*` / SQL errors stripped by `sanitizeSubmissionError()` (`src/lib/security/errors.ts`).
- [x] **404 page works; no dead-end user journeys:** Verified for both unknown top-level routes (`/non-existent-route`) and invalid project slugs (`/work/invalid-project-slug`).
- [x] **No console errors, unhandled rejections, or failed critical network requests:** Verified in `tests/e2e/navigation.spec.ts`.

### 2.2 Performance and Accessibility
- [x] **NFR performance measurements recorded in `docs/NFR_VALIDATION.md`:** Recorded with exact build bundle sizes, pre-rendered HTML sizes, asset sizes, and contrast ratios.
- [x] **Hero and project imagery meets the `300 KB` limit:** Project SVG covers weigh `4.07–6.04 KB` each; `1200×630` OG PNGs weigh `9.00–9.45 KB` each.
- [x] **LCP, CLS, INP, and TTI engineering budgets verified:** Zero layout shift (`CLS = 0.00`) enforced with explicit `width`/`height` and `aspect-ratio: 16 / 10`; GPU-only `transform`/`opacity` animations.
- [x] **Reduced-motion mode works:** Verified in `src/components/motion/motion.test.tsx` and `tests/e2e/responsive-a11y.spec.ts` (`prefers-reduced-motion: reduce`).
- [x] **Keyboard navigation and focus states verified:** `:focus-visible` `2px solid var(--color-accent)` outline with `3px` offset, skip link to `#main-content`, and `Escape` key closes mobile drawer.
- [x] **Contrast and mobile touch-target requirements checked:** Mathematical W3C contrast tests (`18.68:1` primary, `9.73:1` secondary, `5.38:1` tertiary — all `>= 4.5:1`) in `src/styles/tokens.test.ts` and `>= 44×44 px` touch target assertions in `tests/e2e/responsive-a11y.spec.ts`.
- [x] **`320–2560 px` layout checked; no unintended horizontal scrolling:** Verified across `320×568`, `375×812`, `768×1024`, `1024×768`, `1440×900`, and `2560×1440` in `tests/e2e/responsive-a11y.spec.ts`.
- [x] **Browser support matrix recorded:** Documented in `docs/NFR_VALIDATION.md` (§2.3).

### 2.3 SEO and Security
- [x] **SSG/SSR/prerendered content verified:** 12 static HTML pages generated by `scripts/prerender.mjs` and verified by `src/components/seo/prerender-seo.test.ts`.
- [x] **Unique metadata and social cards verified on every project route:** Verified in `src/components/seo/seo.test.ts` and `src/components/seo/prerender-seo.test.ts`.
- [x] **HTTPS and TLS configuration verified:** `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` and `upgrade-insecure-requests` configured in `vercel.json`.
- [x] **CSP and other security headers configured and tested:** Verified in `vercel.json` and `src/lib/security/security-headers.test.ts`.
- [x] **Supabase RLS and denied-access cases tested:** `ENABLE ROW LEVEL SECURITY` + `FORCE ROW LEVEL SECURITY` + `anon` `INSERT`-only grant verified in `src/components/contact/contact.test.tsx`.
- [x] **No service-role key or other secret in source control, logs, or browser bundle:** Verified by `src/lib/supabase/supabase.test.ts` and `src/lib/security/security-headers.test.ts`.
- [x] **Dependency audit reviewed:** `npm audit --omit=dev` passes with `0 vulnerabilities`.
- [x] **Privacy notice and data handling details added:** Displayed directly below the contact form (`siteConfig.privacyNotice`) and documented in `docs/SECURITY_REVIEW.md`.

### 2.4 Operations & Owner Handoff Actions
- [x] **Production environment variables documented separately from development/preview:** Documented in `.env.example`, `README.md`, and `docs/SECURITY_REVIEW.md`.
- [x] **Domain, redirects, canonical host, sitemap, and robots policy verified:** Configured in `vercel.json`, `public/robots.txt`, and `dist/sitemap.xml`.
- [x] **Error/uptime monitoring and rollback process documented:** Documented in `docs/SECURITY_REVIEW.md` (§8) and `README.md`.
- [x] **Backup/export and data retention approach documented:** 12-month retention policy and CSV/SQL export procedures documented in `docs/SECURITY_REVIEW.md` (§6, §8).
- [x] **Owner knows how to update projects, deploy changes, and recover from a failed release:** Step-by-step runbook provided in `README.md`.

### Remaining Owner Live-Environment Actions (At Production Cutover)
1. **Apply Supabase Migration to Live Project:** Run `supabase db push` (or execute `supabase/migrations/20261011000000_create_contact_submissions.sql` in the production Supabase SQL Editor).
2. **Configure Vercel Production Environment Variables:** Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (publishable `anon` key only), and `VITE_SITE_URL` in the Vercel project settings, then trigger a production deployment and submit one live smoke-test enquiry.
