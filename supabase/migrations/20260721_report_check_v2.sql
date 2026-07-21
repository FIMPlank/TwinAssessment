-- Track which document-type hint was used for a report check (sustainability
-- report, digitalization strategy, roadmap, general) for provenance — the
-- report-assess Edge Function uses this to pick a tailored prompt.
alter table public.report_checks
  add column if not exists doc_type text not null default 'general';
