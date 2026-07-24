import { useEffect, useState } from 'react'
import { DIMENSIONS } from '../ttcmm'
import { SHORT_LABEL } from '../i18n'
import { fetchOrgChart, fetchOrgRollupData } from './orgApi'
import { rollupOrg, integratedStage } from './orgRollup'
import UnitRadar from './components/UnitRadar'

const cardStyle = { background: '#fff', border: '1px solid var(--ws-border-soft)', borderRadius: 'var(--ws-radius-lg)', boxShadow: 'var(--ws-shadow-soft)', padding: 24 }

function DeptNode({ strings, lang, node, depth }) {
  const SHORT = SHORT_LABEL[lang]
  const stage = integratedStage(node.stages, DIMENSIONS)
  return (
    <div style={{ marginLeft: depth ? 20 : 0, marginTop: 14 }}>
      <div style={{ border: '1px solid var(--ws-border-soft)', borderRadius: 'var(--ws-radius-md)', padding: 18, background: depth ? 'var(--ws-bg-soft)' : '#fff', display: 'grid', gridTemplateColumns: '1fr 160px', gap: 16, alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'var(--ws-font-head)', fontWeight: 700, fontSize: 15.5 }}>{node.unit.name}</div>
          <div style={{ fontFamily: 'var(--ws-font-mono)', fontSize: 11.5, color: 'var(--ws-text-muted)', marginTop: 4 }}>
            {node.participantCount === 0 ? strings.wsOrgStatusEmpty : strings.wsOrgParticipants(node.participantCount)}
          </div>
          <div style={{ fontFamily: 'var(--ws-font-head)', fontWeight: 600, fontSize: 14.5, marginTop: 8, color: stage === null ? 'var(--ws-text-muted)' : 'var(--ws-brand-deep)' }}>
            {stage === null ? strings.wsOrgNoDataYet : `${strings.wsOrgStageLabel} ${stage} · ${SHORT[stage]}`}
          </div>
        </div>
        <UnitRadar lang={lang} dims={DIMENSIONS} stages={node.stages} size={140} showLabels={false} emptyLabel={strings.wsNoPreworkYet} />
      </div>
      {node.children.map((child) => (
        <DeptNode key={child.unit.id} strings={strings} lang={lang} node={child} depth={depth + 1} />
      ))}
    </div>
  )
}

export default function OrgRollupView({ strings, lang, orgId }) {
  const [org, setOrg] = useState(null)
  const [rollup, setRollup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const verifiedKey = `twinclimb_org_verified_${orgId}`
  const [verified, setVerified] = useState(() => { try { return localStorage.getItem(verifiedKey) === '1' } catch (e) { return false } })
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchOrgChart(orgId), fetchOrgRollupData(orgId)])
      .then(([o, data]) => {
        if (cancelled) return
        setOrg(o)
        setRollup(rollupOrg(data.units, data.participantsBySession, DIMENSIONS))
      })
      .catch((e) => { if (!cancelled) setError(e) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [orgId])

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

  const SHORT = SHORT_LABEL[lang]
  const root = rollup[0]
  const rootStage = root ? integratedStage(root.stages, DIMENSIONS) : null

  return (
    <div style={{ maxWidth: 940, margin: '0 auto', padding: '36px 28px 100px' }}>
      <div style={{ fontFamily: 'var(--ws-font-mono)', fontSize: 11.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ws-text-muted)' }}>{strings.wsOrgRollupKicker}</div>
      <h2 style={{ fontFamily: 'var(--ws-font-head)', fontWeight: 700, fontSize: 'clamp(26px,3.4vw,36px)', margin: '8px 0 6px', letterSpacing: '-0.01em' }}>{org.name}</h2>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--ws-text-muted)', maxWidth: '68ch' }}>{strings.wsOrgRollupIntro}</p>

      {root && (
        <div style={{ ...cardStyle, marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'var(--ws-font-mono)', fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ws-text-muted)' }}>{strings.wsOrgWholeOrgTag}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 8 }}>
              <span style={{ fontFamily: 'var(--ws-font-head)', fontWeight: 700, fontSize: 48, lineHeight: 1, color: rootStage === null ? 'var(--ws-text-muted)' : 'var(--ws-brand-deep)' }}>
                {rootStage === null ? '–' : rootStage}
              </span>
              <span style={{ fontFamily: 'var(--ws-font-head)', fontWeight: 600, fontSize: 17 }}>{rootStage === null ? strings.wsOrgNoDataYet : SHORT[rootStage]}</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--ws-text-muted)', marginTop: 10 }}>{strings.wsOrgParticipants(root.participantCount)}</p>
          </div>
          <UnitRadar lang={lang} dims={DIMENSIONS} stages={root.stages} size={220} emptyLabel={strings.wsNoPreworkYet} />
        </div>
      )}

      {root && root.children.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <h3 style={{ fontFamily: 'var(--ws-font-head)', fontWeight: 600, fontSize: 18, margin: '0 0 4px' }}>{strings.wsOrgByDepartment}</h3>
          {root.children.map((child) => (
            <DeptNode key={child.unit.id} strings={strings} lang={lang} node={child} depth={0} />
          ))}
        </div>
      )}
    </div>
  )
}
