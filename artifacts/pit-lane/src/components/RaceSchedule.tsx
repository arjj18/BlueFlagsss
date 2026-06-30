import { useEffect, useRef, useState, useCallback } from 'react';
import { CheckCircle2, Circle, Zap, RefreshCw, Pencil, Check, X, Plus, Trash2, CalendarDays } from 'lucide-react';
import { CALENDAR_2026, getCurrentRaceStatus, type Race } from '@/lib/f1Calendar';
import {
  loadStandings, saveStandings, sortStandings, colorForTeam,
  type StandingsData,
} from '@/lib/f1Standings';

function countryFlag(code: string): string {
  if (!/^[a-zA-Z]{2}$/.test(code)) return '';
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

// Build a unique short code (used as React key + Teams-tab chip) for a newly
// added driver, derived from their name and de-duplicated against existing codes.
function makeDriverCode(name: string, taken: Set<string>): string {
  const base = (name.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'NEW');
  if (!taken.has(base)) return base;
  let n = 1;
  let code = base.slice(0, 2) + n;
  while (taken.has(code)) { n += 1; code = base.slice(0, 2) + n; }
  return code;
}

const MEDALS = ['#FFD700', '#C0C0C0', '#CD7F32'];

type Tab = 'schedule' | 'drivers' | 'constructors';
type AddType = 'drivers' | 'constructors';
type Props = { onClose: () => void };

export function RaceSchedule({ onClose: _onClose }: Props) {
  const status = getCurrentRaceStatus();
  const nextRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<Tab>('schedule');
  const [standings, setStandings] = useState<StandingsData>(loadStandings);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<StandingsData | null>(null);

  // Brief confirmation banner shown after sort / save / add / set-race actions.
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  // "Set race" modal (which race the entered points are current as of).
  const [metaOpen, setMetaOpen] = useState(false);
  const [metaRace, setMetaRace] = useState('');
  const [metaRound, setMetaRound] = useState('');

  // "Add entry" modal (driver or constructor).
  const [addOpen, setAddOpen] = useState(false);
  const [addType, setAddType] = useState<AddType>('drivers');
  const [addName, setAddName] = useState('');
  const [addTeam, setAddTeam] = useState('');
  const [addCountry, setAddCountry] = useState('');
  const [addPoints, setAddPoints] = useState('');
  const [addWins, setAddWins] = useState('');

  useEffect(() => {
    if (tab === 'schedule') {
      setTimeout(() => nextRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
    }
  }, [tab]);

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  // The Refresh/Sort button only re-orders the data you've already entered/saved.
  // It never invents, adds, or alters any points — purely a deterministic sort.
  const sortNow = useCallback(() => {
    setStandings(prev => {
      const next = sortStandings({ ...prev, lastUpdated: new Date().toISOString() });
      saveStandings(next);
      return next;
    });
    showToast('Standings sorted');
  }, [showToast]);

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
    showToast('Saved & sorted');
  }, [draft, showToast]);

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

  const removeDriver = (code: string) => {
    setDraft(prev => prev && { ...prev, drivers: prev.drivers.filter(d => d.code !== code) });
  };

  const removeConstructor = (name: string) => {
    setDraft(prev => prev && { ...prev, constructors: prev.constructors.filter(c => c.name !== name) });
  };

  // ── Set race (meta) ───────────────────────────────────────────────
  const openMeta = () => {
    setMetaRace(standings.afterRaceName ?? '');
    setMetaRound(standings.afterRound ? String(standings.afterRound) : '');
    setMetaOpen(true);
  };
  const commitMeta = () => {
    const next: StandingsData = {
      ...standings,
      afterRaceName: metaRace.trim(),
      afterRound: toNum(metaRound),
      lastUpdated: new Date().toISOString(),
    };
    saveStandings(next);
    setStandings(next);
    setMetaOpen(false);
    showToast('Race info saved');
  };

  // ── Add entry ─────────────────────────────────────────────────────
  const openAdd = (type: AddType) => {
    setAddType(type);
    setAddName('');
    setAddTeam('');
    setAddCountry('');
    setAddPoints('');
    setAddWins('');
    setAddOpen(true);
  };
  const commitAdd = () => {
    const name = addName.trim();
    if (!name) { showToast('Enter a name first'); return; }
    // Constructors are identified by name (also the React key and the link used
    // to group drivers under a team), so a duplicate name would corrupt edits
    // and removals — reject it up front.
    if (addType === 'constructors' &&
        standings.constructors.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      showToast('That team already exists');
      return;
    }
    const points = toNum(addPoints);
    const wins = toNum(addWins);

    setStandings(prev => {
      let next: StandingsData;
      if (addType === 'drivers') {
        const taken = new Set(prev.drivers.map(d => d.code));
        const code = makeDriverCode(name, taken);
        const team = addTeam.trim();
        next = sortStandings({
          ...prev,
          lastUpdated: new Date().toISOString(),
          drivers: [
            ...prev.drivers,
            {
              pos: 0, code, name, team,
              teamColor: colorForTeam(team),
              country: addCountry.trim().toUpperCase(),
              points, wins, podiums: 0,
            },
          ],
        });
      } else {
        next = sortStandings({
          ...prev,
          lastUpdated: new Date().toISOString(),
          constructors: [
            ...prev.constructors,
            { pos: 0, name, color: colorForTeam(name), points, wins },
          ],
        });
      }
      saveStandings(next);
      return next;
    });

    setAddOpen(false);
    setTab(addType);
    showToast(addType === 'drivers' ? 'Driver added & sorted' : 'Team added & sorted');
  };

  const nextRound = status.kind !== 'offseason' ? status.race.round : null;

  // While editing, render the draft so the inputs are controlled; otherwise the saved data.
  const view = editing && draft ? draft : standings;
  const maxPoints = Math.max(1, ...view.drivers.map(d => d.points));
  const maxTeamPoints = Math.max(1, ...view.constructors.map(c => c.points));
  const driverLeaderPts = view.drivers.length ? Math.max(...view.drivers.map(d => d.points)) : 0;
  const teamLeaderPts = view.constructors.length ? Math.max(...view.constructors.map(c => c.points)) : 0;

  const StandingsHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div className="flex items-start justify-between mb-3">
      <div>
        <h2 className="text-lg font-black tracking-widest text-white">{title}</h2>
        <p className="text-xs text-muted-foreground/60">{subtitle}</p>
        {standings.afterRaceName ? (
          <p className="text-[10px] text-muted-foreground/50 mt-0.5">
            After {standings.afterRaceName}
          </p>
        ) : null}
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
          {view.afterRound > 0 ? `After R${view.afterRound}` : 'Pre-season'}
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
              onClick={openMeta}
              data-testid="button-standings-setrace"
              title="Set which race these points are after"
              className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground/70 hover:text-foreground transition-colors uppercase tracking-wider"
            >
              <CalendarDays className="w-3 h-3" /> Set race
            </button>
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

  const AddButton = ({ type, label }: { type: AddType; label: string }) => (
    <button
      onClick={() => openAdd(type)}
      data-testid={`button-add-${type}`}
      className="w-full mt-2 flex items-center justify-center gap-1.5 py-3 rounded-lg border border-dashed border-border/60 text-xs font-medium text-muted-foreground/70 hover:text-foreground hover:border-border transition-colors"
    >
      <Plus className="w-3.5 h-3.5" /> {label}
    </button>
  );

  const inputCls =
    'w-full px-3.5 py-2.5 bg-secondary/40 border border-border/60 rounded-lg text-sm text-white outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/40';
  const labelCls =
    'block text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-1.5';

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
                const medal = !editing && d.pos >= 1 && d.pos <= 3 ? MEDALS[d.pos - 1] : null;
                const gap = !editing && d.pos !== 1 ? driverLeaderPts - d.points : 0;
                return (
                  <div
                    key={d.code}
                    style={medal ? { borderLeft: `3px solid ${medal}` } : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isLeader ? 'bg-primary/10 ring-1 ring-primary/25' : 'hover:bg-secondary/40'}`}
                  >
                    <span className={`text-sm font-black w-5 text-right shrink-0 tabular-nums ${medal ? '' : 'text-muted-foreground/40'}`}
                      style={medal ? { color: medal } : undefined}>
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
                        <>
                          <div className="text-[10px] text-muted-foreground/40 leading-tight">{d.team}</div>
                          <div className="mt-1 h-1 rounded-full bg-secondary/60 overflow-hidden w-full">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${barPct}%`, backgroundColor: d.teamColor }}
                            />
                          </div>
                        </>
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
                        <button
                          onClick={() => removeDriver(d.code)}
                          data-testid={`button-remove-driver-${d.code}`}
                          title="Remove driver"
                          className="p-1 text-muted-foreground/50 hover:text-primary transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-right shrink-0">
                        <span className={`text-sm font-black tabular-nums ${isLeader ? 'text-primary' : 'text-white/80'}`}>
                          {d.points}
                        </span>
                        <span className="text-[10px] text-muted-foreground/40 ml-0.5">pts</span>
                        {gap > 0 && (
                          <div className="text-[10px] text-muted-foreground/40 tabular-nums">−{gap}</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {!editing && <AddButton type="drivers" label="Add driver" />}
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
                const medal = !editing && c.pos >= 1 && c.pos <= 3 ? MEDALS[c.pos - 1] : null;
                const gap = !editing && c.pos !== 1 ? teamLeaderPts - c.points : 0;
                return (
                  <div
                    key={c.name}
                    style={medal ? { borderLeft: `3px solid ${medal}` } : undefined}
                    className={`px-3 py-3 rounded-lg transition-colors ${isLeader ? 'bg-primary/10 ring-1 ring-primary/25' : 'hover:bg-secondary/40'}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-sm font-black w-5 text-right shrink-0 tabular-nums ${medal ? '' : 'text-muted-foreground/40'}`}
                        style={medal ? { color: medal } : undefined}>
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
                          <button
                            onClick={() => removeConstructor(c.name)}
                            data-testid={`button-remove-constructor-${c.name}`}
                            title="Remove team"
                            className="p-1 text-muted-foreground/50 hover:text-primary transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
                            {gap > 0 && (
                              <div className="text-[10px] text-muted-foreground/40 tabular-nums">−{gap}</div>
                            )}
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
          {!editing && <AddButton type="constructors" label="Add team" />}
        </div>
      )}

      {/* ── SET RACE MODAL ──────────────────────────────────────────── */}
      {metaOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/85"
          onClick={() => setMetaOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-border/60 bg-card p-6"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-white mb-5">Last race updated</h3>
            <label className={labelCls}>Race name</label>
            <input
              type="text"
              value={metaRace}
              onChange={e => setMetaRace(e.target.value)}
              placeholder="e.g. Austrian Grand Prix"
              data-testid="input-meta-race"
              className={`${inputCls} mb-4`}
            />
            <label className={labelCls}>Round number</label>
            <input
              type="number"
              min={1}
              max={24}
              value={metaRound}
              onChange={e => setMetaRound(e.target.value)}
              placeholder="e.g. 8"
              data-testid="input-meta-round"
              className={`${inputCls} mb-6`}
            />
            <div className="flex gap-2.5">
              <button
                onClick={() => setMetaOpen(false)}
                className="flex-1 py-3 rounded-lg border border-border/60 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={commitMeta}
                data-testid="button-meta-save"
                className="flex-[2] py-3 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD ENTRY MODAL ─────────────────────────────────────────── */}
      {addOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/85"
          onClick={() => setAddOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-border/60 bg-card p-6"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-white mb-4">Add entry</h3>

            <div className="flex gap-1 mb-4 bg-secondary/40 rounded-lg p-1">
              {(['drivers', 'constructors'] as AddType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setAddType(t)}
                  data-testid={`button-addtype-${t}`}
                  className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${
                    addType === t ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t === 'drivers' ? 'Driver' : 'Constructor'}
                </button>
              ))}
            </div>

            <label className={labelCls}>{addType === 'drivers' ? 'Driver name' : 'Team name'}</label>
            <input
              type="text"
              value={addName}
              onChange={e => setAddName(e.target.value)}
              placeholder={addType === 'drivers' ? 'e.g. Lando Norris' : 'e.g. McLaren'}
              data-testid="input-add-name"
              className={`${inputCls} mb-3`}
            />

            {addType === 'drivers' && (
              <>
                <label className={labelCls}>Team</label>
                <input
                  type="text"
                  value={addTeam}
                  onChange={e => setAddTeam(e.target.value)}
                  placeholder="e.g. McLaren"
                  data-testid="input-add-team"
                  className={`${inputCls} mb-3`}
                />
                <label className={labelCls}>Country code (2 letters)</label>
                <input
                  type="text"
                  maxLength={2}
                  value={addCountry}
                  onChange={e => setAddCountry(e.target.value)}
                  placeholder="e.g. GB"
                  data-testid="input-add-country"
                  className={`${inputCls} mb-3 uppercase`}
                />
              </>
            )}

            <div className="flex gap-2.5 mb-6">
              <div className="flex-1">
                <label className={labelCls}>Points</label>
                <input
                  type="number"
                  min={0}
                  value={addPoints}
                  onChange={e => setAddPoints(e.target.value)}
                  placeholder="0"
                  data-testid="input-add-points"
                  className={inputCls}
                />
              </div>
              <div className="flex-1">
                <label className={labelCls}>Wins</label>
                <input
                  type="number"
                  min={0}
                  value={addWins}
                  onChange={e => setAddWins(e.target.value)}
                  placeholder="0"
                  data-testid="input-add-wins"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => setAddOpen(false)}
                className="flex-1 py-3 rounded-lg border border-border/60 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={commitAdd}
                data-testid="button-add-save"
                className="flex-[2] py-3 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors"
              >
                Add &amp; sort
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ───────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="px-4 py-2.5 rounded-full bg-primary text-white text-xs font-bold shadow-lg animate-in fade-in slide-in-from-bottom-2">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
