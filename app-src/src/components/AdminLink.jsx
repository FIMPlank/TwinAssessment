export default function AdminLink({ strings }) {
  return (
    <a
      id="__study_admin"
      href="dashboard.html" target="_blank" rel="noopener" data-print-hide=""
      title={strings.adminLinkTitle}
      style={{
        position: 'fixed', left: 16, bottom: 16, zIndex: 99997, textDecoration: 'none',
        fontFamily: 'var(--as-mono)', fontSize: 11, letterSpacing: '0.04em',
        color: 'var(--as-mut)', background: 'var(--as-surface)', border: '1px solid var(--as-line)', borderRadius: 20,
        padding: '7px 13px', boxShadow: 'var(--as-shadow)', transition: 'color .12s, border-color .12s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--as-ink)'; e.currentTarget.style.borderColor = 'var(--as-line-strong)' }}
      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--as-mut)'; e.currentTarget.style.borderColor = 'var(--as-line)' }}
    >
      {strings.adminLinkLabel}
    </a>
  )
}
