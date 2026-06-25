export type Category = {
  q: string;
  teaser: string;
  answers: string[];
  hint: string;
  ordered: boolean;
};

export const CATEGORIES: Category[] = [
  {
    q: "Name the top 10 drivers with the most pole positions at the Hungarian Grand Prix",
    teaser: "Hungarian GP pole kings",
    answers: ["Hamilton","Schumacher","Rosberg","Senna","Mansell","Alonso","Vettel","Häkkinen","Hakkinen","Prost","Berger"],
    hint: "One driver has 8 poles here — more than double anyone else's total",
    ordered: false,
  },
  {
    q: "Name the top 10 drivers with the most wins at the Monaco Grand Prix",
    teaser: "Monaco Grand Prix winners",
    answers: ["Senna","Schumacher","Hill","Prost","Stewart","Hamilton","Rosberg","Moss","Coulthard","Fangio","Verstappen"],
    hint: "The all-time record holder won here 6 times in 7 seasons",
    ordered: false,
  },
  {
    q: "Name the top 10 drivers with the most career fastest laps in Formula 1",
    teaser: "Most career fastest laps",
    answers: ["Schumacher","Hamilton","Räikkönen","Raikkonen","Prost","Vettel","Verstappen","Mansell","Clark","Alonso","Senna"],
    hint: "The all-time record is 77 fastest laps — held by a 7-time champion",
    ordered: false,
  },
  {
    q: "Name the top 10 drivers to have won their Formula 1 debut race",
    teaser: "Debut race winners",
    answers: ["Baghetti","Farina","Fagioli","Taruffi","Reutemann","Pérez","Perez","Gasly","Verstappen","Leclerc","Button"],
    hint: "Giancarlo Baghetti is the most famous — he won his 1961 French GP debut",
    ordered: false,
  },
  {
    q: "Name the top 10 teams with the most wins in a single Formula 1 season",
    teaser: "Most wins in a season — teams",
    answers: ["Red Bull","Mercedes","Ferrari","McLaren","Williams","Benetton","Lotus","Renault","Brawn","Cooper"],
    hint: "Red Bull set the all-time record with 21 wins from 22 races in 2023",
    ordered: false,
  },
  {
    q: "Name the top 10 drivers who have driven for the most different Formula 1 teams",
    teaser: "Most teams driven for",
    answers: ["Moss","Salo","Alesi","Trulli","Fisichella","Barrichello","Heidfeld","Warwick","Brundle","Diniz","Massa","Frentzen"],
    hint: "Stirling Moss raced for 7 different constructors in the 1950s and 60s",
    ordered: false,
  },
  {
    q: "Name the top 10 circuits that have hosted the most Formula 1 Grands Prix",
    teaser: "Circuits with most GPs hosted",
    answers: ["Monaco","Monte Carlo","Monza","Italy","Silverstone","Britain","England","Spa","Belgium","Nürburgring","Nurburg","Nurburgring","Germany","Interlagos","Brazil","Hungaroring","Hungary","Budapest","Montreal","Canada","Hockenheim","Suzuka","Japan"],
    hint: "Monaco and Monza have both hosted over 70 championship races each",
    ordered: false,
  },
  {
    q: "Name the top 10 drivers with the most podiums without a single race win in Formula 1",
    teaser: "Most podiums without a win",
    answers: ["Heidfeld","Brundle","Warwick","de Cesaris","Cheever","Salo","Bellof","Jarier","Glock","Bonnier","Watson","Boutsen"],
    hint: "Nick Heidfeld leads this list with 13 podiums and zero wins across his career",
    ordered: false,
  },
  {
    q: "Name the top 10 circuits on which Formula 1 has raced most often — specifically the Italian Grand Prix at Monza",
    teaser: "Italian GP — Monza winners",
    answers: ["Schumacher","Hamilton","Ascari","Clark","Prost","Vettel","Senna","Fangio","Lauda","Alonso","Verstappen","Leclerc"],
    hint: "Michael Schumacher and Lewis Hamilton share the record with 5 wins each at Monza",
    ordered: false,
  },
  {
    q: "Name the top 10 drivers who started from outside the top 10 on the grid and still went on to win the race",
    teaser: "Won from outside the top 10",
    answers: ["Watson","Hamilton","Schumacher","Räikkönen","Raikkonen","Ricciardo","Barrichello","Button","Alonso","Perez","Pérez","Piquet","Villeneuve"],
    hint: "John Watson famously won the 1983 Long Beach GP starting from 22nd on the grid",
    ordered: false,
  },
  {
    q: "Name the top 10 drivers with the most championship points scored in a single Formula 1 season",
    teaser: "Most points in a season — drivers",
    answers: ["Verstappen","Hamilton","Vettel","Rosberg","Norris","Leclerc","Pérez","Perez","Piastri","Bottas","Alonso","Russell","Sainz"],
    hint: "Max Verstappen shattered the record in 2023, finishing with 575 points",
    ordered: false,
  },
  {
    q: "Name the top 10 nationalities with the most combined Formula 1 World Championship titles",
    teaser: "Nationalities with most F1 titles",
    answers: ["British","Britain","UK","England","German","Germany","Brazilian","Brazil","Argentine","Argentina","French","France","Austrian","Austria","Australian","Australia","Dutch","Netherlands","Holland","Finnish","Finland","Spanish","Spain"],
    hint: "British drivers have won more championships than any other nation — over 15 combined titles",
    ordered: false,
  },
  {
    q: "Name the top 10 drivers with the most laps led in their Formula 1 career",
    teaser: "Most career laps led",
    answers: ["Hamilton","Schumacher","Senna","Prost","Verstappen","Vettel","Clark","Mansell","Lauda","Fangio","Piquet","Stewart"],
    hint: "Lewis Hamilton leads this list by a wide margin with over 5,000 laps led",
    ordered: false,
  },
  {
    q: "Name the top 10 youngest drivers to score their first ever Formula 1 championship point",
    teaser: "Youngest to score first F1 point",
    answers: ["Verstappen","Kvyat","Sainz","Leclerc","Norris","Ricciardo","Webber","Hamilton","Vettel","Alonso","Räikkönen","Raikkonen","Stroll","Piastri"],
    hint: "Max Verstappen was just 17 years and 180 days old when he scored his first point on debut",
    ordered: false,
  },
  {
    q: "Name the top 10 drivers with the most wins at the British Grand Prix at Silverstone",
    teaser: "British GP — Silverstone winners",
    answers: ["Hamilton","Clark","Mansell","Prost","Schumacher","Hill","Senna","Coulthard","Piquet","Stewart","Alonso","Vettel"],
    hint: "Lewis Hamilton has won at Silverstone more than anyone — 9 times in total",
    ordered: false,
  },
  {
    q: "Name the top 10 drivers who competed in the most Formula 1 races without ever winning one",
    teaser: "Most starts without a win",
    answers: ["de Cesaris","Cesaris","Heidfeld","Brundle","Warwick","Jarier","Cheever","Salo","Katayama","Glock","Bonnier","Diniz","Alliot","Frentzen","Winkelhock"],
    hint: "Andrea de Cesaris started 208 races and never stood on the top step of the podium",
    ordered: false,
  },
  {
    q: "Name the top 10 seasons in Formula 1 history with the most different race winners",
    teaser: "Most different winners in a season",
    answers: ["1982","1977","1975","2012","2019","1983","1978","1985","1958","2009","2010","2003"],
    hint: "In 1982, 11 different drivers won races across just 16 rounds — a chaotic classic season",
    ordered: false,
  },
  {
    q: "Name 10 drivers who have competed in the most Formula 1 World Championship races in their career — career starts leaders",
    teaser: "Most career race starts",
    answers: ["Räikkönen","Raikkonen","Alonso","Hamilton","Barrichello","Schumacher","Button","Vettel","Massa","Trulli","Coulthard","Fisichella","Webber","Alesi"],
    hint: "Kimi Räikkönen started 349 races — a record at the time of his retirement in 2021",
    ordered: false,
  },
  {
    q: "Name the top 10 drivers with the most career pole positions in Formula 1 history",
    teaser: "Most career pole positions",
    answers: ["Hamilton","Schumacher","Senna","Vettel","Verstappen","Prost","Clark","Mansell","Fangio","Häkkinen","Hakkinen","Lauda","Rosberg","Alonso"],
    hint: "Lewis Hamilton holds the all-time record with over 100 career pole positions",
    ordered: false,
  },
  {
    q: "Name the top 10 Formula 1 drivers who have also won the Le Mans 24 Hours at some point in their career",
    teaser: "F1 drivers who won Le Mans",
    answers: ["Ickx","Hawthorn","Hill","Gurney","Siffert","Herbert","Webber","Hülkenberg","Hulkenberg","Alonso","Mass","Josse","Buemi","Hartley","Brendon Hartley"],
    hint: "Jacky Ickx won Le Mans 6 times and is considered the greatest endurance racer in F1 history",
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
