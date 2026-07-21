import { PALETTE, dimName, capText, DIMENSIONS } from '../../ttcmm'

const OPT_VALUES = ['yes', 'no', 'na']

export default function CapabilityReview({ strings, lang, caps, evidence, onSetCap }) {
  return (
    <div>
      {DIMENSIONS.map((dim, di) => (
        <div key={dim.id} style={{ marginBottom: 26 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
            <span aria-hidden="true" style={{ width: 11, height: 11, borderRadius: 4, background: PALETTE[di] }} />
            <h3 style={{ fontFamily: 'var(--ws-font-head)', fontWeight: 700, fontSize: 16, margin: 0 }}>{dimName(dim, lang)}</h3>
          </div>
          <div style={{ border: '1px solid var(--ws-border-soft)', borderRadius: 'var(--ws-radius-md)', background: '#fff', overflow: 'hidden' }}>
            {dim.capabilities.map((cap, ci) => {
              const cur = caps[cap.id] ?? 'na'
              const quote = evidence[cap.id]
              return (
                <div
                  key={cap.id}
                  style={{
                    padding: '13px 16px', borderTop: ci === 0 ? 'none' : '1px solid var(--ws-border-soft)',
                    display: 'flex', flexWrap: 'wrap', gap: '8px 16px', alignItems: 'flex-start', justifyContent: 'space-between',
                  }}
                >
                  <div style={{ flex: '1 1 320px', minWidth: 220 }}>
                    <div style={{ fontSize: 13.5, lineHeight: 1.45, color: 'var(--ws-text-primary)' }}>{capText(cap, lang)}</div>
                    {quote && (
                      <div style={{ marginTop: 6, fontSize: 12, lineHeight: 1.5, color: 'var(--ws-text-muted)', fontStyle: 'italic', borderLeft: '2px solid var(--ws-border-soft)', paddingLeft: 8 }}>
                        &ldquo;{quote}&rdquo;
                      </div>
                    )}
                  </div>
                  <div role="radiogroup" aria-label={capText(cap, lang)} style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 'none' }}>
                    {OPT_VALUES.map((v) => {
                      const on = cur === v
                      const color = v === 'yes' ? 'var(--ws-brand)' : v === 'no' ? '#B3432F' : 'var(--ws-text-muted)'
                      return (
                        <label
                          key={v}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 7, cursor: 'pointer', fontSize: 12,
                            border: `1.5px solid ${on ? color : 'var(--ws-border-soft)'}`, color: on ? color : 'var(--ws-text-muted)',
                            background: on ? `${color}1a` : '#fff', fontWeight: on ? 600 : 400,
                          }}
                        >
                          <input type="radio" name={`rc-cap-${cap.id}`} checked={on} onChange={() => onSetCap(cap.id, v)} style={{ margin: 0, cursor: 'pointer' }} />
                          {v === 'yes' ? strings.capYes : v === 'no' ? strings.capNo : strings.capNa}
                        </label>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
