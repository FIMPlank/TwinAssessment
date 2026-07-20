import { supabase } from './supabaseClient'
import { generateCode } from './codeGen'

// Thin data layer over the four workshop_* tables. Every write is a plain
// Postgres insert/update through the anon key — the join code is the access
// boundary (see supabase/migrations/20260720_workshop_mode.sql), there is no
// participant login and no separate facilitator credential.

export async function createSession(facilitatorName, lang) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode()
    const { data, error } = await supabase
      .from('workshop_sessions')
      .insert({ code, facilitator_name: facilitatorName, lang })
      .select()
      .single()
    if (!error) return data
    if (error.code !== '23505') throw error // not a unique-code collision — surface it
  }
  throw new Error('Could not allocate a unique join code — please retry.')
}

export async function fetchSessionByCode(code) {
  const { data, error } = await supabase
    .from('workshop_sessions')
    .select()
    .eq('code', code.toUpperCase().trim())
    .maybeSingle()
  if (error) throw error
  return data
}

export async function fetchSessionState(sessionId) {
  const [session, participants, responses, moves] = await Promise.all([
    supabase.from('workshop_sessions').select().eq('id', sessionId).single(),
    supabase.from('workshop_participants').select().eq('session_id', sessionId).order('joined_at'),
    supabase.from('workshop_responses').select().eq('session_id', sessionId).order('created_at'),
    supabase.from('workshop_moves').select().eq('session_id', sessionId).order('created_at'),
  ])
  if (session.error) throw session.error
  if (participants.error) throw participants.error
  if (responses.error) throw responses.error
  if (moves.error) throw moves.error
  return { session: session.data, participants: participants.data, responses: responses.data, moves: moves.data }
}

export async function updateSession(sessionId, patch) {
  const { error } = await supabase.from('workshop_sessions').update(patch).eq('id', sessionId)
  if (error) throw error
}

export async function joinAsParticipant(sessionId, name) {
  const { data, error } = await supabase
    .from('workshop_participants')
    .insert({ session_id: sessionId, name })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function setParticipantAnswer(participant, dimensionId, stage) {
  const answers = { ...(participant.answers || {}), [dimensionId]: stage }
  const { error } = await supabase.from('workshop_participants').update({ answers }).eq('id', participant.id)
  if (error) throw error
  return answers
}

export async function setParticipantPreworkNote(participant, dimensionId, text) {
  const prework_notes = { ...(participant.prework_notes || {}), [dimensionId]: text }
  const { error } = await supabase.from('workshop_participants').update({ prework_notes }).eq('id', participant.id)
  if (error) throw error
  return prework_notes
}

// Live capture: the first keystroke inserts a row, every subsequent
// (debounced) edit updates that same row by id — one bubble per
// participant/prompt on the shared wall, not one row per keystroke.
export async function insertResponse({ sessionId, participantId, dimensionId, capabilityId, promptType, text }) {
  const { data, error } = await supabase
    .from('workshop_responses')
    .insert({ session_id: sessionId, participant_id: participantId, dimension_id: dimensionId, capability_id: capabilityId ?? null, prompt_type: promptType, text })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateResponseText(responseId, text) {
  const { error } = await supabase.from('workshop_responses').update({ text }).eq('id', responseId)
  if (error) throw error
}

export async function addMove(sessionId, move) {
  const { data, error } = await supabase
    .from('workshop_moves')
    .insert({ session_id: sessionId, dimension_id: move.dimensionId ?? null, capability_id: move.capabilityId ?? null, description: move.description, owner: move.owner, timeframe: move.timeframe })
    .select()
    .single()
  if (error) throw error
  return data
}

// One realtime channel, four Postgres Changes filters, all scoped to this
// session — no polling anywhere in the workshop UI.
export function subscribeToSession(sessionId, handlers) {
  const channel = supabase
    .channel(`workshop:${sessionId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'workshop_sessions', filter: `id=eq.${sessionId}` }, (p) => handlers.onSession?.(p))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'workshop_participants', filter: `session_id=eq.${sessionId}` }, (p) => handlers.onParticipant?.(p))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'workshop_responses', filter: `session_id=eq.${sessionId}` }, (p) => handlers.onResponse?.(p))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'workshop_moves', filter: `session_id=eq.${sessionId}` }, (p) => handlers.onMove?.(p))
    .subscribe()
  return () => supabase.removeChannel(channel)
}
