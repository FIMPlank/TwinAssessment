export default function WipBanner({ strings }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10, maxWidth: 900, margin: '0 auto 24px', padding: '12px 16px',
        background: '#FFF7E6', border: '1px solid #EFDDA0', borderRadius: 'var(--ws-radius-sm)', fontSize: 13.5, color: '#6B5A2A', lineHeight: 1.5,
      }}
    >
      <span aria-hidden="true">⚠</span>
      <span>{strings.rcWipNotice}</span>
    </div>
  )
}
