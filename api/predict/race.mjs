import { callAnthropic, methodGuard } from "../_lib/anthropic.mjs";
import { rateLimit } from "../_lib/rateLimit.mjs";

const SYSTEM_PROMPT = `You are an F1 race prediction model. Use ONLY the information below to generate realistic, data-driven predictions for the 2026 Formula 1 season. Do not use outdated drivers,[...]`

// ====================================================================
// 2026 Formula 1 Grid
// ====================================================================

// (grid and long text omitted for brevity in this file view)

export default async function handler(req, res) {
  if (!methodGuard(req, res)) return;
  if (!rateLimit(req, res)) return;

  const { race, round } = req.body ?? {};
  if (typeof race !== "string" || !race.trim() || race.length > 100 || typeof round !== "number") {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  try {
    const text = await callAnthropic({
      model: "claude-haiku-4-5-20251001",
      maxTokens: 1500,
      system: SYSTEM_PROMPT,
      prompt: `Generate a race prediction for the 2026 ${race} Grand Prix (Round ${round}).

Return ONLY valid JSON with no markdown or code fences. IMPORTANT: every position claim in "wildcard" and "factors" must match the "top10" array exactly — do not say a driver finishes top 6 if [...]
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
}`,
    });

    const jsonText = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    // Defensive guard: the team is "Audi", never "Sauber"/"Kick Sauber".
    const normalised = jsonText.replace(/Kick Sauber/g, "Audi").replace(/Sauber/g, "Audi");
    const data = JSON.parse(normalised);

    res.status(200).json({ ...data, race, round, generatedAt: new Date().toISOString() });
  } catch (err) {
    console.error("[predict/race] Prediction failed:", {
      message: err.message,
      statusCode: err.statusCode,
      detail: err.detail,
    });
    if (err.statusCode === 429) {
      res.status(429).json({ error: "Too many requests to the AI right now. Wait a moment and try again." });
      return;
    }
    if (err.statusCode === 503 || /credit balance is too low/i.test(err.detail ?? "")) {
      res.status(503).json({ error: "The AI service is temporarily unavailable (out of credits or API key not configured). Please try again later." });
      return;
    }
    if (err.statusCode === 401) {
      res.status(503).json({ error: "The AI API key is invalid or expired. Please check your configuration." });
      return;
    }
    const detail = err.detail ? ` (${err.detail})` : "";
    res.status(500).json({ error: `Failed to generate prediction${detail}. Please try again.` });
  }
}
