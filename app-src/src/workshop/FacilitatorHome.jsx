import { useState } from 'react'
import { createSession } from './api'
import HeroContours from './components/HeroContours'

const DEFAULT_MINUTES = { opening: 10, calibration: 15, deepdive: 40, prioritization: 25 }

export default function FacilitatorHome({ strings, lang, onCreated }) {
  const [name, setName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [contextNote, setContextNote] = useState('')
  const [minutes, setMinutes] = useState(DEFAULT_MINUTES)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim() || busy) return
    setBusy(true)
    setError('')
    try {
      const session = await createSession(name.trim(), lang, { companyName: companyName.trim(), contextNote: contextNote.trim(), phaseMinutes: minutes })
      onCreated(session)
    } catch (err) {
      setError(String(err.message || err))
      setBusy(false)
    }
  }

  function handleJoinPrompt(e) {
    e.preventDefault()
    const code = window.prompt(strings.wsJoinCodePlaceholder)
    if (code) {
      const url = new URL(window.location.href)
      url.searchParams.set('code', code.trim().toUpperCase())
      window.location.href = url.toString()
    }
  }

  const inputStyle = {
    width: '100%', boxSizing: 'border-box', padding: '13px 14px', borderRadius: 'var(--ws-radius-sm)',
    border: '1.5px solid var(--ws-border-soft)', fontSize: 15, fontFamily: 'inherit', background: '#fff', color: 'var(--ws-text-primary)',
  }
  const labelStyle = {
    display: 'block', fontFamily: 'var(--ws-font-mono)', fontSize: 11, letterSpacing: '0.1em', color: 'var(--ws-text-muted)',
    textTransform: 'uppercase', marginBottom: 8, marginTop: 18,
  }

  return (
    <div>
      {/* hero */}
      <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(180deg, var(--ws-bg-deep) 0%, var(--ws-bg-elevated) 100%)', padding: '72px 28px 96px' }}>
        <HeroContours />
        <div className="ws-hero-glow" style={{ top: -140, right: -120 }} aria-hidden="true" />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto' }}>
          <span
            className="ws-animate-fade"
            style={{
              display: 'inline-block', fontFamily: 'var(--ws-font-mono)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
              color: 'var(--ws-brand-bright)', border: '1px solid var(--ws-border-on-dark)', borderRadius: 20, padding: '6px 14px',
            }}
          >
            {strings.wsBrand}
          </span>
          <h1
            className="ws-animate-in"
            style={{ fontFamily: 'var(--ws-font-head)', fontWeight: 700, fontSize: 'clamp(32px,4.6vw,48px)', lineHeight: 1.1, letterSpacing: '-0.01em', color: 'var(--ws-text-on-dark)', margin: '20px 0 0' }}
          >
            {strings.wsHomeTitle}
          </h1>
          <p className="ws-animate-in" style={{ fontSize: 16.5, lineHeight: 1.6, color: 'var(--ws-text-muted-on-dark)', margin: '16px 0 0', maxWidth: '58ch' }}>
            {strings.wsHomeIntro}
          </p>

          <form
            onSubmit={handleCreate}
            className="ws-animate-in"
            style={{ marginTop: 34, background: 'var(--ws-surface)', borderRadius: 'var(--ws-radius-lg)', padding: 28, boxShadow: 'var(--ws-shadow-deep)' }}
          >
            <label style={{ ...labelStyle, marginTop: 0 }}>{strings.wsFacilitatorNameLabel}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={strings.wsFacilitatorNamePlaceholder} autoFocus style={inputStyle} />

            <label style={labelStyle}>{strings.wsCompanyNameLabel}</label>
            <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder={strings.wsCompanyNamePlaceholder} style={inputStyle} />

            <label style={labelStyle}>{strings.wsContextNoteLabel}</label>
            <textarea value={contextNote} onChange={(e) => setContextNote(e.target.value)} placeholder={strings.wsContextNotePlaceholder} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />

            <label style={labelStyle}>{strings.wsPhaseMinutesLabel}</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {['opening', 'calibration', 'deepdive', 'prioritization'].map((phase) => (
                <div key={phase} style={{ flex: '1 1 100px' }}>
                  <div style={{ fontSize: 11.5, color: 'var(--ws-text-muted)', marginBottom: 4 }}>{strings[`wsPhase${phase[0].toUpperCase()}${phase.slice(1)}`]}</div>
                  <input
                    type="number" min={1} max={180} value={minutes[phase]} aria-label={strings[`wsPhase${phase[0].toUpperCase()}${phase.slice(1)}`]}
                    onChange={(e) => setMinutes((m) => ({ ...m, [phase]: Math.max(1, Number(e.target.value) || 1) }))}
                    style={{ ...inputStyle, padding: '9px 10px' }}
                  />
                </div>
              ))}
            </div>

            {error && <p style={{ color: '#B3432F', fontSize: 13, marginTop: 10 }}>{error}</p>}
            <button
              type="submit" disabled={busy || !name.trim()}
              style={{
                marginTop: 20, width: '100%', padding: '15px 26px', border: 'none', borderRadius: 'var(--ws-radius-sm)',
                background: busy ? '#8a978f' : 'var(--ws-brand)', color: '#fff', fontFamily: 'var(--ws-font-head)', fontWeight: 600, fontSize: 15,
                cursor: busy ? 'default' : 'pointer', transition: 'background 180ms',
              }}
            >
              {busy ? strings.wsCreating : strings.wsCreateSession}
            </button>
          </form>

          <div className="ws-animate-fade" style={{ marginTop: 22, display: 'flex', alignItems: 'baseline', gap: 10, fontSize: 13.5, color: 'var(--ws-text-muted-on-dark)' }}>
            <span>{strings.wsHaveCodeAlready}</span>
            <a href="#" onClick={handleJoinPrompt} style={{ color: 'var(--ws-brand-bright)', fontWeight: 600, textDecoration: 'none' }}>
              {strings.wsGoJoin}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
