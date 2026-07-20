-- Tailoring fields: client company name, a facilitator context note, and
-- per-session phase time budgets (minutes), editable at session creation.
alter table public.workshop_sessions
  add column if not exists company_name text,
  add column if not exists context_note text,
  add column if not exists phase_minutes jsonb not null default
    '{"opening":10,"calibration":15,"deepdive":40,"prioritization":25}';
