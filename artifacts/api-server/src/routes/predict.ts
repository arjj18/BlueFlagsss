import { Router, type IRouter } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are an F1 race prediction model. Use ONLY the information below to generate realistic, data-driven predictions for the 2026 Formula 1 season. Do not use outdated drivers, invent standings, or hallucinate results. Where appropriate use the web_search tool to fetch live, authoritative data before composing the JSON output.`;

function joinTextBlocks(resp: any): string {
  try {
    const content = (resp as any).content ?? (resp as any).output ?? resp;
    if (Array.isArray(content)) {
      return content
        .filter((b: any) => b && b.type === "text" && typeof b.text === "string")
        .map((b: any) => b.text)
        .join("\n");
    }
    if (typeof content === "string") return content;
    if (content && typeof content === "object" && typeof content.text === "string") return content.text;
    return JSON.stringify(content);
  } catch (e) {
    return String(resp);
  }
}

router.post("/predict/race", async (req, res) => {
  const { race, round } = req.body as { race?: unknown; round?: unknown };
  if (typeof race !== "string" || !race.trim() || typeof round !== "number") {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  try {
    // NOTE: tools array enables the web search tool for live data retrieval
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [
        {
          role: "user",
          content: `Generate a race prediction for the 2026 ${race} Grand Prix (Round ${round}).

First: using the web_search tool, retrieve the most recent:
1) current driver standings and constructor standings,
2) confirmed driver line-ups for the season,
3) the last 3 race results including winners/podiums and notable incidents,
4) any driver/team news or penalties that could affect race weekend.

Then: produce ONLY valid JSON (no markdown/fences) that matches this schema exactly:

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
        }
      ],
    });

    const text = joinTextBlocks(message);
    const jsonText = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    const normalised = jsonText.replace(/Kick Sauber/g, "Audi").replace(/Sauber/g, "Audi");

    const data = JSON.parse(normalised);
    const out = { ...data, race, round, generatedAt: new Date().toISOString(), dataSource: `Live web search: ${new Date().toISOString().slice(0,10)}` };

    res.status(200).json(out);
  } catch (err: any) {
    console.error("[predict/race] Prediction failed:", {
      message: err?.message,
      statusCode: err?.statusCode,
      detail: err?.detail,
    });

    if (err?.statusCode === 429) {
      res.status(429).json({ error: "Too many requests to the AI right now. Wait a moment and try again." });
      return;
    }
    if (err?.statusCode === 503 || /credit balance is too low/i.test(err?.detail ?? "")) {
      res.status(503).json({ error: "The AI service is temporarily unavailable (out of credits or API key not configured). Please try again later." });
      return;
    }
    if (err?.statusCode === 401) {
      res.status(503).json({ error: "The AI API key is invalid or expired. Please check your configuration." });
      return;
    }

    const detail = err?.detail ? ` (${err.detail})` : "";
    res.status(500).json({ error: `Failed to generate prediction${detail}. Please try again.` });
  }
});

export default router;
