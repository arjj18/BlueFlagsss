export type Driver = {
  pos: number;
  code: string;
  name: string;
  team: string;
  teamColor: string;
  country: string;
  points: number;
  wins: number;
  podiums: number;
};

export type Constructor = {
  pos: number;
  name: string;
  color: string;
  points: number;
  wins: number;
};

export type StandingsData = {
  afterRound: number;
  afterRaceName: string;
  drivers: Driver[];
  constructors: Constructor[];
  lastUpdated: string;
};

export const TEAM_COLORS: Record<string, string> = {
  "Red Bull Racing": "#1E41FF",
  "Ferrari":         "#DC0000",
  "McLaren":         "#FF8000",
  "Mercedes":        "#00D2BE",
  "Aston Martin":    "#006F62",
  "Alpine":          "#FF87BC",
  "Williams":        "#005AFF",
  "Racing Bulls":    "#6692FF",
  "Kick Sauber":     "#52E252",
  "Haas":            "#B6BABD",
  "Cadillac":        "#CC0000",
};

export function colorForTeam(team: string): string {
  return TEAM_COLORS[team] ?? "#666666";
}

export const STANDINGS_LS_KEY = "pitlane-standings-2026";

export const DEFAULT_STANDINGS: StandingsData = {
  afterRound: 0,
  afterRaceName: "",
  lastUpdated: "",
  drivers: [
    { pos: 1,  code: "VER", name: "Max Verstappen",     team: "Red Bull Racing", teamColor: "#1E41FF", country: "NL", points: 0, wins: 0, podiums: 0 },
    { pos: 2,  code: "LAW", name: "Liam Lawson",        team: "Red Bull Racing", teamColor: "#1E41FF", country: "NZ", points: 0, wins: 0, podiums: 0 },
    { pos: 3,  code: "HAM", name: "Lewis Hamilton",     team: "Ferrari",         teamColor: "#DC0000", country: "GB", points: 0, wins: 0, podiums: 0 },
    { pos: 4,  code: "LEC", name: "Charles Leclerc",    team: "Ferrari",         teamColor: "#DC0000", country: "MC", points: 0, wins: 0, podiums: 0 },
    { pos: 5,  code: "NOR", name: "Lando Norris",       team: "McLaren",         teamColor: "#FF8000", country: "GB", points: 0, wins: 0, podiums: 0 },
    { pos: 6,  code: "PIA", name: "Oscar Piastri",      team: "McLaren",         teamColor: "#FF8000", country: "AU", points: 0, wins: 0, podiums: 0 },
    { pos: 7,  code: "RUS", name: "George Russell",     team: "Mercedes",        teamColor: "#00D2BE", country: "GB", points: 0, wins: 0, podiums: 0 },
    { pos: 8,  code: "ANT", name: "Kimi Antonelli",     team: "Mercedes",        teamColor: "#00D2BE", country: "IT", points: 0, wins: 0, podiums: 0 },
    { pos: 9,  code: "ALO", name: "Fernando Alonso",    team: "Aston Martin",    teamColor: "#006F62", country: "ES", points: 0, wins: 0, podiums: 0 },
    { pos: 10, code: "STR", name: "Lance Stroll",       team: "Aston Martin",    teamColor: "#006F62", country: "CA", points: 0, wins: 0, podiums: 0 },
    { pos: 11, code: "GAS", name: "Pierre Gasly",       team: "Alpine",          teamColor: "#FF87BC", country: "FR", points: 0, wins: 0, podiums: 0 },
    { pos: 12, code: "COL", name: "Franco Colapinto",   team: "Alpine",          teamColor: "#FF87BC", country: "AR", points: 0, wins: 0, podiums: 0 },
    { pos: 13, code: "ALB", name: "Alexander Albon",    team: "Williams",        teamColor: "#005AFF", country: "TH", points: 0, wins: 0, podiums: 0 },
    { pos: 14, code: "SAI", name: "Carlos Sainz",       team: "Williams",        teamColor: "#005AFF", country: "ES", points: 0, wins: 0, podiums: 0 },
    { pos: 15, code: "HAD", name: "Isack Hadjar",       team: "Racing Bulls",    teamColor: "#6692FF", country: "FR", points: 0, wins: 0, podiums: 0 },
    { pos: 16, code: "LIN", name: "Arvid Lindblad",     team: "Racing Bulls",    teamColor: "#6692FF", country: "SE", points: 0, wins: 0, podiums: 0 },
    { pos: 17, code: "HUL", name: "Nico Hülkenberg",    team: "Kick Sauber",     teamColor: "#52E252", country: "DE", points: 0, wins: 0, podiums: 0 },
    { pos: 18, code: "BOR", name: "Gabriel Bortoleto",  team: "Kick Sauber",     teamColor: "#52E252", country: "BR", points: 0, wins: 0, podiums: 0 },
    { pos: 19, code: "BEA", name: "Oliver Bearman",     team: "Haas",            teamColor: "#B6BABD", country: "GB", points: 0, wins: 0, podiums: 0 },
    { pos: 20, code: "OCO", name: "Esteban Ocon",       team: "Haas",            teamColor: "#B6BABD", country: "FR", points: 0, wins: 0, podiums: 0 },
    { pos: 21, code: "PER", name: "Sergio Pérez",       team: "Cadillac",        teamColor: "#CC0000", country: "MX", points: 0, wins: 0, podiums: 0 },
    { pos: 22, code: "BOT", name: "Valtteri Bottas",    team: "Cadillac",        teamColor: "#CC0000", country: "FI", points: 0, wins: 0, podiums: 0 },
  ],
  constructors: [
    { pos: 1,  name: "Red Bull Racing", color: "#1E41FF", points: 0, wins: 0 },
    { pos: 2,  name: "Ferrari",         color: "#DC0000", points: 0, wins: 0 },
    { pos: 3,  name: "McLaren",         color: "#FF8000", points: 0, wins: 0 },
    { pos: 4,  name: "Mercedes",        color: "#00D2BE", points: 0, wins: 0 },
    { pos: 5,  name: "Aston Martin",    color: "#006F62", points: 0, wins: 0 },
    { pos: 6,  name: "Alpine",          color: "#FF87BC", points: 0, wins: 0 },
    { pos: 7,  name: "Williams",        color: "#005AFF", points: 0, wins: 0 },
    { pos: 8,  name: "Racing Bulls",    color: "#6692FF", points: 0, wins: 0 },
    { pos: 9,  name: "Kick Sauber",     color: "#52E252", points: 0, wins: 0 },
    { pos: 10, name: "Haas",            color: "#B6BABD", points: 0, wins: 0 },
    { pos: 11, name: "Cadillac",        color: "#CC0000", points: 0, wins: 0 },
  ],
};

