# WALKTHROUGH: baseline

**Feature:** 001-baseline · **Tasks:** T-00x to T-00y · **Agent / model:** <tool + model> · **Date:** 2026-10-16
**Status:** Complete | Complete with notes | Blocked
**Verification:** Tests <pass/total> · Typecheck <ok/fail> · Lint <ok/N warnings> · Build <ok/fail>

> Written by the implementing agent at the end of every session. Factual and dense: no narrative, no celebration. This is the handoff to the next agent and the primary input to the reviewer. Mark a criterion "claimed" when no test or recorded check proves it.

## 1. Task results

| Task  | Refs       | Result (Done / Partial / Blocked) | Evidence (test name or command output)                                         |
| ----- | ---------- | --------------------------------- | ------------------------------------------------------------------------------ |
| T-000 | D-001..003 | Done                              | Verified DECISIONS.md contains D-001, D-002, D-003 with Status: Accepted       |
| T-001 | D-001      | Done                              | `npm run knip` ran to completion (exit code 1 due to unused files as expected) |
| T-002 | D-001      | Done                              | knip output, dynamic imports, lint summary, build recorded                     |
| T-003 | D-001      | Done                              | Deleted 7 accepted dead files; build passes                                    |
| T-004 | D-001      | Done                              | Removed orphaned WAL removal line; grep matches 0; build passes                |
| T-005 | D-001      | Done                              | Uninstalled chalk dependency                                                   |
| T-006 | D-001      | Done                              | Knip clean of removed items; build passes; lint unchanged from baseline        |
| T-007 | D-002      | Done                              | vitest 5.0.5 + test-utils + happy-dom + fake-indexeddb; `npm test` exits 0     |
| T-008 | AC-4.1     | Done                              | Read-only trace: duration source, legacy timer reach, no dual-timer path       |
| T-009 | R3         | Done                              | `src/utils/ages.spec.ts`: 34 tests pass                                        |
| T-010 | R3         | Done                              | `src/utils/levels.spec.ts`: 9 tests pass                                       |
| T-011 | R3         | Done                              | `src/utils/charts.spec.ts`: 3 tests pass                                       |
| T-012 | R6         | Done                              | `HistoryAggregator.spec.ts`: 7 tests pass                                      |
| T-013 | R6         | Done                              | `ProgressionValidator.spec.ts`: 19 tests pass                                  |
| T-014 | R3         | Done                              | `ClassicRCAFStrategy.spec.ts`: 9 tests pass                                    |
| T-015 | R3         | Done                              | `McMasterHIITStrategy.spec.ts`: 2 tests pass                                   |
| T-016 | R4         | Done                              | `TimerEngine.spec.ts`: 5 tests pass                                            |
| T-017 | R4, R5     | Done                              | `WorkoutOrchestrator.spec.ts`: 9 tests pass                                    |
| T-018 | R5         | Done                              | `IndexedDBAdapter.spec.ts`: 4 tests pass                                       |
| T-019 | R5         | Done                              | `TelemetryService.spec.ts`: 5 tests pass                                       |
| T-020 | R2         | Done                              | `useUserStore.spec.ts`: 6 tests pass                                           |
| T-021 | R6         | Done                              | `useProgressionStore.spec.ts`: 5 tests pass                                    |
| T-022 | R4         | Done                              | `useWorkoutEngine.spec.ts`: 6 tests pass                                       |
| T-023 | R4         | Done                              | `useTimer.spec.ts`: 8 tests pass                                               |
| T-024 | R4         | Done                              | `useAudioFeedback.spec.ts`: 4 tests pass                                       |
| T-025 | R4         | Done                              | `WorkoutRepOverridePanel.spec.ts`: 5 tests pass                                |
| T-026 | R5         | Done                              | `PostWorkoutDialog.spec.ts`: 7 tests pass                                      |
| T-027 | R4         | Done                              | `WorkoutTimerClock.spec.ts`: 6 tests pass                                      |
| T-028 | R6         | Done                              | `ProgressionMapGrid.spec.ts`: 6 tests pass                                     |
| T-029 | R2, R8     | Done                              | Onboarding specs: 9 tests pass                                                 |
| T-030 | R8         | Done                              | `i18n.spec.ts`: 4 tests pass                                                   |
| T-031 | R1         | Done                              | `router/index.spec.ts`: 7 tests pass                                           |
| T-032 | R1, R2, R4 | Done                              | `app.smoke.spec.ts`: 3 tests pass                                              |
| T-033 | R6         | Done                              | Mutation removed the break; 2 specs failed; reverted; suite green              |
| T-034 | R6         | Done                              | 40-49 threshold 7→6; 4 specs failed; reverted; suite green                     |
| T-035 | R3         | Done                              | Ex-1 rep source changed; 1 spec failed; reverted; suite green                  |

