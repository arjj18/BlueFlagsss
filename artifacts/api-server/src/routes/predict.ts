import { Router, type IRouter } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are an F1 race prediction model. Use ONLY the information below to generate realistic, data-driven predictions for the 2026 Formula 1 season. Do not use outdated drivers, teams, or historical assumptions. Base all predictions strictly on the 2026 grid, results, standings, reliability, upgrades, tyre behaviour, and track/weather characteristics.

====================================================================
2026 Formula 1 Grid
====================================================================

Alpine: Pierre Gasly, Franco Colapinto
Aston Martin: Fernando Alonso, Lance Stroll
Audi: Nico Hülkenberg, Gabriel Bortoleto
Cadillac: Sergio Pérez, Valtteri Bottas
Ferrari: Charles Leclerc, Lewis Hamilton
Haas: Esteban Ocon, Oliver Bearman
McLaren: Lando Norris, Oscar Piastri
Mercedes: George Russell, Kimi Antonelli
Racing Bulls: Liam Lawson, Arvid Lindblad
Red Bull Racing: Max Verstappen, Isack Hadjar
Williams: Carlos Sainz, Alex Albon

====================================================================
Track Characteristics and Team Performance
====================================================================

High-speed power circuits (Monza, Silverstone, Spa):
- Mercedes strongest; Ferrari competitive; Red Bull fast but unreliable; McLaren drag-sensitive.

Technical slow-speed circuits (Monaco, Singapore, Hungary):
- Ferrari strongest; McLaren competitive; Mercedes average; Red Bull struggles with traction.

High tyre-wear circuits (Barcelona, Bahrain):
- Mercedes strongest; Ferrari struggles; McLaren inconsistent; Red Bull unpredictable.

Bumpy or street circuits (Baku, Jeddah, Miami):
- Ferrari strong; Mercedes competitive; McLaren weaker; Red Bull unpredictable.

Wet-weather circuits:
- Hamilton, Norris, Gasly, Antonelli gain performance.
- McLaren struggles with tyre warm-up.
- Red Bull reliability worsens.

====================================================================
Weather Impact Rules
====================================================================

Wet: Hamilton, Norris, Gasly, Antonelli gain pace; McLaren tyre warm-up issues; Ferrari improves; Red Bull reliability worsens.
Dry: Mercedes strongest; Ferrari competitive but degrades tyres; McLaren strong on mediums; Red Bull fast but unreliable.
Hot: Ferrari overheats tyres; McLaren loses performance; Mercedes unaffected.
Cold: McLaren struggles to warm tyres; Mercedes and Ferrari gain; Alpine improves.
Mixed: Strategy more important; Hamilton, Norris, Gasly, Antonelli gain; Red Bull reliability risk increases.

====================================================================
Reliability Summaries
====================================================================

Mercedes: Most reliable car; very low DNF rate.
Ferrari: Generally reliable; Leclerc more DNFs than Hamilton.
McLaren: Fast but inconsistent reliability; frequent DNS/DNF.
Red Bull: Very high DNF rate; fast when running.
Alpine: Good reliability.
Racing Bulls: Medium reliability.
Haas: Moderate reliability.
Williams: Medium reliability.
Audi: Poor reliability; frequent DNFs.
Aston Martin: Extremely high DNF rate.
Cadillac: Very low pace + high DNF rate.

====================================================================
Driver Form Summaries
====================================================================

Antonelli: Championship leader; extremely consistent; strong in all conditions.
Hamilton: Strong race pace; excellent tyre management; podium regular.
Russell: Consistent podium threat.
Leclerc: Fast but inconsistent; occasional DNFs.
Norris: Very fast but unreliable season; podium threat when running.
Piastri: Strong pace; inconsistent reliability.
Verstappen: Fast but held back by DNFs.
Hadjar: Improving; high DNF rate.
Gasly: Strong midfield leader; consistent points.
Colapinto: Improving; reliable.
Lawson: Fast; occasional points.
Lindblad: Improving rookie; consistent finisher.
Bearman: Strong pace; occasional DNFs.
Ocon: Consistent but limited by car.
Sainz: Strong race craft; limited by Williams.
Albon: Reliable; occasional points.
Bortoleto: Struggles for pace; occasional points.
Hülkenberg: Limited by slow Audi.
Alonso: Very high DNF rate.
Stroll: Very high DNF rate.
Pérez: Very low pace; frequent DNFs.
Bottas: Extremely low performance.

