import { PALETTE, deriveForDim, dimName, dimDesc, capText } from '../ttcmm'
import { STAGE_TITLE } from '../i18n'
import { hexToRgba } from '../utils'

const C = { ink: '#17191C', sub: '#6B6B66', mut: '#9A9A95', line: '#E3E7E5', dt: '#1F6FB2', st: '#179C7D' }
const OPT_VALUES = ['yes', 'no', 'na']

function DeepDrillDown({ strings, lang, dim, caps, open, onToggle, onSetCap }) {
  const TITLE = STAGE_TITLE[lang]
  const capsD = dim.capabilities
  const isAns = (cid) => caps[cid] === 'yes' || caps[cid] === 'no' || caps[cid] === 'na'
  const ansN = capsD.filter((c) => isAns(c.id)).length
  const { stage: dv, complete: cmpl } = deriveForDim(dim, caps)

  const optLabel = { yes: strings.capYes, no: strings.capNo, na: strings.capNa }
  const optColor = { yes: C.st, no: '#9A2B2B', na: C.mut }

  const groups = []
  groups.push({ legend: strings.stage1Digital, caps: capsD.filter((c) => c.stage === 1 && c.set === 'dt') })
  groups.push({ legend: strings.stage1Sustainability, caps: capsD.filter((c) => c.stage === 1 && c.set === 'st') })
  ;[2, 3, 4].forEach((st) => {
    const list = capsD.filter((c) => c.stage === st)
    if (list.length) groups.push({ legend: strings.stageGroup(st, TITLE[st]), caps: list })
  })

  return (
    <div style={{ marginTop: 24 }}>
      <button
        onClick={onToggle}
        aria-expanded={open}
        style={{ padding: '11px 18px', border: '1px solid #C6CBC8', borderRadius: 8, background: '#fff', color: '#17191C', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 13.5, cursor: 'pointer' }}
      >
        {open ? strings.refineClose : strings.refineOpen(capsD.length)}
      </button>
      {open && (
        <div style={{ marginTop: 16, border: '1px solid #E3E7E5', borderRadius: 14, background: '#FAFBFA', padding: '18px 18px 20px' }}>
          <p style={{ fontSize: 13, color: '#56564F', lineHeight: 1.55, margin: '0 0 16px', maxWidth: '82ch' }}>
            {strings.deepIntro}
          </p>
          {groups.map((g) => (
            <fieldset key={g.legend} style={{ border: 'none', padding: 0, margin: '0 0 16px' }}>
              <legend style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A9A95', padding: 0, margin: '0 0 6px' }}>
                {g.legend}
              </legend>
              {g.caps.map((cap) => {
                const text = capText(cap, lang)
                const cur = caps[cap.id]
                return (
                  <div
                    key={cap.id}
                    role="radiogroup"
                    aria-label={text}
                    style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderTop: '1px solid #EEF1EF' }}
                  >
                    <span style={{ flex: '1 1 300px', minWidth: 200, fontSize: 13.5, lineHeight: 1.45, color: '#17191C' }}>{text}</span>
                    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                      {OPT_VALUES.map((v) => {
                        const on = cur === v
                        return (
                          <label
                            key={v}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 11px', borderRadius: 7, cursor: 'pointer', fontSize: 12.5,
                              border: `1.5px solid ${on ? optColor[v] : C.line}`, color: on ? optColor[v] : C.sub,
                              background: on ? hexToRgba(optColor[v], 0.1) : '#fff', fontWeight: on ? 600 : 400,
                            }}
                          >
                            <input type="radio" name={`cap-${cap.id}`} checked={on} onChange={() => onSetCap(cap.id, v)} style={{ margin: 0, cursor: 'pointer' }} />
                            {optLabel[v]}
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </fieldset>
          ))}
          <div style={{ marginTop: 8, fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '0.04em', color: '#6B6B66' }}>
            {strings.deepProgress(ansN, capsD.length)}
          </div>
          <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.5, color: '#10604B', fontWeight: 500 }}>
            {cmpl
              ? strings.deepSummaryComplete(dv === 0 ? strings.belowStage1 : strings.stageN(dv))
              : strings.deepSummaryIncomplete}
          </div>
        </div>
      )}
    </div>
  )
}

export default function DimensionView({ strings, lang, dim, idx, sel, caps, deepOpen, isDeep, derivedStage, onSelectStage, onSetCap, onToggleDeep, onBack, onNext, clientSuffix }) {
  const TITLE = STAGE_TITLE[lang]
  const dc = PALETTE[idx]
  const backLabel = idx === 0 ? strings.introBack : strings.previousBack
  const nextLabel = idx === 5 ? strings.seeResults : strings.nextDimension

  const stage1 = { dt: dim.capabilities.filter((c) => c.stage === 1 && c.set === 'dt'), st: dim.capabilities.filter((c) => c.stage === 1 && c.set === 'st') }
  const stageItems = (s) => (s === 1 ? [...stage1.dt, ...stage1.st] : dim.capabilities.filter((c) => c.stage === s))

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '38px 32px 120px' }}>
      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '0.18em', color: '#9A9A95', textTransform: 'uppercase' }}>
        {strings.dimensionLabel} {String(idx + 1).padStart(2, '0')} / 06{clientSuffix}
      </div>
      <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 'clamp(26px,3.4vw,36px)', letterSpacing: '-0.01em', margin: '8px 0 0' }}>
        {dimName(dim, lang)}
      </h2>
      <p style={{ fontSize: 15.5, lineHeight: 1.6, color: '#56564F', maxWidth: '80ch', margin: '12px 0 0' }}>
        {dimDesc(dim, lang)}
      </p>

      <div style={{ marginTop: 26, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '0.14em', color: '#17191C', textTransform: 'uppercase' }}>
          {strings.stageReached}
        </span>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {[0, 1, 2, 3, 4].map((v) => {
            const on = v === sel
            const base = { padding: '8px 15px', borderRadius: 7, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 13, transition: 'all .12s' }
            const style = on
              ? { ...base, background: dc, color: '#fff', border: `1.5px solid ${dc}` }
              : { ...base, background: '#fff', color: C.ink, border: `1.5px solid ${C.line}` }
            return (
              <button key={v} onClick={() => onSelectStage(dim.id, v)} style={style}>
                {v === 0 ? strings.notStarted : String(v)}
              </button>
            )
          })}
        </div>
      </div>

      {isDeep && (
        <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, letterSpacing: '0.08em', color: '#10604B', background: '#E7F2EF', border: '1px solid #179C7D', borderRadius: 20, padding: '5px 11px' }}>
          ✓ {derivedStage === 0 ? strings.dimBadgeEmerging : strings.dimBadgeStage(derivedStage)}
        </div>
      )}

      <DeepDrillDown
        strings={strings} lang={lang} dim={dim} caps={caps}
        open={!!deepOpen} onToggle={() => onToggleDeep(dim.id)} onSetCap={onSetCap}
      />

      <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, alignItems: 'start' }}>
        {[1, 2, 3, 4].map((s) => {
          const reached = sel > 0 && s <= sel
          const current = s === sel
          const colStyle = {
            borderRadius: 11, overflow: 'hidden', cursor: 'pointer', background: '#fff', transition: 'all .15s',
            ...(current
              ? { border: `2px solid ${dc}`, boxShadow: `0 0 0 4px ${hexToRgba(dc, 0.16)}` }
              : reached
              ? { border: `1.5px solid ${C.ink}` }
              : { border: `1.5px dashed ${C.line}` }),
          }
          const headerStyle = {
            padding: '13px 14px',
            ...(current
              ? { background: dc, color: '#fff' }
              : reached
              ? { background: C.ink, color: '#fff' }
              : { background: '#FAFBFA', color: '#A4A49E', borderBottom: `1px dashed ${C.line}` }),
          }
          const tagStyle = { fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, letterSpacing: '0.12em', color: reached ? 'rgba(255,255,255,0.82)' : '#BFBFB8' }
          const statusLabel = current ? strings.current : reached ? strings.reached : ''
          const markerStyle = reached
            ? { flex: 'none', width: 16, height: 16, borderRadius: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', marginTop: 1, background: current ? dc : C.ink }
            : { flex: 'none', width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${C.line}`, marginTop: 1 }
          const itemTextStyle = { fontSize: 13, lineHeight: 1.45, color: reached ? C.ink : '#A4A49E' }

          const groups = s === 1
            ? [
                { hasLabel: true, label: strings.digital, marginTop: 0, color: C.dt, caps: stage1.dt },
                { hasLabel: true, label: strings.sustainability, marginTop: 13, color: C.st, caps: stage1.st },
              ]
            : [{ hasLabel: false, caps: stageItems(s) }]

          return (
            <div key={s} onClick={() => onSelectStage(dim.id, s)} style={colStyle}>
              <div style={headerStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '0.04em' }}>STAGE {s}</span>
                  <span style={tagStyle}>{statusLabel}</span>
                </div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 14.5, marginTop: 3 }}>{TITLE[s]}</div>
              </div>
              <div style={{ padding: '14px 14px 16px' }}>
                {groups.map((group, gi) => (
                  <div key={gi} style={group.marginTop ? { marginTop: group.marginTop, paddingTop: group.marginTop, borderTop: `1px dashed ${C.line}` } : undefined}>
                    {group.hasLabel && (
                      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, letterSpacing: '0.14em', fontWeight: 500, color: group.color, margin: '0 0 9px' }}>
                        {group.label}
                      </div>
                    )}
                    {group.caps.map((cap) => (
                      <div key={cap.id} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', marginBottom: 9 }}>
                        <span style={markerStyle}>{reached ? '✓' : ''}</span>
                        <span style={itemTextStyle}>{capText(cap, lang)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 34, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <button onClick={onBack} style={{ padding: '13px 22px', border: '1px solid #C6CBC8', borderRadius: 7, background: '#fff', color: '#17191C', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 14 }}>
          {backLabel}
        </button>
        <button onClick={onNext} style={{ padding: '13px 26px', border: 'none', borderRadius: 7, background: '#17191C', color: '#fff', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 14 }}>
          {nextLabel}
        </button>
      </div>
    </div>
  )
}
