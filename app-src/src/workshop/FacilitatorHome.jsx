import { useState } from 'react'
import { createSession } from './api'

const C = { ink: '#17191C', sub: '#6B6B66', mut: '#9A9A95', line: '#E3E7E5' }

export default function FacilitatorHome({ strings, lang, onCreated }) {
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim() || busy) return
    setBusy(true)
    setError('')
    try {
      const session = await createSession(name.trim(), lang)
      onCreated(session)
    } catch (err) {
      setError(String(err.message || err))
      setBusy(false)
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '64px 32px 120px' }}>
      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '0.18em', color: C.mut, textTransform: 'uppercase' }}>
        {strings.kicker}
      </div>
      <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 'clamp(28px,4vw,40px)', margin: '10px 0 0', letterSpacing: '-0.01em' }}>
        {strings.wsHomeTitle}
      </h1>
      <p style={{ fontSize: 15.5, lineHeight: 1.6, color: C.sub, margin: '14px 0 0', maxWidth: '68ch' }}>
        {strings.wsHomeIntro}
      </p>

      <form onSubmit={handleCreate} style={{ marginTop: 32, border: `1px solid ${C.line}`, borderRadius: 14, background: '#fff', padding: 26 }}>
        <label style={{ display: 'block', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '0.1em', color: C.mut, textTransform: 'uppercase', marginBottom: 8 }}>
          {strings.wsFacilitatorNameLabel}
        </label>
        <input
          value={name} onChange={(e) => setName(e.target.value)} placeholder={strings.wsFacilitatorNamePlaceholder} autoFocus
          style={{ width: '100%', boxSizing: 'border-box', padding: '13px 14px', borderRadius: 8, border: `1.5px solid ${C.line}`, fontSize: 15, fontFamily: 'inherit' }}
        />
        {error && <p style={{ color: '#9A2B2B', fontSize: 13, marginTop: 10 }}>{error}</p>}
        <button type="submit" disabled={busy || !name.trim()} style={{ marginTop: 18, padding: '13px 26px', border: 'none', borderRadius: 7, background: busy ? '#9A9A95' : C.ink, color: '#fff', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 14, cursor: busy ? 'default' : 'pointer' }}>
          {busy ? strings.wsCreating : strings.wsCreateSession}
        </button>
      </form>

      <div style={{ marginTop: 20, display: 'flex', alignItems: 'baseline', gap: 10, fontSize: 13.5, color: C.sub }}>
        <span>{strings.wsHaveCodeAlready}</span>
        <a href="#" onClick={(e) => { e.preventDefault(); const code = window.prompt(strings.wsJoinCodePlaceholder); if (code) { const url = new URL(window.location.href); url.searchParams.set('code', code.trim().toUpperCase()); window.location.href = url.toString() } }} style={{ color: C.ink, fontWeight: 600 }}>
          {strings.wsGoJoin}
        </a>
      </div>
    </div>
  )
}
