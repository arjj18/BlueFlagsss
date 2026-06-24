import { useState, useEffect, useRef } from 'react';
import { Trophy, RotateCcw, Share2, ChevronRight, AlertTriangle, Check } from 'lucide-react';

// ── Data ──────────────────────────────────────────────────────────────────────

type PickItem = { name: string; rating: number; sub: string };

const DRIVERS: PickItem[] = [
  { name: "Lewis Hamilton",     rating: 97, sub: "Mercedes · 2007–" },
  { name: "Max Verstappen",     rating: 95, sub: "Red Bull · 2015–" },
  { name: "Ayrton Senna",       rating: 94, sub: "McLaren · 1984–94" },
  { name: "Michael Schumacher", rating: 93, sub: "Ferrari · 1991–2012" },
  { name: "Jim Clark",          rating: 91, sub: "Lotus · 1960–68" },
  { name: "Fernando Alonso",    rating: 90, sub: "Renault/Ferrari · 2001–" },
  { name: "Alain Prost",        rating: 89, sub: "McLaren/Williams · 1980–93" },
  { name: "Sebastian Vettel",   rating: 88, sub: "Red Bull · 2006–22" },
  { name: "Niki Lauda",         rating: 87, sub: "Ferrari · 1971–85" },
  { name: "Mika Häkkinen",      rating: 86, sub: "McLaren · 1991–2001" },
  { name: "Charles Leclerc",    rating: 85, sub: "Ferrari · 2018–" },
  { name: "Lando Norris",       rating: 84, sub: "McLaren · 2019–" },
  { name: "Jackie Stewart",     rating: 83, sub: "Tyrrell · 1965–73" },
  { name: "Kimi Räikkönen",     rating: 82, sub: "McLaren/Ferrari · 2001–21" },
  { name: "Jochen Rindt",       rating: 81, sub: "Lotus · 1964–70" },
  { name: "Oscar Piastri",      rating: 80, sub: "McLaren · 2023–" },
  { name: "Carlos Sainz",       rating: 79, sub: "Williams · 2015–" },
  { name: "Nigel Mansell",      rating: 78, sub: "Williams · 1980–95" },
  { name: "Damon Hill",         rating: 75, sub: "Williams · 1992–99" },
  { name: "Jenson Button",      rating: 73, sub: "Honda/McLaren · 2000–16" },
  { name: "Rubens Barrichello", rating: 70, sub: "Ferrari · 1993–2011" },
  { name: "Ralf Schumacher",    rating: 67, sub: "Williams · 1997–2007" },
];

const ENGINES: PickItem[] = [
  { name: "Mercedes (2014–21)",  rating: 97, sub: "Dominant hybrid era" },
  { name: "Honda (2000–04)",     rating: 91, sub: "Schumacher title engine" },
  { name: "Ferrari (2000–04)",   rating: 89, sub: "Schumacher era" },
  { name: "Renault (2010–13)",   rating: 88, sub: "Vettel era" },
  { name: "Ferrari (2022–)",     rating: 87, sub: "Current" },
  { name: "TAG/Porsche (83–87)", rating: 86, sub: "Turbo era legend" },
  { name: "Honda (2021–)",       rating: 85, sub: "Red Bull power" },
  { name: "Mercedes (2022–)",    rating: 83, sub: "Post-dominance" },
  { name: "Renault (2005–06)",   rating: 81, sub: "Alonso era" },
  { name: "Honda (1988–91)",     rating: 79, sub: "McLaren era" },
  { name: "Climax (1960s)",      rating: 73, sub: "Classic era" },
  { name: "BMW (2000–09)",       rating: 71, sub: "BMW Sauber" },
  { name: "Ford Cosworth (DFV)", rating: 68, sub: "Classic workhorse" },
];

