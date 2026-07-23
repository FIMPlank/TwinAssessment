const LANG_KEY = 'twinclimb_lang'

function setStoredLang(lang) {
  try { localStorage.setItem(LANG_KEY, lang) } catch (e) {}
}

export default function LangToggle({ lang }) {
  const isDe = lang === 'de'
  return (
    <div
      id="__lang_toggle"
      data-print-hide=""
      style={{
        position: 'fixed', left: 16, bottom: 52, zIndex: 99997, display: 'flex', alignItems: 'center', gap: 6,
        fontFamily: 'var(--as-mono)', fontSize: 11, letterSpacing: '0.06em',
        background: 'var(--as-surface)', border: '1px solid var(--as-line)', borderRadius: 20, padding: '6px 12px',
        boxShadow: 'var(--as-shadow)', color: 'var(--as-mut)',
      }}
    >
      {isDe ? (
        <a href="assessment.html" onClick={() => setStoredLang('en')} style={{ color: 'var(--as-mut)', textDecoration: 'none' }}
           onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--as-ink)' }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--as-mut)' }}>EN</a>
      ) : (
        <span style={{ color: 'var(--as-ink)', fontWeight: 600 }}>EN</span>
      )}
      <span style={{ color: 'var(--as-line-strong)' }}>|</span>
      {isDe ? (
        <span style={{ color: 'var(--as-ink)', fontWeight: 600 }}>DE</span>
      ) : (
        <a href="assessment.de.html" onClick={() => setStoredLang('de')} style={{ color: 'var(--as-mut)', textDecoration: 'none' }}
           onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--as-ink)' }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--as-mut)' }}>DE</a>
      )}
    </div>
  )
}
