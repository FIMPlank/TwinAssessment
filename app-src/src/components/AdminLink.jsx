export default function AdminLink({ strings }) {
  return (
    <a
      id="__study_admin"
      href="dashboard.html" target="_blank" rel="noopener" data-print-hide=""
      title={strings.adminLinkTitle}
      style={{
        position: 'fixed', left: 16, bottom: 16, zIndex: 99997, textDecoration: 'none',
        fontFamily: "'IBM Plex Mono',ui-monospace,monospace", fontSize: 11, letterSpacing: '0.04em',
        color: '#9A9A95', background: 'rgba(255,255,255,0.92)', border: '1px solid #E3E7E5', borderRadius: 20,
        padding: '7px 13px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'color .12s, border-color .12s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = '#17191C'; e.currentTarget.style.borderColor = '#C6CBC8' }}
      onMouseLeave={(e) => { e.currentTarget.style.color = '#9A9A95'; e.currentTarget.style.borderColor = '#E3E7E5' }}
    >
      {strings.adminLinkLabel}
    </a>
  )
}