## T-035 [transient] Sanity: ClassicRCAF rep source changed

- Status: DONE
- Commands: edit `src/core/ClassicRCAFStrategy.ts` (exercise 1 reads `exercise_2_reps`), `npm test -- src/core/ClassicRCAFStrategy.spec.ts`, `git checkout -- src/core/ClassicRCAFStrategy.ts`, `git diff --stat src/`, `npm test`
- Result: Under mutation, 1 test failed: "uses the chart reps for the four rep intervals" expected `[4,5,6,3]` received `[5,5,6,3]`. Reverted; `git diff src/` empty; full suite 182/182 passed.

## T-034 [transient] Sanity: ProgressionValidator threshold changed

- Status: DONE
- Commands: edit `src/core/data/progression_rules.json` (40-49 requiredSessions 7→6), `npm test -- src/core/ProgressionValidator.spec.ts`, `git checkout -- src/core/data/progression_rules.json`, `git diff --stat src/`, `npm test`
- Result: Under mutation, 4 tests failed: both 40/49 threshold cases (expected 6 to be 7), the at-threshold eligibility case, and the stiffness threshold case. Reverted; `git diff src/` empty; full suite 182/182 passed.
- Notes: TASKS names `ProgressionValidator.ts`, but the band values live only in `src/core/data/progression_rules.json`. The mutation was applied to the data file.

## T-033 [transient] Sanity: HistoryAggregator break removed

- Status: DONE
- Commands: edit `src/core/storage/HistoryAggregator.ts` (remove else/break), `npm test -- src/core/storage/HistoryAggregator.spec.ts`, `git checkout -- src/core/storage/HistoryAggregator.ts`, `git diff --stat src/`, `npm test`
- Result: Under mutation, 2 tests failed: "counts matching sessions newest-first until a mismatch" expected 1 received 4, and "returns 0 when the newest record is disjoint" expected 0 received 2. Reverted; `git diff src/` empty; full suite 182/182 passed.

## T-032 Smoke test of main flows (no browser)

- Status: DONE
- Commands: `npm test -- src/__smoke__/app.smoke.spec.ts`
- Result: 3 tests pass. Mounts `App` with a fresh Pinia, memory-history router, the real Vuetify and i18n plugins, and `useProgressionStore.initAsync` stubbed. Asserts a fresh install lands on `onboarding`, completing onboarding then navigating reaches `dashboard` with the bottom nav visible, and `workout-setup` → `active-workout` works with the bottom nav hidden. No deep assertions.

## T-031 Characterize the router table

- Status: DONE
- Commands: `npm test -- src/router/index.spec.ts`
- Result: 7 tests pass. `createWebHistory` is replaced with memory history via a `vue-router` mock. Each of the six named routes resolves to its expected path and lazy view module. Unknown `/does-not-exist` resolves with zero matched records and no name (AC-1.2 gap, D-003).

## T-030 Characterize i18n plugin defaults

- Status: DONE
- Commands: `npm test -- src/plugins/i18n.spec.ts`
- Result: 4 tests pass. Locks default locale `fr-FR`, fallback `en-US`, both message catalogs loading, and a French catalog lookup. Translation completeness is not asserted (Phase 1).

## T-029 Characterize onboarding components

- Status: DONE
- Commands: `npm test -- src/components/onboarding/Step2Age.spec.ts src/components/onboarding/GoalChartCard.spec.ts src/components/common/OnboardingProgress.spec.ts`
- Result: 9 tests pass. Step2Age accepts 10 and 99, rejects 9/100/null, derives GoalChartCard props (10 → chart 6, 18–25; 30 → chart 4, 30–34), and emits `next(30)`. GoalChartCard renders chart number and age range from props and updates. OnboardingProgress renders 6 pips with `step <= currentStep` active (0 → none, 6 → all).

