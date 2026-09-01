export type Criterion = {
  tag: string;
  label: string;
  category: "team" | "achievement" | "nationality" | "era";
};

export type Driver = {
  name: string;
  tags: string[];
};

export const CRITERIA: Criterion[] = [
  { tag: "drove-ferrari", label: "Drove for Ferrari", category: "team" },
  { tag: "drove-mclaren", label: "Drove for McLaren", category: "team" },
  { tag: "drove-mercedes", label: "Drove for Mercedes", category: "team" },
  { tag: "drove-red-bull", label: "Drove for Red Bull", category: "team" },
  { tag: "drove-williams", label: "Drove for Williams", category: "team" },
  { tag: "drove-renault-alpine", label: "Drove for Renault/Alpine", category: "team" },
  { tag: "drove-lotus", label: "Drove for Lotus", category: "team" },
  { tag: "drove-benetton", label: "Drove for Benetton", category: "team" },
  { tag: "drove-toro-rosso", label: "Drove for Toro Rosso/RB", category: "team" },
  { tag: "drove-brabham", label: "Drove for Brabham", category: "team" },
  { tag: "drove-tyrrell", label: "Drove for Tyrrell", category: "team" },
  { tag: "drove-jordan", label: "Drove for Jordan", category: "team" },
  { tag: "drove-brawn", label: "Drove for Brawn GP", category: "team" },
  { tag: "drove-force-india", label: "Drove for FI/RP/AM", category: "team" },

  { tag: "won-championship", label: "Won a World Championship", category: "achievement" },
  { tag: "won-monaco", label: "Won at Monaco", category: "achievement" },
  { tag: "won-monza", label: "Won at Monza", category: "achievement" },
  { tag: "won-silverstone", label: "Won at Silverstone", category: "achievement" },
  { tag: "won-spa", label: "Won at Spa", category: "achievement" },
  { tag: "won-suzuka", label: "Won at Suzuka", category: "achievement" },
  { tag: "podium", label: "Scored a podium finish", category: "achievement" },
  { tag: "pole-position", label: "Took a pole position", category: "achievement" },
  { tag: "fastest-lap", label: "Set a fastest lap in a race", category: "achievement" },
  { tag: "100-races", label: "Drove in 100+ F1 races", category: "achievement" },
  { tag: "200-races", label: "Drove in 200+ F1 races", category: "achievement" },
  { tag: "10-wins", label: "Won 10+ races in career", category: "achievement" },
  { tag: "30-wins", label: "Won 30+ races in career", category: "achievement" },

  { tag: "british", label: "British driver", category: "nationality" },
  { tag: "german", label: "German driver", category: "nationality" },
  { tag: "brazilian", label: "Brazilian driver", category: "nationality" },
  { tag: "french", label: "French driver", category: "nationality" },
  { tag: "finnish", label: "Finnish driver", category: "nationality" },
  { tag: "spanish", label: "Spanish driver", category: "nationality" },
  { tag: "australian", label: "Australian driver", category: "nationality" },
  { tag: "italian", label: "Italian driver", category: "nationality" },
  { tag: "austrian", label: "Austrian driver", category: "nationality" },
  { tag: "dutch", label: "Dutch driver", category: "nationality" },
  { tag: "canadian", label: "Canadian driver", category: "nationality" },
  { tag: "american", label: "American driver", category: "nationality" },
  { tag: "south-african", label: "South African driver", category: "nationality" },
  { tag: "new-zealand", label: "New Zealand driver", category: "nationality" },
  { tag: "belgian", label: "Belgian driver", category: "nationality" },

  { tag: "raced-1970s", label: "Raced in the 1970s", category: "era" },
  { tag: "raced-1980s", label: "Raced in the 1980s", category: "era" },
  { tag: "raced-1990s", label: "Raced in the 1990s", category: "era" },
  { tag: "raced-2000s", label: "Raced in the 2000s", category: "era" },
  { tag: "raced-2010s", label: "Raced in the 2010s", category: "era" },
  { tag: "raced-2026", label: "Currently racing in 2026", category: "era" },
  { tag: "raced-before-1970", label: "Raced before 1970", category: "era" },
  { tag: "turbo-era", label: "Turbo era (1977-1988)", category: "era" },
];

