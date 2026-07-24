import { supabase } from './supabaseClient'
import { generatePin } from './codeGen'
import { createSession } from './api'

// Thin data layer over org_charts/org_units, mirroring api.js. Each unit's
// own assessment is a completely ordinary workshop_sessions row (async
// mode) created through the exact same createSession() the standalone
// "Async team check" flow uses -- a unit IS a session, just one that's
// attached to a place in an org tree instead of standing alone.

export async function createOrgChart(facilitatorName, lang, orgName) {
  const { data, error } = await supabase
    .from('org_charts')
    .insert({ name: orgName, facilitator_name: facilitatorName, lang, facilitator_pin: generatePin() })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function fetchOrgChart(orgId) {
  const { data, error } = await supabase.from('org_charts').select().eq('id', orgId).maybeSingle()
  if (error) throw error
  return data
}

// opts carries the exact same session-customization fields the standalone
// FacilitatorHome form offers (mode, contextNote, phaseMinutes) -- a unit's
// session is created through the very same createSession() that flow uses,
// so nothing about it is a cut-down version of a "real" workshop session.
export async function createOrgUnit(org, parentUnitId, name, opts = {}) {
  const mode = opts.mode === 'live' ? 'live' : 'async'
  const sessionOpts = { mode, companyName: name }
  if (opts.contextNote) sessionOpts.contextNote = opts.contextNote
  if (mode === 'live' && opts.phaseMinutes) sessionOpts.phaseMinutes = opts.phaseMinutes
  const session = await createSession(org.facilitator_name, org.lang, sessionOpts)
  const { data, error } = await supabase
    .from('org_units')
    .insert({ org_id: org.id, parent_unit_id: parentUnitId ?? null, session_id: session.id, name })
    .select()
    .single()
  if (error) throw error
  return { ...data, session }
}

export async function renameOrgUnit(unitId, name) {
  const { error } = await supabase.from('org_units').update({ name }).eq('id', unitId)
  if (error) throw error
}

export async function deleteOrgUnit(unitId) {
  const { error } = await supabase.from('org_units').delete().eq('id', unitId)
  if (error) throw error
}

export async function fetchOrgUnits(orgId) {
  const { data, error } = await supabase.from('org_units').select().eq('org_id', orgId).order('sort_order').order('created_at')
  if (error) throw error
  return data
}

// Bulk-load every unit's session + participants in one pass -- used by both
// the builder (per-unit status pills) and the rollup view (aggregation).
export async function fetchOrgRollupData(orgId) {
  const units = await fetchOrgUnits(orgId)
  const sessionIds = units.map((u) => u.session_id)
  if (sessionIds.length === 0) return { units, sessionsById: {}, participantsBySession: {} }

  const [{ data: sessions, error: sErr }, { data: participants, error: pErr }] = await Promise.all([
    supabase.from('workshop_sessions').select().in('id', sessionIds),
    supabase.from('workshop_participants').select().in('session_id', sessionIds),
  ])
  if (sErr) throw sErr
  if (pErr) throw pErr

  const sessionsById = {}
  sessions.forEach((s) => { sessionsById[s.id] = s })
  const participantsBySession = {}
  participants.forEach((p) => { (participantsBySession[p.session_id] ||= []).push(p) })
  return { units, sessionsById, participantsBySession }
}
