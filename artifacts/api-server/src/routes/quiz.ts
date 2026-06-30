import { Router, type IRouter } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { anthropic } from "@workspace/integrations-anthropic-ai";
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

// Review quizzes return a wrapper object { race, questions } because the server
// does not know the race name up front — the model detects the most recent
// completed Grand Prix itself and reports it back alongside the questions.
function extractJsonObject(text: string): Record<string, unknown> {
  const clean = text.replace(/```json|```/g, "").trim();
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in response");
  return JSON.parse(clean.slice(start, end + 1)) as Record<string, unknown>;
}

// Shared difficulty curve + answer-quality rules appended to both AI prompts so
// every generated quiz ramps Easy → Expert and has four genuinely plausible
// options per question.
const DIFFICULTY_GUIDANCE = `DIFFICULTY CURVE — calibrate each question to its position in the quiz:
- Questions 1-3: EASY. A casual fan who watches occasionally should get these. Well-known facts, but still with believable distractors.
- Questions 4-6: MEDIUM. Require a regular viewer who pays attention to detail.
- Questions 7-9: HARD. Reward dedicated fans — specific stats, strategy nuance, lesser-known details.
- Question 10: EXPERT. Genuinely difficult even for hardcore fans.

ANSWER QUALITY — apply to EVERY question:
- All four options must be plausible to someone who does not already know the answer. No joke, silly, or obviously-wrong throwaway options.
- Wrong answers must be believable: real drivers, teams, years, or values that could reasonably be correct in the question's context.
- The correct answer must NOT stand out. Keep all four options similar in length, specificity, and phrasing. Never make the correct option the longest, most detailed, or the only precisely-worded one.
- Vary which position (index 0-3) the correct answer sits in across the ten questions; do not cluster it on one index.`;

async function generateQuiz(
  anthropic: Anthropic,
  prompt: string,
  useWebSearch: boolean,
): Promise<string> {
  const resp = (await anthropic.messages.create({
    // 10 detailed questions + facts (+ web-search tokens for review) easily
    // exceed a small budget; too low a limit truncates the JSON mid-string and
    // breaks parsing. Keep this generous.
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    // Review (post-race) needs live results, so it searches the web. Preview is
    // history-based and runs from the model's own knowledge — no web search.
    ...(useWebSearch
      ? { tools: [{ type: "web_search_20250305", name: "web_search" }] as unknown as Anthropic.Tool[] }
      : {}),
    messages: [{ role: "user", content: prompt }],
  } as Parameters<typeof anthropic.messages.create>[0])) as Anthropic.Message;

  return (resp.content as { type: string; text?: string }[])
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("");
}

const PREVIEW_PROMPT = (race: string) => `You are an F1 quiz master creating a Thursday preview quiz about the history of the ${race} Grand Prix circuit for fans ahead of this weekend's race.

Using your knowledge of F1 history, draw on facts about this circuit including first race year, pole position records, lap records, famous moments, legendary races, and championship moments decided here.

Generate exactly 10 questions in this exact order:

Question 1 — FIRST RACE: When was the first ever Formula 1 Grand Prix held at this circuit. Give four options with years close together to make it challenging.

Question 2 — POLE POSITION KING: Which driver has taken the most pole positions at this circuit all time. Give four driver options.

Question 3 — FAMOUS MOMENT PICTURE: Describe a famous historical moment from this circuit in vivid detail — a crash, a celebration, a battle, a landmark moment — without naming the driver or year. Give four options for who was involved or what happened next. If — and ONLY if — you are confident of a real, working, publicly hosted https image URL of this exact moment, include it as an "image" field; otherwise omit the field entirely (never invent a URL).

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

${DIFFICULTY_GUIDANCE}

Return ONLY a JSON array with no other text. Questions 1-4 and 6-9 use this format:
{
  "q": "Question text",
  "type": "standard",
  "opts": ["A", "B", "C", "D"],
  "ans": 0,
  "fact": "Brief interesting fact"
}

A standard question MAY optionally include an "image" field — a direct, real, publicly hosted https URL to a relevant photo. The client shows it above the question and hides it gracefully if it fails to load. Only include "image" when you are confident the URL is real and working; otherwise omit it entirely. Never fabricate a URL.

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

const REVIEW_PROMPT = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentDate = now.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `You are an F1 quiz master. Today's date is ${currentDate}. The current F1 season is ${currentYear}.

