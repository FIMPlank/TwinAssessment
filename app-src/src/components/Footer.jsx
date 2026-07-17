export default function Footer({ strings }) {
  return (
    <div data-print-hide="" style={{ borderTop: '1px solid #E3E7E5', background: '#fff', padding: '20px 32px' }}>
      <p style={{ fontSize: 12, lineHeight: 1.6, color: '#9A9A95', maxWidth: '92ch', margin: 0 }}>
        {strings.footerCredit}
      </p>
    </div>
  )
}
