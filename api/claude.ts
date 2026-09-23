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
    console.error('ANTHROPIC_API_KEY environment variable is not set')
    return new Response(JSON.stringify({
      error: {
        type: 'api_key_missing',
        message: 'ANTHROPIC_API_KEY is not configured on the server'
      }
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
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const anthropicHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01'
  }

  if (body.tools && Array.isArray(body.tools) && body.tools.length > 0) {
    anthropicHeaders['anthropic-beta'] = 'web-search-2025-03-05'
  }

  console.log('[api/claude] model:', body.model || 'claude-haiku-4-5-20251001', '| max_tokens:', body.max_tokens || 1200, '| has tools:', !!(body.tools && body.tools.length > 0))

  try {
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: anthropicHeaders,
      body: JSON.stringify(body)
    })

    const responseText = await anthropicResponse.text()

    let responseData: any
    try {
      responseData = JSON.parse(responseText)
    } catch {
      return new Response(JSON.stringify({
        error: { message: 'Invalid response from Anthropic API', raw: responseText.substring(0, 200) }
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    console.log('[api/claude] Anthropic status:', anthropicResponse.status)

    return new Response(JSON.stringify(responseData), {
      status: anthropicResponse.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })

  } catch (error: any) {
    console.error('Error calling Anthropic API:', error)
    return new Response(JSON.stringify({
      error: { message: error.message || 'Failed to call Anthropic API' }
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}
