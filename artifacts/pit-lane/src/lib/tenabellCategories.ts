// The answer domain for a round. Drives which autocomplete suggestions appear.
// 'seasons' rounds expect a year, which has no useful suggestion list.
export type CategoryKind = 'drivers' | 'teams' | 'circuits' | 'countries' | 'seasons';

/** A single ranked answer. `name` is the canonical label shown in the ranked
 *  list; `aliases` are accepted alternative spellings used for matching only. */
export type Answer = {
  name: string;
  aliases?: string[];
};

export type Category = {
  q: string;
  teaser: string;
  /** Exactly 10 answers, ranked best (#1) → worst (#10) by the category's criteria. */
  answers: Answer[];
  hint: string;
  ordered: boolean;
  /** Answer domain — defaults to 'drivers' when omitted. */
  kind?: CategoryKind;
};

export const CATEGORIES: Category[] = [
  {
    q: "Name the top 10 drivers with the most pole positions at the Hungarian Grand Prix",
    teaser: "Hungarian GP pole kings",
    answers: [
      { name: "Hamilton" },
      { name: "Schumacher" },
      { name: "Rosberg" },
      { name: "Senna" },
      { name: "Mansell" },
      { name: "Alonso" },
      { name: "Vettel" },
      { name: "Häkkinen", aliases: ["Hakkinen"] },
      { name: "Prost" },
      { name: "Berger" },
    ],
    hint: "One driver has 8 poles here — more than double anyone else's total",
    ordered: false,
  },
  {
    q: "Name the top 10 drivers with the most wins at the Monaco Grand Prix",
    teaser: "Monaco Grand Prix winners",
    answers: [
      { name: "Senna" },
      { name: "Schumacher" },
      { name: "Hill" },
      { name: "Prost" },
      { name: "Stewart" },
      { name: "Hamilton" },
      { name: "Rosberg" },
      { name: "Moss" },
      { name: "Coulthard" },
      { name: "Fangio" },
    ],
    hint: "The all-time record holder won here 6 times in 7 seasons",
    ordered: false,
  },
  {
    q: "Name the top 10 drivers with the most career fastest laps in Formula 1",
    teaser: "Most career fastest laps",
    answers: [
      { name: "Schumacher" },
      { name: "Hamilton" },
      { name: "Räikkönen", aliases: ["Raikkonen"] },
      { name: "Prost" },
      { name: "Vettel" },
      { name: "Verstappen" },
      { name: "Mansell" },
      { name: "Clark" },
      { name: "Alonso" },
      { name: "Senna" },
    ],
    hint: "The all-time record is 77 fastest laps — held by a 7-time champion",
    ordered: false,
  },
  {
    q: "Name the top 10 drivers to have won their Formula 1 debut race",
    teaser: "Debut race winners",
    answers: [
      { name: "Baghetti" },
      { name: "Farina" },
      { name: "Fagioli" },
      { name: "Taruffi" },
      { name: "Reutemann" },
      { name: "Pérez", aliases: ["Perez"] },
      { name: "Gasly" },
      { name: "Verstappen" },
      { name: "Leclerc" },
      { name: "Button" },
    ],
    hint: "Giancarlo Baghetti is the most famous — he won his 1961 French GP debut",
    ordered: false,
  },
  {
    q: "Name the top 10 teams with the most wins in a single Formula 1 season",
    teaser: "Most wins in a season — teams",
    answers: [
      { name: "Red Bull" },
      { name: "Mercedes" },
      { name: "Ferrari" },
      { name: "McLaren" },
      { name: "Williams" },
      { name: "Benetton" },
      { name: "Lotus" },
      { name: "Renault" },
      { name: "Brawn" },
      { name: "Cooper" },
    ],
    hint: "Red Bull set the all-time record with 21 wins from 22 races in 2023",
    ordered: false,
    kind: "teams",
  },
  {
    q: "Name the top 10 drivers who have driven for the most different Formula 1 teams",
    teaser: "Most teams driven for",
    answers: [
      { name: "Moss" },
      { name: "Salo" },
      { name: "Alesi" },
      { name: "Trulli" },
      { name: "Fisichella" },
      { name: "Barrichello" },
      { name: "Heidfeld" },
      { name: "Warwick" },
      { name: "Brundle" },
      { name: "Diniz" },
    ],
    hint: "Stirling Moss raced for 7 different constructors in the 1950s and 60s",
    ordered: false,
  },
  {
    q: "Name the top 10 circuits that have hosted the most Formula 1 Grands Prix",
    teaser: "Circuits with most GPs hosted",
    answers: [
      { name: "Monaco", aliases: ["Monte Carlo"] },
      { name: "Monza", aliases: ["Italy"] },
      { name: "Silverstone", aliases: ["Britain", "England"] },
      { name: "Spa", aliases: ["Belgium"] },
      { name: "Nürburgring", aliases: ["Nurburgring", "Nurburg", "Germany"] },
      { name: "Interlagos", aliases: ["Brazil"] },
      { name: "Hungaroring", aliases: ["Hungary", "Budapest"] },
      { name: "Montreal", aliases: ["Canada"] },
      { name: "Hockenheim" },
      { name: "Suzuka", aliases: ["Japan"] },
    ],
    hint: "Monaco and Monza have both hosted over 70 championship races each",
    ordered: false,
    kind: "circuits",
  },
  {
    q: "Name the top 10 drivers with the most podiums without a single race win in Formula 1",
    teaser: "Most podiums without a win",
    answers: [
      { name: "Heidfeld" },
      { name: "Brundle" },
      { name: "Warwick" },
      { name: "de Cesaris", aliases: ["Cesaris"] },
      { name: "Cheever" },
      { name: "Salo" },
      { name: "Bellof" },
      { name: "Jarier" },
      { name: "Glock" },
      { name: "Bonnier" },
    ],
    hint: "Nick Heidfeld leads this list with 13 podiums and zero wins across his career",
    ordered: false,
  },
  {
    q: "Name the top 10 circuits on which Formula 1 has raced most often — specifically the Italian Grand Prix at Monza",
    teaser: "Italian GP — Monza winners",
    answers: [
      { name: "Schumacher" },
      { name: "Hamilton" },
      { name: "Ascari" },
      { name: "Clark" },
      { name: "Prost" },
      { name: "Vettel" },
      { name: "Senna" },
      { name: "Fangio" },
      { name: "Lauda" },
      { name: "Alonso" },
    ],
    hint: "Michael Schumacher and Lewis Hamilton share the record with 5 wins each at Monza",
    ordered: false,
  },
  {
    q: "Name the top 10 drivers who started from outside the top 10 on the grid and still went on to win the race",
    teaser: "Won from outside the top 10",
    answers: [
      { name: "Watson" },
      { name: "Hamilton" },
      { name: "Schumacher" },
      { name: "Räikkönen", aliases: ["Raikkonen"] },
      { name: "Ricciardo" },
      { name: "Barrichello" },
      { name: "Button" },
      { name: "Alonso" },
      { name: "Pérez", aliases: ["Perez"] },
      { name: "Piquet" },
    ],
    hint: "John Watson famously won the 1983 Long Beach GP starting from 22nd on the grid",
    ordered: false,
  },
  {
    q: "Name the top 10 drivers with the most championship points scored in a single Formula 1 season",
    teaser: "Most points in a season — drivers",
    answers: [
      { name: "Verstappen" },
      { name: "Hamilton" },
      { name: "Vettel" },
      { name: "Rosberg" },
      { name: "Norris" },
      { name: "Leclerc" },
      { name: "Pérez", aliases: ["Perez"] },
      { name: "Piastri" },
      { name: "Bottas" },
      { name: "Alonso" },
    ],
    hint: "Max Verstappen shattered the record in 2023, finishing with 575 points",
    ordered: false,
  },
  {
    q: "Name the top 10 nationalities with the most combined Formula 1 World Championship titles",
    teaser: "Nationalities with most F1 titles",
    answers: [
      { name: "British", aliases: ["Britain", "UK", "England"] },
      { name: "German", aliases: ["Germany"] },
      { name: "Brazilian", aliases: ["Brazil"] },
      { name: "Argentine", aliases: ["Argentina"] },
      { name: "French", aliases: ["France"] },
      { name: "Austrian", aliases: ["Austria"] },
      { name: "Australian", aliases: ["Australia"] },
      { name: "Dutch", aliases: ["Netherlands", "Holland"] },
      { name: "Finnish", aliases: ["Finland"] },
      { name: "Spanish", aliases: ["Spain"] },
    ],
    hint: "British drivers have won more championships than any other nation — over 15 combined titles",
    ordered: false,
    kind: "countries",
  },
  {
    q: "Name the top 10 drivers with the most laps led in their Formula 1 career",
    teaser: "Most career laps led",
    answers: [
      { name: "Hamilton" },
      { name: "Schumacher" },
      { name: "Senna" },
      { name: "Prost" },
      { name: "Verstappen" },
      { name: "Vettel" },
      { name: "Clark" },
      { name: "Mansell" },
      { name: "Lauda" },
      { name: "Fangio" },
    ],
    hint: "Lewis Hamilton leads this list by a wide margin with over 5,000 laps led",
    ordered: false,
  },
  {
    q: "Name the top 10 youngest drivers to score their first ever Formula 1 championship point",
    teaser: "Youngest to score first F1 point",
    answers: [
      { name: "Verstappen" },
      { name: "Kvyat" },
      { name: "Sainz" },
      { name: "Leclerc" },
      { name: "Norris" },
      { name: "Ricciardo" },
      { name: "Webber" },
      { name: "Hamilton" },
      { name: "Vettel" },
      { name: "Alonso" },
    ],
    hint: "Max Verstappen was just 17 years and 180 days old when he scored his first point on debut",
    ordered: false,
  },
  {
    q: "Name the top 10 drivers with the most wins at the British Grand Prix at Silverstone",
    teaser: "British GP — Silverstone winners",
    answers: [
      { name: "Hamilton" },
      { name: "Clark" },
      { name: "Mansell" },
      { name: "Prost" },
      { name: "Schumacher" },
      { name: "Hill" },
      { name: "Senna" },
      { name: "Coulthard" },
      { name: "Piquet" },
      { name: "Stewart" },
    ],
    hint: "Lewis Hamilton has won at Silverstone more than anyone — 9 times in total",
    ordered: false,
  },
  {
    q: "Name the top 10 drivers who competed in the most Formula 1 races without ever winning one",
    teaser: "Most starts without a win",
    answers: [
      { name: "de Cesaris", aliases: ["Cesaris"] },
      { name: "Heidfeld" },
      { name: "Brundle" },
      { name: "Warwick" },
      { name: "Jarier" },
      { name: "Cheever" },
      { name: "Salo" },
      { name: "Katayama" },
      { name: "Glock" },
      { name: "Bonnier" },
    ],
    hint: "Andrea de Cesaris started 208 races and never stood on the top step of the podium",
    ordered: false,
  },
  {
    q: "Name the top 10 seasons in Formula 1 history with the most different race winners",
    teaser: "Most different winners in a season",
    answers: [
      { name: "1982" },
      { name: "1977" },
      { name: "1975" },
      { name: "2012" },
      { name: "2019" },
      { name: "1983" },
      { name: "1978" },
      { name: "1985" },
      { name: "1958" },
      { name: "2009" },
    ],
    hint: "In 1982, 11 different drivers won races across just 16 rounds — a chaotic classic season",
    ordered: false,
    kind: "seasons",
  },
  {
    q: "Name 10 drivers who have competed in the most Formula 1 World Championship races in their career — career starts leaders",
    teaser: "Most career race starts",
    answers: [
      { name: "Räikkönen", aliases: ["Raikkonen"] },
      { name: "Alonso" },
      { name: "Hamilton" },
      { name: "Barrichello" },
      { name: "Schumacher" },
      { name: "Button" },
      { name: "Vettel" },
      { name: "Massa" },
      { name: "Trulli" },
      { name: "Coulthard" },
    ],
    hint: "Kimi Räikkönen started 349 races — a record at the time of his retirement in 2021",
    ordered: false,
  },
  {
    q: "Name the top 10 drivers with the most career pole positions in Formula 1 history",
    teaser: "Most career pole positions",
    answers: [
      { name: "Hamilton" },
      { name: "Schumacher" },
      { name: "Senna" },
      { name: "Vettel" },
      { name: "Verstappen" },
      { name: "Prost" },
      { name: "Clark" },
      { name: "Mansell" },
      { name: "Fangio" },
      { name: "Häkkinen", aliases: ["Hakkinen"] },
    ],
    hint: "Lewis Hamilton holds the all-time record with over 100 career pole positions",
    ordered: false,
  },
  {
    q: "Name the top 10 Formula 1 drivers who have also won the Le Mans 24 Hours at some point in their career",
    teaser: "F1 drivers who won Le Mans",
    answers: [
      { name: "Ickx" },
      { name: "Hawthorn" },
      { name: "Hill" },
      { name: "Gurney" },
      { name: "Siffert" },
      { name: "Herbert" },
      { name: "Webber" },
      { name: "Hülkenberg", aliases: ["Hulkenberg"] },
      { name: "Alonso" },
      { name: "Mass" },
    ],
    hint: "Jacky Ickx won Le Mans 6 times and is considered the greatest endurance racer in F1 history",
    ordered: false,
  },

  // ── Race result categories (ranked by finishing position, P1 → P10) ──────────

  {
    q: "Name all 10 classified finishers of the 2021 Hungarian Grand Prix — Ocon's historic maiden win",
    teaser: "2021 Hungarian GP — top 10 finishers",
    answers: [
      { name: "Ocon" },
      { name: "Hamilton" },
      { name: "Sainz" },
      { name: "Alonso" },
      { name: "Stroll" },
      { name: "Tsunoda" },
      { name: "Latifi" },
      { name: "Räikkönen", aliases: ["Raikkonen"] },
      { name: "Giovinazzi" },
      { name: "Russell" },
    ],
    hint: "Esteban Ocon took his first and only win. Sebastian Vettel finished 2nd on track but was later disqualified",
    ordered: false,
  },
  {
    q: "Name all 10 classified finishers of the 2021 Italian Grand Prix at Monza — McLaren's stunning 1–2",
    teaser: "2021 Italian GP — top 10 finishers",
    answers: [
      { name: "Ricciardo" },
      { name: "Norris" },
      { name: "Bottas" },
      { name: "Sainz" },
      { name: "Pérez", aliases: ["Perez"] },
      { name: "Hamilton" },
      { name: "Leclerc" },
      { name: "Alonso" },
      { name: "Tsunoda" },
      { name: "Stroll" },
    ],
    hint: "McLaren's first 1–2 finish since the 2000 Brazilian GP — Ricciardo and Norris on the podium together",
    ordered: false,
  },
  {
    q: "Name all 10 classified finishers of the 2021 Monaco Grand Prix — Verstappen's first Monte Carlo win",
    teaser: "2021 Monaco GP — top 10 finishers",
    answers: [
      { name: "Verstappen" },
      { name: "Sainz" },
      { name: "Norris" },
      { name: "Vettel" },
      { name: "Bottas" },
      { name: "Stroll" },
      { name: "Hamilton" },
      { name: "Gasly" },
      { name: "Alonso" },
      { name: "Pérez", aliases: ["Perez"] },
    ],
    hint: "Leclerc took pole in front of his home crowd but had to withdraw before the race due to a gearbox failure",
    ordered: false,
  },
  {
    q: "Name all 10 classified finishers of the 2020 Turkish Grand Prix — Lewis Hamilton clinches his 7th World Championship",
    teaser: "2020 Turkish GP — top 10 finishers",
    answers: [
      { name: "Hamilton" },
      { name: "Pérez", aliases: ["Perez"] },
      { name: "Vettel" },
      { name: "Leclerc" },
      { name: "Sainz" },
      { name: "Stroll" },
      { name: "Bottas" },
      { name: "Albon" },
      { name: "Räikkönen", aliases: ["Raikkonen"] },
      { name: "Grosjean" },
    ],
    hint: "Lance Stroll took his first and only career pole position in the wet — but won only by grid position",
    ordered: false,
  },
  {
    q: "Name all 10 classified finishers of the 2023 Las Vegas Grand Prix — the first Formula 1 race on the Las Vegas Strip",
    teaser: "2023 Las Vegas GP — top 10 finishers",
    answers: [
      { name: "Verstappen" },
      { name: "Leclerc" },
      { name: "Pérez", aliases: ["Perez"] },
      { name: "Norris" },
      { name: "Sainz" },
      { name: "Hamilton" },
      { name: "Alonso" },
      { name: "Stroll" },
      { name: "Magnussen" },
      { name: "Gasly" },
    ],
    hint: "Charles Leclerc started from pole and finished 2nd — but Verstappen clinched the lead from him late in the race",
    ordered: false,
  },
];

export function getDailyCategory(): Category {
  const dayNumber = Math.floor(Date.now() / 86_400_000);
  return CATEGORIES[dayNumber % CATEGORIES.length];
}

export function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getYesterdayKey(): string {
  const d = new Date(Date.now() - 86_400_000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export type StreakState = {
  current: number;
  best: number;
  lastDate: string;
};

const STREAK_KEY = "pitlane-tenabell-streak";
const STREAK_DEFAULT: StreakState = { current: 0, best: 0, lastDate: "" };

export function loadStreak(): StreakState {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw) return JSON.parse(raw) as StreakState;
  } catch {}
  return { ...STREAK_DEFAULT };
}

export function updateStreak(todayKey: string): StreakState {
  const state = loadStreak();
  if (state.lastDate === todayKey) return state;
  const next = state.lastDate === getYesterdayKey()
    ? state.current + 1
    : 1;
  const updated: StreakState = {
    current: next,
    best: Math.max(state.best, next),
    lastDate: todayKey,
  };
  try { localStorage.setItem(STREAK_KEY, JSON.stringify(updated)); } catch {}
  return updated;
}
