# Threat Model

## Project Overview

Pit Lane is a small F1 fan application with a React frontend (`artifacts/pit-lane`) and an Express API (`artifacts/api-server`). The backend exposes public JSON endpoints that call Anthropic to generate race quizzes, standings, and predictions. PostgreSQL and Drizzle are wired into the workspace but the current production app does not appear to store business data yet.

Production assumptions for this scan:
- `NODE_ENV` is `production` when deployed.
- Replit handles TLS for deployed traffic.
- `artifacts/mockup-sandbox` is dev-only and should be ignored unless separately proven reachable in production.
- The API should be treated as internet-reachable when deployed unless deployment visibility explicitly limits access.

## Assets

- **Anthropic API key and paid model quota** — compromise or uncontrolled use can create direct financial loss and service exhaustion.
- **Application availability** — the public API backs core interactive features; abuse can make the product slow, expensive, or unavailable.
- **Server-side secrets** — environment variables such as `ANTHROPIC_API_KEY` and `DATABASE_URL` must never be exposed in responses or logs.
- **Future database connectivity** — the DB layer is present even though the current schema is effectively empty; injection and overbroad access remain relevant if data storage is added.

## Trust Boundaries

- **Browser to API** — all frontend input and all direct internet traffic to `/api/*` are untrusted.
- **API to Anthropic** — server routes spend privileged API quota on behalf of callers and must prevent abuse.
- **API to environment/secrets** — route handlers can access secrets; error handling and logging must not disclose them.
- **Internal/dev to production** — `artifacts/mockup-sandbox` and attached mockup assets are not production surfaces under the current assumptions.

## Scan Anchors

- Production entry points: `artifacts/api-server/src/index.ts`, `artifacts/api-server/src/app.ts`, `artifacts/pit-lane/src/main.tsx`.
- Highest-risk code areas: `artifacts/api-server/src/routes/*.ts` (public AI-backed endpoints), `artifacts/api-server/src/lib/logger.ts`, and frontend components that call `/api/*`.
- Public surface: `/api/healthz`, `/api/quiz/generate`, `/api/predict/race` plus the pit-lane SPA. (Standings are now sorted client-side from user-entered data; the former AI-backed `/api/standings/refresh` route was removed.)
- Dev-only by default: `artifacts/mockup-sandbox/**`, `attached_assets/**`, generated mockup HTML unless separately deployed.

## Threat Categories

### Tampering

The API accepts caller-controlled JSON that is interpolated into prompts sent to Anthropic. Request bodies must be validated server-side and downstream AI output must be treated as untrusted until parsed and shape-checked. Client-side behavior and prompt wording are not security controls.

### Information Disclosure

The server can access `ANTHROPIC_API_KEY` and other environment secrets. Error responses and logs must avoid returning internal exception details, upstream metadata, or secrets. Any future authenticated or database-backed endpoints must also avoid returning other users' data.

### Denial of Service

This project's most important security guarantee is preventing untrusted internet callers from using the backend as an unrestricted paid AI proxy. Public endpoints that trigger Anthropic requests must enforce abuse controls such as authentication, rate limits, quotas, caching, or equivalent server-side throttling so attackers cannot burn model spend or exhaust capacity.

### Elevation of Privilege

There are no user roles today, but every server-side call to Anthropic is a privileged operation because it spends the application's own API quota. Anonymous callers must not be able to exercise that privilege without deliberate server-side controls. If the dormant DB layer becomes active, all queries must remain parameterized and server-side authorization must be added before user data is introduced.
