import { useState, useEffect, useRef } from 'react';
import { Trophy, RefreshCw, AlertTriangle, Share2, Check, X, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AutocompleteInput } from '@/components/AutocompleteInput';
import { Progress } from '@/components/ui/progress';
import { saveScore } from '@/lib/scoreHistory';
import { CircuitSilhouette } from '@/components/games/CircuitSilhouette';
import { resolveQuestionImage } from '@/lib/teamLogos';
import { getNextRace } from '@/lib/f1Calendar';
import type { Race } from '@/lib/f1Calendar';
import {
  hasCompletedReviewThisWeek,
  completeReviewQuiz,
  getNextReviewTuesdayLabel,
} from '@/lib/weeklyQuiz';

// ── Types ────────────────────────────────────────────────────────────────────

type QuizMode = 'preview' | 'review' | 'general';
type Phase = 'preview-setup' | 'input' | 'loading' | 'quiz' | 'done' | 'preview-locked' | 'locked' | 'error';

// `image` is optional on standard questions: either a `logo:<Team>` token (a
// reliable bundled logo) or an https URL to a real photo. It renders above the
// question with a graceful fallback when it fails to load.
type StandardQ = { type: 'standard'; q: string; opts: string[]; ans: number; fact: string; image?: string };
type WhoAmIQ  = { type: 'whoami';   q: string; clues: string[]; opts: string[]; ans: number; fact: string };
type LayoutQ  = { type: 'layout';   q: string; circuits: string[]; ans: number; fact: string };
type Question  = StandardQ | WhoAmIQ | LayoutQ;

type AnswerRecord = {
  q: Question;
  chosen: number;
  correct: boolean;
  points: number;
  cluesUsed?: number;
};

// ── Day detection ─────────────────────────────────────────────────────────────

function getTodayMode(): QuizMode {
  const day = new Date().getDay();
  if (day === 4 || day === 5 || day === 6) return 'preview'; // Thursday–Saturday
  if (day === 2 || day === 3) return 'review';               // Tuesday–Wednesday
  return 'general';
}

/** Initial phase for a freshly mounted/reset quiz of the given mode. */
function initialPhaseFor(mode: QuizMode): Phase {
  if (mode === 'general') return 'quiz';
  if (mode === 'review') return hasCompletedReviewThisWeek() ? 'locked' : 'loading';
  // Preview now starts with auto-detection screen
  return 'preview-setup';
}

// ── Static questions (general mode) ─────────────────────────────────────────

