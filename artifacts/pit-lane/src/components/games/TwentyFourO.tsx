import { useState, useEffect, useRef } from 'react';
import { RotateCcw, Share2, ChevronRight, RefreshCw, Trophy, Pencil } from 'lucide-react';

// ── Data ──────────────────────────────────────────────────────────────────────

type PickItem = { name: string; rating: number; sub: string };

const DRIVERS: PickItem[] = [
  { name: "Lewis Hamilton",          rating: 97, sub: "Mercedes · 2007–" },
  { name: "Max Verstappen",          rating: 96, sub: "Red Bull · 2015–" },
  { name: "Ayrton Senna",            rating: 94, sub: "McLaren · 1984–94" },
  { name: "Juan Manuel Fangio",      rating: 93, sub: "Alfa/Maserati/Ferrari · 50s" },
  { name: "Michael Schumacher",      rating: 95, sub: "Ferrari · 1991–2012" },
  { name: "Alain Prost",             rating: 91, sub: "McLaren/Williams · 1980–93" },
  { name: "Fernando Alonso",         rating: 91, sub: "Renault/Ferrari · 2001–" },
  { name: "Sebastian Vettel",        rating: 90, sub: "Red Bull · 2006–22" },
  { name: "Jim Clark",               rating: 88, sub: "Lotus · 1960–68" },
  { name: "Nigel Mansell",           rating: 87, sub: "Williams · 1980–95" },
  { name: "Jackie Stewart",          rating: 86, sub: "Tyrrell · 1965–73" },
  { name: "Mika Häkkinen",           rating: 85, sub: "McLaren · 1991–2001" },
  { name: "Charles Leclerc",         rating: 85, sub: "Ferrari · 2018–" },
  { name: "Lando Norris",            rating: 83, sub: "McLaren · 2019–" },
  { name: "Nico Rosberg",            rating: 82, sub: "Mercedes · 2006–16" },
  { name: "Carlos Sainz",            rating: 81, sub: "Ferrari/Williams · 2015–" },
  { name: "Jenson Button",           rating: 80, sub: "Honda/McLaren · 2000–16" },
  { name: "George Russell",          rating: 80, sub: "Mercedes · 2019–" },
  { name: "Damon Hill",              rating: 79, sub: "Williams · 1992–99" },
  { name: "Mark Webber",             rating: 76, sub: "Red Bull · 2007–13" },
  { name: "Valtteri Bottas",         rating: 76, sub: "Mercedes · 2013–21" },
  { name: "Jacques Villeneuve",      rating: 77, sub: "Williams · 1996–2006" },
  { name: "David Coulthard",         rating: 78, sub: "McLaren · 1994–2008" },
  { name: "Rubens Barrichello",      rating: 74, sub: "Ferrari · 1993–2011" },
  { name: "Heinz-Harald Frentzen",   rating: 74, sub: "Williams · 1994–2006" },
  { name: "Ralf Schumacher",         rating: 72, sub: "Williams · 1997–2007" },
  { name: "Felipe Massa",            rating: 73, sub: "Ferrari · 2002–17" },
  { name: "Eddie Irvine",            rating: 73, sub: "Ferrari · 1993–2002" },
  { name: "Giancarlo Fisichella",    rating: 71, sub: "Benetton/Renault · 96–09" },
];

