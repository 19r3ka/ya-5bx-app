# TASKS: YA-5BX Baseline (Characterization Phase)

**Feature ID:** 001-baseline · **Spec:** 2.2 · **Plan:** 0.3 · **Decisions:** D-001, D-002, D-003 · **Updated:** 2026-10-17

## Agent rules (read first)

1. Run tasks in order. A task may start only when every task in its Depends line is DONE.
2. **Start check:** run `git status`. If there are uncommitted changes, stop and report them. Do not run any task.
3. **One task = one commit.** Message: `<type>(<scope>): T-0xx <title>`. Types: `chore`, `test`, `refactor`. Use `test` for test-only tasks.
4. **Log every task** in `specs/001-baseline/WALKTHROUGH.md`. Heading: `## T-0xx <title>`. Then one line for status (DONE or BLOCKED), the commands you ran, and each command's result. Put anything surprising under `Notes:`. Commit the WALKTHROUGH update with the task.
5. **Scope.** Edit only the files a task lists. Do not run `npm run lint -- --fix` or `npm run format`. Do not add or remove dependencies except where a task says to.
6. **Characterization assertions describe current behavior.** If the code disagrees with the SPEC, the test follows the code and carries the comment `// CHARACTERIZATION: known gap, see SPEC <AC-ID>`. Never change `src/` to make a test pass, except in the sanity tasks T-033 to T-037.
7. **Failure handling.** If a Done-when check fails after two honest attempts, mark the task BLOCKED in WALKTHROUGH with the error text. Continue with the next task whose Depends are all DONE. Never skip a task silently.
8. **Stop conditions (only these):**
   a. Uncommitted changes at start (rule 2).
   b. A sanity task (T-033 to T-037) whose revert cannot restore `git diff src/` to empty. Stop immediately, do not run further tasks, and report.
9. **Reachability.** knip's unused-file list is the authority. A component in that list is dead: do not write a test for it, and log the task as SKIPPED: dead. Otherwise the component is live.
10. **Definitions.** "Suite green" means `npm test` exits 0. "Build passes" means `npm run build` exits 0.

## Gates (all accepted by owner; no input needed during the run)

| Gate | Decision                                                | Status                                                                                                         |
| ---- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| G-1  | knip is the dead-code authority (D-001)                 | Accepted                                                                                                       |
| G-2  | Owner-accepted dead-file set (T-003) may be deleted     | Accepted                                                                                                       |
| G-3  | Test tooling (D-002)                                    | Accepted                                                                                                       |
| G-4  | Known gaps are locked by characterization tests (D-003) | Accepted                                                                                                       |
| G-5  | Which timer records session duration                    | Not a gate. T-016 and T-023 characterize both timers without choosing one. The choice is for Phase 1 planning. |

---

## Phase 0: Dead-code removal

- [x] **T-000 Verify decisions recorded**
      Depends: none
      Files: `DECISIONS.md`
      Do: Confirm `DECISIONS.md` contains entries D-001, D-002, and D-003, each with `Status: Accepted`. If any is missing, BLOCKED, and stop (stop condition does not apply; continue with independent tasks only after logging).
      Done when: all three entries are present and accepted. Commit the WALKTHROUGH entry only.

- [x] **T-001 Install and configure knip**
      Depends: T-000
      Files: `package.json`, `package-lock.json`, `knip.json` (new)
      Do: Run `npm install -D knip`. Create `knip.json`:

```json
{
  "entry": [
    "src/main.ts",
    "vite.config.ts",
    "eslint.config.js",
    "prettier.config.js"
  ]
}
```

Add the script `"knip": "knip"` to `package.json`. If knip rejects the config, adjust `knip.json` minimally and log the change.
Done when: `npm run knip` runs to completion. A non-zero exit code is expected while dead files exist and is not a failure.

- [x] **T-002 Save the knip audit and baseline**
      Depends: T-001
      Files: `specs/001-baseline/WALKTHROUGH.md`
      Do:

  1. Run `npm run knip` and copy the full output under `## Dead code audit`.
  2. Run `grep -rn "import(" src/` and record every dynamic import.
  3. Run `npm run lint 2>&1 | tail -n 5` and record the summary as the lint baseline. Do not fix anything.
  4. Run `npm run build` and record pass or fail.
     Done when: all four results are recorded in WALKTHROUGH.

