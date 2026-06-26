import { Router, type IRouter } from "express";
import Anthropic from "@anthropic-ai/sdk";

const router: IRouter = Router();

router.post("/bingo/suggest", async (req, res) => {
  const category = typeof req.body?.category === "string" ? req.body.category.trim() : "General";
  const race = typeof req.body?.race === "string" ? req.body.race.trim() : "";

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "ANTHROPIC_API_KEY is not configured." });
    return;
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    const raceContext = race ? `\nThis is for the ${race}.` : "";

    const prompt = `You are generating Formula 1 Race Bingo event suggestions for a 5x5 bingo card.

Goal:
Create diverse, realistic, and entertaining race events covering ALL teams and drivers — not just Ferrari.

Rules:
- Include qualifying, race, and strategy events.
- Mix driver-specific and team-wide events.
- Use the current 2026 F1 grid: Verstappen/Lawson (Red Bull), Norris/Piastri (McLaren), Leclerc/Hamilton (Ferrari), Russell/Antonelli (Mercedes), Alonso/Doohan (Aston Martin), Sainz/Bearman (Haas), Gasly/Hadjar (Alpine), Albon/Sainz (Williams), Tsunoda/Iwasa (Racing Bulls), Bottas/Zhou (Sauber).
- Avoid repeating the same team or driver too often.
- Keep each suggestion short and natural — max 7 words, bingo-card style.
- Focus on the selected category but still include multiple teams and drivers.${raceContext}

Category to focus on: ${category}

Examples of valid suggestions:
"Hadjar outqualifies Verstappen"
"Antonelli wins from pole"
"Norris crashes in Q2"
"A Mercedes driver knocked out in Q2"
"Ferrari pit stop under 2.5s"
"Red Bull mechanical failure"
"Alpine scores double points"
"Haas driver finishes P7 or higher"
"Williams driver reaches Q3"
"Safety car deployed before Lap 10"
"Race ends under red flag"
"Rookie finishes in top 5"
"Team radio complaint broadcast live"

Return ONLY a JSON array of exactly 12 short strings, no markdown, no other text:
["suggestion 1", "suggestion 2", ...]`;

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
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