## T-028 Characterize `ProgressionMapGrid`

- Status: DONE
- Commands: `npm test -- src/components/progress/ProgressionMapGrid.spec.ts`
- Result: 6 tests pass. Locks valid `currentLevelId`/`goalLevelId` parsing, empty id → C1 D-, unknown grade → D- index 0, cell states current/completed/goal/locked, explicit `completedLevelIds` overriding locked, and the skeleton when `isHydrated` is false.

## T-027 Characterize `WorkoutTimerClock`

- Status: DONE
- Commands: `npm test -- src/components/workout/WorkoutTimerClock.spec.ts`
- Result: 6 tests pass with fake timers. Locks mm:ss from duration minus elapsed clamped at 0, `progressPercent` (30/60 → 50, duration 0 → 0), `timer-expired` class at expiry, `expired` emission when supplied elapsed reaches the duration, and the internal ticker running only when `elapsedSeconds` is undefined.

## T-026 Characterize `PostWorkoutDialog` (`workout/`)

- Status: DONE
- Commands: `npm test -- src/components/workout/PostWorkoutDialog.spec.ts`
- Result: 7 tests pass with fake timers and a mocked `TelemetryService`. Locks 60 s auto-seal as conservative (`token, true, true`), great → `(token, false, false)`, sore → `(token, true, false)`, `isSealing` dedupe across manual and auto paths, unmount with no selection auto-seals conservative, manual rejection shows the retry alert without emitting, and auto-seal rejection emits `seal-failed`.
- Notes: The TASKS wording says a rejection emits `seal-failed`; manual `save()` actually swallows it into the retry alert. Auto-seal emits it. Locked as observed.

## T-025 Characterize `WorkoutRepOverridePanel`

- Status: DONE
- Commands: `npm test -- src/components/workout/WorkoutRepOverridePanel.spec.ts`
- Result: 5 tests pass. Locks reps seeded from `defaultReps`, increment/decrement clamp at 0, action labels (Log → Logged → Update), `logged(reps)` emission, and `disabled` gating the stepper and CTA plus the unlock hint.
- Notes: Component mounting needs Vuetify. `vitest.config.ts` was extended with `vite-plugin-vuetify` auto-import and `test.server.deps.inline: ['vuetify']`, and specs install `createVuetify()`. Outside the T-025 file list; logged as a deviation.

## T-024 Characterize `useAudioFeedback`

- Status: DONE
- Commands: `npm test -- src/composables/useAudioFeedback.spec.ts`
- Result: 4 tests pass. Locks `unlock` setting `isUnlocked`, idempotence (one AudioContext), resume only when state is `suspended`, and no throw when `AudioContext` is absent. Module state is reset with `vi.resetModules()`.

## T-023 Characterize legacy `useTimer` (live path)

- Status: DONE
- Commands: `npm test -- src/composables/useTimer.spec.ts`
- Result: 8 tests pass with fake timers and a mounted host component. Locks `formatDisplayTime`, start/stop/reset, navigation clamps (-1 and 5 ignored, next at last index sets `allTimersCompleted`), `remainingWorkoutTimeSeconds` (660 initial, 540 at index 1), save/load (stopped vs running with elapsed deduction), and `beforeunload` save.
- Notes: (1) Increment-per-`setInterval`-tick is locked as the AC-4.1 known gap. (2) `beforeunload` saves before `stopTimer`, so `timerRunning` is saved as `true`. (3) Before any navigation/load, `timer.durationSeconds` is 0, so the first tick immediately advances; tests call `goToTimer(0)` to initialize. (4) Returned from a dead component chain per T-008, but characterized as TASKS T-023 requires.

## T-022 Characterize `useWorkoutEngine`

- Status: DONE
- Commands: `npm test -- src/composables/useWorkoutEngine.spec.ts`
- Result: 6 tests pass with a mocked `WorkoutOrchestrator`. Locks one module-level orchestrator per module load, readonly snapshot, subscribe on creation / unsubscribe on `unmountEngine` / resubscribe on `mountEngine`, context cache and action delegation (`start`, `pause`, `resume`, `confirmReps`, `finishSession`), `restartWorkout` with a new `crypto.randomUUID` token plus dispose/re-init/start, and abandon delegation. Module state is reset with `vi.resetModules()` between cases.

