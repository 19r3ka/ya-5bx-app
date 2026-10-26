# WALKTHROUGH: Specification corpus alignment

**Feature:** 003-specs-align · **Tasks:** T-01 to T-14 · **Agent / model:** implementing agent / implementing model · **Date:** 2026-10-26
**Status:** Complete with open items (owner actions and one spec defect)
**Verification:** Tests 228/228 · Build ok · Lint ok · No `src/` change against `origin/main`

> Written at the end of the session. Every "Yes" cites a command result. Two criteria fail for reasons outside the agent's write scope; both are recorded with the exact fix.

## 1. Task results

| Task | Result  | Evidence                                                                                               |
| ---- | ------- | ------------------------------------------------------------------------------------------------------ |
| T-01 | Done    | `specs/ROADMAP.md`: 15 rows, 9 Target, 2 Planned, 4 Built, five-column header                          |
| T-02 | Partial | `PLAN.md` written; `SPEC.md` is a staged draft, not yet copied by the owner                            |
| T-03 | Done    | 8 tasks with evidence; `design/phase3-implementation.md` moved; no `specs/phase3`                      |
| T-04 | Partial | `PLAN.md` written; `SPEC.md` staged                                                                    |
| T-05 | Done    | 27 tasks (25 ticked, P2-2 and P2-3 open); `design/` 26 files; no `specs/phase4`                        |
| T-06 | Partial | `PLAN.md` written; `SPEC.md` staged                                                                    |
| T-07 | Done    | 16 tasks (12 ticked, 2 partial, 2 open); `design/phase5-specs.md` moved; junk deleted                  |
| T-08 | Done    | 001 statuses normalized; revision rows added; vendor names removed                                     |
| T-09 | Done    | 002 statuses normalized; reconstruction note and temporary-path references removed; range T-01 to T-15 |
| T-10 | Partial | All hits fixed except two lines in the owner-guarded `003-specs-align/SPEC.md`                         |
| T-11 | Partial | Junk and folders gone; links resolve; the literal `specs/phase` grep cannot pass (spec defect CP-1)    |
| T-12 | Done    | `DECISIONS.md` D-012 with the mapping table                                                            |
| T-13 | Partial | This record; final close needs the owner's four actions in section 7                                   |
| T-14 | Done    | `specs/OUT_OF_SCOPE.md`: four sourced rows, five rules, linked from the roadmap                        |

## 2. What changed

| Area      | Change                                                              |
| --------- | ------------------------------------------------------------------- |
| Roadmap   | Rebuilt in the kit schema; 15 rows; out-of-scope pointer            |
| Register  | New `specs/OUT_OF_SCOPE.md`                                         |
| 004       | New four-file feature; phase-3 design moved                         |
| 005       | New four-file feature; phase-4 design and 22 mockup assets moved    |
| 006       | New four-file feature; phase-5 plan moved                           |
| 001       | Status and revision rows only; task text frozen                     |
| 002       | Status, revision row, reconstruction note removal; task text frozen |
| Decisions | D-012                                                               |

## 3. Acceptance criteria status

| Criterion | Met?    | Evidence                                                                                                                        |
| --------- | ------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------ | ------ | ------------------------------------------- |
| AC-1.1    | Yes     | Header is `ID                                                                                                                   | Description | Source | Status | Pulled into`; statuses are the four values. |
| AC-1.2    | Yes     | RM-07 is Built and cites `specs/002-gap-closure` (R1, AC-1.2).                                                                  |
| AC-1.3    | Yes     | RM-14 is Planned and cites `specs/006-production-completion` (R4).                                                              |
| AC-2.1    | **No**  | 004, 005 and 006 have `PLAN.md`, `TASKS.md`, `WALKTHROUGH.md`; each `SPEC.md` is staged for the owner and absent.               |
| AC-2.2    | Yes     | Phase documents and 22 assets are under the owning `design/`; no phase folders remain.                                          |
| AC-2.3    | Partial | The undelivered items are unchecked tasks in 005 and 006; their `SPEC.md` criteria require the owner's copy.                    |
| AC-3.1    | Yes     | 8/8, 25/25 and 12/12 ticked tasks carry an evidence note.                                                                       |
| AC-3.2    | Yes     | Browser checks are Claimed in the 004, 005 and 006 walkthroughs.                                                                |
| AC-3.3    | Yes     | 004 names `components/workout/PostWorkoutDialog.vue`, `components/progress/ProgressionMapGrid.vue` and `SEALED_USER_CONFIRMED`. |
| AC-4.1    | **No**  | Two matches remain, both in the owner-guarded `003-specs-align/SPEC.md` (section 7).                                            |
| AC-4.2    | Yes     | 002 spec and plan are Implemented/Delivered, the range is T-01 to T-15, and the temporary path is gone.                         |
| AC-4.3    | Yes     | Inline link check: 0 missing targets.                                                                                           |
| AC-5.1    | Yes     | 001 and 002 task files: no task line or body changed; headers and revision rows only.                                           |
| AC-6.1    | Yes     | `:Zone.Identifier` deleted; `specs/phase3`, `specs/phase4`, `specs/phase5` absent.                                              |
| AC-6.2    | **No**  | Impossible as written: the criterion and AC-2.2 name `specs/phase` themselves. See CP-1.                                        |
| AC-7.1    | Yes     | Every requirement has a task; every task cites R or AC IDs.                                                                     |
| AC-7.2    | Yes     | D-012 records mapping, numbering, the `design/` carrier and the frozen-task rule.                                               |

