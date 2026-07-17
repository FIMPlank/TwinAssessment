import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// TwinClimb assessment app. Builds to two static entry points that share one
// component tree (src/App.jsx) and one i18n string table (src/i18n.js) —
// no more hand-duplicated EN/DE bundles. `base: './'` keeps asset URLs
// relative so the build can be copied straight into the repo root, which
// GitHub Pages serves from a subpath (fimplank.github.io/TwinAssessment/).
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        assessment: resolve(__dirname, 'assessment.html'),
        'assessment.de': resolve(__dirname, 'assessment.de.html'),
      },
    },
  },
  server: {
    fs: {
      // src/ imports the canonical TTCMM data/logic from the repo root
      // (../ttcmm.json, ../scripts/ttcmm.logic.mjs) so there is exactly one
      // copy of the model shared by the app and its Node test suite.
      allow: ['..'],
    },
  },
})
