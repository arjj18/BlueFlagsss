export const config = {
  runtime: 'edge'
}

const SYSTEM_PROMPT = `You are an expert F1 analyst with comprehensive knowledge of Formula 1 racing.

The current 2026 F1 driver lineup is:
- Red Bull Racing: Max Verstappen, Liam Lawson
- Ferrari: Lewis Hamilton, Charles Leclerc
- McLaren: Lando Norris, Oscar Piastri
- Mercedes: George Russell, Kimi Antonelli
- Aston Martin: Fernando Alonso, Lance Stroll
- Alpine: Pierre Gasly, Franco Colapinto
- Williams: Alexander Albon, Carlos Sainz
- Racing Bulls: Isack Hadjar, Arvid Lindblad
- Kick Sauber: Nico Hulkenberg, Gabriel Bortoleto
- Haas: Oliver Bearman, Esteban Ocon
- Cadillac: Sergio Perez, Valtteri Bottas

Base predictions on:
- The 2026 driver and constructor strengths shown so far this season
- Historical performance at each circuit by each driver and team
- Circuit characteristics that suit certain car design philosophies
- Typical tyre behaviour and pit stop strategy windows at each venue
- Championship pressure on key title contenders

Be specific and name actual drivers. Give well reasoned predictions not vague answers.`

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    console.error('[predict/race] ANTHROPIC_API_KEY is not set')
    return new Response(JSON.stringify({
      error: 'API key not configured on server'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const race = body.race
  const round = body.round

  if (typeof race !== 'string' || !race.trim() || race.length > 100 || typeof round !== 'number') {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  console.log('[predict/race] API called for race:', race, 'round:', round)
  console.log('[predict/race] Model: claude-haiku-4-5-20251001')

  const prompt = `Generate a race prediction for the 2026 ${race} Grand Prix (Round ${round}).

Return ONLY valid JSON with no markdown or code fences. IMPORTANT: every position claim in "wildcard" and "factors" must match the "top10" array exactly — do not say a driver finishes top 6 if they are not in the top 10.
{
  "headline": "Bold punchy one-liner prediction (max 12 words)",
  "winner": { "driver": "Full Name", "team": "Team", "confidence": "high|medium|low" },
  "podium": [
    { "pos": 1, "driver": "Full Name", "team": "Team", "note": "One reason why (max 10 words)" },
    { "pos": 2, "driver": "Full Name", "team": "Team", "note": "One reason why (max 10 words)" },
    { "pos": 3, "driver": "Full Name", "team": "Team", "note": "One reason why (max 10 words)" }
  ],
  "top10": ["Driver 1", "Driver 2", "Driver 3", "Driver 4", "Driver 5", "Driver 6", "Driver 7", "Driver 8", "Driver 9", "Driver 10"],
  "factors": ["Key factor 1 (max 12 words)", "Key factor 2", "Key factor 3", "Key factor 4"],
  "wildcard": "One surprise or upset to watch (max 15 words)",
  "championshipImpact": "What this race could mean for the title fight (max 20 words)"
}`

  try {
    console.log('[predict/race] Calling Anthropic API...')
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    console.log('[predict/race] Anthropic response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[predict/race] Anthropic error:', errorText)
      return new Response(JSON.stringify({
        error: `Anthropic API error (${response.status}): ${errorText}`
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const data = await response.json()

    const text = (data.content || [])
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text ?? '')
      .join('')

    console.log('[predict/race] Response text length:', text.length)

    const jsonText = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
    const normalised = jsonText.replace(/Kick Sauber/g, 'Audi').replace(/Sauber/g, 'Audi')
    const parsed = JSON.parse(normalised)

    return new Response(JSON.stringify({
      ...parsed,
      race,
      round,
      generatedAt: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    console.error('[predict/race] Error:', error.message)
    return new Response(JSON.stringify({
      error: error.message || 'Failed to generate prediction. Please try again.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