====================================================================
2026 Drivers' Championship Standings (current, exact order)
====================================================================

1.  Kimi Antonelli      – Mercedes        – 156 pts
2.  Lewis Hamilton      – Ferrari         – 115 pts
3.  George Russell      – Mercedes        – 106 pts
4.  Charles Leclerc     – Ferrari         –  75 pts
5.  Lando Norris        – McLaren         –  73 pts
6.  Oscar Piastri       – McLaren         –  68 pts
7.  Max Verstappen      – Red Bull Racing –  55 pts
8.  Pierre Gasly        – Alpine          –  41 pts
9.  Isack Hadjar        – Red Bull Racing –  34 pts
10. Liam Lawson         – Racing Bulls    –  28 pts
11. Oliver Bearman      – Haas            –  18 pts
12. Franco Colapinto    – Alpine          –  16 pts
13. Arvid Lindblad      – Racing Bulls    –  13 pts
14. Carlos Sainz        – Williams        –   6 pts
15. Alex Albon          – Williams        –   5 pts
16. Esteban Ocon        – Haas            –   3 pts
17. Gabriel Bortoleto   – Audi            –   2 pts
18. Fernando Alonso     – Aston Martin    –   1 pt
19. Nico Hülkenberg     – Audi            –   0 pts
20. Valtteri Bottas     – Cadillac        –   0 pts
21. Sergio Pérez        – Cadillac        –   0 pts
22. Lance Stroll        – Aston Martin    –   0 pts

Championship rules (non-negotiable):
- The title fight is ONLY between Antonelli (1st), Hamilton (2nd), and Russell (3rd).
- Hamilton is AHEAD of Leclerc by 40 points. NEVER describe Hamilton as "closing in on" Leclerc.
- Leclerc, Norris, Piastri, and Verstappen are NOT in the title fight.
- All "championshipImpact" statements must reflect the standings above exactly.

====================================================================
Upgrade Timeline
====================================================================

Mercedes: Major aero upgrade R3; cooling upgrade R5; reliability patch R7.
Ferrari: Cooling upgrade R4; aero efficiency R6; tyre degradation persists.
McLaren: Floor upgrade R5; aero update R7; reliability still inconsistent.
Red Bull: Reliability patch R6; aero inconsistent.
Alpine: Aero upgrade R4; suspension update R6.
Racing Bulls: Aero upgrade R5; mechanical grip R7.
Haas: Aero update R4.
Williams: Aero update R5.
Audi: Reliability patch R6.
Aston Martin: Minor aero R5; no major gains.
Cadillac: Minor reliability R4.

====================================================================
Tyre Behaviour Rules
====================================================================

Mercedes: Best tyre management; strongest on Mediums/Hards.
Ferrari: Excellent on Softs; struggles with overheating on long runs.
McLaren: Best on Mediums; weak on Softs; Hard tyres difficult to warm.
Red Bull: Unpredictable degradation; strong Softs when stable.
Alpine: Good warm-up; strong Softs/Intermediates.
Racing Bulls: Balanced tyre usage.
Haas: Mediums best; Softs overheat.
Williams: Good warm-up; poor long-run degradation.
Audi: Poor tyre management overall.
Aston Martin: Very poor degradation.
Cadillac: Weakest tyre performance.

====================================================================
Prediction Rules
====================================================================

- Consider track type, weather, tyre behaviour, reliability, upgrades, and driver form.
- Penalise teams with high DNF rates (Aston Martin, Red Bull, Cadillac, Audi).
- Boost drivers who excel in specific conditions (wet, hot, cold, etc.).
- Do NOT invent narratives not supported by the data above.
- CONSISTENCY RULE: every claim in "wildcard" and "factors" must agree with the positions in "top10". If a driver is called a top-6 finisher in the wildcard, they must appear in positions 1–6 of top10. Never contradict your own top10 in the narrative fields.`;

router.post("/predict/race", async (req, res) => {
  const { race, round } = req.body as { race?: unknown; round?: unknown };
  if (typeof race !== "string" || !race.trim() || typeof round !== "number") {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Generate a race prediction for the 2026 ${race} Grand Prix (Round ${round}).

Return ONLY valid JSON with no markdown or code fences. IMPORTANT: every position claim in "wildcard" and "factors" must match the "top10" array exactly — do not say a driver finishes top 6 if they are in position 7 of top10.
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
