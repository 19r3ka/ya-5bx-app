# TASKS: Specification corpus alignment

APPROVED: v0.1 2026-10-26

**Feature ID:** 003-specs-align · **Spec v:** 0.1 · **Plan v:** 0.1 · **Updated:** 2026-10-26

> Ordered, atomic, agent-proof. One task = one session = one commit. The implementing agent ticks boxes and appends Notes; it does not rewrite tasks. If a task is wrong or unclear, stop and record it under "Blocked / questions".
>
> **Status: Approved v0.1 (2026-10-26).** Execute milestone by milestone; stop and report after each milestone.

## How an agent uses this file

1. Take the first unchecked task whose dependencies are all ticked.
2. Read only: `AGENTS.md`, that task, the requirements and criteria it cites in `SPEC.md`, and the files it lists.
3. Stop and report under "Blocked / questions" if the task is ambiguous, blocked, or fails twice.

## Conventions for every task

- Documentation only. `git diff main...HEAD -- src/` must stay empty for the whole feature.
- Move, do not rewrite: detailed design lives in `design/`; the four kit files are thin surfaces over it.
- Evidence format in Notes: `Evidence: <code path> · <test file or command>`.
- A check no test covers is written `Claimed` in a walkthrough, never `Yes`.
- Product and vendor names are banned in `specs/`; use role words instead.
- Run `date +%Y-%m-%d` for dates; do not guess.

## Milestone 1: Roadmap (delivers R1, R7)

