import { PALETTE, dimName } from '../ttcmm'
import ThemeToggle from './ThemeToggle'

export default function Header({ strings, lang, dims, step, answers, showStepper, onGoHome, onGoStep }) {
  return (
    <div
      data-print-hide=""
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
        padding: '16px 32px', borderBottom: '1px solid var(--as-line)', background: 'var(--as-header-bg)',
        position: 'sticky', top: 0, zIndex: 20,
      }}
    >
      <div onClick={onGoHome} style={{ display: 'flex', alignItems: 'baseline', gap: 12, cursor: 'pointer' }}>
        <span style={{ fontFamily: 'var(--as-head)', fontWeight: 700, fontSize: 18, letterSpacing: '0.14em', color: 'var(--as-ink)' }}>TWINCLIMB</span>
        <span style={{ fontFamily: 'var(--as-mono)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--as-mut)', textTransform: 'uppercase' }}>
          {strings.ttcmmLabel}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {showStepper && (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <div style={{ position: 'absolute', left: 13, right: 13, top: '50%', height: 1, background: 'var(--as-line-strong)', zIndex: 0 }} />
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 7 }}>
              {dims.map((d, i) => {
                const sidx = i + 1
                const answered = answers[d.id] !== undefined && answers[d.id] !== null
                const current = step === sidx
                const dc = PALETTE[i]
                const base = { width: 26, height: 26, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--as-mono)', fontSize: 11, cursor: 'pointer', transition: 'all .15s' }
                const style = current
                  ? { ...base, background: 'var(--as-ink)', color: 'var(--as-bg)' }
                  : answered
                  ? { ...base, background: dc, color: '#fff' }
                  : { ...base, background: 'var(--as-surface)', color: 'var(--as-mut)', border: '1px solid var(--as-line-strong)' }
                return (
                  <div key={d.id} onClick={() => onGoStep(sidx)} title={dimName(d, lang)} style={style}>{i + 1}</div>
                )
              })}
            </div>
          </div>
        )}
        <ThemeToggle strings={strings} />
      </div>
    </div>
  )
}
