# TASKS: Specification and Implementation Reconciliation

**Feature ID:** 007-spec-code-reconciliation · **Spec:** v0.4 · **Plan:** v0.3 · **Updated:** 2026-10-26

APPROVED: v0.4 2026-10-26

> The owner approved 007 and the four open 006 items on 2026-10-26. Build starts with T-001. C1-C10, R8 and R9 remain deferred.

## How to read this file

1. A `[ ]` task is todo; `[~]` in progress; `[x]` done; `[!]` blocked.
2. Every `[x]` must cite the gate command, test, grep or DEVICE record that proved it.
3. The six defects are tracked here; the source tasks in 005/006 are closed in T-014.
4. Tests, build and lint must pass before a task is ticked.
5. C1-C10, R8 and R9 are deferred by SPEC v0.4. They are not tasks and cannot be used as evidence.

## Conventions

- Evidence format: `Evidence: <path> · <test or command>` or `Evidence: DEVICE <device> · <date> · <record>`.
- Commands: `npm test`, `npm run build`, `npm run lint`, `npx prettier --check`.
- The style contract is checked over `src/**/*.vue`; the reworded `style.css` comment must not be the only match.
- The versioned RCAF 5BX Official Tables v1.0 at `src/core/data/charts_matrix.json` are the oracle for R3/T1-5.
- Browser/PWA checks are deferred per SPEC v0.4 §2.

## Coverage map

| SPEC item               | Tasks                               |
| :---------------------- | :---------------------------------- |
| R1 / AC-1.1, AC-1.2     | T-003, T-004, T-008, T-009          |
| R2 / AC-2.1             | T-005, T-006                        |
| R3 / AC-3.1             | T-002                               |
| R4 / AC-4.1             | T-001, T-003, T-004, T-007 to T-013 |
| R5 / AC-5.1             | T-014, T-015                        |
| R6 / AC-6.1             | T-014                               |
| R7 / AC-7.1             | T-015                               |
| R8, R9 / AC-8.1, AC-9.1 | Deferred by SPEC v0.4; no task      |
| V1                      | T-001                               |
| V2                      | T-002                               |
| V3                      | T-005                               |
| V4, V5                  | T-006                               |
| V6                      | T-013                               |
| V7                      | T-015                               |
| V8                      | T-015                               |
| V9                      | T-014                               |
| AC-2.2, AC-3.2          | Deferred with C2/C5; no task        |

## Milestone 1: Canonical data, setup targets and 005 corrections (R1, R3, R4)

- [x] T-001 (M-1, R4) Derive the progression position from the profile
      Refs: R4, AC-4.1 (T1-1)
      Depends: none
      Files: `src/stores/useProgressionStore.ts`, `src/stores/useProgressionStore.spec.ts`
      Do: Replace the writable `currentChart = ref(1)` and `currentLevel = ref('D-')` initialisers with computed values parsed from `userStore.profile?.currentLevel` via `parseLevelId`; use `FALLBACK_TARGET` for the missing/unparsable case; leave `initAsync` responsible only for adapter/history hydration.
      Done when: no writable literal initialisers remain; the existing profile and fallback tests pass; a test shows the values update when the profile changes; `grep -rn 'currentChart = ref(1)\|currentLevel = ref' src/stores` returns zero.
      Out of scope: history fallback, profile shape, validation rules.
      Notes: Resolves the owner decision left open in 006 T-004 by choosing derived state. Evidence: `src/stores/useProgressionStore.ts`, `src/stores/useProgressionStore.spec.ts` · `npx vitest run src/stores/useProgressionStore.spec.ts` (6 passed) · `npm run build` · `npx eslint src/stores/useProgressionStore.ts src/stores/useProgressionStore.spec.ts` · literal grep returns zero.

- [x] T-002 (M-1, R3) Build the setup list from the chart and level
      Refs: R3, AC-3.1 (T1-5)
      Depends: T-001
      Files: `src/views/WorkoutSetupView.vue`, `src/views/WorkoutSetupView.spec.ts`
      Do: Resolve the target once with `resolveSessionTarget`, build a preview with `ClassicRCAFStrategy.generateWorkout`, render the five intervals with `v-for`, show target reps when present and duration for every interval, and remove the fixed "3 Sets · 15 Reps" and "45 Total" strings. Reuse the same target in `beginWorkout`.
      Done when: a single test iterates every chart/level pair in `src/core/data/charts_matrix.json` and asserts the rendered reps and durations match the oracle; chart-1/D- and chart-3/D+ are examples, not the full coverage; the fixed strings are gone; build and tests pass.
      Out of scope: session generation rules, aerobic option list, start-flow error handling.
      Notes: The strategy is the single source for reps, names and durations; no sets/total values are invented. Evidence: `src/views/WorkoutSetupView.vue`, `src/views/WorkoutSetupView.spec.ts` · `npx vitest run src/views/WorkoutSetupView.spec.ts` (8 passed, including every chart/level pair) · `npm run build` · `npx eslint` · legacy-string grep returns zero.

