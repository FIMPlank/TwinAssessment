# Twin Transformation Maturity Assessment (TwinClimb)

A free, research-based **self-assessment** that helps organizations map their
*twin transformation* maturity — the value-adding interplay of **digital
transformation** and **sustainability transformation** — and see what
capabilities to develop next.

It operationalizes the **Twin Transformation Capability Maturity Model (TTCMM)**:

> Breiter, K., Crome, C., Oberländer, A. M., & Schnaak, F. (2024). *Dynamic
> Capabilities for the Twin Transformation Climb: A Capability Maturity Model.*
> Information Systems Frontiers, 26, 2205–2226.
> https://doi.org/10.1007/s10796-024-10520-y (Open Access)

**Live site:** https://fimplank.github.io/TwinAssessment/

Provided in the context of twin transformation research at **Fraunhofer FIT /
FIM Research Institute for Information Management**.

---

## What it does

- **Quick path (default):** rate each of the six capability dimensions with one
  maturity-stage pick (0–4).
- **Deep path (opt-in, per dimension):** drill into a dimension and answer at the
  **capability level** (Fulfilled / Not fulfilled / N/A). The dimension's stage is
  then *derived* from the responses and overrides the quick pick, marked
  "deep-assessed". Both paths feed the same radar, pathway, and gap outputs.
- Shows an integrated maturity stage, a per-dimension radar profile, the
  organization's pathway, its bottleneck dimension, and prioritized next moves.
- Optionally lets each organization **submit its results** to a research study.
- Provides a password-protected **dashboard** for the researcher to view all
  submissions and track organizations over time (longitudinal study).

### Stage-derivation rule (deep path)

A dimension reaches stage *N* when **every applicable capability in stages 1…N is
Fulfilled**; its derived stage is the highest such *N* (a later fulfilled stage
never skips an earlier gap). **N/A** capabilities are excluded (they neither block
nor advance). If not even stage 1 is satisfied, the dimension is *pre-stage-1
(emerging)*. Stage 1 splits into a **DT** set and an **ST** set, which drive the
pathway (DT-expert / ST-expert / Newcomer). The canonical model lives in
[`ttcmm.json`](ttcmm.json) (45 capabilities, reconciled against Breiter et al.
2024, Table 4); the derivation logic and its tests are in
[`scripts/`](scripts/) — run `node scripts/ttcmm.test.mjs`. The same logic is
mirrored inline in the assessment Component.

The six dimensions: **Strategy & Leadership, Culture & Employees, Ecosystem &
Partnerships, Products & Services, Operations, Technology.**
The four stages: **1 Awareness → 2 Development → 3 Implementation → 4 True twin
transformer.**

---

## Site structure

The site is **static HTML** hosted on GitHub Pages. No build step, no framework.

| File | Purpose |
|------|---------|
| `index.html` | Landing / start page — the entry point. Hero, explainer, how-it-works, research card, affiliation, footer. |
| `assessment.html` | The assessment app itself (self-contained single-file prototype). |
| `dashboard.html` | Password-protected researcher dashboard (view + export submissions). |
| `impressum.html` / `datenschutz.html` | Legal placeholder pages (to be completed). |
| `og-image.png` | Open Graph preview image for shared links. |
| `.nojekyll` | Serves files as-is (disables Jekyll processing). |

Typical visitor flow: **`index.html` → `assessment.html` → submit results**.
Researcher flow: **`dashboard.html` → sign in → review data**.

---

## Architecture

- **Frontend:** static HTML/CSS/JS. The landing, dashboard, and legal pages are
  hand-written; the assessment is a self-contained bundled prototype. React is
  **inlined** into the assessment, so the whole site loads from its own origin
  with **no third-party CDN** (works behind restrictive corporate networks).
- **Backend:** [Supabase](https://supabase.com) (hosted Postgres + REST API +
  Auth). There is no server to run — the pages talk to Supabase directly.
- **Design system:** Fraunhofer FIT corporate identity — Fraunhofer green
  (`#179C7D`) with cool neutral grays and an accessible six-color dimension
  palette shared across all pages.

### Data flow

```
assessment.html  --(anonymous INSERT via Supabase REST)-->  assessments table
dashboard.html   --(authenticated SELECT via Supabase Auth)--> assessments table
```

Anyone can *submit* a result; only the authenticated researcher account can
*read* the data. This is enforced by Postgres Row-Level Security (RLS), not by
the client — so exposing the public key in the pages is safe by design.

---

## Supabase setup

The pages are configured with the Supabase **project URL** and the **publishable
(anon) key**, both of which are public and safe to ship in a static page. The
configuration lives at the top of the `<script>` in `assessment.html` (the
submission panel) and `dashboard.html`.

### 1. Table + submission policy

```sql
create table public.assessments (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  company_name  text not null,
  contact_email text,
  answers       jsonb not null,
  scores        jsonb,
  overall_stage int,
  app_version   text
);

alter table public.assessments enable row level security;

-- Anyone may submit; nobody may read with the public key.
create policy "public can submit assessments"
  on public.assessments for insert to anon with check (true);
```

### 2. Researcher read access (for the dashboard)

Create one auth user (Authentication → Users → *Add user*, auto-confirmed),
disable public sign-ups, then scope reads to that account:

```sql
create policy "researcher reads all"
  on public.assessments for select to authenticated
  using ( (auth.jwt() ->> 'email') = 'YOUR_LOGIN_EMAIL' );
```

The dashboard signs in with that email/password and reads the data with the
resulting token.

### Submission record

Each submission stores the organization name, an optional contact email, the raw
`answers` (per-dimension stage 0–4), computed `scores` (min/max/avg + per
dimension), the `overall_stage` (the minimum across dimensions), and a
timestamp — everything needed for a longitudinal study.

---

## Dashboard

`dashboard.html` (marked `noindex`) requires a Supabase Auth login. It shows:

- summary tiles (submissions, organizations, mean stage, latest activity),
- per-organization **maturity-over-time** cards with a stage sparkline and a
  per-dimension breakdown,
- a sortable/filterable table of every submission,
- **CSV export** for analysis (Excel / R / SPSS).

A discreet link to it lives in the landing-page footer and as a floating link on
the assessment page.

---

## Local development

No dependencies or build step. Serve the folder over HTTP so relative links and
`fetch` behave as on GitHub Pages:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/
```

Opening files directly via `file://` mostly works, but a local server matches
production more closely.

---

## Deployment

GitHub Pages, **Deploy from a branch** → `main` / root. Every push to `main`
triggers a Pages build; the site updates automatically once it goes green. The
`.nojekyll` file ensures files are served exactly as committed.

---

## Credits

- **Model:** Breiter, Crome, Oberländer & Schnaak (2024), *Dynamic Capabilities
  for the Twin Transformation Climb*, Information Systems Frontiers 26:2205–2226.
- **Provided by:** Fraunhofer FIT / FIM Research Institute for Information
  Management, in the context of twin transformation research.

Prototype for research purposes.
