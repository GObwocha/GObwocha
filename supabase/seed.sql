-- ============================================================================
-- DEVELOPMENT SEED DATA ONLY — DO NOT RUN IN PRODUCTION (S3-T2)
-- ============================================================================
-- These synthetic rows are strictly for local Supabase development and testing.

insert into public.contact_submissions (name, email, project_type, message)
values
  (
    'DEV SEED — Amara Ochieng (Synthetic Test)',
    'dev-seed-amara@example.test',
    'backend-api-systems',
    '[DEVELOPMENT SEED ONLY] Looking to discuss a high-throughput event ingestion service and PostgreSQL row-level security review for a staging environment.'
  ),
  (
    'DEV SEED — David Kamau (Synthetic Test)',
    'dev-seed-david@example.test',
    'full-stack-web',
    '[DEVELOPMENT SEED ONLY] Exploring a full-stack web platform rebuild with static route pre-rendering and WCAG 2.1 AA accessibility compliance.'
  );