- [x] T-003 (M-1, R1) Remove the inline border from the ladder
      Refs: R1, AC-1.1 (P2-2)
      Depends: none
      Files: `src/components/onboarding/Step3Ladder.vue`
      Do: Replace `style="border-left: 4px solid rgb(var(--v-theme-primary))"` with the Vuetify combination `border-s-lg border-current text-primary` (or the documented global fallback if the class combination is not reliable in the manual check).
      Done when: `grep -rn 'style=.*border' src/components/onboarding/Step3Ladder.vue` returns zero; the card still has a 4px primary left border; a component assertion or static check covers the class.
      Out of scope: other inline styles in the file.
      Notes: Use Vuetify before adding a global class. Vuetify's `.border-s-lg` declares `border-inline-start-color` after `.border-current`, so the permitted fallback is used: `.border-s-primary` in `src/style.css` sets the 4px primary start border. Evidence: inline-border grep returns zero; `border-s-primary` present in the component and global stylesheet; `npx eslint src/components/onboarding/Step3Ladder.vue` and `npm run build` pass.

- [x] T-004 (M-1, R1) Use the large card radius
      Refs: R1, AC-1.2 (P2-3)
      Depends: none
      Files: `src/components/onboarding/Step6Ready.vue`, `src/components/common/AppHelpDialog.vue`
      Do: Change the two `rounded="xl"` cards to `rounded="lg"`.
      Done when: `grep -rn 'rounded="xl"' src/components/onboarding/Step6Ready.vue src/components/common/AppHelpDialog.vue` returns zero; both cards use the theme token.
      Out of scope: other radii and card styling.
      Notes: The design system requires the large radius for cards. Evidence: both cards now use `rounded="lg"`; the `rounded="xl"` grep returns zero; `npx eslint` and `npm run build` pass.

## Milestone 2: Self-driven clock and parent integration (R2)

- [ ] T-005 (M-2, R2) Give the clock its own contract
      Refs: R2, AC-2.1 (T2-1)
      Depends: none
      Files: `src/components/workout/WorkoutTimerClock.vue`, `src/components/workout/WorkoutTimerClock.spec.ts`
      Do: Remove the `elapsedSeconds` prop. Add `durationSeconds`, optional `startTimestamp`, `isPaused`, `showProgress` and `timeScale`. Derive elapsed from a monotonic anchor, not tick count. Emit `started` on mount/reset, `paused` when `isPaused` turns true, and `expired` exactly once at zero. Pause accumulates and stops; resume re-anchors. Reset on duration or start change.
      Done when: the component has no `elapsedSeconds`; tests cover initial display, progress, pause/resume, reset, `started`, `paused`, single `expired`, `timeScale` and zero duration; no double `expired`; tests pass.
      Out of scope: engine progression, visibility handling, wake lock.
      Notes: `timeScale` preserves the documented 0:59 compressed tutorial demo. AC-2.2's hidden-period case is deferred with C2/C6 in SPEC §2.

- [ ] T-006 (M-2, R2) Stop the parent tree from ticking
      Refs: R2, AC-2.1 (T2-1)
      Depends: T-005
      Files: `src/composables/useWorkoutEngine.ts`, `src/composables/useWorkoutEngine.spec.ts`, `src/views/ActiveWorkoutView.vue`, `src/components/onboarding/Step5Tutorial.vue`
      Do: Remove the per-broadcast `elapsedSeconds` ref from `useWorkoutEngine`; update `currentSnapshot` only on interval index, status or session token changes. In `ActiveWorkoutView`, remove `:elapsed-seconds`, pass a `timerStartedAt` reset on interval/session change, and freeze the clock during PAUSED and REST. Derive the paused remaining label from the snapshot captured at the transition. In `Step5Tutorial`, use `timeScale` and the `expired` event; remove the separate 130ms interval.
      Done when: no `:elapsed-seconds` remains in `src/**/*.vue`; a Vitest harness proves a parent renders once across 60 simulated ticks; the paused overlay still shows the correct remaining time; the tutorial still switches to the rep panel after the compressed countdown; tests/build/lint pass.
      Out of scope: engine timing rules, session restore changes, visibility pause.
      Notes: The engine remains the authority for interval advancement; `started`, `paused` and `expired` are display events. The parent may ignore `paused` because it already owns the pause state.