- [x] **T-003 Delete the accepted dead files**
      Depends: T-002
      Files: only the seven paths below, and only if knip lists them as unused files.
      Accepted set:

  - `src/views/HomePage.vue`
  - `src/components/WorkoutCard.vue`
  - `src/components/PostWorkoutDialog.vue` (root-level file only)
  - `src/components/LevelOverview.vue`
  - `src/components/WelcomeCard.vue`
  - `src/views/OnboardingPage.vue`
  - `src/composables/useUser.ts`

  Do:

  1. For each path in the accepted set that knip lists as unused: `git rm <path>`.
  2. For each path in the set that knip does not list: keep it and log "not listed by knip, kept".
  3. For any file knip lists as unused that is not in the set: do not delete it. Log it under `Unlisted dead files, not deleted`.
  4. Re-run `npm run knip`. Files that become unused as a result of step 1 are logged under `Newly orphaned, not deleted`. Do not delete them in this task.
  5. Run `npm run build`.

  Done when: the build passes and every item above is logged.
  Out of scope: `src/components/workout/PostWorkoutDialog.vue`, `src/composables/useWorkoutEngine.ts`, and `src/components/WorkoutTimer.vue` are live. Never delete them.

- [x] **T-004 Remove the orphaned WAL removal line**
      Depends: T-003
      Files: `src/core/storage/IndexedDBAdapter.ts`
      Do: Delete the single line `localStorage.removeItem('ya_5bx_wal')` inside `tx.oncomplete`. Keep the adjacent `workout_checkpoint_` removal unchanged.
      Done when: `grep -rn "ya_5bx_wal" src/` returns no matches and `npm run build` passes.

- [x] **T-005 Remove the unused chalk dependency**
      Depends: T-002
      Files: `package.json`, `package-lock.json`
      Do: If knip lists `chalk` as an unused dependency, run `npm uninstall chalk`. If not, log "kept" and make no change.
      Done when: `chalk` is absent from `package.json`, or the log says it was kept.

- [x] **T-006 Verify Phase 0**
      Depends: T-003, T-004, T-005
      Files: `specs/001-baseline/WALKTHROUGH.md`
      Do:
  1. Run `npm run knip` and record the output. Items removed in T-003 must not reappear.
  2. Run `npm run build`.
  3. Run `npm run lint` and compare its summary with the T-002 baseline. Record any new errors. Do not fix them.
     Done when: the build passes, knip shows no removed item, and lint shows no new errors compared with the baseline. Route rendering is verified by the smoke test in T-032, not here.

---

## Phase 3a: Test harness

- [x] **T-007 Install and configure test tooling**
      Depends: T-006
      Files: `package.json`, `package-lock.json`, `vitest.config.ts` (new), `tsconfig.app.json`
      Do:
  1. Run `npm install -D vitest @vue/test-utils happy-dom fake-indexeddb`.
  2. Add the script `"test": "vitest run"`.
  3. Create `vitest.config.ts` with environment `happy-dom`, globals `true`, include `src/**/*.spec.ts`, alias `@` mapped to `src` (copy from `vite.config.ts`), and `test: { passWithNoTests: true }`.
  4. In `tsconfig.app.json`, add `"src/**/*.spec.ts"` to `exclude`, so the application type-check ignores specs.
     Done when: `npm test` exits 0 with no spec files present, and `npm run build` passes. Add no runtime dependencies.

---

## Phase 3b: Investigation (read-only)

- [x] **T-008 Trace which timer records the session**
      Depends: T-006
      Files: `specs/001-baseline/WALKTHROUGH.md` only
      Do: Read-only. Trace in `src/views/ActiveWorkoutView.vue`, `src/components/WorkoutTimer.vue`, `src/composables/useWorkoutEngine.ts`, and `src/core/WorkoutOrchestrator.ts`:
  - (a) Which value becomes the stored session duration, and where it is written.
  - (b) Whether `useTimer`'s `elapsedSeconds` (incremented by `setInterval`) reaches stored data or only the display.
  - (c) Any path where both `TimerEngine` and `useTimer` run during one workout.
    Record each finding with file and line references under `## T-008 findings`.
    Done when: (a), (b), and (c) are recorded. Change no code.

---

## Phase 3c: Characterization tests

Scope for every task in this phase: new `*.spec.ts` files only. Do not change any `src/` file. For each module, first read the source, then write tests that assert the observed behavior. Run `npm test` after each file. When a test fails because the code behaves differently from the SPEC, keep the assertion to the code's behavior and add the CHARACTERIZATION comment. Record every quirk you observe under `Notes:` in WALKTHROUGH.

