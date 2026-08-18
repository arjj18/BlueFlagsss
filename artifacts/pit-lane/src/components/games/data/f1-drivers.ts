/**
 * F1 Grid Game - Driver Database
 * Comprehensive database of F1 drivers with criteria tags
 */

export interface Driver {
  name: string;
  tags: string[];
}

export const DRIVERS: Driver[] = [
  {
    name: 'Lewis Hamilton',
    tags: ['drove-mclaren', 'drove-mercedes', 'drove-ferrari', 'won-championship', 'won-monaco', 'won-monza', 'won-silverstone', 'won-spa', 'won-suzuka', 'british', 'raced-2000s', 'raced-2010s', 'raced-2026', '100-races', '200-races', '10-wins', '30-wins', 'pole-position', 'fastest-lap', 'podium']
  },
  {
    name: 'Michael Schumacher',
    tags: ['drove-ferrari', 'drove-benetton', 'drove-mercedes', 'won-championship', 'won-monaco', 'won-monza', 'won-silverstone', 'won-spa', 'won-suzuka', 'german', 'raced-1990s', 'raced-2000s', 'raced-2010s', '100-races', '200-races', '10-wins', '30-wins', 'pole-position', 'fastest-lap', 'podium']
  },
  {
    name: 'Max Verstappen',
    tags: ['drove-toro-rosso', 'drove-red-bull', 'won-championship', 'won-monaco', 'won-monza', 'won-silverstone', 'won-spa', 'won-suzuka', 'dutch', 'raced-2010s', 'raced-2026', '100-races', '200-races', '10-wins', '30-wins', 'pole-position', 'fastest-lap', 'podium']
  },
  {
    name: 'Ayrton Senna',
    tags: ['drove-toleman', 'drove-lotus', 'drove-mclaren', 'drove-williams', 'won-championship', 'won-monaco', 'won-monza', 'won-silverstone', 'won-spa', 'won-suzuka', 'brazilian', 'raced-1980s', 'raced-1990s', '100-races', '10-wins', '30-wins', 'pole-position', 'fastest-lap', 'podium']
  },
  {
    name: 'Alain Prost',
    tags: ['drove-renault', 'drove-mclaren', 'drove-ferrari', 'drove-williams', 'won-championship', 'won-monaco', 'won-monza', 'won-silverstone', 'won-spa', 'french', 'raced-1980s', 'raced-1990s', '100-races', '10-wins', '30-wins', 'pole-position', 'fastest-lap', 'podium']
  },
  {
    name: 'Sebastian Vettel',
    tags: ['drove-bmw-sauber', 'drove-toro-rosso', 'drove-red-bull', 'drove-ferrari', 'drove-aston-martin', 'won-championship', 'won-monaco', 'won-monza', 'won-silverstone', 'won-spa', 'won-suzuka', 'german', 'raced-2000s', 'raced-2010s', '100-races', '200-races', '10-wins', '30-wins', 'pole-position', 'fastest-lap', 'podium']
  },
  {
    name: 'Fernando Alonso',
    tags: ['drove-minardi', 'drove-renault', 'drove-mclaren', 'drove-ferrari', 'drove-alpine', 'drove-aston-martin', 'won-championship', 'won-monaco', 'won-monza', 'won-silverstone', 'won-spa', 'won-suzuka', 'spanish', 'raced-2000s', 'raced-2010s', 'raced-2026', '100-races', '200-races', '10-wins', '30-wins', 'pole-position', 'fastest-lap', 'podium']
  },
  {
    name: 'Niki Lauda',
    tags: ['drove-ferrari', 'drove-brabham', 'drove-mclaren', 'won-championship', 'won-monza', 'won-spa', 'austrian', 'raced-1970s', 'raced-1980s', '100-races', '10-wins', 'pole-position', 'fastest-lap', 'podium']
  },
  {
    name: 'Kimi Raikkonen',
    tags: ['drove-sauber', 'drove-mclaren', 'drove-ferrari', 'drove-lotus', 'drove-alfa-romeo', 'won-championship', 'won-monaco', 'won-monza', 'won-silverstone', 'won-spa', 'won-suzuka', 'finnish', 'raced-2000s', 'raced-2010s', '100-races', '200-races', '10-wins', '30-wins', 'pole-position', 'fastest-lap', 'podium']
  },
  {
    name: 'Nigel Mansell',
    tags: ['drove-lotus', 'drove-williams', 'drove-ferrari', 'drove-mclaren', 'won-championship', 'won-monaco', 'won-monza', 'won-silverstone', 'won-spa', 'british', 'raced-1980s', 'raced-1990s', '100-races', '10-wins', '30-wins', 'pole-position', 'fastest-lap', 'podium']
  },
  {
    name: 'Jackie Stewart',
    tags: ['drove-brm', 'drove-matra', 'drove-tyrrell', 'won-championship', 'won-monaco', 'won-spa', 'won-silverstone', 'british', 'raced-1960s', 'raced-1970s', '100-races', '10-wins', 'pole-position', 'fastest-lap', 'podium']
  },
  {
    name: 'Jim Clark',
    tags: ['drove-lotus', 'won-championship', 'won-monza', 'won-silverstone', 'won-spa', 'british', 'raced-1960s', '10-wins', 'pole-position', 'fastest-lap', 'podium']
  },
  {
    name: 'Juan Manuel Fangio',
    tags: ['drove-alfa-romeo', 'drove-maserati', 'drove-mercedes', 'drove-ferrari', 'won-championship', 'won-monaco', 'won-monza', 'won-spa', 'argentinian', 'raced-before-1970', '10-wins', 'pole-position', 'fastest-lap', 'podium']
  },
  {
    name: 'Jenson Button',
    tags: ['drove-williams', 'drove-benetton', 'drove-renault', 'drove-bar', 'drove-honda', 'drove-brawn', 'drove-mclaren', 'won-championship', 'won-monaco', 'won-spa', 'british', 'raced-2000s', 'raced-2010s', '100-races', '200-races', '10-wins', 'pole-position', 'fastest-lap', 'podium']
  },
  {
    name: 'Nico Rosberg',
    tags: ['drove-williams', 'drove-mercedes', 'won-championship', 'won-monaco', 'won-silverstone', 'won-spa', 'german', 'raced-2000s', 'raced-2010s', '100-races', '200-races', '10-wins', 'pole-position', 'fastest-lap', 'podium']
  },
  {
    name: 'Mika Hakkinen',
    tags: ['drove-lotus', 'drove-mclaren', 'won-championship', 'won-monaco', 'won-monza', 'won-spa', 'finnish', 'raced-1990s', 'raced-2000s', '100-races', '10-wins', 'pole-position', 'fastest-lap', 'podium']
  },
  {
    name: 'Damon Hill',
    tags: ['drove-williams', 'drove-arrows', 'drove-jordan', 'won-championship', 'won-monaco', 'won-silverstone', 'won-spa', 'british', 'raced-1990s', '100-races', '10-wins', 'pole-position', 'fastest-lap', 'podium']
  },
  {
    name: 'David Coulthard',
    tags: ['drove-williams', 'drove-mclaren', 'drove-red-bull', 'won-monaco', 'won-monza', 'won-silverstone', 'won-spa', 'british', 'raced-1990s', 'raced-2000s', '100-races', '200-races', '10-wins', 'pole-position', 'fastest-lap', 'podium']
  },
  {
    name: 'Rubens Barrichello',
    tags: ['drove-jordan', 'drove-ferrari', 'drove-honda', 'drove-brawn', 'drove-williams', 'won-monza', 'won-silverstone', 'won-spa', 'brazilian', 'raced-1990s', 'raced-2000s', 'raced-2010s', '100-races', '200-races', '10-wins', 'pole-position', 'fastest-lap', 'podium']
  },
  {
    name: 'Charles Leclerc',
    tags: ['drove-sauber', 'drove-ferrari', 'won-monaco', 'won-monza', 'won-spa', 'monegasque', 'raced-2010s', 'raced-2026', '100-races', '10-wins', 'pole-position', 'fastest-lap', 'podium']
  },
  {
    name: 'Lando Norris',
    tags: ['drove-mclaren', 'won-monaco', 'won-silverstone', 'won-spa', 'british', 'raced-2010s', 'raced-2026', '100-races', '10-wins', 'pole-position', 'fastest-lap', 'podium']
  },
  {
    name: 'Carlos Sainz',
    tags: ['drove-toro-rosso', 'drove-renault', 'drove-mclaren', 'drove-ferrari', 'drove-williams', 'won-monaco', 'won-monza', 'won-silverstone', 'spanish', 'raced-2010s', 'raced-2026', '100-races', '10-wins', 'pole-position', 'fastest-lap', 'podium']
  },
  {
    name: 'George Russell',
    tags: ['drove-williams', 'drove-mercedes', 'won-silverstone', 'won-spa', 'british', 'raced-2010s', 'raced-2026', '100-races', 'pole-position', 'fastest-lap', 'podium']
  },
  {
    name: 'Oscar Piastri',
    tags: ['drove-mclaren', 'won-monaco', 'won-monza', 'australian', 'raced-2026', 'podium', 'pole-position', 'fastest-lap']
  },
  {
    name: 'Pierre Gasly',
    tags: ['drove-toro-rosso', 'drove-red-bull', 'drove-alphatauri', 'drove-alpine', 'won-monza', 'french', 'raced-2010s', 'raced-2026', '100-races', 'podium', 'pole-position', 'fastest-lap']
  },
  {
    name: 'Valtteri Bottas',
    tags: ['drove-williams', 'drove-mercedes', 'drove-alfa-romeo', 'drove-sauber', 'won-silverstone', 'won-monza', 'won-spa', 'finnish', 'raced-2010s', 'raced-2026', '100-races', '200-races', '10-wins', 'pole-position', 'fastest-lap', 'podium']
  },
  {
    name: 'Felipe Massa',
    tags: ['drove-sauber', 'drove-ferrari', 'drove-williams', 'won-monza', 'won-spa', 'won-silverstone', 'brazilian', 'raced-2000s', 'raced-2010s', '100-races', '200-races', '10-wins', 'pole-position', 'fastest-lap', 'podium']
  },
  {
    name: 'Mark Webber',
    tags: ['drove-minardi', 'drove-jaguar', 'drove-williams', 'drove-red-bull', 'won-monaco', 'won-monza', 'won-silverstone', 'won-spa', 'australian', 'raced-2000s', 'raced-2010s', '100-races', '10-wins', 'pole-position', 'fastest-lap', 'podium']
  },
  {
    name: 'Sergio Perez',
    tags: ['drove-sauber', 'drove-mclaren', 'drove-force-india', 'drove-racing-point', 'drove-red-bull', 'drove-cadillac', 'won-monaco', 'won-monza', 'won-spa', 'mexican', 'raced-2010s', 'raced-2026', '100-races', '200-races', '10-wins', 'pole-position', 'fastest-lap', 'podium']
  },
  {
    name: 'Jacques Villeneuve',
    tags: ['drove-williams', 'drove-bar', 'drove-renault', 'won-championship', 'won-monza', 'won-silverstone', 'won-spa', 'canadian', 'raced-1990s', 'raced-2000s', '100-races', '10-wins', 'pole-position', 'fastest-lap', 'podium']
  },
  {
    name: 'Gilles Villeneuve',
    tags: ['drove-ferrari', 'won-monaco', 'won-monza', 'canadian', 'raced-1970s', 'raced-1980s', 'podium', 'pole-position', 'fastest-lap']
  },
  {
    name: 'Nelson Piquet',
    tags: ['drove-brabham', 'drove-williams', 'drove-lotus', 'drove-benetton', 'won-championship', 'won-monza', 'won-spa', 'brazilian', 'raced-1970s', 'raced-1980s', 'raced-1990s', '100-races', '10-wins', '30-wins', 'pole-position', 'fastest-lap', 'podium']
  },
  {
    name: 'Emerson Fittipaldi',
    tags: ['drove-lotus', 'drove-mclaren', 'drove-copersucar', 'won-championship', 'won-monza', 'won-spa', 'brazilian', 'raced-1970s', 'raced-1980s', '100-races', '10-wins', 'pole-position', 'fastest-lap', 'podium']
  },
  {
    name: 'Ralf Schumacher',
    tags: ['drove-jordan', 'drove-williams', 'drove-toyota', 'won-monza', 'won-silverstone', 'won-spa', 'german', 'raced-1990s', 'raced-2000s', '100-races', 'podium', 'pole-position', 'fastest-lap']
  },
  {
    name: 'Heinz-Harald Frentzen',
    tags: ['drove-sauber', 'drove-williams', 'drove-jordan', 'won-monza', 'won-silverstone', 'won-spa', 'german', 'raced-1990s', 'raced-2000s', '100-races', 'podium', 'pole-position', 'fastest-lap']
  },
  {
    name: 'Eddie Irvine',
    tags: ['drove-jordan', 'drove-ferrari', 'drove-jaguar', 'won-silverstone', 'won-spa', 'won-monza', 'british', 'raced-1990s', 'raced-2000s', '100-races', 'podium', 'pole-position', 'fastest-lap']
  },
  {
    name: 'Mika Salo',
    tags: ['drove-lotus', 'drove-tyrrell', 'drove-ferrari', 'drove-arrow', 'won-silverstone', 'finnish', 'raced-1990s', 'raced-2000s', '100-races', 'podium', 'pole-position', 'fastest-lap']
  },
  {
    name: 'Giancarlo Fisichella',
    tags: ['drove-minardi', 'drove-jordan', 'drove-benetton', 'drove-ferrari', 'drove-force-india', 'won-silverstone', 'italian', 'raced-1990s', 'raced-2000s', 'raced-2010s', '100-races', '200-races', 'podium', 'pole-position', 'fastest-lap']
  },
  {
    name: 'Jarno Trulli',
    tags: ['drove-minardi', 'drove-jordan', 'drove-renault', 'drove-toyota', 'won-monaco', 'italian', 'raced-2000s', 'raced-2010s', '100-races', '10-wins', 'pole-position', 'fastest-lap', 'podium']
  },
  {
    name: 'Jean Alesi',
    tags: ['drove-tyrrell', 'drove-ferrari', 'drove-benetton', 'drove-williams', 'drove-jordan', 'won-monza', 'french', 'raced-1980s', 'raced-1990s', 'raced-2000s', '100-races', 'pole-position', 'fastest-lap', 'podium']
  },
  {
    name: 'Riccardo Patrese',
    tags: ['drove-alfa-romeo', 'drove-williams', 'drove-benetton', 'drove-jaguar', 'won-monza', 'italian', 'raced-1980s', 'raced-1990s', '100-races', '200-races', 'pole-position', 'fastest-lap', 'podium']
  },
  {
    name: 'Daniil Kvyat',
    tags: ['drove-toro-rosso', 'drove-red-bull', 'drove-racing-point', 'russian', 'raced-2010s', 'raced-2026', '100-races', 'podium', 'pole-position', 'fastest-lap']
  },
  {
    name: 'Kevin Magnussen',
    tags: ['drove-mclaren', 'drove-renault', 'drove-haas', 'danish', 'raced-2010s', 'raced-2026', '100-races', 'pole-position', 'fastest-lap', 'podium']
  },
  {
    name: 'Zhou Guanyu',
    tags: ['drove-alfa-romeo', 'drove-sauber', 'chinese', 'raced-2010s', 'raced-2026', 'podium', 'pole-position', 'fastest-lap']
  },
  {
    name: 'Yuki Tsunoda',
    tags: ['drove-alphatauri', 'drove-racing-bulls', 'japanese', 'raced-2010s', 'raced-2026', 'podium', 'pole-position', 'fastest-lap']
  },
  {
    name: 'Lance Stroll',
    tags: ['drove-williams', 'drove-racing-point', 'drove-aston-martin', 'canadian', 'raced-2010s', 'raced-2026', '100-races', 'podium', 'pole-position', 'fastest-lap']
  },
  {
    name: 'Nico Hülkenberg',
    tags: ['drove-williams', 'drove-force-india', 'drove-racing-point', 'drove-haas', 'drove-aston-martin', 'german', 'raced-2010s', 'raced-2026', '100-races', 'podium', 'pole-position', 'fastest-lap']
  }
];