const ENGINES: PickItem[] = [
  { name: "Mercedes 2014–2021",          rating: 97, sub: "Dominant hybrid era" },
  { name: "Honda 1980s (McLaren turbo)", rating: 93, sub: "Turbo era legend" },
  { name: "Ferrari 2000s",               rating: 90, sub: "Schumacher era" },
  { name: "Honda 2000s (Brawn/RBR)",     rating: 91, sub: "Brawn & Red Bull era" },
  { name: "Mercedes 1990s (McLaren)",    rating: 89, sub: "Senna & Häkkinen era" },
  { name: "Renault 2005–2006",           rating: 88, sub: "Alonso championship" },
  { name: "TAG Porsche 1984–87",         rating: 88, sub: "Lauda & Prost titles" },
  { name: "Honda 2019–2021 (Red Bull)",  rating: 88, sub: "Verstappen era begins" },
  { name: "Renault 2010–2013 (RBR)",     rating: 87, sub: "Vettel era" },
  { name: "Ferrari 2022–present",        rating: 85, sub: "Current spec" },
  { name: "Ferrari 2017–2019",           rating: 84, sub: "Hamilton title fights" },
  { name: "Ferrari 1970s–80s",           rating: 80, sub: "Lauda era" },
  { name: "Ford Cosworth DFV 1960s–70s", rating: 78, sub: "Classic era" },
  { name: "Mugen Honda 1990s",           rating: 75, sub: "Jordan & McLaren" },
  { name: "BMW 2000s (Williams)",        rating: 76, sub: "BMW Sauber era" },
  { name: "Renault 2021–2023 (Alpine)",  rating: 74, sub: "Alpine era" },
  { name: "Ford Cosworth 1990s",         rating: 68, sub: "Customer supply" },
  { name: "Yamaha 1990s",               rating: 63, sub: "Backmarker era" },
  { name: "Judd 1988",                  rating: 62, sub: "Customer V8" },
  { name: "Subaru 1990",               rating: 58, sub: "One season special" },
];

const CARS: PickItem[] = [
  { name: "Mercedes W11 2020",       rating: 97, sub: "Greatest car ever?" },
  { name: "Red Bull RB19 2023",      rating: 96, sub: "21 wins in a season" },
  { name: "McLaren MP4/4 1988",      rating: 95, sub: "Won 15 of 16 races" },
  { name: "Mercedes W07 2016",       rating: 94, sub: "Hamilton vs Rosberg" },
  { name: "Ferrari F2004",           rating: 93, sub: "Schumacher's finest" },
  { name: "Mercedes W05 2014",       rating: 92, sub: "Hybrid era pioneer" },
  { name: "Williams FW14B 1992",     rating: 91, sub: "Mansell's 9 wins" },
  { name: "Ferrari F2002",           rating: 91, sub: "Schumacher dominant" },
  { name: "Ferrari F2003-GA",        rating: 90, sub: "Title fight classic" },
  { name: "Red Bull RB9 2013",       rating: 89, sub: "Vettel 13-race streak" },
  { name: "Red Bull RB6 2010",       rating: 88, sub: "Vettel world title" },
  { name: "Williams FW15C 1993",     rating: 88, sub: "Prost's title car" },
  { name: "Ferrari F2001",           rating: 87, sub: "Schumacher dominant" },
  { name: "McLaren MP4/13 1998",     rating: 87, sub: "Häkkinen title" },
  { name: "McLaren MP4/6 1991",      rating: 86, sub: "Senna's last title" },
  { name: "Renault R25 2005",        rating: 86, sub: "Alonso title" },
  { name: "Brawn BGP001 2009",       rating: 85, sub: "The miracle car" },
  { name: "Ferrari 641 1990",        rating: 84, sub: "Prost vs Senna" },
  { name: "McLaren MP4/23 2008",     rating: 85, sub: "Hamilton title" },
  { name: "McLaren MP4/20 2005",     rating: 84, sub: "Räikkönen best" },
  { name: "Williams FW18 1996",      rating: 83, sub: "Hill's title" },
  { name: "Ferrari 312T 1975",       rating: 83, sub: "Lauda era" },
  { name: "Lotus 72 1970",           rating: 82, sub: "Ground effect pioneer" },
  { name: "Red Bull RB5 2009",       rating: 82, sub: "Vettel's breakout" },
  { name: "Benetton B194 1994",      rating: 81, sub: "Schumacher's first" },
  { name: "Tyrrell 003 1971",        rating: 80, sub: "Stewart dominant" },
  { name: "Lotus 49 1967",           rating: 78, sub: "Clark's masterpiece" },
  { name: "Brabham BT46B 1978",      rating: 76, sub: "The fan car" },
  { name: "Jordan 191 1991",         rating: 70, sub: "Schumi's debut" },
  { name: "Tyrrell P34 1976",        rating: 68, sub: "Six-wheel experiment" },
];

// ── Constants ─────────────────────────────────────────────────────────────────

const BUDGET = 360;

