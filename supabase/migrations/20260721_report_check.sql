-- AI Report Check (beta): upload a sustainability/transformation report and
-- get an AI-drafted TTCMM capability assessment to review before it counts.
-- Same access model as workshop mode — the code is the only boundary, no
-- login. The AI call itself happens in the "report-assess" Edge Function
-- (supabase/functions/report-assess), not in this schema; this table only
-- persists the (possibly user-edited) result so it can be revisited via a
-- link. Nothing here is pooled into the `assessments` research table.

create table public.report_checks (
  id               uuid primary key default gen_random_uuid(),
  code             text unique not null,          -- short link code, e.g. 6 chars
  lang             text not null default 'en',
  company_name     text,
  source_filename  text,
  status           text not null default 'draft'
                   check (status in ('draft', 'reviewed')),
  caps             jsonb not null default '{}',   -- { [capability_id]: 'yes'|'no'|'na' }, reviewer-editable
  evidence         jsonb not null default '{}',   -- { [capability_id]: "quoted snippet from the report" }
  ai_model         text,                          -- model id that produced the draft, for provenance
  research_opt_in  boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.report_checks enable row level security;

create policy "anon can create report checks" on public.report_checks for insert to anon with check (true);
create policy "anon can read report checks" on public.report_checks for select to anon using (true);
create policy "anon can update report checks" on public.report_checks for update to anon using (true);
