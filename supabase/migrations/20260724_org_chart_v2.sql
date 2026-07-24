-- Lets a unit feed its rolled-up maturity into more than one parent unit --
-- e.g. a shared "IT" unit that should count toward both Operations and
-- Finance -- on top of the one primary parent_unit_id slot org_units
-- already has. The primary tree (parent_unit_id) still owns the org chart's
-- visual layout (exactly one box position per unit); a row here only adds
-- an extra edge for rollup math and an extra connector line on the canvas.
--
-- Same trust model as org_chart.sql: anon read/write via RLS, no login.

create table public.org_unit_links (
  id              uuid primary key default gen_random_uuid(),
  unit_id         uuid not null references public.org_units(id) on delete cascade,
  parent_unit_id  uuid not null references public.org_units(id) on delete cascade,
  created_at      timestamptz not null default now(),
  unique (unit_id, parent_unit_id)
);

create index org_unit_links_unit_idx on public.org_unit_links(unit_id);
create index org_unit_links_parent_idx on public.org_unit_links(parent_unit_id);

alter table public.org_unit_links enable row level security;

create policy "anon can create org unit links" on public.org_unit_links for insert to anon with check (true);
create policy "anon can read org unit links" on public.org_unit_links for select to anon using (true);
create policy "anon can delete org unit links" on public.org_unit_links for delete to anon using (true);

alter publication supabase_realtime add table public.org_unit_links;