const RACE_CALENDAR = [
  "Australian GP", "Bahraini GP", "Saudi Arabian GP", "Japanese GP",
  "Chinese GP", "Miami GP", "Emilia Romagna GP", "Monaco GP",
  "Canadian GP", "Spanish GP", "Austrian GP", "British GP",
  "Hungarian GP", "Belgian GP", "Dutch GP", "Italian GP",
  "Azerbaijan GP", "Singapore GP", "United States GP", "Mexican GP",
  "Brazilian GP", "Las Vegas GP", "Qatar GP", "Abu Dhabi GP",
];

const CATEGORY_ITEMS = [DRIVERS, DRIVERS, ENGINES, CARS];
const CATEGORY_LABELS = ["Driver 1", "Driver 2", "Engine", "Car"] as const;

// ── Types ─────────────────────────────────────────────────────────────────────

type Phase = "draft" | "review" | "racing" | "results";
type RaceResult = "win" | "podium" | "points" | "dnf";
type Race = { name: string; result: RaceResult; position: number };

// ── Helpers ───────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function generateCards(items: PickItem[], exclude?: PickItem | null): PickItem[] {
  const pool = exclude ? items.filter(i => i.name !== exclude.name) : items;
  const cheap   = shuffle(pool.filter(i => i.rating < 75));
  const mid     = shuffle(pool.filter(i => i.rating >= 75 && i.rating < 88));
  const premium = shuffle(pool.filter(i => i.rating >= 88));

  const result: PickItem[] = [
    ...premium.slice(0, 2),
    ...mid.slice(0, 2),
    ...cheap.slice(0, 1),
  ];

  // fill any gaps if a tier is too small
  if (result.length < 5) {
    const used = new Set(result.map(r => r.name));
    const extra = shuffle(pool.filter(i => !used.has(i.name)));
    result.push(...extra.slice(0, 5 - result.length));
  }

  return shuffle(result.slice(0, 5));
}

function simulateRace(avgRating: number): { result: RaceResult; position: number } {
  const roll = avgRating + (Math.random() * 30 - 15);
  if (roll >= 90) return { result: "win",    position: 1 };
  if (roll >= 80) return { result: "podium", position: Math.floor(Math.random() * 2) + 2 };
  if (roll >= 65) return { result: "points", position: Math.floor(Math.random() * 6) + 4 };
  return { result: "dnf", position: 0 };
}

const F1_PTS: Record<number, number> = {1:25,2:18,3:15,4:12,5:10,6:8,7:6,8:4,9:2,10:1};

function performanceLabel(wins: number): string {
  if (wins === 24) return "PERFECT SEASON — 24-0";
  if (wins >= 18)  return "Dominant";
  if (wins >= 10)  return "Competitive";
  if (wins >= 4)   return "Midfield";
  return "Backmarker";
}

// ── Styles ────────────────────────────────────────────────────────────────────

const RESULT_COLOR: Record<RaceResult, string> = {
  win:    "text-yellow-400",
  podium: "text-orange-400",
  points: "text-green-400",
  dnf:    "text-red-500",
};
const RESULT_BG: Record<RaceResult, string> = {
  win:    "bg-yellow-400/10 border-yellow-400/20",
  podium: "bg-orange-400/10 border-orange-400/20",
  points: "bg-green-400/10 border-green-400/20",
  dnf:    "bg-red-500/10 border-red-500/20",
};
const RESULT_ICON: Record<RaceResult, string> = { win:"🏆", podium:"🥉", points:"✅", dnf:"💥" };
const RESULT_LABEL: Record<RaceResult, string> = { win:"WIN", podium:"PODIUM", points:"PTS", dnf:"DNF" };

// ── Budget bar ────────────────────────────────────────────────────────────────

