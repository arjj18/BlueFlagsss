import { useState, useEffect, useRef } from 'react';
import { Trophy, RefreshCw, AlertTriangle, Share2, Check, X, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AutocompleteInput } from '@/components/AutocompleteInput';
import { Progress } from '@/components/ui/progress';
import { saveScore } from '@/lib/scoreHistory';
import { CircuitSilhouette } from '@/components/games/CircuitSilhouette';
import { resolveQuestionImage } from '@/lib/teamLogos';
import { getNextRace } from '@/lib/f1Calendar';
import type { Race } from '@/lib/f1Calendar';
import { trackApiCall } from '@/lib/apiUsage';
import {
  hasCompletedReviewThisWeek,
  completeReviewQuiz,
  getNextReviewTuesdayLabel,
} from '@/lib/weeklyQuiz';

// --- OpenF1 and caching helpers (client-side) ---
async function fetchRaceResultsFromOpenF1(year: number, raceName: string) {
  try {
    const sessionsResponse = await fetch(
      `https://api.openf1.org/v1/sessions?year=${year}&session_type=Race`
    );
    const sessions = await sessionsResponse.json();
    if (!sessions || sessions.length === 0) throw new Error('No race sessions found');

    const searchKey = (raceName || '').toLowerCase().split(' ')[0];
    const raceSession = sessions.find((s: any) =>
      s.session_name?.toLowerCase().includes('race') &&
      ((s.location || '').toLowerCase().includes(searchKey) || (s.country_name || '').toLowerCase().includes(searchKey))
    );

    if (!raceSession) {
      const sorted = sessions
        .filter((s: any) => new Date(s.date_end) < new Date())
        .sort((a: any, b: any) => new Date(b.date_end) - new Date(a.date_end));
      if (sorted.length === 0) throw new Error('No completed races found');
      return await fetchSessionData(sorted[0], year);
    }

    return await fetchSessionData(raceSession, year);
  } catch (error) {
    console.error('OpenF1 fetch error:', error);
    return null;
  }
}

async function fetchSessionData(session: any, year: number) {
  const sessionKey = session.session_key;
  try {
    const positionsResponse = await fetch(
      `https://api.openf1.org/v1/position?session_key=${sessionKey}&position<=10`
    );
    const positionsData = await positionsResponse.json();

    const driversResponse = await fetch(
      `https://api.openf1.org/v1/drivers?session_key=${sessionKey}`
    );
    const driversData = await driversResponse.json();

    const finalPositions: Record<number, any> = {};
    (positionsData || []).forEach((entry: any) => {
      const num = entry.driver_number;
      if (!finalPositions[num] || new Date(entry.date) > new Date(finalPositions[num].date)) {
        finalPositions[num] = entry;
      }
    });

    const driverMap: Record<number, any> = {};
    (driversData || []).forEach((d: any) => {
      driverMap[d.driver_number] = {
        name: d.full_name || `Driver ${d.driver_number}`,
        team: d.team_name || 'Unknown',
        number: d.driver_number
      };
    });

    const top10 = Object.values(finalPositions)
      .filter((p: any) => p.position <= 10)
      .sort((a: any, b: any) => a.position - b.position)
      .map((p: any) => ({
        position: p.position,
        driver: driverMap[p.driver_number]?.name || `Driver ${p.driver_number}`,
        team: driverMap[p.driver_number]?.team || 'Unknown'
      }));

    let strategyInfo = null;
    try {
      const stintsResponse = await fetch(
        `https://api.openf1.org/v1/stints?session_key=${sessionKey}`
      );
      const stintsData = await stintsResponse.json();
      strategyInfo = summariseStints(stintsData, driverMap, top10);
    } catch {
      strategyInfo = null;
    }

    return {
      session,
      raceName: session.session_name || 'Grand Prix',
      circuit: session.circuit_short_name || session.location || 'Unknown Circuit',
      country: session.country_name || 'Unknown',
      year,
      top10,
      winner: top10[0] || null,
      podium: top10.slice(0, 3),
      strategyInfo,
      totalDrivers: (driversData || []).length
    };
  } catch (error) {
    console.error('Error fetching session data:', error);
    return null;
  }
}

function summariseStints(stintsData: any[], driverMap: Record<number, any>, top10: any[]) {
  if (!stintsData || stintsData.length === 0) return null;
  const winner = top10[0];
  if (!winner) return null;
  const winnerDriverNum = Object.keys(driverMap).find(num => driverMap[num].name === winner.driver);
  if (!winnerDriverNum) return null;

  const winnerStints = stintsData
    .filter((s: any) => s.driver_number === parseInt(winnerDriverNum))
    .sort((a: any, b: any) => a.stint_number - b.stint_number);

  const compounds = winnerStints.map((s: any) => s.compound || 'Unknown');
  const stops = Math.max(0, winnerStints.length - 1);

  return {
    winnerStrategy: `${stops} stop${stops !== 1 ? 's' : ''} — ${compounds.join(' → ')}`,
    winnerCompounds: compounds,
    totalStints: winnerStints.length
  };
}

