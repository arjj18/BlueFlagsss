---
name: Stale live site vs correct dev code
description: When the user reports the published site shows old hardcoded data, check deployment staleness before editing source.
---

**Rule:** If the user says the live/published site still shows wrong hardcoded data (calendar, standings), first verify the dev source — if it's already correct, the fix is republishing, not more code edits or cache-version bumps.

**Why:** In Pit Lane, the 2026 calendar was fully fixed and verified in dev, but the user kept reporting the "live site" wrong — the published deployment simply predated the fix. localStorage version bumps can't help until the new bundle is deployed.

**How to apply:** Verify source with grep for the specific wrong values the user cites (e.g. old race dates). If absent, confirm the preview renders correctly, bump the data version if hardcoded data changed, and suggest republishing.
