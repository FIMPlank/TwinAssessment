import { useState } from 'react'
import { addMove } from '../api'

const C = { ink: '#17191C', sub: '#6B6B66', mut: '#9A9A95', line: '#E3E7E5' }

export default function MoveBoard({ strings, sessionId, moves, editable }) {
  const [desc, setDesc] = useState('')
  const [owner, setOwner] = useState('')
  const [timeframe, setTimeframe] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleAdd(e) {
    e.preventDefault()
    if (!desc.trim() || busy) return
    setBusy(true)
    try {
      await addMove(sessionId, { description: desc.trim(), owner: owner.trim(), timeframe: timeframe.trim() })
      setDesc(''); setOwner(''); setTimeframe('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      {moves.map((m) => (
        <div key={m.id} style={{ border: `1px solid ${C.line}`, borderRadius: 10, background: '#fff', padding: '14px 16px', marginBottom: 10 }}>
          <div style={{ fontSize: 14.5, fontWeight: 500 }}>{m.description}</div>
          <div style={{ display: 'flex', gap: 16, marginTop: 8, fontFamily: "'IBM Plex Mono',monospace", fontSize: 11.5, color: C.mut, flexWrap: 'wrap' }}>
            {m.owner && <span>{m.owner}</span>}
            {m.timeframe && <span>{m.timeframe}</span>}
          </div>
        </div>
      ))}

      {editable && moves.length < 3 && (
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
          <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={strings.wsMoveDescPlaceholder} style={{ flex: '2 1 240px', padding: '11px 12px', borderRadius: 7, border: `1.5px solid ${C.line}`, fontSize: 13.5, fontFamily: 'inherit' }} />
          <input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder={strings.wsMoveOwnerPlaceholder} style={{ flex: '1 1 140px', padding: '11px 12px', borderRadius: 7, border: `1.5px solid ${C.line}`, fontSize: 13.5, fontFamily: 'inherit' }} />
          <input value={timeframe} onChange={(e) => setTimeframe(e.target.value)} placeholder={strings.wsMoveTimeframePlaceholder} style={{ flex: '1 1 140px', padding: '11px 12px', borderRadius: 7, border: `1.5px solid ${C.line}`, fontSize: 13.5, fontFamily: 'inherit' }} />
          <button type="submit" disabled={busy || !desc.trim()} style={{ padding: '11px 18px', border: 'none', borderRadius: 7, background: C.ink, color: '#fff', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 13.5 }}>
            {strings.wsAddMove}
          </button>
        </form>
      )}
      {editable && moves.length >= 3 && <p style={{ fontSize: 13, color: C.mut, marginTop: 12 }}>{strings.wsMovesFull}</p>}
    </div>
  )
}
