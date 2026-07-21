export default function ReportCheckHeader({ strings, lang }) {
  const otherLangHref = (lang === 'de' ? 'reportcheck.html' : 'reportcheck.de.html') + window.location.search

  return (
    <header
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        padding: '13px 28px', background: 'var(--ws-bg-deep)', color: 'var(--ws-text-on-dark)', borderBottom: '1px solid var(--ws-border-on-dark)',
      }}
    >
      <a href={lang === 'de' ? 'reportcheck.de.html' : 'reportcheck.html'} style={{ display: 'flex', alignItems: 'baseline', gap: 10, textDecoration: 'none', color: 'inherit', minWidth: 0 }}>
        <span style={{ fontFamily: 'var(--ws-font-head)', fontWeight: 700, fontSize: 14.5, letterSpacing: '0.14em', flex: 'none' }}>TWINCLIMB</span>
        <span style={{ fontFamily: 'var(--ws-font-mono)', fontSize: 11, letterSpacing: '0.08em', color: 'var(--ws-text-muted-on-dark)', textTransform: 'uppercase' }}>
          {strings.rcBrand}
        </span>
      </a>
      <a href={otherLangHref} style={{ fontFamily: 'var(--ws-font-mono)', fontSize: 12, letterSpacing: '0.06em', color: 'var(--ws-text-muted-on-dark)', textDecoration: 'none' }}>
        {lang === 'de' ? 'EN' : 'DE'}
      </a>
    </header>
  )
}
