import { useEffect, useRef, useState } from 'react'
import { insertResponse, updateResponseText } from '../api'
import { participantColor } from './OverlayRadar'

const C = { ink: '#17191C', sub: '#6B6B66', mut: '#9A9A95', line: '#E3E7E5' }

function PromptColumn({ label, sessionId, dimensionId, capabilityId, promptType, participant, responses, participantIndex, reducedMotion }) {
  const mine = participant ? responses.find((r) => r.participant_id === participant.id) : null
  const others = responses.filter((r) => !participant || r.participant_id !== participant.id)
  const [text, setText] = useState(mine?.text || '')
  const responseIdRef = useRef(mine?.id || null)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (mine && !responseIdRef.current) responseIdRef.current = mine.id
  }, [mine])

  function handleChange(e) {
    const val = e.target.value
    setText(val)
    if (!participant) return
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      if (responseIdRef.current) {
        updateResponseText(responseIdRef.current, val).catch(() => {})
      } else {
        try {
          const row = await insertResponse({ sessionId, participantId: participant.id, dimensionId, capabilityId, promptType, text: val })
          responseIdRef.current = row.id
        } catch (err) {}
      }
    }, 400)
  }

  return (
    <div style={{ flex: '1 1 220px', minWidth: 200 }}>
      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, letterSpacing: '0.08em', color: C.mut, textTransform: 'uppercase', marginBottom: 8 }}>
        {label}
      </div>
      {participant && (
        <textarea
          value={text} onChange={handleChange} rows={2}
          style={{ width: '100%', boxSizing: 'border-box', padding: '9px 11px', borderRadius: 8, border: `1.5px solid ${C.line}`, fontSize: 13.5, fontFamily: 'inherit', resize: 'vertical' }}
        />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: participant ? 9 : 0 }}>
        {others.filter((r) => r.text.trim()).map((r) => (
          <div
            key={r.id}
            style={{
              border: `1px solid ${C.line}`, borderRadius: 8, background: '#fff', padding: '8px 10px',
              animation: reducedMotion ? 'none' : 'wsBubbleIn .25s ease-out',
            }}
          >
            <div style={{ fontSize: 10.5, fontFamily: "'IBM Plex Mono',monospace", color: participantColor(participantIndex(r.participant_id)), marginBottom: 3 }}>
              {r.__name}
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.4, color: C.ink, whiteSpace: 'pre-wrap' }}>{r.text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// All three prompts for one capability. `participant` present = editable
// (participant device); absent = read-only wall (facilitator display).
export default function CaptureWall({ strings, sessionId, dimensionId, capabilityId, capabilityLabel, participant, responses, participantIndex, reducedMotion }) {
  const forCap = responses.filter((r) => r.capability_id === capabilityId)
  const byPrompt = (pt) => forCap.filter((r) => r.prompt_type === pt)

  return (
    <div style={{ border: `1px solid ${C.line}`, borderRadius: 12, background: '#FAFBFA', padding: 18, marginBottom: 16 }}>
      <div style={{ fontSize: 14.5, fontWeight: 600, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 4 }}>{capabilityLabel}</div>
      <style>{'@keyframes wsBubbleIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}'}</style>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 14 }}>
        <PromptColumn label={strings.wsPromptBlocker} sessionId={sessionId} dimensionId={dimensionId} capabilityId={capabilityId} promptType="blocker" participant={participant} responses={byPrompt('blocker')} participantIndex={participantIndex} reducedMotion={reducedMotion} />
        <PromptColumn label={strings.wsPromptOwner} sessionId={sessionId} dimensionId={dimensionId} capabilityId={capabilityId} promptType="owner" participant={participant} responses={byPrompt('owner')} participantIndex={participantIndex} reducedMotion={reducedMotion} />
        <PromptColumn label={strings.wsPromptVisible} sessionId={sessionId} dimensionId={dimensionId} capabilityId={capabilityId} promptType="visible_change" participant={participant} responses={byPrompt('visible_change')} participantIndex={participantIndex} reducedMotion={reducedMotion} />
      </div>
    </div>
  )
}
