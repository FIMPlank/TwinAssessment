import { PALETTE } from '../ttcmm'
import { computeResultsModel } from '../resultsMath'

export default function ResultsView({ strings, lang, dims, vals, isDeepList, capsByCapId, pathway, onEditAnswers, onPrint, onRestart }) {
  const {
    overall, bars, allMaxed, recs, radar, labels, radarFill, radarStroke, insight, pathways, pathwayNote, minV,
  } = computeResultsModel(strings, lang, dims, vals, isDeepList, capsByCapId, pathway)

  const cardStyle = { border: '1px solid var(--as-line)', borderRadius: 14, background: 'var(--as-surface)', boxShadow: 'var(--as-card-shadow)' }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '46px 32px 120px' }}>
      <div style={{ fontFamily: 'var(--as-mono)', fontSize: 11, letterSpacing: '0.18em', color: 'var(--as-mut)', textTransform: 'uppercase' }}>
        {strings.resultsLabel}
      </div>
      <h2 style={{ fontFamily: 'var(--as-display)', fontWeight: 600, fontSize: 'clamp(30px,4.2vw,44px)', letterSpacing: '-0.01em', margin: '8px 0 0', color: 'var(--as-ink)' }}>
        {overall.headline}
      </h2>
      <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--as-sub)', maxWidth: '74ch', margin: '12px 0 0' }}>{overall.desc}</p>

      <div data-print-break="" style={{ ...cardStyle, padding: '22px 24px', marginTop: 28, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 22 }}>
        <div>
          <div style={{ fontFamily: 'var(--as-mono)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--as-mut)', textTransform: 'uppercase' }}>{strings.bottleneckHeader}</div>
          <div style={{ fontFamily: 'var(--as-head)', fontWeight: 600, fontSize: 19, marginTop: 8, lineHeight: 1.2, color: insight.bottleColor }}>{insight.bottleneck}</div>
          <p style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--as-sub)', margin: '9px 0 0' }}>{insight.bottleText}</p>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--as-mono)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--as-mut)', textTransform: 'uppercase' }}>{strings.balanceHeader}</div>
          <div style={{ fontFamily: 'var(--as-head)', fontWeight: 600, fontSize: 19, marginTop: 8, lineHeight: 1.2, color: 'var(--as-ink)' }}>{insight.balanceLabel}</div>
          <p style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--as-sub)', margin: '9px 0 0' }}>{insight.balanceText}</p>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--as-mono)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--as-mut)', textTransform: 'uppercase' }}>{strings.summitHeader}</div>
          <div style={{ fontFamily: 'var(--as-head)', fontWeight: 600, fontSize: 19, marginTop: 8, lineHeight: 1.2, color: minV === 4 ? 'var(--as-gold)' : 'var(--as-ink)' }}>{insight.gapLabel}</div>
          <p style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--as-sub)', margin: '9px 0 0' }}>{insight.gapText}</p>
        </div>
      </div>

      <div data-print-break="" style={{ ...cardStyle, padding: 24, marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
          <h3 style={{ fontFamily: 'var(--as-head)', fontWeight: 600, fontSize: 18, margin: 0, color: 'var(--as-ink)' }}>{strings.pathwaysHeading}</h3>
          <span style={{ fontFamily: 'var(--as-mono)', fontSize: 10, letterSpacing: '0.06em', color: 'var(--as-mut)' }}>{strings.pathwaysCite}</span>
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--as-sub)', margin: '10px 0 20px', maxWidth: '88ch' }}>{strings.pathwaysIntro}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {pathways.map((p) => (
            <div key={p.key} style={{ ...p.cardStyle, background: 'var(--as-surface-muted)', border: p.detected ? p.cardStyle.border : '1px solid var(--as-line)' }}>
              <div style={{ fontFamily: 'var(--as-head)', fontWeight: 700, fontSize: 15, color: p.color }}>{p.name}</div>
              <div style={{ marginTop: 7 }}>
                <span style={{ display: 'inline-block', fontFamily: 'var(--as-mono)', fontSize: 9.5, letterSpacing: '0.08em', color: '#fff', background: p.color, padding: '3px 9px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                  {p.entry}
                </span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--as-sub)', margin: '11px 0 0' }}>{p.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, paddingTop: 15, borderTop: '1px solid var(--as-line)' }}>
          <span style={{ flex: 'none', fontFamily: 'var(--as-mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--as-mut)', textTransform: 'uppercase' }}>{strings.yourRead}</span>
          <span style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--as-sub)' }}>{pathwayNote}</span>
        </div>
      </div>

      <div data-print-break="" style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 24, marginTop: 24 }}>
        <div style={{ ...cardStyle, borderRadius: 12, padding: '22px 18px 16px' }}>
          <div style={{ fontFamily: 'var(--as-mono)', fontSize: 10, letterSpacing: '0.16em', color: 'var(--as-mut)', textTransform: 'uppercase', marginBottom: 6 }}>{strings.maturityProfile}</div>
          <svg viewBox="0 0 440 400" width="100%" style={{ maxWidth: 430, display: 'block', margin: '0 auto' }}>
            {radar.rings.map((r, i) => <polygon key={i} points={r.points} fill="none" stroke="var(--as-line)" strokeWidth="1" />)}
            {radar.axes.map((a, i) => <line key={i} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke="var(--as-line)" strokeWidth="1" />)}
            <polygon points={radar.points} fill={radarFill} stroke={radarStroke} strokeWidth="2" strokeLinejoin="round" />
            {radar.verts.map((v, i) => <circle key={i} cx={v.x} cy={v.y} r="4.6" fill={PALETTE[i]} stroke="var(--as-surface)" strokeWidth="1.5" />)}
            {labels.map((l, i) => (
              <text key={i} x={l.x} y={l.y} textAnchor={l.anchor} dominantBaseline="middle" fontFamily="IBM Plex Mono" fontSize="11" fill="var(--as-mut)">{l.name}</text>
            ))}
          </svg>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ ...cardStyle, borderRadius: 12, padding: 22 }}>
            <div style={{ fontFamily: 'var(--as-mono)', fontSize: 10, letterSpacing: '0.16em', color: 'var(--as-mut)', textTransform: 'uppercase' }}>{strings.integratedMaturity}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 8 }}>
              <span style={{ fontFamily: 'var(--as-display)', fontWeight: 600, fontSize: 56, lineHeight: 1, color: minV === 4 ? 'var(--as-gold)' : overall.stroke }}>{minV}</span>
              <span style={{ fontFamily: 'var(--as-head)', fontWeight: 600, fontSize: 18, color: 'var(--as-ink)' }}>{overall.shortLabel}</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--as-mut)', margin: '10px 0 0' }}>
              {strings.integratedFootnote}
              <br />
              <span style={{ fontFamily: 'var(--as-mono)', fontSize: 10, color: 'var(--as-faint)' }}>{strings.citeSection41}</span>
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ ...cardStyle, borderRadius: 12, padding: 18 }}>
              <div style={{ fontFamily: 'var(--as-mono)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--as-mut)', textTransform: 'uppercase' }}>{strings.avgDimension}</div>
              <div style={{ fontFamily: 'var(--as-head)', fontWeight: 700, fontSize: 28, marginTop: 6, color: 'var(--as-ink)' }}>
                {overall.avg}<span style={{ fontSize: 15, color: 'var(--as-mut)', fontWeight: 500 }}> / 4</span>
              </div>
            </div>
            <div style={{ ...cardStyle, borderRadius: 12, padding: 18 }}>
              <div style={{ fontFamily: 'var(--as-mono)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--as-mut)', textTransform: 'uppercase' }}>{strings.strongest}</div>
              <div style={{ fontFamily: 'var(--as-head)', fontWeight: 600, fontSize: 15, marginTop: 6, lineHeight: 1.25, color: 'var(--as-ink)' }}>{overall.strong}</div>
            </div>
          </div>
        </div>
      </div>

      <div data-print-break="" style={{ ...cardStyle, borderRadius: 12, padding: 24, marginTop: 24 }}>
        <h3 style={{ fontFamily: 'var(--as-head)', fontWeight: 600, fontSize: 18, margin: '0 0 18px', color: 'var(--as-ink)' }}>{strings.maturityByDimension}</h3>
        {bars.map((b) => (
          <div key={b.name} style={{ display: 'grid', gridTemplateColumns: '200px 1fr 132px', alignItems: 'center', gap: 16, padding: '9px 0', borderTop: '1px solid var(--as-line)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, fontWeight: 500, color: 'var(--as-ink)' }}>
              <span style={{ flex: 'none', width: 10, height: 10, borderRadius: 3, background: b.color }} />
              {b.name}
            </span>
            <div style={{ display: 'flex', gap: 5 }}>
              {[1, 2, 3, 4].map((s) => (
                <div key={s} style={{ flex: 1, height: 11, borderRadius: 3, background: s <= b.val ? b.color : 'var(--as-line-strong)' }} />
              ))}
            </div>
            <span style={{ fontFamily: 'var(--as-mono)', fontSize: 11, letterSpacing: '0.06em', color: 'var(--as-mut)', textAlign: 'right' }}>{b.label}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 30 }}>
        <h3 style={{ fontFamily: 'var(--as-head)', fontWeight: 600, fontSize: 20, margin: '0 0 4px', color: 'var(--as-ink)' }}>{strings.priorityNextMoves}</h3>
        <p style={{ fontSize: 14, color: 'var(--as-mut)', margin: '0 0 18px', maxWidth: '84ch' }}>{strings.priorityNextMovesDesc}</p>
        {allMaxed && (
          <div style={{ border: '1px solid var(--as-gold)', borderRadius: 12, background: 'var(--as-gold-soft)', padding: 24, fontSize: 15, lineHeight: 1.55, color: 'var(--as-ink)' }}>
            {strings.allMaxed}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {recs.map((rec) => (
            <div key={rec.num} data-print-break="" style={{ ...cardStyle, borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                <span style={{ fontFamily: 'var(--as-head)', fontWeight: 600, fontSize: 16, color: 'var(--as-ink)' }}>{rec.name}</span>
                <span style={{ fontFamily: 'var(--as-mono)', fontSize: 10, color: 'var(--as-mut)', letterSpacing: '0.08em' }}>{rec.num}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '10px 0 14px', fontFamily: 'var(--as-mono)', fontSize: 11, letterSpacing: '0.04em' }}>
                <span style={{ color: 'var(--as-mut)' }}>{rec.from}</span>
                <span style={{ color: 'var(--as-line-strong)' }}>→</span>
                <span style={{ color: 'var(--as-emerald)', fontWeight: 500 }}>{rec.to}</span>
              </div>
              {rec.items.map((it, i) => (
                <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ flex: 'none', width: 16, height: 16, borderRadius: 4, border: '1.5px solid var(--as-line-strong)', marginTop: 1 }} />
                  <span style={{ fontSize: 13, lineHeight: 1.45, color: 'var(--as-sub)' }}>{it}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div data-print-hide="" style={{ marginTop: 34, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button onClick={onEditAnswers} style={{ padding: '13px 22px', border: '1px solid var(--as-line-strong)', borderRadius: 7, background: 'var(--as-surface)', color: 'var(--as-ink)', fontFamily: 'var(--as-head)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          {strings.editAnswers}
        </button>
        <button onClick={onPrint} style={{ padding: '13px 22px', border: '1px solid var(--as-line-strong)', borderRadius: 7, background: 'var(--as-surface)', color: 'var(--as-ink)', fontFamily: 'var(--as-head)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          {strings.printPage}
        </button>
        <button onClick={onRestart} style={{ padding: '13px 22px', border: '1px solid var(--as-line-strong)', borderRadius: 7, background: 'var(--as-surface)', color: 'var(--as-danger)', fontFamily: 'var(--as-head)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          {strings.restart}
        </button>
      </div>
    </div>
  )
}