## 4. Commands and results

| Check            | Command                                                      | Result                                                   |
| ---------------- | ------------------------------------------------------------ | -------------------------------------------------------- |
| Feature folders  | `ls specs/`                                                  | 001 to 006, `OUT_OF_SCOPE.md`, `ROADMAP.md`, `_template` |
| Roadmap rows     | `grep -c '^\| RM-' specs/ROADMAP.md`                         | 15                                                       |
| Roadmap statuses | `awk` on column 5                                            | 9 Target, 2 Planned, 4 Built                             |
| 004 tasks        | `grep -c '^- \[' ...` / `'^- \[x\]'`                         | 8 / 8                                                    |
| 005 tasks        | same                                                         | 27 / 25                                                  |
| 006 tasks        | `[x]`, `[~]`, `[ ]`                                          | 12 / 2 / 2                                               |
| Banned names     | `grep -rniF -f .../banned-names.txt specs/ --include='*.md'` | 2 (owner SPEC only)                                      |
| Emoji            | `grep -rnP` over `specs/`                                    | Design wireframes only (mockup glyphs, kept as content)  |
| Links            | inline link checker                                          | 0 missing                                                |
| Phase folders    | `test ! -d specs/phase3 ...`                                 | pass                                                     |
| Source diff      | `git diff --stat origin/main...HEAD -- src/`                 | empty                                                    |
| Tests            | `npm test`                                                   | 31 files, 228 passed                                     |
| Build            | `npm run build`                                              | ok, PWA assets generated                                 |
| Lint             | `npm run lint`                                               | ok, no working-tree change                               |

## 5. Key decisions

- Move, do not rewrite: the original phase material is preserved in `design/`.
- Finished task text in 001/002 is frozen; only headers, statuses and notes change.
- Excluded capabilities live in one register, not in the roadmap.
- Undelivered phase-4 and phase-5 items stay open in their feature instead of being described as done.

## 6. Deviations

- **Owner-guarded SPEC.** The agent cannot write `SPEC.md`. Three feature specs are staged outside the repository; the 003 spec still carries its draft wrapper.
- **T-07 tick count.** The plan expected 14 ticked tasks. The stricter re-check found T1-1 and T3-1 only partly met, so 006 records 12 ticked, 2 partial, 2 open.
- **006 T3-1 conflict.** The 005 design-system rule requires a border class; the phase-5 rule forbids scoped style blocks. Both cannot hold; the owner decides.
- **Local `main` is stale.** `main` points at the pre-002 commit; `origin/main` (8a21f60) is the base. The guards were run against `origin/main`.
- **Emoji.** Wireframe glyphs in `design/ux-spec.md` are user-visible content, not headings; they are kept. The phase-5 status ticks were removed.
- **Out-of-scope register.** This deliverable comes from the owner's instruction on 2026-10-26, beyond SPEC v0.1. It is recorded as T-14 and D-012.

## 7. Open items and exact fixes

1. Copy the three staged drafts (004, 005, 006) from the agent's plan directory into the matching feature folder; the close-out message carries the exact commands.
2. Trim the draft wrapper from `specs/003-specs-align/SPEC.md` (first five lines, including the copy instruction and the guard note).
3. Reword AC-4.2 so it does not contain a temporary path or a draft file name.
4. Resolve CP-1 (below) for AC-6.2.
5. After 1 to 4: tick T-02, T-04, T-06, T-10, T-11, T-13.

**Spec change proposal CP-1 — AC-6.2.** Problem: AC-6.2 requires zero markdown matches for `specs/phase`, but AC-2.2 and AC-6.2 itself name those folders, so the criterion can never pass. Proposed change: "Given the repository after the feature, when markdown links are resolved and non-historical documents are scanned, then no reference points at a removed phase folder; the only mentions are in this feature's own history and acceptance criteria." Why: the intent is no stale navigation, and the current wording makes the feature unclosable by construction.

## 8. How to verify

```sh
npm test && npm run build && npm run lint
git diff --stat origin/main...HEAD -- src/
grep -rniF -f ~/projects/sdd-kit/scripts/docs-rules/banned-names.txt specs/ --include='*.md'
test ! -d specs/phase3 && test ! -d specs/phase4 && test ! -d specs/phase5
```

## 9. Review packet

- This walkthrough, `SPEC.md` §5 to §6, the 14 task entries, and `git diff origin/main...HEAD -- specs/003-specs-align`.
- Feature surfaces to spot-check: `specs/ROADMAP.md`, `specs/OUT_OF_SCOPE.md`, and the three open-item notes in 005 and 006.
