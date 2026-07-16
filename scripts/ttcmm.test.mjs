import { readFileSync } from 'node:fs';
import { deriveStage, detectPathway } from './ttcmm.logic.mjs';
const ttcmm = JSON.parse(readFileSync(new URL('../ttcmm.json', import.meta.url), 'utf8'));
const byId = Object.fromEntries(ttcmm.dimensions.map(d => [d.id, d]));
const capsOf = id => byId[id].capabilities.map(c => ({ id: c.id, stage: c.stage, set: c.set }));
let pass = 0, fail = 0;
const eq = (got, want, msg) => { if (JSON.stringify(got) === JSON.stringify(want)) { pass++; } else { fail++; console.log('FAIL', msg, '=> got', JSON.stringify(got), 'want', JSON.stringify(want)); } };

// helper: set all caps of a dim to a value
const all = (dimId, v) => Object.fromEntries(capsOf(dimId).map(c => [c.id, v]));

// 1) all fulfilled -> stage 4
eq(deriveStage(all('operations','yes'), capsOf('operations')).stage, 4, 'all yes -> 4');

// 2) skip-does-not-count: operations s1,s2 yes, s3 no, s4 yes -> 2
{
  const caps = all('operations','yes');
  for (const c of capsOf('operations')) { if (c.stage === 3) caps[c.id] = 'no'; }
  eq(deriveStage(caps, capsOf('operations')).stage, 2, 'skip example -> 2 (s4 fulfilled must not skip s3 gap)');
}

// 3) pre-stage-1 (emerging): a stage-1 cap not fulfilled -> 0
{
  const caps = all('strategy','yes');
  caps['strategy.s1.dt.0'] = 'no';
  const r = deriveStage(caps, capsOf('strategy'));
  eq([r.stage, r.emerging], [0, true], 'stage-1 gap -> emerging 0');
}

// 4) N/A excluded: mark the whole stage-3 N/A; s1,s2 yes, s4 yes -> stage 3 vacuously complete, s4 complete -> 4
{
  const caps = all('operations','yes');
  for (const c of capsOf('operations')) { if (c.stage === 3) caps[c.id] = 'na'; }
  eq(deriveStage(caps, capsOf('operations')).stage, 4, 'N/A stage-3 does not block -> 4');
}

// 5) N/A does not advance: s1 yes, s2 has one no + one na -> stage 2 incomplete -> derived 1
{
  const caps = all('operations','yes');
  const s2 = capsOf('operations').filter(c => c.stage === 2);
  caps[s2[0].id] = 'na'; caps[s2[1].id] = 'no';
  eq(deriveStage(caps, capsOf('operations')).stage, 1, 'N/A + a real gap in s2 -> stays at 1');
}

// 6) completeness gate
{
  const caps = all('ecosystem','yes'); delete caps['ecosystem.s4.int.0'];
  eq(deriveStage(caps, capsOf('ecosystem')).complete, false, 'unanswered cap -> not complete');
}

// 7) pathway: DT set fulfilled, ST set not (deep, all dims) -> 'dt'
{
  const caps = {};
  for (const d of ttcmm.dimensions) for (const c of d.capabilities) {
    if (c.stage === 1) caps[c.id] = (c.set === 'dt') ? 'yes' : 'no'; else caps[c.id] = 'no';
  }
  eq(detectPathway(ttcmm.dimensions, caps, {}).key, 'dt', 'DT fulfilled / ST not -> dt expert');
}
// 8) pathway: ST fulfilled, DT not -> 'st'
{
  const caps = {};
  for (const d of ttcmm.dimensions) for (const c of d.capabilities) caps[c.id] = (c.stage===1 && c.set==='st') ? 'yes' : 'no';
  eq(detectPathway(ttcmm.dimensions, caps, {}).key, 'st', 'ST fulfilled / DT not -> st expert');
}
// 9) pathway: both low -> newcomer
eq(detectPathway(ttcmm.dimensions, {}, { strategy:0, culture:0, ecosystem:0, products:0, operations:0, technology:0 }).key, 'newcomer', 'all quick 0 -> newcomer');
// 10) pathway: quick picks all >=1 -> both fulfilled -> climbing
eq(detectPathway(ttcmm.dimensions, {}, { strategy:2, culture:2, ecosystem:2, products:2, operations:2, technology:2 }).key, 'climbing', 'quick all >=1 -> climbing');

console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILURES'} : ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
