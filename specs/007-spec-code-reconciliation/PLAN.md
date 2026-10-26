# PLAN: Specification and Implementation Reconciliation

**Feature ID:** 007-spec-code-reconciliation · **Spec:** v0.4 · **Plan:** v0.3 · **Updated:** 2026-10-26
**Status:** Reviewer aligned; awaiting owner go
**Governed by:** Constitution YA-5bx (Principles 1-6, Quality Gates G1-G7)

> SPEC 007 v0.4 is authoritative. It records the owner's **Option A: strict 005/006 reconciliation**. This plan implements that scope. There are no pending SPEC corrections. The reviewer confirmed that SPEC v0.4, this PLAN and `TASKS.md` agree. `TASKS.md` has no approval line; implementation waits for the owner's **go**.

## 1. Objective

Fix the six defects that prevented 005 and 006 from reaching verified parity:

| Defect | Source    | Required outcome                                                                                  |
| :----- | :-------- | :------------------------------------------------------------------------------------------------ |
| P2-2   | 005 T-019 | The inline border in `Step3Ladder.vue` becomes a Vuetify/design-system class.                     |
| P2-3   | 005 T-020 | `Step6Ready.vue` and `AppHelpDialog.vue` use the large card radius.                               |
| T1-1   | 006 T-004 | `currentChart` and `currentLevel` are derived from the profile; no writable literal initialisers. |
| T1-5   | 006 T-008 | The setup exercise list, reps and durations come from the chart and level.                        |
| T2-1   | 006 T-011 | `WorkoutTimerClock` owns its display clock; no elapsed prop and no per-tick parent render.        |
| T3-1   | 006 T-014 | Every `<style scoped>` block in `src/**/*.vue` is migrated, Vuetify-first.                        |

No new product behavior is added. The timer still displays the workout clock, the engine still owns session progression, and the existing routes and screens remain.

## 2. Scope and traceability

### 2.1 In scope

- The six defects in §1.
- The smallest supporting changes required by those defects: import the global stylesheet, reconcile duplicate global/scoped classes, wire the timer contract through `ActiveWorkoutView` and `Step5Tutorial`, and record evidence for the six source tasks.
- Verification V1-V9 in SPEC §3: Vitest/happy-dom, static greps, build, lint, Prettier, a DEVICE visual pass, and the evidence audit.

### 2.2 Deferred by SPEC v0.4

- Browser/PWA checks C1-C10, R8 and R9 are deferred. No code, check, or evidence is required for them in 007.
- No Playwright, Chromium, Puppeteer, browser harness, check registry, or French parity re-verification is added.

### 2.3 Alignment rule

- SPEC v0.4 is the ultimate authority.
- Every task in `TASKS.md` must cite at least one R-id and one AC-id from SPEC v0.4.
- Every tick must have evidence under R5/R6. An unevidenced 005/006 task stays `CLAIMED`.
- If the reviewer finds a SPEC/PLAN conflict, stop and resolve the document before generating or accepting `TASKS.md`.

## 3. Current-state audit

Recorded before any 007 code change:

- Branch: `feat/007-spec-code-reconciliation`; baseline `origin/main` at `973787d`.
- Tests: `228/228` pass; `npm run build` passes; lint is the repository lint command.
- Scoped styles: SPEC T3-1 expects **10 components**; the actual repository count is **22 `.vue` files** with a `<style scoped>` block. Twenty-one are non-empty; `src/App.vue` has an empty block. The 12-file difference is recorded as the T3-1 finding required by SPEC §5. `src/style.css` matches a naive grep only because its rule comment contains the literal phrase; the reproducible command is `grep -rln --include='*.vue' '<style scoped' src/`.
- Global stylesheet: `src/style.css` exists but **is not imported** by `src/main.ts` or any component. Its classes are currently not active. It also contains duplicate/conflicting definitions for `border-accent`, `border-surface-variant`, the progression grid and cells, and keyframes that also exist in scoped blocks.
- Timer: `WorkoutTimerClock.vue` declares `elapsedSeconds?: number` and falls back to a local ticker. `ActiveWorkoutView.vue` passes `:elapsed-seconds` every tick. `useWorkoutEngine` writes a module-level `elapsedSeconds` ref on every 250 ms engine broadcast. The clock already emits `expired` from two paths, so it can emit twice.
- Setup: `WorkoutSetupView.vue` renders four fixed cards with "3 Sets · 15 Reps" and "45 Total". The strategy generates five intervals for the same session (Toe Touch, Sit Up, Leg Lift, Push Up, aerobic), each with its own target and duration.
- Progression: `useProgressionStore.ts` derives the position in `initAsync`, but the writable refs are still initialised to `1` and `'D-'`.
- Browser tooling: no Playwright dependency, no browser binary, no browser config. The host is `aarch64`. No browser harness is added under SPEC v0.4.

