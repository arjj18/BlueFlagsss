// Runs as a side effect of being the FIRST import in main.tsx. ES modules
// evaluate imports before the importing module's body, so this is the only
// way to guarantee stale-cache clearing happens before any other module
// (e.g. App.tsx's module-level loadStreak()) reads localStorage.
import { checkAndClearStaleCache, installResetShortcut } from "./lib/dataVersion";

checkAndClearStaleCache();
installResetShortcut();
