import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Circle, Zap } from 'lucide-react';
import { CALENDAR_2026, getCurrentRaceStatus, type Race } from '@/lib/f1Calendar';
import { DRIVERS_2026, CONSTRUCTORS_2026, STANDINGS_AFTER_ROUND } from '@/lib/f1Standings';

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

type Tab = 'schedule' | 'drivers' | 'constructors';
type Props = { onClose: () => void };

export function RaceSchedule({ onClose }: Props) {
  const status = getCurrentRaceStatus();
  const nextRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<Tab>('schedule');

  useEffect(() => {
    if (tab === 'schedule') {
      setTimeout(() => nextRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
    }
  }, [tab]);

  const nextRound = status.kind !== 'offseason' ? status.race.round : null;
  const maxPoints = DRIVERS_2026[0].points;
  const maxTeamPoints = CONSTRUCTORS_2026[0].points;

  return (
    <div className="flex flex-col gap-0 animate-in fade-in">
      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-secondary/30 rounded-lg p-1">
        {(['schedule', 'drivers', 'constructors'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-md transition-colors ${
              tab === t
                ? 'bg-primary text-white'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'schedule' ? 'Schedule' : t === 'drivers' ? 'Drivers' : 'Teams'}
          </button>
        ))}
      </div>

      {/* ── SCHEDULE TAB ─────────────────────────────────────────────── */}
      {tab === 'schedule' && (
        <div className="flex flex-col gap-1 py-1">
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
                  <span className="text-[10px] font-bold text-muted-foreground/40 w-5 text-right shrink-0 tabular-nums">
                    {race.round}
                  </span>
                  <div className="flex flex-col items-center w-8 shrink-0">
                    <span className={`text-base font-black leading-none tabular-nums ${isNext ? 'text-primary' : past ? 'text-muted-foreground/50' : 'text-white/80'}`}>
                      {day}
                    </span>
                    <span className="text-[9px] font-bold tracking-wider text-muted-foreground/40">{month}</span>
                  </div>
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <span className="text-lg leading-none">{countryFlag(race.country)}</span>
                    <div className="min-w-0">
                      <p className={`text-sm font-bold truncate leading-tight ${past ? 'text-muted-foreground/60' : 'text-white'}`}>
                        {race.shortName}
                      </p>
                      <p className="text-[10px] text-muted-foreground/40 truncate leading-tight">{race.circuit}</p>
                    </div>
                  </div>
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
          <p className="text-center text-[10px] text-muted-foreground/30 mt-4 uppercase tracking-wider">
            All dates race day (Sunday)
          </p>
        </div>
      )}

      {/* ── DRIVERS TAB ──────────────────────────────────────────────── */}
      {tab === 'drivers' && (
        <div className="flex flex-col gap-1 py-1">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-black tracking-widest text-white">DRIVERS</h2>
              <p className="text-xs text-muted-foreground/60">Championship standings</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-muted-foreground/50 uppercase tracking-wider">After R{STANDINGS_AFTER_ROUND}</p>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            {DRIVERS_2026.map(d => {
              const barPct = Math.round((d.points / maxPoints) * 100);
              const isLeader = d.pos === 1;
              return (
                <div
                  key={d.code}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${isLeader ? 'bg-primary/10 ring-1 ring-primary/25' : 'hover:bg-secondary/40'} transition-colors`}
                >
                  {/* Position */}
                  <span className={`text-sm font-black w-5 text-right shrink-0 tabular-nums ${isLeader ? 'text-primary' : 'text-muted-foreground/40'}`}>
                    {d.pos}
                  </span>

                  {/* Flag */}
                  <span className="text-base leading-none shrink-0">{countryFlag(d.country)}</span>

                  {/* Name + team */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-sm font-bold leading-tight ${isLeader ? 'text-white' : 'text-white/90'}`}>
                        {d.name}
                      </span>
                      {d.wins > 0 && (
                        <span className="text-[10px] font-bold text-primary/80">
                          {d.wins}W
                        </span>
                      )}
                    </div>
                    {/* Points bar */}
                    <div className="mt-1 h-1 rounded-full bg-secondary/60 overflow-hidden w-full">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${barPct}%`, backgroundColor: d.teamColor }}
                      />
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-right shrink-0">
                    <span className={`text-sm font-black tabular-nums ${isLeader ? 'text-primary' : 'text-white/80'}`}>
                      {d.points}
                    </span>
                    <span className="text-[10px] text-muted-foreground/40 ml-0.5">pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── CONSTRUCTORS TAB ─────────────────────────────────────────── */}
      {tab === 'constructors' && (
        <div className="flex flex-col gap-1 py-1">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-black tracking-widest text-white">TEAMS</h2>
              <p className="text-xs text-muted-foreground/60">Constructors championship</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-muted-foreground/50 uppercase tracking-wider">After R{STANDINGS_AFTER_ROUND}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {CONSTRUCTORS_2026.map(c => {
              const barPct = Math.round((c.points / maxTeamPoints) * 100);
              const isLeader = c.pos === 1;
              return (
                <div
                  key={c.name}
                  className={`px-3 py-3 rounded-lg ${isLeader ? 'bg-primary/10 ring-1 ring-primary/25' : 'hover:bg-secondary/40'} transition-colors`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-sm font-black w-5 text-right shrink-0 tabular-nums ${isLeader ? 'text-primary' : 'text-muted-foreground/40'}`}>
                      {c.pos}
                    </span>
                    <span className="flex-1 text-sm font-bold text-white leading-tight">{c.name}</span>
                    {c.wins > 0 && (
                      <span className="text-[10px] font-bold text-primary/80 shrink-0">{c.wins}W</span>
                    )}
                    <div className="text-right shrink-0">
                      <span className={`text-sm font-black tabular-nums ${isLeader ? 'text-primary' : 'text-white/80'}`}>
                        {c.points}
                      </span>
                      <span className="text-[10px] text-muted-foreground/40 ml-0.5">pts</span>
                    </div>
                  </div>
                  {/* Points bar */}
                  <div className="ml-8 h-1.5 rounded-full bg-secondary/60 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${barPct}%`, backgroundColor: c.color }}
                    />
                  </div>
                  {/* Drivers */}
                  <div className="ml-8 mt-1.5 flex gap-2">
                    {DRIVERS_2026.filter(d => d.team === c.name).map(d => (
                      <span key={d.code} className="text-[10px] text-muted-foreground/50 font-bold">
                        {d.code} {d.points}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
