import { useState, useEffect, useRef } from 'react';
import { Clock, ChevronRight, CalendarDays, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { saveScore } from '@/lib/scoreHistory';

type Category = {
  q: string;
  teaser: string; // short label shown on select screen
  answers: string[];
  hint: string;
  ordered: boolean;
};

const CATEGORIES: Category[] = [
  {
    q: "Name the top 10 drivers by all-time race wins — in order",
    teaser: "Top 10 by race wins",
    answers: ["Hamilton","Schumacher","Verstappen","Vettel","Prost","Senna","Alonso","Mansell","Clark","Stewart"],
    hint: "Start with the current record holder — think 7-time champions",
    ordered: true,
  },
  {
    q: "Name the top 10 drivers by Formula 1 World Championships — in order",
    teaser: "Top 10 by championships",
    answers: ["Hamilton","Schumacher","Fangio","Vettel","Prost","Brabham","Hill","Clark","Lauda","Piquet"],
    hint: "Two drivers share the all-time record of 7 championships",
    ordered: true,
  },
  {
    q: "Name 10 countries that have hosted a Formula 1 Grand Prix",
    teaser: "F1 host nations",
    answers: ["UK","Italy","Germany","France","USA","Brazil","Japan","Spain","Belgium","Australia","Monaco","Canada","Hungary","Austria","Netherlands","Singapore","Bahrain","Qatar","Saudi Arabia","Mexico","Azerbaijan","China"],
    hint: "Over 30 countries have hosted races across F1 history",
    ordered: false,
  },
  {
    q: "Name 10 circuits currently on the 2025 F1 calendar",
    teaser: "2025 F1 circuits",
    answers: ["Bahrain","Jeddah","Melbourne","Suzuka","Shanghai","Miami","Imola","Monaco","Montreal","Barcelona","Spielberg","Silverstone","Budapest","Spa","Zandvoort","Monza","Baku","Singapore","Austin","Mexico City","Sao Paulo","Las Vegas","Lusail","Abu Dhabi"],
    hint: "There are 24 race weekends in the 2025 season",
    ordered: false,
  },
  {
    q: "Name 10 F1 World Champions from 1990 to 2024",
    teaser: "Champions since 1990",
    answers: ["Senna","Mansell","Prost","Schumacher","Hill","Villeneuve","Häkkinen","Hakkinen","Raikkonen","Räikkönen","Alonso","Hamilton","Button","Vettel","Rosberg","Verstappen"],
    hint: "14 different drivers won the title in this period",
    ordered: false,
  },
  {
    q: "Name all 10 F1 constructors competing in the 2025 season",
    teaser: "2025 F1 teams",
    answers: ["Red Bull","McLaren","Ferrari","Mercedes","Aston Martin","Alpine","Williams","Haas","Racing Bulls","Kick Sauber","Sauber","RB"],
    hint: "Every team fields two drivers — 10 teams, 20 cars",
    ordered: false,
  },
  {
    q: "Name 10 current F1 drivers on the 2025 grid",
    teaser: "2025 F1 drivers",
    answers: ["Verstappen","Norris","Leclerc","Hamilton","Russell","Piastri","Sainz","Alonso","Stroll","Gasly","Ocon","Hulkenberg","Hulkenburg","Tsunoda","Lawson","Bearman","Hadjar","Antonelli","Doohan","Bortoleto","Albon"],
    hint: "There are 20 drivers — 10 teams × 2 seats",
    ordered: false,
  },
];

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getDailyCategory(): Category {
  const dayNumber = Math.floor(Date.now() / 86_400_000);
  return CATEGORIES[dayNumber % CATEGORIES.length];
}

function formatDateLong(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
}

type DailyState = {
  dateKey: string;
  score: number;
  found: string[];
  playMode: "timed" | "relaxed";
};

const DAILY_KEY = "pitlane-tenabell-daily";

function loadDailyState(): DailyState | null {
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as DailyState;
    if (s.dateKey !== getTodayKey()) return null;
    return s;
  } catch { return null; }
}

function saveDailyState(state: DailyState): void {
  try { localStorage.setItem(DAILY_KEY, JSON.stringify(state)); } catch {}
}

function fuzzyMatch(guess: string, target: string): boolean {
  const g = guess.toLowerCase().trim();
  const t = target.toLowerCase();
  return g === t || (t.includes(g) && g.length >= 3) || (g.includes(t) && t.length >= 4);
}

