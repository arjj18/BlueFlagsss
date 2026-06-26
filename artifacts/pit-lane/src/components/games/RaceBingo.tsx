import { useState } from 'react';
import { RefreshCw, Trophy, Check, RotateCcw, ChevronRight, X, Sparkles, AlertTriangle } from 'lucide-react';

// ── Static suggestion bank (6 categories matching the 2026 spec) ──────────────

const CATEGORIES: { label: string; items: string[] }[] = [
  {
    label: "Driver vs Driver",
    items: [
      "Leclerc outqualifies Hamilton",
      "Hamilton beats Leclerc in the race",
      "Hadjar outqualifies Verstappen",
      "Antonelli beats Russell",
      "Lawson finishes ahead of Lindblad",
      "Norris beats Piastri in qualifying",
      "Piastri passes Norris on track",
      "Albon finishes ahead of Sainz",
    ],
  },
  {
    label: "Team Events",
    items: [
      "Ferrari double top 5",
      "McLaren 1-2 finish",
      "Red Bull finishes with only one car",
      "A Mercedes driver knocked out in Q2",
      "Williams scores points",
      "Aston Martin double DNF",
      "McLaren pit stop under 2.5s",
      "Ferrari botch the strategy",
    ],
  },
  {
    label: "Chaos & Reliability",
    items: [
      "Red Bull mechanical failure",
      "McLaren suffers a reliability issue",
      "Aston Martin DNF",
      "Two cars collide at Turn 1",
      "Driver retires with engine failure",
      "Pit lane incident investigated",
      "Car stops on track blocking traffic",
      "Wrong tyres fitted — pit lane error",
    ],
  },
  {
    label: "Safety Car / Flags",
    items: [
      "2 or more safety cars",
      "Race ends under red flag",
      "Virtual Safety Car deployed",
      "Safety car deployed before Lap 10",
      "Red flag in qualifying",
      "0 yellow flags all race",
      "Race restarted after red flag",
      "Track limits penalty costs a position",
    ],
  },
  {
    label: "Underdogs",
    items: [
      "Bearman finishes in the top 5",
      "Williams reaches Q3",
      "Bortoleto finishes in the top 10",
      "Colapinto scores points",
      "Lindblad beats Lawson",
      "Ocon finishes ahead of both Racing Bulls",
      "A driver outside the top 4 teams top 6",
      "Midfield team on the podium",
    ],
  },
  {
    label: "Restarts",
    items: [
      "Chaos on the restart",
      "Driver gains 3+ positions on restart",
      "Driver loses 2+ positions on restart",
      "Restart leads to an incident",
      "Top 3 changes order on restart",
      "Midfield bunches up causing near-contact",
      "Safety car restart causes a DRS train",
      "Restart delayed due to debris on track",
    ],
  },
];

// ── Win patterns for a 4×4 grid ───────────────────────────────────────────────
// rows
const WINS = [
  [0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15],
  // cols
  [0,4,8,12], [1,5,9,13], [2,6,10,14], [3,7,11,15],
  // diagonals
  [0,5,10,15], [3,6,9,12],
];

const STORAGE_KEY = "pitlane-bingo-squares-v2"; // v2 = 4×4 layout
const BLANK: string[] = Array(16).fill("");

function loadSquares(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === 16) return parsed;
    }
  } catch {}
  return [...BLANK];
}

function saveSquares(sq: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sq));
}

// ── AI tab sentinel ───────────────────────────────────────────────────────────

const AI_TAB = -1;

type View = "setup" | "play";

// ── Component ─────────────────────────────────────────────────────────────────

