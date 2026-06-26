---
name: Quiz AI generation token budget
description: Why the AI quiz route needs a large max_tokens and how to read its failures
---

# Quiz generation via Anthropic + web search

The `/api/quiz/generate` route asks Claude (with the `web_search_20250305` tool)
for 10 detailed questions returned as a single JSON array, then `JSON.parse`s it.

## Rule: keep max_tokens generous (>= 8000)
A small output budget (we shipped 2000 once) truncates the JSON mid-string. The
symptom is a server-side `SyntaxError: Expected ',' or '}' ... at position NNNN`
from `JSON.parse`, surfaced to the client as a generic 500/502 — NOT an API
error. 10 questions with facts + a whoami clue block + web-search tokens easily
exceed a few thousand tokens.

**Why:** web search consumes part of the same token budget as the final answer,
so the visible JSON gets cut off well before the model is "done".

**How to apply:** if quiz generation fails, read the API workflow logs and
distinguish two unrelated failure classes before touching prompts:
- `SyntaxError ... JSON.parse` → output truncated → raise max_tokens.
- Anthropic `BadRequestError 400 "credit balance is too low"` (fails in <1s) →
  the account's own ANTHROPIC_API_KEY is out of credits; not a code bug. The
  route maps this to a specific 503 message.

Prompts were already correct; do not rewrite them when chasing these errors.
Architecture is frontend -> /api/quiz/generate -> Anthropic SDK server-side.
Never call Anthropic from the browser (keeps the key server-only).
