// Calm, compact notice — visible on every step (including results, where
// "review the AI mappings" matters most) but deliberately low-key: a single
// line, not a warning block. Legally/functionally this replaces nothing —
// it's the one disclaimer this feature has, just toned down from an
// alarm-style "beta" banner to something that reads as intentional.
export default function EarlyAccessNotice({ strings }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10, maxWidth: 900, margin: '0 auto 24px', padding: '11px 16px',
        background: 'var(--rc-surface-muted)', border: '1px solid var(--rc-border)', borderRadius: 'var(--rc-radius-sm)',
      }}
    >
      <span aria-hidden="true" style={{ flex: 'none', width: 18, height: 18, marginTop: 1, borderRadius: '50%', background: 'var(--rc-brand)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        i
      </span>
      <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--rc-text-primary)', margin: 0 }}>
        <strong style={{ fontWeight: 700 }}>{strings.rcEarlyAccessTitle}</strong>{' — '}{strings.rcEarlyAccessBody}
      </p>
    </div>
  )
}
