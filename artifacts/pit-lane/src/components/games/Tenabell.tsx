import { useState, useEffect, useRef } from 'react';
import { Clock, ChevronRight, CalendarDays, Trophy, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AutocompleteInput } from '@/components/AutocompleteInput';
import { saveScore } from '@/lib/scoreHistory';
import { getDailyCategory, getTodayKey, updateStreak, loadStreak, type StreakState } from '@/lib/tenabellCategories';
import { MidnightCountdown } from '@/components/MidnightCountdown';

function formatDateLong(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
}

function formatDateShort(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function buildShareText(score: number, teaser: string, dateKey: string, playMode: "timed" | "relaxed"): string {
  const squares = Array.from({ length: 10 }, (_, i) => i < score ? '🟩' : '⬛').join('');
  const lines = [
    'Pit Lane Tenabell',
    `${teaser} · ${formatDateShort(dateKey)}`,
    `${score}/10${playMode === 'timed' ? ' ⏱' : ''}`,
    squares,
  ];
  return lines.join('\n');
}

function ShareButton({ score, teaser, dateKey, playMode }: { score: number; teaser: string; dateKey: string; playMode: "timed" | "relaxed" }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const text = buildShareText(score, teaser, dateKey, playMode);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      className="gap-2 font-bold tracking-wider border-[#e65100]/40 text-[#e65100] hover:bg-[#e65100]/10 hover:text-[#e65100]"
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {copied ? 'COPIED!' : 'SHARE RESULT'}
    </Button>
  );
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

function normalize(s: string): string {
  return s.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Common driver nicknames / abbreviations → full name (normalized at compare time).
const NICKNAMES: Record<string, string> = {
  max: 'max verstappen',
  lewis: 'lewis hamilton',
  lando: 'lando norris',
  charles: 'charles leclerc',
  checo: 'sergio perez',
  'danny ric': 'daniel ricciardo',
  'the iceman': 'kimi räikkönen',
  kimi: 'kimi räikkönen',
  schumi: 'michael schumacher',
  schu: 'michael schumacher',
  alonso: 'fernando alonso',
  nando: 'fernando alonso',
  seb: 'sebastian vettel',
  nico: 'nico rosberg',
  bottas: 'valtteri bottas',
  sainz: 'carlos sainz',
  russell: 'george russell',
  norris: 'lando norris',
  piastri: 'oscar piastri',
};

function fuzzyMatch(guess: string, target: string): boolean {
  const g = normalize(guess);
  const t = normalize(target);
  if (g === t) return true;
  // nickname / abbreviation match
  const nick = NICKNAMES[g];
  if (nick && normalize(nick) === t) return true;
  // surname-only match (last word of target)
  const surname = t.split(/[\s/-]+/).pop() ?? "";
  if (g === surname) return true;
  if (surname.startsWith(g) && g.length >= 3) return true;
  // substring match
  if (t.includes(g) && g.length >= 3) return true;
  if (g.includes(t) && t.length >= 4) return true;
  return false;
}

export function Tenabell() {
  const todayKey = getTodayKey();
  const cat = getDailyCategory();

  const [alreadyPlayed] = useState<DailyState | null>(() => loadDailyState());
  const [streak, setStreak] = useState<StreakState>(() => loadStreak());
  const [mode, setMode] = useState<"select" | "timed" | "relaxed" | "over">("select");
  const [playedMode, setPlayedMode] = useState<"timed" | "relaxed">("timed");
  const [timeLeft, setTimeLeft] = useState(120);
  const [found, setFound] = useState<string[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [shake, setShake] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect((): (() => void) | void => {
    if (mode === "timed" && timeLeft > 0 && found.length < 10) {
      const t = setInterval(() => setTimeLeft(l => l - 1), 1000);
      return () => clearInterval(t);
    }
    if (mode === "timed" && timeLeft === 0) {
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
    const currentPlayMode = mode === "timed" ? "timed" : "relaxed";
    saveScore({ game: "tenabell", label: `${cat.teaser} · ${todayKey}`, score, total: 10 });
    saveDailyState({ dateKey: todayKey, score, found: finalFound, playMode: currentPlayMode });
    setStreak(updateStreak(todayKey));
    setPlayedMode(currentPlayMode);
    setRevealed(true);
    setMode("over");
  }

  const checkAns = (explicit?: string) => {
    const guess = (explicit ?? inputVal).trim();
    if (!guess || mode === "over") return;

    if (cat.ordered) {
      const nextAnswer = cat.answers[found.length];
      if (fuzzyMatch(guess, nextAnswer)) {
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
      const match = cat.answers.find(a => !found.includes(a) && fuzzyMatch(guess, a));
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
          <div className="text-lg tracking-widest my-2">
            {Array.from({ length: 10 }, (_, i) => i < alreadyPlayed.score ? '🟩' : '⬛').join('')}
          </div>
          <div className="w-full bg-secondary rounded-full h-2 mt-1">
            <div className="h-2 rounded-full bg-[#e65100] transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {alreadyPlayed.score === 10 ? "Perfect score — outstanding!" : alreadyPlayed.score >= 6 ? "Solid effort today." : "Better luck tomorrow!"}
            {" "}Played in {alreadyPlayed.playMode} mode.
          </p>
        </div>
        <ShareButton score={alreadyPlayed.score} teaser={cat.teaser} dateKey={todayKey} playMode={alreadyPlayed.playMode} />
        {streak.current >= 1 && (
          <div className="flex items-center gap-2 text-sm font-bold">
            <span className="text-lg">🔥</span>
            <span>{streak.current} day streak</span>
            {streak.best > streak.current && (
              <span className="text-xs font-normal text-muted-foreground/50">· best {streak.best}</span>
            )}
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground/50">
          <Trophy className="w-3 h-3 shrink-0" />
          <span>Next puzzle in</span>
          <MidnightCountdown className="font-mono font-semibold tabular-nums text-muted-foreground/70" />
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
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/45 pt-2 border-t border-border/20 mt-2">
            <Trophy className="w-3 h-3 shrink-0" />
            <span>Next category unlocks in</span>
            <MidnightCountdown className="font-mono font-semibold tabular-nums text-muted-foreground/60" />
          </div>
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
          <AutocompleteInput
            ref={inputRef}
            value={inputVal}
            onChange={setInputVal}
            categories={['drivers', 'teams', 'circuits', 'engines']}
            onSelect={(val) => checkAns(val)}
            onSubmit={() => checkAns()}
            placeholder={cat.ordered ? `Who is #${found.length + 1}?` : "Type an answer…"}
            className="bg-secondary/50 font-semibold"
            autoFocus
            data-testid="input-tenabell-answer"
          />
          <Button
            onClick={() => checkAns()}
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
        <div className="text-center p-5 bg-secondary rounded-lg mt-2 space-y-3">
          <p className="text-3xl font-black">{found.length}<span className="text-muted-foreground text-lg font-normal">/10</span></p>
          <div className="text-lg tracking-widest">
            {Array.from({ length: 10 }, (_, i) => i < found.length ? '🟩' : '⬛').join('')}
          </div>
          <p className="text-sm text-muted-foreground">
            {found.length === 10 ? "Perfect — outstanding F1 knowledge!" : found.length >= 6 ? "Solid effort! Keep watching the races." : "Keep watching those races!"}
          </p>
          <ShareButton
            score={found.length}
            teaser={cat.teaser}
            dateKey={todayKey}
            playMode={playedMode}
          />
          {streak.current >= 1 && (
            <div className="flex items-center justify-center gap-2 text-sm font-bold">
              <span className="text-lg">🔥</span>
              <span>{streak.current} day streak</span>
              {streak.best > streak.current && (
                <span className="text-xs font-normal text-muted-foreground/50">· best {streak.best}</span>
              )}
            </div>
          )}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/50 pt-1">
            <Trophy className="w-3 h-3 shrink-0" />
            <span>Next puzzle in</span>
            <MidnightCountdown className="font-mono font-semibold tabular-nums text-muted-foreground/70" />
          </div>
        </div>
      )}
    </div>
  );
}
