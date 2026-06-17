export type GameKey = "quiz" | "postRace" | "tenabell";

export type ScoreEntry = {
  id: string;
  game: GameKey;
  label: string;
  score: number;
  total: number;
  date: string;
};

const STORAGE_KEY = "pitlane-score-history";
const MAX_ENTRIES = 30;

export function loadHistory(): ScoreEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ScoreEntry[];
  } catch {}
  return [];
}

export function saveScore(entry: Omit<ScoreEntry, "id" | "date">): void {
  const history = loadHistory();
  const newEntry: ScoreEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    date: new Date().toISOString(),
  };
  const updated = [newEntry, ...history].slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function pct(score: number, total: number): number {
  return total === 0 ? 0 : Math.round((score / total) * 100);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" }) +
    " · " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}
