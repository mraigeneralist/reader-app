---
description: Write HANDOFF.md and commit work so a fresh session can continue
argument-hint: [optional note about what to focus on next]
---

Prepare this session to be closed and picked up later by a fresh session that has none of this conversation's context.

## 1. Write `HANDOFF.md` at the repo root

Overwrite any existing file. Keep it under ~60 lines — it's read at the start of every new session, so every line costs tokens. Use this structure:

```markdown
# Handoff — <today's date, YYYY-MM-DD>

## Goal
The current task / feature in 1–3 lines.

## Done this session
- Concrete changes, with file paths where useful.

## In progress / broken
- What's half-finished or failing. Include the exact error message or command output that matters (trimmed), not a paraphrase.

## Next steps
1. Ordered, concrete actions the next session should take first.

## Decisions & gotchas
- Non-obvious choices made and why, dead ends already tried, traps to avoid.
```

Rules:
- Write only what a new session can't learn from `git log`, `git diff`, or the code itself. Don't list every file touched.
- Be specific: "`npx expo run:android` fails with `<error>`" beats "build is broken".
- If a step is unverified, say so.
- Extra focus from the user, if any: $ARGUMENTS

## 2. Commit

- Run `git status`. Don't stage secrets or local-only files (`.env*`, keystores, credentials, large build artifacts). If you see any, leave them out and mention them.
- Stage the work and `HANDOFF.md`, then commit on the current branch with a message like `WIP: <short summary>` and a body that points to HANDOFF.md.
- Don't push.

## 3. Report

Reply with a 2–3 line summary and the exact line to paste into the new session:

> Read HANDOFF.md and continue from "Next steps".
