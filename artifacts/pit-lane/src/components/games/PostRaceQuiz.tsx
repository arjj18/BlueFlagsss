import { useState, useEffect, useRef } from 'react';
import { Trophy, RefreshCw, AlertTriangle, Share2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { saveScore } from '@/lib/scoreHistory';

// ── Types ────────────────────────────────────────────────────────────────────

type QuizMode = 'preview' | 'review' | 'general';
type Phase = 'input' | 'loading' | 'quiz' | 'done';

type StandardQ = { type: 'standard'; q: string; opts: string[]; ans: number; fact: string };
type WhoAmIQ  = { type: 'whoami';   q: string; clues: string[]; opts: string[]; ans: number; fact: string };
type Question  = StandardQ | WhoAmIQ;

type AnswerRecord = {
  q: Question;
  chosen: number;
  correct: boolean;
  points: number;
  cluesUsed?: number;
};

// ── Day detection ────────────────────────────────────────────────────────────

function getTodayMode(): QuizMode {
  const day = new Date().getDay();
  if (day === 4) return 'preview';
  if (day === 2) return 'review';
  return 'general';
}

// ── Static questions (general mode) ─────────────────────────────────────────

const GENERAL_QUESTIONS: StandardQ[] = [
  { type:'standard', q:"Which driver has the most F1 World Championships?", opts:["Michael Schumacher","Lewis Hamilton","Sebastian Vettel","Ayrton Senna"], ans:1, fact:"Hamilton and Schumacher both won 7 titles — a record they share." },
  { type:'standard', q:"What does DRS stand for?", opts:["Dynamic Race Speed","Drag Reduction System","Dual Rear Spoiler","Direct Racing System"], ans:1, fact:"DRS opens a flap in the rear wing, cutting drag on straights to aid overtaking." },
  { type:'standard', q:"Which circuit is nicknamed the Cathedral of Speed?", opts:["Monaco","Spa","Monza","Silverstone"], ans:2, fact:"Monza in Italy is famous for its high-speed layout and passionate tifosi fans." },
  { type:'standard', q:"How many points does a race winner receive?", opts:["20","25","30","15"], ans:1, fact:"The 25-point win has been standard since the 2010 season." },
  { type:'standard', q:"Which team has won the most Constructors' Championships?", opts:["McLaren","Mercedes","Williams","Ferrari"], ans:3, fact:"Ferrari leads with 16 Constructors' titles — more than any other team." },
  { type:'standard', q:"What colour flag signals the race has been stopped?", opts:["Yellow","Blue","Red","Black"], ans:2, fact:"A red flag immediately neutralises the race. All drivers must slow and return to the pit lane." },
  { type:'standard', q:"Which driver is nicknamed The Iceman?", opts:["Nico Rosberg","Alain Prost","Kimi Räikkönen","Jenson Button"], ans:2, fact:"Räikkönen earned the nickname for his cool, unemotional demeanour under pressure." },
  { type:'standard', q:"How many cars start a Formula 1 race?", opts:["16","18","20","22"], ans:2, fact:"10 teams × 2 drivers = 20 cars on the starting grid." },
  { type:'standard', q:"Which country hosts the Suzuka circuit?", opts:["South Korea","China","Singapore","Japan"], ans:3, fact:"Suzuka is in Japan's Mie Prefecture and has hosted the Japanese GP since 1987." },
  { type:'standard', q:"What does a blue flag signal to a driver?", opts:["Caution ahead","Let a faster car pass","Pit stop required","Rain is coming"], ans:1, fact:"A blue flag tells a driver they are about to be lapped and must yield to the faster car." },
];

// ── Mode config ──────────────────────────────────────────────────────────────

const MODE_CONFIG = {
  preview: {
    label: 'Race Weekend Preview Quiz 🔭',
    bannerBg: 'bg-blue-600/15 border-blue-500/30',
    bannerText: 'text-blue-400',
    badgeBg: 'bg-blue-500/20 text-blue-400',
    accent: '#3b82f6',
    accentCls: 'bg-blue-600 hover:bg-blue-700',
    progressCls: '[&>div]:bg-blue-500',
    inputLabel: 'Which Grand Prix is this weekend?',
    inputPlaceholder: 'e.g. British Grand Prix',
    loadingSteps: ['Searching circuit history…', 'Building your preview quiz…'],
    ratings: [
      { min: 90, msg: 'Circuit historian — you know this track better than the drivers' },
      { min: 70, msg: 'Dedicated fan — you have done your homework' },
      { min: 50, msg: 'Casual viewer — brush up before the race' },
      { min:  0, msg: 'First time at this circuit? No shame in learning' },
    ],
  },
  review: {
    label: 'Post Race Review Quiz 🏁',
    bannerBg: 'bg-[#e10600]/10 border-[#e10600]/25',
    bannerText: 'text-[#e10600]',
    badgeBg: 'bg-[#e10600]/20 text-[#e10600]',
    accent: '#e10600',
    accentCls: 'bg-[#e10600] hover:bg-[#e10600]/85',
    progressCls: '[&>div]:bg-[#e10600]',
    inputLabel: 'Which race just happened?',
    inputPlaceholder: 'e.g. Austrian Grand Prix',
    loadingSteps: ['Searching for race results…', 'Building your review quiz…'],
    ratings: [
      { min: 90, msg: 'You watched every single lap. Respect.' },
      { min: 70, msg: 'Solid race fan — you were paying attention' },
      { min: 50, msg: 'You caught the highlights at least' },
      { min:  0, msg: 'Did you even watch the race?' },
    ],
  },
  general: {
    label: 'General F1 Quiz ❓',
    bannerBg: 'bg-[#2e7d32]/10 border-[#2e7d32]/25',
    bannerText: 'text-[#2e7d32]',
    badgeBg: 'bg-[#2e7d32]/20 text-[#2e7d32]',
    accent: '#2e7d32',
    accentCls: 'bg-[#2e7d32] hover:bg-[#2e7d32]/85',
    progressCls: '[&>div]:bg-[#2e7d32]',
    inputLabel: '',
    inputPlaceholder: '',
    loadingSteps: [],
    ratings: [
      { min: 90, msg: 'Championship material! Excellent F1 knowledge.' },
      { min: 70, msg: 'Solid points finish. You know your stuff.' },
      { min: 50, msg: 'Room to improve — keep watching the races.' },
      { min:  0, msg: 'A DNF this time. Keep at it!' },
    ],
  },
} as const;

// ── Scoring helpers ──────────────────────────────────────────────────────────

const WHOAMI_PTS = [40, 30, 20, 10]; // indexed by clues revealed (0-based)
const MAX_SCORE = 100;

function whoamiPts(cluesRevealed: number) {
  return WHOAMI_PTS[Math.min(cluesRevealed - 1, 3)];
}

function getRating(score: number, mode: QuizMode) {
  const ratings = MODE_CONFIG[mode].ratings;
  return ratings.find(r => score >= r.min)?.msg ?? ratings[ratings.length - 1].msg;
}

// ── Component ────────────────────────────────────────────────────────────────

export function PostRaceQuiz() {
  const quizMode = getTodayMode();
  const cfg = MODE_CONFIG[quizMode];

  const [phase, setPhase] = useState<Phase>(quizMode === 'general' ? 'quiz' : 'input');
  const [raceInput, setRaceInput] = useState('');
  const [raceName, setRaceName] = useState(quizMode === 'general' ? 'General Quiz' : '');
  const [questions, setQuestions] = useState<Question[]>(() =>
    quizMode === 'general' ? [...GENERAL_QUESTIONS].sort(() => Math.random() - 0.5) : []
  );

  // Quiz state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<AnswerRecord[]>([]);
  const [answered, setAnswered] = useState<number | null>(null);
  const [cluesRevealed, setCluesRevealed] = useState(1);

  // Loading state
  const [loadingStep, setLoadingStep] = useState(0);
  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Error
  const [error, setError] = useState<string | null>(null);

  // Share feedback
  const [copied, setCopied] = useState(false);

  // ── Loading step cycling ───────────────────────────────────────────────────

  useEffect(() => {
    if (phase === 'loading' && cfg.loadingSteps.length > 1) {
      stepTimer.current = setInterval(() => {
        setLoadingStep(s => Math.min(s + 1, cfg.loadingSteps.length - 1));
      }, 6000);
    } else {
      if (stepTimer.current) clearInterval(stepTimer.current);
    }
    return () => { if (stepTimer.current) clearInterval(stepTimer.current); };
  }, [phase]);

  // ── Generate ───────────────────────────────────────────────────────────────

  const handleGenerate = async () => {
    if (!raceInput.trim()) return;
    setPhase('loading');
    setLoadingStep(0);
    setError(null);

    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ race: raceInput.trim(), mode: quizMode }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      const data = await res.json() as { race: string; questions: Question[] };
      setRaceName(data.race);
      setQuestions(data.questions);
      setPhase('quiz');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Couldn\'t generate quiz — please try again.');
      setPhase('input');
    }
  };

  // ── Answer ─────────────────────────────────────────────────────────────────

  const handleAnswer = (idx: number) => {
    if (answered !== null) return;
    const q = questions[currentIdx];
    const correct = idx === q.ans;
    let pts = 0;
    let cluesUsed: number | undefined;

    if (correct) {
      if (q.type === 'whoami') {
        pts = whoamiPts(cluesRevealed);
        cluesUsed = cluesRevealed;
      } else {
        pts = 10;
      }
    } else if (q.type === 'whoami') {
      cluesUsed = cluesRevealed;
    }

    setScore(s => s + pts);
    setAnswered(idx);
    setHistory(h => [...h, { q, chosen: idx, correct, points: pts, cluesUsed }]);
  };

  // ── Next question ──────────────────────────────────────────────────────────

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1);
      setAnswered(null);
      setCluesRevealed(1);
    } else {
      const finalScore = Math.min(score, MAX_SCORE);
      saveScore({
        game: quizMode === 'general' ? 'quiz' : 'postRace',
        label: raceName,
        score: finalScore,
        total: MAX_SCORE,
      });
      setPhase('done');
    }
  };

  // ── Share ──────────────────────────────────────────────────────────────────

  const handleShare = () => {
    const displayScore = Math.min(score, MAX_SCORE);
    const modeLabel = quizMode === 'preview' ? 'Preview' : quizMode === 'review' ? 'Review' : 'General';
    const text = `I scored ${displayScore}/${MAX_SCORE} on the ${raceName} ${modeLabel} Quiz on Pit Lane Fan Zone — can you beat me?`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // ── Render: input ──────────────────────────────────────────────────────────

  if (phase === 'input') {
    return (
      <div className="space-y-5">
        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-bold ${cfg.bannerBg} ${cfg.bannerText}`}>
          {cfg.label}
        </div>

        <p className="text-sm text-muted-foreground">{cfg.inputLabel}</p>

        <div className="flex gap-2">
          <Input
            value={raceInput}
            onChange={e => setRaceInput(e.target.value)}
            placeholder={cfg.inputPlaceholder}
            className="bg-secondary/50 border-border"
            onKeyDown={e => e.key === 'Enter' && handleGenerate()}
            autoFocus
          />
          <Button onClick={handleGenerate} disabled={!raceInput.trim()} className={`font-bold px-5 shrink-0 ${cfg.accentCls}`}>
            Generate →
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
      </div>
    );
  }

  // ── Render: loading ────────────────────────────────────────────────────────

  if (phase === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <RefreshCw className="w-8 h-8 animate-spin" style={{ color: cfg.accent }} />
        <div className="flex flex-col items-center gap-2">
          {cfg.loadingSteps.map((step, i) => (
            <p key={step} className={`text-sm transition-all duration-500 ${
              i === loadingStep ? 'text-white/80 font-medium'
                : i < loadingStep ? 'text-muted-foreground/30 line-through text-xs'
                : 'text-muted-foreground/20 text-xs'
            }`}>
              {step}
            </p>
          ))}
        </div>
      </div>
    );
  }

  // ── Render: done ───────────────────────────────────────────────────────────

  if (phase === 'done') {
    const displayScore = Math.min(score, MAX_SCORE);
    const rating = getRating(displayScore, quizMode);
    const modeLabel = quizMode === 'preview' ? 'Preview' : quizMode === 'review' ? 'Review' : 'General';

    return (
      <div className="flex flex-col gap-5 animate-in fade-in">
        {/* Score header */}
        <div className="flex flex-col items-center py-6 gap-2">
          <Trophy className="w-12 h-12 mb-1" style={{ color: cfg.accent }} />
          <h2 className="text-5xl font-black tabular-nums">{displayScore}<span className="text-2xl text-muted-foreground font-bold">/{MAX_SCORE}</span></h2>
          <p className="text-sm text-muted-foreground/70 text-center max-w-xs">{rating}</p>
        </div>

        {/* Share button */}
        <Button onClick={handleShare} variant="outline" className="gap-2 font-bold border-border/60">
          {copied ? <><Check className="w-4 h-4 text-green-400" /> Copied!</> : <><Share2 className="w-4 h-4" /> Share score</>}
        </Button>

        {/* Question breakdown */}
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 mb-1">Question breakdown</p>
          {history.map((rec, i) => {
            const isWhoami = rec.q.type === 'whoami';
            return (
              <div key={i} className={`rounded-lg border p-3 text-sm ${rec.correct ? 'border-green-600/25 bg-green-600/5' : 'border-red-600/25 bg-red-600/5'}`}>
                <div className="flex items-start gap-2">
                  <span className={`shrink-0 mt-0.5 ${rec.correct ? 'text-green-400' : 'text-red-400'}`}>
                    {rec.correct ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white/80 leading-snug">
                      {isWhoami ? 'Who am I?' : rec.q.q}
                    </p>
                    {isWhoami && rec.cluesUsed && (
                      <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                        {rec.cluesUsed} clue{rec.cluesUsed > 1 ? 's' : ''} revealed
                      </p>
                    )}
                    {rec.correct ? (
                      <p className="text-[11px] text-green-400/70 mt-0.5">+{rec.points} pts</p>
                    ) : (
                      <>
                        <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                          Correct: <span className="text-white/60">{rec.q.opts[rec.q.ans]}</span>
                        </p>
                        <p className="text-[11px] text-muted-foreground/40 mt-0.5 italic">{rec.q.fact}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Play again */}
        <Button
          onClick={() => {
            setPhase(quizMode === 'general' ? 'quiz' : 'input');
            setCurrentIdx(0); setScore(0); setHistory([]); setAnswered(null); setCluesRevealed(1); setRaceInput('');
            if (quizMode === 'general') {
              setQuestions([...GENERAL_QUESTIONS].sort(() => Math.random() - 0.5));
            } else {
              setQuestions([]);
            }
          }}
          className={`font-bold tracking-widest mt-2 ${cfg.accentCls}`}
        >
          PLAY AGAIN
        </Button>
      </div>
    );
  }

  // ── Render: quiz ───────────────────────────────────────────────────────────

  const q = questions[currentIdx];
  const isWhoami = q?.type === 'whoami';
  const whoamiQ = isWhoami ? (q as WhoAmIQ) : null;
  const displayScore = Math.min(score, MAX_SCORE);

  return (
    <div className="flex flex-col gap-5">

      {/* Mode badge + score */}
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${cfg.badgeBg}`}>
          {quizMode === 'general' ? 'General Quiz'
            : quizMode === 'preview' ? `Preview — ${raceName}`
            : `Review — ${raceName}`}
        </span>
        <span className="text-sm font-bold tabular-nums text-muted-foreground/60">
          {displayScore} <span className="text-xs text-muted-foreground/40">pts</span>
        </span>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40">
          <span>Q{currentIdx + 1} of {questions.length}</span>
        </div>
        <Progress value={(currentIdx / questions.length) * 100} className={`h-1 bg-secondary rounded-none ${cfg.progressCls}`} />
      </div>

      {/* General mode unlock notice (first question only) */}
      {quizMode === 'general' && currentIdx === 0 && answered === null && (
        <p className="text-[10px] text-muted-foreground/35 text-center -mt-1">
          Preview quizzes unlock on Thursdays · Review quizzes unlock on Tuesdays
        </p>
      )}

      {/* Who Am I clues */}
      {isWhoami && whoamiQ && (
        <div className="bg-secondary/30 rounded-xl p-4 space-y-3 border border-border/30">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
            Who am I? — {MAX_SCORE - displayScore > 0 ? `up to ${whoamiPts(cluesRevealed)} pts` : ''} 
          </p>
          {whoamiQ.clues.slice(0, cluesRevealed).map((clue, i) => (
            <div key={i} className="flex gap-2.5">
              <span className="text-[10px] font-black text-muted-foreground/30 w-4 shrink-0 mt-0.5">#{i + 1}</span>
              <p className={`text-sm leading-snug ${i === cluesRevealed - 1 ? 'text-white/90 font-medium' : 'text-muted-foreground/50'}`}>{clue}</p>
            </div>
          ))}
          {answered === null && cluesRevealed < 4 && (
            <button
              onClick={() => setCluesRevealed(c => c + 1)}
              className="text-xs font-bold text-muted-foreground/50 hover:text-muted-foreground/80 transition-colors underline underline-offset-2 mt-1"
            >
              Reveal clue {cluesRevealed + 1} of 4
            </button>
          )}
        </div>
      )}

      {/* Question text (standard only) */}
      {!isWhoami && (
        <div className="text-xl md:text-2xl font-bold leading-tight py-1">{q.q}</div>
      )}

      {/* Answer buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {q.opts.map((opt, idx) => {
          let cls = 'bg-secondary hover:bg-secondary/80 text-foreground border-transparent';
          if (answered !== null) {
            if (idx === q.ans) cls = 'bg-green-600 hover:bg-green-600 text-white border-green-500 shadow-[0_0_15px_rgba(22,163,74,0.3)]';
            else if (idx === answered) cls = 'bg-red-600 hover:bg-red-600 text-white border-red-500';
            else cls = 'bg-secondary/50 text-muted-foreground border-transparent opacity-50';
          }
          return (
            <Button
              key={idx}
              variant="outline"
              className={`h-auto min-h-14 py-3 px-4 justify-start text-left whitespace-normal border-2 transition-all ${cls}`}
              onClick={() => handleAnswer(idx)}
              disabled={answered !== null}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center bg-black/20 text-[10px] font-bold font-mono">
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="text-sm">{opt}</span>
              </div>
            </Button>
          );
        })}
      </div>

      {/* Post-answer reveal */}
      {answered !== null && (
        <div className="p-4 bg-secondary/50 border border-border rounded-xl animate-in slide-in-from-bottom-2 space-y-3">
          {/* Who Am I performance message */}
          {isWhoami && (
            <p className="text-xs font-bold" style={{ color: answered === q.ans ? cfg.accent : '#ef4444' }}>
              {answered === q.ans
                ? cluesRevealed <= 2 ? 'Sharp! You barely needed any help'
                  : cluesRevealed === 3 ? 'Good knowledge — you got there'
                  : 'You needed all the clues but got there in the end'
                : `Not quite — the answer was ${q.opts[q.ans]}`}
            </p>
          )}
          <p className="text-sm text-muted-foreground/80">{q.fact}</p>
          <Button onClick={nextQuestion} className={`w-full font-bold tracking-widest ${cfg.accentCls}`}>
            {currentIdx < questions.length - 1 ? 'NEXT QUESTION' : 'SEE RESULTS'}
          </Button>
        </div>
      )}
    </div>
  );
}
