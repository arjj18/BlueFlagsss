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
import {
  hasCompletedReviewThisWeek,
  completeReviewQuiz,
  getNextReviewTuesdayLabel,
} from '@/lib/weeklyQuiz';

// --- OpenF1 and caching helpers (client-side) ---
async function fetchRaceResultsFromOpenF1(year, raceName) {
  try {
    const sessionsResponse = await fetch(
      `https://api.openf1.org/v1/sessions?year=${year}&session_type=Race`
    );
    const sessions = await sessionsResponse.json();
    if (!sessions || sessions.length === 0) throw new Error('No race sessions found');

    const searchKey = (raceName || '').toLowerCase().split(' ')[0];
    const raceSession = sessions.find(s =>
      s.session_name?.toLowerCase().includes('race') &&
      ((s.location || '').toLowerCase().includes(searchKey) || (s.country_name || '').toLowerCase().includes(searchKey))
    );

    if (!raceSession) {
      const sorted = sessions
        .filter(s => new Date(s.date_end) < new Date())
        .sort((a, b) => new Date(b.date_end) - new Date(a.date_end));
      if (sorted.length === 0) throw new Error('No completed races found');
      return await fetchSessionData(sorted[0], year);
    }

    return await fetchSessionData(raceSession, year);
  } catch (error) {
    console.error('OpenF1 fetch error:', error);
    return null;
  }
}

async function fetchSessionData(session, year) {
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

    const finalPositions = {};
    (positionsData || []).forEach(entry => {
      const num = entry.driver_number;
      if (!finalPositions[num] || new Date(entry.date) > new Date(finalPositions[num].date)) {
        finalPositions[num] = entry;
      }
    });

    const driverMap = {};
    (driversData || []).forEach(d => {
      driverMap[d.driver_number] = {
        name: d.full_name || `Driver ${d.driver_number}`,
        team: d.team_name || 'Unknown',
        number: d.driver_number
      };
    });

    const top10 = Object.values(finalPositions)
      .filter(p => p.position <= 10)
      .sort((a, b) => a.position - b.position)
      .map(p => ({
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

function summariseStints(stintsData, driverMap, top10) {
  if (!stintsData || stintsData.length === 0) return null;
  const winner = top10[0];
  if (!winner) return null;
  const winnerDriverNum = Object.keys(driverMap).find(num => driverMap[num].name === winner.driver);
  if (!winnerDriverNum) return null;

  const winnerStints = stintsData
    .filter(s => s.driver_number === parseInt(winnerDriverNum))
    .sort((a, b) => a.stint_number - b.stint_number);

  const compounds = winnerStints.map(s => s.compound || 'Unknown');
  const stops = Math.max(0, winnerStints.length - 1);

  return {
    winnerStrategy: `${stops} stop${stops !== 1 ? 's' : ''} — ${compounds.join(' → ')}`,
    winnerCompounds: compounds,
    totalStints: winnerStints.length
  };
}

function getCachedReviewQuiz(raceName, year) {
  try {
    const key = `review_quiz_${year}_${raceName.replace(/\s+/g, '_').toLowerCase()}`;
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    // Cache valid for 14 days
    if (Date.now() - parsed.timestamp > 14 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch { return null; }
}

function cacheReviewQuiz(raceName, year, questions, dataSource) {
  try {
    const key = `review_quiz_${year}_${raceName.replace(/\s+/g, '_').toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify({
      questions,
      dataSource,
      timestamp: Date.now()
    }));
  } catch {}
}

async function generateReviewQuizClient(raceName, showLoadingFn, startQuizFn) {
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

    if (raceData && raceData.winner) {
      const podiumText = raceData.podium
        .map((p, i) => `P${i+1}: ${p.driver} (${p.team})`)
        .join(', ');

      const top10Text = raceData.top10
        .map(p => `P${p.position}: ${p.driver} (${p.team})`)
        .join(', ');

      raceContext = `\nREAL RACE RESULTS FROM ${raceName.toUpperCase()} ${currentYear}:\n- Race Winner: ${raceData.winner.driver} (${raceData.winner.team})\n- Podium: ${podiumText}\n- Top 10 Fini...`;

      console.log('Real race data loaded successfully:', raceData.winner.driver, 'won');

    } else {
      raceContext = `\nNote: Real-time race data could not be fetched. Generate questions based on your knowledge of the ${raceName} ${currentYear}. \nIf you do not have reliable information abou...`;

      console.log('OpenF1 data unavailable — using AI knowledge fallback');
    }

    const reviewPrompt = `You are an F1 quiz master creating a post-race review quiz.\n\n${raceContext}\n\nGenerate exactly 6 multiple choice quiz questions about the ${raceName} ${currentYear}.[...]`;

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
    const text = data.content ?? '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No valid JSON in response');

    const questions = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Empty questions array');
    }

    const dataSource = raceData?.winner
      ? `✅ Questions based on real ${raceName} ${currentYear} results via OpenF1`
      : `⚠️ Live data unavailable — questions based on AI knowledge`;

    cacheReviewQuiz(raceName, currentYear, questions, dataSource);

    startQuizFn(questions, raceName, dataSource);

  } catch (error) {
    console.error('Review quiz generation failed:', error);
    throw error;
  }
}

// Minimal PostRaceQuiz component to ensure the module exports a default React component
export default function PostRaceQuiz() {
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
      // Use the client generator to create quiz (UI handlers omitted for brevity)
      await generateReviewQuizClient(nextRace.name, () => {}, () => {});
    } catch (e) {
      console.error(e);
      setError('Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4">
      <div className="mb-3 font-bold">Post-race review quiz</div>
      <div className="text-sm text-[#666] mb-3">Generate a short 6-question review for the latest race.</div>
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
