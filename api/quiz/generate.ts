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

  const mode = body.mode === 'preview' ? 'preview' : 'review'
  const race = typeof body.race === 'string' ? body.race.trim() : ''
  const currentYear = new Date().getFullYear()

  if (mode === 'preview' && !race) {
    return new Response(JSON.stringify({ error: 'A race name is required for preview quiz' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }

  const previewPrompt = `You are an F1 quiz master creating a preview quiz about the history of the ${race} Grand Prix circuit.

Generate exactly 10 multiple choice questions about the HISTORY of this circuit. Do not reference the ${currentYear} race as it has not happened yet. Focus entirely on historical facts from previous years.

Cover these 10 topics in order:
1. Which year was the first ever Formula 1 Grand Prix held at this circuit
2. Which driver has the most pole positions at this circuit all time
3. Describe a famous historical moment at this circuit without naming the driver or year — ask what happened or who was involved
4. How has this circuit changed from its original layout to the modern version — one correct change and three plausible wrong options
5. Which driver has won the most races at this circuit all time — give four driver options
6. Describe a famous race at this circuit without naming the year — ask which year from four options
7. Present four statistics about this circuit with one being slightly wrong — ask which stat is incorrect
8. Who holds the current lap record at this circuit
9. Has a World Championship ever been decided at this circuit — if so who won it there
10. Four progressive clues about a driver with a legendary connection to this circuit — ask who the driver is

Return ONLY a valid JSON array:
[{"q":"Question?","type":"standard","opts":["A","B","C","D"],"ans":0,"fact":"Brief fact."}]

The last question must use type whoami with a clues array:
{"q":"Who am I?","type":"whoami","clues":["Very vague","Narrows down","More specific","Almost gives it away"],"opts":["A","B","C","D"],"ans":0,"fact":"Brief fact."}`

  const reviewPrompt = `You are an F1 quiz master. Today's date is ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}. The current F1 season is ${currentYear}.

Generate exactly 10 multiple choice quiz questions about the most recently completed Formula 1 Grand Prix in the ${currentYear} season.

Base your questions on your knowledge of the ${currentYear} F1 season. Generate questions covering:
1. Qualifying — who took pole position
2. Practice — something notable from practice sessions
3. Race start — what happened on the opening lap
4. Safety car or incident — any notable incidents during the race
5. Tyre strategy — compounds used and pit stop decisions
6. Mid race battle — a specific overtake or battle
7. Position changes — describe a driver's race trajectory and ask who it was
8. Fastest lap — who set it and on which lap
9. Final result — winning margin or podium details
10. Championship implications — how the race affected the standings

Return ONLY a valid JSON object:
{
  "race": "Name of the most recent completed Grand Prix",
  "questions": [{"q":"Question?","type":"standard","opts":["A","B","C","D"],"ans":0,"fact":"Brief fact."}]
}`

  const prompt = mode === 'preview' ? previewPrompt : reviewPrompt
  const maxTokens = mode === 'preview' ? 2000 : 1500

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
        max_tokens: maxTokens,
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

    if (!text.trim()) {
      return new Response(JSON.stringify({ error: 'AI returned empty response' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }

    const cleanText = text.replace(/```json|```/g, '').trim()

    if (mode === 'preview') {
      const start = cleanText.indexOf('[')
      const end = cleanText.lastIndexOf(']')
      if (start === -1 || end === -1) {
        return new Response(JSON.stringify({ error: 'Could not parse quiz questions' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        })
      }
      const questions = JSON.parse(cleanText.slice(start, end + 1))
      return new Response(JSON.stringify({ race, mode, questions }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    } else {
      const start = cleanText.indexOf('{')
      const end = cleanText.lastIndexOf('}')
      if (start === -1 || end === -1) {
        return new Response(JSON.stringify({ error: 'Could not parse quiz response' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        })
      }
      const obj = JSON.parse(cleanText.slice(start, end + 1))
      const questions = Array.isArray(obj.questions) ? obj.questions : []
      const resolvedRace = obj.race || 'Latest Grand Prix'
      return new Response(JSON.stringify({ race: resolvedRace, mode, questions }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }

  } catch (error: any) {
    return new Response(JSON.stringify({ error: { message: error.message || 'Server error' } }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
}
