export const config = {
  runtime: 'edge'
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: { message: 'API key not configured' } }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }

  const race = typeof body.race === 'string' ? body.race.trim().slice(0, 100) : ''
  const raceContext = race ? `\nThis set of suggestions is for: ${race}.` : ''

  const prompt = `You are generating suggestions for a Formula 1 Race Bingo card.

The Bingo grid itself is a 4×4 layout (16 squares), but it should be left COMPLETELY BLANK.
Your job is ONLY to generate 16 suggestion ideas that the user can choose from to fill the grid.

Goal:
Create fun, varied, realistic bingo events that cover ALL teams and drivers in the 2026 season.
Avoid focusing on a single team. Mix qualifying, race, reliability, strategy, and chaos events.

Rules:
- Use the full 2026 grid (all 22 drivers, all 11 teams).
- Include head-to-head events for teammates and rivals.
- Include team-wide performance events.
- Include reliability and chaos events.
- Include underdog or midfield surprises.
- Include restart events after safety cars or red flags.
- Include safety car / yellow flag / red flag events.
- Keep each event short, punchy, and bingo-card friendly (max 7 words).
- Avoid repeating the same team or driver too often.
- Output exactly 16 unique suggestions spread across these categories:

1. Driver vs Driver (qualifying or race) — 3 suggestions
   e.g. "Leclerc outqualifies Hamilton", "Hadjar outqualifies Verstappen", "Antonelli beats Russell"

2. Team-Wide Performance Events — 3 suggestions
   e.g. "Ferrari double top 5", "Red Bull finishes with only one car", "Williams scores points"

3. Reliability or Chaos Events — 3 suggestions
   e.g. "Red Bull mechanical failure", "Two cars collide at Turn 1", "Driver retires with engine failure"

4. Safety Car / Yellow Flag / Red Flag Events — 2 suggestions
   e.g. "2 or more safety cars", "Race ends under red flag"

5. Underdog or Midfield Surprise Events — 3 suggestions
   e.g. "Bearman finishes in the top 5", "Williams reaches Q3", "Bortoleto finishes in the top 10"

6. Restart Events (after Safety Car or Red Flag) — 2 suggestions
   e.g. "Chaos on the restart", "Driver gains 3+ positions on restart"
${raceContext}

Return ONLY a JSON array of exactly 16 short strings, no markdown, no other text:
["suggestion 1", "suggestion 2", ...]`

  try {
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const responseText = await anthropicResponse.text()
    let data: any

    try {
      data = JSON.parse(responseText)
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid response from AI' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }

    if (!anthropicResponse.ok || data.error) {
      return new Response(JSON.stringify({
        error: data.error || { message: `API error ${anthropicResponse.status}` }
      }), {
        status: anthropicResponse.status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }

    const text = data.content
      ?.filter((b: any) => b.type === 'text')
      ?.map((b: any) => b.text)
      ?.join('') || ''

    const clean = text.replace(/```json|```/g, '').trim()
    const start = clean.indexOf('[')
    const end = clean.lastIndexOf(']')

    if (start === -1 || end === -1) {
      return new Response(JSON.stringify({ error: 'AI returned invalid data' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }

    const suggestions = JSON.parse(clean.slice(start, end + 1))

    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      return new Response(JSON.stringify({ error: 'AI returned empty suggestions' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }

    return new Response(JSON.stringify({ suggestions }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'Failed to generate suggestions. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
}
