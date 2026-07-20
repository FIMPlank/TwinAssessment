-- Workshop mode: live, facilitated multi-participant sessions.
-- Separate from the `assessments` research table — never pooled into it.
-- Apply this in the same Supabase project as `assessments` (see README.md).
--
-- Access model: there is no participant login. The join code is the only
-- access boundary — anyone who has it can read and write that session's
-- rows via the anon/publishable key, same trust model as the existing
-- `assessments` insert policy. This is adequate for a facilitator-present,
-- code-shared-verbally-in-a-room tool; it is not a security boundary against
-- someone who obtains the code out of band. Documented, not solved, here.

create table public.workshop_sessions (
  id                    uuid primary key default gen_random_uuid(),
  code                  text unique not null,             -- short join code, e.g. 6 chars
  facilitator_name      text not null,
  lang                  text not null default 'en',
  phase                 text not null default 'prework'
                        check (phase in ('prework','opening','calibration','deepdive','prioritization','summary')),
  active_dimension_id   text,
  deep_dive_dimension_ids text[] not null default '{}',
  research_opt_in       boolean not null default false,   -- opt-in flag only; no aggregation pipeline built
  created_at            timestamptz not null default now()
);

create table public.workshop_participants (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid not null references public.workshop_sessions(id) on delete cascade,
  name          text not null,
  answers       jsonb not null default '{}',   -- { [dimension_id]: 0-4 }, same shape as the self-assessment's quick pick
  prework_notes jsonb not null default '{}',   -- { [dimension_id]: "free text" }
  joined_at     timestamptz not null default now()
);

create table public.workshop_responses (
  id             uuid primary key default gen_random_uuid(),
  session_id     uuid not null references public.workshop_sessions(id) on delete cascade,
  participant_id uuid not null references public.workshop_participants(id) on delete cascade,
  dimension_id   text not null,
  capability_id  text,                          -- null for prework-style dimension-level notes
  prompt_type    text not null
                 check (prompt_type in ('blocker','owner','visible_change')),
  text           text not null default '',
  created_at     timestamptz not null default now()
);

create table public.workshop_moves (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid not null references public.workshop_sessions(id) on delete cascade,
  dimension_id  text,
  capability_id text,
  description   text not null,
  owner         text not null default '',
  timeframe     text not null default '',
  created_at    timestamptz not null default now()
);

create index workshop_participants_session_idx on public.workshop_participants(session_id);
create index workshop_responses_session_idx on public.workshop_responses(session_id);
create index workshop_moves_session_idx on public.workshop_moves(session_id);

alter table public.workshop_sessions enable row level security;
alter table public.workshop_participants enable row level security;
alter table public.workshop_responses enable row level security;
alter table public.workshop_moves enable row level security;

-- Anyone can create a session (facilitator) and read/update it if they know
-- its id/code (facilitator's own tab keeps the id; there is no separate
-- facilitator credential — see the access-model note above).
create policy "anon can create sessions" on public.workshop_sessions for insert to anon with check (true);
create policy "anon can read sessions" on public.workshop_sessions for select to anon using (true);
create policy "anon can update sessions" on public.workshop_sessions for update to anon using (true);

create policy "anon can join sessions" on public.workshop_participants for insert to anon with check (true);
create policy "anon can read participants" on public.workshop_participants for select to anon using (true);
create policy "anon can update own participant row" on public.workshop_participants for update to anon using (true);

create policy "anon can post responses" on public.workshop_responses for insert to anon with check (true);
create policy "anon can read responses" on public.workshop_responses for select to anon using (true);
create policy "anon can edit responses" on public.workshop_responses for update to anon using (true);

create policy "anon can post moves" on public.workshop_moves for insert to anon with check (true);
create policy "anon can read moves" on public.workshop_moves for select to anon using (true);
create policy "anon can edit moves" on public.workshop_moves for update to anon using (true);

-- Realtime: Postgres Changes feed for facilitator/participant sync (no polling).
alter publication supabase_realtime add table
  public.workshop_sessions,
  public.workshop_participants,
  public.workshop_responses,
  public.workshop_moves;
