// Global F1 search database used by the reusable autocomplete component.
// Entries are deduplicated per category so the dropdown never shows the same
// item twice (the raw lists contain some intentional/historical duplicates).

export type F1Category = 'drivers' | 'teams' | 'circuits' | 'engines' | 'countries';

const drivers: string[] = [
  // Current drivers
  'Max Verstappen', 'Lewis Hamilton', 'Charles Leclerc', 'Lando Norris',
  'Carlos Sainz', 'George Russell', 'Fernando Alonso', 'Oscar Piastri',
  'Lance Stroll', 'Esteban Ocon', 'Pierre Gasly', 'Valtteri Bottas',
  'Zhou Guanyu', 'Kevin Magnussen', 'Nico Hulkenberg', 'Yuki Tsunoda',
  'Daniel Ricciardo', 'Nyck de Vries', 'Logan Sargeant', 'Alexander Albon',
  'Franco Colapinto', 'Oliver Bearman', 'Kimi Antonelli', 'Jack Doohan',
  'Isack Hadjar', 'Liam Lawson', 'Gabriel Bortoleto', 'Arvid Lindblad',

  // Legends and historical drivers
  'Ayrton Senna', 'Michael Schumacher', 'Alain Prost', 'Nigel Mansell',
  'Jackie Stewart', 'Jim Clark', 'Juan Manuel Fangio', 'Niki Lauda',
  'Nelson Piquet', 'Jenson Button', 'Kimi Räikkönen', 'Nico Rosberg',
  'Sebastian Vettel', 'Rubens Barrichello', 'Felipe Massa', 'Mark Webber',
  'David Coulthard', 'Mika Häkkinen', 'Damon Hill', 'Jacques Villeneuve',
  'Ralf Schumacher', 'Heinz-Harald Frentzen', 'Eddie Irvine', 'Giancarlo Fisichella',
  'Romain Grosjean', 'Sergio Perez', 'Robert Kubica', 'Pastor Maldonado',
  'Vitaly Petrov', 'Heikki Kovalainen', 'Jarno Trulli', 'Timo Glock',
  'Adrian Sutil', 'Nick Heidfeld', 'Emerson Fittipaldi', 'Mario Andretti',
  'Jochen Rindt', 'Graham Hill', 'Jack Brabham', 'John Surtees',
  'Mike Hawthorn', 'Giuseppe Farina', 'Alberto Ascari', 'Stirling Moss',
  'Gilles Villeneuve', 'Ronnie Peterson', 'James Hunt', 'Carlos Reutemann',
  'Riccardo Patrese', 'Michele Alboreto', 'Gerhard Berger', 'Derek Warwick',
  'Martin Brundle', 'Johnny Herbert', 'Jos Verstappen', 'Olivier Panis',
  'Jean Alesi', 'Michael Andretti', 'Eddie Cheever', 'Thierry Boutsen',
  'Stefan Johansson', 'Elio de Angelis', 'Rene Arnoux', 'Patrick Tambay',
  'Bruno Senna', 'Anthony Davidson', 'Takuma Sato',
  'Tiago Monteiro', 'Christijan Albers', 'Scott Speed', 'Vitantonio Liuzzi',
  'Sebastien Bourdais', 'Narain Karthikeyan', 'Ho-Pin Tung', 'Ma Qing Hua',

  // Recent drivers
  'Stoffel Vandoorne', 'Pascal Wehrlein', 'Jolyon Palmer', 'Rio Haryanto',
  'Marcus Ericsson', 'Roberto Merhi', 'Will Stevens', 'Max Chilton',
  'Charles Pic', 'Kamui Kobayashi',
  'Antonio Giovinazzi', 'Mick Schumacher', 'Nikita Mazepin', 'Callum Ilott',
  'Roy Nissany', 'Pietro Fittipaldi', 'Devlin DeFrancesco', 'Nicholas Latifi',
];