### Pure logic

- [x] **T-009 Characterize `src/utils/ages.ts`**
      Depends: T-007
      Files: `src/utils/ages.spec.ts` (new)
      Lock: `calculateAge` (including the birthday-not-yet adjustment); `getGoalChartByAge` at boundaries 25→6, 26→5, 29→5, 30→4, 34→4, 35→3, 44→3, 45→2, 54→2, 55→1; `getAgeRangeLabel` at boundaries. Note any disagreement with `src/data/ageGroups.json` as a quirk (do not resolve).
      Done when: `npm test -- src/utils/ages.spec.ts` passes.

- [x] **T-010 Characterize `src/utils/levels.ts`**
      Depends: T-007
      Files: `src/utils/levels.spec.ts` (new)
      Lock: `getGoalLevelByAge` (in range, above maximum, below minimum); `extractChartAndLevel` including empty-string input (record the actual return); `getExercisesForLevel` (throws on unknown id; reps assignment; record whether it mutates shared exercise objects).
      Done when: `npm test -- src/utils/levels.spec.ts` passes.

- [x] **T-011 Characterize `src/utils/charts.ts`**
      Depends: T-007
      Files: `src/utils/charts.spec.ts` (new)
      Lock: `getChartExercises` for a known chart, an unknown chart (record return value and console calls), and a missing exercise id (record the placeholder).
      Done when: `npm test -- src/utils/charts.spec.ts` passes.

### Core domain

- [x] **T-012 Characterize `HistoryAggregator.calculateContiguousVolume`**
      Depends: T-007
      Files: `src/core/storage/HistoryAggregator.spec.ts` (new)
      Lock: newest-first counting; break on first mismatch; disjoint history returns 0; `PENDING_TELEMETRY` handling; `aerobicCompleted: false` voids the session.
      Done when: `npm test -- src/core/storage/HistoryAggregator.spec.ts` passes.

- [x] **T-013 Characterize `ProgressionValidator.validate`**
      Depends: T-007
      Files: `src/core/ProgressionValidator.spec.ts` (new)
      Lock: required sessions by age at boundaries 20/21, 29/30, 39/40, 49/50, 59/60 (values from `progression_rules.json`); eligible when verified ≥ required; stiffness returns `USER_TELEMETRY_RESTRICTION` and raises the threshold; `VOLUME_QUOTA_INCOMPLETE`; `INVALID_AGE`.
      Done when: `npm test -- src/core/ProgressionValidator.spec.ts` passes.

- [x] **T-014 Characterize `ClassicRCAFStrategy.generateWorkout`**
      Depends: T-007
      Files: `src/core/ClassicRCAFStrategy.spec.ts` (new)
      Lock: four rep intervals plus one aerobic interval; rep scaling by `volume_scaler_coefficient`; aerobic duration by option from `charts_matrix`; throws on invalid chart or level (known gap AC-3.3, D-003).
      Done when: `npm test -- src/core/ClassicRCAFStrategy.spec.ts` passes.

- [x] **T-015 Characterize `McMasterHIITStrategy.generateWorkout`**
      Depends: T-007
      Files: `src/core/McMasterHIITStrategy.spec.ts` (new)
      Lock: nine intervals alternating active and recovery, 60 s each, 540 s total. Header comment: "Not on the workout path; see ROADMAP T-01."
      Done when: `npm test -- src/core/McMasterHIITStrategy.spec.ts` passes.

- [x] **T-016 Characterize `TimerEngine`**
      Depends: T-007, T-008
      Files: `src/core/TimerEngine.spec.ts` (new)
      Use a fake `performance.now()`. Lock: elapsed time derives from the start anchor, not from tick count; pause excludes paused time on resume; a gated boundary holds at rest until `resumeFromRest`; `restoreState` recalibrates the anchor. Mark the absence of visibility handling as a known gap (AC-4.4, D-003). Record the legacy timer's behavior in T-023, not here.
      Done when: `npm test -- src/core/TimerEngine.spec.ts` passes.

