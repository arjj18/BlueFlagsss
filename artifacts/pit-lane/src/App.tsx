import { useState } from 'react';
import { ArrowLeft, BarChart2, CalendarDays, Zap } from 'lucide-react';
import { RaceBingo } from './components/games/RaceBingo';
import { WheelKnowledgeQuiz } from './components/games/WheelKnowledgeQuiz';
import { Tenabell } from './components/games/Tenabell';
import { TwentyFourO, BUDGET as TWENTYFOURO_BUDGET } from './components/games/TwentyFourO';
import { ScoreHistory } from './components/ScoreHistory';
import { RaceSchedule } from './components/RaceSchedule';
import { RacePredictor } from './components/games/RacePredictor';
import { getDailyCategory, loadStreak, getTodayKey } from './lib/tenabellCategories';
import { RaceCountdown } from './components/RaceCountdown';
import { getCurrentRaceStatus } from './lib/f1Calendar';
import React from 'react';

const dailyCat = getDailyCategory();
const streakState = loadStreak();
const todayKeyHub = getTodayKey();
const raceStatus = getCurrentRaceStatus();

const yesterday = new Date(Date.now() - 86_400_000);
const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
const tenabellStreakActive =
  streakState.current >= 2 &&
  (streakState.lastDate === todayKeyHub || streakState.lastDate === yesterdayKey);

type GameId = "bingo" | "wheel" | "tenabell" | "twentyfour" | "history" | "schedule" | "predictor" | null;

