# TASKS: <Feature name>

**Feature ID:** NNN-<slug> · **Spec v:** x.y · **Plan v:** x.y · **Updated:** <date>

> Ordered, atomic, agent-proof. One task = one session = one commit. Agents tick boxes and append Notes; they do not rewrite tasks. Scope changes go through the reviewer.

## How an agent uses this file
1. Take the first unchecked task whose dependencies are all ticked.
2. Read only: `AGENTS.md`, that task, the requirements and criteria it cites, and the files it lists.
3. Stop and report under "Blocked / questions" if the task is ambiguous, blocked, or fails twice.

## Sizing rules (for whoever writes tasks)
- At most 3 files, one verifiable behavior, one commit.
- Every acceptance criterion is covered by at least one task; every task cites at least one R or AC.
- Test first or alongside, never "tests later".
- Write for a cheaper model with no memory: name files, signatures, and the check explicitly.

## Task format
```text
- [ ] T-001 <imperative title>
  Refs: R1, AC-1.1, AC-1.2
  Depends: none | T-00x
  Files: <paths allowed to touch; mark new ones (new)>
  Do: <1 to 4 lines: what to build, key constraints, reuse pointers>
  Done when: <runnable check, e.g. `npm test -- budget.spec.ts` passes; observed behavior>
  Out of scope: <tempting adjacent work to avoid>
  Notes: <agent appends: decisions, surprises, commit hash>
```

## Phase 0: Setup
- [ ] T-001 <title>
  Refs:
  Depends: none
  Files:
  Do:
  Done when:
  Out of scope:
  Notes:

## Phase 1: <name> (delivers R1, R2)
- [ ] T-002 <title>

## Blocked / questions
- <task id>: <issue> (raised by <agent>, <date>)

## Phase reviews
- Phase 0: <date> · Not cleared | Conditionally cleared | Cleared · <link or note>

## Coverage matrix
| Requirement | Criteria | Tasks |
|-------------|----------|-------|
| R1 | AC-1.1, AC-1.2 | T-002, T-003 |
