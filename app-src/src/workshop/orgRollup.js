// Pure aggregation math for the organization rollup -- no Supabase, no
// React, so it can be reasoned about (and unit-tested) on its own.
//
// Same "weakest capability wins" rule the TTCMM already applies inside a
// single dimension (a dimension only credits a stage once every capability
// in it is met) and across participants in one workshop session
// (SummaryReport's referenceStage): a unit's stage per dimension is the
// minimum across everyone who answered directly in it, and a parent unit's
// stage per dimension is the minimum across its own direct answers AND
// every child unit's already-rolled-up stage. Rolling MIN one level higher
// each time up the tree keeps the same philosophy consistent from a single
// capability up to whole-organization maturity.

// null = no data yet (distinct from 0 = assessed as "not started").
export function unitOwnStages(dims, participants) {
  const out = {}
  dims.forEach((d) => {
    const vals = (participants || [])
      .map((p) => p.answers?.[d.id])
      .filter((v) => v !== undefined && v !== null)
    out[d.id] = vals.length ? Math.min(...vals) : null
  })
  return out
}

// Keyed only by real parent_unit_id values -- top-level units (parent_unit_id
// null) are never stuffed in here under a sentinel key, so a unit whose own
// id happens to collide with any placeholder string could never mistake
// itself for its own child and recurse forever.
export function buildUnitTree(units) {
  const byParent = {}
  units.forEach((u) => {
    if (!u.parent_unit_id) return
    ;(byParent[u.parent_unit_id] ||= []).push(u)
  })
  const sortBySortOrder = (list) => [...list].sort((a, b) => (a.sort_order - b.sort_order) || a.created_at.localeCompare(b.created_at))
  Object.keys(byParent).forEach((k) => { byParent[k] = sortBySortOrder(byParent[k]) })
  return byParent
}

export function topLevelUnits(units) {
  return [...units.filter((u) => !u.parent_unit_id)].sort((a, b) => (a.sort_order - b.sort_order) || a.created_at.localeCompare(b.created_at))
}

// Recursively rolls a unit and all its descendants into one { unit, own,
// stages, participantCount, children } node. `stages` is what the radar /
// summary should render for that unit; `own` is only its direct answers.
export function rollupUnit(unit, byParent, participantsBySession, dims) {
  const ownParticipants = participantsBySession[unit.session_id] || []
  const own = unitOwnStages(dims, ownParticipants)
  const childUnits = byParent[unit.id] || []
  const children = childUnits.map((c) => rollupUnit(c, byParent, participantsBySession, dims))

  const stages = {}
  dims.forEach((d) => {
    const candidates = [own[d.id], ...children.map((c) => c.stages[d.id])].filter((v) => v !== null && v !== undefined)
    stages[d.id] = candidates.length ? Math.min(...candidates) : null
  })

  const participantCount = ownParticipants.length + children.reduce((sum, c) => sum + c.participantCount, 0)
  return { unit, own, stages, children, participantCount }
}

export function rollupOrg(units, participantsBySession, dims) {
  const byParent = buildUnitTree(units)
  const roots = topLevelUnits(units)
  return roots.map((r) => rollupUnit(r, byParent, participantsBySession, dims))
}

// Integrated maturity for a rolled-up node, same rule as the self-assessment
// and workshop summary use: the organization/unit only reaches a stage once
// every dimension has reached it, so the overall value is the minimum across
// dimensions that have data. Returns null if nothing has been answered yet.
export function integratedStage(stages, dims) {
  const vals = dims.map((d) => stages[d.id]).filter((v) => v !== null && v !== undefined)
  return vals.length ? Math.min(...vals) : null
}

// The dimension holding the integrated stage back -- the same dimension
// that determines integratedStage above, surfaced by id so a management
// summary can name it. Returns null if nothing has been answered yet.
export function weakestDimension(stages, dims) {
  let weakId = null
  let weak = Infinity
  dims.forEach((d) => {
    const v = stages[d.id]
    if (v !== null && v !== undefined && v < weak) { weak = v; weakId = d.id }
  })
  return weakId
}
