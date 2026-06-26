import { Router, type IRouter } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { GenerateQuizBody } from "@workspace/api-zod";

const router: IRouter = Router();

// Circuit names that have SVG layouts in the frontend library.
// Claude must use ONLY these names in the circuits array for layout questions.
const AVAILABLE_CIRCUITS = [
  "Monaco", "Singapore", "Baku", "Jeddah",
  "Monza", "Spa", "Silverstone", "Suzuka",
  "Bahrain", "Abu Dhabi", "Red Bull Ring", "Zandvoort",
  "COTA", "Interlagos", "Montreal", "Hungaroring",
  "Catalunya", "Qatar", "Albert Park", "Las Vegas",
  "Mexico City", "Imola",
];

function extractJsonArray(text: string): unknown[] {
  const clean = text.replace(/```json|```/g, "").trim();
  const start = clean.indexOf("[");
  const end = clean.lastIndexOf("]");
  if (start === -1 || end === -1) throw new Error("No JSON array found in response");
  return JSON.parse(clean.slice(start, end + 1));
}

async function callWithSearch(anthropic: Anthropic, prompt: string): Promise<string> {
  const resp = (await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    tools: [{ type: "web_search_20250305", name: "web_search" }] as unknown as Anthropic.Tool[],
    messages: [{ role: "user", content: prompt }],
  } as Parameters<typeof anthropic.messages.create>[0])) as Anthropic.Message;

  return (resp.content as { type: string; text?: string }[])
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("");
}

const PREVIEW_PROMPT = (race: string) => `You are an F1 quiz master creating a Thursday preview quiz about the history of the ${race} Grand Prix circuit for fans ahead of this weekend's race.

Search the web for historical facts about this circuit including first race year, pole position records, lap records, famous moments, legendary races, and championship moments decided here.

Generate exactly 10 questions in this exact order:

Question 1 — FIRST RACE: When was the first ever Formula 1 Grand Prix held at this circuit. Give four options with years close together to make it challenging.

Question 2 — POLE POSITION KING: Which driver has taken the most pole positions at this circuit all time. Give four driver options.

Question 3 — FAMOUS MOMENT PICTURE: Describe a famous historical moment from this circuit in vivid detail — a crash, a celebration, a battle, a landmark moment — without naming the driver or year. Give four options for who was involved or what happened next.

Question 4 — SPOT THE DIFFERENCE: Describe how the circuit layout has changed from its original historic version to today. Give four options for the key difference — one correct and three plausible but wrong changes.

Question 5 — CIRCUIT LAYOUT IDENTIFIER: The player must identify which of four circuit layout silhouettes is the correct one for this race weekend.

For this question you must:
- Determine the exact circuit name for the ${race} using ONLY a name from this list: ${AVAILABLE_CIRCUITS.join(", ")}
- Pick 3 decoy circuits from the SAME type to make it genuinely difficult:
  - If correct circuit is a street circuit (Monaco, Singapore, Baku, Jeddah) → use other street circuits as decoys
  - If correct circuit is a high-speed circuit (Monza, Spa, Silverstone, Suzuka) → use other high-speed circuits as decoys
  - If correct circuit is a Middle Eastern circuit (Bahrain, Abu Dhabi, Qatar) → use other Middle Eastern/modern circuits as decoys
  - Otherwise group by geographic region or track character
- Randomise which position (index 0, 1, 2, or 3) the correct circuit appears in the circuits array
- Set ans to that random index so it is not always the same position

Return this question in this EXACT format (layout type, NOT standard type):
{
  "q": "Which of these four circuit layouts is the ${race} circuit?",
  "type": "layout",
  "circuits": ["CircuitA", "CircuitB", "CircuitC", "CircuitD"],
  "ans": 2,
  "fact": "One interesting fact about this circuit layout or its history"
}

Where circuits[ans] is the correct circuit name and EVERY name in circuits must be from this exact list: ${AVAILABLE_CIRCUITS.join(", ")}

Question 6 — LEGENDARY RACE: Describe a famous race at this circuit in detail without naming the year — the winner, the drama, the key moment — and ask which year it took place. Give four year options close together.

Question 7 — STAT OR FICTION: Present four statistics about this circuit — lap record time, number of corners, total race distance in km, year of first GP — but make one of them slightly wrong. Ask which statistic is incorrect.

Question 8 — LAP RECORD: Who holds the current official lap record at this circuit, on what lap of which race was it set. Give four driver options.

Question 9 — CHAMPIONSHIP MOMENT: Ask about a World Championship decided at this circuit — who clinched it, what year, what happened. If multiple pick the most dramatic. If none, ask which driver came closest to clinching here but failed. Give four options.

Question 10 — WHO AM I: Create a four clue reveal about a driver with a legendary connection to this circuit. Clue 1 is very vague, clue 2 narrows it down, clue 3 is more specific, clue 4 almost gives it away. Give four driver options.

Return ONLY a JSON array with no other text. Questions 1-4 and 6-9 use this format:
{
  "q": "Question text",
  "type": "standard",
  "opts": ["A", "B", "C", "D"],
  "ans": 0,
  "fact": "Brief interesting fact"
}

Question 5 uses the layout format shown above.

Question 10 uses this format:
{
  "q": "Who am I?",
  "type": "whoami",
  "clues": ["Clue 1 very vague", "Clue 2 narrows down", "Clue 3 more specific", "Clue 4 almost gives it away"],
  "opts": ["Driver A", "Driver B", "Driver C", "Driver D"],
  "ans": 2,
  "fact": "Brief fact about this driver and their connection to this circuit"
}`;

