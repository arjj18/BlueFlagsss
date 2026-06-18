import { useEffect, useRef } from 'react';
import { CheckCircle2, Circle, Zap } from 'lucide-react';
import { CALENDAR_2026, getCurrentRaceStatus, type Race } from '@/lib/f1Calendar';

function countryFlag(code: string): string {
  return [...code.toUpperCase()]
    .map(c => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('');
}

function formatRaceDate(dateStr: string): { day: string; month: string; full: string } {
  const d = new Date(dateStr);
  return {
    day: d.toLocaleDateString(undefined, { day: 'numeric' }),
    month: d.toLocaleDateString(undefined, { month: 'short' }).toUpperCase(),
    full: d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
  };
}

function isInPast(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const raceDay = new Date(dateStr);
  raceDay.setHours(0, 0, 0, 0);
  return raceDay < today;
}

type Props = { onClose: () => void };

export function RaceSchedule({ onClose }: Props) {
  const status = getCurrentRaceStatus();
  const nextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    nextRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const nextRound = status.kind !== 'offseason' ? status.race.round : null;

  return (
    <div className="flex flex-col gap-1 py-4 animate-in fade-in">
      {/* Season header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-black tracking-widest text-white">2026 SEASON</h2>
          <p className="text-xs text-muted-foreground/60">Formula 1 World Championship</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-primary">
            {CALENDAR_2026.filter(r => isInPast(r.date)).length}
            <span className="font-normal text-muted-foreground"> / {CALENDAR_2026.length} races</span>
          </p>
          <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">completed</p>
        </div>
      </div>

      {/* Race list */}
      <div className="flex flex-col gap-1">
        {CALENDAR_2026.map((race: Race) => {
          const past = isInPast(race.date);
          const isNext = race.round === nextRound;
          const isWeekend = status.kind === 'weekend' && isNext;
          const { day, month, full } = formatRaceDate(race.date);

          return (
            <div
              key={race.round}
              ref={isNext ? nextRef : undefined}
              title={full}
              className={`
                relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                ${past ? 'opacity-35' : ''}
                ${isNext && !isWeekend ? 'bg-primary/10 ring-1 ring-primary/30' : ''}
                ${isWeekend ? 'bg-primary/20 ring-1 ring-primary/50' : ''}
                ${!past && !isNext ? 'hover:bg-secondary/50' : ''}
              `}
            >
              {/* Round number */}
              <span className="text-[10px] font-bold text-muted-foreground/40 w-5 text-right shrink-0 tabular-nums">
                {race.round}
              </span>

              {/* Date block */}
              <div className="flex flex-col items-center w-8 shrink-0">
                <span className={`text-base font-black leading-none tabular-nums ${isNext ? 'text-primary' : past ? 'text-muted-foreground/50' : 'text-white/80'}`}>
                  {day}
                </span>
                <span className="text-[9px] font-bold tracking-wider text-muted-foreground/40">{month}</span>
              </div>

              {/* Flag + name */}
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <span className="text-lg leading-none">{countryFlag(race.country)}</span>
                <div className="min-w-0">
                  <p className={`text-sm font-bold truncate leading-tight ${past ? 'text-muted-foreground/60' : 'text-white'}`}>
                    {race.shortName}
                  </p>
                  <p className="text-[10px] text-muted-foreground/40 truncate leading-tight">{race.circuit}</p>
                </div>
              </div>

              {/* Status icon */}
              <div className="shrink-0">
                {isWeekend ? (
                  <Zap className="w-4 h-4 text-primary" />
                ) : past ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground/30" />
                ) : isNext ? (
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-muted-foreground/20" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <p className="text-center text-[10px] text-muted-foreground/30 mt-4 uppercase tracking-wider">
        All dates race day (Sunday)
      </p>
    </div>
  );
}