STEP 1 — IDENTIFY THE RACE: First, search the web to determine the SINGLE most recent Formula 1 Grand Prix that has ALREADY been completed as of today (${currentDate}). This is the last race weekend that has actually finished on or before today — never an upcoming race that has not happened yet, and never an older race if a more recent one has already finished.

Useful searches for step 1:
- "F1 ${currentYear} most recent race result"
- "F1 ${currentYear} last Grand Prix result"
- "Formula 1 ${currentYear} calendar results so far"

IMPORTANT: Use ${currentYear} season data only. Do not use ${currentYear - 1} or any previous season data under any circumstances. If a search returns results from ${currentYear - 1} or earlier, ignore them and search again with different terms.

STEP 2 — RESEARCH THAT RACE: Once you have identified the most recent completed Grand Prix, search the web thoroughly for that exact race: full qualifying results, full race results including winner podium finishing order DNFs, all pit stop data including laps compounds and number of stops, fastest lap holder and which lap, safety car or red flag periods and which laps, key overtakes and incidents, championship standings before and after this race, practice session highlights.

STEP 3 — BUILD THE QUIZ: You are creating a Tuesday review quiz about that most recent ${currentYear} Grand Prix. Generate exactly 10 questions in this exact order (all questions are about that single most recent race):

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

${DIFFICULTY_GUIDANCE}

Return ONLY a JSON object with no other text in this exact shape:
{
  "race": "Full Grand Prix name you identified, e.g. British Grand Prix",
  "questions": [
    {
      "q": "Question text here",
      "type": "standard",
      "opts": ["Option A", "Option B", "Option C", "Option D"],
      "ans": 0,
      "fact": "Brief interesting fact about the correct answer"
    }
  ]
}

The "race" field MUST be the official name of the single most recent completed Grand Prix you identified in step 1 (for example "British Grand Prix", "Italian Grand Prix").

A question MAY optionally include an "image" field — a direct, real, publicly hosted https URL to a relevant photo from this race weekend. The client shows it above the question and hides it gracefully if it fails to load. Only include "image" when you are confident the URL is real and working; otherwise omit it entirely. Never fabricate a URL.

Every question must use real accurate data from your ${currentYear} web search. Do not guess or use outdated information or any data from ${currentYear - 1} or earlier.`;
};

router.post("/quiz/generate", async (req, res) => {
  const parsed = GenerateQuizBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { race } = parsed.data;
  const mode: "preview" | "review" = parsed.data.mode === "preview" ? "preview" : "review";

  // Preview quizzes are about a specific named circuit, so a race is required.
  // Review quizzes auto-detect the most recent race, so race is ignored.
  if (mode === "preview" && (!race || !race.trim())) {
    res.status(400).json({ error: "A race is required for the preview quiz." });
    return;
  }

  try {
    const prompt = mode === "preview" ? PREVIEW_PROMPT(race as string) : REVIEW_PROMPT();
    const fullText = await generateQuiz(anthropic, prompt, mode === "review");

    let questions: unknown[];
    // Review wraps its output as { race, questions } so the model can report the
    // race it detected; preview returns a bare questions array for a known race.
    let resolvedRace: string = race ?? "";
    try {
      if (mode === "review") {
        const obj = extractJsonObject(fullText);
        questions = Array.isArray(obj.questions) ? obj.questions : [];
        if (typeof obj.race === "string" && obj.race.trim()) {
          resolvedRace = obj.race.trim();
        } else {
          resolvedRace = "Latest Grand Prix";
        }
      } else {
        questions = extractJsonArray(fullText);
      }
    } catch (parseErr) {
      req.log.error({ parseErr, fullTextLength: fullText.length }, "Quiz JSON parse failed");
      res.status(502).json({
        error: "The AI response was incomplete or malformed. Please try again.",
      });
      return;
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      res.status(502).json({ error: "The AI returned no questions. Please try again." });
      return;
    }

    res.json({ race: resolvedRace, mode, questions });
  } catch (err) {
    req.log.error({ err }, "Quiz generation failed");

    if (err instanceof Anthropic.APIError) {
      const message = String((err as { message?: unknown }).message ?? "");
      if (err.status === 429) {
        res.status(429).json({ error: "Too many requests to the AI right now. Wait a moment and try again." });
        return;
      }
      if (/credit balance is too low/i.test(message)) {
        res.status(503).json({ error: "The AI service is temporarily unavailable (out of credits). Please try again later." });
        return;
      }
    }

    res.status(502).json({ error: "Couldn't reach the quiz generator. Please try again." });
  }
});

export default router;
