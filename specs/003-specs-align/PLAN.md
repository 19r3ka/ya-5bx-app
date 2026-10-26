# PLAN: Specification corpus alignment

**Feature ID:** 003-specs-align · **Spec version:** 0.1 · **Status:** Draft · **Updated:** 2026-10-26

> HOW. Must satisfy every Must requirement in `SPEC.md` and pass the constitution check. Reuse before building. If the spec is ambiguous, raise a spec bug; do not guess in the plan.

## 1. Approach summary

Move, do not rewrite: each historical phase document becomes the `design/` carrier of its feature, while four thin kit files describe it. The 2026-10-26 audit is the single evidence source for task status; unproven checks stay open. The roadmap is regenerated in the kit schema with the same RM IDs, and permanently excluded capabilities move to one shared register so they can be reviewed per release. Existing 001/002 task text is frozen; only headers, statuses and notes change. No source code is touched.

## 2. Constitution check

| Principle / constraint                   | How this plan satisfies it                                                            | Status |
| ---------------------------------------- | ------------------------------------------------------------------------------------- | ------ |
| §1 Local-only data, safe storage         | No data, schema or storage change.                                                    | OK     |
| §2 Deterministic, tested domain data     | Audit reads the shipped tests; no dataset edit.                                       | OK     |
| §4 Bilingual parity, no hardcoded copy   | Documentation only; no user-facing string changes.                                    | OK     |
| §6 Status never conveyed by colour alone | Criteria and statuses are text in documents; manual checks are labelled, not implied. | OK     |
| Quality gate: build, lint, tests         | Untouched tree; the suite is run once at close to prove `src/` did not move.          | OK     |
| No secrets in the repository             | Only file names and paths are quoted; no environment values.                          | OK     |

## 3. Reuse audit

| Asset                                          | Covers                                               | Gap                                                                                 |
| ---------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------- |
| `specs/_template/*.md` (kit 0.3.0 shape)       | Section order, ID conventions, task fields           | None; used verbatim as the skeleton.                                                |
| `~/projects/sdd-kit/template/specs/ROADMAP.md` | Five columns, four statuses, source rule             | None; adapted with the project's RM IDs.                                            |
| `specs/phase3                                  | 4                                                    | 5/\*`                                                                               | Detailed design, task history, manual checklists | Superseded as the working surface; becomes `design/`. |
| `specs/001-baseline`, `specs/002-gap-closure`  | Evidence style, review log, walkthrough structure    | Header/status drift only.                                                           |
| 2026-10-26 audit (this session)                | Code path + test or command per claim                | Manual checks have no automated proof.                                              |
| `docs.sh` rules in the kit                     | Naming, banned product names, link and ID discipline | Rules are kit-scoped; the checks are re-expressed as project commands in section 8. |

No new dependency, script or tool is added.

## 4. Architecture

```text
specs/
├── ROADMAP.md                     five-column roadmap, one row per capability
├── 001-baseline/                  existing; headers/status only
├── 002-gap-closure/               existing; headers/status only
├── 003-specs-align/               this feature (spec, plan, tasks, walkthrough)
├── 004-progression/
│   ├── SPEC.md PLAN.md TASKS.md WALKTHROUGH.md
│   └── design/phase3-implementation.md
├── 005-ux-implementation/
│   ├── SPEC.md PLAN.md TASKS.md WALKTHROUGH.md
│   └── design/{ux-spec.md, phase4-implementation_plan.md, phase4-corrections.md, *.html, *.png}
├── 006-production-completion/
│   ├── SPEC.md PLAN.md TASKS.md WALKTHROUGH.md
│   └── design/phase5-specs.md
└── _template/                     unchanged
```

Responsibilities:

- `SPEC.md`: requirements and criteria only; no filenames or schemas.
- `PLAN.md`: approach, reuse, file map; points at `design/` for detail instead of duplicating it.
- `TASKS.md`: ordered tasks with `Refs / Depends / Files / Do / Done when / Out of scope / Notes`; every done task cites evidence.
- `WALKTHROUGH.md`: per-criterion status, deviations, gaps, verification commands.
- `design/`: original detailed documents; moved, not rewritten, so no detail is lost.

## 5. Data model

No runtime data. Document-level identifiers:

| Entity        | Fields                                         | Rule                                                          |
| ------------- | ---------------------------------------------- | ------------------------------------------------------------- |
| Requirement   | `R#` per feature, `AC-#.#` criteria            | Stable within a feature; numbered from 1 in each new feature. |
| Task          | `T-###` per feature                            | Sequential; never renumbered after approval.                  |
| Roadmap item  | `RM-##`                                        | Existing IDs preserved; new IDs continue the sequence.        |
| Decision      | `D-###`                                        | `D-012` records this reconciliation.                          |
| Evidence note | task id, code path, test file or command, date | One line per done task; no prose.                             |

## 6. Interfaces and contracts

- Task header contract (all new features): the seven fields from `_template/TASKS.md`, with `Refs` naming at least one R or AC.
- Evidence contract: a done task's `Notes` contains `Evidence: <path> · <test or command>`; a Claimed criterion is written `Claimed` in the walkthrough and never `Yes`.
- Roadmap contract: `Status` is one of `Target`, `Planned`, `Built`, `Dropped`; `Source` is non-empty; `Pulled into` names a feature folder plus R/AC or `-`.
- Link contract: every relative markdown link resolves from the file that contains it.
- Naming contract: no vendor or product names in `specs/`; use role words (`Owner`, `Implementing agent`, `Reviewer`) or the project name.

## 7. File changes

| Path                                                               | New / Modified | Purpose                                                            |
| ------------------------------------------------------------------ | -------------- | ------------------------------------------------------------------ |
| `specs/003-specs-align/SPEC.md`                                    | New            | This feature's requirements (owner-saved; permission-guarded).     |
| `specs/003-specs-align/PLAN.md`                                    | New            | This plan.                                                         |
| `specs/003-specs-align/TASKS.md`                                   | New            | Ordered execution.                                                 |
| `specs/003-specs-align/WALKTHROUGH.md`                             | New            | Session record.                                                    |
| `specs/ROADMAP.md`                                                 | Modified       | Kit schema; same IDs; Built/Planned rows; out-of-scope pointer.    |
| `specs/OUT_OF_SCOPE.md`                                            | New            | Shared register of permanently excluded capabilities with sources. |
| `specs/004-progression/{SPEC,PLAN,TASKS,WALKTHROUGH}.md`           | New            | Phase 3 as a feature.                                              |
| `specs/004-progression/design/phase3-implementation.md`            | Moved          | Detailed design.                                                   |
| `specs/005-ux-implementation/{SPEC,PLAN,TASKS,WALKTHROUGH}.md`     | New            | Phase 4 as a feature.                                              |
| `specs/005-ux-implementation/design/`                              | Moved          | UX spec, implementation plan, corrections, 16 mockups.             |
| `specs/006-production-completion/{SPEC,PLAN,TASKS,WALKTHROUGH}.md` | New            | Phase 5 as a feature.                                              |
| `specs/006-production-completion/design/phase5-specs.md`           | Moved          | Detailed production plan.                                          |
| `specs/001-baseline/*.md`                                          | Modified       | True status, version, no banned names.                             |
| `specs/002-gap-closure/*.md`                                       | Modified       | True status, version, stale notes removed.                         |
| `DECISIONS.md`                                                     | Modified       | `D-012`.                                                           |
| `specs/phase5/phase5-specs.md:Zone.Identifier`                     | Deleted        | Junk stream file.                                                  |
| `specs/phase3`, `specs/phase4`, `specs/phase5`                     | Deleted        | Empty after the moves.                                             |

## 8. Test strategy

Documentation has no runtime test suite; every criterion is verified by a command with a pass condition. Run from the repository root.