- [x] **T-017 Characterize `WorkoutOrchestrator`**
      Depends: T-016
      Files: `src/core/WorkoutOrchestrator.spec.ts` (new)
      Use a mock persistence adapter. Lock: lifecycle transitions (UNINITIALIZED → READY → RUNNING → COMPLETED); `confirmReps` releases rest and sets RUNNING before broadcast; `finishSession(aerobicCompleted)`; `abandonCurrentSessionAsync`; re-initializing during an active session throws; subscribe, unsubscribe, and broadcast; WAL reconstruction. Use the scenarios in `src/core/VerificationRunbook.ts` as cases.
      Done when: `npm test -- src/core/WorkoutOrchestrator.spec.ts` passes.

- [x] **T-018 Characterize `IndexedDBAdapter`**
      Depends: T-007, T-004
      Files: `src/core/storage/IndexedDBAdapter.spec.ts` (new)
      Use `fake-indexeddb`. Lock: `openAsync` creates store `sessions` with keyPath `sessionToken` and the indexes it defines (confirm names from source); commit writes the record; `getAllSessionsAsync` returns ascending order; the WAL clear timing as it actually occurs. Record the observed timing in the test comment.
      Done when: `npm test -- src/core/storage/IndexedDBAdapter.spec.ts` passes.

- [x] **T-019 Characterize `TelemetryService`**
      Depends: T-018
      Files: `src/core/telemetry/TelemetryService.spec.ts` (new)
      Lock: `stagePendingSessionAsync` sets `PENDING_TELEMETRY`; `sealSessionTelemetryAsync` sets `userFlaggedStiffOrSore` and status `SEALED_USER_CONFIRMED` or `SEALED_CONSERVATIVE`; no network call (assert `fetch` is not called).
      Done when: `npm test -- src/core/telemetry/TelemetryService.spec.ts` passes.

### Stores

- [x] **T-020 Characterize `useUserStore`**
      Depends: T-007
      Files: `src/stores/useUserStore.spec.ts` (new)
      Use a fresh Pinia per case and a localStorage stub. Lock: hydrate profile and draft; malformed JSON is caught and yields null; `isOnboardingCompleted ?? true` default; `persistDraft` has no try/catch (lock by asserting that a thrown error propagates; known gap AC-2.3); `completeOnboarding` saves the profile, sets the default aerobic option, and removes the draft key; `setPreferredAerobic` persists.
      Done when: `npm test -- src/stores/useUserStore.spec.ts` passes.

- [x] **T-021 Characterize `useProgressionStore`**
      Depends: T-013, T-020
      Files: `src/stores/useProgressionStore.spec.ts` (new)
      Mock the IndexedDB adapter, telemetry, and validator. Lock: `initAsync` derives chart and level from profile `currentLevel` with fallback; `validationResult` is null before hydration; `isHydrated` is set after load; contiguous volume and validator wiring; `lastSession.userFlaggedStiffOrSore` feeds the snapshot; `reloadHistoryAsync`. Record the default fallback for missing profile and age.
      Done when: `npm test -- src/stores/useProgressionStore.spec.ts` passes.

### Composables

- [x] **T-022 Characterize `useWorkoutEngine`**
      Depends: T-017
      Files: `src/composables/useWorkoutEngine.spec.ts` (new)
      Lock: module-level singleton orchestrator; readonly snapshot; subscribe on mount and unsubscribe on unmount; `initializeSession` caches context; `restartWorkout` creates a new session token; delegation of `confirmReps`, `finishSession`, pause, and resume. The singleton persists across tests: reset module state between cases.
      Done when: `npm test -- src/composables/useWorkoutEngine.spec.ts` passes.

- [x] **T-023 Characterize legacy `useTimer` (live path)**
      Depends: T-008, T-007
      Files: `src/composables/useTimer.spec.ts` (new)
      Use fake timers and a localStorage stub. Lock: `formatDisplayTime`; `startTimer`, `stopTimer`, and reset; navigation bounds; `remainingWorkoutTimeSeconds`; save and load; `beforeunload` save. Lock the increment-per-`setInterval`-tick behavior as a known gap (AC-4.1, D-003). Record the findings from T-008 in the header comment.
      Done when: `npm test -- src/composables/useTimer.spec.ts` passes.

- [ ] **T-024 Characterize `useAudioFeedback`**
      Depends: T-007
      Files: `src/composables/useAudioFeedback.spec.ts` (new)
      Lock: `unlock` sets `isUnlocked`; idempotent on repeat; resumes a suspended AudioContext; does not throw when AudioContext is absent.
      Done when: `npm test -- src/composables/useAudioFeedback.spec.ts` passes.

