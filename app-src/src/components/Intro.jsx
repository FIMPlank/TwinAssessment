import { dimName } from '../ttcmm'
import { STAGE_HEADERS_PREVIEW } from '../i18n'

export default function Intro({ strings, lang, dims, clientName, onClientNameChange, onStart }) {
  const stageHeaders = STAGE_HEADERS_PREVIEW[lang]
  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '60px 32px 90px' }}>
      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '0.2em', color: '#179C7D', textTransform: 'uppercase' }}>
        {strings.kicker}
      </div>
      <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 'clamp(34px,5vw,54px)', lineHeight: 1.04, letterSpacing: '-0.02em', maxWidth: '15ch', margin: '18px 0 0' }}>
        {strings.h1}
      </h1>
      <p style={{ fontSize: 17, lineHeight: 1.62, color: '#41413D', maxWidth: '62ch', margin: '22px 0 0' }}>
        {strings.introText}
      </p>

      <div style={{ marginTop: 34, display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.16em', color: '#9A9A95', textTransform: 'uppercase' }}>
            {strings.clientLabel}
          </span>
          <input
            value={clientName}
            onChange={(e) => onClientNameChange(e.target.value)}
            placeholder={strings.clientPlaceholder}
            style={{ width: 340, maxWidth: '70vw', padding: '13px 14px', border: '1px solid #C6CBC8', borderRadius: 7, background: '#fff', fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 15, color: '#17191C' }}
          />
        </label>
        <button onClick={onStart} style={{ padding: '14px 28px', border: 'none', borderRadius: 7, background: '#17191C', color: '#fff', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 15, letterSpacing: '0.01em' }}>
          {strings.beginBtn}
        </button>
      </div>

      <div style={{ marginTop: 54, border: '1px solid #E3E7E5', borderRadius: 12, background: '#fff', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '200px repeat(4,1fr)', borderBottom: '1px solid #E3E7E5' }}>
          <div style={{ padding: '14px 16px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.14em', color: '#9A9A95', textTransform: 'uppercase' }}>
            {strings.matrixHeader}
          </div>
          {stageHeaders.map((h) => (
            <div key={h.n} style={{ padding: '14px 14px', borderLeft: '1px solid #E3E7E5' }}>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 12 }}>STAGE {h.n}</div>
              <div style={{ fontSize: 12, color: '#6B6B66', marginTop: 2 }}>{h.t}</div>
            </div>
          ))}
        </div>
        {dims.map((d) => (
          <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '200px repeat(4,1fr)', borderBottom: '1px solid #EEF1EF' }}>
            <div style={{ padding: '13px 16px', fontSize: 13, fontWeight: 500 }}>{dimName(d, lang)}</div>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ borderLeft: '1px solid #EEF1EF', height: 34 }} />
            ))}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap', marginTop: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 11, height: 11, borderRadius: 3, background: '#1F6FB2' }} />
          <span style={{ fontSize: 13, color: '#6B6B66' }}>{strings.legendDigital}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 11, height: 11, borderRadius: 3, background: '#179C7D' }} />
          <span style={{ fontSize: 13, color: '#6B6B66' }}>{strings.legendSustainability}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 11, height: 11, borderRadius: 3, background: '#158C86' }} />
          <span style={{ fontSize: 13, color: '#6B6B66' }}>{strings.legendIntegrated}</span>
        </div>
      </div>
    </div>
  )
}
