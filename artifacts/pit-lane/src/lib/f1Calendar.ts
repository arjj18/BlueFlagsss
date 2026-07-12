export type Race = {
  round: number;
  name: string;
  shortName: string;
  circuit: string;
  country: string;
  date: string; // YYYY-MM-DD of race day (Sunday)
};

// Official 2026 F1 calendar (24 rounds). Note: there are TWO Spanish rounds —
// Round 9 at Barcelona-Catalunya in June and Round 16 at the new Madrid Street
// Circuit in September (subject to FIA homologation). Their shortNames differ
// ("Spanish GP" vs "Madrid GP") so UI badges never confuse the two.
export const CALENDAR_2026: Race[] = [
  { round: 1,  name: "Australian Grand Prix",     shortName: "Australian GP",   circuit: "Albert Park",                       country: "AU", date: "2026-03-08" },
  { round: 2,  name: "Chinese Grand Prix",        shortName: "Chinese GP",      circuit: "Shanghai International",            country: "CN", date: "2026-03-15" },
  { round: 3,  name: "Japanese Grand Prix",       shortName: "Japanese GP",     circuit: "Suzuka",                            country: "JP", date: "2026-03-29" },
  { round: 4,  name: "Bahrain Grand Prix",        shortName: "Bahrain GP",      circuit: "Bahrain International",             country: "BH", date: "2026-04-12" },
  { round: 5,  name: "Saudi Arabian Grand Prix",  shortName: "Saudi Arabian GP",circuit: "Jeddah Corniche",                   country: "SA", date: "2026-04-19" },
  { round: 6,  name: "Miami Grand Prix",          shortName: "Miami GP",        circuit: "Miami International",               country: "US", date: "2026-05-03" },
  { round: 7,  name: "Canadian Grand Prix",       shortName: "Canadian GP",     circuit: "Circuit Gilles Villeneuve",         country: "CA", date: "2026-05-24" },
  { round: 8,  name: "Monaco Grand Prix",         shortName: "Monaco GP",       circuit: "Circuit de Monaco",                 country: "MC", date: "2026-06-07" },
  { round: 9,  name: "Spanish Grand Prix",        shortName: "Spanish GP",      circuit: "Circuit de Barcelona-Catalunya",    country: "ES", date: "2026-06-14" },
  { round: 10, name: "Austrian Grand Prix",       shortName: "Austrian GP",     circuit: "Red Bull Ring",                     country: "AT", date: "2026-06-28" },
  { round: 11, name: "British Grand Prix",        shortName: "British GP",      circuit: "Silverstone",                       country: "GB", date: "2026-07-05" },
  { round: 12, name: "Belgian Grand Prix",        shortName: "Belgian GP",      circuit: "Spa-Francorchamps",                 country: "BE", date: "2026-07-19" },
  { round: 13, name: "Hungarian Grand Prix",      shortName: "Hungarian GP",    circuit: "Hungaroring",                       country: "HU", date: "2026-07-26" },
  { round: 14, name: "Dutch Grand Prix",          shortName: "Dutch GP",        circuit: "Circuit Zandvoort",                 country: "NL", date: "2026-08-23" },
  { round: 15, name: "Italian Grand Prix",        shortName: "Italian GP",      circuit: "Autodromo Nazionale Monza",         country: "IT", date: "2026-09-06" },
  { round: 16, name: "Spanish Grand Prix",        shortName: "Madrid GP",       circuit: "Madrid Street Circuit",             country: "ES", date: "2026-09-13" },
  { round: 17, name: "Azerbaijan Grand Prix",     shortName: "Azerbaijan GP",   circuit: "Baku City Circuit",                 country: "AZ", date: "2026-09-26" },
  { round: 18, name: "Singapore Grand Prix",      shortName: "Singapore GP",    circuit: "Marina Bay Street Circuit",         country: "SG", date: "2026-10-11" },
  { round: 19, name: "United States Grand Prix",  shortName: "US GP",           circuit: "Circuit of the Americas",           country: "US", date: "2026-10-25" },
  { round: 20, name: "Mexico City Grand Prix",    shortName: "Mexico GP",       circuit: "Autodromo Hermanos Rodriguez",      country: "MX", date: "2026-11-01" },
  { round: 21, name: "Brazilian Grand Prix",      shortName: "Brazilian GP",    circuit: "Autodromo Jose Carlos Pace",        country: "BR", date: "2026-11-08" },
  { round: 22, name: "Las Vegas Grand Prix",      shortName: "Las Vegas GP",    circuit: "Las Vegas Strip Circuit",           country: "US", date: "2026-11-21" },
  { round: 23, name: "Qatar Grand Prix",          shortName: "Qatar GP",        circuit: "Lusail International Circuit",      country: "QA", date: "2026-11-29" },
  { round: 24, name: "Abu Dhabi Grand Prix",      shortName: "Abu Dhabi GP",    circuit: "Yas Marina Circuit",                country: "AE", date: "2026-12-06" },
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
