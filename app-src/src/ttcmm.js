// Thin adapter over the canonical TTCMM model. There is exactly one copy of
// the capability data (../../ttcmm.json) and the stage-derivation / pathway
// logic (../../scripts/ttcmm.logic.mjs) — both are shared with the Node test
// suite (scripts/ttcmm.test.mjs) so the app and its tests can never drift.
import ttcmm from '../../ttcmm.json'
import { deriveStage, detectPathway } from '../../scripts/ttcmm.logic.mjs'

export const DIMENSIONS = ttcmm.dimensions
export const PALETTE = ['#179C7D', '#1F6FB2', '#C0562F', '#7A5CA8', '#B07D00', '#B0417E']

export function isAnswered(v) {
  return v === 'yes' || v === 'no' || v === 'na'
}

// { stage, emerging, complete } for one dimension given its capability answers.
export function deriveForDim(dim, caps) {
  return deriveStage(caps, dim.capabilities)
}

export function isDeepAssessed(dim, caps) {
  return deriveForDim(dim, caps).complete
}

// The stage that actually counts for this dimension: the deep-derived stage
// once every capability is answered, else the quick pick (default 0).
export function effectiveStage(dim, caps, answers) {
  const d = deriveForDim(dim, caps)
  return d.complete ? d.stage : (answers[dim.id] ?? 0)
}

export function pathwayFor(caps, answers) {
  return detectPathway(DIMENSIONS, caps, answers)
}

export function dimName(dim, lang) {
  return lang === 'de' ? dim.name_de : dim.name
}

export function dimDesc(dim, lang) {
  return lang === 'de' ? dim.desc_de : dim.desc
}

export function capText(cap, lang) {
  return lang === 'de' ? cap.text_de : cap.text
}
