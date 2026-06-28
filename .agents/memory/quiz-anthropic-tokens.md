---
name: Quiz/predict AI generation
description: How the AI quiz + Race Predictor routes call Anthropic, the token-budget gotcha, and how to read their failures
---

# AI generation for quizzes + Race Predictor

These routes ask Claude for JSON and parse it: the quiz route (`/api/quiz/generate`)
returns 10 questions as a JSON array; the predictor (`/api/predict/race`) returns a
single JSON object.

## Provider: Replit-billed managed AI (NOT a personal key)
Quiz + predictor use the Replit AI Integrations Anthropic proxy via the shared
client `import { anthropic } from "@workspace/integrations-anthropic-ai"`
(configured by AI_INTEGRATIONS_ANTHROPIC_BASE_URL / _API_KEY — auto-provisioned,
never edit). Setup requires Replit account phone verification first. Model must be
one the integration supports (we use claude-sonnet-4-6).

**Confirmed:** the `web_search_20250305` server tool works through the proxy —
review-mode quizzes return live race results. Preview mode runs without web search
(history-based); review mode enables it.

Note: `bingo.ts` and `standings.ts` still use a personal ANTHROPIC_API_KEY (not
migrated). Mixed credential model is intentional for now.

## Rule: keep max_tokens generous (8192)
A small output budget truncates the JSON mid-string. The symptom is a server-side
`SyntaxError: Expected ',' or '}' ... at position NNNN` from `JSON.parse`. 10
questions with facts + a whoami clue block + web-search tokens easily exceed a few
thousand tokens.

**Why:** web search consumes part of the same token budget as the final answer.

## Reading failures
- `SyntaxError ... JSON.parse` → output truncated → raise max_tokens.
- Anthropic `BadRequestError 400 "credit balance is too low"` (fails in <1s) →
  out of credits; the routes map this to a 503 message. Architecture is always
  frontend -> /api/* -> Anthropic SDK server-side; never call Anthropic from the
  browser (keeps any key server-only).