function getCachedReviewQuiz(raceName: string, year: number) {
  try {
    const key = `review_quiz_${year}_${raceName.replace(/\s+/g, '_').toLowerCase()}`;
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.timestamp > 14 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch { return null; }
}

function cacheReviewQuiz(raceName: string, year: number, questions: any[], dataSource: string) {
  try {
    const key = `review_quiz_${year}_${raceName.replace(/\s+/g, '_').toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify({
      questions,
      dataSource,
      timestamp: Date.now()
    }));
  } catch {}
}

function getCachedPreviewQuiz(raceName: string) {
  try {
    const key = `preview_quiz_${raceName.replace(/\s+/g, '_').toLowerCase()}`;
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.timestamp > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch { return null; }
}

function cachePreviewQuiz(raceName: string, questions: any[]) {
  try {
    const key = `preview_quiz_${raceName.replace(/\s+/g, '_').toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify({
      questions,
      timestamp: Date.now()
    }));
  } catch {}
}

type QuizQuestion = {
  q: string;
  type?: string;
  opts?: string[];
  ans?: number;
  clues?: string[];
  fact?: string;
};

type PostRaceQuizProps = {
  initialMode?: 'preview' | 'review';
  onPlayGeneral?: () => void;
};

async function generatePreviewQuizClient(race: Race, showLoadingFn: () => void, startQuizFn: (questions: QuizQuestion[], raceName: string, dataSource: string) => void) {
  const raceName = race.name;
  const circuit = race.circuit;
  const country = race.country;
  const currentYear = new Date().getFullYear();

  const cached = getCachedPreviewQuiz(raceName);
  if (cached) {
    console.log('Serving cached preview quiz for', raceName);
    startQuizFn(cached.questions, raceName, 'Cached preview quiz (free)');
    return;
  }

  showLoadingFn();

  const previewPrompt = `You are an expert F1 historian and quiz master with deep knowledge of Formula 1 history going back to 1950.

Generate exactly 10 multiple choice quiz questions about the HISTORY of the ${raceName} at ${circuit} in ${country}.

This is a preview quiz shown before the race happens so do not reference the ${currentYear} race at all. Focus entirely on historical facts from previous years.

Cover these topics in this exact order:
1. First ever Formula 1 Grand Prix held at this circuit — which year
2. Driver with most pole positions at this circuit all time
3. A famous historical moment at this circuit — describe it without naming the driver or year and ask what happened or who was involved
4. Describe the circuit layout correctly and give three wrong descriptions of similar circuits — ask which layout belongs to ${circuit}
5. How the circuit has changed from its original layout to the current version — one correct change and three plausible but wrong changes
6. Describe a famous race at this circuit without naming the year — ask which year from four options
7. Four statistics about this circuit with one being slightly wrong — ask which stat is incorrect
8. Who holds the current lap record at this circuit
9. Has a World Championship ever been decided at this circuit — if so who won it there
10. Four clue reveal about a driver with a legendary connection to this circuit — reveal clues one at a time and ask who the driver is — use type whoami

Only ask about facts you are highly confident are correct. Return ONLY a valid JSON array with no other text no markdown no code blocks:
[
  {"q":"Question?","type":"standard","opts":["A","B","C","D"],"ans":0,"fact":"Interesting verified fact about the correct answer."},
  {"q":"Who am I?","type":"whoami","clues":["Very vague clue","Narrows it down","More specific","Almost gives it away"],"opts":["Driver A","Driver B","Driver C","Driver D"],"ans":0,"fact":"Brief fact about this driver and their connection to this circuit."}
]`;

  try {
    const response = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1200,
        messages: [{ role: 'user', content: previewPrompt }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const text: string = data.content ?? '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No valid JSON in response');

    const questions = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Empty questions array');
    }

    cachePreviewQuiz(raceName, questions);
    trackApiCall(1);

    startQuizFn(questions, raceName, `AI-generated preview quiz — ${circuit} history`);
  } catch (error) {
    console.error('Preview quiz generation failed:', error);
    throw error;
  }
}