const CARS: PickItem[] = [
  { name: "Mercedes W11 (2020)",   rating: 98, sub: "Greatest F1 car ever?" },
  { name: "Red Bull RB19 (2023)",  rating: 97, sub: "21 wins in a season" },
  { name: "McLaren MP4/4 (1988)",  rating: 96, sub: "Won 15 of 16 races" },
  { name: "Mercedes W07 (2016)",   rating: 95, sub: "Hamilton vs Rosberg" },
  { name: "Ferrari F2004 (2004)",  rating: 93, sub: "Schumacher's finest" },
  { name: "Williams FW14B (1992)", rating: 91, sub: "Mansell's dominant car" },
  { name: "Red Bull RB7 (2011)",   rating: 90, sub: "Vettel dominance" },
  { name: "Williams FW15C (1993)", rating: 87, sub: "Prost's title car" },
  { name: "McLaren MCL38 (2024)",  rating: 86, sub: "Championship winner" },
  { name: "Ferrari SF-24 (2024)",  rating: 85, sub: "Race-winning car" },
  { name: "Lotus 72 (1970)",       rating: 82, sub: "Ground effect pioneer" },
  { name: "Brabham BT46B (1978)",  rating: 78, sub: "The fan car" },
  { name: "Lotus 49 (1967)",       rating: 75, sub: "Clark's masterpiece" },
  { name: "Tyrrell P34 (1976)",    rating: 63, sub: "Six-wheel experiment" },
];

const BUDGET = 350;

const RACE_CALENDAR = [
  "Australian GP", "Bahraini GP", "Saudi Arabian GP", "Japanese GP",
  "Chinese GP", "Miami GP", "Emilia Romagna GP", "Monaco GP",
  "Canadian GP", "Spanish GP", "Austrian GP", "British GP",
  "Hungarian GP", "Belgian GP", "Dutch GP", "Italian GP",
  "Azerbaijan GP", "Singapore GP", "United States GP", "Mexican GP",
  "Brazilian GP", "Las Vegas GP", "Qatar GP", "Abu Dhabi GP",
];

// ── Simulation ────────────────────────────────────────────────────────────────

type RaceResult = "win" | "podium" | "points" | "dnf";

type Race = { name: string; result: RaceResult; position: number };

function simulateRace(avgRating: number): { result: RaceResult; position: number } {
  if (Math.random() < 0.04) return { result: "dnf", position: 0 };
  const variance = (Math.random() * 30) - 15;
  const roll = avgRating + variance;
  if (roll >= 88) return { result: "win",   position: 1 };
  if (roll >= 78) return { result: "podium", position: Math.floor(Math.random() * 2) + 2 };
  if (roll >= 65) return { result: "points", position: Math.floor(Math.random() * 6) + 4 };
  return { result: "dnf", position: 0 };
}

const F1_POINTS: Record<number, number> = { 1:25,2:18,3:15,4:12,5:10,6:8,7:6,8:4,9:2,10:1 };

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

// ── Pick card ─────────────────────────────────────────────────────────────────

function PickCard({
  item, selected, sameAsOther, onSelect,
}: {
  item: PickItem;
  selected: boolean;
  sameAsOther: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`relative w-full flex items-center gap-3 text-left rounded-xl border px-3 py-2.5 transition-all ${
        selected
          ? "border-primary/60 bg-primary/10 text-white"
          : "border-border/40 bg-secondary/20 text-white/80 hover:border-border hover:bg-secondary/40"
      }`}
    >
      {selected && (
        <div className="absolute right-2.5 top-2.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-2.5 h-2.5 text-white" />
        </div>
      )}
      <div className="flex-1 min-w-0 pr-5">
        <p className="font-bold text-xs leading-tight truncate">{item.name}</p>
        <p className="text-[10px] text-muted-foreground/60 mt-0.5 truncate">{item.sub}</p>
      </div>
      <span className={`text-xs font-black shrink-0 ${selected ? "text-primary" : "text-muted-foreground/50"}`}>
        {item.rating}
      </span>
    </button>
  );
}

// ── Pick section ──────────────────────────────────────────────────────────────