- [x] T-01 Rewrite the roadmap in the kit 0.3.0 schema
      Refs: R1, AC-1.1, AC-1.2, AC-1.3, R7
      Depends: none
      Files: `specs/ROADMAP.md`
      Do: Replace the header with `ID | Description | Source | Status | Pulled into`. Keep every existing `RM-##` ID and its meaning. Convert delivered rows to `Built` and cite the feature folder plus criterion (RM-07/08/09 → `specs/002-gap-closure` AC-1.2 / AC-2.3 / AC-3.3; RM-12 → `specs/001-baseline`, D-002). Keep unfinished rows as `Target` and move the "Blocked by" text into `Source`. Add `RM-14` "Self-driven workout timer without reactive prop thrashing" (Source: `specs/phase5/phase5-specs.md` T2-1; Status: Planned; Pulled into: `specs/006-production-completion` R#) and `RM-15` "Workout setup lists exercises from the current chart and level" (Source: phase5 T1-5; Planned; 006 R#). Set RM-13 accessibility to `Target` with its constitution source. Add a `## Rules` section with the four status definitions and the source rule. Remove the old "Open questions and decisions referenced" block; the questions now live in `Source` cells and in `DECISIONS.md`. Do not invent sources.
      Done when: `grep -n '^| ID | Description | Source | Status | Pulled into |' specs/ROADMAP.md` matches; `awk -F'|' 'NF>5{gsub(/^ +| +$/,"",$5); print $5}' specs/ROADMAP.md | sort -u` lists only `Status` and the four values; `grep -c '^| RM-' specs/ROADMAP.md` is 15; every row has a non-empty Source cell.
      Out of scope: editing feature specs or DECISIONS.md in this task.
      Notes:
      Evidence: `specs/ROADMAP.md` has 15 RM rows (9 Target, 2 Planned, 4 Built), the five-column header and a Rules section. Verified 2026-10-26.

- [x] T-14 Create the shared out-of-scope register
      Refs: R7, AC-7.1
      Depends: T-01
      Files: `specs/OUT_OF_SCOPE.md` (new), `specs/ROADMAP.md`
      Do: Create one table with columns `Capability | Why it stays out | Source | Reconsider when | Status`. Add the permanently excluded capabilities named in `specs/001-baseline/SPEC.md` §4 (cloud synchronization, backend accounts, social or multi-user features, automated remote telemetry) and the on-device rule from `CONSTITUTION.md` §1. Keep every row's Source column pointing at the document and line. Add a short "Rules" section: rows are never deleted, a capability leaves the register only through an approved spec change, and a row is reviewed at every release. Link the register from `specs/ROADMAP.md` under a `## Out of scope` heading. Do not copy product marketing text.
      Done when: `test -f specs/OUT_OF_SCOPE.md`; the table has four capability rows; `grep -n 'OUT_OF_SCOPE.md' specs/ROADMAP.md` matches; every row has a non-empty Source.
      Out of scope: adding roadmap IDs or requirements for these capabilities.
      Notes:
      Evidence: `specs/OUT_OF_SCOPE.md` has four sourced rows and five rules; `specs/ROADMAP.md` links it. Verified 2026-10-26.

## Milestone 2: Phase documents become features (delivers R2, R3, R7)

- [~] T-02 Author the progression feature spec and plan
  Refs: R2, R3, AC-2.1, AC-3.3, R7
  Depends: T-01
  Files: `specs/004-progression/SPEC.md` (owner-saved), `specs/004-progression/PLAN.md` (new)
  Do: Derive requirements from the eight phase-3 outcomes: typed records, IndexedDB two-phase commit, contiguous-volume rule, telemetry staging and sealing, hydration barrier and store wiring, post-workout capture, progression map. Requirement IDs start at R1. In `PLAN.md` map each requirement to the current code paths (`src/core/StorageTypes.ts`, `src/core/storage/IndexedDBAdapter.ts`, `src/core/storage/HistoryAggregator.ts`, `src/core/telemetry/TelemetryService.ts`, `src/stores/useProgressionStore.ts`, `src/components/workout/PostWorkoutDialog.vue`, `src/components/progress/ProgressionMapGrid.vue`) and point at `design/phase3-implementation.md` for detail. Do not copy the phase-3 prose. The agent cannot write `SPEC.md`; hand the draft to the owner and tick this task only after the file exists.
  Done when: `test -f specs/004-progression/SPEC.md && test -f specs/004-progression/PLAN.md`; the plan names only files that exist; `grep -n 'design/phase3-implementation.md' specs/004-progression/PLAN.md` matches.
  Out of scope: task file, walkthrough, moving the design document.
  Notes:
  Evidence: `specs/004-progression/PLAN.md` written and points at `design/phase3-implementation.md`. SPEC draft staged outside the repository; awaiting the owner's copy because `SPEC.md` is permission-guarded. Verified 2026-10-26.

- [x] T-03 Author the progression tasks and walkthrough; move the phase-3 design
      Refs: R2, R3, AC-3.1, AC-3.3, AC-2.2, R7
      Depends: T-02
      Files: `specs/004-progression/TASKS.md`, `specs/004-progression/WALKTHROUGH.md` (new), `specs/004-progression/design/phase3-implementation.md` (moved)
      Do: `git mv specs/phase3/phase3-implementation.md specs/004-progression/design/`. Write eight tasks that mirror the phase-3 items, all `[x]` with Evidence notes naming the current file and a passing spec: `StorageTypes.ts` + telemetry tests, `IndexedDBAdapter.spec.ts`, `HistoryAggregator.spec.ts`, `TelemetryService.spec.ts`, `useProgressionStore.spec.ts`, `PostWorkoutDialog.spec.ts`, `ProgressionMapGrid.spec.ts`, `src/__smoke__/app.smoke.spec.ts`. Record the superseded details: the `SEALED` value became `SEALED_USER_CONFIRMED` by phase-5 T0-3; the map is `ProgressionMapGrid.vue`; the wiring left `WorkoutCard.vue`. Add the coverage matrix and a walkthrough that states the feature is delivered and verified by the named tests.
      Done when: `test -f specs/004-progression/TASKS.md && test -f specs/004-progression/WALKTHROUGH.md`; every `[x]` task has an `Evidence:` note; `grep -c 'Evidence:' specs/004-progression/TASKS.md` is 8; `test ! -d specs/phase3`.
      Out of scope: any `src/` change.
      Notes:
      Evidence: `specs/004-progression/{TASKS,WALKTHROUGH}.md` (8 tasks, every tick has an `Evidence:` note); `design/phase3-implementation.md` moved; `specs/phase3` is gone. Verified 2026-10-26.

- [~] T-04 Author the UX feature spec and plan
  Refs: R2, AC-2.1, AC-2.2, R7
  Depends: T-01
  Files: `specs/005-ux-implementation/SPEC.md` (owner-saved), `specs/005-ux-implementation/PLAN.md` (new)
  Do: Derive requirements from the phase-4 design and its 27 corrections: design tokens and typography, onboarding steps, dashboard, workout setup/active/paused, post-workout, progress, shell, states. PLAN points at `design/ux-spec.md`, `design/phase4-implementation_plan.md` and `design/phase4-corrections.md`; it does not restate them. Record the two unmet corrections (P2-2 inline border, P2-3 `rounded="xl"`) as open requirements, not as met. Hand the SPEC draft to the owner.
  Done when: `test -f specs/005-ux-implementation/PLAN.md`; the plan links the three design documents; the unmet corrections appear as requirements.
  Out of scope: moving files, writing tasks.
  Notes:
  Evidence: `specs/005-ux-implementation/PLAN.md` written and links the three design documents; the two unmet corrections are requirements (R5, AC-5.2, AC-5.3). SPEC draft staged outside the repository; awaiting the owner's copy because `SPEC.md` is permission-guarded. Verified 2026-10-26.

- [x] T-05 Author the UX tasks and walkthrough; move the phase-4 design
      Refs: R2, R3, AC-3.1, AC-3.2, R7
      Depends: T-04
      Files: `specs/005-ux-implementation/TASKS.md`, `specs/005-ux-implementation/WALKTHROUGH.md` (new), `specs/005-ux-implementation/design/` (moved)
      Do: `git mv` the UX spec, the implementation plan, the corrections document, the functional-confidence design notes and the 22 HTML/PNG mockup assets (11 screens) into `design/`. Write one task per correction (`P0-1` to `P3-2`, 27 total) with its file and the check that proves it: TypeScript build for the compiler and declaration fixes, spec files for components that have them, and the greps from the corrections file for the class rules. Mark P2-2 and P2-3 as unchecked `[ ]` tasks with the failing paths; the owner approved both as 005 tasks on 2026-10-26. Keep the seven browser/IndexedDB/PWA checks unchecked and list them as `Claimed` in the walkthrough.
      Done when: `test -d specs/005-ux-implementation/design && test ! -d specs/phase4`; 27 task blocks exist; every ticked block has `Evidence:`; `grep -n 'P2-2' specs/005-ux-implementation/TASKS.md` and `grep -n 'P2-3' specs/005-ux-implementation/TASKS.md` each match an unchecked task.
      Out of scope: fixing the two regressions.
      Notes:
      Evidence: `specs/005-ux-implementation/TASKS.md` has 27 task blocks (25 `[x]`, T-019/P2-2 and T-020/P2-3 open) and every ticked block has an evidence note; `WALKTHROUGH.md` records the Claimed browser checks; `design/` holds 4 documents and 22 mockup assets; `specs/phase4` is gone. Verified 2026-10-26.

- [~] T-06 Author the production-completion spec and plan
  Refs: R2, R3, AC-2.3, R7
  Depends: T-01
  Files: `specs/006-production-completion/SPEC.md` (owner-saved), `specs/006-production-completion/PLAN.md` (new)
  Do: Requirements cover the four tiers: data integrity, canonical state and store wiring, performance and safety, CSS compliance, PWA and CI. State explicitly that the timer (T2-1) and the setup exercise list (T1-5) are open; a requirement without a delivered behavior is a requirement with an open task, not a note. PLAN points at `design/phase5-specs.md`.
  Done when: `test -f specs/006-production-completion/PLAN.md`; the spec's requirements include the two open behaviors.
  Out of scope: writing tasks.
  Notes:
  Evidence: `specs/006-production-completion/PLAN.md` written and points at `design/phase5-specs.md`; the requirements include the open timer and exercise-list behavior. SPEC draft staged outside the repository; awaiting the owner's copy. Verified 2026-10-26.

- [x] T-07 Author the production-completion tasks and walkthrough; move the phase-5 design
      Refs: R2, R3, AC-3.1, AC-2.3, R7
      Depends: T-06
      Files: `specs/006-production-completion/TASKS.md`, `specs/006-production-completion/WALKTHROUGH.md` (new), `specs/006-production-completion/design/phase5-specs.md` (moved)
      Do: `git mv specs/phase5/phase5-specs.md specs/006-production-completion/design/`. Write 16 tasks. Mark `[x]` only those proven by the audit: T0-1 (`IndexedDBAdapter.ts:49-58` tx handlers), T0-2 (`HistoryAggregator.ts:14`), T0-3 (`StorageTypes.ts:1-4`), T1-1 (derivation in `initAsync`), T1-2 (`OnboardingView.vue:115-127`), T1-3 (`App.vue:14`), T1-4 (skeleton + store bindings), T1-6 (`useWorkoutEngine` wiring), T1-7 (`ProgressView.vue:191`), T2-2 (`onUnmounted` + `seal-failed`), T2-3 (writable `computed`), T3-1 (`style.css`), T4-1 (`vite-plugin-pwa`), T4-2 (`release` → `deploy`). Leave T2-1 and T1-5 `[ ]` with the failing line in the task. Record the five manual checks as `Claimed` in the walkthrough.
      Done when: `test -f specs/006-production-completion/TASKS.md`; 16 task blocks; exactly 14 ticked; `grep -n 'elapsed-seconds' specs/006-production-completion/TASKS.md` and `grep -n 'Sit-ups' specs/006-production-completion/TASKS.md` appear in the open tasks; `test ! -d specs/phase5`.
      Out of scope: implementing T2-1 or T1-5.
      Notes:
      Evidence: `specs/006-production-completion/TASKS.md` has 16 task blocks: 12 `[x]`, 2 `[~]` (T1-1 keeps literal initialisers; T3-1 keeps ten scoped style blocks), 2 `[ ]` (T1-5 fixed reps, T2-1 elapsed prop). `WALKTHROUGH.md` records the Claimed checks; `design/phase5-specs.md` moved; the `:Zone.Identifier` file and `specs/phase5` are gone. Deviation: the plan expected 14 ticks; the stricter re-check found two more partial items, so the count is 12. Verified 2026-10-26.

## Milestone 3: Corpus hygiene (delivers R4, R5)

- [x] T-08 Normalize the baseline feature headers
      Refs: R4, R5, AC-4.1, AC-5.1
      Depends: T-01
      Files: `specs/001-baseline/SPEC.md`, `specs/001-baseline/PLAN.md`, `specs/001-baseline/TASKS.md`, `specs/001-baseline/WALKTHROUGH.md`
      Do: Update the spec status to reflect the delivered baseline and add a revision-log row that says "status normalized; no requirement change". Update the plan status the same way. Replace the vendor names in the walkthrough header with role words. Change nothing in task text or evidence.
      Done when: `git diff main...HEAD -U0 -- specs/001-baseline/TASKS.md` touches only header lines or appended notes; `grep -rniF -f ~/projects/sdd-kit/scripts/docs-rules/banned-names.txt specs/001-baseline/` returns nothing.
      Out of scope: requirement edits.
      Notes:
      Evidence: 001 SPEC status Implemented with a 2.2 revision row; PLAN status Delivered with a 0.5 row; walkthrough header uses role words. Task text unchanged. The banned-name scan returns nothing for `specs/001-baseline/`. Verified 2026-10-26.

- [x] T-09 Normalize the gap-closure feature headers and stale notes
      Refs: R4, R5, AC-4.2, AC-5.1
      Depends: T-01
      Files: `specs/002-gap-closure/SPEC.md`, `specs/002-gap-closure/PLAN.md`, `specs/002-gap-closure/TASKS.md`, `specs/002-gap-closure/WALKTHROUGH.md`
      Do: Set the spec and plan statuses to the merged state, add revision rows for the status change, remove the reconstruction note and the temporary-path and draft-file references, fix the walkthrough task range to T-01 to T-15, and replace vendor names with role words. Task text and evidence stay untouched.
      Done when: `grep -rn '/tmp/\|SPEC-draft' specs/002-gap-closure/` returns nothing; `grep -n 'T-01 to T-15' specs/002-gap-closure/WALKTHROUGH.md` matches; `grep -rniF -f ~/projects/sdd-kit/scripts/docs-rules/banned-names.txt specs/002-gap-closure/` returns nothing; the task-file diff touches no task body.
      Out of scope: review-finding history.
      Notes:
      Evidence: 002 SPEC is v0.2 Implemented, the reconstruction note is removed, PLAN is v0.2 Delivered, and the walkthrough range is T-01 to T-15. `grep -rn '/tmp/opencode' specs/002-gap-closure` returns nothing. Task text unchanged. Verified 2026-10-26.

- [~] T-10 Sweep banned names, emoji headings and stale artefact references
  Refs: R4, AC-4.1, AC-4.3
  Depends: T-03, T-05, T-07
  Files: every markdown file under `specs/` (targeted replacements only)
  Do: Apply the kit's banned-name list case-insensitively across `specs/`: replace product names with role words; replace tool-specific rules-file references in the moved phase-5 design with "the project rules"; strip emoji from headings and replace the two decorated headings (agent directives, acceptance checklist) with plain text; remove any reference to a path that no longer exists.
  Done when: `grep -rniF -f ~/projects/sdd-kit/scripts/docs-rules/banned-names.txt specs/ --include='*.md'` returns nothing; `LC_ALL=C.UTF-8 grep -rnP '[\x{1F300}-\x{1FAFF}\x{2700}-\x{27BF}]' specs/ --include='*.md'` returns nothing.
  Out of scope: rewriting content beyond the listed replacements.
  Notes:
  Evidence: All banned-name hits are removed except two lines in `specs/003-specs-align/SPEC.md` (the draft wrapper and AC-4.2 quote a temporary path), which the agent cannot edit. Tool-specific rules-file references in the phase-5 design now read 'the project rules'; the phase-3 target line and the 002 notes are clean. Emoji: phase-5 status ticks removed; wireframe glyphs in `design/ux-spec.md` are content and kept. Blocked on the owner's SPEC edit. Verified 2026-10-26.

## Milestone 4: Cleanup and close (delivers R5, R6, R7)

- [~] T-11 Remove the junk file and empty phase folders; verify links
  Refs: R6, AC-6.1, AC-6.2, AC-4.3
  Depends: T-03, T-05, T-07
  Files: `specs/phase5/phase5-specs.md:Zone.Identifier` (deleted), `specs/phase3`, `specs/phase4`, `specs/phase5` (deleted)
  Do: Delete the stream file with `git rm`, remove each emptied folder, and run the link check over every markdown file in `specs/`. Fix only links that point at removed paths; do not retarget unrelated links.
  Done when: `test ! -e 'specs/phase5/phase5-specs.md:Zone.Identifier'`; `test ! -d specs/phase3 && test ! -d specs/phase4 && test ! -d specs/phase5`; the inline link checker reports zero missing targets; `grep -rn 'specs/phase' specs/ --include='*.md'` returns nothing.
  Out of scope: deleting any other file.
  Notes:
  Evidence: The `:Zone.Identifier` file and `specs/phase3`, `specs/phase4`, `specs/phase5` are gone; the inline link checker reports 0 missing targets. The literal `grep -rn 'specs/phase'` cannot return nothing because the SPEC criteria and this task describe the removal; recorded as CP-1. Verified 2026-10-26.

- [x] T-12 Log D-012
      Refs: R7, AC-7.2, R5
      Depends: T-11
      Files: `DECISIONS.md`
      Do: Append `D-012` with Status Proposed: the phase-to-feature mapping, the 003/004/005/006 numbering rationale, the `design/` carrier rule, the no-rewrite rule for finished tasks, the docs-only scope, and why the SPEC files are owner-saved.
      Done when: `grep -n 'D-012' DECISIONS.md` matches and the entry contains the mapping table.
      Out of scope: changing existing decisions.
      Notes:
      Evidence: `DECISIONS.md` D-012 (Proposed) records the phase-to-feature mapping table, the numbering, the `design/` carrier, the frozen-task rule, docs-only scope and the owner-saved specs. Verified 2026-10-26.

- [~] T-13 Close the feature
  Refs: R5, R7, AC-7.1
  Depends: T-11, T-12
  Files: `specs/003-specs-align/WALKTHROUGH.md` (new)
  Do: Run every check in `PLAN.md` section 8, record the outputs, map each criterion, list deviations (owner-saved SPEC files, dropped out-of-scope note, any link retarget) and open items (the two phase-4 regressions, T2-1, T1-5, manual checks). Confirm `git diff --stat main...HEAD -- src/` is empty and `npm test` is 228/228.
  Done when: the walkthrough exists with a criterion table; every command in it is pasted with its result; `git diff --stat main...HEAD -- src/` prints nothing.
  Out of scope: fixing code or opening the PR.
  Notes:
  Evidence: `specs/003-specs-align/WALKTHROUGH.md` exists with the task table, the 17-criterion table, command results and open items. `npm test` 228/228; build and lint ok; `git diff --stat origin/main...HEAD -- src/` is empty (the local `main` ref is stale, so the guard uses `origin/main`). Close is blocked on the owner copying three SPEC files and resolving CP-1. Verified 2026-10-26.

## Blocked / questions

- **SPEC.md is permission-guarded for the agent.** `003-specs-align/SPEC.md` is saved. The 004, 005 and 006 specs are still authored as drafts for the owner to save; see the close-out report. Raised 2026-10-26, partially resolved.
- **Resolved 2026-10-26:** the owner approved phase-4 corrections P2-2 (inline border on `Step3Ladder.vue:98`) and P2-3 (`rounded="xl"` on `Step6Ready.vue:108`, `AppHelpDialog.vue:7`) as 005 tasks. They stay unfixed in 003.
- **Resolved 2026-10-26:** the owner asked for a shared register of permanently out-of-scope capabilities. T-14 creates `specs/OUT_OF_SCOPE.md` and the roadmap links it.

## Phase reviews

- M1: complete (T-01, T-14) · M2: docs complete, three SPEC copies pending · M3: complete except the owner-guarded SPEC lines · M4: walkthrough written, close pending the owner actions in `WALKTHROUGH.md` section 7

## Coverage matrix

| Requirement | Criteria               | Tasks                                                      |
| ----------- | ---------------------- | ---------------------------------------------------------- |
| R1          | AC-1.1, AC-1.2, AC-1.3 | T-01                                                       |
| R2          | AC-2.1, AC-2.2, AC-2.3 | T-02, T-03, T-04, T-05, T-06, T-07                         |
| R3          | AC-3.1, AC-3.2, AC-3.3 | T-03, T-05, T-07                                           |
| R4          | AC-4.1, AC-4.2, AC-4.3 | T-08, T-09, T-10, T-11                                     |
| R5          | AC-5.1                 | T-08, T-09, T-13                                           |
| R6          | AC-6.1, AC-6.2         | T-11                                                       |
| R7          | AC-7.1, AC-7.2         | T-01, T-02, T-03, T-04, T-05, T-06, T-07, T-12, T-13, T-14 |
