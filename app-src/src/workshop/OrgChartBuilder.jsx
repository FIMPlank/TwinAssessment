import { useEffect, useState } from 'react'
import { fetchOrgChart, fetchOrgRollupData, createOrgUnit, renameOrgUnit, deleteOrgUnit } from './orgApi'
import { buildUnitTree, topLevelUnits } from './orgRollup'

const cardStyle = { background: '#fff', border: '1px solid var(--ws-border-soft)', borderRadius: 'var(--ws-radius-lg)', boxShadow: 'var(--ws-shadow-soft)', padding: 24 }
const h2Style = { fontFamily: 'var(--ws-font-head)', fontWeight: 700, fontSize: 'clamp(22px,2.8vw,28px)', margin: '8px 0 6px', letterSpacing: '-0.01em' }
const bodyMuted = { fontSize: 14.5, lineHeight: 1.6, color: 'var(--ws-text-muted)', maxWidth: '68ch' }
const smallBtn = { padding: '7px 13px', border: '1px solid var(--ws-border-soft)', borderRadius: 'var(--ws-radius-sm)', background: '#fff', fontFamily: 'var(--ws-font-head)', fontWeight: 600, fontSize: 12.5, cursor: 'pointer' }

function statusPill(strings, unit, participantsBySession) {
  const n = (participantsBySession[unit.session_id] || []).length
  const answered = (participantsBySession[unit.session_id] || []).filter((p) => Object.keys(p.answers || {}).length > 0).length
  if (n === 0) return { text: strings.wsOrgStatusEmpty, tone: 'muted' }
  if (answered === 0) return { text: strings.wsOrgStatusJoined(n), tone: 'muted' }
  return { text: strings.wsOrgStatusAnswering(answered, n), tone: 'active' }
}

function UnitNode({ strings, lang, org, unit, byParent, sessionsById, participantsBySession, depth, isRoot, onChanged }) {
  const [addingChild, setAddingChild] = useState(false)
  const [childName, setChildName] = useState('')
  const [renaming, setRenaming] = useState(false)
  const [name, setName] = useState(unit.name)
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)

  const children = byParent[unit.id] || []
  const session = sessionsById[unit.session_id]
  const pill = statusPill(strings, unit, participantsBySession)
  const joinUrl = session
    ? `${window.location.origin}${window.location.pathname.replace(/workshop(\.de)?\.html$/, `workshop${lang === 'de' ? '.de' : ''}.html`)}?code=${session.code}`
    : ''

  async function submitChild(e) {
    e.preventDefault()
    if (!childName.trim() || busy) return
    setBusy(true)
    try {
      await createOrgUnit(org, unit.id, childName.trim())
      setChildName('')
      setAddingChild(false)
      await onChanged()
    } finally {
      setBusy(false)
    }
  }

  async function submitRename(e) {
    e.preventDefault()
    if (!name.trim() || busy) return
    setBusy(true)
    try {
      await renameOrgUnit(unit.id, name.trim())
      setRenaming(false)
      await onChanged()
    } finally {
      setBusy(false)
    }
  }

  async function removeUnit() {
    if (!window.confirm(strings.wsOrgConfirmDelete(unit.name))) return
    setBusy(true)
    try {
      await deleteOrgUnit(unit.id)
      await onChanged()
    } finally {
      setBusy(false)
    }
  }

  function copyLink() {
    navigator.clipboard?.writeText(joinUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800) })
  }

  return (
    <div style={{ marginLeft: depth ? 22 : 0, marginTop: depth ? 12 : 0 }}>
      <div style={{ border: '1px solid var(--ws-border-soft)', borderRadius: 'var(--ws-radius-md)', padding: '14px 16px', background: depth ? 'var(--ws-bg-soft)' : '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0 }}>
            {renaming ? (
              <form onSubmit={submitRename} style={{ display: 'flex', gap: 6 }}>
                <input value={name} onChange={(e) => setName(e.target.value)} autoFocus style={{ padding: '6px 9px', border: '1.5px solid var(--ws-border-soft)', borderRadius: 6, fontSize: 14, fontFamily: 'inherit' }} />
                <button type="submit" style={smallBtn}>{strings.wsOrgSave}</button>
                <button type="button" onClick={() => { setRenaming(false); setName(unit.name) }} style={{ ...smallBtn, border: 'none' }}>{strings.wsOrgCancel}</button>
              </form>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--ws-font-head)', fontWeight: 700, fontSize: isRoot ? 17 : 15 }}>{unit.name}</span>
                {isRoot && <span style={{ fontFamily: 'var(--ws-font-mono)', fontSize: 9.5, letterSpacing: '0.1em', color: 'var(--ws-brand-deep)', textTransform: 'uppercase' }}>{strings.wsOrgWholeOrgTag}</span>}
              </div>
            )}
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
              <span style={{ color: pill.tone === 'active' ? 'var(--ws-brand-deep)' : 'var(--ws-text-muted)', fontWeight: pill.tone === 'active' ? 600 : 400 }}>{pill.text}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            <button type="button" onClick={copyLink} disabled={!session} style={smallBtn}>{copied ? strings.wsOrgCopied : strings.wsOrgCopyLink}</button>
            <button type="button" onClick={() => setAddingChild((v) => !v)} style={smallBtn}>{strings.wsOrgAddUnit}</button>
            {!renaming && <button type="button" onClick={() => setRenaming(true)} style={smallBtn}>{strings.wsOrgRename}</button>}
            {!isRoot && <button type="button" onClick={removeUnit} style={{ ...smallBtn, color: '#B3432F' }}>{strings.wsOrgDelete}</button>}
          </div>
        </div>
        {addingChild && (
          <form onSubmit={submitChild} style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              value={childName} onChange={(e) => setChildName(e.target.value)} placeholder={strings.wsOrgUnitNamePlaceholder} autoFocus
              style={{ flex: '1 1 200px', padding: '9px 11px', border: '1.5px solid var(--ws-border-soft)', borderRadius: 'var(--ws-radius-sm)', fontSize: 14, fontFamily: 'inherit' }}
            />
            <button type="submit" disabled={busy || !childName.trim()} style={{ ...smallBtn, background: 'var(--ws-brand)', color: '#fff', border: 'none' }}>{strings.wsOrgAdd}</button>
          </form>
        )}
      </div>
      {children.map((child) => (
        <UnitNode
          key={child.id} strings={strings} lang={lang} org={org} unit={child} byParent={byParent}
          sessionsById={sessionsById} participantsBySession={participantsBySession} depth={depth + 1} isRoot={false} onChanged={onChanged}
        />
      ))}
    </div>
  )
}

export default function OrgChartBuilder({ strings, lang, orgId }) {
  const [org, setOrg] = useState(null)
  const [units, setUnits] = useState([])
  const [sessionsById, setSessionsById] = useState({})
  const [participantsBySession, setParticipantsBySession] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
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

  const byParent = buildUnitTree(units)
  const root = topLevelUnits(units)[0]

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 28px 100px' }}>
      <div style={{ fontFamily: 'var(--ws-font-mono)', fontSize: 11.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ws-text-muted)' }}>{strings.wsOrgKicker}</div>
      <h2 style={h2Style}>{org.name}</h2>
      <p style={bodyMuted}>{strings.wsOrgBuilderIntro}</p>

      {root && (
        <div style={{ marginTop: 24 }}>
          <UnitNode
            strings={strings} lang={lang} org={org} unit={root} byParent={byParent} sessionsById={sessionsById}
            participantsBySession={participantsBySession} depth={0} isRoot onChanged={load}
          />
        </div>
      )}

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
