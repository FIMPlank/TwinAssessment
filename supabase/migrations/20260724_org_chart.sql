-- Organization rollup: a facilitator maps an org chart (units in a
-- hierarchy), each unit gets its own async workshop_sessions row (the
-- existing self-serve check-in flow, unmodified) reachable via its own
-- shareable link, and a rollup view aggregates every unit's result up the
-- tree to a whole-organization maturity view.
--
-- Same trust model as workshop_mode.sql: no login, the org's facilitator_pin
-- is a re-entry guard (not a security boundary), anon read/write via RLS.

create table public.org_charts (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  facilitator_name text not null,
  lang             text not null default 'en',
  facilitator_pin  text not null,
  created_at       timestamptz not null default now()
);

create table public.org_units (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references public.org_charts(id) on delete cascade,
  parent_unit_id  uuid references public.org_units(id) on delete cascade,
  session_id      uuid not null references public.workshop_sessions(id) on delete cascade,
  name            text not null,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now()
);

create index org_units_org_idx on public.org_units(org_id);
create index org_units_parent_idx on public.org_units(parent_unit_id);
create index org_units_session_idx on public.org_units(session_id);

alter table public.org_charts enable row level security;
alter table public.org_units enable row level security;

create policy "anon can create org charts" on public.org_charts for insert to anon with check (true);
create policy "anon can read org charts" on public.org_charts for select to anon using (true);
create policy "anon can update org charts" on public.org_charts for update to anon using (true);

create policy "anon can create org units" on public.org_units for insert to anon with check (true);
create policy "anon can read org units" on public.org_units for select to anon using (true);
create policy "anon can update org units" on public.org_units for update to anon using (true);
create policy "anon can delete org units" on public.org_units for delete to anon using (true);

alter publication supabase_realtime add table
  public.org_charts,
  public.org_units;