## 4. Design

### 4.1 T1-1: derived progression position

`useProgressionStore` will stop owning writable chart/level refs.

- Parse `userStore.profile?.currentLevel` with the existing `parseLevelId` helper.
- Use `FALLBACK_TARGET` (`Chart 1 / D-`) when the profile is missing or unparsable.
- Expose `currentChart` and `currentLevel` as computed values, so they update if the profile changes after hydration.
- Keep `initAsync` responsible only for opening the adapter and loading history.
- Keep `validationResult` unchanged in behavior; it reads the computed values.

This removes the literal initialisers without inventing a second source of truth. The profile remains the source; the default is a named constant.

### 4.2 T1-5: chart-derived setup list

`WorkoutSetupView` will render the same strategy output that the engine uses.

- Resolve the session target once with `resolveSessionTarget(profile.currentLevel, history)`.
- Build a preview list with `ClassicRCAFStrategy.generateWorkout(...)` using the resolved chart/level, the selected aerobic option and classic mode.
- Render the list with `v-for`; show each interval's display name, target reps when present, and duration.
- Remove the fixed strings "3 Sets · 15 Reps" and "45 Total"; the strategy has one set per exercise and no "total" field.
- Use the same resolved target in `beginWorkout`, avoiding a second, potentially different resolution.
- The list reacts to a level change and to the aerobic selection.

### 4.3 T2-1: self-driven timer contract

`WorkoutTimerClock` becomes a display component with a local monotonic clock and a narrow contract.

**Props**

| Prop              | Purpose                                                                                                                                                |
| :---------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `durationSeconds` | Allocated time for the current interval.                                                                                                               |
| `startTimestamp?` | Epoch milliseconds for the current allocation; used once to restore a mid-interval display. Defaults to now.                                           |
| `isPaused?`       | Freezes the display without changing the parent.                                                                                                       |
| `showProgress?`   | Keeps the existing progress-bar option.                                                                                                                |
| `timeScale?`      | Defaults to `1`. The onboarding tutorial uses the documented compressed demo (0:59 in about 8 s); this is a display-rate option, not a per-tick input. |

**Emits**

| Event     | When                                                                    |
| :-------- | :---------------------------------------------------------------------- |
| `started` | On mount and whenever the allocation resets (duration/start change).    |
| `paused`  | When `isPaused` transitions to true; a state event, not a tick.         |
| `expired` | Once, when the remaining time reaches zero; this is the complete event. |

The component derives elapsed time from `performance.now()` anchors, not from tick counts. Pause accumulates elapsed time and stops the interval; resume re-anchors. `timeScale` is applied to the derived elapsed time. It must not emit `expired` twice. R2's "start, pause, complete" is satisfied by `started`, `paused`, and `expired`; no per-tick event is emitted.

**Parent wiring**

- `useWorkoutEngine` stops exposing a per-broadcast `elapsedSeconds` ref. It updates `currentSnapshot` only when interval index, status or session token changes. This is the key to no per-tick parent render.
- `ActiveWorkoutView` removes `:elapsed-seconds`, owns a `timerStartedAt` ref, resets it on interval index/session token changes, and passes `isPaused || isRestPhase`.
- The paused overlay derives its remaining label from `snapshot.elapsedSecondsInCurrentInterval`, which is current at the pause transition. It must not reintroduce a per-tick reactive value.
- `Step5Tutorial` uses `timeScale` to preserve the compressed 0:59 demo and handles `expired` instead of running a second 130 ms interval.
- The engine remains the authority for progression. The clock's `expired` event does not advance the engine; the engine's own timer already does that.

### 4.4 T3-1: Vuetify-first style migration

Order of preference for every rule:

1. **Vuetify component props / utilities**: `d-flex`, `flex-column`, `align-*`, `justify-*`, `ga-*`, `pa-*`, `ma-*`, `mx-auto`, `w-100`, `h-100`, `position-*`, `overflow-*`, `text-uppercase`, `text-center`, `bg-*`, `text-*`, `opacity-*`, `rounded-*`, `border-s-lg` + `border-current` + a text color.
2. **Existing project classes** in `src/assets/typography.css` (`fc-*`) and a single canonical set in `src/style.css`.
3. **Global CSS only for irreducible rules**: keyframes, pseudo-elements, scrollbar suppression, watermark positioning, exact alpha borders, grid templates, fixed pixel dimensions/widths with no Vuetify equivalent, and multi-property component classes.

Specific mappings:

