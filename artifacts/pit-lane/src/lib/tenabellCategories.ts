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
    q: "Name 10 drivers who have won the Formula 1 World Championship",
    teaser: "World Championship winners",
    answers: [
      { name: "Hamilton" },
      { name: "Schumacher" },
      { name: "Vettel" },
      { name: "Senna" },
      { name: "Prost" },
      { name: "Lauda" },
      { name: "Stewart" },
      { name: "Clark" },
      { name: "Fangio" },
      { name: "Verstappen" },
      { name: "Rosberg", aliases: ["Nico Rosberg"] },
      { name: "Button" },
      { name: "Raikkonen", aliases: ["Räikkönen", "Kimi"] },
      { name: "Hill", aliases: ["Graham Hill", "Damon Hill"] },
      { name: "Mansell" },
      { name: "Piquet" },
      { name: "Fittipaldi" },
      { name: "Brabham" },
      { name: "Hawthorn" },
      { name: "Ascari" },
      { name: "Andretti" },
      { name: "Jones" },
      { name: "Scheckter" },
      { name: "Hunt" },
      { name: "Surtees" },
      { name: "Rindt" },
    ],
    hint: "There have been around 34 different world champions in F1 history",
    ordered: false,
  },
  {
    q: "Name 10 circuits that are on the current 2026 Formula 1 calendar",
    teaser: "2026 F1 calendar circuits",
    answers: [
      { name: "Melbourne" },
      { name: "Shanghai" },
      { name: "Suzuka" },
      { name: "Sakhir", aliases: ["Bahrain"] },
      { name: "Jeddah" },
      { name: "Miami" },
      { name: "Montreal" },
      { name: "Monaco", aliases: ["Monte Carlo"] },
      { name: "Barcelona" },
      { name: "Spielberg", aliases: ["Austria", "Red Bull Ring"] },
      { name: "Silverstone", aliases: ["Britain", "England"] },
      { name: "Spa", aliases: ["Belgium", "Spa-Francorchamps"] },
      { name: "Budapest", aliases: ["Hungaroring", "Hungary"] },
      { name: "Zandvoort", aliases: ["Netherlands", "Dutch"] },
      { name: "Monza", aliases: ["Italy", "Italian"] },
      { name: "Madrid" },
      { name: "Baku", aliases: ["Azerbaijan"] },
      { name: "Singapore" },
      { name: "Austin", aliases: ["COTA", "Circuit of the Americas"] },
      { name: "Mexico City", aliases: ["Mexico"] },
      { name: "Sao Paulo", aliases: ["Interlagos", "Brazil"] },
      { name: "Las Vegas" },
      { name: "Lusail", aliases: ["Qatar"] },
      { name: "Yas Marina", aliases: ["Abu Dhabi"] },
    ],
    hint: "There are 24 races on the 2026 F1 calendar across the world",
    ordered: false,
    kind: "circuits",
  },
  {
    q: "Name 10 drivers who have won at Monaco in Formula 1 history",
    teaser: "Monaco Grand Prix winners",
    answers: [
      { name: "Senna" },
      { name: "Schumacher" },
      { name: "Verstappen" },
      { name: "Alonso" },
      { name: "Hamilton" },
      { name: "Raikkonen", aliases: ["Räikkönen", "Kimi"] },
      { name: "Coulthard" },
      { name: "Hakkinen", aliases: ["Häkkinen"] },
      { name: "Panis" },
      { name: "Mansell" },
      { name: "Prost" },
      { name: "Lauda" },
      { name: "Stewart" },
      { name: "Hill", aliases: ["Graham Hill"] },
      { name: "Fangio" },
      { name: "Moss" },
      { name: "Trintignant" },
      { name: "Ascari" },
      { name: "Leclerc" },
      { name: "Rosberg", aliases: ["Nico Rosberg"] },
      { name: "Webber" },
    ],
    hint: "Monaco is the most prestigious race and only a select group of drivers have won there",
    ordered: false,
  },
  {
    q: "Name 10 Formula 1 teams that have won the Constructors Championship",
    teaser: "Constructors Championship winners",
    answers: [
      { name: "Ferrari" },
      { name: "Williams" },
      { name: "McLaren" },
      { name: "Mercedes" },
      { name: "Red Bull" },
      { name: "Lotus" },
      { name: "Brabham" },
      { name: "Tyrrell" },
      { name: "BRM" },
      { name: "Cooper" },
      { name: "Matra" },
      { name: "Vanwall" },
      { name: "Benetton" },
      { name: "Renault" },
      { name: "Brawn" },
    ],
    hint: "Only a small number of teams in F1 history have won the Constructors title",
    ordered: false,
    kind: "teams",
  },
  {
    q: "Name 10 countries that have produced a Formula 1 World Champion",
    teaser: "Champion-producing countries",
    answers: [
      { name: "UK", aliases: ["United Kingdom", "Britain", "Great Britain", "England"] },
      { name: "Germany" },
      { name: "Brazil" },
      { name: "France" },
      { name: "Austria" },
      { name: "Australia" },
      { name: "Finland" },
      { name: "Spain" },
      { name: "Canada" },
      { name: "South Africa" },
      { name: "New Zealand" },
      { name: "USA", aliases: ["America", "United States"] },
      { name: "Italy" },
      { name: "Argentina" },
      { name: "Netherlands", aliases: ["Holland"] },
      { name: "Sweden" },
    ],
    hint: "Drivers from many different countries have won the F1 championship across the decades",
    ordered: false,
    kind: "countries",
  },
  {
    q: "Name 10 drivers who have raced for Ferrari in Formula 1",
    teaser: "Ferrari drivers",
    answers: [
      { name: "Schumacher" },
      { name: "Lauda" },
      { name: "Prost" },
      { name: "Mansell" },
      { name: "Alonso" },
      { name: "Raikkonen", aliases: ["Räikkönen", "Kimi"] },
      { name: "Vettel" },
      { name: "Leclerc" },
      { name: "Hamilton" },
      { name: "Barrichello" },
      { name: "Irvine" },
      { name: "Massa" },
      { name: "Sainz" },
      { name: "Berger" },
      { name: "Andretti" },
      { name: "Villeneuve", aliases: ["Gilles Villeneuve"] },
      { name: "Hawthorn" },
      { name: "Ascari" },
      { name: "Fangio" },
      { name: "Fittipaldi" },
    ],
    hint: "Ferrari is the most famous team in F1 and many legendary drivers have worn the red",
    ordered: false,
  },
  {
    q: "Name 10 drivers who have raced for McLaren in Formula 1",
    teaser: "McLaren drivers",
    answers: [
      { name: "Hamilton" },
      { name: "Senna" },
      { name: "Prost" },
      { name: "Hakkinen", aliases: ["Häkkinen"] },
      { name: "Coulthard" },
      { name: "Button" },
      { name: "Raikkonen", aliases: ["Räikkönen", "Kimi"] },
      { name: "Norris" },
      { name: "Piastri" },
      { name: "Alonso" },
      { name: "Perez" },
      { name: "Hunt" },
      { name: "Fittipaldi" },
      { name: "Watson" },
      { name: "Lauda" },
      { name: "Andretti" },
      { name: "Magnussen" },
      { name: "Vandoorne" },
    ],
    hint: "McLaren has had some of the greatest drivers in F1 history behind the wheel",
    ordered: false,
  },
  {
    q: "Name 10 circuits that have hosted the British Grand Prix",
    teaser: "British Grand Prix venues",
    answers: [
      { name: "Silverstone" },
      { name: "Brands Hatch" },
      { name: "Aintree" },
      { name: "Donington Park" },
      { name: "Crystal Palace" },
      { name: "Brooklands" },
    ],
    hint: "The British GP is one of the oldest races and has been held at several different venues",
    ordered: false,
    kind: "circuits",
  },
  {
    q: "Name 10 drivers who have scored more than 50 Formula 1 race wins",
    teaser: "50+ race win club",
    answers: [
      { name: "Hamilton" },
      { name: "Schumacher" },
      { name: "Verstappen" },
      { name: "Vettel" },
      { name: "Prost" },
      { name: "Senna" },
      { name: "Alonso" },
      { name: "Mansell" },
      { name: "Clark" },
      { name: "Stewart" },
    ],
    hint: "Very few drivers in F1 history have reached the milestone of 50 or more race victories",
    ordered: false,
  },
  {
    q: "Name 10 Formula 1 engine suppliers from any era",
    teaser: "F1 engine suppliers",
    answers: [
      { name: "Mercedes" },
      { name: "Ferrari" },
      { name: "Honda" },
      { name: "Renault" },
      { name: "Ford" },
      { name: "Cosworth" },
      { name: "BMW" },
      { name: "Porsche", aliases: ["TAG Porsche"] },
      { name: "Yamaha" },
      { name: "Mugen", aliases: ["Mugen Honda"] },
      { name: "Judd" },
      { name: "Peugeot" },
      { name: "Toyota" },
      { name: "Alfa Romeo" },
      { name: "BRM" },
      { name: "Maserati" },
      { name: "Climax" },
      { name: "Repco" },
      { name: "Vanwall" },
    ],
    hint: "Many different manufacturers have supplied engines to F1 teams throughout the sport's history",
    ordered: false,
    kind: "teams",
  },
  {
    q: "Name 10 drivers who have started more than 200 Formula 1 races",
    teaser: "200+ race starts club",
    answers: [
      { name: "Raikkonen", aliases: ["Räikkönen", "Kimi"] },
      { name: "Barrichello" },
      { name: "Alonso" },
      { name: "Button" },
      { name: "Schumacher" },
      { name: "Hamilton" },
      { name: "Coulthard" },
      { name: "Patrese" },
      { name: "Massa" },
      { name: "Trulli" },
      { name: "Fisichella" },
      { name: "Verstappen" },
    ],
    hint: "Only a handful of drivers have been durable enough to start 200 or more grands prix",
    ordered: false,
  },
  {
    q: "Name 10 Formula 1 races that take place on street circuits",
    teaser: "Street circuit races",
    answers: [
      { name: "Monaco" },
      { name: "Baku" },
      { name: "Singapore" },
      { name: "Las Vegas" },
      { name: "Miami" },
      { name: "Montreal" },
      { name: "Adelaide" },
      { name: "Detroit" },
      { name: "Phoenix" },
      { name: "Valencia" },
      { name: "Jeddah" },
      { name: "Madrid" },
    ],
    hint: "Some of the most famous F1 races are held on temporary circuits through city streets",
    ordered: false,
    kind: "circuits",
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
