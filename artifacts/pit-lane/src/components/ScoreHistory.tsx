import { useState } from "react";
import { Trash2, Trophy, BarChart2 } from "lucide-react";
import { loadHistory, clearHistory, pct, formatDate, type ScoreEntry, type GameKey } from "@/lib/scoreHistory";

const GAME_LABELS: Record<GameKey, { name: string; color: string }> = {
  quiz: { name: "General Quiz", color: "#2e7d32" },
  postRace: { name: "AI Race Quiz", color: "#1565c0" },
  tenabell: { name: "Tenabell", color: "#e65100" },
};

function ScoreBar({ score, total, color }: { score: number; total: number; color: string }) {
  const p = pct(score, total);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${p}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-bold tabular-nums w-14 text-right" style={{ color }}>
        {score}/{total}
      </span>
    </div>
  );
}

function BestBadge({ entries }: { entries: ScoreEntry[] }) {
  if (!entries.length) return null;
  const best = entries.reduce((a, b) => pct(a.score, a.total) >= pct(b.score, b.total) ? a : b);
  return (
    <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
      <Trophy className="w-3 h-3" /> {best.score}/{best.total} best
    </div>
  );
}

export function ScoreHistory({ onClose }: { onClose: () => void }) {
  const [entries, setEntries] = useState<ScoreEntry[]>(loadHistory);

  const handleClear = () => {
    clearHistory();
    setEntries([]);
  };

  const byGame: Record<GameKey, ScoreEntry[]> = {
    quiz: entries.filter(e => e.game === "quiz"),
    postRace: entries.filter(e => e.game === "postRace"),
    tenabell: entries.filter(e => e.game === "tenabell"),
  };

  const totalPlayed = entries.length;
  const avgPct = totalPlayed
    ? Math.round(entries.reduce((sum, e) => sum + pct(e.score, e.total), 0) / totalPlayed)
    : 0;

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Summary strip */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 bg-secondary/50 rounded-lg px-4 py-3 text-center">
          <p className="text-2xl font-black">{totalPlayed}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Games played</p>
        </div>
        <div className="flex-1 bg-secondary/50 rounded-lg px-4 py-3 text-center">
          <p className="text-2xl font-black">{totalPlayed ? `${avgPct}%` : "—"}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Avg score</p>
        </div>
      </div>

      {totalPlayed === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3 text-center">
          <BarChart2 className="w-10 h-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No scores yet — play a game to get started.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {(["quiz", "postRace", "tenabell"] as GameKey[]).map(key => {
            const gameEntries = byGame[key];
            if (!gameEntries.length) return null;
            const { name, color } = GAME_LABELS[key];

            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{name}</span>
                  </div>
                  <BestBadge entries={gameEntries} />
                </div>
                <div className="space-y-2">
                  {gameEntries.map(entry => (
                    <div key={entry.id} className="bg-secondary/30 border border-border/50 rounded-lg px-3 py-2.5 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-foreground leading-tight">{entry.label}</span>
                        <span className="text-[10px] text-muted-foreground/60 shrink-0 mt-0.5">{formatDate(entry.date)}</span>
                      </div>
                      <ScoreBar score={entry.score} total={entry.total} color={color} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPlayed > 0 && (
        <button
          onClick={handleClear}
          className="mt-8 flex items-center gap-1.5 text-xs text-muted-foreground/50 hover:text-destructive transition-colors mx-auto"
          data-testid="button-clear-history"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear all history
        </button>
      )}
    </div>
  );
}