## T-021 Characterize `useProgressionStore`

- Status: DONE
- Commands: `npm test -- src/stores/useProgressionStore.spec.ts`
- Result: 5 tests pass with mocked adapter, telemetry, and validator. Locks `validationResult` null before hydration, chart/level derivation from `currentLevel` (C4_B → 4/B), fallback C1_D- → chart 1/D- with age 30, contiguous volume and last-session stiffness flag wiring, `isHydrated`, and `reloadHistoryAsync` without re-init.
- Notes: Default fallbacks are profile null → C1_D- (chart 1, level D-) and age missing → 30.

## T-020 Characterize `useUserStore`

- Status: DONE
- Commands: `npm test -- src/stores/useUserStore.spec.ts`
- Result: 6 tests pass. Locks profile/draft hydration, malformed JSON → null profile + default draft, `isOnboardingCompleted ?? true`, onboarding completion (default aerobic from draft, profile saved, draft key removed), `setPreferredAerobic` persistence, and uncaught `persistDraft` write errors (AC-2.3 gap, D-003).

## T-019 Characterize `TelemetryService`

- Status: DONE
- Commands: `npm test -- src/core/telemetry/TelemetryService.spec.ts`
- Result: 5 tests pass. Locks `stagePendingSessionAsync` forcing `PENDING_TELEMETRY`, `sealSessionTelemetryAsync` setting `userFlaggedStiffOrSore` plus `SEALED_USER_CONFIRMED` or `SEALED_CONSERVATIVE`, null for an unknown token, and no `fetch` call during either operation.

## T-018 Characterize `IndexedDBAdapter`

- Status: DONE
- Commands: `npm test -- src/core/storage/IndexedDBAdapter.spec.ts`
- Result: 4 tests pass with `fake-indexeddb`. Locks store `sessions` with keyPath `sessionToken`, indexes `byLevel` (`['chartNumber','levelString']`) and `byDate` (`completedAt`), commit/read-by-token, `getAllSessionsAsync` ascending by `completedAt`, and WAL checkpoint removal on a successful commit.
- Notes: The WAL key is removed in `tx.oncomplete` (`IndexedDBAdapter.ts:49-52`), after `store.put` and before the commit promise resolves. Observed by checking the key before/after `await`.

## T-017 Characterize `WorkoutOrchestrator`

- Status: DONE
- Commands: `npm test -- src/core/WorkoutOrchestrator.spec.ts`
- Result: 9 tests pass. Locks UNINITIALIZED → READY → RUNNING → PAUSED → RUNNING → COMPLETED, `confirmReps` broadcasts RUNNING before releasing REST and records logged reps, `finishSession(aerobicCompleted)`, `abandonCurrentSessionAsync` (adapter call + reset to UNINITIALIZED), re-init guard, subscribe/unsubscribe/broadcast with faulty-subscriber isolation, and WAL reconstruction with token-integrity rejection. VerificationRunbook scenarios 1, 4 (adapted), 6, and 7 are covered.

## T-016 Characterize `TimerEngine`

- Status: DONE
- Commands: `npm test -- src/core/TimerEngine.spec.ts`
- Result: 5 tests pass. Locks hardware-anchor elapsed (1.5 s → 1, 3.5 s → 3), pause time excluded on resume, gated boundary holds at rest and releases on `resumeFromRest` (totalElapsed 11, not 21, after a 19.5 s rest), `restoreState` RUNNING anchor recalibration, and PAUSED restore with no ticks.
- Notes: Header records the missing visibility handling as the AC-4.4 known gap (D-003).

## T-015 Characterize `McMasterHIITStrategy.generateWorkout`

- Status: DONE
- Commands: `npm test -- src/core/McMasterHIITStrategy.spec.ts`
- Result: 2 tests pass. Locks nine intervals alternating `mcmaster_active`/`mcmaster_recovery`, each 60 s, 540 s total. Header comment records that it is not on the workout path (ROADMAP T-01).

## T-014 Characterize `ClassicRCAFStrategy.generateWorkout`

