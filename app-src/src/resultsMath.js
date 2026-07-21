import { PALETTE, dimName, capText } from './ttcmm'
import { SHORT_LABEL, STAGE_TITLE, STAGE_DESC, DIM_SHORT_NAME } from './i18n'
import { hexToRgba } from './utils'
import { radarGeometry } from './radar'

const ACCENT = '#179C7D'
const C = { dt: '#1F6FB2', st: '#179C7D' }

// Pure result derivation shared by every results/report view (self-assessment,
// AI report check). No presentation here — this only turns
// {dims, vals, isDeepList, capsByCapId, pathway} into the numbers and
// strings every view renders, so the underlying assessment logic can never
// drift between views.
export function computeResultsModel(strings, lang, dims, vals, isDeepList, capsByCapId, pathway) {
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
    shortLabel: SHORT[minV],
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

  return {
    minV, maxV, avg, strongIdx, weakIdx, spread, atSummit, notStarted,
    overall, bars, allMaxed, recs, radar, labels, radarFill, radarStroke, insight, pathways, pathwayNote,
  }
}
