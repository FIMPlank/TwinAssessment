import { useState, useEffect } from 'react'
import { fetchSessionState, subscribeToSession } from './api'

function upsertList(state, key, payload) {
  const list = state[key]
  if (payload.eventType === 'INSERT') {
    if (list.some((r) => r.id === payload.new.id)) return state
    return { ...state, [key]: [...list, payload.new] }
  }
  if (payload.eventType === 'UPDATE') {
    return { ...state, [key]: list.map((r) => (r.id === payload.new.id ? payload.new : r)) }
  }
  if (payload.eventType === 'DELETE') {
    return { ...state, [key]: list.filter((r) => r.id !== payload.old.id) }
  }
  return state
}

// Live session state (session row + participants + responses + moves), kept
// in sync via one Realtime channel — the fetch is the only read; everything
// after that arrives as a Postgres Changes event, no polling.
export function useWorkshopSession(sessionId) {
  const [state, setState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!sessionId) return
    let unsub
    let cancelled = false
    setLoading(true)
    fetchSessionState(sessionId)
      .then((s) => {
        if (cancelled) return
        setState(s)
        setLoading(false)
        unsub = subscribeToSession(sessionId, {
          onSession: (p) => setState((s2) => s2 && { ...s2, session: p.eventType === 'DELETE' ? s2.session : p.new }),
          onParticipant: (p) => setState((s2) => s2 && upsertList(s2, 'participants', p)),
          onResponse: (p) => setState((s2) => s2 && upsertList(s2, 'responses', p)),
          onMove: (p) => setState((s2) => s2 && upsertList(s2, 'moves', p)),
        })
      })
      .catch((e) => { if (!cancelled) { setError(e); setLoading(false) } })
    return () => { cancelled = true; if (unsub) unsub() }
  }, [sessionId])

  return { session: state?.session, participants: state?.participants ?? [], responses: state?.responses ?? [], moves: state?.moves ?? [], loading, error }
}
