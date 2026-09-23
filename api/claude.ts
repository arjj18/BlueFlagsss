export const config = {
  runtime: 'edge'
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    console.error('[api/claude] ANTHROPIC_API_KEY is not set')
    return new Response(JSON.stringify({
      error: { message: 'API key not configured on server' }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const messages = Array.isArray(body.messages) ? body.messages : null
  if (!messages || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'messages array required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const lastUser = [...messages].reverse().find((m: any) => m.role === 'user')
  const prompt = lastUser?.content ?? messages.map((m: any) => `${m.role}: ${m.content}`).join('\n\n')

  const model = typeof body.model === 'string' ? body.model : 'claude-haiku-4-5-20251001'
  const maxTokens = typeof body.max_tokens === 'number' ? body.max_tokens : 1200

  console.log('[api/claude] model:', model, '| max_tokens:', maxTokens, '| has tools:', !!(body.tools && body.tools.length > 0))

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01'
  }

  if (body.tools && body.tools.length > 0) {
    headers['anthropic-beta'] = 'web-search-2025-03-05'
  }

  try {
    console.log('[api/claude] Calling Anthropic API...')
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    console.log('[api/claude] Anthropic response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[api/claude] Anthropic error:', errorText)
      return new Response(JSON.stringify({
        error: { message: `Anthropic API error (${response.status}): ${errorText}` }
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

    console.log('[api/claude] Response text length:', text.length)

    return new Response(JSON.stringify({ content: text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    console.error('[api/claude] Route error:', error.message)
    return new Response(JSON.stringify({
      error: { message: error.message || 'Server error calling Anthropic' }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
