import { useState } from 'react';
import { Trophy, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { saveScore } from '@/lib/scoreHistory';

// ── Day detection ────────────────────────────────────────────────────────────

type QuizMode = 'preview' | 'review' | 'general';

function getTodayMode(): QuizMode {
  const day = new Date().getDay(); // 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
  if (day === 4) return 'preview';
  if (day === 2) return 'review';
  return 'general';
}

// ── Static questions (general mode) ─────────────────────────────────────────

const GENERAL_QUESTIONS = [
  { q: "Which driver has the most F1 World Championships?", opts: ["Michael Schumacher", "Lewis Hamilton", "Sebastian Vettel", "Ayrton Senna"], ans: 1, fact: "Hamilton and Schumacher share the record with 7 titles each." },
  { q: "What does DRS stand for?", opts: ["Dynamic Race Speed", "Drag Reduction System", "Dual Rear Spoiler", "Direct Racing System"], ans: 1, fact: "DRS opens a flap in the rear wing to reduce drag on straights." },
  { q: "Which circuit is nicknamed the Cathedral of Speed?", opts: ["Monaco", "Spa", "Monza", "Silverstone"], ans: 2, fact: "Monza in Italy is famous for its high-speed layout and passionate tifosi fans." },
  { q: "How many points does a race winner receive?", opts: ["20", "25", "30", "15"], ans: 1, fact: "The current points system has awarded 25 points for a win since 2010." },
  { q: "Which team has won the most Constructors' Championships?", opts: ["McLaren", "Mercedes", "Williams", "Ferrari"], ans: 3, fact: "Ferrari leads with 16 Constructors' Championships." },
  { q: "What colour flag signals a race has been stopped?", opts: ["Yellow", "Blue", "Red", "Black"], ans: 2, fact: "A red flag means the race is immediately neutralised." },
  { q: "Which driver is nicknamed The Iceman?", opts: ["Nico Rosberg", "Alain Prost", "Kimi Räikkönen", "Jenson Button"], ans: 2, fact: "Räikkönen earned the nickname for his cool, unemotional demeanour." },
  { q: "How many cars start a Formula 1 race?", opts: ["16", "18", "20", "22"], ans: 2, fact: "10 teams × 2 drivers = 20 cars on the starting grid." },
  { q: "Which country hosts the Suzuka circuit?", opts: ["South Korea", "China", "Singapore", "Japan"], ans: 3, fact: "Suzuka is in Japan's Mie Prefecture." },
  { q: "What does a blue flag signal to a driver?", opts: ["Caution ahead", "Let a faster car pass", "Pit stop required", "Rain is coming"], ans: 1, fact: "A blue flag tells a driver they're about to be lapped and must let the faster car through." },
];

// ── Mode config ──────────────────────────────────────────────────────────────

const MODE_CONFIG = {
  preview: {
    banner: 'Race Weekend Preview Quiz',
    bannerColor: 'bg-blue-600/15 border-blue-500/30 text-blue-400',
    badgeColor: 'bg-blue-500/20 text-blue-400',
    accentColor: 'bg-blue-600 hover:bg-blue-600/90',
    progressColor: '[&>div]:bg-blue-500',
    inputLabel: 'Which Grand Prix is this weekend?',
    inputPlaceholder: 'e.g. British Grand Prix',
  },
  review: {
    banner: 'Post Race Review Quiz',
    bannerColor: 'bg-[#e10600]/10 border-[#e10600]/25 text-[#e10600]',
    badgeColor: 'bg-[#e10600]/20 text-[#e10600]',
    accentColor: 'bg-[#e10600] hover:bg-[#e10600]/90',
    progressColor: '[&>div]:bg-[#e10600]',
    inputLabel: 'Which race just happened?',
    inputPlaceholder: 'e.g. Austrian Grand Prix',
  },
  general: {
    banner: 'General F1 Quiz',
    bannerColor: 'bg-[#2e7d32]/10 border-[#2e7d32]/25 text-[#2e7d32]',
    badgeColor: 'bg-[#2e7d32]/20 text-[#2e7d32]',
    accentColor: 'bg-[#2e7d32] hover:bg-[#2e7d32]/90',
    progressColor: '[&>div]:bg-[#2e7d32]',
    inputLabel: '',
    inputPlaceholder: '',
  },
};

type Question = { q: string; opts: string[]; ans: number; fact: string };

// ── Component ────────────────────────────────────────────────────────────────

export function PostRaceQuiz() {
  const quizMode = getTodayMode();
  const cfg = MODE_CONFIG[quizMode];

  const [raceInput, setRaceInput] = useState('');
  const [loadingMsg, setLoadingMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // General mode starts directly with static questions
  const [questions, setQuestions] = useState<Question[]>(() =>
    quizMode === 'general'
      ? [...GENERAL_QUESTIONS].sort(() => Math.random() - 0.5)
      : []
  );
  const [raceName, setRaceName] = useState(quizMode === 'general' ? 'General Quiz' : '');
  const [started, setStarted] = useState(quizMode === 'general');

  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);

  // ── Generate AI quiz ───────────────────────────────────────────────────────

  const handleGenerate = async () => {
    if (!raceInput.trim()) return;
    setLoading(true);
    setError(null);

    if (quizMode === 'preview') {
      setLoadingMsg(`Searching circuit history for ${raceInput.trim()}…`);
    } else {
      setLoadingMsg(`Searching for ${raceInput.trim()} race results…`);
      setTimeout(() => setLoadingMsg(`Building your review quiz…`), 5000);
    }

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
      setStarted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Couldn\'t generate quiz — please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Gameplay ───────────────────────────────────────────────────────────────

  const handleAnswer = (idx: number) => {
    if (answered !== null) return;
    setAnswered(idx);
    if (idx === questions[currentIdx].ans) setScore(s => s + 1);
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1);
      setAnswered(null);
    } else {
      const q = questions[currentIdx];
      const finalScore = answered === q.ans ? score + 1 : score;
      saveScore({
        game: quizMode === 'general' ? 'quiz' : 'postRace',
        label: quizMode === 'general' ? 'General Quiz' : raceName,
        score: finalScore,
        total: questions.length,
      });
      setGameOver(true);
    }
  };

  // ── Game over ──────────────────────────────────────────────────────────────

  if (gameOver) {
    const pct = score / questions.length;
    const msg = pct >= 0.8 ? 'Championship material! Excellent F1 knowledge.' : pct >= 0.5 ? 'Solid points finish. You know your stuff.' : 'A DNF this time. Keep watching the races!';
    return (
      <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in py-8">
        <Trophy className={`w-16 h-16 ${quizMode === 'preview' ? 'text-blue-400' : quizMode === 'review' ? 'text-[#e10600]' : 'text-[#2e7d32]'}`} />
        <h2 className="text-4xl font-black">{score} / {questions.length}</h2>
        <p className="text-muted-foreground text-center max-w-sm">{msg}</p>
        <Button
          onClick={() => { setGameOver(false); setCurrentIdx(0); setScore(0); setAnswered(null); setStarted(quizMode === 'general'); setQuestions(quizMode === 'general' ? [...GENERAL_QUESTIONS].sort(() => Math.random() - 0.5) : []); setRaceInput(''); }}
          size="lg"
          className={`font-bold tracking-widest mt-4 ${cfg.accentColor}`}
        >
          PLAY AGAIN
        </Button>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <p className="font-bold text-lg text-center">{loadingMsg}</p>
      </div>
    );
  }

  // ── Input screen (preview/review only) ────────────────────────────────────

  if (!started) {
    return (
      <div className="space-y-5">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold uppercase tracking-wider ${cfg.bannerColor}`}>
          {cfg.banner}
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
          <Button onClick={handleGenerate} disabled={!raceInput.trim()} className={`font-bold px-6 ${cfg.accentColor}`}>
            Generate →
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
      </div>
    );
  }

  // ── Quiz ───────────────────────────────────────────────────────────────────

  const q = questions[currentIdx];

  return (
    <div className="flex flex-col space-y-5">
      {/* Mode badge */}
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${cfg.badgeColor}`}>
          {quizMode === 'general' ? 'General Quiz' : `${quizMode === 'preview' ? 'Preview' : 'Review'} — ${raceName}`}
        </span>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-medium text-muted-foreground">
          <span className="uppercase tracking-wider">Question {currentIdx + 1}/{questions.length}</span>
          <span>Score: {score}</span>
        </div>
        <Progress value={(currentIdx / questions.length) * 100} className={`h-1.5 bg-secondary rounded-none ${cfg.progressColor}`} />
      </div>

      {/* Question */}
      <div className="text-xl md:text-2xl font-bold leading-tight py-2">{q.q}</div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {q.opts.map((opt, idx) => {
          let stateClass = 'bg-secondary hover:bg-secondary/80 text-foreground border-transparent';
          if (answered !== null) {
            if (idx === q.ans) stateClass = 'bg-green-600 hover:bg-green-600 text-white border-green-500 shadow-[0_0_15px_rgba(22,163,74,0.4)]';
            else if (idx === answered) stateClass = 'bg-red-600 hover:bg-red-600 text-white border-red-500';
            else stateClass = 'bg-secondary/50 text-muted-foreground border-transparent opacity-50';
          }
          return (
            <Button
              key={idx}
              variant="outline"
              className={`h-auto min-h-16 py-3 px-4 justify-start text-left whitespace-normal border-2 transition-all ${stateClass}`}
              onClick={() => handleAnswer(idx)}
              disabled={answered !== null}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center bg-black/20 text-xs font-bold font-mono">
                  {String.fromCharCode(65 + idx)}
                </div>
                <span>{opt}</span>
              </div>
            </Button>
          );
        })}
      </div>

      {/* Fact + next button */}
      {answered !== null && (
        <div className="mt-2 p-4 bg-secondary/50 border border-border rounded-lg animate-in slide-in-from-bottom-2">
          <p className="text-sm font-medium mb-4">{q.fact}</p>
          <Button onClick={nextQuestion} className={`w-full font-bold tracking-widest ${cfg.accentColor}`}>
            {currentIdx < questions.length - 1 ? 'NEXT QUESTION' : 'FINISH'}
          </Button>
        </div>
      )}

      {/* General mode unlock notice */}
      {quizMode === 'general' && currentIdx === 0 && answered === null && (
        <p className="text-[11px] text-muted-foreground/40 text-center">
          Preview quizzes unlock on Thursdays · Review quizzes unlock on Tuesdays
        </p>
      )}
    </div>
  );
}
