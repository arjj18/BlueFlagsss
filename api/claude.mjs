import { callAnthropic, methodGuard } from './_lib/anthropic.mjs';

export default async function handler(req, res) {
  if (!methodGuard(req, res)) return;

  const body = req.body ?? {};
  const messages = Array.isArray(body.messages) ? body.messages : null;
  if (!messages || messages.length === 0) {
    res.status(400).json({ error: "messages array required" });
    return;
  }

  // Prefer the last user message, otherwise join messages into a single prompt
  const lastUser = [...messages].reverse().find(m => m.role === 'user');
  const prompt = lastUser?.content ?? messages.map(m => `${m.role}: ${m.content}`).join('\n\n');

  const model = typeof body.model === 'string' ? body.model : 'claude-haiku-4-5-20251001';
  const maxTokens = typeof body.max_tokens === 'number' ? body.max_tokens : 1200;

  try {
    const text = await callAnthropic({ model, maxTokens, prompt });
    res.status(200).json({ content: text });
  } catch (err) {
    const status = err.statusCode || 502;
    res.status(status).json({ error: err.message ?? 'Anthropic proxy error', detail: err.detail ?? null });
  }
}
