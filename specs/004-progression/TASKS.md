# TASKS: Progression and session history

**Feature ID:** 004-progression · **Spec v:** 0.1 · **Plan v:** 0.1 · **Updated:** 2026-10-26

> Historical record of delivered work. All tasks are complete and proven by the named checks; no execution is pending, so no `APPROVED:` line is required. A rework task added later needs a new approval line.

## How to read this file

1. A task is done only with an `Evidence:` note naming a file and a test or command.
2. The original phase-3 document is in `design/phase3-implementation.md`; where it disagrees with the code, the code wins and the deviation is recorded in `WALKTHROUGH.md` section 6.

## Conventions

- Evidence format: `Evidence: <path> · <test file or command>`.
- Paths name the current tree, not the paths used when the phase started.
- The delivered features are covered by `npm run build && npm run lint && npx vitest run`.

## Milestone 1: Delivered (R1 to R7)

- [x] T-001 Define the session record and status types
      Refs: R1, AC-1.1, AC-1.2
      Depends: none
      Files: `src/core/StorageTypes.ts`
      Do: Version, token, completion time, chart, level, duration, telemetry status and the optional soreness flag; one status per lifecycle step.
      Done when: the types compile and every persistence consumer imports them.
      Out of scope: storage logic.
      Notes: Evidence: `src/core/StorageTypes.ts` · `src/core/telemetry/TelemetryService.spec.ts`, `src/core/storage/IndexedDBAdapter.spec.ts`. The status `SEALED` was renamed to `SEALED_USER_CONFIRMED` by 006 T0-3; the original design document is stale on this point.

- [x] T-002 Persist sessions with a two-phase commit
      Refs: R2, AC-2.1, AC-2.2
      Depends: T-001
      Files: `src/core/storage/IndexedDBAdapter.ts`
      Do: Open the local database, create the session store and its two indexes, write the record, and clear the recovery marker only on transaction complete.
      Done when: a successful write removes the marker; an aborted transaction keeps it.
      Out of scope: history aggregation.
      Notes: Evidence: `src/core/storage/IndexedDBAdapter.ts:49-58` · `src/core/storage/IndexedDBAdapter.spec.ts` (4 tests). Earlier versions removed the marker in `request.onsuccess`; that line is gone.

- [x] T-003 Count contiguous volume at the current level
      Refs: R3, AC-3.1, AC-3.2
      Depends: T-001
      Files: `src/core/storage/HistoryAggregator.ts`
      Do: Walk the history newest-first, count matching chart and level, stop at the first mismatch, and skip records that are still pending feedback.
      Done when: a mismatched record ends the count and a pending record does not increment it.
      Out of scope: eligibility thresholds.
      Notes: Evidence: `src/core/storage/HistoryAggregator.ts:14-24` · `src/core/storage/HistoryAggregator.spec.ts` (7 tests).

- [x] T-004 Stage and seal telemetry
      Refs: R4, AC-4.1, AC-4.3
      Depends: T-002
      Files: `src/core/telemetry/TelemetryService.ts`
      Do: Stage a finished session as pending, then seal it as user-confirmed or conservative and store the soreness flag.
      Done when: both seal paths produce the correct status and flag.
      Out of scope: the dialog UI.
      Notes: Evidence: `src/core/telemetry/TelemetryService.ts:11-39` · `src/core/telemetry/TelemetryService.spec.ts` (5 tests).

- [x] T-005 Hydrate the progression store and derive the position
      Refs: R5, AC-5.1, AC-5.2, AC-5.3
      Depends: T-002, T-003
      Files: `src/stores/useProgressionStore.ts`
      Do: Open the adapter, load history, derive chart and level from the stored profile, expose the validation result, and set the hydration flag last.
      Done when: the position matches the profile and the validation result is `null` before hydration.
      Out of scope: rendering.
      Notes: Evidence: `src/stores/useProgressionStore.ts:20-44` · `src/stores/useProgressionStore.spec.ts` (5 tests).

- [x] T-006 Capture post-workout feedback
      Refs: R4, AC-4.1, AC-4.2, AC-4.3
      Depends: T-004
      Files: `src/components/workout/PostWorkoutDialog.vue`
      Do: Offer "fine" and "stiff or sore", run a sixty-second countdown, seal conservatively on timeout or dismissal, and surface a failed seal.
      Done when: both choices seal correctly, the timeout seals conservatively, and a write failure shows an error.
      Out of scope: the progression store.
      Notes: Evidence: `src/components/workout/PostWorkoutDialog.vue:130-170` · `src/components/workout/PostWorkoutDialog.spec.ts` (7 tests).

- [x] T-007 Render the progression map
      Refs: R6, AC-6.1, AC-6.2
      Depends: T-005
      Files: `src/components/progress/ProgressionMapGrid.vue`
      Do: Render six charts by twelve grades with completed, current, eligible and locked states; expose the state as text and icon as well as colour.
      Done when: an empty history shows one current cell and the rest locked; a hydrated history shows completed cells.
      Out of scope: navigation.
      Notes: Evidence: `src/components/progress/ProgressionMapGrid.vue:126` · `src/components/progress/ProgressionMapGrid.spec.ts` (6 tests). The phase-3 document names `ProgressionMap.vue`; the delivered file is `ProgressionMapGrid.vue`.

- [x] T-008 Open the capture flow on completion
      Refs: R7, AC-7.1
      Depends: T-004, T-006
      Files: `src/views/ActiveWorkoutView.vue`
      Do: When the engine reaches the terminal state, stage the session and open the dialog with its token.
      Done when: the smoke flow reaches the dialog after a completed workout.
      Out of scope: engine behavior.
      Notes: Evidence: `src/views/ActiveWorkoutView.vue:229,336` · `src/__smoke__/app.smoke.spec.ts` (3 tests). The phase-3 document names `WorkoutCard.vue`, which 001 deleted; the wiring lives in the active-workout view.

## Blocked / questions

None.

## Phase reviews

- Delivered phase: recorded 2026-10-26 from the audit; manual browser checks were not run.

## Coverage matrix

| Requirement | Criteria               | Tasks        |
| ----------- | ---------------------- | ------------ |
| R1          | AC-1.1, AC-1.2         | T-001        |
| R2          | AC-2.1, AC-2.2         | T-002        |
| R3          | AC-3.1, AC-3.2         | T-003        |
| R4          | AC-4.1, AC-4.2, AC-4.3 | T-004, T-006 |
| R5          | AC-5.1, AC-5.2, AC-5.3 | T-005        |
| R6          | AC-6.1, AC-6.2         | T-007        |
| R7          | AC-7.1                 | T-008        |
