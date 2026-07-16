// TTCMM stage-derivation + pathway logic. Ported verbatim into the assessment
// Component. caps: { [capId]: 'yes'|'no'|'na' }. dimCaps: [{id,stage,set}].

export function deriveStage(caps, dimCaps) {
  const stageComplete = (stage) => {
    const items = dimCaps.filter(c => c.stage === stage);
    // N/A is excluded (neither blocks nor advances); vacuously complete if none applicable
    const applicable = items.filter(c => caps[c.id] !== 'na');
    return applicable.every(c => caps[c.id] === 'yes');
  };
  const allAnswered = dimCaps.every(c => caps[c.id] === 'yes' || caps[c.id] === 'no' || caps[c.id] === 'na');
  let derived = 0;
  for (let n = 1; n <= 4; n++) {
    let ok = true;
    for (let k = 1; k <= n; k++) { if (!stageComplete(k)) { ok = false; break; } }
    if (ok) derived = n; else break;   // a later fulfilled stage cannot skip an earlier gap
  }
  return { stage: derived, emerging: derived === 0, complete: allAnswered };
}

// Aggregate stage-1 DT vs ST fulfillment across all dimensions.
// Deep responses win; otherwise fall back to the quick pick (stage>=1 => stage-1 fulfilled).
export function detectPathway(dims, caps, answers) {
  let dtYes = 0, dtTot = 0, stYes = 0, stTot = 0;
  for (const d of dims) {
    for (const c of d.capabilities.filter(c => c.stage === 1)) {
      const r = caps[c.id];
      let applicable = true, fulfilled = false;
      if (r === 'yes' || r === 'no' || r === 'na') {
        if (r === 'na') applicable = false; else fulfilled = (r === 'yes');
      } else {
        const q = answers[d.id];
        if (q === undefined || q === null) applicable = false; else fulfilled = (q >= 1);
      }
      if (!applicable) continue;
      if (c.set === 'dt') { dtTot++; if (fulfilled) dtYes++; }
      else { stTot++; if (fulfilled) stYes++; }
    }
  }
  const dtR = dtTot ? dtYes / dtTot : 0, stR = stTot ? stYes / stTot : 0, T = 0.6;
  let key = 'newcomer';
  if (dtR >= T && stR >= T) key = 'climbing';
  else if (dtR >= T) key = 'dt';
  else if (stR >= T) key = 'st';
  return { key, dtR, stR, hasData: (dtTot + stTot) > 0 };
}