- Status: DONE
- Commands: `npm test -- src/core/ClassicRCAFStrategy.spec.ts`
- Result: 9 tests pass. Locks 5 intervals (120/60/60/60 s + aerobic), chart reps, classic vs modern-safe scaling (ex_2 × 0.8 with rounding 7.2 → 7), aerobic duration per option (stationary 360 s, outdoor 840 s, walk 1680 s from chart minutes), and throws for unknown chart/level (AC-3.3 gap, D-003).

## T-013 Characterize `ProgressionValidator.validate`

- Status: DONE
- Commands: `npm test -- src/core/ProgressionValidator.spec.ts`
- Result: 19 tests pass. Locks required sessions by band (20 → 1, 21/29 → 2, 30/39 → 4, 40/49 → 7, 50/59 → 8, 60/100 → 10), eligibility at and above the threshold, `VOLUME_QUOTA_INCOMPLETE`, `USER_TELEMETRY_RESTRICTION` with threshold +1 (still restricted when volume is met), and `INVALID_AGE` for negative/NaN ages.

## T-012 Characterize `HistoryAggregator.calculateContiguousVolume`

- Status: DONE
- Commands: `npm test -- src/core/storage/HistoryAggregator.spec.ts`
- Result: 7 tests pass. Locks newest-first counting, break on first non-matching record, disjoint newest → 0, PENDING_TELEMETRY skipped without breaking the chain, `aerobicCompleted: false` skipped without breaking the chain, and an aborted-only history → 0.

## T-011 Characterize `src/utils/charts.ts`

- Status: DONE
- Commands: `npm test -- src/utils/charts.spec.ts`
- Result: 3 tests pass. C1 returns 7 real exercises (E1-E5, E01, E02) with no reps. Unknown chart `C9` returns `[]` and calls `console.error('Chart with ID "C9" not found.')`. Missing ids (C6 → E26-E30) return `{ id, translationKey: '', illustration: '', icon: '' }` and call `console.warn`.

## T-010 Characterize `src/utils/levels.ts`

- Status: DONE
- Commands: `npm test -- src/utils/levels.spec.ts`
- Result: 9 tests pass. Locks `getGoalLevelByAge` (18 → C5_C, 25 → C4_A+, 60/61/120 → C2_C+, 5/0 → null), `extractChartAndLevel` (`C1_D-` → `['C1','D-']`, `''` → `['']`), `getExercisesForLevel` (C1_D- ids/reps, throws `Level with ID <id> not found.` for unknown level and unknown chart, mutates shared C1 exercise objects).
- Notes: `src/data/exercises.json` contains only E01, E02, E1-E5, E51, E52. Charts C2-C6 reference E6-E30, which do not exist, so `getChartExercises` returns fresh placeholder objects for those charts. Shared-object mutation is observable only for C1.

## T-009 Characterize `src/utils/ages.ts`

- Status: DONE
- Commands: `npm test -- src/utils/ages.spec.ts`
- Result: 34 tests pass. Locks birthday adjustment (including Feb 29), `getGoalChartByAge` boundaries 5/25/26/29/30/34/35/44/45/54/55/80, and `getAgeRangeLabel` boundaries 5/25/26/29/30/34/35/39/40/44/45/49/50/54/55/80.
- Notes: `getGoalChartByAge` disagrees with `src/data/ageGroups.json` (age 25 → 6 vs C4_A+ chart 4; age 18 → 6 vs C5_C chart 5). Recorded in the spec as a quirk, not resolved.

## T-008 Trace which timer records the session

