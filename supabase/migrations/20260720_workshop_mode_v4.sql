-- Async team check: same tables, no live facilitator. A session's `mode`
-- distinguishes the two; async sessions only ever use phase 'prework'
-- (collecting) and 'summary' (report generated), skipping the live phases
-- entirely — no new phase values needed, the existing check constraint
-- already allows both.
alter table public.workshop_sessions
  add column if not exists mode text not null default 'live' check (mode in ('live', 'async'));
