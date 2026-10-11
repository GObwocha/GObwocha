# Security Review, Observability & Production Recovery (`S5-T3`, `S5-T4`)

> **Governance:** `AGENTS.md` §1.4, §4.5, §7 (`S3-T1`–`S3-T4`, `S5-T3`, `S5-T4`), §9  
> **Scope:** Edge transport security, Content Security Policy (CSP), Supabase Row Level Security (RLS), secret isolation, dual-boundary input validation, error sanitization, data minimization/retention, dependency audit, SLA verification, production observability, and incident rollback procedures.

---

## 1. Executive Security Summary & Threat Model

The Geoffrey Obwocha (`GObwocha`) production portfolio is a pre-rendered static React + TypeScript application backed by a single write-only Supabase Postgres table (`public.contact_submissions`) for visitor project enquiries.

### Threat Model & Primary Attack Surfaces

| Surface | Threat / Risk | Defense-in-Depth Control | Status |
| --- | --- | --- | --- |
| **Browser / Edge Delivery** | Cross-Site Scripting (XSS), clickjacking, MIME sniffing, protocol downgrade | Strict `Content-Security-Policy` (`script-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`), HSTS preload, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` in `vercel.json` | Verified (`S5-T3`) |
| **Supabase PostgREST API** | Unauthorized reading, modification, or deletion of visitor enquiries via the public `anon` key | `ENABLE ROW LEVEL SECURITY` + `FORCE ROW LEVEL SECURITY`, `REVOKE ALL`, column-scoped `GRANT INSERT (name, email, project_type, message)` only, zero `SELECT`/`UPDATE`/`DELETE` policies for `anon`/`authenticated` | Verified (`S3-T2`) |
| **Client JavaScript Bundle** | Accidental leakage of `SUPABASE_SERVICE_ROLE_KEY` or `sb_secret_` tokens into `dist/assets/*.js` | Runtime browser execution guard in `src/lib/supabase/server.ts`, JWT payload & prefix guard (`assertNotServiceRoleKey`) in `src/lib/supabase/env.ts`, automated bundle scan in `src/lib/security/security-headers.test.ts` | Verified (`S3-T1`, `S5-T3`) |
| **Contact Enquiry Endpoint** | Malformed payloads, SQL/HTML injection, automated bot spam, database error reconnaissance | Dual validation (`zod` client schema + Postgres `CHECK` constraints), honeypot + 1,500 ms interaction floor + 15 s cooldown + 5 min duplicate payload suppression + 3-per-10-min rolling window cap, and `sanitizeSubmissionError` stripping all SQL/PostgREST details | Verified (`S3-T3`, `S3-T4`) |
| **Visitor Privacy** | Excessive PII collection, third-party tracking cookies, indefinite data retention | Data minimization (4 enquiry fields only, zero third-party analytics/cookies, `persistSession: false`), documented 12-month retention limit and SQL purge schedule | Verified (`SEC-08`) |

---

## 2. Transport Security & Edge Headers (`SEC-01`, `SEC-02`)

### 2.1 HTTPS & TLS 1.2/1.3 Enforcement (`SEC-01`)

- **Edge Termination:** Vercel enforces HTTPS across all production and preview deployments, automatically redirecting `http://` requests to `https://` (`308 Permanent Redirect`) and terminating TLS using **TLS 1.2 and TLS 1.3** ciphers at the edge CDN.
- **HTTP Strict Transport Security (HSTS):** Configured on `/(.*)` in `vercel.json`:
  ```text
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  ```
  This instructs browsers to connect exclusively over HTTPS for 2 years (`63,072,000` seconds) across all subdomains and satisfies HSTS preload list requirements.

### 2.2 Content Security Policy (`SEC-02`) — Directive-by-Directive Justification

Configured in `vercel.json` for all routes (`/(.*)`):

```text
default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://*.supabase.co; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests
```

| Directive | Value | Security Rationale |
| --- | --- | --- |
| `default-src` | `'self'` | Deny-by-default fallback restricting all unconfigured resource types strictly to the application's origin. |
| `script-src` | `'self'` | **Blocks all inline executable scripts (`'unsafe-inline'`), `eval()` (`'unsafe-eval'`), and third-party script origins.** Only Vite-built first-party JS bundles (`/assets/*.js`) can execute. Note: `<script type="application/ld+json">` structured data tags emitted during SSG prerendering are non-executable data blocks and are permitted by browsers under `script-src 'self'` per W3C CSP Level 3. |
| `style-src` | `'self' 'unsafe-inline'` | **Documented architectural exception:** React components across the layout shell and routes use deterministic JSX `style={{ ... }}` props for CSS custom-property grid composition (`gap`, `padding`, `maxWidth`). Allowing `'unsafe-inline'` on `style-src` supports React inline style attributes while `script-src 'self'` remains strictly locked down against XSS execution. |
| `img-src` | `'self' data: blob:` | Permits self-hosted SVG/WebP/AVIF/PNG project media and local `data:`/`blob:` URIs without allowing external tracking pixels. |
| `font-src` | `'self'` | All typography is self-hosted or resolved from the system font stack; zero third-party font CDNs (`fonts.googleapis.com` / `fonts.gstatic.com`) are contacted. |
| `connect-src` | `'self' https://*.supabase.co` | Restricts `fetch`/`XHR` network calls exclusively to same-origin assets and the configured Supabase project HTTPS endpoint (`https://*.supabase.co`). |
| `object-src` | `'none'` | Completely disables legacy plugin execution (`<object>`, `<embed>`, `<applet>`). |
| `base-uri` | `'self'` | Prevents `<base>` tag injection attacks that attempt to hijack relative URL resolution. |
| `form-action` | `'self'` | Prevents form target hijacking to external domains. |
| `frame-ancestors` | `'none'` | Prevents any external site from embedding the portfolio in an `<iframe>` or `<frame>` (clickjacking defense). |
| `upgrade-insecure-requests` | *(flag)* | Instructs user agents to automatically upgrade any accidental `http://` subresource request to `https://`. |

### 2.3 Companion Edge Security & Caching Headers

- `X-Content-Type-Options: nosniff` — Prevents browsers from MIME-sniffing responses away from declared `Content-Type`.
- `X-Frame-Options: DENY` — Legacy browser fallback reinforcing `frame-ancestors 'none'`.
- `Referrer-Policy: strict-origin-when-cross-origin` — Sends full path referrer on same-origin navigation but strips path/query details when navigating cross-origin (e.g., to GitHub repositories).
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()` — Explicitly disables sensitive browser hardware and payment APIs not used by the portfolio.
- `Cache-Control: public, max-age=31536000, immutable` on `/assets/(.*)` — Safely caches content-hashed Vite bundles for 1 year while keeping HTML entrypoints (`index.html`, `work/*/index.html`, `404.html`) fresh on deployment.

---

## 3. Supabase Row Level Security & Public API Exposure (`SEC-04`, `S3-T2`)

Audited migration: `supabase/migrations/20261011000000_create_contact_submissions.sql`.

1. **Mandatory RLS Enforcement:**
   - `ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;`
   - `ALTER TABLE public.contact_submissions FORCE ROW LEVEL SECURITY;` (ensures RLS applies even to table owners unless explicitly bypassed by `service_role`).
2. **Principle of Least Privilege (Column-Scoped Grants):**
   - `REVOKE ALL ON TABLE public.contact_submissions FROM public, anon, authenticated;`
   - `GRANT INSERT (name, email, project_type, message) ON TABLE public.contact_submissions TO anon, authenticated;`
   - Visitors cannot supply custom `id` or `created_at` values; both are generated server-side by Postgres (`gen_random_uuid()` and `now()`).
3. **Write-Only Public Policy (`allow_anon_insert_contact_submissions`):**
   - Permits `INSERT` only when `WITH CHECK` constraints pass on `name`, `email`, `project_type`, and `message`.
   - **Zero `SELECT`, `UPDATE`, or `DELETE` policies exist for `anon` or `authenticated`.** Any attempt to call `.select()`, `.update()`, or `.delete()` with the browser anon key is immediately rejected by Postgres RLS with `42501` (`permission denied for table contact_submissions`).
   - In `src/lib/supabase/submitContact.ts`, insertion uses `table.insert([validation.data])` without chaining `.select()`, ensuring compatibility with strict insert-only RLS.

---

## 4. Secret Isolation & Bundle Verification (`SEC-05`, `S3-T1`)

1. **Git Ignore Controls:**
   - `.gitignore` explicitly excludes `.env`, `.env.local`, and `.env.*.local`. Only `.env.example` (containing empty/placeholder instructions) is tracked in Git.
2. **Public Environment Guard (`src/lib/supabase/env.ts`):**
   - `validatePublicSupabaseEnv` throws a `SECURITY_VIOLATION` if `VITE_SUPABASE_SERVICE_ROLE_KEY` is ever set in the build environment.
   - `assertNotServiceRoleKey` inspects `VITE_SUPABASE_ANON_KEY` for `sb_secret_` prefixes, `service_role` substrings, and base64url-decoded JWT payloads where `"role": "service_role"` is present.
   - Browser client (`src/lib/supabase/client.ts`) disables session persistence (`persistSession: false`, `autoRefreshToken: false`, `detectSessionInUrl: false`).
3. **Server-Only Isolation (`src/lib/supabase/server.ts`):**
   - `assertServerEnvironment()` throws immediately if `typeof window !== 'undefined'`.
   - Reads credentials exclusively from `process.env.SUPABASE_SERVICE_ROLE_KEY` and is never imported by any file in the browser component tree (`src/app`, `src/routes`, `src/components`).
4. **Automated Bundle Verification (`src/lib/security/security-headers.test.ts`):**
   - Scans all non-test `src/**` files and compiled `dist/assets/*.js` bundles to confirm zero `sb_secret_<token>` secrets, zero hardcoded JWTs, and zero imports of `src/lib/supabase/server.ts` in browser bundles.

---

## 5. Input Validation, Safe Error Handling & Anti-Spam Controls (`SEC-06`, `S3-T3`, `S3-T4`)

### 5.1 Dual-Boundary Input Validation

| Field | Client Zod Schema (`src/lib/validation/contact.ts`) | Postgres Constraint (`20261011000000_create_contact_submissions.sql`) |
| --- | --- | --- |
| `name` | Trimmed string, `2–120` chars | `char_length(btrim(name)) between 2 and 120` |
| `email` | Trimmed, lowercased, valid email + regex `^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$`, `5–254` chars | `char_length(btrim(email)) between 5 and 254` and case-insensitive regex match |
| `project_type` | Optional enum: `full-stack-web`, `backend-api-systems`, `ai-data-pipeline`, `technical-consulting`, `other` | `project_type is null or project_type in (...)` |
| `message` | Trimmed string, `20–4000` chars | `char_length(btrim(message)) between 20 and 4000` |

### 5.2 Anti-Spam & Abuse Mitigation (`src/lib/security/antiSpam.ts`)

1. **Off-Screen Honeypot (`website`):** Hidden from assistive technologies (`aria-hidden="true"`, `tabIndex={-1}`, `autoComplete="off"`). If populated by an automated bot, `submitContact` rejects the submission before contacting Supabase.
2. **Minimum Human Interaction Timing (`MIN_INTERACTION_DURATION_MS = 1500`):** Rejects submissions completed less than `1,500 ms` after form mount.
3. **Cooldown & Rolling Window Rate Limiting:**
   - **Minimum Cooldown (`RATE_LIMIT_COOLDOWN_MS = 15000`):** Enforces a 15-second cooldown between consecutive submissions.
   - **Duplicate Payload Suppression (`DUPLICATE_SUBMISSION_WINDOW_MS = 300000`):** Blocks identical normalized `email + message` fingerprints within a 5-minute window.
   - **Rolling Window Cap (`MAX_SUBMISSIONS_PER_WINDOW = 3` per `10 minutes`):** Caps total submissions from a browser session to 3 per 10-minute window.
4. **Documented Limitation of Client-Side Rate Limiting:**
   - Client-side timing and in-memory rate limits protect against accidental double-clicks and unsophisticated form-filling scripts, but can be bypassed by direct HTTP requests to the Supabase REST endpoint.
   - **Server-Side Mitigation:** Database-level `CHECK` constraints and RLS policies strictly bound row sizes and allowed columns; Supabase API Gateway enforces platform IP rate limits; if sustained direct-API spam occurs, the owner can transition `submitContact` to a Supabase Edge Function with IP/Cloudflare Turnstile verification without changing the database schema.

### 5.3 Safe Error Sanitization (`src/lib/security/errors.ts`)

- `sanitizeSubmissionError(error)` maps all errors into 4 safe, user-actionable messages (`network`, `rateLimit`, `validation`, `unavailable`).
- Internal Postgres error codes (`42501`, `23505`, `PGRST*`), table names (`contact_submissions`), constraint names, and stack traces are never exposed to the DOM or browser console.
- Every error banner provides a direct `mailto:gobwocha@gmail.com` fallback link so a legitimate prospective client is never stranded.

---

## 6. Data Minimization & Retention Policy (`SEC-08`)

1. **Data Minimization:**
   - Only 4 visitor-supplied fields are stored: `name`, `email`, `project_type` (optional), and `message`, plus auto-generated `id` and `created_at`.
   - No IP addresses, user-agent fingerprints, tracking cookies, or `localStorage` session tokens are stored by the application.
2. **Retention & Cleanup Schedule (12 Months Maximum):**
   - Enquiries are retained for a maximum of **12 months** solely to evaluate and respond to potential client engagements, or deleted immediately upon a visitor's request.
   - **Scheduled Cleanup SQL Query** (run monthly via Supabase SQL Editor or `pg_cron` where enabled):
     ```sql
     -- Purge contact enquiries older than 12 months per SEC-08 retention policy
     DELETE FROM public.contact_submissions
     WHERE created_at < now() - interval '12 months';
     ```

---

## 7. Dependency Audit (`SEC-07`)

Production dependencies are kept intentionally minimal (`@supabase/supabase-js`, `react`, `react-dom`, `react-router`, `zod`).

### Verified `npm audit --omit=dev` Output

Executed on `2026-10-11`:

```text
$ npm audit --omit=dev
found 0 vulnerabilities
```

---

## 8. Production Observability, SLA Verification & Recovery Plan (`S5-T4`, `SEC-03`)

### 8.1 Honest Hosting & Database SLA Verification (`SEC-03`)

Per `AGENTS.md` §4.5 ("Verify the selected provider's plan/SLA and monitoring; do not claim an uptime guarantee without evidence"):

- **Vercel Hosting:** Vercel's financially backed **99.99% Uptime SLA** applies exclusively to **Vercel Enterprise** agreements. Standard **Vercel Hobby and Pro** plans utilize the same global Anycast edge network and multi-region static asset replication, which historically achieves >99.9% availability, but **do not carry a contractual 99.9% SLA**.
- **Supabase Database:** Supabase's formal **99.9% Uptime SLA** applies to **Supabase Enterprise** (and eligible Team/Enterprise add-on agreements), whereas **Supabase Free and Pro** tiers are provided without a financially backed uptime SLA (moreover, Supabase Free tier projects pause after 7 days of inactivity unless kept active).
- **Architecture Consequence:** Because all portfolio pages (`/`, `/work`, `/work/:slug`, `/about`, `/contact`, `/404`) are statically pre-rendered (`dist/**/index.html`) and served directly from Vercel's edge CDN, **100% of portfolio browsing remains online and fast even during a complete Supabase database outage**. If Supabase is unreachable, only the contact form submission is affected, and `ContactForm` gracefully displays a clear fallback banner directing the visitor to `mailto:gobwocha@gmail.com`. No unverified "99.9% guaranteed SLA" claim is published anywhere on the website.

### 8.2 Production Uptime & Error Monitoring

1. **Automated HTTP & Content Health Checks:**
   - Monitor primary entrypoints (`https://gobwocha.vercel.app/`, `https://gobwocha.vercel.app/work`, and `https://gobwocha.vercel.app/contact`) every 5–15 minutes using an external HTTP monitor (e.g., Upptime / Better Stack / Checkly) or a scheduled GitHub Actions workflow asserting:
     - HTTP `200 OK` response status
     - TLS certificate validity (>14 days remaining)
     - Presence of `Content-Security-Policy` and `Strict-Transport-Security` headers
     - Presence of SSR-prerendered `<main id="main-content">` markup
