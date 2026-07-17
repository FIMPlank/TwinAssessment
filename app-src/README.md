# TwinClimb assessment app

Source for `assessment.html` / `assessment.de.html` (the repo root copies are
**built output** — edit here, not there). React + Vite, plain JS/JSX (no
TypeScript, matching the rest of the repo).

```bash
npm install
npm run dev      # http://localhost:5173/assessment.html (and assessment.de.html)
npm run build    # -> dist/{assessment.html,assessment.de.html,assets/}
```

After building, copy the output over the repo-root copies and commit both
together — see the main [README](../README.md#local-development).

## Layout

- `assessment.html` / `assessment.de.html` — Vite entry points (multi-page build).
- `src/main-en.jsx` / `src/main-de.jsx` — mount `<App lang="en|de" />`.
- `src/App.jsx` — the whole app: intro → 6 dimensions → results, one tree for both locales.
- `src/ttcmm.js` — adapter over the canonical model: imports `../../ttcmm.json`
  and `../../scripts/ttcmm.logic.mjs` directly from the repo root. There is
  exactly one copy of the capability data and stage-derivation logic, shared
  with the Node test suite (`node ../scripts/ttcmm.test.mjs` from here, or
  `node scripts/ttcmm.test.mjs` from the repo root).
- `src/i18n.js` — every UI string (chrome, labels, templates) for both
  locales side by side, so a missing translation is a missing key, not a
  missing file. Capability text itself lives in `ttcmm.json` (`text`/`text_de`).
- `src/components/` — `Header`, `Intro`, `DimensionView` (quick pick + opt-in
  capability drill-down), `ResultsView` (radar, pathways, gaps),
  `SubmissionPanel` (Supabase, collapsible), `AdminLink`, `LangToggle`.
- `src/useAssessment.js` — state + localStorage persistence (`twinclimb_v1`,
  same key/shape the previous bundle used, so in-progress visitor state
  survives the upgrade) + derived values (effective stage, deep-assessed
  list, pathway) via `ttcmm.js`.
- `src/styles.css` — self-hosted fonts (`@fontsource/*`, Latin + Latin
  Extended only — covers EN/DE without shipping unused Cyrillic/Greek/
  Vietnamese subsets) and the small set of truly global rules (print,
  resets). Everything else is inline `style={{...}}` per component, ported
  1:1 from the previous bundle's design so the visual output is unchanged.

## Why a real source tree

The previous `assessment.html`/`.de.html` were compiled single-file bundles
with no source in the repo — every change meant decoding a JSON-encoded
template string, doing exact-anchor string surgery on the JS/markup inside
it, and re-encoding it back into the HTML file. It worked, but every edit
risked a silent typo breaking the bundle, and EN/DE had to be kept in sync by
hand. This is a normal React app instead: real JSX, one component tree for
both locales, one canonical data file, and a build step that fails loudly
(syntax error, missing import) instead of silently.
