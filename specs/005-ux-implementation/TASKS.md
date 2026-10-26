# TASKS: User interface implementation

**Feature ID:** 005-ux-implementation · **Spec v:** 0.1 · **Plan v:** 0.1 · **Updated:** 2026-10-26

APPROVED: v0.1 2026-10-26

> The approval covers the two open corrections (T-021, T-022), which the owner approved on 2026-10-26. The remaining tasks are a historical record of delivered work and are already proven.

## How to read this file

1. Delivered tasks cite the file and the check that proved them.
2. Unticked tasks are the only work left; take the first one whose dependencies are ticked.
3. A browser check that was never run is `Claimed` in `WALKTHROUGH.md`, never `Yes`.

## Conventions

- Evidence format: `Evidence: <path> · <test or command>`.
- The design documents are the visual authority and live in `design/`.
- Run `npm run build`, `npm run lint` and `npx vitest run` before claiming a task done.

## Milestone 1: Runtime failures (delivers R1, R2, R3, R4)

- [x] T-001 (P0-1) Add the router guard
      Refs: R1, AC-1.1
      Depends: none
      Files: `src/main.ts`
      Do: Redirect an incomplete profile to onboarding, a completed profile away from onboarding, and keep the catch-all from winning over the guard.
      Done when: a fresh install lands on onboarding and a completed profile reaches the dashboard.
      Out of scope: the route table itself.
      Notes: Evidence: `src/main.ts:19` · `src/__smoke__/app.smoke.spec.ts` (fresh install, onboarding completion).

- [x] T-002 (P0-2) Fix the navigation binding
      Refs: R1, AC-1.3
      Depends: none
      Files: `src/components/layout/BottomNav.vue`
      Do: Replace the ref-plus-watcher with a writable computed over the current route so the selected tab and the route cannot diverge.
      Done when: selecting a tab changes the route and the selected state follows it.
      Out of scope: adding tabs.
      Notes: Evidence: `src/components/layout/BottomNav.vue:35` · smoke test navigates setup to active workout with the nav hidden.

- [x] T-003 (P0-3) Hide the bottom bar on immersive screens
      Refs: R1, AC-1.2
      Depends: none
      Files: `src/App.vue`
      Do: Hide the bar on onboarding and active workout; show it everywhere else.
      Done when: the smoke flow reaches the active workout and the bar is absent.
      Out of scope: route definitions.
      Notes: Evidence: `src/App.vue:24-25` · `src/__smoke__/app.smoke.spec.ts` (nav hidden test).

- [x] T-004 (P0-4) Declare the ladder's current goal chart
      Refs: R2, AC-2.3
      Depends: none
      Files: `src/components/onboarding/Step3Ladder.vue`
      Do: Use the `goalChart` prop instead of an undeclared value; highlight that chart and dim the ones beyond it.
      Done when: the build passes and the ladder renders with the correct highlight.
      Out of scope: grade list.
      Notes: Evidence: `src/components/onboarding/Step3Ladder.vue:22-35` · `npm run build`.

- [x] T-005 (P0-5) Declare the exercises array
      Refs: R2
      Depends: none
      Files: `src/components/onboarding/Step4Exercises.vue`
      Do: Declare the exercise list and render each item from it.
      Done when: the build passes and the step renders five entries.
      Out of scope: exercise content changes.
      Notes: Evidence: `src/components/onboarding/Step4Exercises.vue:140` · `npm run build`.

- [x] T-006 (P0-6) Start and declare the tutorial timer
      Refs: R2
      Depends: none
      Files: `src/components/onboarding/Step5Tutorial.vue`
      Do: Declare the elapsed value and start the interval on mount; unlock the rep panel when it finishes.
      Done when: the timer counts down and the panel unlocks.
      Out of scope: timer styling.
      Notes: Evidence: `src/components/onboarding/Step5Tutorial.vue:94-96` · `npm run build`. The countdown was not observed in a browser; see the claimed checks.

- [x] T-007 (P0-7) Restore the post-workout save and countdown
      Refs: R3, AC-3.2
      Depends: none
      Files: `src/components/workout/PostWorkoutDialog.vue`
      Do: Provide the save action, a visible sixty-second countdown and the conservative seal on timeout.
      Done when: both choices save and the timeout seals conservatively.
      Out of scope: telemetry service.
      Notes: Evidence: `src/components/workout/PostWorkoutDialog.vue:112-170` · `src/components/workout/PostWorkoutDialog.spec.ts` (7 tests).

- [x] T-008 (P0-8) Restore the map's state functions
      Refs: R4, AC-4.2
      Depends: none
      Files: `src/components/progress/ProgressionMapGrid.vue`
      Do: Restore the cell-state and cell-class functions, including completed, current, eligible and locked.
      Done when: the grid renders and each state is distinguishable.
      Out of scope: the progress view.
      Notes: Evidence: `src/components/progress/ProgressionMapGrid.vue:126` · `src/components/progress/ProgressionMapGrid.spec.ts` (6 tests).

## Milestone 2: Data and prop contracts (delivers R2, R3, R4)