## Milestone 3: Global style foundation and full scoped-style migration (R4)

- [ ] T-007 (M-3, R4) Import and canonicalise the global sheet
      Refs: R4, AC-4.1 (T3-1)
      Depends: none
      Files: `src/main.ts`, `src/style.css`, `src/App.vue`
      Do: Import `./style.css` after the typography sheet. Reword the rule comment so it no longer contains the literal `<style scoped>` phrase. Canonicalise the duplicated border, grid, cell, legend, keyframe and scrollbar classes; use the current `ProgressionMapGrid` definitions where the scoped and global values differ. Remove the empty scoped block from `App.vue`.
      Done when: `style.css` is imported exactly once; the empty `App.vue` block is gone; the canonical classes are documented in the sheet; no other component is migrated yet; tests/build pass.
      Out of scope: per-component class replacement (T-008 to T-012).
      Notes: Required by T3-1: the sheet existed but was never loaded, so the old global classes were inert. This is not a new feature.

- [ ] T-008 (M-3, R4) Migrate the shared and layout components
      Refs: R4, AC-4.1 (T3-1)
      Depends: T-007
      Files: `src/components/common/AppHelpDialog.vue`, `src/components/common/OnboardingProgress.vue`, `src/components/layout/BottomNav.vue`, `src/components/ProgressionMap.vue`, `src/components/WorkoutTimer.vue`
      Do: Remove every scoped block. Map flex/spacing/radius/opacity to Vuetify; move exact borders, pips, widths and ids to the canonical global classes. Keep the P2-3 radius change.
      Done when: these five files contain no `<style scoped>`; tests/build/lint pass.
      Out of scope: the unused legacy components' product behavior.
      Notes: `ProgressionMap.vue` and `WorkoutTimer.vue` are legacy but are still in scope per the owner's "all components" decision.

- [ ] T-009 (M-3, R4) Migrate the onboarding components
      Refs: R4, AC-4.1 (T3-1)
      Depends: T-008
      Files: `src/components/onboarding/GoalChartCard.vue`, `src/components/onboarding/Step2Age.vue`, `src/components/onboarding/Step3Ladder.vue`, `src/components/onboarding/Step4Exercises.vue`, `src/components/onboarding/Step5Tutorial.vue`, `src/components/onboarding/Step6Ready.vue`
      Do: Remove every scoped block. Map tracking, opacity, radii and layout to Vuetify/global classes; move the goal bars, tier borders, tutorial watermark/info panel and submit height to the canonical sheet; keep P2-2 and P2-3 changes.
      Done when: these six files contain no `<style scoped>`; tests/build/lint pass.
      Out of scope: onboarding copy and step behavior.
      Notes: The tutorial's compressed timer is preserved through T-005/T-006.

- [ ] T-010 (M-3, R4) Migrate the workout components
      Refs: R4, AC-4.1 (T3-1)
      Depends: T-009
      Files: `src/components/workout/ExerciseInfoSheet.vue`, `src/components/workout/PostWorkoutDialog.vue`, `src/components/workout/WorkoutRepOverridePanel.vue`, `src/components/workout/WorkoutTimerClock.vue`
      Do: Remove every scoped block. Map tracking, borders, emoji/font sizes and card heights to Vuetify/global classes; move `rep-pop` and the timer animation classes to the canonical sheet. The timer classes must use the already-canonical `pulse-amber`.
      Done when: these four files contain no `<style scoped>`; the timer tests still pass; tests/build/lint pass.
      Out of scope: dialog seal lifecycle and rep rules.
      Notes: `pulse-amber` is already global; do not duplicate it.

- [ ] T-011 (M-3, R4) Migrate the progression grid
      Refs: R4, AC-4.1 (T3-1)
      Depends: T-010
      Files: `src/components/progress/ProgressionMapGrid.vue`
      Do: Remove the scoped block. Use the canonical `.grid-container`, `.header-cell`, `.progression-cell`, `.cell-*`, `.legend-*`, `.no-scrollbar` and border classes from T-007. Keep the existing rendering and tests.
      Done when: the file contains no `<style scoped>`; the six existing grid tests pass; build/lint pass.
      Out of scope: grid state rules.
      Notes: The global classes must be updated to the grid's current values before the scoped block is removed.

