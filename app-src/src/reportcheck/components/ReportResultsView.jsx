import { useState } from 'react'
import { PALETTE } from '../../ttcmm'
import { computeResultsModel } from '../../resultsMath'
import CapabilityReview from './CapabilityReview'

const cardStyle = { border: '1px solid var(--rc-border)', borderRadius: 'var(--rc-radius-lg)', background: 'var(--rc-surface)', boxShadow: 'var(--rc-shadow-soft)' }
const labelStyle = { fontFamily: 'var(--ws-font-mono)', fontSize: 10.5, letterSpacing: '0.14em', color: 'var(--rc-text-muted)', textTransform: 'uppercase' }
const sectionHeadingStyle = { fontFamily: 'var(--ws-font-head)', fontWeight: 700, fontSize: 19, margin: '0 0 4px', color: 'var(--rc-text-primary)' }

function useCopyFeedback() {
  const [copied, setCopied] = useState(false)
  function copy(text) {
    navigator.clipboard?.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800) })
  }
  return [copied, copy]
}

export default function ReportResultsView({
  strings, lang, dims, vals, isDeepList, capsByCapId, evidence, pathway,
  companyName, aiModel, truncated, savedRecord, saving,
  onSave, onEditAnswers, onPrint, onRestart,
}) {
  const model = computeResultsModel(strings, lang, dims, vals, isDeepList, capsByCapId, pathway)
  const { overall, bars, allMaxed, recs, radar, labels, radarFill, radarStroke, minV, maxV } = model
  const [copied, copy] = useCopyFeedback()

  const totalCaps = dims.reduce((n, d) => n + d.capabilities.length, 0)
  const supportedCaps = Object.values(capsByCapId).filter((v) => v === 'yes').length
  const detectedPathway = pathway.hasData ? model.pathways.find((p) => p.detected) : null
  const strengths = bars.filter((b) => maxV > 0 && b.val === maxV)

  const shareUrl = savedRecord ? `${window.location.origin}${window.location.pathname}?code=${savedRecord.code}` : ''

  async function handleShare() {
    if (!shareUrl) return
    if (navigator.share) {
      try { await navigator.share({ title: strings.rcBrand, url: shareUrl }); return } catch { /* user cancelled */ }
    }
    copy(shareUrl)
  }

  return (
    <div>
      {/* executive summary */}
      <div className="rc-animate-in" style={{ ...cardStyle, padding: '28px 28px 30px', marginBottom: 'var(--rc-space-5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={labelStyle}>{strings.resultsLabel}</div>
            {companyName && <div style={{ fontFamily: 'var(--ws-font-head)', fontWeight: 600, fontSize: 15, color: 'var(--rc-text-muted)', marginTop: 4 }}>{companyName}</div>}
          </div>
          {pathway.hasData !== undefined && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 20, background: 'var(--rc-surface-muted)', color: 'var(--rc-text-muted)' }}>
                {strings.rcCapabilitiesSupported(supportedCaps, totalCaps)}
              </span>
              {detectedPathway && (
                <span style={{ fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 20, background: 'var(--rc-brand-tint)', color: 'var(--rc-brand-deep)' }}>
                  {strings.rcPathwayBadge(detectedPathway.name)}
                </span>
              )}
            </div>
          )}
        </div>

        <h1 style={{ fontFamily: 'var(--ws-font-head)', fontWeight: 700, fontSize: 'clamp(28px,4vw,40px)', letterSpacing: '-0.02em', margin: '18px 0 0', color: 'var(--rc-text-primary)' }}>
          {overall.headline}
        </h1>
        <p style={{ fontSize: 15.5, lineHeight: 1.6, color: 'var(--rc-text-muted)', maxWidth: '72ch', margin: '12px 0 0' }}>{overall.desc}</p>

        {/* stage progression indicator */}
        <div style={{ marginTop: 26, display: 'flex', alignItems: 'center', gap: 6 }} role="img" aria-label={strings.rcProgressionLabel(minV)}>
          {[0, 1, 2, 3, 4].map((s) => (
            <div key={s} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                height: 8, borderRadius: 4,
                background: s <= minV ? 'var(--rc-brand)' : s === minV + 1 ? 'var(--rc-brand-tint)' : 'var(--rc-surface-muted)',
                border: s === minV + 1 ? '1.5px dashed var(--rc-brand)' : 'none',
              }} />
              <div style={{ fontSize: 10.5, marginTop: 6, fontWeight: s === minV ? 700 : 500, color: s === minV ? 'var(--rc-brand-deep)' : 'var(--rc-text-muted)' }}>
                {s}{s === minV ? ` · ${strings.rcCurrentStage}` : s === minV + 1 ? ` · ${strings.rcNextStage}` : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* visual profile */}
      <div className="rc-animate-in" style={{ ...cardStyle, padding: 24, marginBottom: 'var(--rc-space-5)' }}>
        <div style={labelStyle}>{strings.maturityProfile}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 24, marginTop: 12 }} className="rc-profile-grid">
          <svg viewBox="0 0 440 400" width="100%" style={{ maxWidth: 460, display: 'block', margin: '0 auto' }} role="img" aria-label={strings.wsRadarAccessibleTitle}>
            {radar.rings.map((r, i) => <polygon key={i} points={r.points} fill="none" stroke="var(--rc-border)" strokeWidth="1" />)}
            {radar.axes.map((a, i) => <line key={i} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke="var(--rc-border)" strokeWidth="1" />)}
            <polygon points={radar.points} fill={radarFill} stroke={radarStroke} strokeWidth="2" strokeLinejoin="round" />
            {radar.verts.map((v, i) => <circle key={i} cx={v.x} cy={v.y} r="4.6" fill={PALETTE[i]} stroke="#fff" strokeWidth="1.5" />)}
            {labels.map((l, i) => (
              <text key={i} x={l.x} y={l.y} textAnchor={l.anchor} dominantBaseline="middle" fontFamily="IBM Plex Mono" fontSize="11" fill="var(--rc-text-muted)">{l.name}</text>
            ))}
          </svg>
          <div>
            {bars.map((b) => (
              <div key={b.name} style={{ display: 'grid', gridTemplateColumns: '150px 1fr 120px', alignItems: 'center', gap: 12, padding: '8px 0', borderTop: '1px solid var(--rc-border)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 500, color: 'var(--rc-text-primary)' }}>
                  <span aria-hidden="true" style={{ flex: 'none', width: 9, height: 9, borderRadius: 3, background: b.color }} />
                  {b.name}
                </span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1, 2, 3, 4].map((s) => (
                    <div key={s} style={{ flex: 1, height: 9, borderRadius: 3, background: s <= b.val ? b.color : 'var(--rc-surface-muted)' }} />
                  ))}
                </div>
                <span style={{ fontFamily: 'var(--ws-font-mono)', fontSize: 10.5, letterSpacing: '0.04em', color: 'var(--rc-text-muted)', textAlign: 'right' }}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* strengths + priorities */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--rc-space-5)', marginBottom: 'var(--rc-space-5)' }}>
        <div className="rc-animate-in" style={{ ...cardStyle, padding: 22 }}>
          <h2 style={sectionHeadingStyle}>{strings.rcStrengthsTitle}</h2>
          <p style={{ fontSize: 13, color: 'var(--rc-text-muted)', margin: '0 0 16px' }}>{strings.rcStrengthsIntro}</p>
          {strengths.length === 0 && <p style={{ fontSize: 13.5, color: 'var(--rc-text-muted)', fontStyle: 'italic' }}>{strings.rcStrengthsEmpty}</p>}
          {strengths.map((s) => (
            <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: '1px solid var(--rc-border)' }}>
              <span aria-hidden="true" style={{ flex: 'none', width: 10, height: 10, borderRadius: 3, background: s.color }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--rc-text-primary)', flex: 1 }}>{s.name}</span>
              <span style={{ fontFamily: 'var(--ws-font-mono)', fontSize: 11.5, color: 'var(--rc-text-muted)' }}>{s.label}</span>
            </div>
          ))}
        </div>

        <div className="rc-animate-in" style={{ ...cardStyle, padding: 22 }}>
          <h2 style={sectionHeadingStyle}>{strings.rcNextStepsTitle}</h2>
          <p style={{ fontSize: 13, color: 'var(--rc-text-muted)', margin: '0 0 16px' }}>{strings.priorityNextMovesDesc}</p>
          {allMaxed && <p style={{ fontSize: 13.5, color: 'var(--rc-brand-deep)', fontWeight: 600 }}>{strings.allMaxed}</p>}
          {recs.slice(0, 4).map((rec) => (
            <div key={rec.num} style={{ padding: '12px 0', borderTop: '1px solid var(--rc-border)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '4px 8px', fontSize: 14, fontWeight: 600, color: 'var(--rc-text-primary)' }}>
                <span>{rec.name}</span>
                <span style={{ fontFamily: 'var(--ws-font-mono)', fontSize: 11, color: 'var(--rc-brand-deep)', fontWeight: 500, whiteSpace: 'nowrap' }}>{rec.from} → {rec.to}</span>
              </div>
              <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 12.5, color: 'var(--rc-text-muted)', lineHeight: 1.5 }}>
                {rec.items.slice(0, 3).map((it, i) => <li key={i}>{it}</li>)}
              </ul>
              {rec.items.length > 3 && <div style={{ fontSize: 11.5, color: 'var(--rc-text-muted)', marginTop: 4 }}>{strings.rcMoreItems(rec.items.length - 3)}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* evidence & detail — collapsed accordion, read-only */}
      <details className="rc-details rc-animate-in" style={{ ...cardStyle, padding: 22, marginBottom: 'var(--rc-space-5)' }}>
        <summary style={{ ...sectionHeadingStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
          {strings.rcEvidenceTitle(totalCaps)}
        </summary>
        <p style={{ fontSize: 13, color: 'var(--rc-text-muted)', margin: '10px 0 18px' }}>{strings.rcEvidenceIntro}</p>
        <CapabilityReview strings={strings} lang={lang} caps={capsByCapId} evidence={evidence || {}} readOnly />
      </details>

      {/* pathway explainer — supporting evidence, lower visual weight */}
      <details className="rc-details rc-animate-in" style={{ ...cardStyle, padding: 22, marginBottom: 'var(--rc-space-5)' }}>
        <summary style={{ ...sectionHeadingStyle, fontSize: 16 }}>{strings.pathwaysHeading}</summary>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--rc-text-muted)', margin: '10px 0 16px' }}>{strings.pathwaysIntro}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {model.pathways.map((p) => (
            <div key={p.key} style={{ border: `1.5px solid ${p.detected ? 'var(--rc-brand)' : 'var(--rc-border)'}`, borderRadius: 'var(--rc-radius-sm)', padding: 14, background: p.detected ? 'var(--rc-brand-tint)' : 'var(--rc-surface-muted)' }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: p.color }}>{p.name}</div>
              <p style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--rc-text-muted)', margin: '6px 0 0' }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </details>

      {/* result actions */}
      <div style={{ ...cardStyle, padding: 22 }} data-print-hide="">
        {!savedRecord ? (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <p style={{ fontSize: 13.5, color: 'var(--rc-text-muted)', margin: 0, flex: '1 1 260px' }}>{strings.rcSavePrompt}</p>
            <button onClick={onSave} disabled={saving} style={{ padding: '11px 20px', border: 'none', borderRadius: 'var(--rc-radius-sm)', background: 'var(--rc-brand)', color: '#fff', fontFamily: 'var(--ws-font-head)', fontWeight: 600, fontSize: 13.5 }}>
              {saving ? strings.rcSaving : strings.rcSaveLink}
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span aria-hidden="true" style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--rc-brand)', color: '#fff', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>
              <span style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--rc-text-primary)' }}>{strings.rcSavedSuccessTitle}</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--rc-text-muted)', margin: '0 0 16px' }}>{strings.rcSavedSuccessBody}</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={() => copy(shareUrl)} style={{ padding: '11px 18px', border: '1.5px solid var(--rc-brand)', borderRadius: 'var(--rc-radius-sm)', background: copied ? 'var(--rc-brand)' : 'var(--rc-surface)', color: copied ? '#fff' : 'var(--rc-brand-deep)', fontFamily: 'var(--ws-font-head)', fontWeight: 600, fontSize: 13.5, transition: 'background 140ms, color 140ms' }}>
                {copied ? strings.wsCopyLinkDone : strings.wsCopyLink}
              </button>
              <button onClick={handleShare} style={{ padding: '11px 18px', border: '1px solid var(--rc-border)', borderRadius: 'var(--rc-radius-sm)', background: 'var(--rc-surface)', color: 'var(--rc-text-primary)', fontFamily: 'var(--ws-font-head)', fontWeight: 600, fontSize: 13.5 }}>
                {strings.rcShareResult}
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--rc-border)' }}>
          <button onClick={onEditAnswers} style={{ padding: '10px 16px', border: '1px solid var(--rc-border)', borderRadius: 'var(--rc-radius-sm)', background: 'var(--rc-surface)', color: 'var(--rc-text-primary)', fontFamily: 'var(--ws-font-head)', fontWeight: 600, fontSize: 13 }}>
            {strings.rcBackToReview}
          </button>
          <button onClick={onPrint} style={{ padding: '10px 16px', border: '1px solid var(--rc-border)', borderRadius: 'var(--rc-radius-sm)', background: 'var(--rc-surface)', color: 'var(--rc-text-primary)', fontFamily: 'var(--ws-font-head)', fontWeight: 600, fontSize: 13 }}>
            {strings.rcPrintReport}
          </button>
          <button onClick={onRestart} style={{ padding: '10px 16px', border: '1px solid var(--rc-border)', borderRadius: 'var(--rc-radius-sm)', background: 'var(--rc-surface)', color: 'var(--rc-negative)', fontFamily: 'var(--ws-font-head)', fontWeight: 600, fontSize: 13 }}>
            {strings.rcNewAnalysis}
          </button>
        </div>

        {(aiModel || truncated) && (
          <p style={{ fontSize: 11, color: 'var(--rc-text-muted)', marginTop: 14, marginBottom: 0 }}>
            {aiModel && strings.rcMetaGeneratedWith(aiModel)}{aiModel && truncated ? ' · ' : ''}{truncated && strings.rcTruncatedNote}
          </p>
        )}
      </div>
    </div>
  )
}