2. **Supabase Health & PostgREST Error Logs:**
   - Inspect **Supabase Dashboard → Reports → API** and **Logs → PostgREST Logs** weekly for elevated HTTP `4xx`/`5xx` rates on `/rest/v1/contact_submissions`.
   - Enable Supabase project email notifications for database resource exhaustion or Free-tier inactivity warnings.

### 8.3 Database Backup & Enquiry Export Procedure

To prevent loss of visitor enquiries and maintain off-site backups:

1. **On-Demand CSV/JSON Export (Supabase Studio):**
   - Navigate to **Supabase Dashboard → Table Editor → `contact_submissions`** and click **Export → Export as CSV** before running maintenance or migrations.
2. **CLI / SQL Backup Query:**
   ```sql
   -- Export active enquiries ordered by newest first
   SELECT id, name, email, project_type, message, created_at
   FROM public.contact_submissions
   ORDER BY created_at DESC;
   ```
3. **Schema Recovery:**
   - The complete table schema, constraints, grants, and RLS policies are version-controlled in `supabase/migrations/20261011000000_create_contact_submissions.sql` and can be re-applied cleanly to any fresh Postgres instance via `supabase db push`.

### 8.4 Instant Deployment Rollback Procedure

If a production release introduces a visual regression, broken route, or CSP violation:

1. **Immediate Edge Rollback (< 30 seconds via Vercel):**
   - **Via CLI:** Run `npx vercel rollback` to atomically point the production domain (`gobwocha.vercel.app`) back to the previous known-good immutable deployment.
   - **Via Dashboard:** Open **Vercel Project → Deployments**, locate the last healthy `Production` deployment, click the **`⋯`** menu, and select **Instant Rollback** (or **Promote to Production**).
2. **Git Repository Remediation:**
   - Revert the offending commit on `main` so CI/CD stays synchronized with the rolled-back edge state:
     ```bash
     git revert <bad-commit-sha>
     git push origin main
     ```
   - Verify `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and `npm run test:e2e` pass before re-promoting.