async function generateReviewQuizClient(
  raceName: string,
  showLoadingFn: (raceName: string) => void,
  startQuizFn: (questions: QuizQuestion[], raceName: string, dataSource: string) => void
) {
  const currentYear = new Date().getFullYear();

  const cached = getCachedReviewQuiz(raceName, currentYear);
  if (cached) {
    console.log('Serving cached review quiz for', raceName);
    startQuizFn(cached.questions, raceName, cached.dataSource + ' (cached)');
    return;
  }

  showLoadingFn(raceName);

  try {
    console.log('Fetching race data from OpenF1...');
    const raceData = await fetchRaceResultsFromOpenF1(currentYear, raceName);

    let raceContext = '';
    let dataSource = '';

    if (raceData && raceData.winner) {
      const podiumText = raceData.podium
        .map((p: any, i: number) => `P${i+1}: ${p.driver} (${p.team})`)
        .join(', ');

      const top10Text = raceData.top10
        .map((p: any) => `P${p.position}: ${p.driver} (${p.team})`)
        .join(' | ');

      raceContext = `
VERIFIED REAL RACE RESULTS — ${raceData.raceName.toUpperCase()} ${currentYear}:
Race Winner: ${raceData.winner.driver} driving for ${raceData.winner.team}
Podium: ${podiumText}
Top 10 finishers: ${top10Text}
${raceData.strategyInfo ? 'Strategy info: ' + raceData.strategyInfo.winnerStrategy : ''}
Circuit: ${raceData.circuit}, ${raceData.country}
Total classified finishers: ${raceData.totalDrivers}

IMPORTANT: Base all questions about race results, winner, and podium ONLY on the verified data above. Do not guess or use data from other races.`;

      dataSource = `✅ Real ${raceData.raceName} ${currentYear} results from OpenF1`;
      console.log('Real race data loaded:', raceData.winner.driver, 'won at', raceData.raceName);

    } else {
      raceContext = `
Note: Real-time race data from OpenF1 was not available for the ${raceName} ${currentYear}.
Generate 6 general F1 knowledge questions about the ${raceName} circuit and its history instead.
Do not make up specific ${currentYear} race results. Focus on historical facts about this circuit.`;

      dataSource = '⚠️ Live data unavailable — questions based on circuit history';
      console.log('OpenF1 data unavailable, using circuit history questions');
    }

    const reviewPrompt = `You are an F1 quiz master. Generate exactly 6 multiple choice quiz questions.

${raceContext}

Question requirements:
1. Race winner question — who won this race and what was notable about their victory
2. Podium question — who finished P2 or P3 and for which team
3. Notable driver question — a driver who had a particularly good or bad race
4. Strategy or tyres question — pit stops, compounds used, or key strategic decision
5. Incident question — a safety car period, notable crash, or memorable moment during the race
6. Championship impact question — how this result changed the title fight standings

If real race data was provided above use it for questions 1 through 4 at minimum.
Make all four answer options plausible — do not make wrong answers obviously wrong.

Return ONLY a valid JSON array. No introduction. No explanation. No markdown. Just the raw JSON starting with [ and ending with ]:
[{"q":"Question?","opts":["Option A","Option B","Option C","Option D"],"ans":0,"fact":"Brief interesting fact about the correct answer."}]`;

    const response = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 900,
        messages: [{ role: 'user', content: reviewPrompt }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const text: string = data.content ?? '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No valid JSON in response');

    const questions = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Empty questions array');
    }

    cacheReviewQuiz(raceName, currentYear, questions, dataSource);
    trackApiCall(1);

    startQuizFn(questions, raceName, dataSource);

  } catch (error) {
    console.error('Review quiz generation failed:', error);
    throw error;
  }
}

export default function PostRaceQuiz({ initialMode = 'review', onPlayGeneral }: PostRaceQuizProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextRace = getNextRace();

  async function handleStart() {
    setError(null);
    if (!nextRace) {
      setError('Next race data unavailable');
      return;
    }
    setLoading(true);
    try {
      if (initialMode === 'preview') {
        await generatePreviewQuizClient(nextRace, () => {}, () => {});
      } else {
        await generateReviewQuizClient(nextRace.name, () => {}, () => {});
      }
    } catch (e) {
      console.error(e);
      setError('Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4">
      <div className="mb-3 font-bold">
        {initialMode === 'preview' ? 'Preview quiz' : 'Post-race review quiz'}
      </div>
      <div className="text-sm text-[#666] mb-3">
        {initialMode === 'preview'
          ? `Generate a 10-question history quiz about ${nextRace?.circuit ?? 'this weekend\'s circuit'}.`
          : 'Generate a short 6-question review for the latest race.'}
      </div>
      {nextRace ? (
        <div className="flex items-center gap-3">
          <Button onClick={handleStart} disabled={loading}>{loading ? 'Generating…' : `Generate for ${nextRace.name}`}</Button>
          <Button variant="secondary" onClick={() => { localStorage.clear(); }}>Clear cache</Button>
        </div>
      ) : (
        <div className="text-sm text-[#999]">No upcoming race found.</div>
      )}
      {error && <div className="text-sm text-[#e10600] mt-3">{error}</div>}
    </div>
  );
}
