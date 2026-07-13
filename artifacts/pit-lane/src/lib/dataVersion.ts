// Data-version cache busting.
//
// Bump APP_DATA_VERSION every time hardcoded data (standings defaults,
// calendar, etc.) changes. On load, if the saved version doesn't match,
// stale calendar/standings-derived localStorage entries are wiped so every
// user picks up the fresh data from the code on their next visit.
export const APP_DATA_VERSION = "2026-07-13-v2";

const VERSION_KEY = "pitlane_data_version";

// Exact keys wiped on a version bump — data derived from the calendar or
// standings that would be wrong after a data update.
const STALE_DATA_KEYS = [
  "pitlane-standings-2026",       // user-entered standings (points/meta)
  "pitlane-general-quiz-completed",
  "pitlane-general-quiz-streak",
  "pitlane-general-quiz-score",
];

// Prefixes wiped on a version bump. Race predictions are cached per round
// number, and round numbers changed meaning with the corrected calendar.
const STALE_DATA_PREFIXES = ["pitlane-prediction-r"];

export function checkAndClearStaleCache(): void {
  try {
    const savedVersion = localStorage.getItem(VERSION_KEY);
    if (savedVersion === APP_DATA_VERSION) return;

    console.log(
      `Data version mismatch: saved=${savedVersion} current=${APP_DATA_VERSION}`,
    );
    console.log("Clearing stale cached data and loading fresh data...");

    for (const key of STALE_DATA_KEYS) {
      localStorage.removeItem(key);
    }

    // Collect prefix matches first — removing while iterating shifts indices.
    const prefixMatches: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && STALE_DATA_PREFIXES.some((p) => key.startsWith(p))) {
        prefixMatches.push(key);
      }
    }
    prefixMatches.forEach((key) => localStorage.removeItem(key));

    localStorage.setItem(VERSION_KEY, APP_DATA_VERSION);
    console.log("Cache cleared. Fresh data will now load.");
  } catch {
    // localStorage unavailable (private mode, etc.) — nothing to clear.
  }
}

// Secret reset shortcut — press Shift+R three times in a row on any screen
// to force-clear ALL cached app data and reload. Escape hatch if data ever
// gets stuck in production without needing a code change.
export function installResetShortcut(): void {
  let keyBuffer: string[] = [];
  document.addEventListener("keydown", (e) => {
    keyBuffer.push(e.key);
    keyBuffer = keyBuffer.slice(-3);
    if (keyBuffer.join("") === "RRR" && e.shiftKey) {
      keyBuffer = [];
      const confirmed = window.confirm("Reset all cached app data and reload?");
      if (confirmed) {
        try {
          localStorage.clear();
        } catch {
          /* ignore */
        }
        window.location.reload();
      }
    }
  });
}
