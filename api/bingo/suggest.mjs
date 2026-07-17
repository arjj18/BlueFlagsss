import { callAnthropic, methodGuard } from "../_lib/anthropic.mjs";
import { rateLimit } from "../_lib/rateLimit.mjs";

export default async function handler(req, res) {
  if (!methodGuard(req, res)) return;
  if (!rateLimit(req, res, 20)) return;

  const race =
    typeof req.body?.race === "string" ? req.body.race.trim().slice(0, 100) : "";

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

  try {
    const text = await callAnthropic({
      model: "claude-haiku-4-5",
      maxTokens: 600,
      prompt,
    });

    const clean = text.replace(/```json|```/g, "").trim();
    const start = clean.indexOf("[");
    const end = clean.lastIndexOf("]");
    if (start === -1 || end === -1) {
      res.status(500).json({ error: "AI returned invalid data" });
      return;
    }

    const suggestions = JSON.parse(clean.slice(start, end + 1));

    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      res.status(500).json({ error: "AI returned empty suggestions" });
      return;
    }

    res.status(200).json({ suggestions });
  } catch (err) {
    const status = err.statusCode === 503 ? 503 : 500;
    res.status(status).json({ error: "Failed to generate suggestions. Please try again." });
  }
}
