import { PALETTE, dimName, capText } from '../ttcmm'
import { SHORT_LABEL, STAGE_TITLE, STAGE_DESC, DIM_SHORT_NAME } from '../i18n'
import { hexToRgba } from '../utils'
import { radarGeometry } from '../radar'

const ACCENT = '#179C7D'
const C = { dt: '#1F6FB2', st: '#179C7D' }

export default function ResultsView({ strings, lang, dims, vals, isDeepList, capsByCapId, pathway, onEditAnswers, onPrint, onRestart }) {
  const SHORT = SHORT_LABEL[lang]
  const TITLE = STAGE_TITLE[lang]
  const SDESC = STAGE_DESC[lang]
  const RN = DIM_SHORT_NAME[lang]

  const minV = Math.min(...vals)
  const maxV = Math.max(...vals)
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length
  const strongIdx = vals.indexOf(maxV)
  const weakIdx = vals.indexOf(minV)

  const overall = {
    headline: minV === 0 ? strings.headlineEmerging : strings.headline(minV, SHORT[minV]),
    desc: SDESC[minV],
    avg: avg.toFixed(1),
    strong: `${RN[strongIdx]} · ${strings.stageN(maxV)}`,
    stroke: minV === 0 ? '#9A9A95' : ACCENT,
  }

  const bars = dims.map((d, i) => ({
    name: dimName(d, lang), color: PALETTE[i], val: vals[i],
    label: vals[i] === 0 ? strings.notStarted : `${strings.stageN(vals[i])} · ${TITLE[vals[i]]}`,
  }))
  const allMaxed = vals.every((v) => v === 4)

  const stageItems = (dim, s) => dim.capabilities.filter((c) => c.stage === s)
  const recs = dims
    .map((d, i) => ({ d, i, v: vals[i] }))
    .filter((o) => o.v < 4)
    .sort((a, b) => a.v - b.v)
    .map((o) => {
      const deep = isDeepList.includes(o.d.id)
      let items
      if (deep) {
        const gaps = o.d.capabilities.filter((c) => c.stage === o.v + 1 && capsByCapId[c.id] === 'no').map((c) => capText(c, lang))
        items = gaps.length ? gaps : stageItems(o.d, o.v + 1).map((c) => capText(c, lang))
      } else {
        items = stageItems(o.d, o.v + 1).map((c) => capText(c, lang))
      }
      return {
        num: String(o.i + 1).padStart(2, '0'),
        name: dimName(o.d, lang) + (deep ? strings.deepTag : ''),
        from: o.v === 0 ? strings.notStarted : strings.stageN(o.v),
        to: `${strings.stageN(o.v + 1)} · ${TITLE[o.v + 1]}`,
        items,
      }
    })

  const radar = radarGeometry(vals, dims.length)
  const labels = RN.map((nm, i) => {
    const [x, y] = radar.pt(radar.R + 24, i)
    let anchor = 'middle'
    if (x > radar.cx + 4) anchor = 'start'
    else if (x < radar.cx - 4) anchor = 'end'
    return { x: x.toFixed(1), y: y.toFixed(1), name: nm, anchor }
  })
  const radarFill = hexToRgba(ACCENT, 0.16)
  const radarStroke = minV === 0 && maxV === 0 ? '#C6CBC8' : ACCENT

  const spread = maxV - minV
  const atSummit = vals.filter((v) => v === 4).length
  const notStarted = vals.filter((v) => v === 0).length
  const insight = {
    bottleneck: RN[weakIdx] + (notStarted > 1 ? strings.moreSuffix(notStarted - 1) : ''),
    bottleColor: PALETTE[weakIdx],
    bottleText: minV === 4 ? strings.bottleTextNone : strings.bottleTextDefault,
    balanceLabel: spread === 0 ? strings.balanceEven : spread === 1 ? strings.balanceFair : strings.balanceUneven(spread),
    balanceText: spread === 0 ? strings.balanceTextEven : spread === 1 ? strings.balanceTextFair : strings.balanceTextUneven(spread),
    gapLabel: minV === 4 ? strings.atSummit : strings.stagesToClimb(4 - minV),
    gapText: minV === 4 ? strings.gapTextMaxed : strings.gapTextDefault(atSummit, RN[strongIdx]),
  }

  const pcard = { border: '1px solid #ECEFEC', borderRadius: 11, padding: '16px 16px 17px', background: '#FAFBFA' }
  let pathways = [
    { key: 'newcomer', name: strings.pathwayNewcomerName, color: '#8C8A84', entry: strings.pathwayNewcomerEntry, desc: strings.pathwayNewcomerDesc },
    { key: 'dt', name: strings.pathwayDtName, color: C.dt, entry: strings.pathwayDtEntry, desc: strings.pathwayDtDesc },
    { key: 'st', name: strings.pathwayStName, color: C.st, entry: strings.pathwayStEntry, desc: strings.pathwayStDesc },
  ]
  let pathwayNote = minV === 0 ? strings.pathwayNoteEmerging : minV === 1 ? strings.pathwayNoteStage1 : strings.pathwayNoteShared(minV)

  const PWMAP = { newcomer: 0, dt: 1, st: 2 }
  const di = PWMAP[pathway.key]
  pathways = pathways.map((p, ix) => {
    const detected = pathway.hasData && ix === di
    return { ...p, detected, cardStyle: detected ? { ...pcard, border: `2px solid ${ACCENT}`, boxShadow: `0 0 0 4px ${hexToRgba(ACCENT, 0.13)}` } : pcard }
  })
  if (pathway.hasData && di !== undefined) {
    const nm = [strings.pathwayDetectedNewcomer, strings.pathwayDetectedDt, strings.pathwayDetectedSt][di]
    pathwayNote = strings.pathwayDetectedNote(nm)
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '46px 32px 120px' }}>
      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '0.18em', color: '#9A9A95', textTransform: 'uppercase' }}>
        {strings.resultsLabel}
      </div>
      <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 'clamp(30px,4.2vw,44px)', letterSpacing: '-0.02em', margin: '8px 0 0' }}>
        {overall.headline}
      </h2>
      <p style={{ fontSize: 16, lineHeight: 1.6, color: '#56564F', maxWidth: '74ch', margin: '12px 0 0' }}>{overall.desc}</p>

      <div data-print-break="" style={{ border: '1px solid #E3E7E5', borderRadius: 14, background: '#fff', padding: '22px 24px', marginTop: 28, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 22 }}>
        <div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.14em', color: '#9A9A95', textTransform: 'uppercase' }}>{strings.bottleneckHeader}</div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 19, marginTop: 8, lineHeight: 1.2, color: insight.bottleColor }}>{insight.bottleneck}</div>
          <p style={{ fontSize: 13, lineHeight: 1.55, color: '#56564F', margin: '9px 0 0' }}>{insight.bottleText}</p>
        </div>
        <div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.14em', color: '#9A9A95', textTransform: 'uppercase' }}>{strings.balanceHeader}</div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 19, marginTop: 8, lineHeight: 1.2 }}>{insight.balanceLabel}</div>
          <p style={{ fontSize: 13, lineHeight: 1.55, color: '#56564F', margin: '9px 0 0' }}>{insight.balanceText}</p>
        </div>
        <div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.14em', color: '#9A9A95', textTransform: 'uppercase' }}>{strings.summitHeader}</div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 19, marginTop: 8, lineHeight: 1.2 }}>{insight.gapLabel}</div>
          <p style={{ fontSize: 13, lineHeight: 1.55, color: '#56564F', margin: '9px 0 0' }}>{insight.gapText}</p>
        </div>
      </div>

      <div data-print-break="" style={{ border: '1px solid #E3E7E5', borderRadius: 14, background: '#fff', padding: 24, marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
          <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 18, margin: 0 }}>{strings.pathwaysHeading}</h3>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.06em', color: '#9A9A95' }}>{strings.pathwaysCite}</span>
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: '#56564F', margin: '10px 0 20px', maxWidth: '88ch' }}>{strings.pathwaysIntro}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {pathways.map((p) => (
            <div key={p.key} style={p.cardStyle}>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15, color: p.color }}>{p.name}</div>
              <div style={{ marginTop: 7 }}>
                <span style={{ display: 'inline-block', fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: '0.08em', color: '#fff', background: p.color, padding: '3px 9px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                  {p.entry}
                </span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.55, color: '#41413D', margin: '11px 0 0' }}>{p.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, paddingTop: 15, borderTop: '1px solid #EEF1EF' }}>
          <span style={{ flex: 'none', fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.1em', color: '#9A9A95', textTransform: 'uppercase' }}>{strings.yourRead}</span>
          <span style={{ fontSize: 13.5, lineHeight: 1.5, color: '#41413D' }}>{pathwayNote}</span>
        </div>
      </div>

      <div data-print-break="" style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 24, marginTop: 24 }}>
        <div style={{ border: '1px solid #E3E7E5', borderRadius: 12, background: '#fff', padding: '22px 18px 16px' }}>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.16em', color: '#9A9A95', textTransform: 'uppercase', marginBottom: 6 }}>{strings.maturityProfile}</div>
          <svg viewBox="0 0 440 400" width="100%" style={{ maxWidth: 430, display: 'block', margin: '0 auto' }}>
            {radar.rings.map((r, i) => <polygon key={i} points={r.points} fill="none" stroke="#E6E9E7" strokeWidth="1" />)}
            {radar.axes.map((a, i) => <line key={i} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke="#DCE0DD" strokeWidth="1" />)}
            <polygon points={radar.points} fill={radarFill} stroke={radarStroke} strokeWidth="2" strokeLinejoin="round" />
            {radar.verts.map((v, i) => <circle key={i} cx={v.x} cy={v.y} r="4.6" fill={PALETTE[i]} stroke="#fff" strokeWidth="1.5" />)}
            {labels.map((l, i) => (
              <text key={i} x={l.x} y={l.y} textAnchor={l.anchor} dominantBaseline="middle" fontFamily="IBM Plex Mono" fontSize="11" fill="#6B6B66">{l.name}</text>
            ))}
          </svg>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ border: '1px solid #E3E7E5', borderRadius: 12, background: '#fff', padding: 22 }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.16em', color: '#9A9A95', textTransform: 'uppercase' }}>{strings.integratedMaturity}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 8 }}>
              <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 56, lineHeight: 1, color: overall.stroke }}>{minV}</span>
              <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 18 }}>{SHORT[minV]}</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.5, color: '#6B6B66', margin: '10px 0 0' }}>
              {strings.integratedFootnote}
              <br />
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: '#B0AFA8' }}>{strings.citeSection41}</span>
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ border: '1px solid #E3E7E5', borderRadius: 12, background: '#fff', padding: 18 }}>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.14em', color: '#9A9A95', textTransform: 'uppercase' }}>{strings.avgDimension}</div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 28, marginTop: 6 }}>
                {overall.avg}<span style={{ fontSize: 15, color: '#9A9A95', fontWeight: 500 }}> / 4</span>
              </div>
            </div>
            <div style={{ border: '1px solid #E3E7E5', borderRadius: 12, background: '#fff', padding: 18 }}>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.14em', color: '#9A9A95', textTransform: 'uppercase' }}>{strings.strongest}</div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 15, marginTop: 6, lineHeight: 1.25 }}>{overall.strong}</div>
            </div>
          </div>
        </div>
      </div>

      <div data-print-break="" style={{ border: '1px solid #E3E7E5', borderRadius: 12, background: '#fff', padding: 24, marginTop: 24 }}>
        <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 18, margin: '0 0 18px' }}>{strings.maturityByDimension}</h3>
        {bars.map((b) => (
          <div key={b.name} style={{ display: 'grid', gridTemplateColumns: '200px 1fr 132px', alignItems: 'center', gap: 16, padding: '9px 0', borderTop: '1px solid #EEF1EF' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, fontWeight: 500 }}>
              <span style={{ flex: 'none', width: 10, height: 10, borderRadius: 3, background: b.color }} />
              {b.name}
            </span>
            <div style={{ display: 'flex', gap: 5 }}>
              {[1, 2, 3, 4].map((s) => (
                <div key={s} style={{ flex: 1, height: 11, borderRadius: 3, background: s <= b.val ? b.color : '#EBEEEB' }} />
              ))}
            </div>
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '0.06em', color: '#6B6B66', textAlign: 'right' }}>{b.label}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 30 }}>
        <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 20, margin: '0 0 4px' }}>{strings.priorityNextMoves}</h3>
        <p style={{ fontSize: 14, color: '#6B6B66', margin: '0 0 18px', maxWidth: '84ch' }}>{strings.priorityNextMovesDesc}</p>
        {allMaxed && (
          <div style={{ border: '1px solid #179C7D', borderRadius: 12, background: '#E7F2EF', padding: 24, fontSize: 15, lineHeight: 1.55 }}>
            {strings.allMaxed}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {recs.map((rec) => (
            <div key={rec.num} data-print-break="" style={{ border: '1px solid #E3E7E5', borderRadius: 12, background: '#fff', padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 16 }}>{rec.name}</span>
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: '#9A9A95', letterSpacing: '0.08em' }}>{rec.num}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '10px 0 14px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '0.04em' }}>
                <span style={{ color: '#9A9A95' }}>{rec.from}</span>
                <span style={{ color: '#C6CBC8' }}>→</span>
                <span style={{ color: '#179C7D', fontWeight: 500 }}>{rec.to}</span>
              </div>
              {rec.items.map((it, i) => (
                <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ flex: 'none', width: 16, height: 16, borderRadius: 4, border: '1.5px solid #C6CBC8', marginTop: 1 }} />
                  <span style={{ fontSize: 13, lineHeight: 1.45, color: '#41413D' }}>{it}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div data-print-hide="" style={{ marginTop: 34, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button onClick={onEditAnswers} style={{ padding: '13px 22px', border: '1px solid #C6CBC8', borderRadius: 7, background: '#fff', color: '#17191C', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 14 }}>
          {strings.editAnswers}
        </button>
        <button onClick={onPrint} style={{ padding: '13px 22px', border: '1px solid #C6CBC8', borderRadius: 7, background: '#fff', color: '#17191C', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 14 }}>
          {strings.printPage}
        </button>
        <button onClick={onRestart} style={{ padding: '13px 22px', border: '1px solid #C6CBC8', borderRadius: 7, background: '#fff', color: '#9A2B2B', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 14 }}>
          {strings.restart}
        </button>
      </div>
    </div>
  )
}
