import { useState } from 'react'
import { DIMENSIONS, dimName } from '../ttcmm'
import { useWorkshopSession } from './useWorkshopSession'
import { usePrefersReducedMotion } from './hooks'
import OverlayRadar from './components/OverlayRadar'
import SpreadChart from './components/SpreadChart'
import DeepDiveView from './components/DeepDiveView'
import MoveBoard from './components/MoveBoard'
import SummaryReport from './components/SummaryReport'
import PreworkFlow from './components/PreworkFlow'

const C = { ink: '#17191C', sub: '#6B6B66', mut: '#9A9A95', line: '#E3E7E5' }

export default function ParticipantRoom({ strings, lang, code, participant: initialParticipant }) {
  const [participant, setParticipant] = useState(initialParticipant)
  const { session, participants, responses, moves, loading, error } = useWorkshopSession(participant.sessionId)
  const reducedMotion = usePrefersReducedMotion()

  if (loading) return <p style={{ padding: 40, color: C.mut }}>…</p>
  if (error || !session) return <p style={{ padding: 40, color: '#9A2B2B' }}>{strings.wsNoSession}</p>

  // Keep the live copy of "me" in sync with realtime updates to my own row
  // (e.g. a second tab), while PreworkFlow still writes through immediately.
  const liveMe = participants.find((p) => p.id === participant.id) || participant
  const mergedParticipant = { ...participant, ...liveMe }

  const phaseLabel = { prework: strings.wsPhasePrework, opening: strings.wsPhaseOpening, calibration: strings.wsPhaseCalibration, deepdive: strings.wsPhaseDeepdive, prioritization: strings.wsPhasePrioritization, summary: strings.wsPhaseSummary }
  const calibDim = DIMENSIONS.find((d) => d.id === session.active_dimension_id) || DIMENSIONS[0]

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 0 90px' }}>
      <div style={{ padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '0.1em', color: C.mut, textTransform: 'uppercase' }}>{phaseLabel[session.phase]}</span>
        <span style={{ fontSize: 13, color: C.sub }}>{mergedParticipant.name}</span>
      </div>

      <div style={{ marginTop: 14 }}>
        {session.phase === 'prework' && (
          <PreworkFlow strings={strings} lang={lang} participant={mergedParticipant} onParticipantUpdate={setParticipant} />
        )}

        {session.phase === 'opening' && (
          <div style={{ padding: '0 24px' }}>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22, margin: '0 0 6px' }}>{strings.wsOpeningTitle}</h2>
            <p style={{ fontSize: 13.5, color: C.sub, marginBottom: 18 }}>{strings.wsOpeningIntro}</p>
            <OverlayRadar strings={strings} lang={lang} dims={DIMENSIONS} participants={participants} emptyLabel={strings.wsNoPreworkYet} />
          </div>
        )}

        {session.phase === 'calibration' && (
          <div style={{ padding: '0 24px' }}>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22, margin: '0 0 6px' }}>{strings.wsCalibrationTitle}</h2>
            <p style={{ fontSize: 13.5, color: C.sub }}>{strings.wsCalibrationIntro}</p>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 17, marginTop: 14, textAlign: 'center' }}>{dimName(calibDim, lang)}</div>
            <SpreadChart strings={strings} dimension={calibDim} participants={participants} />
          </div>
        )}

        {session.phase === 'deepdive' && (
          <div style={{ padding: '0 24px' }}>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22, margin: '0 0 6px' }}>{strings.wsDeepdiveTitle}</h2>
            <p style={{ fontSize: 13.5, color: C.sub, marginBottom: 18 }}>{strings.wsDeepdiveIntro}</p>
            <DeepDiveView
              strings={strings} lang={lang} dims={DIMENSIONS} session={session} participants={participants} responses={responses}
              participant={mergedParticipant} sessionId={participant.sessionId} isFacilitator={false} reducedMotion={reducedMotion}
            />
          </div>
        )}

        {session.phase === 'prioritization' && (
          <div style={{ padding: '0 24px' }}>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22, margin: '0 0 6px' }}>{strings.wsPrioritizationTitle}</h2>
            <p style={{ fontSize: 13.5, color: C.sub, marginBottom: 18 }}>{strings.wsPrioritizationIntro}</p>
            <MoveBoard strings={strings} sessionId={participant.sessionId} moves={moves} editable={false} />
          </div>
        )}

        {session.phase === 'summary' && (
          <div style={{ padding: '0 24px' }}>
            <SummaryReport strings={strings} lang={lang} dims={DIMENSIONS} session={session} participants={participants} responses={responses} moves={moves} isFacilitator={false} />
          </div>
        )}
      </div>
    </div>
  )
}
