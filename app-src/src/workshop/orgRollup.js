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
//
// `links` are extra parent_unit_id edges (org_unit_links rows) on top of a
// unit's one primary parent_unit_id slot -- a shared unit like "IT" keeps its
// single visual position under its primary parent in the tree/canvas, but
// also gets bucketed as a child of every extra parent here, so its rolled-up
// stage counts toward all of them.
export function buildUnitTree(units, links = []) {
  const byParent = {}
  units.forEach((u) => {
    if (!u.parent_unit_id) return
    ;(byParent[u.parent_unit_id] ||= []).push(u)
  })
  const byId = {}
  units.forEach((u) => { byId[u.id] = u })
  links.forEach((l) => {
    const child = byId[l.unit_id]
    if (child) (byParent[l.parent_unit_id] ||= []).push(child)
  })
  const sortBySortOrder = (list) => [...list].sort((a, b) => (a.sort_order - b.sort_order) || a.created_at.localeCompare(b.created_at))
  Object.keys(byParent).forEach((k) => { byParent[k] = sortBySortOrder(byParent[k]) })
  return byParent
}

// Would adding an extra-parent link from `unitId` to `candidateParentId` be
// valid? False if candidateParentId is unitId itself, is already unitId's
// primary parent (redundant -- it'd double the same edge), or is reachable
// by walking DOWN from unitId through the existing primary + extra edges --
// i.e. candidateParentId's rating already feeds into unitId somewhere, so
// feeding unitId into it too would close a loop.
export function canLinkAsExtraParent(unitId, candidateParentId, units, links = []) {
  if (unitId === candidateParentId) return false
  const unit = units.find((u) => u.id === unitId)
  if (unit && unit.parent_unit_id === candidateParentId) return false
  const byParent = buildUnitTree(units, links)
  const stack = [unitId]
  const seen = new Set()
  while (stack.length) {
    const id = stack.pop()
    if (id === candidateParentId) return false
    if (seen.has(id)) continue
    seen.add(id)
    ;(byParent[id] || []).forEach((c) => stack.push(c.id))
  }
  return true
}

export function topLevelUnits(units) {
  return [...units.filter((u) => !u.parent_unit_id)].sort((a, b) => (a.sort_order - b.sort_order) || a.created_at.localeCompare(b.created_at))
}

// Recursively rolls a unit and all its descendants into one { unit, own,
// stages, participantCount, children } node. `stages` is what the radar /
// summary should render for that unit; `own` is only its direct answers.
// `resolveChild` lets rollupOrg memoize a unit that's reachable from more
// than one parent (via an extra link) so it's only computed once.
export function rollupUnit(unit, byParent, participantsBySession, dims, resolveChild) {
  const ownParticipants = participantsBySession[unit.session_id] || []
  const own = unitOwnStages(dims, ownParticipants)
  const childUnits = byParent[unit.id] || []
  const resolve = resolveChild || ((c) => rollupUnit(c, byParent, participantsBySession, dims))
  const children = childUnits.map(resolve)

  const stages = {}
  dims.forEach((d) => {
    const candidates = [own[d.id], ...children.map((c) => c.stages[d.id])].filter((v) => v !== null && v !== undefined)
    stages[d.id] = candidates.length ? Math.min(...candidates) : null
  })

  const participantCount = ownParticipants.length + children.reduce((sum, c) => sum + c.participantCount, 0)
  return { unit, own, stages, children, participantCount }
}

// `links` are extra parent_unit_id edges on top of the primary tree (see
// buildUnitTree) -- a unit reachable through more than one parent is only
// resolved once (cached by id) and the same node is reused wherever it
// appears, so its weakest-link stages count toward every parent without
// re-walking its subtree per parent.
export function rollupOrg(units, participantsBySession, dims, links = []) {
  const byParent = buildUnitTree(units, links)
  const roots = topLevelUnits(units)
  const cache = new Map()
  function resolve(unit) {
    if (cache.has(unit.id)) return cache.get(unit.id)
    const node = rollupUnit(unit, byParent, participantsBySession, dims, resolve)
    cache.set(unit.id, node)
    return node
  }
  return roots.map(resolve)
}

// The whole org's true headcount: every unit's own participants counted
// exactly once, regardless of how many parents its rolled-up stage feeds
// into (rollupOrg's recursive participantCount intentionally double-counts
// a shared unit once per parent branch, since that's the correct scope for
// each of THOSE branches -- but a single whole-organization total must not
// count the same respondents twice).
export function totalDistinctParticipants(units, participantsBySession) {
  return units.reduce((sum, u) => sum + (participantsBySession[u.session_id]?.length || 0), 0)
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