- Status: DONE
- Commands: read only (`ActiveWorkoutView.vue`, `WorkoutTimer.vue`, `useWorkoutEngine.ts`, `WorkoutOrchestrator.ts`, `useTimer.ts`, `TimerEngine.ts`); `grep -rn "useTimer(" src/`
- Result:
  - (a) Stored session duration is `snapshot.totalElapsedSeconds`, written into the telemetry payload at `src/views/ActiveWorkoutView.vue:342` (`durationSeconds: snapshot.value?.totalElapsedSeconds || 660`). That value is produced by `TimerEngine.tick()` from `Math.floor((performance.now() - startAnchorHardwareTimestamp) / 1000)` (`src/core/TimerEngine.ts:97-98`), pushed via `onTick(elapsedInInterval, totalElapsedSeconds)` (`TimerEngine.ts:133`), and kept by `WorkoutOrchestrator.onTick` (`WorkoutOrchestrator.ts:267-275`). It is then persisted by `TelemetryService.stagePendingSessionAsync` → `IndexedDBAdapter.commit`.
  - (b) `useTimer`'s `elapsedSeconds` is incremented one per `setInterval` tick (`src/composables/useTimer.ts:117-119`) and reduced into `workout.remainingWorkoutTimeSeconds` (`useTimer.ts:63-71`). It reaches only display (`WorkoutTimerDisplay.vue`) and the legacy localStorage record written by `saveTimerState` (`useTimer.ts:77-84`, key `LOCAL_STORAGE_TIMER_KEY`). It never reaches `WorkoutOrchestrator` or IndexedDB.
  - (c) No current path runs both. `ActiveWorkoutView.vue` uses only `useWorkoutEngine` (`ActiveWorkoutView.vue:244-258`); `useTimer` is imported only by `WorkoutTimer.vue` (`src/components/WorkoutTimer.vue:30`) and for `formatDisplayTime` in `WorkoutTimerDisplay.vue:25`, and both components are in knip's unused list. If `WorkoutTimer` were mounted during an active session, both timers would run independently (module-level `useTimer` state).

## T-007 Install and configure test tooling

- Status: DONE
- Commands: `npm install -D vitest @vue/test-utils happy-dom fake-indexeddb`, `npm test`, `npm run build`
- Result: Installed vitest 5.0.5, @vue/test-utils 2.5.1, happy-dom 21.0.4, fake-indexeddb 6.2.6 (devDependencies only). Added `"test": "vitest run"`, `vitest.config.ts` (happy-dom, globals, `src/**/*.spec.ts`, `@` alias to `src`, passWithNoTests), and excluded `src/**/*.spec.ts` in `tsconfig.app.json`. `npm test` exits 0 with no test files; build passes.

## T-006 Verify Phase 0

- Status: DONE
- Commands: `npm run knip`, `npm run build`, `npm run lint`
- Result: knip exit 1 (expected: 25 unused files remain, none of the 7 T-003 deletions, chalk absent from unused devDependencies). Build exit 0 (PWA generated). Lint exit 0 with no errors or warnings, matching the T-002 baseline.

## T-005 Remove the unused chalk dependency

- Status: DONE
- Commands: `npm uninstall chalk`
- Result: Uninstalled `chalk` devDependency. Absent from package.json.

## T-004 Remove the orphaned WAL removal line

- Status: DONE
- Commands: `grep -rn "ya_5bx_wal" src/`, `npm run build`
- Result: Line `localStorage.removeItem('ya_5bx_wal')` removed from `IndexedDBAdapter.ts`. Zero matches found in `src/`. Build passed.

## T-003 Delete the accepted dead files

- Status: DONE
- Commands: `git rm <7 accepted files>`, `npm run knip`, `npm run build`
- Result: All 7 accepted dead files deleted. Build passed.

  - Accepted files deleted: `src/views/HomePage.vue`, `src/components/WorkoutCard.vue`, `src/components/PostWorkoutDialog.vue`, `src/components/LevelOverview.vue`, `src/components/WelcomeCard.vue`, `src/views/OnboardingPage.vue`, `src/composables/useUser.ts`.
  - Unlisted dead files, not deleted: `src/components/ChartCard.vue`, `src/components/ExerciseCard.vue`, `src/components/ExerciseList.vue`, `src/components/ExerciseTable.vue`, `src/components/LevelDetails.vue`, `src/components/OnboardingForm.vue`, `src/components/ProgressionMap.vue`, `src/components/workout/ExerciseInfoSheet.vue`, `src/components/WorkoutOptions.vue`, `src/components/WorkoutTimer.vue`, `src/components/WorkoutTimerControls.vue`, `src/components/WorkoutTimerDisplay.vue`, `src/composables/useTimer.ts`, `src/core/McMasterHIITStrategy.ts`, `src/core/scratch/generate_matrix.js`, `src/core/VerificationRunbook.ts`, `src/models/AgeGroup.ts`, `src/models/Chart.ts`, `src/models/Exercise.ts`, `src/models/Level.ts`, `src/models/User.ts`, `src/utils/charts.ts`, `src/utils/levels.ts`, `types/timer.ts`, `types/vuetify.d.ts`.
  - Newly orphaned, not deleted: None.

