export const config = {
  runtime: 'edge'
}

export default async function handler(request: Request): Promise<Response> {
  return new Response(JSON.stringify({
    status: 'working',
    timestamp: new Date().toISOString(),
    hasApiKey: !!process.env.ANTHROPIC_API_KEY
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })
}
