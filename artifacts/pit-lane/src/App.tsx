import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { F1Grid } from './components/games/F1Grid';

type GameId = "f1grid" | null;

export default function App() {
  const [activeGame, setActiveGame] = useState<GameId>(null);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const onHub = !activeGame;

  return (
    <div className="min-h-[100dvh] w-full bg-[#0a0a0a] text-foreground flex flex-col font-sans selection:bg-primary/30">
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur border-b border-[#1a1a1a]">
        <div className="max-w-[680px] mx-auto px-5 h-16 flex items-center gap-3">
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
            <h1 className="font-['Barlow_Condensed'] font-extrabold text-[26px] tracking-[0.16em] leading-none text-white">
              Pit Lane
            </h1>
            <p className="text-[9px] font-bold text-[#e10600] uppercase tracking-[0.25em] leading-tight mt-0.5">
              Fan Zone
            </p>
          </div>
        </div>
      </header>

      {onHub ? (
        <main className="flex-1 max-w-[680px] w-full mx-auto p-4">
          <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={() => setActiveGame("f1grid")}
              className="group relative overflow-hidden rounded-xl p-4 text-left transition-all active:scale-[0.98] bg-gradient-to-br from-[#0a0a0a] to-[#111] border border-[#2a1a1a] border-l-[3px] border-l-[#e10600] hover:border-[#e10600]"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-[9px] font-bold tracking-[0.15em] text-[#e10600] uppercase mb-1.5 flex items-center gap-1.5">
                    <span className="w-[5px] h-[5px] rounded-full bg-[#e10600] animate-pulse" />
                    NEW · Multiplayer
                  </div>
                  <div className="font-['Barlow_Condensed'] text-[28px] font-extrabold text-white leading-none mb-1.5">
                    F1 Grid
                  </div>
                  <div className="text-[12px] text-[#777] leading-relaxed">
                    Name a driver fitting both criteria — play vs AI or challenge a friend online
                  </div>
                </div>
                <div className="font-['Barlow_Condensed'] text-[40px] font-black text-[#e10600] opacity-40 ml-3 shrink-0 group-hover:opacity-70 transition-opacity">
                  ⊞
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
                F1 GRID
              </h2>
            </div>
            {activeGame === "f1grid" && <F1Grid />}
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