### Components (each task first applies rule 9)

- [x] **T-025 Characterize `WorkoutRepOverridePanel`**
      Depends: T-007
      Files: `src/components/workout/WorkoutRepOverridePanel.spec.ts` (new)
      Lock: reps seeded from `defaultReps`; increment and decrement clamp at 0; `actionLabel` states; emits `logged(reps)`; `disabled` gates the stepper and the call-to-action.
      Done when: `npm test -- src/components/workout/WorkoutRepOverridePanel.spec.ts` passes.

- [x] **T-026 Characterize `PostWorkoutDialog` (`workout/`)**
      Depends: T-019, T-007
      Files: `src/components/workout/PostWorkoutDialog.spec.ts` (new)
      Use fake timers and a mocked telemetry service. Lock: 60 s auto-seal as conservative; saving great or sore; `isSealing` dedupe; unmount with no selection seals conservative; emits `saved` and `seal-failed` when the adapter rejects.
      Done when: `npm test -- src/components/workout/PostWorkoutDialog.spec.ts` passes.

- [x] **T-027 Characterize `WorkoutTimerClock`**
      Depends: T-007
      Files: `src/components/workout/WorkoutTimerClock.spec.ts` (new)
      Use fake timers. Lock: mm:ss from duration minus elapsed, clamped at 0; `progressPercent`; `isExpired`; emits `expired` at 0; internal ticker active only when `elapsedSeconds` is undefined.
      Done when: `npm test -- src/components/workout/WorkoutTimerClock.spec.ts` passes.

- [x] **T-028 Characterize `ProgressionMapGrid`**
      Depends: T-007
      Files: `src/components/progress/ProgressionMapGrid.spec.ts` (new)
      Lock: `parseLevelId` (valid input; invalid input returns the default); `getCellState` for current, completed, goal, and locked, using explicit `completedLevelIds`; skeleton when not hydrated.
      Done when: `npm test -- src/components/progress/ProgressionMapGrid.spec.ts` passes.

- [x] **T-029 Characterize onboarding components**
      Depends: T-007
      Files: `src/components/onboarding/Step2Age.spec.ts`, `src/components/onboarding/GoalChartCard.spec.ts`, `src/components/common/OnboardingProgress.spec.ts` (all new)
      Lock: Step2Age accepts ages 10 to 99, derives the goal chart, emits `next(age)`, and disables Continue when invalid. GoalChartCard renders chart number and age range from props. OnboardingProgress marks as active the pips at or below the current step.
      Done when: `npm test -- src/components` passes for these three files.

- [x] **T-030 Characterize i18n plugin defaults**
      Depends: T-007
      Files: `src/plugins/i18n.spec.ts` (new)
      Lock: default locale `fr-FR`; fallback `en-US`; both message catalogs load. Do not assert translation completeness (Phase 1).
      Done when: `npm test -- src/plugins/i18n.spec.ts` passes.

### Router and smoke

- [x] **T-031 Characterize the router table**
      Depends: T-007
      Files: `src/router/index.spec.ts` (new)
      Use memory history. Each of the six named routes resolves to its view. An unknown path is not redirected today: lock that as a known gap (AC-1.2, D-003). Do not add a redirect.
      Done when: `npm test -- src/router/index.spec.ts` passes.

- [ ] **T-032 Smoke test of main flows (no browser)**
      Depends: T-020, T-022, T-031
      Files: `src/__smoke__/app.smoke.spec.ts` (new)
      Mount the app with Pinia and a memory router, stubbing progression initialization. Assert only: a fresh install lands on onboarding; `completeOnboarding` leads to the dashboard; navigating to workout setup and then active workout works; the bottom navigation is hidden on the active workout route. No deep assertions.
      Done when: `npm test -- src/__smoke__/app.smoke.spec.ts` passes.

---

## Phase 3d: Sanity mutations (transient src edits, must revert)

Procedure for each task in this phase:

1. Confirm `git status` is clean.
2. Apply the mutation named in the task to the one `src/` file listed.
3. Run the named spec. It must FAIL. Record the failing assertion in WALKTHROUGH.
4. Restore the file with `git checkout -- <file>`.
5. Confirm `git diff src/` is empty, then run `npm test`. It must pass.
6. Commit only the WALKTHROUGH update.

If step 4 or 5 does not produce a clean state, apply stop condition 8b.

