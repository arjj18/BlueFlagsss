import { useState } from 'react';
import { ArrowLeft, BarChart2 } from 'lucide-react';
import { RaceBingo } from './components/games/RaceBingo';
import { PostRaceQuiz } from './components/games/PostRaceQuiz';
import { GeneralQuiz } from './components/games/GeneralQuiz';
import { Tenabell } from './components/games/Tenabell';
import { ScoreHistory } from './components/ScoreHistory';
import React from 'react';

type GameId = "bingo" | "postRace" | "quiz" | "tenabell" | "history" | null;

export default function App() {
  const [activeGame, setActiveGame] = useState<GameId>(null);

  React.useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const renderGame = () => {
    switch (activeGame) {
      case "bingo": return <RaceBingo />;
      case "postRace": return <PostRaceQuiz />;
      case "quiz": return <GeneralQuiz />;
      case "tenabell": return <Tenabell />;
      case "history": return <ScoreHistory onClose={() => setActiveGame(null)} />;
      default: return null;
    }
  };

  const getGameTitle = () => {
    switch (activeGame) {
      case "bingo": return "RACE BINGO";
      case "postRace": return "AI RACE QUIZ";
      case "quiz": return "GENERAL QUIZ";
      case "tenabell": return "TENABELL";
      case "history": return "SCORE HISTORY";
      default: return "";
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-[680px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {activeGame && (
              <button
                onClick={() => setActiveGame(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
                aria-label="Back to hub"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="font-black text-xl tracking-widest leading-none text-white">PIT LANE</h1>
              <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] leading-tight mt-0.5">Fan Zone</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!activeGame && (
              <div className="bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                Monaco GP &middot; Round 9
              </div>
            )}
            {!activeGame && (
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-[680px] w-full mx-auto p-4 py-6 md:py-8">
        {!activeGame ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold mb-6 text-white/90">Select a game</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Game Card 1 */}
              <button
                onClick={() => setActiveGame("bingo")}
                className="group relative overflow-hidden rounded-xl bg-card border border-card-border hover:border-primary/50 text-left transition-all p-5 hover:bg-secondary/50 shadow-sm flex flex-col"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#e10600]" />
                <div className="text-[10px] font-bold tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Live Race
                </div>
                <h3 className="font-black text-lg mb-1 text-white group-hover:text-primary transition-colors">Race Bingo</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Tick off events as they happen live during the Grand Prix. First to 5 wins.</p>
              </button>

              {/* Game Card 2 */}
              <button
                onClick={() => setActiveGame("postRace")}
                className="group relative overflow-hidden rounded-xl bg-card border border-card-border hover:border-[#1565c0]/50 text-left transition-all p-5 hover:bg-secondary/50 shadow-sm flex flex-col"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#1565c0]" />
                <div className="text-[10px] font-bold tracking-wider text-muted-foreground mb-2 uppercase">
                  After Race
                </div>
                <h3 className="font-black text-lg mb-1 text-white group-hover:text-[#1565c0] transition-colors">AI Race Quiz</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Test your memory of a specific race with dynamically generated trivia.</p>
              </button>

              {/* Game Card 3 */}
              <button
                onClick={() => setActiveGame("quiz")}
                className="group relative overflow-hidden rounded-xl bg-card border border-card-border hover:border-[#2e7d32]/50 text-left transition-all p-5 hover:bg-secondary/50 shadow-sm flex flex-col"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#2e7d32]" />
                <div className="text-[10px] font-bold tracking-wider text-muted-foreground mb-2 uppercase">
                  Any Time
                </div>
                <h3 className="font-black text-lg mb-1 text-white group-hover:text-[#2e7d32] transition-colors">General Quiz</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">10 random questions to test your all-time Formula 1 knowledge.</p>
              </button>

              {/* Game Card 4 */}
              <button
                onClick={() => setActiveGame("tenabell")}
                className="group relative overflow-hidden rounded-xl bg-card border border-card-border hover:border-[#e65100]/50 text-left transition-all p-5 hover:bg-secondary/50 shadow-sm flex flex-col"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#e65100]" />
                <div className="text-[10px] font-bold tracking-wider text-muted-foreground mb-2 uppercase">
                  Any Time
                </div>
                <h3 className="font-black text-lg mb-1 text-white group-hover:text-[#e65100] transition-colors">Tenabell</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Name 10 answers in a category before the 2-minute timer runs out.</p>
              </button>

            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="mb-6">
              <h2 className="text-2xl font-black tracking-wide text-white">{getGameTitle()}</h2>
            </div>
            {renderGame()}
          </div>
        )}
      </main>
    </div>
  );
}
