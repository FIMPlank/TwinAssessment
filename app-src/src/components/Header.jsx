import { PALETTE, dimName } from '../ttcmm'

const C = { ink: '#17191C', mut: '#9A9A95', line: '#E3E7E5' }

export default function Header({ strings, lang, dims, step, answers, showStepper, onGoHome, onGoStep }) {
  return (
    <div
      data-print-hide=""
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 32px', borderBottom: `1px solid ${C.line}`, background: '#FFFFFF',
        position: 'sticky', top: 0, zIndex: 20,
      }}
    >
      <div onClick={onGoHome} style={{ display: 'flex', alignItems: 'baseline', gap: 12, cursor: 'pointer' }}>
        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: '0.14em' }}>TWINCLIMB</span>
        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.18em', color: C.mut, textTransform: 'uppercase' }}>
          {strings.ttcmmLabel}
        </span>
      </div>
      {showStepper && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          {dims.map((d, i) => {
            const sidx = i + 1
            const answered = answers[d.id] !== undefined && answers[d.id] !== null
            const current = step === sidx
            const dc = PALETTE[i]
            const base = { width: 26, height: 26, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, cursor: 'pointer', transition: 'all .15s' }
            const style = current
              ? { ...base, background: C.ink, color: '#fff' }
              : answered
              ? { ...base, background: dc, color: '#fff' }
              : { ...base, background: '#fff', color: C.mut, border: `1px solid ${C.line}` }
            return (
              <div key={d.id} onClick={() => onGoStep(sidx)} title={dimName(d, lang)} style={style}>{i + 1}</div>
            )
          })}
        </div>
      )}
    </div>
  )
}