export interface GridCriteria {
  tag: string;
  label: string;
  category: 'team' | 'achievement' | 'nationality' | 'era';
}

export const ALL_CRITERIA: GridCriteria[] = [
  // TEAM CRITERIA
  { tag: 'drove-ferrari', label: 'Drove for Ferrari', category: 'team' },
  { tag: 'drove-mclaren', label: 'Drove for McLaren', category: 'team' },
  { tag: 'drove-mercedes', label: 'Drove for Mercedes', category: 'team' },
  { tag: 'drove-red-bull', label: 'Drove for Red Bull', category: 'team' },
  { tag: 'drove-williams', label: 'Drove for Williams', category: 'team' },
  { tag: 'drove-renault', label: 'Drove for Renault/Alpine', category: 'team' },
  { tag: 'drove-lotus', label: 'Drove for Lotus', category: 'team' },
  { tag: 'drove-benetton', label: 'Drove for Benetton', category: 'team' },
  { tag: 'drove-toro-rosso', label: 'Drove for Toro Rosso/RB', category: 'team' },
  { tag: 'drove-brabham', label: 'Drove for Brabham', category: 'team' },
  { tag: 'drove-tyrrell', label: 'Drove for Tyrrell', category: 'team' },
  { tag: 'drove-jordan', label: 'Drove for Jordan', category: 'team' },
  { tag: 'drove-brawn', label: 'Drove for Brawn GP', category: 'team' },
  { tag: 'drove-force-india', label: 'Drove for Force India/RP/AM', category: 'team' },
  
  // ACHIEVEMENT CRITERIA
  { tag: 'won-championship', label: 'Won a World Championship', category: 'achievement' },
  { tag: 'won-monaco', label: 'Won at Monaco', category: 'achievement' },
  { tag: 'won-monza', label: 'Won at Monza', category: 'achievement' },
  { tag: 'won-silverstone', label: 'Won at Silverstone', category: 'achievement' },
  { tag: 'won-spa', label: 'Won at Spa', category: 'achievement' },
  { tag: 'won-suzuka', label: 'Won at Suzuka', category: 'achievement' },
  { tag: 'podium', label: 'Scored a Podium', category: 'achievement' },
  { tag: 'pole-position', label: 'Took Pole Position', category: 'achievement' },
  { tag: 'fastest-lap', label: 'Set Fastest Lap', category: 'achievement' },
  { tag: '100-races', label: '100+ Races', category: 'achievement' },
  { tag: '200-races', label: '200+ Races', category: 'achievement' },
  { tag: '10-wins', label: '10+ Race Wins', category: 'achievement' },
  { tag: '30-wins', label: '30+ Race Wins', category: 'achievement' },
  
  // NATIONALITY CRITERIA
  { tag: 'british', label: 'British Driver', category: 'nationality' },
  { tag: 'german', label: 'German Driver', category: 'nationality' },
  { tag: 'brazilian', label: 'Brazilian Driver', category: 'nationality' },
  { tag: 'french', label: 'French Driver', category: 'nationality' },
  { tag: 'finnish', label: 'Finnish Driver', category: 'nationality' },
  { tag: 'spanish', label: 'Spanish Driver', category: 'nationality' },
  { tag: 'australian', label: 'Australian Driver', category: 'nationality' },
  { tag: 'italian', label: 'Italian Driver', category: 'nationality' },
  { tag: 'austrian', label: 'Austrian Driver', category: 'nationality' },
  { tag: 'dutch', label: 'Dutch Driver', category: 'nationality' },
  { tag: 'canadian', label: 'Canadian Driver', category: 'nationality' },
  { tag: 'mexican', label: 'Mexican Driver', category: 'nationality' },
  
  // ERA CRITERIA
  { tag: 'raced-before-1970', label: 'Raced before 1970', category: 'era' },
  { tag: 'raced-1970s', label: 'Raced in the 1970s', category: 'era' },
  { tag: 'raced-1980s', label: 'Raced in the 1980s', category: 'era' },
  { tag: 'raced-1990s', label: 'Raced in the 1990s', category: 'era' },
  { tag: 'raced-2000s', label: 'Raced in the 2000s', category: 'era' },
  { tag: 'raced-2010s', label: 'Raced in the 2010s', category: 'era' },
  { tag: 'raced-2026', label: 'Currently Racing in 2026', category: 'era' },
];
