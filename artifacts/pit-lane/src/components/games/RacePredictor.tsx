import { useState, useEffect, useRef } from 'react';
import { Zap, RefreshCw, CircleAlert as AlertCircle, Database } from 'lucide-react';
import { getNextRace } from '@/lib/f1Calendar';
import { trackApiCall } from '@/lib/apiUsage';

type TextPrediction = {
  prediction: string;
  race: string;
  circuit: string;
  generatedAt: string;
};

const LS_PREFIX = 'pitlane-prediction-r';

const LOADING_STEPS = [
  'Reviewing 2026 championship standings…',
  'Analysing form, track history and tyre strategy…',
  'Building your race prediction…',
];

function loadCached(round: number): TextPrediction | null {
  try {
    const raw = localStorage.getItem(`${LS_PREFIX}${round}`);
    return raw ? (JSON.parse(raw) as TextPrediction) : null;
  } catch { return null; }
}

function saveCache(p: TextPrediction) {
  localStorage.setItem(`${LS_PREFIX}${getNextRace()?.round ?? 0}`, JSON.stringify(p));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function renderPredictionText(text: string) {
  const sections = text.split(/(?=🥇|📋|⚙️|⚔️|🎲|🏆|📊|⚠️)/);
  return sections.filter(s => s.trim()).map((section, i) => {
    const lines = section.trim().split('\n');
    const headerLine = lines[0];
    const bodyLines = lines.slice(1).filter(l => l.trim());

    const isDisclaimer = headerLine.startsWith('⚠️');

    return (
      <div key={i} className={isDisclaimer ? 'bg-secondary/20 rounded-lg p-3' : 'bg-secondary/30 rounded-lg p-3.5'}>
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#7c3aed]/70 mb-2 whitespace-pre-wrap">{headerLine}</p>
        <div className="flex flex-col gap-1">
          {bodyLines.map((line, j) => (
            <p key={j} className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{line}</p>
          ))}
        </div>
      </div>
    );
  });
}

export function RacePredictor() {
  const race = getNextRace();

  const [prediction, setPrediction] = useState<TextPrediction | null>(
    () => race ? loadCached(race.round) : null
  );
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (race && !prediction && !loading) {
      generate();
    }
  }, []);

  function startStepCycle() {
    setLoadingStep(0);
    stepTimerRef.current = setInterval(() => {
      setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1));
    }, 4000);
  }

  function stopStepCycle() {
    if (stepTimerRef.current) {
      clearInterval(stepTimerRef.current);
      stepTimerRef.current = null;
    }
  }

  async function generate() {
    if (!race) return;
    setLoading(true);
    setError('');
    startStepCycle();
    try {
      const res = await fetch('/api/predict/race', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raceName: race.name,
          circuit: race.circuit,
          country: race.country,
          round: race.round
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: { message: `HTTP ${res.status}` } }));
        throw new Error(errorData?.error?.message || `HTTP error ${res.status}`);
      }

      const data = await res.json() as TextPrediction;

      if (data.error) {
        throw new Error(data.error.message || 'Prediction failed');
      }

      const predictionText = data.prediction || '';

      if (!predictionText.trim()) {
        throw new Error('AI returned empty prediction');
      }

      const predictionData: TextPrediction = {
        prediction: predictionText,
        race: data.race || race.name,
        circuit: data.circuit || race.circuit,
        generatedAt: data.generatedAt || new Date().toISOString()
      };

      saveCache(predictionData);
      setPrediction(predictionData);
      trackApiCall(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Prediction failed');
    } finally {
      stopStepCycle();
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 py-2 animate-in fade-in">

      {/* Race info header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#7c3aed]/70 mb-1">
            Round {race!.round} · {race!.date}
          </div>
          <h2 className="text-xl font-black text-white leading-tight">{race!.name}</h2>
          <p className="text-xs text-muted-foreground/60 mt-0.5">{race!.circuit}</p>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          title="Regenerate prediction"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-[#7c3aed]/10 hover:bg-[#7c3aed]/20 text-[#7c3aed] transition-colors disabled:opacity-40"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center py-12 gap-4">
          <div className="relative">
            <Zap className="w-10 h-10 text-[#7c3aed]/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full border-2 border-[#7c3aed] border-t-transparent animate-spin" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            {LOADING_STEPS.map((step, i) => (
              <p
                key={step}
                className={`text-sm transition-all duration-500 ${
                  i === loadingStep
                    ? 'text-white/80 font-medium'
                    : i < loadingStep
                    ? 'text-muted-foreground/30 line-through text-xs'
                    : 'text-muted-foreground/20 text-xs'
                }`}
              >
                {step}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 text-destructive/70 shrink-0 mt-0.5" />
            <p className="text-sm text-destructive/80">{error}</p>
          </div>
          <button
            onClick={generate}
            className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-[#7c3aed]/10 hover:bg-[#7c3aed]/20 text-[#7c3aed] text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        </div>
      )}

      {/* Prediction */}
      {prediction && !loading && (
        <div className="flex flex-col gap-3">

          {/* Generated timestamp */}
          <div className="bg-[#7c3aed]/10 border border-[#7c3aed]/25 rounded-xl p-3">
            <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">
              AI prediction · generated {formatTime(prediction.generatedAt)}
            </p>
          </div>

          {/* Prediction sections */}
          {renderPredictionText(prediction.prediction)}

          {/* Data source footnote */}
          <div className="flex items-center gap-1.5 pt-1 border-t border-white/5">
            <Database className="w-3 h-3 text-muted-foreground/40 shrink-0" />
            <p className="text-[10px] text-muted-foreground/35">
              AI prediction based on known F1 form and history · {formatDate(prediction.generatedAt)}
            </p>
          </div>

        </div>
      )}
    </div>
  );
}
