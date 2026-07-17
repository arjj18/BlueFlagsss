// Shared helper for Vercel serverless functions. Calls Anthropic with a
// server-controlled prompt only — never a caller-supplied body — so the API
// key can't be used as an open proxy.
export async function callAnthropic({ model, maxTokens, system, prompt, tools }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const err = new Error("ANTHROPIC_API_KEY is not configured.");
    err.statusCode = 503;
    throw err;
  }

  const body = {
    model,
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  };
  if (system) body.system = system;
  if (tools) body.tools = tools;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = new Error(`Anthropic API error (${response.status})`);
    err.statusCode = response.status;
    try {
      const detail = await response.json();
      err.detail = detail?.error?.message ?? "";
    } catch {
      err.detail = "";
    }
    throw err;
  }

  const data = await response.json();
  return (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("");
}

export function methodGuard(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return false;
  }
  return true;
}
