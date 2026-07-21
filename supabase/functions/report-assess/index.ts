// AI Report Check (beta) — takes report text extracted client-side and asks
// Claude to judge each TTCMM capability as evidenced / not evidenced / not
// enough info, with a short quoted snippet per judgment. The result is a
// DRAFT: the frontend always shows every judgment for human review before
// any of it is treated as a real assessment.
//
// Deploy: supabase functions deploy report-assess
//   (or paste this whole file into the Supabase Dashboard's Edge Functions
//   editor — kept single-file, no imports, so it works either way)
// Secret:  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//
// Invoked via supabase-js (`supabase.functions.invoke`), which attaches the
// anon key automatically — same default JWT verification as the REST API,
// no special deploy flags needed.
//
// The capability catalog below is a generated snapshot of ttcmm.json's
// {id, dimension, stage, text} fields — regenerate if capabilities change.
const CAPABILITY_CATALOG = [
  { id: 'strategy.s1.dt.0', dimension: 'strategy', stage: 1, text: 'Understand the economic potential of digital transformation' },
  { id: 'strategy.s1.dt.1', dimension: 'strategy', stage: 1, text: 'Foster the use of digital technologies' },
  { id: 'strategy.s1.st.0', dimension: 'strategy', stage: 1, text: 'Understand sustainability as a must-do' },
  { id: 'strategy.s1.st.1', dimension: 'strategy', stage: 1, text: 'Foster the performance of a life-cycle analysis' },
  { id: 'strategy.s2.int.0', dimension: 'strategy', stage: 2, text: 'Develop a twin transformation strategy with measurable, non-mutually-exclusive digitalization and sustainability objectives' },
  { id: 'strategy.s2.int.1', dimension: 'strategy', stage: 2, text: 'Strengthen digitalization and sustainability investments' },
  { id: 'strategy.s2.int.2', dimension: 'strategy', stage: 2, text: 'Establish digitalization and sustainability KPIs' },
  { id: 'strategy.s2.int.3', dimension: 'strategy', stage: 2, text: 'Foster development through (top) management commitment' },
  { id: 'strategy.s3.int.0', dimension: 'strategy', stage: 3, text: 'Foster implementation through (top) management' },
  { id: 'strategy.s3.int.1', dimension: 'strategy', stage: 3, text: 'Integrate investments in twin transformation innovations' },
  { id: 'strategy.s3.int.2', dimension: 'strategy', stage: 3, text: 'Allow integrated digital & sustainability changes to the value proposition and organizational identity' },
  { id: 'strategy.s4.int.0', dimension: 'strategy', stage: 4, text: 'Evaluate activities against twin transformation objectives' },
  { id: 'strategy.s4.int.1', dimension: 'strategy', stage: 4, text: 'Develop twin transformation business models' },
  { id: 'culture.s1.dt.0', dimension: 'culture', stage: 1, text: 'Develop human capital regarding digital skills' },
  { id: 'culture.s1.st.0', dimension: 'culture', stage: 1, text: 'Develop human capital regarding sustainability skills' },
  { id: 'culture.s2.int.0', dimension: 'culture', stage: 2, text: 'Enable creativity and self-realization to foster digital and sustainability innovation' },
  { id: 'culture.s2.int.1', dimension: 'culture', stage: 2, text: 'Introduce values underlining the vision of a digital and sustainable organization' },
  { id: 'culture.s3.int.0', dimension: 'culture', stage: 3, text: 'Establish twin transformation training for employees' },
  { id: 'culture.s3.int.1', dimension: 'culture', stage: 3, text: 'Enable new digital and self-determined work' },
  { id: 'culture.s4.int.0', dimension: 'culture', stage: 4, text: 'Integrate twin transformation KPIs in reward systems of employees and (top) management' },
  { id: 'ecosystem.s1.dt.0', dimension: 'ecosystem', stage: 1, text: 'Enhance transparency in supply chains using digital technologies' },
  { id: 'ecosystem.s1.st.0', dimension: 'ecosystem', stage: 1, text: 'Foster dialogue with partners' },
  { id: 'ecosystem.s2.int.0', dimension: 'ecosystem', stage: 2, text: 'Reconfigure relationships with partners based on data analytics that enhance the sustainability of products / services' },
  { id: 'ecosystem.s3.int.0', dimension: 'ecosystem', stage: 3, text: 'Integrate partners’ twin transformation knowledge and competencies gained through established dialogue' },
  { id: 'ecosystem.s4.int.0', dimension: 'ecosystem', stage: 4, text: 'Influence legislators on twin transformation standards' },
  { id: 'products.s1.dt.0', dimension: 'products', stage: 1, text: 'Foster the development of digital services' },
  { id: 'products.s1.st.0', dimension: 'products', stage: 1, text: 'Foster the collection of environmental and social sustainability data on products / services' },
  { id: 'products.s2.int.0', dimension: 'products', stage: 2, text: 'Reconfigure product development teams to include sustainability and digital specialists' },
  { id: 'products.s3.int.0', dimension: 'products', stage: 3, text: 'Redesign or develop products and services as per twin transformation objectives' },
  { id: 'products.s3.int.1', dimension: 'products', stage: 3, text: 'Establish data analytics to enhance the sustainability of products / services' },
  { id: 'products.s4.int.0', dimension: 'products', stage: 4, text: 'Focus on cradle-to-cradle approaches' },
  { id: 'operations.s1.dt.0', dimension: 'operations', stage: 1, text: 'Foster integrated information, communication and operation systems' },
  { id: 'operations.s1.st.0', dimension: 'operations', stage: 1, text: 'Foster criteria to digitally evaluate the sustainability performance of operations' },
  { id: 'operations.s2.int.0', dimension: 'operations', stage: 2, text: 'Establish data-based (sustainability) monitoring' },
  { id: 'operations.s2.int.1', dimension: 'operations', stage: 2, text: 'Establish cross-departmental collaboration' },
  { id: 'operations.s3.int.0', dimension: 'operations', stage: 3, text: 'Reconfigure layouts, manufacturing and logistical processes for sustainability effectiveness' },
  { id: 'operations.s4.int.0', dimension: 'operations', stage: 4, text: 'Establish data analytics to continuously improve the twin transformation performance of operations' },
  { id: 'technology.s1.dt.0', dimension: 'technology', stage: 1, text: 'Establish data governance mechanisms to enhance data and information sovereignty' },
  { id: 'technology.s1.st.0', dimension: 'technology', stage: 1, text: 'Build awareness for sustainability within the technology stack (Green / Effective IT)' },
  { id: 'technology.s1.st.1', dimension: 'technology', stage: 1, text: 'Implement environmental, social & governance (ESG) controlling' },
  { id: 'technology.s2.int.0', dimension: 'technology', stage: 2, text: 'Establish sustainable internal processes and technical infrastructure (Green / Effective IT)' },
  { id: 'technology.s3.int.0', dimension: 'technology', stage: 3, text: 'Facilitate cross-organizational cooperation via an organization-wide data management tool' },
  { id: 'technology.s3.int.1', dimension: 'technology', stage: 3, text: 'Foster advanced analytics in management dashboards to monitor twin transformation objectives' },
  { id: 'technology.s4.int.0', dimension: 'technology', stage: 4, text: 'Exploit the sustainability potential of emerging digital technologies' },
  { id: 'technology.s4.int.1', dimension: 'technology', stage: 4, text: 'Establish a cross-ecosystem data management tool facilitating twin transformation' },
]

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
const MODEL = 'claude-sonnet-5'
const MAX_TEXT_CHARS = 150_000 // roughly bounds prompt cost/latency for one call

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } })
}

