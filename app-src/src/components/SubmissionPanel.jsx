import { useEffect, useRef, useState } from 'react'
import { DIMENSIONS } from '../ttcmm'

const SUPABASE_URL = 'https://dzywbkiezpznowusvfyo.supabase.co'
const SUPABASE_KEY = 'sb_publishable_V6AwgFi2DUTZomfAY0IKNA_LVr4dOQJ'
const TABLE = 'assessments'
const COLLAPSE_KEY = 'twinclimb_panel_collapsed'

function scoresFor(effAnswers) {
  const vals = DIMENSIONS.map((d) => Number(effAnswers[d.id]) || 0)
  const per = {}
  DIMENSIONS.forEach((d, i) => { per[d.id] = vals[i] })
  return {
    min: Math.min(...vals),
    max: Math.max(...vals),
    avg: Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100,
    perDimension: per,
  }
}

function sigFor(clientName, answers, caps) {
  return JSON.stringify({ c: (clientName || '').trim(), a: answers || {}, caps: caps || {} })
}

export default function SubmissionPanel({ strings, clientName, answers, caps, effByDim, deepList }) {
  const [company, setCompany] = useState('')
  const [prefilled, setPrefilled] = useState(false)
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState({ text: '', color: '#6B6B66' })
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(COLLAPSE_KEY) === '1' } catch (e) { return false }
  })
  // Tracks the signature of the last successful submission. Once the answers
  // change, the current signature no longer matches and the button reverts
  // from "Submit again" to "Submit results" automatically — no extra effect needed.
  const [submittedSig, setSubmittedSig] = useState(null)
  const nameInputRef = useRef(null)
  const tabRef = useRef(null)

  // Prefill the company field from the client-name entered on the intro
  // screen, once — mirrors the old panel's one-time prefill-on-mount.
  useEffect(() => {
    if (!prefilled && clientName) { setCompany(clientName); setPrefilled(true) }
  }, [clientName, prefilled])

  const isComplete = DIMENSIONS.every((d) => (answers[d.id] !== undefined && answers[d.id] !== null) || deepList.includes(d.id))
  const sig = sigFor(clientName, answers, caps)
  const submitted = submittedSig !== null && submittedSig === sig

  function setCollapsedPersist(next) {
    setCollapsed(next)
    try { localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0') } catch (e) {}
  }
  function collapse() {
    setCollapsedPersist(true)
    requestAnimationFrame(() => tabRef.current && tabRef.current.focus())
  }
  function expand() {
    setCollapsedPersist(false)
    requestAnimationFrame(() => nameInputRef.current && nameInputRef.current.focus())
  }

  async function submit() {
    if (busy) return
    if (!isComplete) { setMsg({ text: strings.panelErrIncomplete, color: '#9A2B2B' }); return }
    const companyTrimmed = (company || '').trim()
    if (!companyTrimmed) { setMsg({ text: strings.panelErrNoCompany, color: '#9A2B2B' }); nameInputRef.current && nameInputRef.current.focus(); return }

    const s = scoresFor(effByDim)
    const payload = {
      company_name: companyTrimmed,
      contact_email: (email || '').trim() || null,
      answers: effByDim,
      scores: s,
      overall_stage: s.min,
      caps: caps || {},
      deep: deepList || [],
      app_version: 'twinclimb_v2',
    }

    setBusy(true)
    setMsg({ text: strings.panelSubmitting, color: '#6B6B66' })
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(payload),
      })
      if (r.ok) {
        setSubmittedSig(sig)
        setMsg({ text: strings.panelSuccess, color: '#179C7D' })
      } else {
        const t = await r.text().catch(() => '')
        setMsg({ text: strings.panelFailed(r.status, (t || '').slice(0, 160)), color: '#9A2B2B' })
      }
    } catch (e) {
      setMsg({ text: strings.panelNetworkError, color: '#9A2B2B' })
    } finally {
      setBusy(false)
    }
  }

  if (!isComplete) return null

  const wrapStyle = {
    position: 'fixed', bottom: 20, right: 20, zIndex: 99998, width: 330, maxWidth: 'calc(100vw - 32px)',
    background: '#fff', border: '1px solid #E3E7E5', borderRadius: 14, boxShadow: '0 8px 30px rgba(0,0,0,.14)',
    fontFamily: "'IBM Plex Sans',-apple-system,BlinkMacSystemFont,sans-serif", color: '#17191C', overflow: 'hidden',
    transition: 'transform .28s cubic-bezier(.4,0,.2,1), opacity .2s ease',
    transform: collapsed ? 'translateX(150%)' : 'translateX(0)',
    opacity: collapsed ? 0 : 1,
    pointerEvents: collapsed ? 'none' : 'auto',
  }
  const tabStyle = {
    position: 'fixed', bottom: 20, right: 20, zIndex: 99998, border: '1px solid #E3E7E5', borderRadius: 999,
    background: '#17191C', color: '#fff', fontFamily: "'IBM Plex Mono',ui-monospace,monospace", fontSize: 11,
    letterSpacing: '0.06em', padding: '11px 18px', boxShadow: '0 6px 20px rgba(0,0,0,.16)', cursor: 'pointer',
    transition: 'transform .28s cubic-bezier(.4,0,.2,1), opacity .2s ease',
    transform: collapsed ? 'translateX(0)' : 'translateX(150%)',
    opacity: collapsed ? 1 : 0,
    pointerEvents: collapsed ? 'auto' : 'none',
  }

  return (
    <>
      <div id="__study_panel" data-print-hide="" aria-hidden={collapsed} style={wrapStyle}>
        <button
          id="__study_close"
          type="button" onClick={collapse} aria-label={strings.panelMinimize} title={strings.panelMinimize}
          style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, border: 'none', background: 'transparent', color: '#9A9A95', fontSize: 17, lineHeight: '24px', textAlign: 'center', cursor: 'pointer', padding: 0, borderRadius: 6 }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#F2F4F3'; e.currentTarget.style.color = '#17191C' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9A9A95' }}
        >
          &times;
        </button>
        <div style={{ padding: '15px 17px 14px' }}>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.16em', color: '#179C7D', textTransform: 'uppercase' }}>
            {strings.panelKicker}
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.5, color: '#41413D', margin: '7px 0 12px' }}>{strings.panelIntro}</div>
          <label style={{ display: 'block', fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: '0.14em', color: '#9A9A95', textTransform: 'uppercase', marginBottom: 5 }}>
            {strings.panelCompanyLabel}
          </label>
          <input
            id="__study_name"
            ref={nameInputRef} value={company} onChange={(e) => setCompany(e.target.value)}
            placeholder={strings.panelCompanyPlaceholder}
            style={{ width: '100%', padding: '10px 11px', border: '1px solid #C6CBC8', borderRadius: 7, fontFamily: 'inherit', fontSize: 14, color: '#17191C', marginBottom: 10 }}
          />
          <label style={{ display: 'block', fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: '0.14em', color: '#9A9A95', textTransform: 'uppercase', marginBottom: 5 }}>
            {strings.panelEmailLabel}
          </label>
          <input
            id="__study_email"
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder={strings.panelEmailPlaceholder}
            style={{ width: '100%', padding: '10px 11px', border: '1px solid #C6CBC8', borderRadius: 7, fontFamily: 'inherit', fontSize: 14, color: '#17191C', marginBottom: 13 }}
          />
          <button
            id="__study_submit"
            onClick={submit} disabled={busy}
            style={{ width: '100%', padding: '12px 16px', border: 'none', borderRadius: 7, background: '#17191C', color: '#fff', fontFamily: "'Space Grotesk','IBM Plex Sans',sans-serif", fontWeight: 600, fontSize: 14, opacity: busy ? 0.6 : 1 }}
          >
            {submitted ? strings.panelSubmitAgain : strings.panelSubmit}
          </button>
          <div id="__study_msg" style={{ fontSize: 12.5, lineHeight: 1.5, marginTop: 11, minHeight: 1, color: msg.color }}>{msg.text}</div>
        </div>
      </div>
      <button
        ref={tabRef} id="__study_tab" type="button" data-print-hide=""
        aria-label={strings.panelReopen} title={strings.panelReopen} onClick={expand}
        style={tabStyle}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#2A2D31' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#17191C' }}
      >
        {strings.panelTabLabel}
      </button>
    </>
  )
}
