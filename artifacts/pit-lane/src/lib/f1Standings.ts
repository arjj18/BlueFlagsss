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

export const DRIVERS_2026: Driver[] = [
  { pos: 1,  code: "NOR", name: "Lando Norris",       team: "McLaren",      teamColor: "#FF8000", country: "GB", points: 156, wins: 3, podiums: 6 },
  { pos: 2,  code: "VER", name: "Max Verstappen",     team: "Red Bull",     teamColor: "#3671C6", country: "NL", points: 134, wins: 2, podiums: 5 },
  { pos: 3,  code: "PIA", name: "Oscar Piastri",      team: "McLaren",      teamColor: "#FF8000", country: "AU", points: 121, wins: 1, podiums: 4 },
  { pos: 4,  code: "LEC", name: "Charles Leclerc",    team: "Ferrari",      teamColor: "#E8002D", country: "MC", points: 103, wins: 1, podiums: 3 },
  { pos: 5,  code: "HAM", name: "Lewis Hamilton",     team: "Ferrari",      teamColor: "#E8002D", country: "GB", points:  89, wins: 0, podiums: 3 },
  { pos: 6,  code: "RUS", name: "George Russell",     team: "Mercedes",     teamColor: "#27F4D2", country: "GB", points:  78, wins: 0, podiums: 2 },
  { pos: 7,  code: "SAI", name: "Carlos Sainz",       team: "Williams",     teamColor: "#64C4FF", country: "ES", points:  54, wins: 0, podiums: 1 },
  { pos: 8,  code: "ANT", name: "Kimi Antonelli",     team: "Mercedes",     teamColor: "#27F4D2", country: "IT", points:  47, wins: 0, podiums: 1 },
  { pos: 9,  code: "ALO", name: "Fernando Alonso",    team: "Aston Martin", teamColor: "#358C75", country: "ES", points:  33, wins: 0, podiums: 0 },
  { pos: 10, code: "ALB", name: "Alex Albon",         team: "Williams",     teamColor: "#64C4FF", country: "TH", points:  27, wins: 0, podiums: 0 },
  { pos: 11, code: "LAW", name: "Liam Lawson",        team: "Red Bull",     teamColor: "#3671C6", country: "NZ", points:  22, wins: 0, podiums: 0 },
  { pos: 12, code: "GAS", name: "Pierre Gasly",       team: "Alpine",       teamColor: "#0093CC", country: "FR", points:  19, wins: 0, podiums: 0 },
  { pos: 13, code: "OCO", name: "Esteban Ocon",       team: "Haas",         teamColor: "#B6BABD", country: "FR", points:  14, wins: 0, podiums: 0 },
  { pos: 14, code: "TSU", name: "Yuki Tsunoda",       team: "RB",           teamColor: "#6692FF", country: "JP", points:  12, wins: 0, podiums: 0 },
  { pos: 15, code: "STR", name: "Lance Stroll",       team: "Aston Martin", teamColor: "#358C75", country: "CA", points:   9, wins: 0, podiums: 0 },
  { pos: 16, code: "HUL", name: "Nico Hülkenberg",    team: "Audi",         teamColor: "#A7A7A7", country: "DE", points:   8, wins: 0, podiums: 0 },
  { pos: 17, code: "BEA", name: "Oliver Bearman",     team: "Haas",         teamColor: "#B6BABD", country: "GB", points:   6, wins: 0, podiums: 0 },
  { pos: 18, code: "DOO", name: "Jack Doohan",        team: "Alpine",       teamColor: "#0093CC", country: "AU", points:   4, wins: 0, podiums: 0 },
  { pos: 19, code: "BOT", name: "Valtteri Bottas",    team: "Audi",         teamColor: "#A7A7A7", country: "FI", points:   3, wins: 0, podiums: 0 },
  { pos: 20, code: "HAD", name: "Isack Hadjar",       team: "RB",           teamColor: "#6692FF", country: "FR", points:   1, wins: 0, podiums: 0 },
];

export const CONSTRUCTORS_2026: Constructor[] = [
  { pos: 1, name: "McLaren",      color: "#FF8000", points: 277, wins: 4 },
  { pos: 2, name: "Ferrari",      color: "#E8002D", points: 192, wins: 1 },
  { pos: 3, name: "Red Bull",     color: "#3671C6", points: 156, wins: 2 },
  { pos: 4, name: "Mercedes",     color: "#27F4D2", points: 125, wins: 0 },
  { pos: 5, name: "Williams",     color: "#64C4FF", points:  81, wins: 0 },
  { pos: 6, name: "Aston Martin", color: "#358C75", points:  42, wins: 0 },
  { pos: 7, name: "Alpine",       color: "#0093CC", points:  23, wins: 0 },
  { pos: 8, name: "Haas",         color: "#B6BABD", points:  20, wins: 0 },
  { pos: 9, name: "RB",           color: "#6692FF", points:  13, wins: 0 },
  { pos: 10, name: "Audi",        color: "#A7A7A7", points:  11, wins: 0 },
];

export const STANDINGS_AFTER_ROUND = 7;