- Status: DONE
- Commands: `npm run knip`, `grep -rn "import(" src/`, `npm run lint 2>&1 | tail -n 5`, `npm run build`
- Result: Knip, dynamic imports, lint baseline, and build status recorded under Dead code audit.

## Dead code audit

### 1. Knip output (`npm run knip`)

```text
Unused files (32)
src/components/ChartCard.vue
src/components/ExerciseCard.vue
src/components/ExerciseList.vue
src/components/ExerciseTable.vue
src/components/LevelDetails.vue
src/components/LevelOverview.vue
src/components/OnboardingForm.vue
src/components/PostWorkoutDialog.vue
src/components/ProgressionMap.vue
src/components/WelcomeCard.vue
src/components/workout/ExerciseInfoSheet.vue
src/components/WorkoutCard.vue
src/components/WorkoutOptions.vue
src/components/WorkoutTimer.vue
src/components/WorkoutTimerControls.vue
src/components/WorkoutTimerDisplay.vue
src/composables/useTimer.ts
src/composables/useUser.ts
src/core/McMasterHIITStrategy.ts
src/core/scratch/generate_matrix.js
src/core/VerificationRunbook.ts
src/models/AgeGroup.ts
src/models/Chart.ts
src/models/Exercise.ts
src/models/Level.ts
src/models/User.ts
src/utils/charts.ts
src/utils/levels.ts
src/views/HomePage.vue
src/views/OnboardingPage.vue
types/timer.ts
types/vuetify.d.ts
Unused devDependencies (1)
chalk  package.json:43:6
Unused exports (10)
EXERCISE_TIMES                       src/constants.ts:1:14
EXERCISE_5_REPS                      src/constants.ts:3:14
EXERCISE_LEVELS                      src/constants.ts:4:14
LOCAL_STORAGE_TIMER_KEY              src/constants.ts:18:14
LOCAL_STORAGE_WORKOUT_KEY            src/constants.ts:21:14
SECONDS_IN_A_YEAR                    src/constants.ts:23:14
STARTER_LEVEL                        src/constants.ts:24:14
MINIMUM_REQUIRED_AGE                 src/constants.ts:25:14
LEVEL_ID_SEPARATOR                   src/constants.ts:26:14
calculateAge               function  src/utils/ages.ts:2:17
Unused exported types (2)
Grade        type       src/core/EngineTypes.ts:17:13
UserProfile  interface  src/stores/useUserStore.ts:7:18
```

### 2. Dynamic imports (`grep -rn "import(" src/`)

```text
src/router/index.ts:7:    component: () => import('@/views/DashboardView.vue'),
src/router/index.ts:12:    component: () => import('@/views/OnboardingView.vue'),
src/router/index.ts:17:    component: () => import('@/views/WorkoutSetupView.vue'),
src/router/index.ts:22:    component: () => import('@/views/ActiveWorkoutView.vue'),
src/router/index.ts:27:    component: () => import('@/views/ProgressView.vue'),
src/router/index.ts:32:    component: () => import('@/views/SettingsView.vue'),
```

### 3. Lint baseline (`npm run lint 2>&1 | tail -n 5`)

```text
> ya-5bx-app@0.0.4 lint
> eslint src/ --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix
```

(Exit code 0, no errors or warnings reported)

### 4. Build status (`npm run build`)

Pass (exit code 0, built in ~8s, PWA generated).

## T-001 Install and configure knip

- Status: DONE
- Commands: `npm install -D knip@5`, `npm run knip`
- Result: knip installed and configured via knip.json. `npm run knip` successfully audits unused files, devDependencies, and exports.
  Notes: Installed knip v5 to avoid Node v24 oxc-parser ArrayBuffer allocation crash present in knip v6.

## T-000 Verify decisions recorded

- Status: DONE
- Commands: inspect DECISIONS.md
- Result: D-001, D-002, and D-003 all present with Status: Accepted.

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