| Criterion     | Check type        | Location / command                                                                                                                                |
| ------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1.1        | scripted          | `sed -n '5p' specs/ROADMAP.md` names the five columns; every status cell is Target, Planned, Built or Dropped                                     |
| AC-1.2        | scripted          | `grep -n 'RM-07' specs/ROADMAP.md` shows `Built` and `002-gap-closure`                                                                            |
| AC-1.3        | scripted          | `grep -n 'RM-14' specs/ROADMAP.md` shows `Planned` and `006-production-completion`                                                                |
| AC-2.1        | scripted          | loop `for f in SPEC PLAN TASKS WALKTHROUGH; do test -f specs/00N-slug/$f.md; done` for N = 4, 5, 6                                                |
| AC-2.2        | scripted          | `test -d specs/005-ux-implementation/design && test ! -d specs/phase3 && test ! -d specs/phase4 && test ! -d specs/phase5`                        |
| AC-2.3        | manual            | read `006/TASKS.md`: self-driven timer and exercise-list tasks are unchecked and cite R/AC                                                        |
| AC-3.1        | scripted          | `grep -c 'Evidence:' specs/00{4,5,6}-*/TASKS.md` equals the number of ticked tasks                                                                |
| AC-3.2        | scripted          | `grep -n 'Claimed' specs/005-ux-implementation/WALKTHROUGH.md` lists the seven manual checks                                                      |
| AC-3.3        | scripted          | `grep -n 'components/workout/PostWorkoutDialog.vue' specs/004-progression/TASKS.md` and no `ProgressionMap.vue`                                   |
| AC-4.1        | scripted          | `grep -rniF -f ~/projects/sdd-kit/scripts/docs-rules/banned-names.txt specs/ --include='*.md'` returns nothing                                    |
| AC-4.2        | scripted          | `head -6 specs/002-gap-closure/{SPEC,PLAN,WALKTHROUGH}.md`; `grep -rn '/tmp/\|SPEC-draft' specs/` returns nothing                                 |
| AC-4.3        | scripted          | inline link checker: for each `](target)` with a relative target, `test -e` on the resolved path                                                  |
| AC-5.1        | scripted + manual | `git diff main...HEAD -U0 -- specs/001-baseline/TASKS.md specs/002-gap-closure/TASKS.md`; every changed line is a header, status or appended note |
| AC-6.1        | scripted          | `test ! -e 'specs/phase5/phase5-specs.md:Zone.Identifier'` and `test ! -d specs/phase5`                                                           |
| AC-6.2        | scripted          | `grep -rn 'specs/phase' specs/ --include='*.md'` returns nothing                                                                                  |
| AC-7.1        | scripted          | each new `TASKS.md` has a `## Coverage matrix` section and every task block has `Refs:`                                                           |
| AC-7.2        | scripted          | `grep -n 'D-012' DECISIONS.md` shows mapping, numbering, design carrier, no-rewrite                                                               |
| Whole feature | scripted          | `git diff --stat main...HEAD -- src/` is empty; `npm test` reports 228/228 at close                                                               |

## 9. Risks and mitigations

| Risk                                                                 | Likelihood | Impact               | Mitigation                                                                                                 |
| -------------------------------------------------------------------- | ---------- | -------------------- | ---------------------------------------------------------------------------------------------------------- |
| `SPEC.md` is permission-guarded for the agent                        | Certain    | Blocks file creation | The owner saves the draft; the plan and tasks proceed and cite it.                                         |
| Design detail lost in conversion                                     | Medium     | High                 | Move originals into `design/`; never paraphrase detail into the four files.                                |
| Broken relative links after the moves                                | Medium     | Medium               | Link check in section 8 runs before the cleanup commit.                                                    |
| Binary mockups inflate the diff                                      | Certain    | Low                  | Move with `git mv`; review with `git diff --stat -M`.                                                      |
| Scope creep into the two code regressions and the open phase-5 items | Medium     | Medium               | Non-goal in SPEC §4; recorded as tasks and DISCOVERED items, not fixed.                                    |
| Tick copied without proof                                            | Low        | High                 | Evidence rule in section 6; AC-3.1 count check.                                                            |
| Out-of-scope register drifts from the spec                           | Low        | Medium               | Every row cites a source; the register is reviewed at each release and changes only through a spec change. |

## 10. Key decisions

- `D-012`: phase-to-feature mapping, numbering, `design/` carrier, no-rewrite rule, docs-only scope.

## 11. Phases

| Phase | Shippable deliverable                                                | Requirements covered |
| ----- | -------------------------------------------------------------------- | -------------------- |
| M1    | Roadmap in kit schema with Built/Planned rows                        | R1, R7               |
| M2    | Three feature folders with four files and moved design               | R2, R3, R7           |
| M3    | 001/002 headers and statuses truthful; no banned names or stale refs | R4, R5               |
| M4    | Junk and phase folders removed, links resolve, D-012, walkthrough    | R5, R6, R7           |

## 12. Revision log

| Version | Date       | Change      | Reason                         |
| ------- | ---------- | ----------- | ------------------------------ |
| 0.1     | 2026-10-26 | First draft | Reconcile the phase documents. |