const SYSTEM_PROMPT = `You are assessing an uploaded organizational report (sustainability report, digital strategy document, annual report, etc.) against a fixed Twin Transformation Capability Maturity Model (TTCMM) checklist.

For every capability id in the checklist, decide:
- "yes" — the report gives clear, specific evidence this capability is in place.
- "no" — the report is specific enough to say this capability is explicitly absent or contradicted.
- "na" — the report does not say enough either way to judge (this should be the most common answer; do not guess).

Be conservative: only say "yes" or "no" when the report text actually supports it. Marketing language ("we are committed to sustainability") without concrete evidence of the specific capability should usually be "na", not "yes".

For every "yes" or "no", include a short verbatim quote (<=200 characters) from the report as evidence. For "na", leave the quote empty.

You must call the submit_assessment tool exactly once with a judgment for every single capability id in the checklist — do not skip any.`

async function callClaude(reportText: string, lang: string) {
  const capabilityList = CAPABILITY_CATALOG
    .map((c) => `${c.id} [dimension: ${c.dimension}, stage ${c.stage}]: ${c.text}`)
    .join('\n')

  const tool = {
    name: 'submit_assessment',
    description: 'Submit the capability-by-capability judgment for the report.',
    input_schema: {
      type: 'object',
      properties: {
        judgments: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              v: { type: 'string', enum: ['yes', 'no', 'na'] },
              quote: { type: 'string' },
            },
            required: ['id', 'v', 'quote'],
          },
        },
      },
      required: ['judgments'],
    },
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY ?? '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      tools: [tool],
      tool_choice: { type: 'tool', name: 'submit_assessment' },
      messages: [
        {
          role: 'user',
          content: `Report language: ${lang}\n\nCapability checklist:\n${capabilityList}\n\n--- Report text follows ---\n\n${reportText}`,
        },
      ],
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Anthropic API error ${res.status}: ${errText.slice(0, 500)}`)
  }

  const data = await res.json()
  const toolUse = data.content?.find((b: any) => b.type === 'tool_use' && b.name === 'submit_assessment')
  if (!toolUse) throw new Error('Model did not return a submit_assessment tool call.')
  return toolUse.input.judgments as { id: string; v: string; quote: string }[]
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS })
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405)
  if (!ANTHROPIC_API_KEY) return json({ error: 'ANTHROPIC_API_KEY is not configured on this function.' }, 500)

  try {
    const { text, lang } = await req.json()
    if (!text || typeof text !== 'string' || text.trim().length < 200) {
      return json({ error: 'No usable text was extracted from that file — is it a text-based PDF?' }, 400)
    }
    const truncated = text.length > MAX_TEXT_CHARS
    const reportText = truncated ? text.slice(0, MAX_TEXT_CHARS) : text

    const judgments = await callClaude(reportText, lang === 'de' ? 'de' : 'en')

    const caps: Record<string, string> = {}
    const evidence: Record<string, string> = {}
    const knownIds = new Set(CAPABILITY_CATALOG.map((c) => c.id))
    for (const j of judgments) {
      if (!knownIds.has(j.id)) continue
      caps[j.id] = ['yes', 'no', 'na'].includes(j.v) ? j.v : 'na'
      if (j.quote) evidence[j.id] = j.quote
    }

    return json({ caps, evidence, model: MODEL, truncated })
  } catch (err) {
    return json({ error: String((err as Error)?.message ?? err) }, 500)
  }
})