const GENERAL_QUESTIONS: StandardQ[] = [
  { type:'standard', q:"Which driver has the most F1 World Championships?", opts:["Michael Schumacher","Lewis Hamilton","Sebastian Vettel","Ayrton Senna"], ans:1, fact:"Hamilton and Schumacher both hold 7 titles (Schumacher's record from 2003–2004 stood for 14 years)." },
  { type:'standard', q:"What does DRS stand for?", opts:["Dynamic Race Speed","Drag Reduction System","Dual Rear Spoiler","Direct Racing System"], ans:1, fact:"DRS opens a flap in the rear wing, cutting drag and allowing overtaking on designated zones." },
  { type:'standard', q:"Which circuit is nicknamed the Cathedral of Speed?", opts:["Monaco","Spa","Monza","Silverstone"], ans:2, fact:"Monza in Italy is famous for its high-speed layout and passionate Italian fans." },
  { type:'standard', q:"How many points does a race winner receive?", opts:["20","25","30","15"], ans:1, fact:"The 25-point win has been standard since the 2010 season." },
  { type:'standard', q:"Which team has won the most Constructors' Championships?", opts:["McLaren","Mercedes","Williams","Ferrari"], ans:3, fact:"Ferrari leads with 16 Constructors' titles — more than any other team in F1 history." },
  { type:'standard', q:"What colour flag signals the race has been stopped?", opts:["Yellow","Blue","Red","Black"], ans:2, fact:"A red flag immediately neutralises the race." },
  { type:'standard', q:"Which driver is nicknamed The Iceman?", opts:["Nico Rosberg","Alain Prost","Kimi Räikkönen","Jenson Button"], ans:2, fact:"Räikkönen earned the nickname for his cool demeanour and calm approach to racing." },
  { type:'standard', q:"How many cars start a Formula 1 race in 2026?", opts:["18","20","22","24"], ans:2, fact:"With 11 teams × 2 drivers there are 22 cars on the starting grid in 2026, after Cadillac joined." },
  { type:'standard', q:"Which country hosts the Suzuka circuit?", opts:["South Korea","China","Singapore","Japan"], ans:3, fact:"Suzuka is in Japan's Mie Prefecture and has hosted the Japanese GP since 1987." },
  { type:'standard', q:"What does a blue flag signal to a driver?", opts:["Caution ahead","Let a faster car pass","Pit stop required","Rain is coming"], ans:1, fact:"A blue flag tells a driver the car behind is faster and they should let it pass." },
  // ── Team-logo identification (real bundled logos, always reliable) ──────────
  { type:'standard', q:"Which Formula 1 team does this logo belong to?", image:'logo:Ferrari', opts:["McLaren","Ferrari","Williams","Aston Martin"], ans:1, fact:"Ferrari is the oldest and most successful team, founded in 1950." },
  { type:'standard', q:"Which team's logo is this?", image:'logo:Mercedes', opts:["Mercedes","Red Bull","Aston Martin","Williams"], ans:0, fact:"Mercedes won eight consecutive Constructors' titles from 2014–2021." },
  { type:'standard', q:"Identify the team from its logo.", image:'logo:Red Bull', opts:["Ferrari","McLaren","Red Bull","Williams"], ans:2, fact:"Red Bull entered F1 in 2005 after buying the Jaguar Racing team." },
  { type:'standard', q:"Which constructor uses this logo?", image:'logo:McLaren', opts:["McLaren","Mercedes","Aston Martin","Ferrari"], ans:0, fact:"McLaren is the second-oldest active team and has won 8 Constructors' Championships." },
  { type:'standard', q:"Whose team logo is shown here?", image:'logo:Williams', opts:["Aston Martin","Williams","Red Bull","McLaren"], ans:1, fact:"Williams won nine Constructors' Championships between 1980 and 1997." },
  { type:'standard', q:"Which team does this logo represent?", image:'logo:Aston Martin', opts:["Aston Martin","Ferrari","Mercedes","Williams"], ans:0, fact:"Aston Martin returned to F1 as a constructor team with the green and pink livery in 2021." },
  // ── Career-path questions ──────────────────────────────────────────────────
  { type:'standard', q:"This driver's F1 path went Sauber → Ferrari → Lotus → Ferrari → Alfa Romeo. Who is it?", opts:["Fernando Alonso","Kimi Räikkönen","Felipe Massa","Sebastian Vettel"], ans:1, fact:"Räikkönen is the oldest current driver and has competed in more F1 seasons than anyone." },
  { type:'standard', q:"Which driver followed this team path: McLaren → Renault → Ferrari → McLaren → Alpine → Aston Martin?", opts:["Lewis Hamilton","Fernando Alonso","Sebastian Vettel","Max Verstappen"], ans:1, fact:"Alonso is a two-time World Champion known for his aggressive driving style." },
];

// Build a fresh 10-question general quiz from the shuffled pool so scoring stays
// 10 questions × 10 pts = 100, while still giving variety (including image
// questions) each time it is played.
function pickGeneralQuestions(): StandardQ[] {
  return [...GENERAL_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10);
}

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
    loadingSteps: [] as string[],
    ratings: [
      { min: 90, msg: 'Championship material! Excellent F1 knowledge.' },
      { min: 70, msg: 'Solid points finish. You know your stuff.' },
      { min: 50, msg: 'Room to improve — keep watching the races.' },
      { min:  0, msg: 'A DNF this time. Keep at it!' },
    ],
  },
} as const;