function PickSection<T extends PickItem>({
  title, items, selected, blockedItem, onSelect,
}: {
  title: string;
  items: T[];
  selected: T | null;
  blockedItem?: T | null;
  onSelect: (item: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">{title}</p>
        {selected && (
          <span className="text-[10px] font-bold text-primary truncate max-w-[60%] text-right">
            {selected.name} · {selected.rating}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto pr-0.5">
        {items.map(item => (
          <PickCard
            key={item.name}
            item={item}
            selected={selected?.name === item.name}
            sameAsOther={blockedItem?.name === item.name}
            onSelect={() => onSelect(item)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type Phase = "pick" | "racing" | "results";

export function TwentyFourO() {
  const [phase, setPhase] = useState<Phase>("pick");
  const [driver1, setDriver1] = useState<PickItem | null>(null);
  const [driver2, setDriver2] = useState<PickItem | null>(null);
  const [engine, setEngine]   = useState<PickItem | null>(null);
  const [car, setCar]         = useState<PickItem | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const allRaces = useRef<Race[]>([]);

  const total = (driver1?.rating ?? 0) + (driver2?.rating ?? 0) + (engine?.rating ?? 0) + (car?.rating ?? 0);
  const spent = total;
  const remaining = BUDGET - total;
  const overBudget = total > BUDGET;
  const samePerson = driver1 && driver2 && driver1.name === driver2.name;
  const canStart = driver1 && driver2 && engine && car && !overBudget && !samePerson;

  const visibleRaces = allRaces.current.slice(0, visibleCount);
  const wins    = visibleRaces.filter(r => r.result === "win").length;
  const podiums = visibleRaces.filter(r => r.result === "podium").length;
  const points  = visibleRaces.filter(r => r.result === "points").length;
  const dnfs    = visibleRaces.filter(r => r.result === "dnf").length;
  const ptsTally = visibleRaces.reduce((s, r) => s + (F1_POINTS[r.position] ?? 0), 0);

  // Auto-reveal races one by one
  useEffect(() => {
    if (phase !== "racing" || visibleCount >= 24) {
      if (phase === "racing" && visibleCount >= 24) {
        const t = setTimeout(() => setPhase("results"), 600);
        return () => clearTimeout(t);
      }
      return;
    }
    const t = setTimeout(() => setVisibleCount(v => v + 1), 380);
    return () => clearTimeout(t);
  }, [phase, visibleCount]);

  const startSeason = () => {
    if (!canStart) return;
    const avg = total / 4;
    allRaces.current = RACE_CALENDAR.map(name => ({
      name,
      ...simulateRace(avg),
    }));
    setVisibleCount(0);
    setPhase("racing");
  };

  const reset = () => {
    setPhase("pick");
    setDriver1(null);
    setDriver2(null);
    setEngine(null);
    setCar(null);
    setVisibleCount(0);
    allRaces.current = [];
  };

  // ── PICK PHASE ─────────────────────────────────────────────────────────────

  if (phase === "pick") {
    return (
      <div className="flex flex-col gap-5">
        {/* Budget bar */}
        <div className={`rounded-xl border p-4 ${overBudget ? "border-red-500/40 bg-red-500/5" : "border-border/40 bg-secondary/20"}`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Budget</p>
            <p className={`text-sm font-black ${overBudget ? "text-red-400" : remaining === 0 ? "text-primary" : "text-white"}`}>
              {spent} / {BUDGET}
              {overBudget && <span className="text-red-400 ml-1.5">▲ {Math.abs(remaining)} over</span>}
              {!overBudget && spent > 0 && <span className="text-muted-foreground/50 ml-1.5">· {remaining} left</span>}
            </p>
          </div>
          <div className="h-2 rounded-full bg-secondary/50 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${overBudget ? "bg-red-500" : "bg-primary"}`}
              style={{ width: `${Math.min((spent / BUDGET) * 100, 100)}%` }}
            />
          </div>
          {samePerson && (
            <p className="text-[10px] text-red-400 mt-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Pick two different drivers
            </p>
          )}
        </div>

        {/* Picks */}
        <PickSection title="Driver 1" items={DRIVERS} selected={driver1} blockedItem={driver2} onSelect={setDriver1} />
        <PickSection title="Driver 2" items={DRIVERS} selected={driver2} blockedItem={driver1} onSelect={setDriver2} />
        <PickSection title="Engine Supplier" items={ENGINES} selected={engine} onSelect={setEngine} />
        <PickSection title="Car / Chassis" items={CARS} selected={car} onSelect={setCar} />

        {/* Lock in */}
        <button
          onClick={startSeason}
          disabled={!canStart}
          className={`w-full flex items-center justify-center gap-2 font-black text-sm py-3.5 rounded-xl transition-all ${
            canStart
              ? "bg-primary text-white hover:bg-primary/90"
              : "bg-secondary/30 text-muted-foreground/30 cursor-not-allowed"
          }`}
        >
          <ChevronRight className="w-4 h-4" />
          {canStart ? "Lock In & Start Season" : "Complete all 4 picks within budget"}
        </button>
      </div>
    );
  }

  // ── RACING PHASE ───────────────────────────────────────────────────────────

  if (phase === "racing") {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">Season in progress</p>
            <p className="text-white font-bold text-sm">Race {visibleCount} of 24</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">Wins so far</p>
            <p className="text-3xl font-black text-yellow-400 leading-none">{wins}</p>
          </div>
        </div>

        <div className="h-1.5 rounded-full bg-secondary/40 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${(visibleCount / 24) * 100}%` }}
          />
        </div>

        <div className="flex flex-col gap-1 max-h-[400px] overflow-y-auto pr-0.5">
          {visibleRaces.map((race, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm animate-in fade-in slide-in-from-right-1 duration-200 ${RESULT_BG[race.result]}`}
            >
              <span className="text-[10px] text-muted-foreground/30 w-5 text-right shrink-0">{i + 1}</span>
              <span className="text-xs text-white/80 flex-1 truncate">{race.name}</span>
              <span className={`text-[10px] font-black uppercase tracking-wider shrink-0 ${RESULT_COLOR[race.result]}`}>
                {race.result === "win" || race.result === "podium" ? `P${race.position} ` : ""}{RESULT_LABEL[race.result]}
              </span>
              <span className="text-sm shrink-0">{RESULT_ICON[race.result]}</span>
            </div>
          ))}

          {visibleCount < 24 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/15 text-muted-foreground/20">
              <span className="w-5" />
              <span className="text-xs flex-1">Simulating next race…</span>
              <div className="flex gap-0.5">
                {[0, 150, 300].map(d => (
                  <div key={d} className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── RESULTS PHASE ──────────────────────────────────────────────────────────

  const isPerfect = wins === 24;
  const resultLabel =
    isPerfect           ? "PERFECT SEASON — 24-0 🏆" :
    wins >= 20          ? `${wins} wins — Championship dominant!` :
    wins >= 14          ? `${wins} wins — Title contender` :
    wins >= 8           ? `${wins} wins — Race winner` :
    wins >= 3           ? `${wins} wins — Points finisher` :
                          `${wins} wins — Back to the drawing board`;

  const shareText = isPerfect
    ? `🏆 PERFECT SEASON — 24-0!\n${driver1?.name} + ${driver2?.name}\n${engine?.name} engine · ${car?.name}\n24 wins from 24 races\nPit Lane Fan Zone`
    : `${driver1?.name} + ${driver2?.name} | ${engine?.name} | ${car?.name}\n${wins} wins from 24 races · ${ptsTally} pts\nCan you go 24-0? — Pit Lane Fan Zone`;

  return (
    <div className="flex flex-col gap-5">
      {/* Headline */}
      <div className={`rounded-xl border p-5 text-center ${isPerfect ? "border-yellow-400/40 bg-yellow-400/8" : "border-border/40 bg-secondary/20"}`}>
        {isPerfect && <p className="text-4xl mb-3">🏆</p>}
        <h2 className={`text-xl font-black leading-tight ${isPerfect ? "text-yellow-400" : "text-white"}`}>
          {resultLabel}
        </h2>
        <p className="text-xs text-muted-foreground mt-2">
          {ptsTally} championship points · avg team rating {(total / 4).toFixed(1)}
        </p>
      </div>

      {/* Constructor card */}
      <div className="rounded-xl border border-border/40 bg-secondary/20 p-4">
        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-3">Your Constructor</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Driver 1", item: driver1 },
            { label: "Driver 2", item: driver2 },
            { label: "Engine",   item: engine  },
            { label: "Car",      item: car     },
          ].map(({ label, item }) => (
            <div key={label} className="bg-background/30 rounded-lg p-2.5">
              <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/40">{label}</p>
              <p className="text-xs font-bold text-white mt-0.5 leading-tight truncate">{item?.name}</p>
              <p className="text-[10px] font-bold text-primary mt-0.5">{item?.rating}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-border/30 flex justify-between text-[10px] text-muted-foreground/40 font-bold">
          <span>Budget used: {total} / {BUDGET}</span>
          <span>Avg rating: {(total / 4).toFixed(1)} / 100</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { label: "Wins",    value: wins,    color: "text-yellow-400" },
          { label: "Podiums", value: podiums, color: "text-orange-400" },
          { label: "Points",  value: points,  color: "text-green-400"  },
          { label: "DNFs",    value: dnfs,    color: "text-red-500"    },
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
          <RotateCcw className="w-4 h-4" /> Try Again
        </button>
      </div>
    </div>
  );
}
