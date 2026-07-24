import { useEffect, useState } from 'react'
import { STRINGS } from '../i18n'
import WorkshopShell from './components/WorkshopShell'
import FacilitatorHome from './FacilitatorHome'
import FacilitatorRoom from './FacilitatorRoom'
import ParticipantJoin from './ParticipantJoin'
import ParticipantRoom from './ParticipantRoom'
import OrgChartHome from './OrgChartHome'
import OrgChartBuilder from './OrgChartBuilder'
import OrgRollupView from './OrgRollupView'

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

export default function WorkshopApp({ lang }) {
  const strings = STRINGS[lang]
  const code = useQueryParam('code')
  const facilitateId = useQueryParam('facilitate')
  const orgViewId = useQueryParam('orgview')
  const newOrg = useQueryParam('neworg')
  const orgIdParam = useQueryParam('org')

  const [participant, setParticipant] = useState(null) // { id, name, sessionId } once joined
  const [facilitatorSessionId, setFacilitatorSessionId] = useState(facilitateId)
  const [orgId, setOrgId] = useState(orgIdParam)

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
    try {
      localStorage.setItem('twinclimb_ws_last_facilitated', JSON.stringify({ id: session.id, code: session.code }))
      localStorage.setItem(`twinclimb_ws_fac_verified_${session.id}`, '1')
    } catch (e) {}
  }

  function onJoined(p, sessionId) {
    const record = { id: p.id, name: p.name, sessionId }
    setParticipant(record)
    try { localStorage.setItem(`twinclimb_ws_participant_${code}`, JSON.stringify(record)) } catch (e) {}
  }

  function onOrgCreated(org) {
    setOrgId(org.id)
    setQueryParam('neworg', null)
    setQueryParam('org', org.id)
    try { localStorage.setItem(`twinclimb_org_verified_${org.id}`, '1') } catch (e) {}
  }

  let body
  if (code) {
    body = participant
      ? <ParticipantRoom strings={strings} lang={lang} code={code} participant={participant} />
      : <ParticipantJoin strings={strings} lang={lang} code={code} onJoined={onJoined} />
  } else if (orgViewId) {
    body = <OrgRollupView strings={strings} lang={lang} orgId={orgViewId} />
  } else if (orgId) {
    body = <OrgChartBuilder strings={strings} lang={lang} orgId={orgId} />
  } else if (newOrg) {
    body = <OrgChartHome strings={strings} lang={lang} onCreated={onOrgCreated} />
  } else if (facilitatorSessionId) {
    body = <FacilitatorRoom strings={strings} lang={lang} sessionId={facilitatorSessionId} />
  } else {
    body = <FacilitatorHome strings={strings} lang={lang} onCreated={onCreatedSession} />
  }

  return (
    <WorkshopShell strings={strings} lang={lang}>
      {body}
    </WorkshopShell>
  )
}
