import { dimName, capText } from '../../ttcmm'
import OverlayRadar from './OverlayRadar'
import MoveBoard from './MoveBoard'
import { participantColor } from './OverlayRadar'

const C = { ink: '#17191C', sub: '#6B6B66', mut: '#9A9A95', line: '#E3E7E5' }

function referenceStage(dim, participants) {
  const vals = participants.map((p) => p.answers?.[dim.id]).filter((v) => v !== undefined && v !== null)
  return vals.length ? Math.min(...vals) : 0
}

function recheckDate(createdAt, lang) {
  const d = new Date(createdAt)
  d.setMonth(d.getMonth() + 3)
  return d.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function SummaryReport({ strings, lang, dims, session, participants, responses, moves, isFacilitator, onPrint }) {
  const nameById = {}
  participants.forEach((p, i) => { nameById[p.id] = p.name })
  const selectedIds = session.deep_dive_dimension_ids || []
  const solo = participants.length <= 1

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '10px 0 80px' }}>
      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '0.18em', color: C.mut, textTransform: 'uppercase' }}>
        {strings.wsSummaryTitle}{session.company_name ? ` · ${session.company_name}` : ''}
      </div>
      <p style={{ fontSize: 14.5, color: C.sub, margin: '10px 0 0', maxWidth: '70ch' }}>{strings.wsSummaryIntro}</p>

      <div data-print-break="" style={{ border: `1px solid ${C.line}`, borderRadius: 14, background: '#fff', padding: 22, marginTop: 22 }}>
        <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 17, margin: '0 0 12px' }}>{solo ? strings.wsSummaryDivergenceSolo : strings.wsSummaryDivergence}</h3>
        <OverlayRadar strings={strings} lang={lang} dims={dims} participants={participants} emptyLabel={strings.wsNoPreworkYet} />
      </div>

      <div style={{ marginTop: 24 }}>
        <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 17, margin: '0 0 12px' }}>{strings.wsSummaryCaptured}</h3>
        {selectedIds.length === 0 && <p style={{ fontSize: 13.5, color: C.mut, fontStyle: 'italic' }}>{strings.wsPickDimensions}</p>}
        {selectedIds.map((dimId) => {
          const dim = dims.find((d) => d.id === dimId)
          if (!dim) return null
          const ref = referenceStage(dim, participants)
          const nextStage = Math.min(ref + 1, 4)
          const caps = ref < 4 ? dim.capabilities.filter((c) => c.stage === nextStage) : []
          return (
            <div key={dimId} data-print-break="" style={{ marginBottom: 18 }}>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{dimName(dim, lang)}</div>
              {caps.map((cap) => {
                const forCap = responses.filter((r) => r.capability_id === cap.id && r.text.trim())
                if (forCap.length === 0) return null
                return (
                  <div key={cap.id} style={{ border: `1px solid ${C.line}`, borderRadius: 10, background: '#FAFBFA', padding: 14, marginBottom: 10 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 8 }}>{capText(cap, lang)}</div>
                    {forCap.map((r, i) => (
                      <div key={r.id} style={{ fontSize: 12.5, lineHeight: 1.5, margin: '4px 0' }}>
                        <span style={{ color: participantColor(participants.findIndex((p) => p.id === r.participant_id)), fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5 }}>
                          {nameById[r.participant_id] || '?'} · {r.prompt_type}
                        </span>{' '}
                        <span style={{ color: C.ink }}>{r.text}</span>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      <div data-print-break="" style={{ marginTop: 24 }}>
        <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 17, margin: '0 0 12px' }}>{strings.wsSummaryMoves}</h3>
        {moves.length === 0 ? <p style={{ fontSize: 13.5, color: C.mut, fontStyle: 'italic' }}>{strings.wsSummaryNoMoves}</p> : <MoveBoard strings={strings} moves={moves} editable={false} />}
      </div>

      <p style={{ marginTop: 22, fontFamily: "'IBM Plex Mono',monospace", fontSize: 12.5, color: C.sub }}>
        {strings.wsSummaryRecheck(recheckDate(session.created_at, lang))}
      </p>

      {isFacilitator && (
        <div data-print-hide="" style={{ marginTop: 28, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button onClick={onPrint} style={{ padding: '13px 22px', border: `1px solid #C6CBC8`, borderRadius: 7, background: '#fff', color: C.ink, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 14 }}>
            {strings.wsPrint}
          </button>
          <button disabled title={strings.wsEmailStubNote} style={{ padding: '13px 22px', border: `1px solid #C6CBC8`, borderRadius: 7, background: '#F2F4F3', color: C.mut, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 14, cursor: 'not-allowed' }}>
            {strings.wsEmailStub}
          </button>
        </div>
      )}
      {isFacilitator && <p data-print-hide="" style={{ fontSize: 12, color: C.mut, marginTop: 8 }}>{strings.wsEmailStubNote}</p>}
    </div>
  )
}
