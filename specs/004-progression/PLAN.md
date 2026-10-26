# PLAN: Progression and session history

**Feature ID:** 004-progression · **Spec version:** 0.1 · **Status:** Implemented · **Updated:** 2026-10-26

> HOW. This plan records how the delivered code satisfies `SPEC.md`; it is a reverse plan, not a proposal. Detail lives in `design/phase3-implementation.md`.

## 1. Approach summary

One local IndexedDB store holds completed sessions; a telemetry service stages and seals them; a Pinia store hydrates them behind a barrier and derives position from the user profile; a dialog captures feedback; a grid renders the matrix. The reverse plan names the current files and the tests that prove each requirement. No code changes are proposed.

## 2. Constitution check

| Principle / constraint               | How the delivered code satisfies it                                                      | Status |
| ------------------------------------ | ---------------------------------------------------------------------------------------- | ------ |
| §1 Local-only data                   | IndexedDB and local storage only; no network path in the persistence or telemetry layer. | OK     |
| §2 Deterministic, tested domain data | Volume and positioning are pure functions over stored records; every unit has a spec.    | OK     |
| §4 Bilingual parity                  | Dialog and map copy come from the catalogs added in 002.                                 | OK     |
| §6 Status not by colour alone        | Map cells expose state as text and icon, in addition to colour.                          | OK     |
| Quality gates                        | Covered by the suite; no new dependency in this feature.                                 | OK     |

## 3. Reuse audit

| Asset                                            | Covers                                 | Gap                                                   |
| ------------------------------------------------ | -------------------------------------- | ----------------------------------------------------- |
| `src/core/StorageTypes.ts`                       | Record and status types                | None.                                                 |
| `src/core/storage/IndexedDBAdapter.ts`           | Open, commit, read                     | None.                                                 |
| `src/core/storage/HistoryAggregator.ts`          | Contiguous-volume rule                 | None.                                                 |
| `src/core/telemetry/TelemetryService.ts`         | Stage and seal                         | None.                                                 |
| `src/stores/useProgressionStore.ts`              | Hydration, position, validation        | None.                                                 |
| `src/components/workout/PostWorkoutDialog.vue`   | Feedback capture and conservative seal | None.                                                 |
| `src/components/progress/ProgressionMapGrid.vue` | Matrix rendering                       | None.                                                 |
| `design/phase3-implementation.md`                | Original task list and rationale       | Stale paths and status name; corrected in `TASKS.md`. |

## 4. Architecture

```text
engine completion
  -> stage pending record (IndexedDB, two-phase commit)
  -> PostWorkoutDialog (60 s timer)
       -> seal user-confirmed | seal conservative
  -> useProgressionStore.initAsync()
       -> HistoryAggregator.calculateContiguousVolume()
       -> ProgressionValidator.validate()
  -> ProgressionMapGrid (completed / current / eligible / locked)
```

Components: adapter (persistence), telemetry service (status transitions), store (hydration and derivation), dialog (capture), grid (presentation).

## 5. Data model

`CompletedSessionRecord`: `version`, `sessionToken`, `completedAt`, `chartNumber`, `levelString`, `durationSeconds`, `telemetryStatus` (`PENDING_TELEMETRY` | `SEALED_USER_CONFIRMED` | `SEALED_CONSERVATIVE`), optional `userFlaggedStiffOrSore`. Object store `sessions`, key path `sessionToken`, indexes `byLevel` and `byDate`. No migration in this feature.

## 6. Interfaces and contracts

- `HistoryAggregator.calculateContiguousVolume(history, chart, level): number` — counts backwards, stops at the first mismatch, skips pending records.
- `TelemetryService.stagePendingSessionAsync(record)` — writes with `PENDING_TELEMETRY`.
- `TelemetryService.sealSessionTelemetryAsync(token, stiffOrSore, conservative)` — sets the final status.
- `useProgressionStore.initAsync()` — opens the adapter, loads history, derives chart and level, then sets `isHydrated`.
- `useProgressionStore.validationResult` — `null` until hydrated, then the validator result.

## 7. File changes

| Path                                                    | New / Modified    | Purpose                        |
| ------------------------------------------------------- | ----------------- | ------------------------------ |
| `specs/004-progression/SPEC.md`                         | New (owner-saved) | Requirements and criteria.     |
| `specs/004-progression/PLAN.md`                         | New               | This reverse plan.             |
| `specs/004-progression/TASKS.md`                        | New               | Delivered tasks with evidence. |
| `specs/004-progression/WALKTHROUGH.md`                  | New               | Verification record.           |
| `specs/004-progression/design/phase3-implementation.md` | Moved             | Original detailed task list.   |

No `src/` change.

## 8. Test strategy

| Criterion                               | Test type   | Location                                             |
| --------------------------------------- | ----------- | ---------------------------------------------------- |
| AC-1.1, AC-1.2                          | unit        | `src/core/storage/IndexedDBAdapter.spec.ts`          |
| AC-2.1, AC-2.2                          | unit        | `src/core/storage/IndexedDBAdapter.spec.ts`          |
| AC-3.1, AC-3.2                          | unit        | `src/core/storage/HistoryAggregator.spec.ts`         |
| AC-4.1, AC-4.3                          | component   | `src/components/workout/PostWorkoutDialog.spec.ts`   |
| AC-4.2                                  | component   | `src/components/workout/PostWorkoutDialog.spec.ts`   |
| AC-5.1, AC-5.2, AC-5.3                  | unit        | `src/stores/useProgressionStore.spec.ts`             |
| AC-6.1, AC-6.2                          | component   | `src/components/progress/ProgressionMapGrid.spec.ts` |
| AC-7.1                                  | integration | `src/__smoke__/app.smoke.spec.ts`                    |
| Manual: kill the tab mid-commit, reopen | manual      | Claimed; not run.                                    |

## 9. Risks and mitigations

| Risk                               | Likelihood              | Impact | Mitigation                                                                       |
| ---------------------------------- | ----------------------- | ------ | -------------------------------------------------------------------------------- |
| Document drift from code           | High (already happened) | Medium | Evidence notes name current files; the walkthrough records the superseded names. |
| Manual recovery check never run    | High                    | Medium | Recorded as Claimed; listed as a follow-up.                                      |
| Reverse spec overstates a behavior | Low                     | High   | Every ticked task cites a test or command.                                       |

## 10. Key decisions

- `D-002`: characterization-first delivery.
- `D-008`: invalid chart/level fallback, applied at the setup boundary, not in this feature.

## 11. Phases

| Phase     | Shippable deliverable                                    | Requirements covered |
| --------- | -------------------------------------------------------- | -------------------- |
| Delivered | Local history, telemetry sealing, progression store, map | R1 to R7             |

## 12. Revision log

| Version | Date       | Change      | Reason                                  |
| ------- | ---------- | ----------- | --------------------------------------- |
| 0.1     | 2026-10-26 | First draft | Reverse plan of delivered phase-3 work. |
