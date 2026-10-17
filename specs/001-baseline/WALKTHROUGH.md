# WALKTHROUGH: baseline

**Feature:** 001-baseline · **Tasks:** T-00x to T-00y · **Agent / model:** <tool + model> · **Date:** 2026-10-16
**Status:** Complete | Complete with notes | Blocked
**Verification:** Tests <pass/total> · Typecheck <ok/fail> · Lint <ok/N warnings> · Build <ok/fail>

> Written by the implementing agent at the end of every session. Factual and dense: no narrative, no celebration. This is the handoff to the next agent and the primary input to the reviewer. Mark a criterion "claimed" when no test or recorded check proves it.

## 1. Task results

| Task  | Refs       | Result (Done / Partial / Blocked) | Evidence (test name or command output) |
| ----- | ---------- | --------------------------------- | -------------------------------------- |
| T-001 | R1, AC-1.1 | Done                              | <...>                                  |

## 2. What changed

| File        | Change                       | Summary    |
| ----------- | ---------------------------- | ---------- |
| `path/file` | Modified / Created / Deleted | <one line> |

## 3. Acceptance criteria status

| Criterion | Met? (Yes / No / Claimed) | Evidence              |
| --------- | ------------------------- | --------------------- |
| AC-1.1    | Yes                       | <test or manual step> |

## 4. Key decisions

- <decision>: <reason>. Logged as D-0xx if non-obvious.

## 5. Assumptions made

- <anything inferred where SPEC, PLAN, or the task was silent>

## 6. Deviations

- <anything that differs from SPEC, PLAN, or TASKS, or touched files outside the task scope. Write "None" if none.>

## 7. Known gaps and follow-ups

- <noticed but out of scope; debt introduced and why>

## 8. How to verify

```sh
<commands>
```

## 9. Review packet (paste to the reviewer)

- This walkthrough
- Relevant parts of `SPEC.md`: only the cited R and AC entries
- The task entries from `TASKS.md`
- Diff: `git diff main...HEAD` (or `git diff --staged`); split by phase if it exceeds ~800 lines
