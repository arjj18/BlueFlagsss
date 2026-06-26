import { Router, type IRouter } from "express";
import Anthropic from "@anthropic-ai/sdk";

const router: IRouter = Router();

router.post("/bingo/suggest", async (req, res) => {
  const race = typeof req.body?.race === "string" ? req.body.race.trim() : "";

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "ANTHROPIC_API_KEY is not configured." });
    return;
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    const raceContext = race ? `\nThis set of suggestions is for: ${race}.` : "";

    const prompt = `You are generating suggestions for a Formula 1 Race Bingo card.

The Bingo grid itself is a 4×4 layout (16 squares), but it should be left COMPLETELY BLANK.
Your job is ONLY to generate 16 suggestion ideas that the user can choose from to fill the grid.

Goal:
Create fun, varied, realistic bingo events that cover ALL teams and drivers in the 2026 season.
Avoid focusing on a single team. Mix qualifying, race, reliability, strategy, and chaos events.

Rules:
- Use the full 2026 grid (all 22 drivers, all 11 teams).
- Include head-to-head events for teammates and rivals.
- Include team-wide performance events.
- Include reliability and chaos events.
- Include underdog or midfield surprises.
- Include restart events after safety cars or red flags.
- Include safety car / yellow flag / red flag events.
- Keep each event short, punchy, and bingo-card friendly (max 7 words).
- Avoid repeating the same team or driver too often.
- Output exactly 16 unique suggestions spread across these categories:

1. Driver vs Driver (qualifying or race) — 3 suggestions
   e.g. "Leclerc outqualifies Hamilton", "Hadjar outqualifies Verstappen", "Antonelli beats Russell"

2. Team-Wide Performance Events — 3 suggestions
   e.g. "Ferrari double top 5", "Red Bull finishes with only one car", "Williams scores points"

3. Reliability or Chaos Events — 3 suggestions
   e.g. "Red Bull mechanical failure", "Two cars collide at Turn 1", "Driver retires with engine failure"

4. Safety Car / Yellow Flag / Red Flag Events — 2 suggestions
   e.g. "2 or more safety cars", "Race ends under red flag"

5. Underdog or Midfield Surprise Events — 3 suggestions
   e.g. "Bearman finishes in the top 5", "Williams reaches Q3", "Bortoleto finishes in the top 10"

6. Restart Events (after Safety Car or Red Flag) — 2 suggestions
   e.g. "Chaos on the restart", "Driver gains 3+ positions on restart"
${raceContext}

Return ONLY a JSON array of exactly 16 short strings, no markdown, no other text:
["suggestion 1", "suggestion 2", ...]`;

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      res.status(500).json({ error: "Unexpected response from AI" });
      return;
    }

    const clean = textBlock.text.replace(/```json|```/g, "").trim();
    const start = clean.indexOf("[");
    const end = clean.lastIndexOf("]");
    if (start === -1 || end === -1) {
      res.status(500).json({ error: "AI returned invalid data" });
      return;
    }

    const suggestions = JSON.parse(clean.slice(start, end + 1)) as string[];

    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      res.status(500).json({ error: "AI returned empty suggestions" });
      return;
    }

    res.json({ suggestions });
  } catch (err) {
    req.log.error({ err }, "Bingo suggestion generation failed");
    res.status(500).json({ error: "Failed to generate suggestions. Please try again." });
  }
});

export default router;