- [ ] **T-033 [transient] Sanity: HistoryAggregator break removed**
      Depends: T-012
      File: `src/core/storage/HistoryAggregator.ts`
      Mutation: remove the break on first mismatch.
      Spec: `src/core/storage/HistoryAggregator.spec.ts`
      Done when: spec fails under mutation, and the clean-state procedure completes.

- [ ] **T-034 [transient] Sanity: ProgressionValidator threshold changed**
      Depends: T-013
      File: `src/core/ProgressionValidator.ts`
      Mutation: change one required-sessions value in the 40 to 49 band from 7 to 6.
      Spec: `src/core/ProgressionValidator.spec.ts`
      Done when: spec fails under mutation, and the clean-state procedure completes.

- [ ] **T-035 [transient] Sanity: ClassicRCAF rep source changed**
      Depends: T-014
      File: `src/core/ClassicRCAFStrategy.ts`
      Mutation: change the rep source for one exercise, or drop the aerobic interval.
      Spec: `src/core/ClassicRCAFStrategy.spec.ts`
      Done when: spec fails under mutation, and the clean-state procedure completes.

- [ ] **T-036 [transient] Sanity: WAL cleared on request success**
      Depends: T-018
      File: `src/core/storage/IndexedDBAdapter.ts`
      Mutation: move the WAL removal from `tx.oncomplete` to the request `onsuccess` handler.
      Spec: `src/core/storage/IndexedDBAdapter.spec.ts`
      Done when: spec fails under mutation, and the clean-state procedure completes.

- [ ] **T-037 [transient] Sanity: pause time counted as elapsed**
      Depends: T-016
      File: `src/core/TimerEngine.ts`
      Mutation: remove the pause adjustment to the start anchor on resume.
      Spec: `src/core/TimerEngine.spec.ts`
      Done when: spec fails under mutation, and the clean-state procedure completes.

---

## Exclusions

- **Dead code** (T-003 set and anything knip lists as unused): not tested.
- **Target features** with no current behavior: wake lock (R4b), import (AC-5.3), celebration (AC-6.2), backup (AC-7.1, AC-7.2), health gate (AC-11.1). Gaps that do have current behavior are locked (see D-003).
- **Manual checks** (PLAN §8): offline launch (AC-9.1, M-1), accessibility (AC-10.1, AC-10.2, M-2).

## Coverage

| Requirement | Criteria               | Tasks                                    | Status                                                               |
| ----------- | ---------------------- | ---------------------------------------- | -------------------------------------------------------------------- |
| R1          | AC-1.1, AC-1.2         | T-031, T-032                             | AC-1.1 locked; AC-1.2 gap locked                                     |
| R2          | AC-2.1, AC-2.2, AC-2.3 | T-020, T-029                             | AC-2.1, AC-2.2 locked; AC-2.3 gap locked                             |
| R3          | AC-3.1, AC-3.2, AC-3.3 | T-009 to T-011, T-014, T-015             | AC-3.1 and AC-3.2 locked; AC-3.3 gap locked                          |
| R4          | AC-4.1 to AC-4.4       | T-016, T-017, T-022, T-023, T-025, T-027 | AC-4.1 (legacy) gap locked; AC-4.2, AC-4.3 locked; AC-4.4 gap locked |
| R4b         | Wake lock              | None                                     | Target                                                               |
| R5          | AC-5.1, AC-5.2, AC-5.3 | T-018, T-019, T-026                      | AC-5.1, AC-5.2 locked; AC-5.3 target                                 |
| R6          | AC-6.1 to AC-6.3       | T-012, T-013, T-021, T-028               | AC-6.1, AC-6.3 locked; AC-6.2 target                                 |
| R7          | AC-7.1, AC-7.2         | None                                     | Target                                                               |
| R8          | AC-8.1                 | T-029, T-030                             | Locked; completeness is Phase 1                                      |
| R9          | AC-9.1                 | None                                     | Manual M-1                                                           |
| R10         | AC-10.1, AC-10.2       | None                                     | Manual M-2                                                           |
| R11         | AC-11.1                | None                                     | Target                                                               |

## Next phases

Phase 1 (must gaps), Phase 2 (timing safety), Phase 4 (data safety), and Phase 5 (target features) get their own TASKS sections after this file's phases are DONE. Each gap locked here is flipped in the phase that fixes it, in the same commit as the fix.# TASKS: YA-5BX Baseline (Characterization Phase)
