import { useEffect, useState } from 'react'
import { fetchOrgChart, fetchOrgRollupData, createOrgUnit, renameOrgUnit, deleteOrgUnit } from './orgApi'
import OrgCanvas from './components/OrgCanvas'

const cardStyle = { background: '#fff', border: '1px solid var(--ws-border-soft)', borderRadius: 'var(--ws-radius-lg)', boxShadow: 'var(--ws-shadow-soft)', padding: 24 }
const h2Style = { fontFamily: 'var(--ws-font-head)', fontWeight: 700, fontSize: 'clamp(22px,2.8vw,28px)', margin: '8px 0 6px', letterSpacing: '-0.01em' }
const bodyMuted = { fontSize: 14.5, lineHeight: 1.6, color: 'var(--ws-text-muted)', maxWidth: '68ch' }
const iconBtn = { width: 30, height: 30, border: '1px solid var(--ws-border-soft)', borderRadius: 7, background: '#fff', fontSize: 13.5, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }

function statusPill(strings, unit, participantsBySession) {
  const list = participantsBySession[unit.session_id] || []
  const answered = list.filter((p) => Object.keys(p.answers || {}).length > 0).length
  if (list.length === 0) return { text: strings.wsOrgStatusEmpty, tone: 'muted' }
  if (answered === 0) return { text: strings.wsOrgStatusJoined(list.length), tone: 'muted' }
  return { text: strings.wsOrgStatusAnswering(answered, list.length), tone: 'active' }
}

function joinUrlFor(lang, session) {
  if (!session) return ''
  return `${window.location.origin}${window.location.pathname.replace(/workshop(\.de)?\.html$/, `workshop${lang === 'de' ? '.de' : ''}.html`)}?code=${session.code}`
}

