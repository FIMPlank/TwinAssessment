export default function Footer({ strings }) {
  return (
    <div data-print-hide="" style={{ borderTop: '1px solid var(--as-line)', background: 'var(--as-header-bg)', padding: '20px 32px' }}>
      <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--as-mut)', maxWidth: '92ch', margin: 0 }}>
        {strings.footerCredit}
      </p>
    </div>
  )
}