export default function App() {
  const [activeGame, setActiveGame] = useState<GameId>(null);

  React.useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const renderGame = () => {
    switch (activeGame) {
      case "bingo":      return <RaceBingo />;
      case "wheel":      return <WheelKnowledgeQuiz />;
      case "tenabell":   return <Tenabell />;
      case "twentyfour": return <TwentyFourO />;
      case "history":    return <ScoreHistory onClose={() => setActiveGame(null)} />;
      case "schedule":   return <RaceSchedule onClose={() => setActiveGame(null)} />;
      case "predictor":  return <RacePredictor />;
      default: return null;
    }
  };

  const getGameTitle = () => {
    switch (activeGame) {
      case "bingo":      return "RACE BINGO";
      case "wheel":      return "F1 WHEEL KNOWLEDGE";
      case "tenabell":   return "TENABELL";
      case "twentyfour": return "24-0";
      case "history":    return "SCORE HISTORY";
      case "schedule":   return "2026 SCHEDULE";
      case "predictor":  return "RACE PREDICTOR";
      default: return "";
    }
  };

  const onHub = !activeGame;

  return (
    <div className="min-h-[100dvh] w-full bg-[#0a0a0a] text-foreground flex flex-col font-sans selection:bg-primary/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur border-b border-[#1a1a1a]">
        <div className="max-w-[680px] mx-auto px-5 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {activeGame && (
              <button
                onClick={() => setActiveGame(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors shrink-0"
                aria-label="Back to hub"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="min-w-0">
              <h1 className="font-['Barlow_Condensed'] font-black text-[26px] tracking-[0.16em] leading-none text-white">
                PIT LANE
              </h1>
              <p className="text-[9px] font-bold text-[#e10600] uppercase tracking-[0.25em] leading-tight mt-0.5">
                Fan Zone
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {onHub && raceStatus.kind !== "offseason" && (
              <button
                onClick={() => setActiveGame("schedule")}
                className="text-right group"
                title={
                  raceStatus.kind === "weekend"
                    ? `Race weekend — ${raceStatus.race.name}`
                    : `${raceStatus.daysUntil} day${raceStatus.daysUntil === 1 ? "" : "s"} until ${raceStatus.race.name} — view full schedule`
                }
              >
                <div className="text-[9px] font-bold tracking-wider text-[#555] uppercase mb-[3px]">
                  Next Race
                </div>
                <div className="bg-[#e10600] text-white text-[12px] font-bold px-3 py-1 rounded-full tracking-wide flex items-center gap-1.5 group-hover:opacity-90 transition-opacity">
                  {raceStatus.kind === "weekend" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />
                  )}
                  {raceStatus.race.shortName}
                  <span className="opacity-60">&middot;</span>
                  R{raceStatus.race.round}
                </div>
              </button>
            )}
            {onHub && raceStatus.kind === "offseason" && (
              <button
                onClick={() => setActiveGame("schedule")}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Race schedule"
                title="Race schedule"
              >
                <CalendarDays className="w-4 h-4" />
              </button>
            )}
            {onHub && (
              <button
                onClick={() => setActiveGame("history")}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Score history"
                title="Score history"
              >
                <BarChart2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Race weekend countdown strip */}
      {onHub && raceStatus.kind !== "offseason" && <RaceCountdown status={raceStatus} />}

      {/* Main Content Area */}
      {onHub ? (
        <main className="flex-1 max-w-[680px] w-full mx-auto p-4">
          <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Race Bingo — featured */}
            <button
              onClick={() => setActiveGame("bingo")}
              className="group relative overflow-hidden rounded-xl p-4 text-left transition-all active:scale-[0.98] bg-gradient-to-br from-[#1a0a0a] to-[#111] border border-[#2a1a1a] border-l-[3px] border-l-[#e10600] hover:border-[#e10600]"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] font-bold tracking-[0.15em] text-[#e10600] uppercase mb-1.5 flex items-center gap-1.5">
                    <span className="w-[5px] h-[5px] rounded-full bg-[#e10600] animate-pulse" />
                    Live Race
                  </div>
                  <div className="font-['Barlow_Condensed'] text-[28px] font-extrabold text-white leading-none tracking-wide mb-1.5">
                    Race Bingo
                  </div>
                  <div className="text-[12px] text-[#777] leading-relaxed">
                    Build your card before lights out. Tick off events as they happen live.
                  </div>
                </div>
                <div className="text-[32px] ml-3 opacity-80 shrink-0">⬛</div>
              </div>
            </button>

            {/* Tenabell + F1 Knowledge — two column */}
            <div className="grid grid-cols-2 gap-2">
              {/* Tenabell */}
              <button
                onClick={() => setActiveGame("tenabell")}
                className="group flex flex-col rounded-xl p-3.5 text-left transition-all active:scale-[0.98] bg-[#111] border border-[#222] border-t-2 border-t-[#e65100] hover:border-[#e65100]"
              >
                <div className="text-[20px] mb-2">🔟</div>
                <div className="text-[9px] font-bold tracking-[0.12em] text-[#e65100] uppercase mb-1">Daily</div>
                <div className="font-['Barlow_Condensed'] text-[22px] font-extrabold text-white leading-none mb-1.5">
                  Tenabell
                </div>
                <div className="text-[11px] text-[#666] leading-snug mb-2">Name 10 in a category</div>
                <div className="mt-auto flex flex-col gap-0.5">
                  <div className="text-[10px] font-semibold text-[#e65100]/90 truncate">
                    Today: {dailyCat.teaser}
                  </div>
                  {tenabellStreakActive && (
                    <div className="text-[10px] font-bold text-[#e65100]/80">
                      🔥 {streakState.current} day streak
                    </div>
                  )}
                </div>
              </button>

              {/* F1 Knowledge */}
              <button
                onClick={() => setActiveGame("wheel")}
                className="group flex flex-col rounded-xl p-3.5 text-left transition-all active:scale-[0.98] bg-[#111] border border-[#222] border-t-2 border-t-[#2e7d32] hover:border-[#2e7d32]"
              >
                <div className="text-[20px] mb-2">❓</div>
                <div className="text-[9px] font-bold tracking-[0.12em] text-[#2e7d32] uppercase mb-1">Any Time</div>
                <div className="font-['Barlow_Condensed'] text-[22px] font-extrabold text-white leading-none mb-1.5">
                  F1 Knowledge
                </div>
                <div className="text-[11px] text-[#666] leading-snug mb-2">Trivia &amp; AI race quizzes</div>
                <div className="mt-auto text-[10px] font-semibold text-[#2e7d32]/80">3 modes · Daily picks</div>
              </button>
            </div>

            {/* 24-0 — featured */}
            <button
              onClick={() => setActiveGame("twentyfour")}
              className="group relative overflow-hidden rounded-xl p-4 text-left transition-all active:scale-[0.98] bg-gradient-to-br from-[#0a0a14] to-[#111] border border-[#1a1a2a] border-l-[3px] border-l-[#7c3aed] hover:border-[#7c3aed]"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-[9px] font-bold tracking-[0.15em] text-[#7c3aed] uppercase mb-1.5">
                    Season Sim
                  </div>
                  <div className="font-['Barlow_Condensed'] text-[32px] font-black text-white leading-none tracking-tight">
                    24-0
                  </div>
                  <div className="text-[12px] text-[#777] mt-1 leading-relaxed">
                    Draft your constructor on a {TWENTYFOURO_BUDGET}-pt budget — 2 drivers, engine &amp; chassis. Can you go unbeaten?
                  </div>
                </div>
                <div className="text-center bg-[#7c3aed]/10 border border-[#7c3aed]/25 rounded-lg px-3.5 py-2.5 shrink-0 ml-3">
                  <div className="font-['Barlow_Condensed'] text-[28px] font-black text-[#7c3aed] leading-none">24</div>
                  <div className="text-[8px] text-[#666] font-bold tracking-[0.1em] mt-0.5">RACES</div>
                </div>
              </div>
            </button>

            {/* Race Predictor — full width */}
            <button
              onClick={() => setActiveGame("predictor")}
              className="group relative overflow-hidden rounded-xl p-4 text-left transition-all active:scale-[0.98] bg-gradient-to-br from-[#0a0f0a] to-[#111] border border-[#1a2a1a] border-l-[3px] border-l-[#2e7d32] hover:border-[#2e7d32]"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-[9px] font-bold tracking-[0.15em] text-[#2e7d32] uppercase mb-1.5 flex items-center gap-1.5">
                    <Zap className="w-3 h-3" />
                    Next Race
                    {raceStatus.kind !== "offseason" && (
                      <span className="text-[#666] normal-case tracking-normal font-semibold">
                        · {raceStatus.race.shortName}
                      </span>
                    )}
                  </div>
                  <div className="font-['Barlow_Condensed'] text-[26px] font-extrabold text-white leading-none mb-1">
                    Race Predictor
                  </div>
                  <div className="text-[12px] text-[#777] leading-relaxed">
                    AI predictions — podium, top 10, strategy &amp; title impact.
                  </div>
                </div>
                <div className="font-['Barlow_Condensed'] text-[40px] font-black text-[#2e7d32] opacity-40 ml-3 shrink-0 group-hover:opacity-70 transition-opacity">
                  →
                </div>
              </div>
            </button>

          </div>
        </main>
      ) : (
        <main className="flex-1 max-w-[680px] w-full mx-auto p-4 py-6 md:py-8">
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="mb-6">
              <h2 className="font-['Barlow_Condensed'] text-3xl font-black tracking-wide text-white">
                {getGameTitle()}
              </h2>
            </div>
            {renderGame()}
          </div>
        </main>
      )}

      <footer className="flex justify-center px-4 pb-4 pt-2">
        <a
          href="mailto:blueflagsgames@gmail.com"
          className="text-[11px] tracking-[0.18em] uppercase text-[#6b7280] transition-colors hover:text-[#e10600] hover:underline"
        >
          blueflagsgames@gmail.com
        </a>
      </footer>
    </div>
  );
}