export function Tenabell() {
  const todayKey = getTodayKey();
  const cat = getDailyCategory();

  const [alreadyPlayed] = useState<DailyState | null>(() => loadDailyState());
  const [mode, setMode] = useState<"select" | "timed" | "relaxed" | "over">("select");
  const [timeLeft, setTimeLeft] = useState(120);
  const [found, setFound] = useState<string[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [shake, setShake] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === "timed" && timeLeft > 0 && found.length < 10) {
      const t = setInterval(() => setTimeLeft(l => l - 1), 1000);
      return () => clearInterval(t);
    } else if (mode === "timed" && timeLeft === 0) {
      endGame(found);
    }
  }, [mode, timeLeft, found.length]);

  useEffect(() => {
    if (mode === "timed" || mode === "relaxed") {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [mode]);

  function endGame(finalFound: string[], gaveUp = false) {
    const score = finalFound.length;
    const playMode = mode === "timed" ? "timed" : "relaxed";
    saveScore({ game: "tenabell", label: `${cat.teaser} · ${todayKey}`, score, total: 10 });
    saveDailyState({ dateKey: todayKey, score, found: finalFound, playMode });
    setRevealed(true);
    setMode("over");
  }

  const checkAns = () => {
    if (!inputVal.trim() || mode === "over") return;

    if (cat.ordered) {
      const nextAnswer = cat.answers[found.length];
      if (fuzzyMatch(inputVal, nextAnswer)) {
        const next = [...found, nextAnswer];
        setFound(next);
        setInputVal("");
        if (next.length === 10) endGame(next);
      } else {
        setInputVal("");
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } else {
      const match = cat.answers.find(a => !found.includes(a) && fuzzyMatch(inputVal, a));
      if (match) {
        const next = [...found, match];
        setFound(next);
        setInputVal("");
        if (next.length === 10) endGame(next);
      } else {
        setInputVal("");
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    }
    inputRef.current?.focus();
  };

  // ── Already played today ────────────────────────────────────────────────
  if (mode === "select" && alreadyPlayed) {
    const pct = Math.round((alreadyPlayed.score / 10) * 100);
    return (
      <div className="flex flex-col items-center text-center space-y-5 py-6 animate-in fade-in">
        <div className="text-[10px] font-bold tracking-widest text-[#e65100] uppercase flex items-center gap-1.5">
          <CalendarDays className="w-3 h-3" /> Today's Tenabell
        </div>
        <p className="text-xs text-muted-foreground">{formatDateLong(todayKey)}</p>
        <div className="w-full bg-secondary/50 rounded-xl p-6 border border-border">
          <p className="text-sm text-muted-foreground mb-1 font-medium">{cat.teaser}</p>
          <p className="text-4xl font-black mb-1">
            {alreadyPlayed.score}<span className="text-muted-foreground text-xl font-normal">/10</span>
          </p>
          <div className="w-full bg-secondary rounded-full h-2 mt-3">
            <div className="h-2 rounded-full bg-[#e65100] transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {alreadyPlayed.score === 10 ? "Perfect score — outstanding!" : alreadyPlayed.score >= 6 ? "Solid effort today." : "Better luck tomorrow!"}
            {" "}Played in {alreadyPlayed.playMode} mode.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground/50 text-xs">
          <Trophy className="w-3 h-3" />
          Come back tomorrow for a new category
        </div>
      </div>
    );
  }

  // ── Select mode ─────────────────────────────────────────────────────────
  if (mode === "select") {
    return (
      <div className="flex flex-col items-center py-6 space-y-6 animate-in fade-in">
        {/* Daily header */}
        <div className="text-center space-y-1">
          <div className="text-[10px] font-bold tracking-widest text-[#e65100] uppercase flex items-center justify-center gap-1.5 mb-2">
            <CalendarDays className="w-3 h-3" /> Today's Tenabell
          </div>
          <p className="text-xs text-muted-foreground">{formatDateLong(todayKey)}</p>
        </div>

        {/* Category card */}
        <div className="w-full bg-secondary/40 border border-[#e65100]/20 rounded-xl p-5 text-left space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#e65100]">{cat.teaser}</p>
          <p className="font-bold text-base leading-snug">{cat.q}</p>
          <p className="text-xs text-muted-foreground italic">Hint: {cat.hint}</p>
          {cat.ordered && (
            <p className="text-[10px] text-muted-foreground/60 font-semibold uppercase tracking-wider pt-1">
              Ordered — answers must be in exact sequence
            </p>
          )}
        </div>

        {/* Mode buttons */}
        <div className="flex flex-col w-full space-y-3">
          <Button
            onClick={() => setMode("timed")}
            size="lg"
            className="font-bold tracking-widest bg-[#e65100] hover:bg-[#e65100]/90 border-none h-14 text-white"
            data-testid="button-timed-mode"
          >
            <Clock className="mr-2 w-5 h-5" /> 2 MINUTE TIMER
          </Button>
          <Button
            onClick={() => setMode("relaxed")}
            size="lg"
            variant="outline"
            className="font-bold tracking-widest border-border text-foreground h-14 bg-secondary"
            data-testid="button-relaxed-mode"
          >
            RELAXED — NO TIMER
          </Button>
        </div>

        <p className="text-[10px] text-muted-foreground/50">
          One category per day · refreshes at midnight
        </p>
      </div>
    );
  }

  // ── Game in progress / over ─────────────────────────────────────────────
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

  const slots = Array.from({ length: 10 }, (_, i) => {
    const isFound = i < found.length;
    const isActive = cat.ordered && i === found.length && mode !== "over";
    let displayText: string | null = null;

    if (isFound) {
      displayText = found[i];
    } else if (revealed) {
      if (cat.ordered) {
        displayText = cat.answers[i];
      } else {
        const remaining = cat.answers.filter(a => !found.includes(a));
        displayText = remaining[i - found.length] ?? null;
      }
    }

    return { displayText, isFound, isActive, isMissed: revealed && !isFound };
  });

  return (
    <div className="flex flex-col space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-0.5">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {found.length} / 10 found
            {cat.ordered && (
              <span className="ml-2 text-[10px] font-normal text-muted-foreground/60 normal-case tracking-normal">
                · in order
              </span>
            )}
          </div>
          <div className="text-[10px] text-muted-foreground/50">{cat.teaser}</div>
        </div>
        {mode === "timed" && (
          <div className={`font-mono text-lg font-bold flex items-center gap-1.5 ${timeLeft <= 30 ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
            <Clock className="w-4 h-4" />
            {timeStr}
          </div>
        )}
      </div>

      {/* Question */}
      <div className="space-y-1">
        <h2 className="text-lg font-bold leading-tight">{cat.q}</h2>
        <p className="text-xs text-muted-foreground italic">Hint: {cat.hint}</p>
      </div>

      {/* Input */}
      {mode !== "over" && (
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && checkAns()}
            placeholder={cat.ordered ? `Who is #${found.length + 1}?` : "Type an answer…"}
            className="bg-secondary/50 font-semibold"
            autoFocus
            data-testid="input-tenabell-answer"
          />
          <Button
            onClick={checkAns}
            className="bg-[#e65100] hover:bg-[#e65100]/90 shrink-0 text-white"
            data-testid="button-tenabell-submit"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Slots */}
      <div className="grid grid-cols-2 gap-1.5">
        {slots.map((slot, i) => {
          let cls = "bg-secondary/30 text-muted-foreground border-transparent";
          if (slot.isFound) cls = "bg-green-600/15 text-green-400 border-green-600/25 font-semibold";
          else if (slot.isMissed) cls = "bg-destructive/10 text-destructive border-destructive/20";
          else if (slot.isActive) cls = `bg-secondary border-[#e65100]/60 text-foreground ${shake ? 'animate-[shake_0.4s_ease]' : ''}`;

          return (
            <div
              key={i}
              data-testid={`slot-tenabell-${i}`}
              className={`h-11 rounded border flex items-center px-3 gap-2 transition-colors ${cls}`}
            >
              <span className="text-[10px] font-mono opacity-50 shrink-0 w-5">{i + 1}.</span>
              <span className="text-sm truncate">
                {slot.displayText ?? (slot.isActive ? <span className="opacity-40 text-xs">← type here</span> : "???")}
              </span>
            </div>
          );
        })}
      </div>

      {/* Give up */}
      {mode !== "over" && (
        <button
          onClick={() => endGame(found, true)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto"
          data-testid="button-give-up"
        >
          Give up &amp; reveal
        </button>
      )}

      {/* End screen */}
      {mode === "over" && (
        <div className="text-center p-5 bg-secondary rounded-lg mt-2 space-y-2">
          <p className="text-3xl font-black">{found.length}<span className="text-muted-foreground text-lg font-normal">/10</span></p>
          <p className="text-sm text-muted-foreground">
            {found.length === 10 ? "Perfect — outstanding F1 knowledge!" : found.length >= 6 ? "Solid effort! Keep watching the races." : "Keep watching those races!"}
          </p>
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground/50 text-xs pt-2">
            <Trophy className="w-3 h-3" />
            Come back tomorrow for a new category
          </div>
        </div>
      )}
    </div>
  );
}
