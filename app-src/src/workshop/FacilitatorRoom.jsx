import { useState } from 'react'
import { DIMENSIONS, dimName } from '../ttcmm'
import { useWorkshopSession } from './useWorkshopSession'
import { usePrefersReducedMotion } from './hooks'
import { updateSession } from './api'
import OverlayRadar from './components/OverlayRadar'
import SpreadChart from './components/SpreadChart'
import DeepDiveView from './components/DeepDiveView'
import MoveBoard from './components/MoveBoard'
import SummaryReport from './components/SummaryReport'

const C = { ink: '#17191C', sub: '#6B6B66', mut: '#9A9A95', line: '#E3E7E5' }
const PHASES = ['prework', 'opening', 'calibration', 'deepdive', 'prioritization', 'summary']

export default function FacilitatorRoom({ strings, lang, sessionId }) {
  const { session, participants, responses, moves, loading, error } = useWorkshopSession(sessionId)
  const reducedMotion = usePrefersReducedMotion()
  const [copied, setCopied] = useState(false)

  if (loading) return <p style={{ padding: 40, color: C.mut }}>…</p>
  if (error || !session) return <p style={{ padding: 40, color: '#9A2B2B' }}>{strings.wsNoSession}</p>

  const phaseIdx = PHASES.indexOf(session.phase)
  const phaseLabel = { prework: strings.wsPhasePrework, opening: strings.wsPhaseOpening, calibration: strings.wsPhaseCalibration, deepdive: strings.wsPhaseDeepdive, prioritization: strings.wsPhasePrioritization, summary: strings.wsPhaseSummary }
  const joinUrl = `${window.location.origin}${window.location.pathname.replace(/workshop(\.de)?\.html$/, `workshop${lang === 'de' ? '.de' : ''}.html`)}?code=${session.code}`

  function goPhase(delta) {
    const next = PHASES[phaseIdx + delta]
    if (next) updateSession(sessionId, { phase: next })
  }

  function copyLink() {
    navigator.clipboard?.writeText(joinUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800) })
  }

  const calibIdx = Math.max(0, DIMENSIONS.findIndex((d) => d.id === session.active_dimension_id))
  const calibDim = DIMENSIONS[calibIdx] || DIMENSIONS[0]
  const solo = participants.length <= 1

  function setCalibDim(idx) {
    updateSession(sessionId, { active_dimension_id: DIMENSIONS[idx].id })
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '30px 32px 100px' }}>
      <div data-print-hide="" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap', borderBottom: `1px solid ${C.line}`, paddingBottom: 20 }}>
        <div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '0.14em', color: C.mut, textTransform: 'uppercase' }}>{strings.wsJoinCodeLabel}</div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 30, letterSpacing: '0.08em', marginTop: 4 }}>{session.code}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
            <button onClick={copyLink} style={{ padding: '7px 13px', border: `1px solid #C6CBC8`, borderRadius: 6, background: '#fff', fontSize: 12.5, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>
              {copied ? strings.wsCopyLinkDone : strings.wsCopyLink}
            </button>
            <span style={{ fontSize: 12.5, color: C.mut }}>{strings.wsParticipantsJoined(participants.length)}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '0.1em', color: C.mut, textTransform: 'uppercase' }}>
            {phaseLabel[session.phase]} · {phaseIdx + 1}/{PHASES.length}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => goPhase(-1)} disabled={phaseIdx <= 0} style={{ padding: '9px 14px', border: `1px solid #C6CBC8`, borderRadius: 7, background: '#fff', fontSize: 13, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, opacity: phaseIdx <= 0 ? 0.4 : 1 }}>
              {strings.wsPreviousPhase}
            </button>
            <button onClick={() => goPhase(1)} disabled={phaseIdx >= PHASES.length - 1} style={{ padding: '9px 14px', border: 'none', borderRadius: 7, background: C.ink, color: '#fff', fontSize: 13, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, opacity: phaseIdx >= PHASES.length - 1 ? 0.4 : 1 }}>
              {strings.wsNextPhase}
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 26 }}>
        {session.phase === 'prework' && (
          <div>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 24, margin: '0 0 6px' }}>{strings.wsPreworkTitle}</h2>
            <p style={{ fontSize: 14, color: C.sub, maxWidth: '64ch' }}>{strings.wsPreworkIntro}</p>
            {participants.length === 0 && <p style={{ fontSize: 14, color: C.mut, fontStyle: 'italic', marginTop: 16 }}>{strings.wsParticipantsJoined(0)}</p>}
            {participants.map((p) => {
              const done = p.answers && Object.keys(p.answers).length === DIMENSIONS.length
              return (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderTop: `1px solid ${C.line}` }}>
                  <span style={{ width: 18, height: 18, borderRadius: 5, background: done ? '#179C7D' : '#fff', border: `1.5px solid ${done ? '#179C7D' : C.line}`, color: '#fff', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{done ? '✓' : ''}</span>
                  <span style={{ fontSize: 14 }}>{p.name}</span>
                </div>
              )
            })}
          </div>
        )}

        {session.phase === 'opening' && (
          <div>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 24, margin: '0 0 6px' }}>{solo ? strings.wsOpeningTitleSolo : strings.wsOpeningTitle}</h2>
            <p style={{ fontSize: 14, color: C.sub, maxWidth: '64ch', marginBottom: 20 }}>{solo ? strings.wsOpeningIntroSolo : strings.wsOpeningIntro}</p>
            <OverlayRadar strings={strings} lang={lang} dims={DIMENSIONS} participants={participants} emptyLabel={strings.wsNoPreworkYet} />
          </div>
        )}

        {session.phase === 'calibration' && (
          <div>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 24, margin: '0 0 6px' }}>{strings.wsCalibrationTitle}</h2>
            <p style={{ fontSize: 14, color: C.sub, maxWidth: '64ch' }}>{solo ? strings.wsCalibrationIntroSolo : strings.wsCalibrationIntro}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 }}>
              <button onClick={() => setCalibDim(Math.max(0, calibIdx - 1))} disabled={calibIdx <= 0} style={{ padding: '9px 14px', border: `1px solid #C6CBC8`, borderRadius: 7, background: '#fff', fontSize: 13, opacity: calibIdx <= 0 ? 0.4 : 1 }}>←</button>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: C.mut }}>{strings.wsDimensionOf(calibIdx + 1, DIMENSIONS.length)}</div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 19, marginTop: 2 }}>{dimName(calibDim, lang)}</div>
              </div>
              <button onClick={() => setCalibDim(Math.min(DIMENSIONS.length - 1, calibIdx + 1))} disabled={calibIdx >= DIMENSIONS.length - 1} style={{ padding: '9px 14px', border: `1px solid #C6CBC8`, borderRadius: 7, background: '#fff', fontSize: 13, opacity: calibIdx >= DIMENSIONS.length - 1 ? 0.4 : 1 }}>→</button>
            </div>
            <SpreadChart strings={strings} dimension={calibDim} participants={participants} />
          </div>
        )}

        {session.phase === 'deepdive' && (
          <div>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 24, margin: '0 0 6px' }}>{strings.wsDeepdiveTitle}</h2>
            <p style={{ fontSize: 14, color: C.sub, maxWidth: '64ch', marginBottom: 20 }}>{solo ? strings.wsDeepdiveIntroSolo : strings.wsDeepdiveIntro}</p>
            <DeepDiveView
              strings={strings} lang={lang} dims={DIMENSIONS} session={session} participants={participants} responses={responses}
              sessionId={sessionId} isFacilitator reducedMotion={reducedMotion}
              onToggleDimension={(id) => {
                const cur = session.deep_dive_dimension_ids || []
                const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
                updateSession(sessionId, { deep_dive_dimension_ids: next })
              }}
            />
          </div>
        )}

        {session.phase === 'prioritization' && (
          <div>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 24, margin: '0 0 6px' }}>{strings.wsPrioritizationTitle}</h2>
            <p style={{ fontSize: 14, color: C.sub, maxWidth: '64ch', marginBottom: 20 }}>{strings.wsPrioritizationIntro}</p>
            <MoveBoard strings={strings} sessionId={sessionId} moves={moves} editable />
          </div>
        )}

        {session.phase === 'summary' && (
          <SummaryReport strings={strings} lang={lang} dims={DIMENSIONS} session={session} participants={participants} responses={responses} moves={moves} isFacilitator onPrint={() => window.print()} />
        )}
      </div>

      <div data-print-hide="" style={{ marginTop: 40, paddingTop: 16, borderTop: `1px solid ${C.line}` }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 12.5, color: C.mut, cursor: 'pointer' }}>
          <input type="checkbox" checked={!!session.research_opt_in} onChange={(e) => updateSession(sessionId, { research_opt_in: e.target.checked })} style={{ marginTop: 2 }} />
          {strings.wsResearchOptInLabel}
        </label>
      </div>
    </div>
  )
}
