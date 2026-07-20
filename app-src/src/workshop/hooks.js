import { useEffect, useState } from 'react'

// Seconds elapsed since `key` last changed — used for the facilitator bar's
// per-phase timer, resetting whenever the phase itself changes.
export function useElapsedSeconds(key) {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    setSeconds(0)
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [key])
  return seconds
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}
