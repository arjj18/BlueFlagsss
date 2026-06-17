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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(503).json({
      error: "ANTHROPIC_API_KEY is not configured. Add it to your Replit Secrets to enable this feature.",
    });
    return;
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are an F1 quiz master. Generate 6 multiple choice questions about the ${race} Formula 1 Grand Prix. Cover: race winner, podium finishers, key moments, pit strategy, fastest lap, and championship impact. Return ONLY a valid JSON array with no other text, markdown, or code fences:\n[{"q":"Question text?","opts":["Option A","Option B","Option C","Option D"],"ans":0,"fact":"Brief interesting fact."}]\nWhere "ans" is the zero-based index of the correct option.`,
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

    res.json({ race, questions });
  } catch (err) {
    req.log.error({ err }, "Quiz generation failed");
    res.status(500).json({ error: "Failed to generate quiz. Please try again." });
  }
});

export default router;