/**
 * Pure, deterministic re-sort of standings the user has entered/saved.
 * Never invents, adds, removes, or alters points — it only orders the rows.
 *
 * - Sort by points (highest → lowest).
 * - Tie-break by wins (highest → lowest).
 * - Equal points AND wins keep their existing relative order (Array.sort is stable).
 * - Positions are renumbered 1..n and team colors re-applied.
 */
export function sortStandings(data: StandingsData): StandingsData {
  const drivers = [...data.drivers]
    .sort((a, b) => b.points - a.points || b.wins - a.wins)
    .map((d, i) => ({ ...d, pos: i + 1, teamColor: colorForTeam(d.team) }));
  const constructors = [...data.constructors]
    .sort((a, b) => b.points - a.points || b.wins - a.wins)
    .map((c, i) => ({ ...c, pos: i + 1, color: colorForTeam(c.name) }));
  return { ...data, drivers, constructors };
}

// Drivers that appeared in older default standings but are no longer on the
// 2026 grid. If any saved data still references one of these, it predates the
// corrected lineup and must be force-reset. Self-correcting: the new defaults
// contain none of these names, so this never re-triggers after one reset.
const RETIRED_DRIVER_MARKERS = ["Tsunoda", "Doohan", "Herta", "Armstrong"];

export function loadStandings(): StandingsData {
  try {
    const raw = localStorage.getItem(STANDINGS_LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StandingsData;
      // Validate shape, not length: an explicitly empty saved list is valid
      // (it represents "no standings data provided") and must survive reload.
      if (Array.isArray(parsed.drivers) && Array.isArray(parsed.constructors)) {
        const hasRetiredDriver = parsed.drivers.some(
          (d) =>
            typeof d?.name === "string" &&
            RETIRED_DRIVER_MARKERS.some((marker) => d.name.includes(marker)),
        );
        if (hasRetiredDriver) return DEFAULT_STANDINGS;
        return {
          ...parsed,
          drivers: parsed.drivers.map(d => ({ ...d, teamColor: colorForTeam(d.team) })),
          constructors: parsed.constructors.map(c => ({ ...c, color: colorForTeam(c.name) })),
        };
      }
    }
  } catch { /* ignore */ }
  return DEFAULT_STANDINGS;
}

export function saveStandings(data: StandingsData) {
  localStorage.setItem(STANDINGS_LS_KEY, JSON.stringify(data));
}