export const DRIVERS: Driver[] = [
  { name: "Lewis Hamilton", tags: ["drove-mclaren", "drove-mercedes", "drove-ferrari", "won-championship", "won-monaco", "won-monza", "won-silverstone", "won-spa", "won-suzuka", "british", "raced-2000s", "raced-2010s", "raced-2026", "100-races", "200-races", "10-wins", "30-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Michael Schumacher", tags: ["drove-ferrari", "drove-benetton", "drove-mercedes", "won-championship", "won-monaco", "won-monza", "won-silverstone", "won-spa", "won-suzuka", "german", "raced-1990s", "raced-2000s", "raced-2010s", "100-races", "200-races", "10-wins", "30-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Max Verstappen", tags: ["drove-toro-rosso", "drove-red-bull", "won-championship", "won-monaco", "won-monza", "won-silverstone", "won-spa", "won-suzuka", "dutch", "raced-2010s", "raced-2026", "100-races", "200-races", "10-wins", "30-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Ayrton Senna", tags: ["drove-lotus", "drove-mclaren", "drove-williams", "won-championship", "won-monaco", "won-monza", "won-silverstone", "won-spa", "won-suzuka", "brazilian", "raced-1980s", "raced-1990s", "100-races", "10-wins", "30-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Alain Prost", tags: ["drove-renault-alpine", "drove-mclaren", "drove-ferrari", "drove-williams", "won-championship", "won-monaco", "won-monza", "won-silverstone", "won-spa", "french", "raced-1980s", "raced-1990s", "100-races", "10-wins", "30-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Sebastian Vettel", tags: ["drove-toro-rosso", "drove-red-bull", "drove-ferrari", "drove-force-india", "won-championship", "won-monaco", "won-monza", "won-silverstone", "won-spa", "won-suzuka", "german", "raced-2000s", "raced-2010s", "100-races", "200-races", "10-wins", "30-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Fernando Alonso", tags: ["drove-renault-alpine", "drove-mclaren", "drove-ferrari", "drove-force-india", "won-championship", "won-monaco", "won-monza", "won-silverstone", "won-spa", "won-suzuka", "spanish", "raced-2000s", "raced-2010s", "raced-2026", "100-races", "200-races", "10-wins", "30-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Niki Lauda", tags: ["drove-ferrari", "drove-brabham", "drove-mclaren", "won-championship", "won-monza", "won-spa", "austrian", "raced-1970s", "raced-1980s", "100-races", "10-wins", "pole-position", "fastest-lap", "podium", "turbo-era"] },
  { name: "Kimi Räikkönen", tags: ["drove-mclaren", "drove-ferrari", "drove-lotus", "won-championship", "won-monaco", "won-monza", "won-silverstone", "won-spa", "won-suzuka", "finnish", "raced-2000s", "raced-2010s", "100-races", "200-races", "10-wins", "30-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Nigel Mansell", tags: ["drove-lotus", "drove-williams", "drove-ferrari", "drove-mclaren", "won-championship", "won-monaco", "won-monza", "won-silverstone", "won-spa", "british", "raced-1980s", "raced-1990s", "100-races", "10-wins", "30-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Jackie Stewart", tags: ["drove-tyrrell", "won-championship", "won-monaco", "won-spa", "won-silverstone", "british", "raced-1970s", "100-races", "10-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Jim Clark", tags: ["drove-lotus", "won-championship", "won-monza", "won-silverstone", "won-spa", "british", "raced-before-1970", "10-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Juan Manuel Fangio", tags: ["drove-mercedes", "drove-ferrari", "won-championship", "won-monaco", "won-monza", "won-spa", "raced-before-1970", "10-wins", "30-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Jenson Button", tags: ["drove-williams", "drove-benetton", "drove-renault-alpine", "drove-brawn", "drove-mclaren", "won-championship", "won-monaco", "won-spa", "british", "raced-2000s", "raced-2010s", "100-races", "200-races", "10-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Nico Rosberg", tags: ["drove-williams", "drove-mercedes", "won-championship", "won-monaco", "won-silverstone", "won-spa", "german", "raced-2000s", "raced-2010s", "100-races", "200-races", "10-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Mika Häkkinen", tags: ["drove-lotus", "drove-mclaren", "won-championship", "won-monaco", "won-monza", "won-spa", "finnish", "raced-1990s", "raced-2000s", "100-races", "10-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Damon Hill", tags: ["drove-williams", "drove-jordan", "won-championship", "won-monaco", "won-silverstone", "won-spa", "british", "raced-1990s", "100-races", "10-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "David Coulthard", tags: ["drove-williams", "drove-mclaren", "drove-red-bull", "won-monaco", "won-monza", "won-silverstone", "won-spa", "british", "raced-1990s", "raced-2000s", "100-races", "200-races", "10-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Rubens Barrichello", tags: ["drove-jordan", "drove-ferrari", "drove-brawn", "drove-williams", "won-monza", "won-silverstone", "won-spa", "brazilian", "raced-1990s", "raced-2000s", "raced-2010s", "100-races", "200-races", "10-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Charles Leclerc", tags: ["drove-ferrari", "won-monaco", "won-monza", "won-spa", "raced-2010s", "raced-2026", "100-races", "10-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Lando Norris", tags: ["drove-mclaren", "won-monaco", "won-silverstone", "won-spa", "british", "raced-2010s", "raced-2026", "100-races", "10-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Carlos Sainz", tags: ["drove-toro-rosso", "drove-renault-alpine", "drove-mclaren", "drove-ferrari", "drove-williams", "won-monaco", "won-monza", "won-silverstone", "spanish", "raced-2010s", "raced-2026", "100-races", "10-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "George Russell", tags: ["drove-williams", "drove-mercedes", "won-silverstone", "won-spa", "british", "raced-2010s", "raced-2026", "100-races", "pole-position", "fastest-lap", "podium"] },
  { name: "Oscar Piastri", tags: ["drove-mclaren", "won-monaco", "won-monza", "australian", "raced-2026", "podium", "pole-position", "fastest-lap"] },
  { name: "Pierre Gasly", tags: ["drove-toro-rosso", "drove-red-bull", "drove-renault-alpine", "won-monza", "french", "raced-2010s", "raced-2026", "100-races", "podium", "pole-position", "fastest-lap"] },
  { name: "Valtteri Bottas", tags: ["drove-williams", "drove-mercedes", "won-silverstone", "won-monza", "won-spa", "finnish", "raced-2010s", "raced-2026", "100-races", "200-races", "10-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Felipe Massa", tags: ["drove-ferrari", "drove-williams", "won-monza", "won-spa", "won-silverstone", "brazilian", "raced-2000s", "raced-2010s", "100-races", "200-races", "10-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Mark Webber", tags: ["drove-williams", "drove-red-bull", "won-monaco", "won-monza", "won-silverstone", "won-spa", "australian", "raced-2000s", "raced-2010s", "100-races", "10-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Sergio Perez", tags: ["drove-mclaren", "drove-force-india", "drove-red-bull", "won-monaco", "won-monza", "won-spa", "raced-2010s", "raced-2026", "100-races", "200-races", "10-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Jacques Villeneuve", tags: ["drove-williams", "drove-renault-alpine", "won-championship", "won-monza", "won-silverstone", "won-spa", "canadian", "raced-1990s", "raced-2000s", "100-races", "10-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Gilles Villeneuve", tags: ["drove-ferrari", "won-monaco", "won-monza", "canadian", "raced-1970s", "raced-1980s", "podium", "pole-position", "fastest-lap"] },
  { name: "Nelson Piquet", tags: ["drove-brabham", "drove-williams", "drove-lotus", "drove-benetton", "won-championship", "won-monza", "won-spa", "brazilian", "raced-1970s", "raced-1980s", "raced-1990s", "100-races", "10-wins", "30-wins", "pole-position", "fastest-lap", "podium", "turbo-era"] },
  { name: "Emerson Fittipaldi", tags: ["drove-lotus", "drove-mclaren", "won-championship", "won-monza", "won-spa", "brazilian", "raced-1970s", "raced-1980s", "100-races", "10-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Ralf Schumacher", tags: ["drove-jordan", "drove-williams", "won-monza", "won-silverstone", "won-spa", "german", "raced-1990s", "raced-2000s", "100-races", "podium", "pole-position", "fastest-lap"] },
  { name: "Heinz-Harald Frentzen", tags: ["drove-williams", "drove-jordan", "won-monza", "won-silverstone", "won-spa", "german", "raced-1990s", "raced-2000s", "100-races", "podium", "pole-position", "fastest-lap"] },
  { name: "Eddie Irvine", tags: ["drove-jordan", "drove-ferrari", "won-silverstone", "won-spa", "won-monza", "british", "raced-1990s", "raced-2000s", "100-races", "podium", "pole-position", "fastest-lap"] },
  { name: "Gerhard Berger", tags: ["drove-ferrari", "drove-mclaren", "drove-benetton", "won-monaco", "won-monza", "won-spa", "won-suzuka", "austrian", "raced-1980s", "raced-1990s", "100-races", "10-wins", "pole-position", "fastest-lap", "podium", "turbo-era"] },
  { name: "James Hunt", tags: ["drove-mclaren", "won-championship", "won-monaco", "won-silverstone", "won-spa", "british", "raced-1970s", "raced-1980s", "10-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Mario Andretti", tags: ["drove-lotus", "won-championship", "won-monza", "won-spa", "american", "raced-1970s", "raced-1980s", "10-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Jody Scheckter", tags: ["drove-ferrari", "won-championship", "won-monaco", "won-silverstone", "south-african", "raced-1970s", "raced-1980s", "10-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Graham Hill", tags: ["drove-lotus", "won-championship", "won-monaco", "won-silverstone", "won-spa", "british", "raced-before-1970", "10-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "John Surtees", tags: ["drove-ferrari", "won-championship", "won-monaco", "won-spa", "british", "raced-before-1970", "10-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Jack Brabham", tags: ["drove-brabham", "won-championship", "won-monaco", "won-spa", "australian", "raced-before-1970", "10-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Denny Hulme", tags: ["drove-mclaren", "won-championship", "won-monza", "won-spa", "new-zealand", "raced-1970s", "10-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Thierry Boutsen", tags: ["drove-williams", "won-monaco", "won-silverstone", "won-spa", "belgian", "raced-1980s", "raced-1990s", "100-races", "podium", "pole-position", "fastest-lap"] },
  { name: "Jacky Ickx", tags: ["drove-ferrari", "won-monaco", "won-spa", "belgian", "raced-1970s", "raced-1980s", "10-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Bruce McLaren", tags: ["drove-mclaren", "won-monaco", "won-spa", "new-zealand", "raced-before-1970", "10-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Stirling Moss", tags: ["drove-mercedes", "won-monaco", "won-silverstone", "won-spa", "british", "raced-before-1970", "10-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Ronnie Peterson", tags: ["drove-lotus", "won-monaco", "won-monza", "won-silverstone", "won-spa", "italian", "raced-1970s", "10-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Michele Alboreto", tags: ["drove-ferrari", "drove-tyrrell", "won-monaco", "won-spa", "italian", "raced-1980s", "raced-1990s", "100-races", "podium", "pole-position", "fastest-lap"] },
  { name: "Riccardo Patrese", tags: ["drove-williams", "drove-ferrari", "won-monaco", "won-silverstone", "won-spa", "italian", "raced-1980s", "raced-1990s", "100-races", "200-races", "10-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Jochen Rindt", tags: ["drove-lotus", "won-championship", "won-monaco", "won-silverstone", "won-spa", "austrian", "raced-1970s", "10-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Keke Rosberg", tags: ["drove-williams", "won-championship", "won-monaco", "won-silverstone", "won-spa", "finnish", "raced-1980s", "100-races", "10-wins", "pole-position", "fastest-lap", "podium", "turbo-era"] },
  { name: "Jean Alesi", tags: ["drove-ferrari", "drove-benetton", "drove-jordan", "won-monaco", "french", "raced-1990s", "raced-2000s", "100-races", "200-races", "podium", "pole-position", "fastest-lap"] },
  { name: "Giancarlo Fisichella", tags: ["drove-jordan", "drove-renault-alpine", "drove-force-india", "won-monaco", "won-spa", "italian", "raced-1990s", "raced-2000s", "100-races", "200-races", "podium", "pole-position", "fastest-lap"] },
  { name: "Daniel Ricciardo", tags: ["drove-toro-rosso", "drove-red-bull", "drove-renault-alpine", "drove-mclaren", "won-monaco", "won-spa", "won-silverstone", "australian", "raced-2010s", "raced-2026", "100-races", "200-races", "10-wins", "pole-position", "fastest-lap", "podium"] },
  { name: "Heikki Kovalainen", tags: ["drove-mclaren", "won-silverstone", "finnish", "raced-2000s", "raced-2010s", "100-races", "podium", "pole-position", "fastest-lap"] },
  { name: "Carlos Reutemann", tags: ["drove-ferrari", "drove-williams", "won-monaco", "won-silverstone", "won-spa", "south-african", "raced-1970s", "raced-1980s", "100-races", "10-wins", "pole-position", "fastest-lap", "podium"] },
];

export function getValidDrivers(colTag: string, rowTag: string): Driver[] {
  return DRIVERS.filter(d => d.tags.includes(colTag) && d.tags.includes(rowTag));
}

export type GridConfig = { columns: Criterion[]; rows: Criterion[] };

function shuffleArray<T>(arr: T[]): T[] {
  const r = [...arr];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

export function generateValidGrid(): GridConfig | null {
  let attempts = 0;
  while (attempts < 200) {
    attempts++;
    const columns = shuffleArray(CRITERIA).slice(0, 3);
    const rows = shuffleArray(CRITERIA).slice(0, 3);
    let valid = true;
    for (const col of columns) {
      for (const row of rows) {
        if (getValidDrivers(col.tag, row.tag).length < 3) { valid = false; break; }
      }
      if (!valid) break;
    }
    if (valid) return { columns, rows };
  }
  return null;
}

export type Cell = { player: "player1" | "player2"; driver: string };
export type WinResult = { winner: "player1" | "player2" | null; line: number[]; draw: boolean };

const WIN_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

export function checkWinner(board: (Cell | null)[]): WinResult | null {
  for (const [a,b,c] of WIN_LINES) {
    if (board[a] && board[b] && board[c] && board[a]!.player === board[b]!.player && board[a]!.player === board[c]!.player)
      return { winner: board[a]!.player, line: [a,b,c], draw: false };
  }
  if (board.every(c => c !== null)) {
    const p1 = board.filter(c => c?.player === "player1").length;
    const p2 = board.filter(c => c?.player === "player2").length;
    if (p1 > p2) return { winner: "player1", line: [], draw: false };
    if (p2 > p1) return { winner: "player2", line: [], draw: false };
    return { winner: null, line: [], draw: true };
  }
  return null;
}

export function findWinningMove(board: (Cell|null)[], player: "player1"|"player2", grid: GridConfig): number | null {
  for (const [a,b,c] of WIN_LINES) {
    const cells = [board[a], board[b], board[c]];
    const pc = cells.filter(v => v?.player === player).length;
    const ec = cells.filter(v => v === null).length;
    if (pc === 2 && ec === 1) {
      const idx = [a,b,c][cells.indexOf(null)];
      const col = grid.columns[idx % 3], row = grid.rows[Math.floor(idx/3)];
      if (getValidDrivers(col.tag, row.tag).length > 0) return idx;
    }
  }
  return null;
}

export function computerMove(board: (Cell|null)[], grid: GridConfig): number | null {
  const win = findWinningMove(board, "player2", grid); if (win !== null) return win;
  const block = findWinningMove(board, "player1", grid); if (block !== null) return block;
  if (!board[4]) return 4;
  const corners = [0,2,6,8].filter(i => !board[i]);
  if (corners.length) return corners[Math.floor(Math.random()*corners.length)];
  const avail = board.map((v,i) => v===null?i:-1).filter(i => i!==-1);
  return avail.length ? avail[Math.floor(Math.random()*avail.length)] : null;
}

export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let c = ""; for (let i=0;i<6;i++) c += chars[Math.floor(Math.random()*chars.length)]; return c;
}

export function normalizeName(s: string): string {
  return s.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const NICKNAMES: Record<string,string> = {
  max:"max verstappen",lewis:"lewis hamilton",lando:"lando norris",charles:"charles leclerc",
  checo:"sergio perez","danny ric":"daniel ricciardo",kimi:"kimi räikkönen",schumi:"michael schumacher",
  alonso:"fernando alonso",nando:"fernando alonso",seb:"sebastian vettel",nico:"nico rosberg",
  bottas:"valtteri bottas",sainz:"carlos sainz",russell:"george russell",norris:"lando norris",
  piastri:"oscar piastri",hakkinen:"mika häkkinen",lauda:"niki lauda",senna:"ayrton senna",
  prost:"alain prost",vettel:"sebastian vettel",hamilton:"lewis hamilton",verstappen:"max verstappen",
  leclerc:"charles leclerc",gasly:"pierre gasly",ocon:"esteban ocon",ricciardo:"daniel ricciardo",
  button:"jenson button",mansell:"nigel mansell",
};

export function fuzzyMatch(guess: string, target: string): boolean {
  const g = normalizeName(guess), t = normalizeName(target);
  if (g === t) return true;
  const nick = NICKNAMES[g]; if (nick && normalizeName(nick) === t) return true;
  const surname = t.split(/[\s/-]+/).pop() ?? "";
  if (g === surname) return true;
  if (surname.startsWith(g) && g.length >= 3) return true;
  if (t.includes(g) && g.length >= 3) return true;
  if (g.includes(t) && t.length >= 4) return true;
  return false;
}

export function findDriver(guess: string, colTag: string, rowTag: string): Driver | null {
  return getValidDrivers(colTag, rowTag).find(d => fuzzyMatch(guess, d.name)) ?? null;
}
