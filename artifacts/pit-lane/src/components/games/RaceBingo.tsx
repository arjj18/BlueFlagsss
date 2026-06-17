import { useState, useEffect } from 'react';
import { RefreshCw, Trophy, Pencil, Check, RotateCcw, Plus, Trash2 } from 'lucide-react';

const DEFAULT_SQUARES = [
  "Safety car deployed","DRS enabled","Sub 2s pit stop","Radio complaint","Overtake on lap 1",
  "Virtual safety car","Fastest lap attempt","Spin on track","Rain starts","Team orders given",
  "Tyre failure","Penalty given","FREE","Crash at turn 1","Early chequered flag",
  "Driver swears","Podium surprise","Engine issue","Purple sector","Mechanical DNF",
  "Wet tyres used","Pit lane speeding","Gap under 1s","Comeback drive","Dramatic last lap"
];

const WINS = [
  [0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24],
  [0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24],
  [0,6,12,18,24],[4,8,12,16,20]
];

const STORAGE_KEY = "pitlane-bingo-squares";

function loadSquares(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === 25) return parsed;
    }
  } catch {}
  return [...DEFAULT_SQUARES];
}

type View = "play" | "edit";

export function RaceBingo() {
  const [squares, setSquares] = useState<string[]>(loadSquares);
  const [draft, setDraft] = useState<string[]>([]);
  const [ticked, setTicked] = useState<Set<number>>(new Set([12]));
  const [view, setView] = useState<View>("play");

  useEffect(() => {
    if (view === "edit") {
      setDraft([...squares]);
    }
  }, [view]);

  const toggle = (i: number) => {
    if (i === 12) return;
    const next = new Set(ticked);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setTicked(next);
  };

  const reset = () => setTicked(new Set([12]));

  const winningLines = WINS.filter(line => line.every(i => ticked.has(i)));
  const hasWon = winningLines.length > 0;
  const winningSquares = new Set(winningLines.flat());

  const saveAndPlay = () => {
    const saved = draft.map((s, i) => i === 12 ? "FREE" : s.trim() || DEFAULT_SQUARES[i]);
    setSquares(saved);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    setTicked(new Set([12]));
    setView("play");
  };

  const resetToDefaults = () => {
    setDraft([...DEFAULT_SQUARES]);
  };

  if (view === "edit") {
    return (
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Customise your card</p>
            <p className="text-xs text-muted-foreground mt-0.5">Edit any square — the centre is always FREE</p>
          </div>
          <button
            onClick={resetToDefaults}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-reset-defaults"
          >
            <RotateCcw className="w-3 h-3" />
            Defaults
          </button>
        </div>

        <div className="grid grid-cols-1 gap-1.5 max-h-[420px] overflow-y-auto pr-1">
          {draft.map((sq, i) => {
            if (i === 12) {
              return (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary/10 border border-primary/20"
                >
                  <span className="text-xs font-bold text-primary w-5 text-center">13</span>
                  <span className="text-xs font-semibold text-primary tracking-widest flex-1">FREE — locked</span>
                </div>
              );
            }
            const displayNum = i < 12 ? i + 1 : i + 1;
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-5 text-right shrink-0">{displayNum}</span>
                <input
                  type="text"
                  value={sq}
                  onChange={e => {
                    const next = [...draft];
                    next[i] = e.target.value;
                    setDraft(next);
                  }}
                  maxLength={40}
                  placeholder={DEFAULT_SQUARES[i]}
                  className="flex-1 bg-secondary border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 transition-colors"
                  data-testid={`input-bingo-square-${i}`}
                />
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={saveAndPlay}
            className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-sm font-semibold py-2.5 rounded-md hover:bg-primary/90 transition-colors"
            data-testid="button-save-play"
          >
            <Check className="w-4 h-4" />
            Save &amp; Play
          </button>
          <button
            onClick={() => setView("play")}
            className="px-4 py-2.5 text-sm text-muted-foreground border border-border rounded-md hover:text-foreground hover:border-border/80 transition-colors"
            data-testid="button-cancel-edit"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span>{ticked.size - 1} Ticked</span>
        {hasWon && (
          <span className="text-primary animate-pulse flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" /> BINGO
          </span>
        )}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView("edit")}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
            data-testid="button-edit-card"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
            data-testid="button-reset-bingo"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-1 md:gap-1.5">
        {squares.map((sq, i) => {
          const isTicked = ticked.has(i);
          const isWinning = winningSquares.has(i);
          const isFree = i === 12;

          let cls = "bg-secondary hover:bg-secondary/70 text-muted-foreground";
          if (isWinning) {
            cls = "bg-primary text-primary-foreground shadow-[0_0_14px_rgba(225,6,0,0.45)] scale-105 z-10";
          } else if (isTicked || isFree) {
            cls = "bg-primary/20 text-foreground border-primary/30";
          }

          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              disabled={isFree}
              data-testid={`button-bingo-square-${i}`}
              className={`aspect-square p-1 rounded font-semibold text-[8px] md:text-[10px] leading-tight flex items-center justify-center text-center border border-transparent transition-all duration-150 overflow-hidden ${cls}`}
            >
              {sq}
            </button>
          );
        })}
      </div>

      {hasWon && (
        <p className="text-center text-xs text-muted-foreground">
          Keep going for a full house!
        </p>
      )}
    </div>
  );
}