| Current pattern                                                                                                                                                                                                                                                                                                                     | Destination                                                                                                                                                         |
| :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Flex, gaps, padding, alignment                                                                                                                                                                                                                                                                                                      | Vuetify utilities (most templates already use them).                                                                                                                |
| `max-width: 600/900/1200/400/160px`                                                                                                                                                                                                                                                                                                 | Global semantic classes (`.max-width-600`, `.matrix-container`, `.main-content`, `.timer-controls`, `.age-input`); Vuetify has no arbitrary max-width utility.      |
| `z-index: 10/50`                                                                                                                                                                                                                                                                                                                    | Global `.z-10` / `.z-50`; Vuetify has no z-index utility.                                                                                                           |
| `opacity: .25/.4/.6/.8/.9/1`                                                                                                                                                                                                                                                                                                        | `opacity-40`, `opacity-60`, `opacity-80`, `opacity-90`; global `.opacity-25` only where exact parity is required.                                                   |
| `border-left: 4px solid primary/secondary/error`                                                                                                                                                                                                                                                                                    | `border-s-lg border-current text-primary` / `text-secondary` / `text-error`.                                                                                        |
| `border: 1px solid rgba(theme..., alpha)`                                                                                                                                                                                                                                                                                           | Canonical global classes: `.border-accent`, `.border-top-accent`, `.border-surface-variant`, `.border-b-surface-variant`, `.border-primary-soft`, `.fc-info-panel`. |
| `border-radius`                                                                                                                                                                                                                                                                                                                     | Vuetify `rounded-*`; keep the design token `rounded="lg"` for cards.                                                                                                |
| `letter-spacing`                                                                                                                                                                                                                                                                                                                    | Global `tracking-*` classes; Vuetify has no letter-spacing utility.                                                                                                 |
| `font-size` / `line-height`                                                                                                                                                                                                                                                                                                         | Existing `fc-*` typography or new global size helpers; Vuetify `text-*` only where the semantic size matches.                                                       |
| `text-on-primary-fixed` (#291800 !important)                                                                                                                                                                                                                                                                                        | Theme token `text-on-primary-container`; remove the hardcoded colour and `!important`.                                                                              |
| Keyframes (`pulse-amber`, `fadeUp`, `rep-pop`, `border-pulse`)                                                                                                                                                                                                                                                                      | `src/style.css` only.                                                                                                                                               |
| `.no-scrollbar`, `.bg-watermark`, `.grid-container`, `.progression-cell`, `.cell-*`, `.legend-*`, `.progress-pip`, `.bar-*`, `.timer-pulse`, `.timer-expired`, `.radio-*`, `.accent-line`, `.dot`, `.bottom-nav`, `.nav-btn`, `.goal-card`, `.tier-card-*`, `.rep-counter-card`, `.tutorial-card`, `.tutorial-info`, `.cardio-info` | Global `src/style.css`, deduplicated.                                                                                                                               |

`src/style.css` must be imported from `src/main.ts`; without that import the migration would remove styles without replacing them. The rule comment that contains the literal `<style scoped>` phrase will be reworded so the repository can use a simple `.vue`-scoped grep without a permanent false positive.

SPEC T3-1 expects 10 components. The plan migrates all 22 because leaving any scoped block would contradict the same defect pattern. The 22-vs-10 difference is reported as a finding, not hidden. No SPEC edit is required to record it.

The migration batches:

1. Foundation: import, canonical border/grid/keyframe/typography classes, remove the empty `App.vue` block.
2. Shared/common: `AppHelpDialog`, `OnboardingProgress`, `BottomNav`, `ProgressionMap`, `WorkoutTimer`.
3. Onboarding: `GoalChartCard`, `Step2Age`, `Step3Ladder`, `Step4Exercises`, `Step5Tutorial`, `Step6Ready`.
4. Workout: `ExerciseInfoSheet`, `PostWorkoutDialog`, `WorkoutRepOverridePanel`, `WorkoutTimerClock`.
5. Progress: `ProgressionMapGrid`.
6. Views: `ActiveWorkoutView`, `DashboardView`, `OnboardingView`, `ProgressView`, `WorkoutSetupView`.

Each batch must leave tests, build and lint green. Visual parity is checked manually on the owner's devices because there is no browser harness in 007.

## 5. Verification strategy

### 5.1 Automated (SPEC V1-V7)

- `npm test` — Vitest 5 + happy-dom; runs on this aarch64 host.
- New tests:
  - V1: progression position derived from the profile and updates when the profile changes;
  - V2: setup list matches the versioned RCAF 5BX Official Tables v1.0 oracle at `src/core/data/charts_matrix.json` for every chart/level pair, not a sample;
  - V3: timer countdown, pause/resume, reset, single `expired` emission, `started` emission, `paused` emission, `timeScale` demo;
  - V4: parent render count unchanged across 60 simulated ticks;
  - V5: `useWorkoutEngine` does not expose or update a per-tick elapsed ref;
  - V6: style contract test over `src/**/*.vue` (zero scoped blocks, no inline border in `Step3Ladder`, no `rounded="xl"` in the two files, no `:elapsed-seconds`, no legacy setup strings).
- `npm run build` — `vue-tsc -b` plus production build (V7).
- `npm run lint` — repository ESLint command; inspect the diff because the script uses `--fix` (V7).
- `npx prettier --check` on changed source files (V7).
- Static greps recorded in the walkthrough (V6).

### 5.2 Device (SPEC V8)

- Visual pass over onboarding steps 1-6, dashboard, setup, active workout, pause overlay, post-workout dialog, progress map, help dialog, bottom navigation.
- Record device, date, and evidence for Lenovo Miixpad, Pixel 8, and Pixel 9. If a device is unavailable, record it as `BLOCKED` with the owner; do not silently exclude it.
- This is a `DEVICE` check; it is not claimed as automated.

### 5.3 Evidence audit (SPEC V9)

- Every 007 task tick must cite a Vitest/static/build/lint result or a DEVICE record.
- Audit the 005 and 006 task files; revert every unevidenced tick to `CLAIMED`.
- Record the audit in `WALKTHROUGH.md`.
- Deferred checks C1-C10, R8 and R9 are not evidence for 007.

### 5.4 Deferred

- C1-C10, R8 and R9 remain deferred. No Playwright, Chromium, Puppeteer or host package is added in 007.

## 6. Milestones

| Milestone | Scope                                                    | Tasks          |
| :-------- | :------------------------------------------------------- | :------------- |
| M-1       | Canonical data, setup targets and 005 corrections        | T-001 to T-004 |
| M-2       | Self-driven clock and parent integration                 | T-005, T-006   |
| M-3       | Global style foundation and full scoped-style migration  | T-007 to T-013 |
| M-4       | Source-task evidence, final verification and walkthrough | T-014, T-015   |

M-3 is intentionally after the functional changes so the style churn does not obscure the timer/setup diffs.

## 7. Risks and mitigations

| Risk                                                                      | Mitigation                                                                                                                                       |
| :------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| Global CSS changes existing visuals because the sheet was never imported. | Import first, reconcile duplicates against the scoped definitions, migrate one batch at a time, manual visual check.                             |
| Border classes have conflicting definitions under the same names.         | Define canonical classes in §4.4 and update every template; no scoped overrides remain.                                                          |
| The timer and engine clocks disagree after pause/background.              | The display derives from an anchor; the engine remains authoritative; tests cover pause/resume and reset. No visibility-pause behavior is added. |
| Removing `elapsedSeconds` breaks the paused overlay.                      | Use the snapshot value captured at the pause/status transition; test the overlay text.                                                           |
| The onboarding demo becomes 59 real seconds.                              | Keep the compressed rate with `timeScale`; test the demo path.                                                                                   |
| `style.css` becomes a dumping ground.                                     | Vuetify-first rule in §4.4; only the irreducible list goes global.                                                                               |
| A style batch hides a functional regression.                              | Tests/build/lint after every task; one commit per task.                                                                                          |

## 8. Decisions

- **D-007-1:** Option A is adopted in SPEC v0.4: strict 005/006 reconciliation; C1-C10, R8 and R9 are deferred. Status: accepted by the owner's SPEC v0.4 edit.
- **D-007-2:** SPEC T3-1 expects 10 components; the actual count is 22 `.vue` scoped blocks. The difference is a recorded finding. All 22 are migrated; no subset.
- **D-007-3:** Vuetify utilities/props first; global CSS only for the irreducible list.
- **D-007-4:** The timer owns the display clock and emits `started`, `paused`, and `expired`; the engine owns session progression.
- **D-007-5:** Verification is Vitest/happy-dom plus static/build/lint/Prettier and the DEVICE visual pass; no browser harness is added.
- **D-007-6:** The versioned RCAF 5BX Official Tables v1.0 at `src/core/data/charts_matrix.json` are the oracle for R3/T1-5. V2 compares every chart/level pair against that file.

## 9. Approval

`TASKS.md` exists. The reviewer confirmed that SPEC v0.4, this PLAN and `TASKS.md` agree. No approval line exists.

Process from here:

1. The owner reviews `TASKS.md` and replies **go**.
2. Append `APPROVED: v0.4 <date>` to `TASKS.md`.
3. Implementation starts with T-001.

No 006 task is ticked without an `APPROVED:` line in `specs/006-production-completion/TASKS.md`; T-014 records that approval when the owner gives it. No implementation starts before the `APPROVED:` line is appended to this feature's `TASKS.md`.