const teams: string[] = [
  // Current teams
  'Red Bull Racing', 'Ferrari', 'McLaren', 'Mercedes', 'Aston Martin',
  'Alpine', 'Williams', 'Racing Bulls', 'Haas', 'Kick Sauber',

  // Historic team names
  'Toro Rosso', 'AlphaTauri', 'Force India', 'Racing Point', 'Sahara Force India',
  'Lotus', 'Lotus F1 Team', 'Caterham', 'HRT', 'Virgin Racing', 'Marussia',
  'Manor', 'Renault', 'Jaguar', 'BAR', 'British American Racing', 'Toyota',
  'Honda', 'Super Aguri', 'Spyker', 'MF1', 'Jordan', 'Minardi', 'Arrows',
  'Prost', 'Stewart', 'Tyrrell', 'Benetton', 'Brabham', 'March',
  'Ligier', 'Footwork', 'Leyton House', 'Dallara', 'Pacific', 'Simtek',
  'Fondmetal', 'Andrea Moda', 'Osella', 'Coloni', 'EuroBrun', 'Life',
  'Brawn GP', 'BAR Honda', 'Sauber', 'Alfa Romeo', 'BRM', 'Cooper',
  'Matra', 'Wolf', 'Hesketh', 'Shadow', 'Ensign', 'Fittipaldi',
  'Toleman', 'Spirit', 'ATS', 'RAM', 'Theodore', 'Tecno',
];

const circuits: string[] = [
  // Current calendar circuits with full names
  'Bahrain Grand Prix', 'Saudi Arabian Grand Prix', 'Australian Grand Prix',
  'Japanese Grand Prix', 'Chinese Grand Prix', 'Miami Grand Prix',
  'Emilia Romagna Grand Prix', 'Monaco Grand Prix', 'Canadian Grand Prix',
  'Spanish Grand Prix', 'Austrian Grand Prix', 'British Grand Prix',
  'Hungarian Grand Prix', 'Belgian Grand Prix', 'Dutch Grand Prix',
  'Italian Grand Prix', 'Azerbaijan Grand Prix', 'Singapore Grand Prix',
  'United States Grand Prix', 'Mexico City Grand Prix', 'Brazilian Grand Prix',
  'Las Vegas Grand Prix', 'Qatar Grand Prix', 'Abu Dhabi Grand Prix',

  // Circuit names as well as Grand Prix names
  'Bahrain International Circuit', 'Jeddah Corniche Circuit',
  'Albert Park Circuit', 'Suzuka International Racing Course',
  'Shanghai International Circuit', 'Miami International Autodrome',
  'Autodromo Enzo e Dino Ferrari', 'Circuit de Monaco',
  'Circuit Gilles Villeneuve', 'Circuit de Barcelona-Catalunya',
  'Red Bull Ring', 'Silverstone Circuit', 'Hungaroring',
  'Circuit de Spa-Francorchamps', 'Circuit Zandvoort',
  'Autodromo Nazionale Monza', 'Baku City Circuit',
  'Marina Bay Street Circuit', 'Circuit of the Americas',
  'Autodromo Hermanos Rodriguez', 'Autodromo Jose Carlos Pace',
  'Las Vegas Strip Circuit', 'Losail International Circuit',
  'Yas Marina Circuit',

  // Common shorthand names fans use
  'Bahrain', 'Jeddah', 'Melbourne', 'Suzuka', 'Shanghai', 'Miami',
  'Imola', 'Monaco', 'Montreal', 'Barcelona', 'Spielberg', 'Silverstone',
  'Budapest', 'Spa', 'Zandvoort', 'Monza', 'Baku', 'Singapore',
  'Austin', 'COTA', 'Mexico City', 'Sao Paulo', 'Interlagos',
  'Las Vegas', 'Lusail', 'Abu Dhabi', 'Yas Marina',

  // Historic circuits
  'Nurburgring', 'Hockenheim', 'Hockenheimring', 'Magny-Cours',
  'A1 Ring', 'Indianapolis Motor Speedway', 'Detroit Street Circuit',
  'Dallas Street Circuit', 'Long Beach Street Circuit', 'Watkins Glen',
  'Mosport', 'Brands Hatch', 'Donington Park', 'Aintree',
  'Sebring', 'Riverside', 'Phoenix Street Circuit', 'Caesars Palace',
  'Kyalami', 'Buenos Aires', 'Jerez', 'Estoril', 'Jarama',
  'Dijon', 'Paul Ricard', 'Clermont-Ferrand', 'Rouen',
  'Pescara', 'Ain-Diab', 'Monsanto', 'Oporto', 'Boavista',
  'Zeltweg', 'Nivelles', 'Zolder', 'Charade', 'Reims',
  'Fuji Speedway', 'Sepang International Circuit', 'Sepang',
  'Istanbul Park', 'Valencia Street Circuit', 'Sochi Autodrom',
  'Sochi', 'Portimao', 'Algarve International Circuit',
  'Mugello', 'Bahrain Outer Circuit', 'Nurburgring Nordschleife',
];

