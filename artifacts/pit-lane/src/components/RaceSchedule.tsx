import { useEffect, useRef, useState, useCallback } from 'react';
import { CheckCircle2, Circle, Zap, RefreshCw, Pencil, Check, X } from 'lucide-react';
import { CALENDAR_2026, getCurrentRaceStatus, type Race } from '@/lib/f1Calendar';
import {
  loadStandings, saveStandings, sortStandings,
  type StandingsData,
} from '@/lib/f1Standings';

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

function formatUpdated(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function toNum(value: string): number {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

type Tab = 'schedule' | 'drivers' | 'constructors';
type Props = { onClose: () => void };

export function RaceSchedule({ onClose: _onClose }: Props) {
  const status = getCurrentRaceStatus();
  const nextRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<Tab>('schedule');
  const [standings, setStandings] = useState<StandingsData>(loadStandings);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<StandingsData | null>(null);

  useEffect(() => {
    if (tab === 'schedule') {
      setTimeout(() => nextRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
    }
  }, [tab]);

  // The Refresh button only re-orders the data you've already entered/saved.
  // It never invents, adds, or alters any points — purely a deterministic sort.
  const sortNow = useCallback(() => {
    setStandings(prev => {
      const next = sortStandings({ ...prev, lastUpdated: new Date().toISOString() });
      saveStandings(next);
      return next;
    });
  }, []);

  const startEdit = useCallback(() => {
    setDraft(structuredClone(standings));
    setEditing(true);
  }, [standings]);

  const cancelEdit = useCallback(() => {
    setEditing(false);
    setDraft(null);
  }, []);

  const saveEdit = useCallback(() => {
    if (!draft) return;
    const next = sortStandings({ ...draft, lastUpdated: new Date().toISOString() });
    saveStandings(next);
    setStandings(next);
    setEditing(false);
    setDraft(null);
  }, [draft]);

  const updateDriver = (code: string, field: 'points' | 'wins', value: string) => {
    setDraft(prev => prev && {
      ...prev,
      drivers: prev.drivers.map(d => (d.code === code ? { ...d, [field]: toNum(value) } : d)),
    });
  };

  const updateConstructor = (name: string, field: 'points' | 'wins', value: string) => {
    setDraft(prev => prev && {
      ...prev,
      constructors: prev.constructors.map(c => (c.name === name ? { ...c, [field]: toNum(value) } : c)),
    });
  };

  const nextRound = status.kind !== 'offseason' ? status.race.round : null;

  // While editing, render the draft so the inputs are controlled; otherwise the saved data.
  const view = editing && draft ? draft : standings;
  const maxPoints = Math.max(1, ...view.drivers.map(d => d.points));
  const maxTeamPoints = Math.max(1, ...view.constructors.map(c => c.points));

  const StandingsHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div className="flex items-start justify-between mb-3">
      <div>
        <h2 className="text-lg font-black tracking-widest text-white">{title}</h2>
        <p className="text-xs text-muted-foreground/60">{subtitle}</p>
        {standings.lastUpdated ? (
          <p className="text-[10px] text-muted-foreground/40 mt-0.5">
            Sorted · {formatUpdated(standings.lastUpdated)}
          </p>
        ) : (
          <p className="text-[10px] text-muted-foreground/30 mt-0.5">Built-in 2026 data · tap Edit to change</p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1">
        <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">
          After R{view.afterRound}
        </p>
        {editing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={cancelEdit}
              data-testid="button-standings-cancel"
              title="Discard changes"
              className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground/70 hover:text-foreground transition-colors uppercase tracking-wider"
            >
              <X className="w-3 h-3" /> Cancel
            </button>
            <button
              onClick={saveEdit}
              data-testid="button-standings-save"
              title="Save and sort by points"
              className="flex items-center gap-1 text-[10px] font-bold text-primary/80 hover:text-primary transition-colors uppercase tracking-wider"
            >
              <Check className="w-3 h-3" /> Save
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={startEdit}
              data-testid="button-standings-edit"
              title="Edit points and wins"
              className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground/70 hover:text-foreground transition-colors uppercase tracking-wider"
            >
              <Pencil className="w-3 h-3" /> Edit
            </button>
            <button
              onClick={sortNow}
              data-testid="button-standings-sort"
              title="Sort by points (highest first)"
              className="flex items-center gap-1 text-[10px] font-bold text-primary/70 hover:text-primary transition-colors uppercase tracking-wider"
            >
              <RefreshCw className="w-3 h-3" /> Sort
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-0 animate-in fade-in">
      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-secondary/30 rounded-lg p-1">
        {(['schedule', 'drivers', 'constructors'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-md transition-colors ${
              tab === t ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'schedule' ? 'Schedule' : t === 'drivers' ? 'Drivers' : 'Teams'}
          </button>
        ))}
      </div>

      {/* ── SCHEDULE TAB ────────────────────────────────────────────── */}
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

      {/* ── DRIVERS TAB ─────────────────────────────────────────────── */}
      {tab === 'drivers' && (
        <div className="flex flex-col gap-1 py-1">
          <StandingsHeader title="DRIVERS" subtitle="Championship standings" />
          {view.drivers.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground/50 py-8">No standings data provided.</p>
          ) : (
            <div className="flex flex-col gap-1">
              {view.drivers.map(d => {
                const barPct = Math.round((d.points / maxPoints) * 100);
                const isLeader = !editing && d.pos === 1;
                return (
                  <div
                    key={d.code}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isLeader ? 'bg-primary/10 ring-1 ring-primary/25' : 'hover:bg-secondary/40'}`}
                  >
                    <span className={`text-sm font-black w-5 text-right shrink-0 tabular-nums ${isLeader ? 'text-primary' : 'text-muted-foreground/40'}`}>
                      {d.pos}
                    </span>
                    <span className="text-base leading-none shrink-0">{countryFlag(d.country)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5">
                        <span className={`text-sm font-bold leading-tight ${isLeader ? 'text-white' : 'text-white/90'}`}>
                          {d.name}
                        </span>
                        {!editing && d.wins > 0 && (
                          <span className="text-[10px] font-bold text-primary/80">{d.wins}W</span>
                        )}
                      </div>
                      {!editing && (
                        <div className="mt-1 h-1 rounded-full bg-secondary/60 overflow-hidden w-full">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${barPct}%`, backgroundColor: d.teamColor }}
                          />
                        </div>
                      )}
                    </div>
                    {editing ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <label className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            value={d.points}
                            onChange={e => updateDriver(d.code, 'points', e.target.value)}
                            data-testid={`input-driver-points-${d.code}`}
                            className="w-14 bg-secondary/60 rounded px-1.5 py-1 text-xs text-white text-right tabular-nums outline-none focus:ring-1 focus:ring-primary"
                          />
                          <span className="text-[10px] text-muted-foreground/40">pts</span>
                        </label>
                        <label className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            value={d.wins}
                            onChange={e => updateDriver(d.code, 'wins', e.target.value)}
                            data-testid={`input-driver-wins-${d.code}`}
                            className="w-10 bg-secondary/60 rounded px-1.5 py-1 text-xs text-white text-right tabular-nums outline-none focus:ring-1 focus:ring-primary"
                          />
                          <span className="text-[10px] text-muted-foreground/40">W</span>
                        </label>
                      </div>
                    ) : (
                      <div className="text-right shrink-0">
                        <span className={`text-sm font-black tabular-nums ${isLeader ? 'text-primary' : 'text-white/80'}`}>
                          {d.points}
                        </span>
                        <span className="text-[10px] text-muted-foreground/40 ml-0.5">pts</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── CONSTRUCTORS TAB ────────────────────────────────────────── */}
      {tab === 'constructors' && (
        <div className="flex flex-col gap-1 py-1">
          <StandingsHeader title="TEAMS" subtitle="Constructors championship" />
          {view.constructors.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground/50 py-8">No standings data provided.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {view.constructors.map(c => {
                const barPct = Math.round((c.points / maxTeamPoints) * 100);
                const isLeader = !editing && c.pos === 1;
                return (
                  <div
                    key={c.name}
                    className={`px-3 py-3 rounded-lg transition-colors ${isLeader ? 'bg-primary/10 ring-1 ring-primary/25' : 'hover:bg-secondary/40'}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-sm font-black w-5 text-right shrink-0 tabular-nums ${isLeader ? 'text-primary' : 'text-muted-foreground/40'}`}>
                        {c.pos}
                      </span>
                      <span className="flex-1 text-sm font-bold text-white leading-tight">{c.name}</span>
                      {editing ? (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <label className="flex items-center gap-1">
                            <input
                              type="number"
                              min={0}
                              value={c.points}
                              onChange={e => updateConstructor(c.name, 'points', e.target.value)}
                              data-testid={`input-constructor-points-${c.name}`}
                              className="w-14 bg-secondary/60 rounded px-1.5 py-1 text-xs text-white text-right tabular-nums outline-none focus:ring-1 focus:ring-primary"
                            />
                            <span className="text-[10px] text-muted-foreground/40">pts</span>
                          </label>
                          <label className="flex items-center gap-1">
                            <input
                              type="number"
                              min={0}
                              value={c.wins}
                              onChange={e => updateConstructor(c.name, 'wins', e.target.value)}
                              data-testid={`input-constructor-wins-${c.name}`}
                              className="w-10 bg-secondary/60 rounded px-1.5 py-1 text-xs text-white text-right tabular-nums outline-none focus:ring-1 focus:ring-primary"
                            />
                            <span className="text-[10px] text-muted-foreground/40">W</span>
                          </label>
                        </div>
                      ) : (
                        <>
                          {c.wins > 0 && (
                            <span className="text-[10px] font-bold text-primary/80 shrink-0">{c.wins}W</span>
                          )}
                          <div className="text-right shrink-0">
                            <span className={`text-sm font-black tabular-nums ${isLeader ? 'text-primary' : 'text-white/80'}`}>
                              {c.points}
                            </span>
                            <span className="text-[10px] text-muted-foreground/40 ml-0.5">pts</span>
                          </div>
                        </>
                      )}
                    </div>
                    {!editing && (
                      <>
                        <div className="ml-8 h-1.5 rounded-full bg-secondary/60 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${barPct}%`, backgroundColor: c.color }}
                          />
                        </div>
                        <div className="ml-8 mt-1.5 flex gap-2">
                          {view.drivers.filter(d => d.team === c.name).map(d => (
                            <span key={d.code} className="text-[10px] text-muted-foreground/50 font-bold">
                              {d.code} {d.points}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
