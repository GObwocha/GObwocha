-- Migration: Create public.contact_submissions with strict constraints and RLS (S3-T2)
-- Governance: AGENTS.md §1.4, §4.5, §6, §9
-- Retention policy: Enquiries are retained for up to 12 months solely to respond to visitor messages.

create extension if not exists pgcrypto;

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null
    constraint contact_submissions_name_length
    check (char_length(btrim(name)) between 2 and 120),
  email text not null
    constraint contact_submissions_email_check
    check (
      char_length(btrim(email)) between 5 and 254
      and btrim(email) ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    ),
  project_type text null
    constraint contact_submissions_project_type_check
    check (
      project_type is null
      or project_type in (
        'full-stack-web',
        'backend-api-systems',
        'ai-data-pipeline',
        'technical-consulting',
        'other'
      )
    ),
  message text not null
    constraint contact_submissions_message_length
    check (char_length(btrim(message)) between 20 and 4000),
  created_at timestamptz not null default now()
);

comment on table public.contact_submissions is
  'Visitor project enquiries with data minimization (name, email, optional project_type, message, created_at). Retention expectation: 12 months maximum per AGENTS.md §4.5; records older than 12 months or subject to owner deletion requests should be purged.';

-- Enforce Row Level Security (RLS) across roles including table owner
alter table public.contact_submissions enable row level security;
alter table public.contact_submissions force row level security;

-- Revoke all default table privileges from public roles and grant only column-scoped INSERT
revoke all on table public.contact_submissions from public, anon, authenticated;
grant insert (name, email, project_type, message) on table public.contact_submissions to anon, authenticated;

-- Allow anonymous and authenticated visitors to insert validated enquiries only.
-- Read, modification, and deletion policies are intentionally omitted so public visitors
-- can never read, modify, or delete submitted enquiries.
create policy allow_anon_insert_contact_submissions
  on public.contact_submissions
  for insert
  to anon, authenticated
  with check (
    char_length(btrim(name)) between 2 and 120
    and char_length(btrim(email)) between 5 and 254
    and btrim(email) ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    and (
      project_type is null
      or project_type in (
        'full-stack-web',
        'backend-api-systems',
        'ai-data-pipeline',
        'technical-consulting',
        'other'
      )
    )
    and char_length(btrim(message)) between 20 and 4000
  );
