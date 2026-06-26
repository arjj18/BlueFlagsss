import { useState } from 'react';
import { RefreshCw, Trophy, Check, RotateCcw, ChevronRight, X, Sparkles, AlertTriangle } from 'lucide-react';

// ── Static suggestion bank ────────────────────────────────────────────────────

const CATEGORIES: { label: string; items: string[] }[] = [
  {
    label: "Ferrari",
    items: [
      "Leclerc outqualifies Hamilton",
      "Hamilton outqualifies Leclerc",
      "Ferrari issue team orders",
      "Hamilton / Leclerc make contact",
      "Ferrari botch the strategy",
      "Hamilton complains on team radio",
      "Both Ferraris on the podium",
      "Ferrari 1-2 lock-out in qualifying",
    ],
  },
  {
    label: "Verstappen",
    items: [
      "Verstappen crashes at any point",
      "Verstappen starts from the back",
      "Verstappen ignores team orders",
      "Verstappen overtakes 5+ cars",
      "Verstappen swears on radio",
      "Verstappen gets a penalty",
      "Lawson finishes ahead of Verstappen",
      "Verstappen sets fastest lap",
    ],
  },
  {
    label: "McLaren",
    items: [
      "McLaren 1-2 finish",
      "Norris extends championship lead",
      "Piastri passes Norris on track",
      "McLaren reverse team orders",
      "Both McLarens in the top 3",
      "Norris sets fastest lap on final lap",
      "McLaren strategy wins the race",
      "Piastri takes pole position",
    ],
  },
  {
    label: "Race Chaos",
    items: [
      "2 or more safety cars in the race",
      "Red flag during the race",
      "Virtual SC in the first 10 laps",
      "Someone pits on lap 1 after contact",
      "Rain hits during the race",
      "Crash at turn 1 on lap 1",
      "Car parks in the pit lane barrier",
      "Race restarted after red flag",
    ],
  },
  {
    label: "Qualifying",
    items: [
      "Rain in Q3",
      "Red flag stops a flying lap",
      "Track limits robs someone of pole",
      "Antonelli outqualifies Russell",
      "Stroll eliminated in Q1",
      "Alonso makes it into Q3",
      "A Williams in the top 10",
      "Norris takes pole position",
    ],
  },
  {
    label: "Underdogs",
    items: [
      "Alonso on the podium",
      "Sainz finishes in the top 5",
      "Bearman scores points for Haas",
      "Antonelli on the podium",
      "Herta or Armstrong score a point",
      "Bottas scores a point",
      "A midfield team on the podium",
      "Gasly outscores both Ferraris",
    ],
  },
  {
    label: "Strategy",
    items: [
      "Sub 2s pit stop",
      "Someone pits under the safety car",
      "Three-stopper wins the race",
      "Overcut works perfectly",
      "Undercut steals a position",
      "Pit lane speeding penalty",
      "Wrong tyres fitted / pit error",
      "Tyre failure in the race",
    ],
  },
];

const ALL_SUGGESTIONS = CATEGORIES.flatMap(c => c.items);

// ── Win patterns ─────────────────────────────────────────────────────────────

const WINS = [
  [0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24],
  [0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24],
  [0,6,12,18,24],[4,8,12,16,20],
];

const STORAGE_KEY = "pitlane-bingo-squares";
const BLANK = Array.from({ length: 25 }, (_, i) => i === 12 ? "FREE" : "");

function loadSquares(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === 25) return parsed;
    }
  } catch {}
  return [...BLANK];
}

function saveSquares(sq: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sq));
}

// ── AI category sentinel ──────────────────────────────────────────────────────

const AI_TAB = -1; // special index for the AI tab

type View = "setup" | "play";

// ── Component ────────────────────────────────────────────────────────────────

