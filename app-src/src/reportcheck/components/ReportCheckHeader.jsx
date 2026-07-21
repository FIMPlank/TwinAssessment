export default function ReportCheckHeader({ strings, lang }) {
  const otherLangHref = (lang === 'de' ? 'reportcheck.html' : 'reportcheck.de.html') + window.location.search

  return (
    <header
      data-print-hide=""
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        padding: '15px 28px', background: 'var(--rc-surface)', borderBottom: '1px solid var(--rc-border)',
        position: 'sticky', top: 0, zIndex: 30,
      }}
    >
      <a href={lang === 'de' ? 'reportcheck.de.html' : 'reportcheck.html'} style={{ display: 'flex', alignItems: 'baseline', gap: 10, textDecoration: 'none', color: 'inherit', minWidth: 0 }}>
        <span style={{ fontFamily: 'var(--ws-font-head)', fontWeight: 700, fontSize: 16, letterSpacing: '0.1em', color: 'var(--rc-text-primary)' }}>TWINCLIMB</span>
        <span style={{ fontFamily: 'var(--ws-font-mono)', fontSize: 10.5, letterSpacing: '0.1em', color: 'var(--rc-text-muted)', textTransform: 'uppercase' }}>
          {strings.rcBrand}
        </span>
      </a>
      <a href={otherLangHref} style={{ fontFamily: 'var(--ws-font-mono)', fontSize: 12, letterSpacing: '0.06em', color: 'var(--rc-text-muted)', textDecoration: 'none' }}>
        {lang === 'de' ? 'EN' : 'DE'}
      </a>
    </header>
  )
}
