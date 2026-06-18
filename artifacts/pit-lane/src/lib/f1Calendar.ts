export type Race = {
  round: number;
  name: string;
  shortName: string;
  circuit: string;
  country: string;
  date: string; // YYYY-MM-DD of race day (Sunday)
};

export const CALENDAR_2026: Race[] = [
  { round: 1,  name: "Bahrain Grand Prix",        shortName: "Bahrain GP",     circuit: "Bahrain International Circuit", country: "BH", date: "2026-03-01" },
  { round: 2,  name: "Saudi Arabian Grand Prix",  shortName: "Saudi Arabia GP",circuit: "Jeddah Corniche Circuit",       country: "SA", date: "2026-03-15" },
  { round: 3,  name: "Australian Grand Prix",     shortName: "Australian GP",  circuit: "Albert Park Circuit",           country: "AU", date: "2026-03-22" },
  { round: 4,  name: "Japanese Grand Prix",       shortName: "Japanese GP",    circuit: "Suzuka Circuit",                country: "JP", date: "2026-04-05" },
  { round: 5,  name: "Chinese Grand Prix",        shortName: "Chinese GP",     circuit: "Shanghai International Circuit",country: "CN", date: "2026-04-19" },
  { round: 6,  name: "Miami Grand Prix",          shortName: "Miami GP",       circuit: "Miami International Autodrome", country: "US", date: "2026-05-03" },
  { round: 7,  name: "Monaco Grand Prix",         shortName: "Monaco GP",      circuit: "Circuit de Monaco",             country: "MC", date: "2026-05-24" },
  { round: 8,  name: "Austrian Grand Prix",       shortName: "Austrian GP",    circuit: "Red Bull Ring",                 country: "AT", date: "2026-06-28" },
  { round: 9,  name: "British Grand Prix",        shortName: "British GP",     circuit: "Silverstone Circuit",           country: "GB", date: "2026-07-05" },
  { round: 10, name: "Belgian Grand Prix",        shortName: "Belgian GP",     circuit: "Circuit de Spa-Francorchamps",  country: "BE", date: "2026-07-26" },
  { round: 11, name: "Hungarian Grand Prix",      shortName: "Hungarian GP",   circuit: "Hungaroring",                   country: "HU", date: "2026-08-02" },
  { round: 12, name: "Dutch Grand Prix",          shortName: "Dutch GP",       circuit: "Circuit Zandvoort",             country: "NL", date: "2026-08-30" },
  { round: 13, name: "Italian Grand Prix",        shortName: "Italian GP",     circuit: "Autodromo Nazionale Monza",     country: "IT", date: "2026-09-06" },
  { round: 14, name: "Azerbaijan Grand Prix",     shortName: "Azerbaijan GP",  circuit: "Baku City Circuit",             country: "AZ", date: "2026-09-20" },
  { round: 15, name: "Singapore Grand Prix",      shortName: "Singapore GP",   circuit: "Marina Bay Street Circuit",     country: "SG", date: "2026-10-04" },
  { round: 16, name: "United States Grand Prix",  shortName: "US GP",          circuit: "Circuit of the Americas",       country: "US", date: "2026-10-18" },
  { round: 17, name: "Mexico City Grand Prix",    shortName: "Mexico GP",      circuit: "Autodromo Hermanos Rodriguez",  country: "MX", date: "2026-11-01" },
  { round: 18, name: "São Paulo Grand Prix",      shortName: "Brazil GP",      circuit: "Autodromo Jose Carlos Pace",    country: "BR", date: "2026-11-08" },
  { round: 19, name: "Las Vegas Grand Prix",      shortName: "Las Vegas GP",   circuit: "Las Vegas Strip Circuit",       country: "US", date: "2026-11-21" },
  { round: 20, name: "Qatar Grand Prix",          shortName: "Qatar GP",       circuit: "Lusail International Circuit",  country: "QA", date: "2026-11-29" },
  { round: 21, name: "Abu Dhabi Grand Prix",      shortName: "Abu Dhabi GP",   circuit: "Yas Marina Circuit",            country: "AE", date: "2026-12-06" },
];

export type RaceStatus =
  | { kind: "upcoming"; race: Race; daysUntil: number }
  | { kind: "weekend"; race: Race }
  | { kind: "offseason" };

export function getCurrentRaceStatus(): RaceStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const race of CALENDAR_2026) {
    const raceDay = new Date(race.date);
    raceDay.setHours(0, 0, 0, 0);

    // Race weekend = Thursday → Sunday (race day - 3 to race day)
    const thursday = new Date(raceDay);
    thursday.setDate(raceDay.getDate() - 3);

    if (today >= thursday && today <= raceDay) {
      return { kind: "weekend", race };
    }

    if (today < raceDay) {
      const daysUntil = Math.ceil((raceDay.getTime() - today.getTime()) / 86_400_000);
      return { kind: "upcoming", race, daysUntil };
    }
  }

  return { kind: "offseason" };
}