- [x] T-009 (P1-1) Give the goal chart card real props
      Refs: R2, AC-2.1
      Depends: T-004
      Files: `src/components/onboarding/GoalChartCard.vue`
      Do: Require the chart number and age range and render them instead of a placeholder.
      Done when: the card shows the chart derived from the entered age.
      Out of scope: age validation.
      Notes: Evidence: `src/components/onboarding/GoalChartCard.vue:31` · `src/components/onboarding/GoalChartCard.spec.ts`.

- [x] T-010 (P1-2) Emit the age payload
      Refs: R2, AC-2.1
      Depends: none
      Files: `src/components/onboarding/Step2Age.vue`
      Do: Emit the validated age so the next step receives it.
      Done when: the step emits the age and the goal chart reflects it.
      Out of scope: the age-to-level table.
      Notes: Evidence: `src/components/onboarding/Step2Age.vue:57,90` · `src/components/onboarding/Step2Age.spec.ts`.

- [x] T-011 (P1-3) Animate the goal card with a transition
      Refs: R2
      Depends: T-009
      Files: `src/components/onboarding/Step2Age.vue`
      Do: Replace the visibility toggle with an expand transition.
      Done when: the card expands instead of appearing abruptly.
      Out of scope: animation timing.
      Notes: Evidence: `src/components/onboarding/Step2Age.vue:27` · `npm run build`. Visual behavior not observed in a browser.

- [x] T-012 (P1-4) Pass rep data into the override panel
      Refs: R3, AC-3.1
      Depends: none
      Files: `src/components/workout/WorkoutRepOverridePanel.vue`
      Do: Accept the default reps, the exercise name and a disabled flag instead of fixed values.
      Done when: the panel shows the values it receives and disables correctly.
      Out of scope: persistence of overrides.
      Notes: Evidence: `src/components/workout/WorkoutRepOverridePanel.vue:75` · `src/components/workout/WorkoutRepOverridePanel.spec.ts`.

- [x] T-013 (P1-5) Persist the onboarding draft fully
      Refs: R2, AC-2.2
      Depends: none
      Files: `src/stores/useUserStore.ts`
      Do: Persist step, age and aerobic selection on every change; restore them on load.
      Done when: a reload at step four restores all three values.
      Out of scope: profile writes.
      Notes: Evidence: `src/stores/useUserStore.ts` (persistDraft) · `src/stores/useUserStore.spec.ts` (draft tests).

- [x] T-014 (P1-6) Display all twelve grades
      Refs: R2, AC-2.3
      Depends: T-004
      Files: `src/components/onboarding/Step3Ladder.vue`
      Do: Render twelve grades per chart.
      Done when: the grades array contains twelve entries and the template iterates it.
      Out of scope: chart data.
      Notes: Evidence: `src/components/onboarding/Step3Ladder.vue:138` · `grep -c` on the array shows 12.

- [x] T-015 (P1-7) Derive the ready-step summary
      Refs: R2, AC-2.4
      Depends: T-010
      Files: `src/components/onboarding/Step6Ready.vue`
      Do: Require the goal chart and goal level and render them from the user's data.
      Done when: the summary shows the derived values, not fixed text.
      Out of scope: confirmation dialog.
      Notes: Evidence: `src/components/onboarding/Step6Ready.vue:147` · `npm run build`; `src/components/onboarding/Step2Age.spec.ts` proves the derived chart.

- [x] T-016 (P1-8) Match the map's prop contract
      Refs: R4, AC-4.2
      Depends: T-008
      Files: `src/components/progress/ProgressionMapGrid.vue`, `src/views/ProgressView.vue`
      Do: Accept the current, goal and completed level IDs plus the hydration flag; pass them from the view.
      Done when: the view passes the store values and the grid renders them.
      Out of scope: store derivation.
      Notes: Evidence: `src/components/progress/ProgressionMapGrid.vue` (props) · `src/views/ProgressView.vue:60-63` · grid spec.

- [x] T-017 (P1-9) Show the rep panel only during exercise
      Refs: R3, AC-3.1
      Depends: T-012
      Files: `src/views/ActiveWorkoutView.vue`
      Do: Gate the panel on the exercise phase so it is hidden during the interval and enabled in the transition.
      Done when: the panel follows the phase flag.
      Out of scope: rep rules.
      Notes: Evidence: `src/views/ActiveWorkoutView.vue:70` · `npm run build`. Phase behavior not observed in a browser.

## Milestone 3: Design-system compliance (delivers R5)

- [x] T-018 (P2-1) Replace invalid text utilities
      Refs: R5, AC-5.1
      Depends: none
      Files: templates under `src/`
      Do: Replace the invalid text-secondary and text-tertiary classes with valid token classes.
      Done when: a scan finds no `text-text-` class.
      Out of scope: other class families.
      Notes: Evidence: `grep -rn 'text-text-' src --include='*.vue'` returns 0 matches.

