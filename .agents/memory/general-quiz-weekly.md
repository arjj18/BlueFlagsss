---
name: General Quiz weekly gating + image fallback
description: Design rules for the Pit Lane General Quiz weekly lockout/streak and the reusable image component gotcha.
---

# General Quiz: weekly play + images

The hub renders `GeneralQuiz.tsx` (NOT `PostRaceQuiz`) for the General Quiz. It is
playable once per week and resets Monday 00:00 local; gating + streak live in
`lib/weeklyQuiz.ts` (localStorage only, no server).

- **Streak rule:** increments only when the previous completion's week bucket
  (`mostRecentMonday`) was exactly 1 week before the current one; any longer gap
  resets to 1. **Why:** "consecutive weeks" must mean adjacent Monday buckets, not
  "within N days", so DST/long months can't silently extend a streak.

- **Reusable `<img>` fallback gotcha:** `QuizImage` hides itself onError, but a
  single component instance is reused across questions. It MUST reset its `failed`
  state when `src` changes (`useEffect(() => setFailed(false), [src])`), otherwise
  one 404 permanently suppresses every later image. **How to apply:** any
  per-question/per-item image component that tracks load failure in state needs a
  src-keyed reset (or `key={src}`).

- **Images are best-effort:** external (Wikimedia) helmet/livery/moment URLs may
  404 by design — graceful fallback to the descriptive text is intended. Team
  logos in the career timeline come from bundled assets via `resolveTeamLogo`
  (`lib/teamLogos.ts`), so those are reliable; unknown teams fall back to text.
