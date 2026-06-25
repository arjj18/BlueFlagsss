import { Router, type IRouter } from "express";
import Anthropic from "@anthropic-ai/sdk";

const router: IRouter = Router();

router.post("/predict/race", async (req, res) => {
  const { race, round } = req.body as { race?: unknown; round?: unknown };
  if (typeof race !== "string" || !race.trim() || typeof round !== "number") {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "ANTHROPIC_API_KEY is not configured." });
    return;
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    // Stage 1 — web search for current F1 standings, lineups, and recent results
    const searchResp = (await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      tools: [{ type: "web_search_20250305", name: "web_search" }] as unknown as Anthropic.Tool[],
      messages: [
        {
          role: "user",
          content: `Search the web and gather the most up-to-date Formula 1 information. Please find:
1. Current 2025/2026 F1 driver championship standings with exact points
2. Current 2025/2026 F1 constructor standings
3. Confirmed driver lineup for every team on the current grid
4. Results from the last 3 races — winner, podium, and any notable incidents or retirements
5. Any recent driver news, team updates, penalties, or grid changes heading into the ${race} Grand Prix

Summarise everything you find clearly and concisely.`,
        },
      ],
    } as Parameters<typeof anthropic.messages.create>[0])) as Anthropic.Message;

    const searchContext = (searchResp.content as { type: string; text?: string }[])
      .filter((b) => b.type === "text")
      .map((b) => b.text ?? "")
      .join("\n");

    // Stage 2 — generate structured JSON prediction using the live search context
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are an expert Formula 1 analyst. Here is current F1 information gathered from a live web search:

${searchContext}

Based on this current data, generate a race prediction for the upcoming ${race} Grand Prix (Round ${round}).

Consider: current championship standings, track characteristics, recent form, tyre strategy, weather tendencies, and historical circuit performance for each team and driver.

Return ONLY valid JSON with no markdown or code fences:
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
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      res.status(500).json({ error: "Unexpected AI response" });
      return;
    }

    const jsonText = textBlock.text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    const data = JSON.parse(jsonText);

    res.json({ ...data, race, round, generatedAt: new Date().toISOString() });
  } catch (err) {
    req.log.error({ err }, "Race prediction failed");
    res.status(500).json({ error: "Failed to generate prediction. Please try again." });
  }
});

export default router;
