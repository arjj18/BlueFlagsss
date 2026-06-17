import { useState, useEffect, useRef } from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Category = {
  q: string;
  answers: string[];
  hint: string;
  ordered: boolean;
  label?: string; // shown on active slot when ordered
};

const CATEGORIES: Category[] = [
  {
    q: "Name the top 10 drivers by all-time race wins — in order",
    answers: ["Hamilton","Schumacher","Verstappen","Vettel","Prost","Senna","Alonso","Mansell","Clark","Stewart"],
    hint: "Start with the current record holder — think 7-time champions",
    ordered: true,
    label: "win",
  },
  {
    q: "Name the top 10 drivers by Formula 1 World Championships — in order",
    answers: ["Hamilton","Schumacher","Fangio","Vettel","Prost","Brabham","Hill","Clark","Lauda","Piquet"],
    hint: "Two drivers share the all-time record of 7 championships",
    ordered: true,
    label: "title",
  },
  {
    q: "Name 10 countries that have hosted a Formula 1 Grand Prix",
    answers: ["UK","Italy","Germany","France","USA","Brazil","Japan","Spain","Belgium","Australia","Monaco","Canada","Hungary","Austria","Netherlands","Singapore","Bahrain"],
    hint: "Over 30 countries have hosted races across F1 history",
    ordered: false,
  },
  {
    q: "Name 10 circuits currently on the F1 calendar",
    answers: ["Bahrain","Jeddah","Melbourne","Suzuka","Shanghai","Miami","Imola","Monaco","Montreal","Barcelona","Spielberg","Silverstone","Budapest","Spa","Zandvoort","Monza","Baku","Singapore","Austin","Mexico City","Sao Paulo","Las Vegas","Lusail","Abu Dhabi"],
    hint: "There are 24 race weekends in a modern season",
    ordered: false,
  },
];

function fuzzyMatch(guess: string, target: string): boolean {
  const g = guess.toLowerCase().trim();
  const t = target.toLowerCase();
  return g === t || (t.includes(g) && g.length >= 3) || (g.includes(t) && t.length >= 4);
}

export function Tenabell() {
  const [mode, setMode] = useState<"select" | "timed" | "relaxed" | "over">("select");
  const [cat] = useState<Category>(() => CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]);
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
      setMode("over");
      setRevealed(true);
    }
  }, [mode, timeLeft, found.length]);

  useEffect(() => {
    if (mode === "timed" || mode === "relaxed") {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [mode]);

  const checkAns = () => {
    if (!inputVal.trim() || mode === "over") return;

    if (cat.ordered) {
      // Must match the next position in sequence
      const nextAnswer = cat.answers[found.length];
      if (fuzzyMatch(inputVal, nextAnswer)) {
        const next = [...found, nextAnswer];
        setFound(next);
        setInputVal("");
        if (next.length === 10) { setMode("over"); setRevealed(true); }
      } else {
        // Wrong — shake the active slot
        setInputVal("");
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } else {
      // Unordered — match any not-yet-found answer
      const match = cat.answers.find(a => !found.includes(a) && fuzzyMatch(inputVal, a));
      if (match) {
        const next = [...found, match];
        setFound(next);
        setInputVal("");
        if (next.length === 10) { setMode("over"); setRevealed(true); }
      } else {
        setInputVal("");
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    }
    inputRef.current?.focus();
  };

  if (mode === "select") {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-6">
        <div className="text-center space-y-2 mb-2">
          <h2 className="text-2xl font-black tracking-tight">F1 TENABELL</h2>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Name 10 answers in a category. Some categories must be answered in exact order.
          </p>
        </div>
        <div className="flex flex-col w-full max-w-xs space-y-3">
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
      </div>
    );
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

  // Build the 10 display slots
  const slots = Array.from({ length: 10 }, (_, i) => {
    const isFound = i < found.length;
    const isActive = cat.ordered && i === found.length && mode !== "over";
    let displayText: string | null = null;

    if (isFound) {
      displayText = found[i];
    } else if (revealed) {
      // Show the correct answer — for ordered it's cat.answers[i]; for unordered show remaining answers
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
      {/* Header row */}
      <div className="flex justify-between items-center">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {found.length} / 10 found
          {cat.ordered && (
            <span className="ml-2 text-[10px] font-normal text-muted-foreground/60 normal-case tracking-normal">
              · in order
            </span>
          )}
        </div>
        {mode === "timed" && (
          <div className={`font-mono text-lg font-bold flex items-center gap-1.5 ${timeLeft <= 30 ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
            <Clock className="w-4 h-4" />
            {timeStr}
          </div>
        )}
      </div>

      {/* Category question */}
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

      {/* Slots grid */}
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
          onClick={() => { setRevealed(true); setMode("over"); }}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto"
          data-testid="button-give-up"
        >
          Give up &amp; reveal
        </button>
      )}

      {/* End screen */}
      {mode === "over" && (
        <div className="text-center p-5 bg-secondary rounded-lg mt-2">
          <p className="text-3xl font-black mb-1">{found.length}<span className="text-muted-foreground text-lg font-normal">/10</span></p>
          <p className="text-sm text-muted-foreground mb-4">
            {found.length === 10 ? "Perfect — outstanding F1 knowledge!" : found.length >= 6 ? "Solid effort! Keep watching the races." : "Keep watching those races!"}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[#e65100] hover:bg-[#e65100]/90 font-bold tracking-widest px-8 text-white"
            data-testid="button-play-again"
          >
            TRY ANOTHER
          </Button>
        </div>
      )}
    </div>
  );
}
