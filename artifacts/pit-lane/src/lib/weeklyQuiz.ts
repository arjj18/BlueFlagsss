// Weekly gating + streak for the General Quiz.
//
// The General Quiz is playable once per week and resets every Monday at 00:00
// local time. We persist the last completion timestamp, a consecutive-week
// streak, and the last score in localStorage so the lockout and streak survive
// reloads. This never calls the server — it is purely client-side state.

const COMPLETED_KEY = "pitlane-general-quiz-completed"; // ISO timestamp of last completion
const STREAK_KEY = "pitlane-general-quiz-streak"; // consecutive weeks completed
const SCORE_KEY = "pitlane-general-quiz-score"; // last score achieved

const WEEK_MS = 7 * 86_400_000;

/** Midnight (local) of the most recent Monday on or before `from`. */
function mostRecentMonday(from: Date = new Date()): Date {
  const d = new Date(from);
  const day = d.getDay(); // Sun=0 … Sat=6
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - daysSinceMonday);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** True if the player has already completed this week's quiz (since Monday). */
export function hasCompletedThisWeek(): boolean {
  try {
    const raw = localStorage.getItem(COMPLETED_KEY);
    if (!raw) return false;
    const last = new Date(raw);
    if (Number.isNaN(last.getTime())) return false;
    return last >= mostRecentMonday();
  } catch {
    return false;
  }
}

/** The most recent score, or null if never played. */
export function getLastScore(): number | null {
  try {
    const raw = localStorage.getItem(SCORE_KEY);
    if (raw == null) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

/** Current consecutive-week streak. */
export function getWeeklyStreak(): number {
  try {
    const n = parseInt(localStorage.getItem(STREAK_KEY) || "0", 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

export type WeeklyCompletion = { streak: number; score: number };

/**
 * Record a completed quiz. The streak increments when the previous completion
 * was exactly one week earlier, and resets to 1 after any longer gap.
 */
export function completeWeeklyQuiz(score: number): WeeklyCompletion {
  let streak = 1;
  try {
    const prevRaw = localStorage.getItem(COMPLETED_KEY);
    if (prevRaw) {
      const prev = new Date(prevRaw);
      if (!Number.isNaN(prev.getTime())) {
        const weeksApart = Math.round(
          (mostRecentMonday().getTime() - mostRecentMonday(prev).getTime()) / WEEK_MS,
        );
        if (weeksApart === 0) {
          streak = Math.max(getWeeklyStreak(), 1); // same week (shouldn't happen when gated)
        } else if (weeksApart === 1) {
          streak = getWeeklyStreak() + 1; // consecutive week
        } else {
          streak = 1; // streak broken
        }
      }
    }
    localStorage.setItem(COMPLETED_KEY, new Date().toISOString());
    localStorage.setItem(STREAK_KEY, String(streak));
    localStorage.setItem(SCORE_KEY, String(score));
  } catch {
    /* ignore persistence errors */
  }
  return { streak, score };
}

/** Human-readable countdown to next Monday midnight, e.g. "3d 7h 12m". */
export function getNextMondayCountdown(now: Date = new Date()): string {
  const next = mostRecentMonday(now);
  next.setDate(next.getDate() + 7);
  const diff = next.getTime() - now.getTime();
  if (diff <= 0) return "0d 0h 0m";
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  return `${days}d ${hours}h ${mins}m`;
}

// ── Review Quiz: one attempt per week, resets every Tuesday ──────────────────
//
// The Review Quiz is only available on Tuesdays and may be played once per
// weekly cycle. We store the completion timestamp and treat the player as
// locked out until the next Tuesday. The prior week's entry naturally expires
// because `hasCompletedReviewThisWeek` only compares against the most recent
// Tuesday.

const REVIEW_COMPLETED_KEY = "pitlane-review-quiz-completed"; // ISO timestamp of last completion

/** Midnight (local) of the most recent Tuesday on or before `from`. */
function mostRecentTuesday(from: Date = new Date()): Date {
  const d = new Date(from);
  const day = d.getDay(); // Sun=0 … Sat=6 (Tue=2)
  const daysSinceTuesday = (day - 2 + 7) % 7;
  d.setDate(d.getDate() - daysSinceTuesday);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** True if the Review Quiz has already been completed in this Tuesday cycle. */
export function hasCompletedReviewThisWeek(): boolean {
  try {
    const raw = localStorage.getItem(REVIEW_COMPLETED_KEY);
    if (!raw) return false;
    const last = new Date(raw);
    if (Number.isNaN(last.getTime())) return false;
    return last >= mostRecentTuesday();
  } catch {
    return false;
  }
}

/** Record that the Review Quiz was completed in the current Tuesday cycle. */
export function completeReviewQuiz(): void {
  try {
    localStorage.setItem(REVIEW_COMPLETED_KEY, new Date().toISOString());
  } catch {
    /* ignore persistence errors */
  }
}

/** The date of the next Tuesday the Review Quiz reopens, formatted for display. */
export function getNextReviewTuesdayLabel(now: Date = new Date()): string {
  const next = mostRecentTuesday(now);
  next.setDate(next.getDate() + 7);
  return next.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