- [ ] T-012 (M-3, R4) Migrate the views
      Refs: R4, AC-4.1 (T3-1)
      Depends: T-011
      Files: `src/views/ActiveWorkoutView.vue`, `src/views/DashboardView.vue`, `src/views/OnboardingView.vue`, `src/views/ProgressView.vue`, `src/views/WorkoutSetupView.vue`
      Do: Remove every scoped block. Map containers to the canonical max-width classes, z-index to `.z-10`/`.z-50`, dots/timers/watermarks/bars/stat cards to the canonical sheet, and the radio selected/unselected borders to Vuetify plus the documented class. Do not change data-driven inline sizes.
      Done when: these five files contain no `<style scoped>`; tests/build/lint pass.
      Out of scope: route behavior, data flow, view content.
      Notes: `OnboardingView`'s scoped `.v-window-item` rule is replaced by a global rule or a prop; do not leave a scoped selector.

- [ ] T-013 (M-3, R4) Enforce the zero-scoped contract
      Refs: R4, AC-4.1, V6 (T3-1)
      Depends: T-012
      Files: `src/__smoke__/style-contract.spec.ts` (new)
      Do: Add a headless Vitest contract test over `src/**/*.vue` that fails on any `<style scoped>`, the `Step3Ladder` inline border, `rounded="xl"` in the two P2-3 files, `:elapsed-seconds`, the legacy setup strings, and writable progression literals.
      Done when: the contract test passes; `grep -rn '<style scoped' src --include='*.vue'` returns zero; `grep -rn ':elapsed-seconds' src --include='*.vue'` returns zero; tests/build/lint pass; the 22-vs-10 finding is recorded in the walkthrough.
      Out of scope: a general-purpose registry (R9 is deferred).
      Notes: This is the V6 contract for the six-defect scope and runs on the headless host.

## Milestone 4: Source-task evidence, final verification and walkthrough (R5, R6, R7)

- [ ] T-014 (M-4, R5) Close the source tasks with evidence
      Refs: R5, R6, AC-5.1, AC-6.1, V9
      Depends: T-001 to T-013
      Files: `specs/005-ux-implementation/TASKS.md`, `specs/006-production-completion/TASKS.md`, `specs/007-spec-code-reconciliation/TASKS.md`, `specs/007-spec-code-reconciliation/WALKTHROUGH.md`
      Do: Audit 005 T-019/T-020 and 006 T-004/T-008/T-011/T-014. Mark them done only with the exact 007 test/grep/build/lint or DEVICE evidence. Revert every unevidenced tick to `CLAIMED`. Append the owner's approval for the four open 006 items to `specs/006-production-completion/TASKS.md` only when the owner's **go** explicitly covers 006; otherwise leave them open and report. Add short notes; do not rewrite task history. Record the audit in `WALKTHROUGH.md`.
      Done when: every 007 tick cites a test, static/build/lint command, or DEVICE record; no task is marked done from a claim or owner statement alone; every unevidenced 005/006 tick is `CLAIMED`; the evidence paths exist.
      Out of scope: reclassifying unrelated 006 tasks (T-001/T-002/T-003/T-010/T-012) without their own evidence.
      Notes: The 007 scope does not re-verify the unrelated claimed tasks. If 006 has no approval line, T-014 stops and reports instead of ticking 006.

- [ ] T-015 (M-4, R7) Run the final gate and write the walkthrough
      Refs: R7, AC-5.1, AC-7.1, V7, V8
      Depends: T-014
      Files: `specs/007-spec-code-reconciliation/WALKTHROUGH.md`, `walkthroughs.md`
      Do: Run the full gate: `npm test`, `npm run build`, `npm run lint`, `npx prettier --check` on changed files, all static greps, and the manual visual checklist from PLAN §5.2. Record the device/manual result separately from automated evidence.
      Done when: tests pass with the new count; build, lint and format check pass; all six defects have evidence; the walkthrough states deviations, assumptions and unresolved deferred checks; the session audit entry is appended; the DEVICE record covers Lenovo Miixpad, Pixel 8 and Pixel 9 or names a BLOCKED device.
      Out of scope: browser/PWA checks deferred by SPEC v0.4 §2.
      Notes: No `[x]` is claimed for C1-C10, R8 or R9. The T3-1 visual parity record is mandatory under R7.

## Deferred / owner decisions

- **SPEC alignment:** none pending. SPEC v0.4 and PLAN v0.3 were reviewed and aligned; this file is the next gate.
- **Browser harness:** C1-C10, R8 and R9 are deferred. Vitest/happy-dom, static checks and the DEVICE visual pass are the 007 boundary. Adding Playwright/Chromium is a separate feature.
- **Manual visual pass:** owner/device check in T-015; no automated screenshot evidence is available without a browser harness.
- **006 approval:** the four open 006 items need an explicit approval line in `specs/006-production-completion/TASKS.md`. The 007 **go** does not automatically approve 006; T-014 records it only if the owner says so.
