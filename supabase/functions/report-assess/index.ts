// AI Report Check (beta) — takes report text extracted client-side and asks
// Claude to judge each TTCMM capability as evidenced / not evidenced / not
// enough info, with a short quoted snippet per judgment. The result is a
// DRAFT: the frontend always shows every judgment for human review before
// any of it is treated as a real assessment.
//
// Deploy: supabase functions deploy report-assess
// Secret:  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//
// Invoked via supabase-js (`supabase.functions.invoke`), which attaches the
// anon key automatically — same default JWT verification as the REST API,
// no special deploy flags needed.

import capabilityCatalog from './capabilities.json' with { type: 'json' }

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

const allCapabilities = capabilityCatalog.dimensions.flatMap((d: any) =>
  d.capabilities.map((c: any) => ({ id: c.id, dimension: d.id, stage: c.stage, text: c.text }))
)

const SYSTEM_PROMPT = `You are assessing an uploaded organizational report (sustainability report, digital strategy document, annual report, etc.) against a fixed Twin Transformation Capability Maturity Model (TTCMM) checklist.

For every capability id in the checklist, decide:
- "yes" — the report gives clear, specific evidence this capability is in place.
- "no" — the report is specific enough to say this capability is explicitly absent or contradicted.
- "na" — the report does not say enough either way to judge (this should be the most common answer; do not guess).

Be conservative: only say "yes" or "no" when the report text actually supports it. Marketing language ("we are committed to sustainability") without concrete evidence of the specific capability should usually be "na", not "yes".

For every "yes" or "no", include a short verbatim quote (<=200 characters) from the report as evidence. For "na", leave the quote empty.

You must call the submit_assessment tool exactly once with a judgment for every single capability id in the checklist — do not skip any.`

async function callClaude(reportText: string, lang: string) {
  const capabilityList = allCapabilities
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
    const knownIds = new Set(allCapabilities.map((c) => c.id))
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
