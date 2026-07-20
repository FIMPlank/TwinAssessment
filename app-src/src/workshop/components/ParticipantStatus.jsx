// Lightweight status strip for the participant view — just identity + phase,
// no controls (participants don't drive the session).
export default function ParticipantStatus({ phaseLabel, name }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '14px 24px', background: 'var(--ws-surface-dark)', color: 'var(--ws-text-on-dark)' }}>
      <span style={{ fontFamily: 'var(--ws-font-mono)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ws-text-muted-on-dark)' }}>{phaseLabel}</span>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{name}</span>
    </div>
  )
}