export function RaceBingo() {
  const [squares, setSquares] = useState<string[]>(loadSquares);
  const [ticked, setTicked] = useState<Set<number>>(new Set());
  const [view, setView] = useState<View>(() => {
    const sq = loadSquares();
    const filled = sq.filter(s => s.trim()).length;
    return filled >= 12 ? "play" : "setup";
  });

  // Setup state
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [customText, setCustomText] = useState("");
  const [activeCategory, setActiveCategory] = useState(0);

  // AI state
  const [aiRaceInput, setAiRaceInput] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const filled = squares.filter(s => s.trim()).length;
  const usedSuggestions = new Set(squares);

  const selectSquare = (i: number) => {
    setSelectedIdx(i);
    setCustomText(squares[i]);
  };

  const fillSelected = (text: string) => {
    if (selectedIdx === null) return;
    const next = [...squares];
    next[selectedIdx] = text;
    setSquares(next);
    saveSquares(next);
    const nextEmpty = next.findIndex((s, idx) => idx > selectedIdx && !s.trim());
    if (nextEmpty !== -1) {
      setSelectedIdx(nextEmpty);
      setCustomText("");
    } else {
      setCustomText(text);
    }
  };

  const applyCustom = () => {
    if (!customText.trim() || selectedIdx === null) return;
    fillSelected(customText.trim());
  };

  const clearSquare = (i: number) => {
    const next = [...squares];
    next[i] = "";
    setSquares(next);
    saveSquares(next);
    setSelectedIdx(i);
    setCustomText("");
  };

  const clearAll = () => {
    setSquares([...BLANK]);
    saveSquares([...BLANK]);
    setSelectedIdx(null);
    setCustomText("");
  };

  const startGame = () => {
    setTicked(new Set());
    setView("play");
  };

  // ── AI generation ──────────────────────────────────────────────────────────

  const handleAiGenerate = async () => {
    setAiLoading(true);
    setAiError(null);
    setAiSuggestions([]);
    try {
      const res = await fetch('/api/bingo/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ race: aiRaceInput.trim() || undefined }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json() as { suggestions: string[] };
      setAiSuggestions(data.suggestions);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Couldn't generate suggestions — try again.");
    } finally {
      setAiLoading(false);
    }
  };

  // ── Play helpers ───────────────────────────────────────────────────────────

  const toggle = (i: number) => {
    const next = new Set(ticked);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setTicked(next);
  };

  const resetGame = () => setTicked(new Set());

  const winningLines = WINS.filter(line => line.every(i => ticked.has(i) && squares[i]?.trim()));
  const hasWon = winningLines.length > 0;
  const winningSquares = new Set(winningLines.flat());

  // ── SETUP VIEW ─────────────────────────────────────────────────────────────

  if (view === "setup") {
    const isAiTab = activeCategory === AI_TAB;
    const currentItems: string[] = isAiTab
      ? aiSuggestions
      : (CATEGORIES[activeCategory]?.items ?? []);

    return (
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-white">Build your card</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">
              {filled}/16 squares filled · tap a square, then pick below
            </p>
          </div>
          <div className="flex items-center gap-3">
            {filled > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-muted-foreground/50 hover:text-muted-foreground flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Clear all
              </button>
            )}
            {filled >= 12 && (
              <button
                onClick={startGame}
                className="flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full transition-opacity hover:opacity-90"
              >
                Start Race <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 4×4 Grid */}
        <div className="grid grid-cols-4 gap-1.5">
          {squares.map((sq, i) => {
            const isSelected = selectedIdx === i;
            const isFilled = sq.trim().length > 0;

            let cls = "";
            if (isSelected) {
              cls = "bg-[#1a1a2e] border-2 border-primary text-white";
            } else if (isFilled) {
              cls = "bg-secondary/80 border border-border text-white/90 hover:border-primary/40";
            } else {
              cls = "bg-secondary/30 border border-border/40 text-muted-foreground/30 hover:border-primary/30 hover:bg-secondary/60";
            }

            return (
              <button
                key={i}
                onClick={() => selectSquare(i)}
                className={`aspect-square p-1.5 rounded text-[9px] md:text-[10px] leading-tight font-semibold flex items-center justify-center text-center overflow-hidden transition-all ${cls}`}
              >
                {isFilled ? sq : <span className="text-[16px] font-light opacity-30">+</span>}
              </button>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="h-1 rounded-full bg-secondary/40 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${(filled / 16) * 100}%` }}
          />
        </div>

        {/* Selection panel */}
        {selectedIdx !== null && (
          <div className="flex flex-col gap-3 border border-border/40 rounded-xl p-3 bg-secondary/20">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-primary/70 uppercase tracking-wider">
                Square {selectedIdx + 1}
              </span>
              {squares[selectedIdx] && (
                <button
                  onClick={() => clearSquare(selectedIdx)}
                  className="ml-auto text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Custom text input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && applyCustom()}
                maxLength={40}
                placeholder="Type your own event…"
                className="flex-1 bg-background border border-border/60 rounded-md px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors"
                autoFocus
              />
              {customText.trim() && (
                <button
                  onClick={applyCustom}
                  className="bg-primary/90 hover:bg-primary text-white text-xs font-bold px-2.5 rounded-md transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category tabs */}
            <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none">
              {CATEGORIES.map((cat, ci) => (
                <button
                  key={cat.label}
                  onClick={() => setActiveCategory(ci)}
                  className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${
                    activeCategory === ci
                      ? 'bg-primary text-white'
                      : 'bg-secondary/60 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
              <button
                onClick={() => setActiveCategory(AI_TAB)}
                className={`shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${
                  isAiTab
                    ? 'bg-primary text-white'
                    : 'bg-secondary/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Sparkles className="w-2.5 h-2.5" />
                AI
              </button>
            </div>

            {/* AI panel */}
            {isAiTab && (
              <div className="flex flex-col gap-2.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiRaceInput}
                    onChange={e => setAiRaceInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !aiLoading && handleAiGenerate()}
                    placeholder="Race name (optional, e.g. Monaco GP)"
                    className="flex-1 bg-background border border-border/60 rounded-md px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors"
                  />
                  <button
                    onClick={handleAiGenerate}
                    disabled={aiLoading}
                    className="shrink-0 flex items-center gap-1.5 bg-primary/90 hover:bg-primary disabled:opacity-50 text-white text-[10px] font-bold px-3 py-1.5 rounded-md transition-colors"
                  >
                    {aiLoading
                      ? <RefreshCw className="w-3 h-3 animate-spin" />
                      : <Sparkles className="w-3 h-3" />}
                    {aiLoading ? 'Generating…' : 'Generate'}
                  </button>
                </div>

                {aiError && (
                  <div className="flex items-center gap-2 text-[10px] text-destructive/80 bg-destructive/10 rounded-md px-2.5 py-2 border border-destructive/20">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>{aiError}</span>
                  </div>
                )}

                {!aiLoading && aiSuggestions.length === 0 && !aiError && (
                  <p className="text-[10px] text-muted-foreground/40 text-center py-1">
                    Click Generate for 16 AI-powered event ideas
                  </p>
                )}
              </div>
            )}

            {/* Suggestion chips */}
            {currentItems.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {currentItems.map(item => {
                  const alreadyUsed = usedSuggestions.has(item);
                  return (
                    <button
                      key={item}
                      onClick={() => { if (!alreadyUsed) fillSelected(item); }}
                      disabled={alreadyUsed}
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                        alreadyUsed
                          ? 'border-border/20 text-muted-foreground/25 cursor-not-allowed line-through'
                          : isAiTab
                          ? 'border-primary/40 text-primary/80 hover:border-primary hover:text-white hover:bg-primary/15'
                          : 'border-border/50 text-white/80 hover:border-primary/60 hover:text-white hover:bg-primary/10'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {selectedIdx === null && (
          <p className="text-center text-xs text-muted-foreground/40 py-2">
            Tap any square above to start filling it in
          </p>
        )}

        {filled >= 12 && (
          <button
            onClick={startGame}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold text-sm py-3 rounded-xl hover:bg-primary/90 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
            Start Race ({filled}/16 filled)
          </button>
        )}

        {filled < 12 && filled > 0 && (
          <p className="text-center text-[10px] text-muted-foreground/40 uppercase tracking-wider">
            Fill {12 - filled} more to start
          </p>
        )}
      </div>
    );
  }

  // ── PLAY VIEW ──────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span>{ticked.size} Ticked</span>
        {hasWon && (
          <span className="text-primary animate-pulse flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" /> BINGO
          </span>
        )}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setView("setup"); setSelectedIdx(null); setCustomText(""); }}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            Edit
          </button>
          <button
            onClick={resetGame}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {squares.map((sq, i) => {
          const isTicked = ticked.has(i);
          const isWinning = winningSquares.has(i);
          const isEmpty = !sq.trim();

          let cls = "bg-secondary hover:bg-secondary/70 text-muted-foreground";
          if (isWinning) {
            cls = "bg-primary text-primary-foreground shadow-[0_0_14px_rgba(225,6,0,0.45)] scale-105 z-10";
          } else if (isTicked) {
            cls = "bg-primary/20 text-foreground border-primary/30";
          } else if (isEmpty) {
            cls = "bg-secondary/30 text-muted-foreground/20 cursor-not-allowed";
          }

          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              disabled={isEmpty}
              data-testid={`button-bingo-square-${i}`}
              className={`aspect-square p-1.5 rounded font-semibold text-[9px] md:text-[11px] leading-tight flex items-center justify-center text-center border border-transparent transition-all duration-150 overflow-hidden ${cls}`}
            >
              {isEmpty ? "—" : sq}
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
