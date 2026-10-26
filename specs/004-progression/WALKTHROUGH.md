# WALKTHROUGH: Progression and session history

**Feature:** 004-progression · **Tasks:** T-001 to T-008 · **Agent / model:** implementing agent (reverse spec session) · **Date:** 2026-10-26
**Status:** Complete with notes
**Verification:** Tests 228/228 (`npx vitest run`) · Typecheck ok (`npm run build`) · Lint ok · Build ok

> Written after the fact from the 2026-10-26 audit of `main` at `8a21f60`. Every "Yes" below cites a file and a check; manual checks that were never run are marked Claimed.

## 1. Task results

| Task  | Refs                 | Result | Evidence                                       |
| ----- | -------------------- | ------ | ---------------------------------------------- |
| T-001 | R1, AC-1.1, AC-1.2   | Done   | `StorageTypes.ts`; telemetry and adapter specs |
| T-002 | R2, AC-2.1, AC-2.2   | Done   | `IndexedDBAdapter.ts:49-58`; 4 adapter tests   |
| T-003 | R3, AC-3.1, AC-3.2   | Done   | `HistoryAggregator.ts:14-24`; 7 tests          |
| T-004 | R4, AC-4.1, AC-4.3   | Done   | `TelemetryService.ts:11-39`; 5 tests           |
| T-005 | R5, AC-5.1 to AC-5.3 | Done   | `useProgressionStore.ts:20-44`; 5 tests        |
| T-006 | R4, AC-4.1 to AC-4.3 | Done   | `PostWorkoutDialog.vue:130-170`; 7 tests       |
| T-007 | R6, AC-6.1, AC-6.2   | Done   | `ProgressionMapGrid.vue:126`; 6 tests          |
| T-008 | R7, AC-7.1           | Done   | `ActiveWorkoutView.vue:229,336`; 3 smoke tests |

## 2. What changed

| File                                                    | Change                | Summary                                       |
| ------------------------------------------------------- | --------------------- | --------------------------------------------- |
| `specs/004-progression/SPEC.md`                         | Created (owner-saved) | Reverse spec of the delivered behavior.       |
| `specs/004-progression/PLAN.md`                         | Created               | Reverse plan with current paths and test map. |
| `specs/004-progression/TASKS.md`                        | Created               | Eight delivered tasks with evidence.          |
| `specs/004-progression/WALKTHROUGH.md`                  | Created               | This record.                                  |
| `specs/004-progression/design/phase3-implementation.md` | Moved                 | Original phase-3 document, kept for detail.   |

## 3. Acceptance criteria status

| Criterion                                 | Met?    | Evidence                                               |
| ----------------------------------------- | ------- | ------------------------------------------------------ |
| AC-1.1                                    | Yes     | Adapter spec: record fields round-trip.                |
| AC-1.2                                    | Yes     | Adapter spec: missing optional fields hydrate.         |
| AC-2.1                                    | Yes     | Adapter clears the marker in `tx.oncomplete`.          |
| AC-2.2                                    | Yes     | Adapter spec: abort path rejects and keeps the marker. |
| AC-3.1                                    | Yes     | Aggregator spec: mismatch ends the count.              |
| AC-3.2                                    | Yes     | Aggregator spec: pending record skipped.               |
| AC-4.1                                    | Yes     | Dialog spec: both seal choices.                        |
| AC-4.2                                    | Yes     | Dialog spec: timeout and unmount seal conservatively.  |
| AC-4.3                                    | Yes     | Dialog spec: failed write emits `seal-failed`.         |
| AC-5.1                                    | Yes     | Store spec: position derived from profile.             |
| AC-5.2                                    | Yes     | Store spec: default position without profile.          |
| AC-5.3                                    | Yes     | Store spec: `validationResult` null before hydration.  |
| AC-6.1                                    | Yes     | Grid spec: state text and icon per cell.               |
| AC-6.2                                    | Yes     | Grid spec: empty history shows one current cell.       |
| AC-7.1                                    | Yes     | Smoke spec: completion opens the dialog.               |
| Manual: kill the tab mid-commit, reopen   | Claimed | Never run in a browser.                                |
| Manual: inspect IndexedDB after a workout | Claimed | Never run in a browser.                                |

## 4. Key decisions

- The reverse spec treats the code and its tests as authoritative over the phase-3 prose.
- Superseded names (`SEALED`, `ProgressionMap.vue`, `WorkoutCard.vue`) are recorded, not propagated.

## 5. Assumptions made

- The 2026-10-26 audit output is sufficient evidence for unit and component behavior.
- No requirement changed between delivery and this record.

## 6. Deviations

- The phase-3 document lists `SEALED`; the delivered value is `SEALED_USER_CONFIRMED` (006 T0-3).
- The phase-3 document lists `src/components/PostWorkoutDialog.vue` and `ProgressionMap.vue`; the delivered files are under `components/workout/` and `components/progress/`.
- The phase-3 document wires telemetry in `WorkoutCard.vue`; that file was deleted in 001 and the wiring lives in `ActiveWorkoutView.vue`.

## 7. Known gaps and follow-ups

- Manual browser checks (tab kill, IndexedDB inspection) remain unverified; tracked in `006-production-completion` verification.
- The map's non-color distinction relies on text and icon; an accessibility audit is roadmap RM-13.

## 8. How to verify

```sh
npx vitest run src/core/storage src/core/telemetry src/stores/useProgressionStore.spec.ts \
  src/components/workout/PostWorkoutDialog.spec.ts \
  src/components/progress/ProgressionMapGrid.spec.ts \
  src/__smoke__/app.smoke.spec.ts
```

## 9. Review packet

- This walkthrough, `SPEC.md` §5 to §6, the task entries above, and `git diff main...HEAD -- specs/004-progression`.
