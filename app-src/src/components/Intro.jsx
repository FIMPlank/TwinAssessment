import { dimName } from '../ttcmm'
import { STAGE_HEADERS_PREVIEW } from '../i18n'

export default function Intro({ strings, lang, dims, clientName, onClientNameChange, onStart }) {
  const stageHeaders = STAGE_HEADERS_PREVIEW[lang]
  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '60px 32px 90px' }}>
      <div style={{ fontFamily: 'var(--as-mono)', fontSize: 11, letterSpacing: '0.2em', color: 'var(--as-cyan)', textTransform: 'uppercase' }}>
        {strings.kicker}
      </div>
      <h1 style={{ fontFamily: 'var(--as-display)', fontWeight: 600, fontSize: 'clamp(34px,5vw,54px)', lineHeight: 1.1, letterSpacing: '-0.01em', maxWidth: '17ch', margin: '18px 0 0', color: 'var(--as-ink)' }}>
        {strings.h1}
      </h1>
      <p style={{ fontSize: 17, lineHeight: 1.62, color: 'var(--as-sub)', maxWidth: '62ch', margin: '22px 0 0' }}>
        {strings.introText}
      </p>

      <div style={{ marginTop: 34, display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <span style={{ fontFamily: 'var(--as-mono)', fontSize: 10, letterSpacing: '0.16em', color: 'var(--as-mut)', textTransform: 'uppercase' }}>
            {strings.clientLabel}
          </span>
          <input
            value={clientName}
            onChange={(e) => onClientNameChange(e.target.value)}
            placeholder={strings.clientPlaceholder}
            style={{ width: 340, maxWidth: '70vw', padding: '13px 14px', border: '1px solid var(--as-line-strong)', borderRadius: 7, background: 'var(--as-surface)', fontFamily: 'var(--as-sans)', fontSize: 15, color: 'var(--as-ink)' }}
          />
        </label>
        <button
          onClick={onStart}
          style={{
            padding: '14px 28px', border: 'none', borderRadius: 7, cursor: 'pointer',
            background: 'linear-gradient(120deg, var(--as-cyan) 0%, var(--as-emerald) 100%)', color: 'var(--as-ink-on-accent)',
            fontFamily: 'var(--as-head)', fontWeight: 600, fontSize: 15, letterSpacing: '0.01em',
          }}
        >
          {strings.beginBtn}
        </button>
      </div>

      <div style={{ marginTop: 54, border: '1px solid var(--as-line)', borderRadius: 12, background: 'var(--as-surface)', boxShadow: 'var(--as-card-shadow)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '200px repeat(4,1fr)', borderBottom: '1px solid var(--as-line)' }}>
          <div style={{ padding: '14px 16px', fontFamily: 'var(--as-mono)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--as-mut)', textTransform: 'uppercase' }}>
            {strings.matrixHeader}
          </div>
          {stageHeaders.map((h) => (
            <div key={h.n} style={{ padding: '14px 14px', borderLeft: '1px solid var(--as-line)' }}>
              <div style={{ fontFamily: 'var(--as-head)', fontWeight: 700, fontSize: 12, color: h.n === 4 ? 'var(--as-gold)' : 'var(--as-ink)' }}>STAGE {h.n}</div>
              <div style={{ fontSize: 12, color: 'var(--as-mut)', marginTop: 2 }}>{h.t}</div>
            </div>
          ))}
        </div>
        {dims.map((d) => (
          <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '200px repeat(4,1fr)', borderBottom: '1px solid var(--as-line)' }}>
            <div style={{ padding: '13px 16px', fontSize: 13, fontWeight: 500, color: 'var(--as-ink)' }}>{dimName(d, lang)}</div>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ borderLeft: '1px solid var(--as-line)', height: 34 }} />
            ))}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap', marginTop: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 11, height: 11, borderRadius: 3, background: 'var(--as-cyan)' }} />
          <span style={{ fontSize: 13, color: 'var(--as-mut)' }}>{strings.legendDigital}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 11, height: 11, borderRadius: 3, background: 'var(--as-emerald)' }} />
          <span style={{ fontSize: 13, color: 'var(--as-mut)' }}>{strings.legendSustainability}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 11, height: 11, borderRadius: 3, background: 'var(--as-gold)' }} />
          <span style={{ fontSize: 13, color: 'var(--as-mut)' }}>{strings.legendIntegrated}</span>
        </div>
      </div>
    </div>
  )
}
