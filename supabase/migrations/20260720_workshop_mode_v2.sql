-- Adds a facilitator PIN (lightweight re-entry guard, not real auth — the
-- session is still readable by anon per the existing RLS policies).
alter table public.workshop_sessions
  add column if not exists facilitator_pin text;