// ── Scoring helpers ────────────────────────────────────────────────────────────

const MAX_SCORE = 100;
function whoamiPts(cluesRevealed: number) {
  return 10;

function getRating(score: number, mode: QuizMode) {
  const ratings = MODE_CONFIG[mode].ratings;
  return ratings.find(r => score >= r.min)?.msg ?? ratings[ratings.length - 1].msg;
}



const LETTERS = ['A', 'B', 'C', 'D'];

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * Renders a question's optional image (bundled team logo or photo URL) with a
 * graceful fallback: if it fails to load, the image is hidden and the question
 * text/options carry the question on their own.
 */
function QuestionImage({ image }: { image?: string }) {
  const src = resolveQuestionImage(image);
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  const isLogo = (image ?? '').trim().toLowerCase().startsWith('logo:');
  return (
    <div className="flex items-center justify-center rounded-xl border border-border/40 bg-white/95 p-5">
      <img
        src={src}
        alt=""
        onError={() => setFailed(true)}
        className={isLogo ? 'max-h-24 w-auto object-contain' : 'max-h-60 w-full rounded-lg object-contain'}
      />
    </div>
  );
}

type PostRaceQuizProps = {
  /** When provided, the quiz launches directly in this mode (set by the quiz home). */
  initialMode?: QuizMode;
  /** Fallback handler so error states can offer the always-available General Quiz. */
  onPlayGeneral?: () => void;
};

export function PostRaceQuiz({ initialMode, onPlayGeneral }: PostRaceQuizProps = {}) {
  const startMode: QuizMode = initialMode ?? getTodayMode();
  const [testModeOverride, setTestModeOverride] = useState<QuizMode | null>(null);
  // The test override only takes effect in development, so real users in
  // production can never bypass the day-based gating (even via the console).
  const quizMode: QuizMode = import.meta.env.DEV && testModeOverride ? testModeOverride : startMode;
  const cfg = MODE_CONFIG[quizMode];

  const [phase, setPhase] = useState<Phase>(() => initialPhaseFor(startMode));
  // Guards the auto-generate effect against React StrictMode's double-invoke and
  // against re-firing on unrelated re-renders within the same mode.
  const autoGenKey = useRef<string | null>(null);
 const [raceInput, setRaceInput] = useState(() => getNextRace()?.name ?? '');
  const [raceName, setRaceName] = useState(() => startMode === 'general' ? 'General Quiz' : '');
  const [nextRaceData, setNextRaceData] = useState<Race | null>(() =>
    startMode === 'preview' ? getNextRace() : null
  );
  const [questions, setQuestions] = useState<Question[]>(() =>
    startMode === 'general' ? pickGeneralQuestions() : []
  );

  // Quiz state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<AnswerRecord[]>([]);
  const [answered, setAnswered] = useState<number | null>(null);
  const [cluesRevealed, setCluesRevealed] = useState(1);

  // Loading
  const [loadingStep, setLoadingStep] = useState(0);
  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // ── Dev: test mode override ────────────────────────────────────────────────

  const resetQuizState = (mode: QuizMode) => {
    // Allow the auto-generate effect to fire again for the new mode.
    autoGenKey.current = null;
    setPhase(initialPhaseFor(mode));
    setRaceName(mode === 'general' ? 'General Quiz' : '');
    setCurrentIdx(0); setScore(0); setHistory([]); setAnswered(null);
    setCluesRevealed(1); setRaceInput(''); setError(null);
    setQuestions(mode === 'general' ? pickGeneralQuestions() : []);
    setNextRaceData(mode === 'preview' ? getNextRace() : null);
  };

  const handleSetTestMode = (mode: QuizMode) => {
    if (!import.meta.env.DEV) return; // no-op in production
    setTestModeOverride(mode);
    resetQuizState(mode);
  };

  const clearTestMode = () => {
    if (!import.meta.env.DEV) return; // no-op in production
    setTestModeOverride(null);
    resetQuizState(startMode);
  };

  const devBar = import.meta.env.DEV ? (
    <div className="flex items-center gap-1.5 p-2 mb-3 bg-black/50 border border-border/30 rounded-lg">
      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 mr-0.5 shrink-0">
        DEV
      </span>
      {(['preview', 'review', 'general'] as QuizMode[]).map(m => (
        <button
          key={m}
          onClick={() => handleSetTestMode(m)}
          className={`text-[10px] font-bold px-2.5 py-1 rounded-md capitalize transition-colors ${
            testModeOverride === m
              ? m === 'preview' ? 'bg-blue-600 text-white'
                : m === 'review' ? 'bg-[#e10600] text-white'
                : 'bg-[#2e7d32] text-white'
              : 'bg-secondary/60 text-muted-foreground hover:text-foreground'
          }`}
        >
          {m}
        </button>
      ))}
      {testModeOverride && (
        <button
          onClick={clearTestMode}
          className="ml-auto text-[9px] text-muted-foreground/40 hover:text-muted-foreground transition-colors shrink-0"
        >
          × real mode
        </button>
      )}
    </div>
  ) : null;

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
  }, [phase, cfg.loadingSteps.length]);

  // ── Generate ──────────────────────────────────────────────────────────────

  // `race` is the named circuit for the Preview quiz. The Review quiz omits it —
  // the backend web-searches and detects the most recent completed race itself.
  const runGenerate = async (mode: QuizMode, race: string | null) => {
    setPhase('loading');
    setLoadingStep(0);
    setError(null);

    const body: { mode: QuizMode; race?: string } = { mode };
    if (race && race.trim()) body.race = race.trim();

    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const resBody = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(resBody.error ?? `HTTP ${res.status}`);
      }

      const data = await res.json() as { race: string; questions: Question[] };
      setRaceName(data.race);
      setQuestions(data.questions);
      setPhase('quiz');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Couldn\'t generate quiz — please try again.');
      // Preview can return to setup; Review has no setup so show error.
      setPhase(mode === 'review' ? 'error' : 'preview-setup');
    }
  };

  const handleGeneratePreview = () => {
    if (!nextRaceData) return;
    void runGenerate('preview', nextRaceData.name);
  };

  // ── Review auto-generate ─────────────────────────────────────────────────────
  // The Review quiz has no race picker: on entering review mode we either show
  // the locked screen (already played this Tuesday cycle) or auto-generate.
  useEffect(() => {
    if (quizMode !== 'review') return;
    if (autoGenKey.current === 'review') return;
    autoGenKey.current = 'review';
    if (hasCompletedReviewThisWeek()) {
      setPhase('locked');
    } else {
      void runGenerate('review', null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizMode]);

  // ── Answer ──────────────────────────────────────────────────────────────────

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

  // ── Next ───────────────────────────────────────────────────────────────────

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1);
      setAnswered(null);
      setCluesRevealed(1);
    } else {
      saveScore({
        game: quizMode === 'general' ? 'quiz' : 'postRace',
        label: raceName,
        score: Math.min(score, MAX_SCORE),
        total: MAX_SCORE,
      });
      // Review is one-attempt-per-week: lock it out until next Tuesday.
      if (quizMode === 'review') completeReviewQuiz();
      setPhase('done');
    }
  };

  // ── Share ───────────────────────────────────────────────────────────────────

  const handleShare = () => {
    const displayScore = Math.min(score, MAX_SCORE);
    const modeLabel = quizMode === 'preview' ? 'Preview' : quizMode === 'review' ? 'Review' : 'General';
    const text = `I scored ${displayScore}/${MAX_SCORE} on the ${raceName} ${modeLabel} Quiz on Pit Lane Fan Zone — can you beat me?`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // ── Reset ───────────────────────────────────────────────────────────────────

  const handleReset = () => {
    setCurrentIdx(0); setScore(0); setHistory([]); setAnswered(null);
    setCluesRevealed(1); setRaceInput('');
    if (quizMode === 'general') {
      setQuestions(pickGeneralQuestions());
      setPhase('quiz');
    } else if (quizMode === 'review') {
      // Already played this week — go straight to the locked screen.
      setQuestions([]);
      setPhase('locked');
    } else {
      setQuestions([]);
      setPhase('preview-setup');
    }
  };

  // ── Render: preview setup (auto-detect race) ───────────────────────────────

  if (phase === 'preview-setup') {
    return (
      <div className="space-y-5">
        {devBar}
        {nextRaceData && (
          <>
            <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-bold ${cfg.bannerBg} ${cfg.bannerText}`}>
              {cfg.label}
            </div>

            <div className={`border-l-3 rounded-lg p-4 border border-border/40 bg-secondary/20`} style={{ borderLeftColor: cfg.accent, borderLeftWidth: '3px' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  This Weekend
                </div>
              </div>

              <h3 className="text-3xl font-black text-white mb-1">{nextRaceData.name}</h3>

              <p className="text-sm text-muted-foreground mb-3">
                {nextRaceData.circuit}
              </p>

              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                10 questions about the history of this circuit — past winners, lap records, legendary moments and more.
                Available Thursday to Saturday only.
              </p>

              <Button onClick={handleGeneratePreview} className={`w-full font-bold tracking-widest ${cfg.accentCls}`}>
                Generate Preview Quiz →
              </Button>
            </div>
          </>
        )}
      </div>
    );
  }

  // ── Render: preview locked (on days when preview is not available) ─────────

  if (phase === 'preview-locked') {
    return (
      <div className="space-y-5">
        {devBar}
        <div className="flex flex-col items-center justify-center text-center py-12 gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: `${cfg.accent}22` }}>
            <Lock className="w-7 h-7" style={{ color: cfg.accent }} />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-black">Preview Quiz Locked</h2>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Opens Thursday before the race weekend
            </p>
          </div>
          {nextRaceData && (
            <div className="bg-secondary/20 rounded-lg p-4 w-full text-left border border-border/40">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Coming up
              </div>
              <div className="text-lg font-bold text-white mb-1">{nextRaceData.name}</div>
              <div className="text-sm text-muted-foreground">Round {nextRaceData.round}</div>
            </div>
          )}
          {onPlayGeneral && (
            <Button
              onClick={onPlayGeneral}
              variant="outline"
              className="font-bold mt-1"
            >
              ← Back to games
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ── Render: input (review mode only) ───────────────────────────────────────

  if (phase === 'input') {
    return (
      <div className="space-y-5">
        {devBar}
        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-bold ${cfg.bannerBg} ${cfg.bannerText}`}>
          {cfg.label}
        </div>
        <p className="text-sm text-muted-foreground">{cfg.inputLabel}</p>
        <div className="flex gap-2">
          <AutocompleteInput
            value={raceInput}
            onChange={setRaceInput}
            categories={['circuits']}
            onSubmit={() => void runGenerate('review', raceInput)}
            placeholder={cfg.inputPlaceholder}
            className="bg-secondary/50 border-border"
            autoFocus
          />
          <Button onClick={() => void runGenerate('review', raceInput)} disabled={!raceInput.trim()} className={`font-bold px-5 shrink-0 ${cfg.accentCls}`}>
            Generate →
          </Button>
        </div>
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg space-y-3">
            <div className="flex items-start gap-2.5 text-destructive">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold">
                  Couldn't generate the Review Quiz right now.
                </p>
                <p className="text-xs text-muted-foreground mt-1">{error}</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  The AI quiz needs a live connection. You can try again, or play the General Quiz which always works offline.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              {onPlayGeneral && (
                <Button
                  onClick={onPlayGeneral}
                  className="flex-1 font-bold bg-[#2e7d32] hover:bg-[#2e7d32]/85"
                >
                  Play General Quiz instead →
                </Button>
              )}
              <Button
                onClick={() => void runGenerate('review', raceInput)}
                variant="outline"
                disabled={!raceInput.trim()}
                className="flex-1 font-bold gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Try again
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Render: loading ────────────────────────────────────────────────────────

  if (phase === 'loading') {
    return (
      <div className="flex flex-col gap-0">
        {devBar}
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
      </div>
    );
  }

  // ── Render: locked (review already played this week) ───────────────────────

  if (phase === 'locked') {
    return (
      <div className="space-y-5">
        {devBar}
        <div className="flex flex-col items-center justify-center text-center py-12 gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: `${cfg.accent}22` }}>
            <Lock className="w-7 h-7" style={{ color: cfg.accent }} />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-black">You've completed this week's Review Quiz</h2>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Come back next Tuesday for a fresh quiz on the latest race —{' '}
              <span className="font-bold text-foreground">{getNextReviewTuesdayLabel()}</span>.
            </p>
          </div>
          {onPlayGeneral && (
            <Button
              onClick={onPlayGeneral}
              className="font-bold bg-[#2e7d32] hover:bg-[#2e7d32]/85 mt-1"
            >
              Play General Quiz instead →
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ── Render: error (review failed to generate, no input form) ───────────────

  if (phase === 'error') {
    return (
      <div className="space-y-5">
        {devBar}
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg space-y-3">
          <div className="flex items-start gap-2.5 text-destructive">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold">Couldn't generate the Review Quiz right now.</p>
              {error && <p className="text-xs text-muted-foreground mt-1">{error}</p>}
              <p className="text-xs text-muted-foreground/70 mt-1">
                The AI quiz needs a live connection. You can try again, or play the General Quiz which always works offline.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {onPlayGeneral && (
              <Button
                onClick={onPlayGeneral}
                className="flex-1 font-bold bg-[#2e7d32] hover:bg-[#2e7d32]/85"
              >
                Play General Quiz instead →
              </Button>
            )}
            <Button
              onClick={() => void runGenerate('review', null)}
              variant="outline"
              className="flex-1 font-bold gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: done ────────────────────────────────────────────────────────────

  if (phase === 'done') {
    const displayScore = Math.min(score, MAX_SCORE);
    const rating = getRating(displayScore, quizMode);

    return (
      <div className="flex flex-col gap-4 animate-in fade-in">
        {devBar}
        {/* Score header */}
        <div className="flex flex-col items-center py-5 gap-2">
          <Trophy className="w-12 h-12 mb-1" style={{ color: cfg.accent }} />
          <h2 className="text-5xl font-black tabular-nums">
            {displayScore}<span className="text-2xl text-muted-foreground font-bold">/{MAX_SCORE}</span>
          </h2>
          <p className="text-sm text-muted-foreground/70 text-center max-w-xs">{rating}</p>
        </div>

        {/* Share */}
        <Button onClick={handleShare} variant="outline" className="gap-2 font-bold border-border/60">
          {copied ? <><Check className="w-4 h-4 text-green-400" /> Copied!</> : <><Share2 className="w-4 h-4" /> Share score</>}
        </Button>

        {/* Breakdown */}
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40 mb-1">Question breakdown</p>
          {history.map((rec, i) => {
            const isWhoami = rec.q.type === 'whoami';
            const isLayout = rec.q.type === 'layout';
            const correctLabel = isLayout
              ? (rec.q as LayoutQ).circuits[rec.q.ans]
              : (rec.q as StandardQ | WhoAmIQ).opts[rec.q.ans];

            return (
              <div key={i} className={`rounded-lg border p-3 text-sm ${rec.correct ? 'border-green-600/25 bg-green-600/5' : 'border-red-600/25 bg-red-600/5'}`}>
                <div className="flex items-start gap-2">
                  <span className={`shrink-0 mt-0.5 ${rec.correct ? 'text-green-400' : 'text-red-400'}`}>
                    {rec.correct ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white/80 leading-snug">
                      {isWhoami ? 'Who am I?' : isLayout ? 'Which circuit layout?' : rec.q.q}
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
                          Correct: <span className="text-white/60">{correctLabel}</span>
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

        <Button onClick={handleReset} className={`font-bold tracking-widest mt-1 ${cfg.accentCls}`}>
          PLAY AGAIN
        </Button>
      </div>
    );
  }

  // ── Render: quiz ────────────────────────────────────────────────────────────

  const q = questions[currentIdx];
  if (!q) return null;

  const isWhoami = q.type === 'whoami';
  const isLayout = q.type === 'layout';
  const displayScore = Math.min(score, MAX_SCORE);

  return (
    <div className="flex flex-col gap-5">
      {devBar}

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

      {/* General unlock notice (first question only) */}
      {quizMode === 'general' && currentIdx === 0 && answered === null && (
        <p className="text-[10px] text-muted-foreground/30 text-center -mt-1">
          Preview quizzes unlock on Thursdays · Review quizzes unlock on Tuesdays
        </p>
      )}

      {/* Who Am I clues */}
      {isWhoami && (
        <div className="bg-secondary/30 rounded-xl p-4 space-y-3 border border-border/30">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
            Who am I? — up to {whoamiPts(cluesRevealed)} pts
          </p>
          {(q as WhoAmIQ).clues.slice(0, cluesRevealed).map((clue, i) => (
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

      {/* Question text (standard + layout) */}
      {!isWhoami && (
        <div className="text-xl md:text-2xl font-bold leading-tight py-1">{q.q}</div>
      )}

      {/* Optional question image (team logo / photo) with graceful fallback.
          Keyed by question index so the internal failed-state resets per question. */}
      {q.type === 'standard' && q.image && <QuestionImage key={currentIdx} image={q.image} />}

      {/* ── Layout question: circuit SVG grid ─────────────────────────────── */}
      {isLayout && (
        <div className="grid grid-cols-2 gap-3">
          {(q as LayoutQ).circuits.map((circuitName, idx) => {
            let silhouetteState: 'idle' | 'correct' | 'wrong' | 'faded' = 'idle';
            let borderCls = 'border-border/40 hover:border-muted-foreground/60 cursor-pointer';
            let bgCls = 'bg-secondary/40';

            if (answered !== null) {
              if (idx === q.ans) {
                silhouetteState = 'correct';
                borderCls = 'border-green-500/70';
                bgCls = 'bg-green-600/8';
              } else if (idx === answered) {
                silhouetteState = 'wrong';
                borderCls = 'border-red-500/70';
                bgCls = 'bg-red-600/8';
              } else {
                silhouetteState = 'faded';
                borderCls = 'border-transparent';
                bgCls = 'bg-secondary/20';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={answered !== null}
                className={`relative rounded-xl border-2 p-3 pb-2 transition-all duration-200 ${borderCls} ${bgCls}
                  ${answered === null ? 'active:scale-95' : ''}`}
                style={{ aspectRatio: '4/3' }}
              >
                {/* Letter label */}
                <div className="absolute top-2 left-2.5 text-[10px] font-black text-muted-foreground/40">
                  {LETTERS[idx]}
                </div>

                {/* Circuit SVG */}
                <div className="w-full h-full flex items-center justify-center pt-3">
                  <CircuitSilhouette
                    name={circuitName}
                    state={silhouetteState}
                    showLabel={answered !== null && idx === q.ans}
                    className="w-full h-full"
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Standard / Who Am I: text option buttons ──────────────────────── */}
      {!isLayout && (
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
                    {LETTERS[idx]}
                  </div>
                  <span className="text-sm">{opt}</span>
                </div>
              </Button>
            );
          })}
        </div>
      )}

      {/* Post-answer reveal */}
      {answered !== null && (
        <div className="p-4 bg-secondary/50 border border-border rounded-xl animate-in slide-in-from-bottom-2 space-y-3">
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
