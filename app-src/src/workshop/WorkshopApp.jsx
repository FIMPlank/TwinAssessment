import { useEffect, useState } from 'react'
import { STRINGS } from '../i18n'
import FacilitatorHome from './FacilitatorHome'
import FacilitatorRoom from './FacilitatorRoom'
import ParticipantJoin from './ParticipantJoin'
import ParticipantRoom from './ParticipantRoom'

function useQueryParam(name) {
  const [value, setValue] = useState(() => new URLSearchParams(window.location.search).get(name))
  useEffect(() => {
    const onPop = () => setValue(new URLSearchParams(window.location.search).get(name))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [name])
  return value
}

function setQueryParam(name, value) {
  const url = new URL(window.location.href)
  if (value) url.searchParams.set(name, value)
  else url.searchParams.delete(name)
  window.history.replaceState({}, '', url)
}

const C = { ink: '#17191C', line: '#E3E7E5' }

export default function WorkshopApp({ lang }) {
  const strings = STRINGS[lang]
  const code = useQueryParam('code')
  const facilitateId = useQueryParam('facilitate')

  const [participant, setParticipant] = useState(null) // { id, name, sessionId } once joined
  const [facilitatorSessionId, setFacilitatorSessionId] = useState(facilitateId)

  // Resume a participant identity for this join code from a prior visit
  // (page refresh mid-workshop), so re-joining never creates a duplicate.
  useEffect(() => {
    if (!code) return
    try {
      const saved = JSON.parse(localStorage.getItem(`twinclimb_ws_participant_${code}`) || 'null')
      if (saved) setParticipant(saved)
    } catch (e) {}
  }, [code])

  function onCreatedSession(session) {
    setFacilitatorSessionId(session.id)
    setQueryParam('facilitate', session.id)
    try { localStorage.setItem('twinclimb_ws_last_facilitated', JSON.stringify({ id: session.id, code: session.code })) } catch (e) {}
  }

  function onJoined(p, sessionId) {
    const record = { id: p.id, name: p.name, sessionId }
    setParticipant(record)
    try { localStorage.setItem(`twinclimb_ws_participant_${code}`, JSON.stringify(record)) } catch (e) {}
  }

  let body
  if (code) {
    body = participant
      ? <ParticipantRoom strings={strings} lang={lang} code={code} participant={participant} />
      : <ParticipantJoin strings={strings} lang={lang} code={code} onJoined={onJoined} />
  } else if (facilitatorSessionId) {
    body = <FacilitatorRoom strings={strings} lang={lang} sessionId={facilitatorSessionId} />
  } else {
    body = <FacilitatorHome strings={strings} lang={lang} onCreated={onCreatedSession} />
  }

  const otherLangHref = (lang === 'de' ? 'workshop.html' : 'workshop.de.html') + window.location.search

  return (
    <div style={{ minHeight: '100vh', background: '#F2F4F3', color: C.ink, fontFamily: "'IBM Plex Sans',sans-serif", WebkitFontSmoothing: 'antialiased' }}>
      <div data-print-hide="" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: `1px solid ${C.line}`, background: '#fff' }}>
        <a href={lang === 'de' ? 'workshop.de.html' : 'workshop.html'} style={{ display: 'flex', alignItems: 'baseline', gap: 12, textDecoration: 'none', color: C.ink }}>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: '0.1em' }}>{strings.wsBrand}</span>
        </a>
        <a href={otherLangHref} style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, letterSpacing: '0.06em', color: '#9A9A95', textDecoration: 'none' }}>
          {lang === 'de' ? 'EN' : 'DE'}
        </a>
      </div>
      {body}
    </div>
  )
}
