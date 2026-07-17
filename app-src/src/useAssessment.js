import { useState, useEffect, useMemo } from 'react'
import { DIMENSIONS, deriveForDim, isDeepAssessed, effectiveStage, pathwayFor } from './ttcmm'

const LS_KEY = 'twinclimb_v1'

function loadInitial() {
  try {
    const s = JSON.parse(localStorage.getItem(LS_KEY) || '{}')
    return {
      step: s.step ?? 0,
      answers: s.answers ?? {},
      caps: s.caps ?? {},
      clientName: s.clientName ?? '',
    }
  } catch (e) {
    return { step: 0, answers: {}, caps: {}, clientName: '' }
  }
}

export function useAssessment() {
  const [state, setState] = useState(loadInitial)
  const [deepOpen, setDeepOpen] = useState({})

  const derived = useMemo(() => {
    const effByDim = {}
    const deepList = []
    DIMENSIONS.forEach((d) => {
      effByDim[d.id] = effectiveStage(d, state.caps, state.answers)
      if (isDeepAssessed(d, state.caps)) deepList.push(d.id)
    })
    const pathway = pathwayFor(state.caps, state.answers)
    return { effByDim, deepList, pathway }
  }, [state.caps, state.answers])

  // Persisted every render (mirrors the old bundle's componentDidMount +
  // componentDidUpdate save() calls) so the effective/deep cache in
  // localStorage is never stale, even on a freshly-loaded page.
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        step: state.step,
        answers: state.answers,
        caps: state.caps,
        clientName: state.clientName,
        eff: derived.effByDim,
        deep: derived.deepList,
      }))
    } catch (e) {}
  })

  function go(step) {
    setState((s) => ({ ...s, step }))
    window.scrollTo(0, 0)
  }
  function selectStage(id, val) {
    setState((s) => ({ ...s, answers: { ...s.answers, [id]: val } }))
  }
  function setCap(cid, val) {
    setState((s) => ({ ...s, caps: { ...s.caps, [cid]: val } }))
  }
  function toggleDeep(id) {
    setDeepOpen((s) => ({ ...s, [id]: !s[id] }))
  }
  function restart() {
    setState((s) => ({ ...s, answers: {}, step: 0 }))
    window.scrollTo(0, 0)
  }
  function setClientName(name) {
    setState((s) => ({ ...s, clientName: name }))
  }

  return { state, deepOpen, derived, go, selectStage, setCap, toggleDeep, restart, setClientName, deriveForDim }
}
