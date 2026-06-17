export type Category = {
  q: string;
  teaser: string;
  answers: string[];
  hint: string;
  ordered: boolean;
};

export const CATEGORIES: Category[] = [
  {
    q: "Name the top 10 drivers by all-time race wins — in order",
    teaser: "Top 10 by race wins",
    answers: ["Hamilton","Schumacher","Verstappen","Vettel","Prost","Senna","Alonso","Mansell","Clark","Stewart"],
    hint: "Start with the current record holder — think 7-time champions",
    ordered: true,
  },
  {
    q: "Name the top 10 drivers by Formula 1 World Championships — in order",
    teaser: "Top 10 by championships",
    answers: ["Hamilton","Schumacher","Fangio","Vettel","Prost","Brabham","Hill","Clark","Lauda","Piquet"],
    hint: "Two drivers share the all-time record of 7 championships",
    ordered: true,
  },
  {
    q: "Name 10 countries that have hosted a Formula 1 Grand Prix",
    teaser: "F1 host nations",
    answers: ["UK","Italy","Germany","France","USA","Brazil","Japan","Spain","Belgium","Australia","Monaco","Canada","Hungary","Austria","Netherlands","Singapore","Bahrain","Qatar","Saudi Arabia","Mexico","Azerbaijan","China"],
    hint: "Over 30 countries have hosted races across F1 history",
    ordered: false,
  },
  {
    q: "Name 10 circuits currently on the 2025 F1 calendar",
    teaser: "2025 F1 circuits",
    answers: ["Bahrain","Jeddah","Melbourne","Suzuka","Shanghai","Miami","Imola","Monaco","Montreal","Barcelona","Spielberg","Silverstone","Budapest","Spa","Zandvoort","Monza","Baku","Singapore","Austin","Mexico City","Sao Paulo","Las Vegas","Lusail","Abu Dhabi"],
    hint: "There are 24 race weekends in the 2025 season",
    ordered: false,
  },
  {
    q: "Name 10 F1 World Champions from 1990 to 2024",
    teaser: "Champions since 1990",
    answers: ["Senna","Mansell","Prost","Schumacher","Hill","Villeneuve","Häkkinen","Hakkinen","Raikkonen","Räikkönen","Alonso","Hamilton","Button","Vettel","Rosberg","Verstappen"],
    hint: "14 different drivers won the title in this period",
    ordered: false,
  },
  {
    q: "Name all 10 F1 constructors competing in the 2025 season",
    teaser: "2025 F1 teams",
    answers: ["Red Bull","McLaren","Ferrari","Mercedes","Aston Martin","Alpine","Williams","Haas","Racing Bulls","Kick Sauber","Sauber","RB"],
    hint: "Every team fields two drivers — 10 teams, 20 cars",
    ordered: false,
  },
  {
    q: "Name 10 current F1 drivers on the 2025 grid",
    teaser: "2025 F1 drivers",
    answers: ["Verstappen","Norris","Leclerc","Hamilton","Russell","Piastri","Sainz","Alonso","Stroll","Gasly","Ocon","Hulkenberg","Hulkenburg","Tsunoda","Lawson","Bearman","Hadjar","Antonelli","Doohan","Bortoleto","Albon"],
    hint: "There are 20 drivers — 10 teams × 2 seats",
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
