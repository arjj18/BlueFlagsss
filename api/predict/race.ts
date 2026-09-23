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
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not set')
    return new Response(JSON.stringify({
      error: { message: 'API key not configured on server' }
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const raceName = body.raceName || body.race || 'upcoming Grand Prix'
  const circuit = body.circuit || 'the circuit'
  const country = body.country || ''
  const round = body.round || ''
  const currentYear = new Date().getFullYear()

  console.log('[predict/race] race:', raceName, '| round:', round, '| model: claude-haiku-4-5-20251001')

  const prompt = `You are an expert F1 analyst with comprehensive knowledge of Formula 1 racing up to ${currentYear}.

Generate a detailed and confident race prediction for the ${raceName}${round ? ' (Round ' + round + ')' : ''} at ${circuit}${country ? ' in ' + country : ''} for the ${currentYear} Formula 1 World Championship season.

The complete ${currentYear} F1 driver lineup is:
- Red Bull Racing: Max Verstappen (#1), Liam Lawson (#30)
- Ferrari: Lewis Hamilton (#44), Charles Leclerc (#16)
- McLaren: Lando Norris (#4), Oscar Piastri (#81)
- Mercedes: George Russell (#63), Kimi Antonelli (#12)
- Aston Martin: Fernando Alonso (#14), Lance Stroll (#18)
- Alpine: Pierre Gasly (#10), Franco Colapinto (#43)
- Williams: Alexander Albon (#23), Carlos Sainz (#55)
- Racing Bulls: Isack Hadjar (#6), Arvid Lindblad (#5)
- Kick Sauber: Nico Hulkenberg (#27), Gabriel Bortoleto (#7)
- Haas: Oliver Bearman (#87), Esteban Ocon (#31)
- Cadillac: Sergio Perez (#11), Valtteri Bottas (#77)

Base your prediction on:
- Known ${currentYear} constructor and driver performance levels
- Historical race results at ${circuit} from previous seasons
- The unique characteristics of ${circuit} that suit certain car designs
- Current championship standings pressure on title contenders
- Typical tyre degradation and pit stop strategy at this venue

Be specific, name real drivers, and give confident well-reasoned predictions.

Structure your response using EXACTLY these emoji headers with nothing before the first one:

🥇 PREDICTED PODIUM
List P1, P2, P3 with the driver name, team, confidence percentage out of 100, and two sentences of reasoning for each position.

📋 PREDICTED TOP 10
List the full predicted finishing order from P1 to P10. For each position give the driver name and one brief reason.

⚙️ STRATEGY PREDICTION
Describe the expected tyre strategy for the leading teams. Include which compounds you expect to be used, typical pit stop windows at this circuit, and any likely undercut or overcut opportunities.

⚔️ KEY BATTLE
Describe one specific on-track battle between two named drivers that will define the race outcome. Explain why this battle matters and how you expect it to play out.

🎲 WILDCARD PREDICTION
Give one specific surprise prediction that most fans would not expect. Name the driver or team involved and give clear reasoning for why this could happen.

🏆 CHAMPIONSHIP IMPACT
Explain how different possible race outcomes could affect the Drivers World Championship and Constructors Championship standings. Be specific about gaps and scenarios.

📊 CONFIDENCE RATING
Give your overall confidence in this prediction out of 10. Explain what factors increase your confidence and what unknowns could change the outcome.

⚠️ Disclaimer: This prediction is based on historical data and known form up to ${currentYear}. Check the latest news for any grid penalties, mechanical issues, or weather forecasts before the race.`

  try {
    console.log('[predict/race] Calling Anthropic API...')
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    console.log('[predict/race] Anthropic response status:', anthropicResponse.status)

    const responseText = await anthropicResponse.text()
    let data: any

    try {
      data = JSON.parse(responseText)
    } catch {
      return new Response(JSON.stringify({
        error: { message: 'Invalid response from AI service' }
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    if (!anthropicResponse.ok || data.error) {
      console.error('[predict/race] Anthropic API error:', data.error)
      return new Response(JSON.stringify({
        error: data.error || { message: `API returned status ${anthropicResponse.status}` }
      }), {
        status: anthropicResponse.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    const predictionText = data.content
      ?.filter((b: any) => b.type === 'text')
      ?.map((b: any) => b.text)
      ?.join('') || ''

    if (!predictionText.trim()) {
      return new Response(JSON.stringify({
        error: { message: 'AI returned empty prediction' }
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    console.log('[predict/race] Prediction text length:', predictionText.length)

    return new Response(JSON.stringify({
      prediction: predictionText,
      race: raceName,
      circuit: circuit,
      generatedAt: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })

  } catch (error: any) {
    console.error('[predict/race] Error:', error.message)
    return new Response(JSON.stringify({
      error: { message: error.message || 'Internal server error' }
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}