export default function OrgChartBuilder({ strings, lang, orgId }) {
  const [org, setOrg] = useState(null)
  const [units, setUnits] = useState([])
  const [sessionsById, setSessionsById] = useState({})
  const [participantsBySession, setParticipantsBySession] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const verifiedKey = `twinclimb_org_verified_${orgId}`
  const [verified, setVerified] = useState(() => { try { return localStorage.getItem(verifiedKey) === '1' } catch (e) { return false } })
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)

  async function load() {
    try {
      const [o, rollup] = await Promise.all([fetchOrgChart(orgId), fetchOrgRollupData(orgId)])
      setOrg(o)
      setUnits(rollup.units)
      setSessionsById(rollup.sessionsById)
      setParticipantsBySession(rollup.participantsBySession)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // Departments join and answer at their own pace over hours/days, not in
    // one live room -- a light periodic refetch keeps status pills current
    // without the complexity of subscribing to a realtime channel per unit.
    const t = setInterval(load, 15000)
    return () => clearInterval(t)
  }, [orgId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAddChild(parentUnit) {
    const name = window.prompt(strings.wsOrgUnitNamePlaceholder)
    if (!name || !name.trim()) return
    setBusyId(parentUnit.id)
    try {
      await createOrgUnit(org, parentUnit.id, name.trim())
      await load()
    } finally {
      setBusyId(null)
    }
  }

  async function handleRename(unit) {
    const name = window.prompt(strings.wsOrgRename, unit.name)
    if (!name || !name.trim() || name.trim() === unit.name) return
    setBusyId(unit.id)
    try {
      await renameOrgUnit(unit.id, name.trim())
      await load()
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(unit) {
    if (!window.confirm(strings.wsOrgConfirmDelete(unit.name))) return
    setBusyId(unit.id)
    try {
      await deleteOrgUnit(unit.id)
      await load()
    } finally {
      setBusyId(null)
    }
  }

  function handleCopy(unit, session) {
    const url = joinUrlFor(lang, session)
    if (!url) return
    navigator.clipboard?.writeText(url).then(() => { setCopiedId(unit.id); setTimeout(() => setCopiedId(null), 1800) })
  }

  if (loading) return <p style={{ padding: 60, color: 'var(--ws-text-muted)', textAlign: 'center' }}>…</p>
  if (error || !org) return <p style={{ padding: 60, color: '#B3432F', textAlign: 'center' }}>{strings.wsNoSession}</p>

  if (!verified) {
    const submitPin = (e) => {
      e.preventDefault()
      if (pin === org.facilitator_pin) {
        try { localStorage.setItem(verifiedKey, '1') } catch (err) {}
        setVerified(true)
      } else {
        setPinError(true)
      }
    }
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <form onSubmit={submitPin} style={{ ...cardStyle, maxWidth: 360, width: '100%', textAlign: 'center' }}>
          <p style={{ fontSize: 14.5, color: 'var(--ws-text-muted)', marginBottom: 14 }}>{strings.wsPinPrompt}</p>
          <input
            value={pin} onChange={(e) => { setPin(e.target.value); setPinError(false) }} placeholder={strings.wsPinPlaceholder} autoFocus
            style={{ width: '100%', boxSizing: 'border-box', padding: '13px 14px', borderRadius: 'var(--ws-radius-sm)', border: '1.5px solid var(--ws-border-soft)', fontSize: 20, textAlign: 'center', letterSpacing: '0.3em', fontFamily: 'var(--ws-font-mono)' }}
          />
          {pinError && <p style={{ color: '#B3432F', fontSize: 13, marginTop: 10 }}>{strings.wsPinWrong}</p>}
          <button type="submit" style={{ marginTop: 16, width: '100%', padding: '13px 22px', border: 'none', borderRadius: 'var(--ws-radius-sm)', background: 'var(--ws-brand)', color: '#fff', fontFamily: 'var(--ws-font-head)', fontWeight: 600, fontSize: 14 }}>
            {strings.wsPinSubmit}
          </button>
        </form>
      </div>
    )
  }

  const root = units.find((u) => !u.parent_unit_id)

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 28px 100px' }}>
      <div style={{ fontFamily: 'var(--ws-font-mono)', fontSize: 11.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ws-text-muted)' }}>{strings.wsOrgKicker}</div>
      <h2 style={h2Style}>{org.name}</h2>
      <p style={bodyMuted}>{strings.wsOrgBuilderIntro}</p>

      <div style={{ marginTop: 24 }}>
        <OrgCanvas
          units={units}
          boxWidth={220}
          boxHeight={142}
          renderNode={(unit) => {
            const session = sessionsById[unit.session_id]
            const pill = statusPill(strings, unit, participantsBySession)
            const isRoot = unit.id === root?.id
            const busy = busyId === unit.id
            return (
              <div style={{ border: `1px solid ${isRoot ? 'var(--ws-brand)' : 'var(--ws-border-soft)'}`, borderRadius: 'var(--ws-radius-md)', padding: '12px 13px', background: isRoot ? 'var(--ws-brand-tint,#eef7f4)' : '#fff', height: '100%', boxSizing: 'border-box', boxShadow: 'var(--ws-shadow-soft)' }}>
                <div style={{ fontFamily: 'var(--ws-font-head)', fontWeight: 700, fontSize: 14, lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {unit.name}
                </div>
                {isRoot && <div style={{ fontFamily: 'var(--ws-font-mono)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--ws-brand-deep)', textTransform: 'uppercase', marginTop: 3 }}>{strings.wsOrgWholeOrgTag}</div>}
                <div style={{ fontSize: 11.5, marginTop: 6, color: pill.tone === 'active' ? 'var(--ws-brand-deep)' : 'var(--ws-text-muted)', fontWeight: pill.tone === 'active' ? 600 : 400 }}>
                  {pill.text}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                  <button type="button" onClick={() => handleCopy(unit, session)} disabled={!session} title={strings.wsOrgCopyLink} aria-label={strings.wsOrgCopyLink} style={iconBtn}>
                    {copiedId === unit.id ? '✓' : '⧉'}
                  </button>
                  <button type="button" onClick={() => handleAddChild(unit)} disabled={busy} title={strings.wsOrgAddUnit} aria-label={strings.wsOrgAddUnit} style={iconBtn}>+</button>
                  <button type="button" onClick={() => handleRename(unit)} disabled={busy} title={strings.wsOrgRename} aria-label={strings.wsOrgRename} style={iconBtn}>✎</button>
                  {!isRoot && (
                    <button type="button" onClick={() => handleDelete(unit)} disabled={busy} title={strings.wsOrgDelete} aria-label={strings.wsOrgDelete} style={{ ...iconBtn, color: '#B3432F' }}>×</button>
                  )}
                </div>
              </div>
            )
          }}
        />
      </div>

      <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <a
          href={`?orgview=${orgId}`}
          style={{ padding: '13px 24px', borderRadius: 'var(--ws-radius-sm)', background: 'var(--ws-brand)', color: '#fff', fontFamily: 'var(--ws-font-head)', fontWeight: 600, fontSize: 14.5, textDecoration: 'none' }}
        >
          {strings.wsOrgViewResults}
        </a>
        <span style={{ fontFamily: 'var(--ws-font-mono)', fontSize: 11.5, color: 'var(--ws-text-muted)' }}>{strings.wsPinDisplay(org.facilitator_pin)}</span>
      </div>
    </div>
  )
}