const REVIEW_PROMPT = (race: string) => `You are an F1 quiz master creating a Tuesday review quiz about the ${race} Formula 1 Grand Prix that just took place.

First search the web thoroughly for: full qualifying results, full race results including winner podium finishing order DNFs, all pit stop data including laps compounds and number of stops, fastest lap holder and which lap, safety car or red flag periods and which laps, key overtakes and incidents, championship standings before and after this race, practice session highlights.

Then generate exactly 10 questions in this exact order:

Question 1 — QUALIFYING: Ask about pole position — who took it, the margin over P2, or which big name was eliminated in Q1. Use actual results.

Question 2 — PRACTICE: Ask about something specific from practice sessions — fastest time in FP1, unexpected pace from a team, or a notable incident in practice.

Question 3 — RACE START: Ask about the opening lap — who led into turn 1, positions gained or lost by the winner at the start, or a specific lap 1 incident.

Question 4 — SAFETY CAR OR INCIDENT: Ask about a safety car period, red flag, or notable crash — which lap it was deployed, what caused it, how it affected the outcome. If no safety car ask about a notable incident instead.

Question 5 — TYRE STRATEGY: Ask about strategy — which compound the race winner started on, which driver made the most pit stops, or the boldest one-stop vs two-stop call.

Question 6 — MID RACE BATTLE: Ask about a specific overtake or battle for position — which lap, which corner, what the outcome was.

Question 7 — POSITION CHART: Describe one driver's race trajectory through their positions at key laps and ask which driver this describes. Give four driver options.

Question 8 — FASTEST LAP: Who set the fastest lap of the race, on which lap was it set, and did they collect the bonus championship point.

Question 9 — FINAL RESULT: Ask about the race finish — exact winning margin in seconds, who completed the podium in P3, or how many drivers finished on the lead lap.

Question 10 — CHAMPIONSHIP IMPLICATIONS: Ask about how this race changed the championship — how many points the leader now leads by, which driver closed the gap most, or what needs to happen at the next race.

Return ONLY a JSON array with no other text in this exact format:
[
  {
    "q": "Question text here",
    "type": "standard",
    "opts": ["Option A", "Option B", "Option C", "Option D"],
    "ans": 0,
    "fact": "Brief interesting fact about the correct answer"
  }
]

Every question must use real accurate data from your web search. Do not guess or use outdated information.`;

router.post("/quiz/generate", async (req, res) => {
  const parsed = GenerateQuizBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { race } = parsed.data;
  const rawMode = (req.body as { mode?: unknown }).mode;
  const mode: "preview" | "review" = rawMode === "preview" ? "preview" : "review";

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "ANTHROPIC_API_KEY is not configured. Add it to your Replit Secrets to enable this feature." });
    return;
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const prompt = mode === "preview" ? PREVIEW_PROMPT(race) : REVIEW_PROMPT(race);
    const fullText = await callWithSearch(anthropic, prompt);
    const questions = extractJsonArray(fullText);

    if (!Array.isArray(questions) || questions.length === 0) {
      res.status(500).json({ error: "AI returned invalid quiz data" });
      return;
    }

    res.json({ race, mode, questions });
  } catch (err) {
    req.log.error({ err }, "Quiz generation failed");
    res.status(500).json({ error: "Failed to generate quiz. Please try again." });
  }
});

export default router;