export function RaceBingo() {
  const [squares, setSquares] = useState<string[]>(loadSquares);
  const [ticked, setTicked] = useState<Set<number>>(new Set([12]));
  const [view, setView] = useState<View>(() => {
    const sq = loadSquares();
    const filled = sq.filter((s, i) => i !== 12 && s.trim()).length;
    return filled >= 20 ? "play" : "setup";
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

  const filled = squares.filter((s, i) => i !== 12 && s.trim()).length;
  const usedSuggestions = new Set(squares.filter((s, i) => i !== 12));

  const selectSquare = (i: number) => {
    if (i === 12) return;
    setSelectedIdx(i);
    setCustomText(squares[i]);
  };

  const fillSelected = (text: string) => {
    if (selectedIdx === null) return;
    const next = [...squares];
    next[selectedIdx] = text;
    setSquares(next);
    saveSquares(next);
    const nextEmpty = next.findIndex((s, i) => i !== 12 && i > selectedIdx && !s.trim());
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
    const blank = [...BLANK];
    setSquares(blank);
    saveSquares(blank);
    setSelectedIdx(null);
    setCustomText("");
  };

  const startGame = () => {
    setTicked(new Set([12]));
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
        body: JSON.stringify({
          category: "General",
          race: aiRaceInput.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      const data = await res.json() as { suggestions: string[] };
      setAiSuggestions(data.suggestions);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'Couldn\'t generate suggestions — try again.');
    } finally {
      setAiLoading(false);
    }
  };

  // ── Play view helpers ──────────────────────────────────────────────────────

  const toggle = (i: number) => {
    if (i === 12) return;
    const next = new Set(ticked);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setTicked(next);
  };

  const resetGame = () => setTicked(new Set([12]));

  const winningLines = WINS.filter(line => line.every(i => ticked.has(i)));
  const hasWon = winningLines.length > 0;
  const winningSquares = new Set(winningLines.flat());

  // ── SETUP VIEW ─────────────────────────────────────────────────────────────

  if (view === "setup") {
    const isAiTab = activeCategory === AI_TAB;

    // Chips to show: static suggestions or AI results
    const currentItems: string[] = isAiTab
      ? aiSuggestions
      : CATEGORIES[activeCategory]?.items ?? [];

    return (
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-white">Build your card</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">
              {filled}/24 squares filled · tap a square, then pick below
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
            {filled >= 20 && (
              <button
                onClick={startGame}
                className="flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full transition-opacity hover:opacity-90"
              >
                Start Race <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-5 gap-1">
          {squares.map((sq, i) => {
            const isFree = i === 12;
            const isSelected = selectedIdx === i;
            const isFilled = sq.trim().length > 0;

            let cls = "";
            if (isFree) {
              cls = "bg-primary/20 text-primary border border-primary/30 cursor-default";
            } else if (isSelected) {
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
                disabled={isFree}
                className={`aspect-square p-1 rounded text-[8px] md:text-[9px] leading-tight font-semibold flex items-center justify-center text-center overflow-hidden transition-all ${cls}`}
              >
                {isFree ? "FREE" : isFilled ? sq : <span className="text-[14px] font-light opacity-30">+</span>}
              </button>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="h-1 rounded-full bg-secondary/40 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${(filled / 24) * 100}%` }}
          />
        </div>

        {/* Selected square input + suggestions */}
        {selectedIdx !== null && (
          <div className="flex flex-col gap-3 border border-border/40 rounded-xl p-3 bg-secondary/20">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-primary/70 uppercase tracking-wider">
                Square {selectedIdx + 1}
              </span>
              {squares[selectedIdx] && (
                <button onClick={() => clearSquare(selectedIdx)} className="ml-auto text-muted-foreground/40 hover:text-muted-foreground transition-colors">
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

            {/* Category tabs (static + AI) */}
            <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none">
              {CATEGORIES.map((cat, ci) => (
                <button
                  key={cat.label}
                  onClick={() => setActiveCategory(ci)}
                  className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${
                    activeCategory === ci ? 'bg-primary text-white' : 'bg-secondary/60 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
              {/* AI tab */}
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
                {/* Race name input */}
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
                    Click Generate for AI-powered event ideas
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

        {/* Prompt to tap a square */}
        {selectedIdx === null && (
          <p className="text-center text-xs text-muted-foreground/40 py-2">
            Tap any square above to start filling it in
          </p>
        )}

        {/* Start button (bottom) */}
        {filled >= 20 && (
          <button
            onClick={startGame}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold text-sm py-3 rounded-xl hover:bg-primary/90 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
            Start Race ({filled}/24 filled)
          </button>
        )}

        {filled < 20 && filled > 0 && (
          <p className="text-center text-[10px] text-muted-foreground/40 uppercase tracking-wider">
            Fill {20 - filled} more to start
          </p>
        )}
      </div>
    );
  }

  // ── PLAY VIEW ──────────────────────────────────────────────────────────────

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

      <div className="grid grid-cols-5 gap-1 md:gap-1.5">
        {squares.map((sq, i) => {
          const isTicked = ticked.has(i);
          const isWinning = winningSquares.has(i);
          const isFree = i === 12;
          const isEmpty = !sq.trim();

          let cls = "bg-secondary hover:bg-secondary/70 text-muted-foreground";
          if (isWinning) {
            cls = "bg-primary text-primary-foreground shadow-[0_0_14px_rgba(225,6,0,0.45)] scale-105 z-10";
          } else if (isTicked || isFree) {
            cls = "bg-primary/20 text-foreground border-primary/30";
          } else if (isEmpty) {
            cls = "bg-secondary/30 text-muted-foreground/20 cursor-not-allowed";
          }

          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              disabled={isFree || isEmpty}
              data-testid={`button-bingo-square-${i}`}
              className={`aspect-square p-1 rounded font-semibold text-[8px] md:text-[10px] leading-tight flex items-center justify-center text-center border border-transparent transition-all duration-150 overflow-hidden ${cls}`}
            >
              {isFree ? "FREE" : isEmpty ? "—" : sq}
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
