import { useEffect, useState } from 'react'
import { fetchSessionByCode, joinAsParticipant } from './api'

const C = { ink: '#17191C', sub: '#6B6B66', mut: '#9A9A95', line: '#E3E7E5' }

export default function ParticipantJoin({ strings, lang, code, onJoined }) {
  const [session, setSession] = useState(undefined) // undefined = loading, null = not found
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSessionByCode(code).then(setSession).catch(() => setSession(null))
  }, [code])

  async function handleJoin(e) {
    e.preventDefault()
    if (!name.trim()) { setError(strings.wsJoinMissingName); return }
    setBusy(true)
    setError('')
    try {
      const p = await joinAsParticipant(session.id, name.trim())
      onJoined(p, session.id)
    } catch (err) {
      setError(String(err.message || err))
      setBusy(false)
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '64px 24px 100px' }}>
      <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 28, margin: 0 }}>{strings.wsJoinTitle}</h1>

      {session === undefined && <p style={{ color: C.mut, marginTop: 20 }}>…</p>}
      {session === null && <p style={{ color: '#9A2B2B', marginTop: 20 }}>{strings.wsJoinInvalidCode}</p>}
      {session && session.phase !== 'prework' && (
        <div style={{ marginTop: 20 }}>
          <p style={{ fontWeight: 600, fontSize: 15 }}>{strings.wsJoiningLockedTitle}</p>
          <p style={{ color: C.sub, fontSize: 13.5, marginTop: 8 }}>{strings.wsJoiningLockedBody}</p>
        </div>
      )}

      {session && session.phase === 'prework' && (
        <form onSubmit={handleJoin} style={{ marginTop: 24 }}>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '0.1em', color: C.mut, marginBottom: 16 }}>{strings.wsJoinCodeLabel}: {session.code}</div>
          <label style={{ display: 'block', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '0.1em', color: C.mut, textTransform: 'uppercase', marginBottom: 8 }}>
            {strings.wsJoinNameLabel}
          </label>
          <input
            value={name} onChange={(e) => setName(e.target.value)} placeholder={strings.wsJoinNamePlaceholder} autoFocus
            style={{ width: '100%', boxSizing: 'border-box', padding: '13px 14px', borderRadius: 8, border: `1.5px solid ${C.line}`, fontSize: 15, fontFamily: 'inherit' }}
          />
          {error && <p style={{ color: '#9A2B2B', fontSize: 13, marginTop: 10 }}>{error}</p>}
          <button type="submit" disabled={busy} style={{ marginTop: 16, width: '100%', padding: '14px 22px', border: 'none', borderRadius: 7, background: busy ? '#9A9A95' : C.ink, color: '#fff', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 15 }}>
            {busy ? strings.wsJoining : strings.wsJoinBtn}
          </button>
        </form>
      )}
    </div>
  )
}