- [ ] T-019 (P2-2) Remove the inline border style
      Refs: R5, AC-5.3
      Depends: none
      Files: `src/components/onboarding/Step3Ladder.vue`
      Do: Replace the inline left border on the highlighted card with a class from the design system.
      Done when: `grep -rn 'style="border' src --include='*.vue'` returns 0 matches and the highlight still renders.
      Out of scope: other inline styles that are data-driven.
      Notes: Open. Current hit: `Step3Ladder.vue:98`. Approved by the owner on 2026-10-26.

- [ ] T-020 (P2-3) Use the large card radius
      Refs: R5, AC-5.2
      Depends: none
      Files: `src/components/onboarding/Step6Ready.vue`, `src/components/common/AppHelpDialog.vue`
      Do: Replace the extra-large radius with the large radius required by the design system.
      Done when: `grep -rn 'rounded="xl"' src --include='*.vue'` returns 0 matches and both cards use `rounded="lg"`.
      Out of scope: other card styling.
      Notes: Open. Current hits: `Step6Ready.vue:108`, `AppHelpDialog.vue:7`. Approved by the owner on 2026-10-26.

- [x] T-021 (P2-4) Replace invalid surface colour props
      Refs: R5, AC-5.1
      Depends: none
      Files: templates under `src/`
      Do: Use valid theme colours instead of surface-container values as component props.
      Done when: a scan finds no `color="surface-container` prop.
      Out of scope: token definitions.
      Notes: Evidence: `grep -rn 'color="surface-container' src --include='*.vue'` returns 0 matches.

- [x] T-022 (P2-5) Replace invalid border utilities
      Refs: R5, AC-5.1
      Depends: none
      Files: templates under `src/`
      Do: Remove the invalid border utility class names; where a border is needed, define it in the component's scoped style with a theme variable.
      Done when: a scan finds no invalid border utility class name.
      Out of scope: the locally defined class that already uses a theme variable.
      Notes: Evidence: scan returns only the locally defined class in `ProgressionMapGrid.vue`, which is not the invalid utility.

- [x] T-023 (P2-6) Unlock audio before starting
      Refs: R3, AC-3.3
      Depends: none
      Files: `src/views/WorkoutSetupView.vue`
      Do: Call the audio unlock before session initialization.
      Done when: the start action unlocks audio first.
      Out of scope: audio implementation.
      Notes: Evidence: `src/views/WorkoutSetupView.vue:248` · `src/views/WorkoutSetupView.spec.ts`.

- [x] T-024 (P2-7) Remove imported compiler macros
      Refs: R5, AC-5.1
      Depends: none
      Files: affected components
      Do: Remove imports of `defineProps` and `defineEmits`.
      Done when: a scan finds no imported macro.
      Out of scope: other imports.
      Notes: Evidence: `grep -rn 'import { defineProps\|import { defineEmits' src` returns 0 matches.

- [x] T-025 (P2-8) Lazy-load the routes
      Refs: R1
      Depends: none
      Files: `src/router/index.ts`
      Do: Replace eager view imports with lazy imports.
      Done when: every view route uses a dynamic import.
      Out of scope: route names.
      Notes: Evidence: `src/router/index.ts` has six lazy imports · `src/router/index.spec.ts`.

## Milestone 4: Missing deliverables (delivers R4)

- [x] T-026 (P3-1) Create the settings view
      Refs: R4, AC-4.3
      Depends: none
      Files: `src/views/SettingsView.vue`
      Do: Provide the settings screen at its route.
      Done when: the route renders the view.
      Out of scope: new settings.
      Notes: Evidence: `src/views/SettingsView.vue` exists · `npm run build`.

- [x] T-027 (P3-2) Wire the settings entry point
      Refs: R4, AC-4.3
      Depends: T-026
      Files: `src/components/layout/BottomNav.vue`
      Do: Navigate to the settings route from the navigation.
      Done when: selecting settings changes the route.
      Out of scope: the settings content.
      Notes: Evidence: `src/components/layout/BottomNav.vue:21` · `src/router/index.spec.ts` (route table).

## Blocked / questions

- T-019 and T-020 are approved but not executed; they are the only open work in this feature.
- Seven browser checks remain unrun; they are listed as Claimed in the walkthrough and repeated in 006.

## Phase reviews

- M1 to M4: recorded 2026-10-26 from the audit. No reviewer has cleared the open corrections.

## Coverage matrix

| Requirement | Criteria               | Tasks                                                         |
| ----------- | ---------------------- | ------------------------------------------------------------- |
| R1          | AC-1.1, AC-1.2, AC-1.3 | T-001, T-002, T-003, T-025                                    |
| R2          | AC-2.1 to AC-2.4       | T-004, T-005, T-006, T-009, T-010, T-011, T-013, T-014, T-015 |
| R3          | AC-3.1, AC-3.2, AC-3.3 | T-007, T-012, T-017, T-023                                    |
| R4          | AC-4.1, AC-4.2, AC-4.3 | T-008, T-016, T-026, T-027                                    |
| R5          | AC-5.1, AC-5.2, AC-5.3 | T-018, T-019, T-020, T-021, T-022, T-024                      |
| R6          | AC-6.1, AC-6.2         | All tasks; walkthrough                                        |
