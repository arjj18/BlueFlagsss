---
name: Standings entry identity
description: Why constructors in the F1 standings are keyed by name and what that constrains.
---

# Championship standings entity identity

The standings feature (RaceSchedule.tsx + lib/f1Standings.ts) is client-only
(localStorage, no API — must stay that way) and uses different identity schemes
for the two row types:

- **Drivers** have a short `code` used as React key + update/remove handle. New
  drivers added via the UI get a generated code de-duplicated against existing
  codes, so duplicate driver names are safe.
- **Constructors have NO id — `name` IS the identity.** It is the React key, the
  update/remove handle, AND the join key for grouping drivers under a team
  (`driver.team === constructor.name`). **Why:** adding an `id` would force a
  StandingsData schema change + localStorage migration AND a rewrite of the
  driver↔team matching. **How to apply:** any "add team" path must reject
  duplicate (case-insensitive) team names rather than allow collisions; do not
  rename a team without updating the matching `driver.team` values.
