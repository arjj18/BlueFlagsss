import { Router, type IRouter } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { GenerateQuizBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/quiz/generate", async (req, res) => {
  const parsed = GenerateQuizBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { race } = parsed.data;
  const rawMode = (req.body as { mode?: unknown }).mode;
  const mode: "preview" | "review" =
    rawMode === "preview" ? "preview" : "review";

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(503).json({
      error: "ANTHROPIC_API_KEY is not configured. Add it to your Replit Secrets to enable this feature.",
    });
    return;
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    if (mode === "preview") {
      // Preview quiz — historical circuit knowledge, no web search needed
      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `You are an F1 quiz master creating a Thursday preview quiz for fans ahead of the ${race} Grand Prix.

Generate 6 multiple choice questions about the HISTORY of the ${race} Grand Prix covering:
- Past winners at this circuit
- Lap records and circuit statistics
- Legendary moments and famous races at this venue
- Which drivers have historically dominated here
- Constructor records at this circuit
- Interesting facts about the circuit or host country

Do not ask about this year's race as it has not happened yet. Focus entirely on historical facts.

Return ONLY a valid JSON array with no other text, markdown, or code fences:
[{"q":"Question?","opts":["A","B","C","D"],"ans":0,"fact":"Brief interesting fact about the answer."}]`,
          },
        ],
      });

      const textBlock = message.content.find((b) => b.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        res.status(500).json({ error: "Unexpected response from AI" });
        return;
      }

      const clean = textBlock.text.replace(/```json|```/g, "").trim();
      const questions = JSON.parse(clean);

      if (!Array.isArray(questions) || questions.length === 0) {
        res.status(500).json({ error: "AI returned invalid quiz data" });
        return;
      }

      res.json({ race, mode: "preview", questions });
      return;
    }

    // Review quiz — use web search for actual race results
    const searchResp = (await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      tools: [{ type: "web_search_20250305", name: "web_search" }] as unknown as Anthropic.Tool[],
      messages: [
        {
          role: "user",
          content: `You are an F1 quiz master creating a Tuesday review quiz about the ${race} that just took place.

First search the web for the full race results, qualifying results, fastest lap, key incidents, and championship standings update from the ${race}.

Then generate 6 multiple choice questions about what actually happened in this race covering:
- The race winner and winning margin
- The full podium
- Fastest lap holder
- A key overtake or incident during the race
- A strategy decision that affected the outcome
- The championship standings impact after this race

Base every question on the actual real results you find from your web search. Do not guess or use outdated information.

Return ONLY a valid JSON array with no other text, markdown, or code fences:
[{"q":"Question?","opts":["A","B","C","D"],"ans":0,"fact":"Brief interesting fact about the answer."}]`,
        },
      ],
    } as Parameters<typeof anthropic.messages.create>[0])) as Anthropic.Message;

    const fullText = (searchResp.content as { type: string; text?: string }[])
      .filter((b) => b.type === "text")
      .map((b) => b.text ?? "")
      .join("");

    const clean = fullText.replace(/```json|```/g, "").trim();

    // Extract JSON array from the text
    const arrayStart = clean.indexOf("[");
    const arrayEnd = clean.lastIndexOf("]");
    if (arrayStart === -1 || arrayEnd === -1) {
      res.status(500).json({ error: "AI returned invalid quiz data" });
      return;
    }

    const questions = JSON.parse(clean.slice(arrayStart, arrayEnd + 1));

    if (!Array.isArray(questions) || questions.length === 0) {
      res.status(500).json({ error: "AI returned invalid quiz data" });
      return;
    }

    res.json({ race, mode: "review", questions });
  } catch (err) {
    req.log.error({ err }, "Quiz generation failed");
    res.status(500).json({ error: "Failed to generate quiz. Please try again." });
  }
});

export default router;
