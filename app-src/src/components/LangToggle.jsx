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
        fontFamily: "'IBM Plex Mono',ui-monospace,monospace", fontSize: 11, letterSpacing: '0.06em',
        background: 'rgba(255,255,255,0.92)', border: '1px solid #E3E7E5', borderRadius: 20, padding: '6px 12px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      {isDe ? (
        <a href="assessment.html" onClick={() => setStoredLang('en')} style={{ color: '#9A9A95', textDecoration: 'none' }}
           onMouseEnter={(e) => { e.currentTarget.style.color = '#17191C' }} onMouseLeave={(e) => { e.currentTarget.style.color = '#9A9A95' }}>EN</a>
      ) : (
        <span style={{ color: '#17191C', fontWeight: 600 }}>EN</span>
      )}
      <span style={{ color: '#E3E7E5' }}>|</span>
      {isDe ? (
        <span style={{ color: '#17191C', fontWeight: 600 }}>DE</span>
      ) : (
        <a href="assessment.de.html" onClick={() => setStoredLang('de')} style={{ color: '#9A9A95', textDecoration: 'none' }}
           onMouseEnter={(e) => { e.currentTarget.style.color = '#17191C' }} onMouseLeave={(e) => { e.currentTarget.style.color = '#9A9A95' }}>DE</a>
      )}
    </div>
  )
}
