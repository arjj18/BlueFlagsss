import { Router, type IRouter } from "express";
import Anthropic from "@anthropic-ai/sdk";

const router: IRouter = Router();

router.post("/standings/refresh", async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "ANTHROPIC_API_KEY is not configured." });
    return;
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `You are a Formula 1 data assistant with knowledge of the 2026 F1 season.

Based on your most up-to-date knowledge of the 2026 Formula 1 World Championship, return the current official championship standings after the most recently completed Grand Prix.

The 2026 grid has exactly 11 teams and 22 drivers:
- McLaren: Lando Norris, Oscar Piastri
- Ferrari: Charles Leclerc, Lewis Hamilton
- Red Bull: Max Verstappen, Liam Lawson
- Mercedes: George Russell, Kimi Antonelli
- Williams: Carlos Sainz, Alex Albon
- Aston Martin: Fernando Alonso, Lance Stroll
- Alpine: Pierre Gasly, Jack Doohan
- Haas: Esteban Ocon, Oliver Bearman
- RB: Yuki Tsunoda, Isack Hadjar
- Audi: Nico Hülkenberg, Valtteri Bottas
- Cadillac: Colton Herta, Marcus Armstrong

Return ONLY a valid JSON object with no other text, markdown, or code fences:
{
  "afterRound": <integer round number>,
  "afterRaceName": "<full name of last completed race>",
  "drivers": [
    {"pos": 1, "code": "NOR", "name": "Lando Norris", "team": "McLaren", "country": "GB", "points": 0, "wins": 0, "podiums": 0},
    ... all 22 drivers sorted by points descending ...
  ],
  "constructors": [
    {"pos": 1, "name": "McLaren", "points": 0, "wins": 0},
    ... all 11 teams sorted by points descending ...
  ]
}

Use ISO 3166-1 alpha-2 country codes. Sort both arrays by points descending. The constructor points must equal the sum of its drivers' points.`,
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      res.status(500).json({ error: "Unexpected response from AI" });
      return;
    }

    let jsonText = textBlock.text.trim();
    // Strip any accidental markdown fences
    jsonText = jsonText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");

    const data = JSON.parse(jsonText);

    if (!Array.isArray(data.drivers) || !Array.isArray(data.constructors)) {
      res.status(500).json({ error: "AI returned malformed standings data" });
      return;
    }

    res.json({ ...data, lastUpdated: new Date().toISOString() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

export default router;