function BudgetBar({ spent, budget, label }: { spent: number; budget: number; label?: string }) {
  const pct = Math.min((spent / budget) * 100, 100);
  const over = spent > budget;
  return (
    <div className={`rounded-xl border p-3 ${over ? "border-red-500/40 bg-red-500/5" : "border-border/40 bg-secondary/20"}`}>
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
          {label ?? "Budget"}
        </p>
        <p className={`text-xs font-black ${over ? "text-red-400" : "text-white"}`}>
          {spent} <span className="text-muted-foreground/40 font-normal">/ {budget}</span>
          {!over && <span className="text-muted-foreground/40 font-normal ml-1.5">· {budget - spent} left</span>}
          {over  && <span className="text-red-400 font-bold ml-1.5">▲ {spent - budget} over</span>}
        </p>
      </div>
      <div className="h-1.5 rounded-full bg-secondary/50 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${over ? "bg-red-500" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function TwentyFourO() {
  // ── Draft state ────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>("draft");
  const [activeTab, setActiveTab] = useState(0);
  const [picks, setPicks] = useState<(PickItem | null)[]>([null, null, null, null]);
  // Cards per tab (generated once, reroll replaces the current tab's cards)
  const [tabCards, setTabCards] = useState<PickItem[][]>([[], [], [], []]);
  const [rerollsLeft, setRerollsLeft] = useState(1);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [penalty, setPenalty] = useState(0); // budget penalty from CHANGE

  // ── Racing state ───────────────────────────────────────────────────────────
  const [visibleCount, setVisibleCount] = useState(0);
  const allRaces = useRef<Race[]>([]);

  // Generate cards for a given tab index
  const genCards = (tabIdx: number, currentPicks: (PickItem | null)[]): PickItem[] => {
    const items = CATEGORY_ITEMS[tabIdx];
    // Exclude the sibling driver pick (Driver 2 can't show Driver 1, and vice versa)
    const siblingExclude = tabIdx === 0 ? currentPicks[1] : tabIdx === 1 ? currentPicks[0] : null;
    return generateCards(items, siblingExclude);
  };

  // Initialise cards on mount
  useEffect(() => {
    setPicks([null, null, null, null]);
    setActiveTab(0);
    setTabCards([
      genCards(0, [null, null, null, null]),
      genCards(1, [null, null, null, null]),
      genCards(2, [null, null, null, null]),
      genCards(3, [null, null, null, null]),
    ]);
    setRerollsLeft(1);
    setSelecting(null);
    setPenalty(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Spent so far (picks made + penalty)
  const pickedTotal = picks.reduce((s, p) => s + (p?.rating ?? 0), 0);
  const spent = pickedTotal + penalty;
  const currentCards = tabCards[activeTab] ?? [];

  // Budget feasibility check for a candidate pick
  const minRemainingAfter = (tabIdx: number, rating: number, currentPicks: (PickItem | null)[]): number => {
    let minNeeded = rating;
    for (let i = 0; i < 4; i++) {
      if (i === tabIdx) continue;
      if (currentPicks[i]) {
        minNeeded += currentPicks[i]!.rating;
      } else {
        // minimum item in that category
        const minItem = Math.min(...CATEGORY_ITEMS[i].map(x => x.rating));
        minNeeded += minItem;
      }
    }
    return minNeeded + penalty;
  };

  // Handle picking a card
  const handlePick = (item: PickItem) => {
    if (selecting) return;
    setSelecting(item.name);

    const willSpend = minRemainingAfter(activeTab, item.rating, picks);
    if (willSpend > BUDGET) return; // blocked

    setTimeout(() => {
      const newPicks = picks.map((p, i) => (i === activeTab ? item : p));
      setPicks(newPicks);
      setSelecting(null);

      if (activeTab < 3) {
        const nextTab = activeTab + 1;
        // Regenerate cards for the next tab with updated sibling exclusion
        setTabCards(prev =>
          prev.map((cards, i) => (i === nextTab ? genCards(nextTab, newPicks) : cards))
        );
        setActiveTab(nextTab);
      } else {
        // All 4 done → review
        setPhase("review");
      }
    }, 280);
  };

  // Reroll current tab
  const handleReroll = () => {
    if (rerollsLeft === 0) return;
    setRerollsLeft(0);
    setTabCards(prev =>
      prev.map((cards, i) => (i === activeTab ? genCards(activeTab, picks) : cards))
    );
  };

  // Change a pick (from review screen) — costs 10pt penalty
  const handleChange = (tabIdx: number) => {
    setPenalty(p => p + 10);
    const newPicks = picks.map((p, i) => (i === tabIdx ? null : p));
    setPicks(newPicks);
    setTabCards(prev =>
      prev.map((cards, i) => (i === tabIdx ? genCards(tabIdx, newPicks) : cards))
    );
    setActiveTab(tabIdx);
    setPhase("draft");
  };

  // Start season
  const startSeason = () => {
    const avg = picks.reduce((s, p) => s + (p?.rating ?? 0), 0) / 4;
    allRaces.current = RACE_CALENDAR.map(name => ({
      name,
      ...simulateRace(avg),
    }));
    setVisibleCount(0);
    setPhase("racing");
  };

  // Auto-reveal races
  useEffect(() => {
    if (phase !== "racing") return;
    if (visibleCount >= 24) {
      const t = setTimeout(() => setPhase("results"), 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setVisibleCount(v => v + 1), 400);
    return () => clearTimeout(t);
  }, [phase, visibleCount]);

  // Play again
  const reset = () => {
    const initPicks: (PickItem | null)[] = [null, null, null, null];
    const initCards = [
      genCards(0, initPicks),
      genCards(1, initPicks),
      genCards(2, initPicks),
      genCards(3, initPicks),
    ];
    setPicks(initPicks);
    setTabCards(initCards);
    setActiveTab(0);
    setRerollsLeft(1);
    setSelecting(null);
    setPenalty(0);
    setVisibleCount(0);
    allRaces.current = [];
    setPhase("draft");
  };

  // ── DRAFT PHASE ────────────────────────────────────────────────────────────
  if (phase === "draft") {
    return (
      <div className="flex flex-col gap-4">
        {/* Budget bar */}
        <BudgetBar spent={spent} budget={BUDGET} />

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-secondary/30 border border-border/30">
          {CATEGORY_LABELS.map((label, i) => {
            const done = picks[i] !== null;
            const active = i === activeTab;
            const accessible = i === activeTab || done;
            return (
              <button
                key={label}
                disabled={!accessible}
                onClick={() => accessible && setActiveTab(i)}
                className={`flex-1 text-[9px] font-black uppercase tracking-wider py-1.5 px-1 rounded-lg transition-all truncate ${
                  active
                    ? "bg-primary text-white"
                    : done
                    ? "text-primary/70 hover:bg-secondary/50"
                    : "text-muted-foreground/30 cursor-not-allowed"
                }`}
              >
                {done ? "✓" : ""} {label}
              </button>
            );
          })}
        </div>

        {/* Currently picked in this tab */}
        {picks[activeTab] && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-xs">
            <span className="text-primary font-bold">✓ {picks[activeTab]!.name}</span>
            <span className="text-muted-foreground/50">· {picks[activeTab]!.rating}</span>
          </div>
        )}

        {/* Heading */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-black text-white uppercase tracking-wider">
            Pick {CATEGORY_LABELS[activeTab]}
          </p>
          <button
            onClick={handleReroll}
            disabled={rerollsLeft === 0}
            className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all ${
              rerollsLeft > 0
                ? "border-border/50 text-white hover:bg-secondary/40"
                : "border-border/20 text-muted-foreground/25 cursor-not-allowed"
            }`}
          >
            <RefreshCw className="w-3 h-3" />
            Reroll ({rerollsLeft} left)
          </button>
        </div>

        {/* Draft cards */}
        <div className="grid grid-cols-1 gap-2">
          {currentCards.map(item => {
            const isSelected = selecting === item.name;
            const isPicked = picks[activeTab]?.name === item.name;
            const willSpend = minRemainingAfter(activeTab, item.rating, picks);
            const tooExpensive = willSpend > BUDGET;
            const tierColor =
              item.rating >= 88 ? "border-yellow-400/25 hover:border-yellow-400/50" :
              item.rating >= 75 ? "border-blue-400/20 hover:border-blue-400/40" :
                                  "border-border/30 hover:border-border/60";
            const tierBadge =
              item.rating >= 88 ? "bg-yellow-400/15 text-yellow-400/80" :
              item.rating >= 75 ? "bg-blue-400/10 text-blue-400/70" :
                                  "bg-secondary/30 text-muted-foreground/40";

            return (
              <button
                key={item.name}
                disabled={tooExpensive}
                onClick={() => handlePick(item)}
                className={`relative flex items-center gap-3 text-left rounded-xl border px-4 py-3 transition-all duration-200 ${
                  tooExpensive
                    ? "border-border/15 bg-secondary/10 opacity-35 cursor-not-allowed"
                    : isSelected || isPicked
                    ? "border-primary/60 bg-primary/10 scale-[0.98]"
                    : `bg-secondary/20 ${tierColor}`
                }`}
              >
                {/* Rating badge */}
                <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0 font-black border ${tierBadge}`}>
                  <span className="text-base leading-none">{item.rating}</span>
                  <span className="text-[8px] opacity-50 uppercase mt-0.5">pts</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-white leading-tight truncate">{item.name}</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-0.5 truncate">{item.sub}</p>
                  {tooExpensive && (
                    <p className="text-[10px] text-red-400/70 mt-0.5">Over budget</p>
                  )}
                </div>

                {/* Tier label */}
                <span className={`shrink-0 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${tierBadge}`}>
                  {item.rating >= 88 ? "Premium" : item.rating >= 75 ? "Mid" : "Budget"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── REVIEW PHASE ───────────────────────────────────────────────────────────
  if (phase === "review") {
    const over = spent > BUDGET;
    return (
      <div className="flex flex-col gap-4">
        <BudgetBar spent={spent} budget={BUDGET} label={penalty > 0 ? `Budget (incl. ${penalty}pt change penalty)` : "Budget"} />

        <p className="text-sm font-black text-white uppercase tracking-wider">Your Constructor</p>

        <div className="flex flex-col gap-2">
          {CATEGORY_LABELS.map((label, i) => {
            const pick = picks[i];
            if (!pick) return null;
            return (
              <div key={label} className="flex items-center gap-3 rounded-xl border border-border/40 bg-secondary/20 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/40">{label}</p>
                  <p className="font-bold text-sm text-white truncate">{pick.name}</p>
                  <p className="text-[10px] text-muted-foreground/50 mt-0.5">{pick.sub}</p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-sm font-black text-primary">{pick.rating}</span>
                  <button
                    onClick={() => handleChange(i)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-border/40 hover:bg-secondary/40 transition-colors text-muted-foreground/50 hover:text-white"
                    title="Change (costs 10pt)"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {penalty > 0 && (
          <p className="text-[10px] text-orange-400/70 text-center">
            ⚠ Change penalty: {penalty} pts deducted from budget
          </p>
        )}

        <button
          onClick={startSeason}
          disabled={over}
          className={`w-full flex items-center justify-center gap-2 font-black text-sm py-3.5 rounded-xl transition-all ${
            over
              ? "bg-secondary/30 text-muted-foreground/30 cursor-not-allowed"
              : "bg-primary text-white hover:bg-primary/90"
          }`}
        >
          <ChevronRight className="w-4 h-4" />
          Build My Constructor
        </button>

        {over && (
          <p className="text-xs text-red-400 text-center -mt-2">Over budget — change a pick or remove a penalty</p>
        )}
      </div>
    );
  }

  // ── RACING PHASE ───────────────────────────────────────────────────────────
  const visibleRaces = allRaces.current.slice(0, visibleCount);
  const winsNow = visibleRaces.filter(r => r.result === "win").length;

  if (phase === "racing") {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">Season in progress</p>
            <p className="text-white font-bold text-sm">Race {visibleCount} of 24</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">Wins</p>
            <p className="text-3xl font-black text-yellow-400 leading-none">{winsNow}</p>
          </div>
        </div>

        <div className="h-1.5 rounded-full bg-secondary/40 overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${(visibleCount / 24) * 100}%` }} />
        </div>

        <div className="flex flex-col gap-1 max-h-[420px] overflow-y-auto pr-0.5">
          {visibleRaces.map((race, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm animate-in fade-in slide-in-from-right-1 duration-200 ${RESULT_BG[race.result]}`}
            >
              <span className="text-[10px] text-muted-foreground/30 w-5 text-right shrink-0">{i + 1}</span>
              <span className="text-xs text-white/80 flex-1 truncate">{race.name}</span>
              <span className={`text-[10px] font-black uppercase tracking-wider shrink-0 ${RESULT_COLOR[race.result]}`}>
                {(race.result === "win" || race.result === "podium") ? `P${race.position} ` : ""}{RESULT_LABEL[race.result]}
              </span>
              <span className="text-sm shrink-0">{RESULT_ICON[race.result]}</span>
            </div>
          ))}

          {visibleCount < 24 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/10 text-muted-foreground/20">
              <span className="w-5" />
              <span className="text-xs flex-1">Next race…</span>
              {[0,150,300].map(d => (
                <div key={d} className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── RESULTS PHASE ──────────────────────────────────────────────────────────
  const wins    = allRaces.current.filter(r => r.result === "win").length;
  const podiums = allRaces.current.filter(r => r.result === "podium").length;
  const pts     = allRaces.current.filter(r => r.result === "points").length;
  const dnfs    = allRaces.current.filter(r => r.result === "dnf").length;
  const ptsTally = allRaces.current.reduce((s, r) => s + (F1_PTS[r.position] ?? 0), 0);
  const isPerfect = wins === 24;
  const perf = performanceLabel(wins);
  const constructorName = `${picks[0]?.name} & ${picks[1]?.name} — ${picks[2]?.name} — ${picks[3]?.name}`;
  const shareText = isPerfect
    ? `🏆 PERFECT SEASON — 24-0!\n${constructorName}\n${spent}/${BUDGET} pts used\nPit Lane Fan Zone`
    : `${wins} wins from 24 races · ${perf}\n${constructorName}\n${ptsTally} pts · ${spent}/${BUDGET} budget\nPit Lane Fan Zone`;

  return (
    <div className="flex flex-col gap-5">
      {/* Headline */}
      <div className={`rounded-xl border p-5 text-center ${isPerfect ? "border-yellow-400/40 bg-yellow-400/5" : "border-border/40 bg-secondary/20"}`}>
        {isPerfect && <p className="text-4xl mb-2">🏆</p>}
        <h2 className={`text-2xl font-black leading-tight ${isPerfect ? "text-yellow-400" : "text-white"}`}>
          {isPerfect ? "PERFECT SEASON!" : `${wins} wins from 24 races`}
        </h2>
        <p className={`text-sm font-bold mt-1 ${isPerfect ? "text-yellow-400/70" : "text-primary"}`}>{perf}</p>
        <p className="text-[11px] text-muted-foreground/50 mt-1">{ptsTally} championship points</p>
      </div>

      {/* Constructor */}
      <div className="rounded-xl border border-border/40 bg-secondary/20 p-4">
        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-3">Your Constructor</p>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORY_LABELS.map((label, i) => (
            <div key={label} className="bg-background/30 rounded-lg p-2.5">
              <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/40">{label}</p>
              <p className="text-xs font-bold text-white mt-0.5 leading-tight truncate">{picks[i]?.name}</p>
              <p className="text-[10px] font-black text-primary mt-0.5">{picks[i]?.rating}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-2.5 border-t border-border/25 flex justify-between text-[10px] text-muted-foreground/40 font-bold">
          <span>Budget: {spent} / {BUDGET}</span>
          <span>Avg rating: {(pickedTotal / 4).toFixed(1)}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { label:"Wins",    value:wins,    color:"text-yellow-400" },
          { label:"Podiums", value:podiums, color:"text-orange-400" },
          { label:"Points",  value:pts,     color:"text-green-400"  },
          { label:"DNFs",    value:dnfs,    color:"text-red-500"    },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border/30 bg-secondary/20 py-3">
            <p className={`text-2xl font-black leading-none ${s.color}`}>{s.value}</p>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground/40 font-bold mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => { try { navigator.clipboard.writeText(shareText); } catch {} }}
          className="flex-1 flex items-center justify-center gap-2 border border-border/50 text-white text-sm font-bold py-3 rounded-xl hover:bg-secondary/30 transition-colors"
        >
          <Share2 className="w-4 h-4" /> Share
        </button>
        <button
          onClick={reset}
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-white text-sm font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Play Again
        </button>
      </div>
    </div>
  );
}
