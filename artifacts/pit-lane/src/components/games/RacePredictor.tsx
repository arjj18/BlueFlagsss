import { useState, useEffect } from 'react';
import { Zap, RefreshCw, Trophy, AlertCircle, TrendingUp, Star } from 'lucide-react';
import { getCurrentRaceStatus } from '@/lib/f1Calendar';
import { colorForTeam } from '@/lib/f1Standings';

type PodiumEntry = { pos: number; driver: string; team: string; note: string };
type Prediction = {
  race: string;
  round: number;
  headline: string;
  winner: { driver: string; team: string; confidence: 'high' | 'medium' | 'low' };
  podium: PodiumEntry[];
  top10: string[];
  factors: string[];
  wildcard: string;
  championshipImpact: string;
  generatedAt: string;
};

const LS_PREFIX = 'pitlane-prediction-r';

function loadCached(round: number): Prediction | null {
  try {
    const raw = localStorage.getItem(`${LS_PREFIX}${round}`);
    return raw ? (JSON.parse(raw) as Prediction) : null;
  } catch { return null; }
}

function saveCache(p: Prediction) {
  localStorage.setItem(`${LS_PREFIX}${p.round}`, JSON.stringify(p));
}

function confidenceBadge(c: 'high' | 'medium' | 'low') {
  if (c === 'high') return 'bg-emerald-500/20 text-emerald-400';
  if (c === 'medium') return 'bg-amber-500/20 text-amber-400';
  return 'bg-muted/40 text-muted-foreground';
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export function RacePredictor() {
  const status = getCurrentRaceStatus();
  const race = status.kind !== 'offseason' ? status.race : null;

  const [prediction, setPrediction] = useState<Prediction | null>(
    () => race ? loadCached(race.round) : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-generate if no cached prediction exists
  useEffect(() => {
    if (race && !prediction && !loading) {
      generate();
    }
  }, []);

  async function generate() {
    if (!race) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/predict/race', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ race: race.name, round: race.round }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      const data = await res.json() as Prediction;
      saveCache(data);
      setPrediction(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Prediction failed');
    } finally {
      setLoading(false);
    }
  }

  if (status.kind === 'offseason') {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <Trophy className="w-8 h-8 text-muted-foreground/30" />
        <p className="text-muted-foreground/60 text-sm">The 2026 season has ended.</p>
        <p className="text-xs text-muted-foreground/40">Come back in 2027!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 py-2 animate-in fade-in">

      {/* Race info header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#7c3aed]/70 mb-1">
            {status.kind === 'weekend' ? 'Race Weekend' : `Round ${race!.round} · ${race!.date}`}
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
          <p className="text-sm text-muted-foreground/60">Analysing form, track data &amp; standings…</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 text-destructive/70 shrink-0" />
          <p className="text-sm text-destructive/80">{error}</p>
        </div>
      )}

      {/* Prediction */}
      {prediction && !loading && (
        <div className="flex flex-col gap-4">

          {/* Headline */}
          <div className="bg-[#7c3aed]/10 border border-[#7c3aed]/25 rounded-xl p-4">
            <p className="text-base font-black text-white leading-snug">"{prediction.headline}"</p>
            <p className="text-[10px] text-muted-foreground/40 mt-1.5 uppercase tracking-wider">
              AI prediction · generated {formatTime(prediction.generatedAt)}
            </p>
          </div>

          {/* Podium */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Trophy className="w-3.5 h-3.5 text-[#7c3aed]/60" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">Predicted Podium</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {prediction.podium.map((p) => {
                const teamColor = colorForTeam(p.team);
                const posLabel = p.pos === 1 ? '1st' : p.pos === 2 ? '2nd' : '3rd';
                const posAccent = p.pos === 1 ? 'text-yellow-400' : p.pos === 2 ? 'text-zinc-300' : 'text-amber-600';
                return (
                  <div key={p.pos} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${p.pos === 1 ? 'bg-yellow-400/5 ring-1 ring-yellow-400/20' : 'bg-secondary/30'}`}>
                    <span className={`text-sm font-black w-6 shrink-0 ${posAccent}`}>{posLabel}</span>
                    <div className="w-1 h-6 rounded-full shrink-0" style={{ backgroundColor: teamColor }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white leading-tight">{p.driver}</p>
                      <p className="text-[10px] text-muted-foreground/50">{p.note}</p>
                    </div>
                    {p.pos === 1 && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${confidenceBadge(prediction.winner.confidence)}`}>
                        {prediction.winner.confidence}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top 10 */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-[#7c3aed]/60" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">Full Top 10</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {prediction.top10.map((driver, i) => (
                <div key={driver} className="flex items-center gap-2 py-1 px-2 rounded-md hover:bg-secondary/30 transition-colors">
                  <span className="text-[10px] font-bold text-muted-foreground/40 w-4 tabular-nums text-right">{i + 1}</span>
                  <span className="text-xs text-white/80 truncate">{driver}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key factors */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Zap className="w-3.5 h-3.5 text-[#7c3aed]/60" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">Key Factors</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {prediction.factors.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground/70">
                  <span className="text-[#7c3aed]/50 shrink-0 mt-0.5">▸</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Wildcard + Championship impact */}
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-secondary/30 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Star className="w-3 h-3 text-amber-400/70" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">Wildcard</span>
              </div>
              <p className="text-xs text-white/80">{prediction.wildcard}</p>
            </div>
            <div className="bg-[#7c3aed]/5 border border-[#7c3aed]/15 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Trophy className="w-3 h-3 text-[#7c3aed]/60" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">Title Fight</span>
              </div>
              <p className="text-xs text-white/80">{prediction.championshipImpact}</p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
