---
name: Vercel copy of Pit Lane
description: How the Vercel deployment works and the rule against Anthropic passthrough proxies
---

The user maintains a separate Vercel deployment of the pit-lane SPA (static build + serverless functions in root `api/`). The Replit deployment runs the full Express backend; Vercel does not.

**Rule:** Never create a raw Anthropic passthrough proxy (e.g. a generic `api/chat` that forwards `req.body` to Anthropic). The threat model's primary guarantee is that paid AI endpoints can't be abused as an open proxy. The user has asked for this once and was refused.

**How to apply:** Any AI feature added to the app needs BOTH an Express route (Replit) and a matching Vercel serverless function (`api/<path>.mjs`, `.mjs` because root package.json is CJS) with the same path, server-fixed prompts, input validation, and rate limiting (Express uses express-rate-limit 10/15min/IP; Vercel mirrors it with a best-effort in-memory limiter in `api/_lib/rateLimit.mjs`). Prompt/logic changes must be made in both places — they are deliberate duplicates.

The user must set `ANTHROPIC_API_KEY` in the Vercel dashboard (Replit's AI-proxy integration doesn't exist there).