const engines: string[] = [
  // Current engine suppliers
  'Mercedes Engine', 'Ferrari Engine', 'Red Bull Powertrains', 'Honda RBPT',
  'Renault Engine', 'Alpine Engine', 'Ford Engine',

  // Historic engine suppliers
  'Honda', 'Renault', 'Mercedes', 'Ferrari', 'Ford Cosworth',
  'Ford Cosworth DFV', 'TAG Porsche', 'BMW', 'Mugen Honda',
  'Judd', 'Yamaha', 'Subaru', 'Hart', 'Lamborghini', 'Peugeot',
  'Mecachrome', 'Supertec', 'Asiatech', 'Cosworth', 'Toyota Engine',
  'BMW Sauber', 'Ilmor', 'Repco', 'Climax', 'BRM Engine',
  'Maserati Engine', 'Alfa Romeo Engine', 'Vanwall', 'Weslake',
];

// Nationalities (and the matching country names fans use interchangeably) for
// quiz/category rounds that ask for countries rather than drivers or teams.
const countries: string[] = [
  'British', 'Britain', 'United Kingdom', 'UK', 'England', 'English',
  'German', 'Germany', 'Brazilian', 'Brazil', 'Argentine', 'Argentina',
  'French', 'France', 'Austrian', 'Austria', 'Australian', 'Australia',
  'Dutch', 'Netherlands', 'Holland', 'Finnish', 'Finland', 'Italian', 'Italy',
  'Spanish', 'Spain', 'American', 'United States', 'USA', 'Canadian', 'Canada',
  'Mexican', 'Mexico', 'Belgian', 'Belgium', 'Swedish', 'Sweden', 'Swiss',
  'Switzerland', 'Japanese', 'Japan', 'Monegasque', 'Monaco', 'Thai', 'Thailand',
  'Danish', 'Denmark', 'Polish', 'Poland', 'Russian', 'Russia', 'New Zealand',
  'New Zealander', 'South African', 'South Africa', 'Colombian', 'Colombia',
  'Venezuelan', 'Venezuela', 'Indian', 'India', 'Chinese', 'China', 'Irish',
  'Ireland', 'Portuguese', 'Portugal', 'Hungarian', 'Hungary', 'Czech',
  'Czech Republic', 'Indonesian', 'Indonesia', 'Malaysian', 'Malaysia',
];

const dedupe = (arr: string[]): string[] => Array.from(new Set(arr));

export const F1_DATABASE: Record<F1Category, string[]> = {
  drivers: dedupe(drivers),
  teams: dedupe(teams),
  circuits: dedupe(circuits),
  engines: dedupe(engines),
  countries: dedupe(countries),
};

export type F1SearchResult = { item: string; category: F1Category };

/**
 * Search the F1 database across the given categories.
 * - Requires at least 2 characters.
 * - Matches are case-insensitive substring matches.
 * - Items that start with the query are sorted first, then alphabetically.
 * - Returns at most `limit` results (default 8).
 */
export function searchF1(
  query: string,
  categories: F1Category[],
  limit = 8,
): F1SearchResult[] {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const lower = trimmed.toLowerCase();
  const results: F1SearchResult[] = [];

  for (const cat of categories) {
    for (const item of F1_DATABASE[cat] ?? []) {
      if (item.toLowerCase().includes(lower)) {
        results.push({ item, category: cat });
      }
    }
  }

  results.sort((a, b) => {
    const aStarts = a.item.toLowerCase().startsWith(lower);
    const bStarts = b.item.toLowerCase().startsWith(lower);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    return a.item.localeCompare(b.item);
  });

  return results.slice(0, limit);
}
