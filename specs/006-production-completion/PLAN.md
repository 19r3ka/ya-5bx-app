# PLAN: Production completion

**Feature ID:** 006-production-completion · **Spec version:** 0.1 · **Status:** Implemented with open items · **Updated:** 2026-10-26

> HOW. This plan records how the delivered code meets `SPEC.md` and which items remain open. Detail lives in `design/phase5-specs.md`; it is referenced, not restated.

## 1. Approach summary

The production pass moved from the data layer outward: atomic writes and a precise telemetry vocabulary, then a single source of position, then store wiring, then clock and seal lifecycles, then styling and delivery. The reverse plan names the delivered files and the four unmet items: canonical refs still initialised to literals, the setup exercise list, the clock prop, and scoped colour/border rules.

## 2. Constitution check

| Principle / constraint        | How the delivered code satisfies it                                         | Status  |
| ----------------------------- | --------------------------------------------------------------------------- | ------- |
| §1 Local-only data            | IndexedDB and localStorage only; the service worker caches local assets.    | OK      |
| §2 Deterministic domain data  | Volume, validation and position derive from stored records and the profile. | OK      |
| §4 Bilingual parity           | Screen copy comes from catalogs; no user-facing literals added.             | OK      |
| §6 Status not by colour alone | Map and dialog states carry text or icons.                                  | OK      |
| Quality gates                 | Build, lint and 228 tests pass.                                             | OK      |
| Offline and release safety    | PWA configured; release and deploy split.                                   | OK      |
| One stylesheet rule           | Scoped colour/border blocks remain; tracked in T-014.                       | Partial |

## 3. Reuse audit

| Asset                                          | Covers                         | Gap                                    |
| ---------------------------------------------- | ------------------------------ | -------------------------------------- |
| `src/core/storage/IndexedDBAdapter.ts`         | Atomic write, recovery markers | None.                                  |
| `src/core/telemetry/TelemetryService.ts`       | Stage and seal                 | None.                                  |
| `src/stores/useProgressionStore.ts`            | Derivation from the profile    | Initial refs still literal; T-004.     |
| `src/stores/useUserStore.ts`                   | Profile and onboarding draft   | None.                                  |
| `src/views/WorkoutSetupView.vue`               | Start flow and audio unlock    | Exercise list hardcoded; T-008.        |
| `src/components/workout/WorkoutTimerClock.vue` | Countdown                      | Accepts an elapsed prop; T-011.        |
| `src/style.css`                                | Global app classes             | Replaced; scoped blocks remain; T-014. |
| `vite.config.ts`                               | PWA plugin and manifest        | None.                                  |
| `.github/workflows/deploy.yml`                 | Release and deploy jobs        | None.                                  |
| `design/phase5-specs.md`                       | Original tier plan and checks  | Open items still listed there.         |

## 4. Architecture

```text
App.vue onMounted -> progressionStore.initAsync() -> profile position + history
views (dashboard, setup, active, progress) -> stores and engine snapshot
indexedDB  <- IndexedDBAdapter (tx commit) <- TelemetryService <- dialog
WorkoutTimerClock -> local 1 Hz tick from static start and duration
vite-plugin-pwa -> manifest + service worker -> static host
CI: release job (tag) -> deploy job (build + pages)
```

## 5. Data model

`TelemetryStatus` = `PENDING_TELEMETRY` | `SEALED_USER_CONFIRMED` | `SEALED_CONSERVATIVE`. The profile owns `currentLevel` (for example `C1_D-`) and `goalLevel`. Session records are unchanged otherwise; no migration is added in this feature.

## 6. Interfaces and contracts

- `commitCompletedWorkoutAsync(record)` — resolves on transaction complete; rejects on error or abort; markers persist until commit.
- `calculateContiguousVolume(history, chart, level)` — skips pending records and stops at the first mismatch.
- `useProgressionStore.initAsync()` — reads the profile position, then opens and loads history; `isHydrated` is last.
- `initializeSession({ sessionToken, chartNumber, levelString, aerobicVariant })` then `startWorkout()`.
- `WorkoutTimerClock` — target contract: static `startTimestamp` and `durationSeconds`; local tick; `expired` event.
- `release` and `deploy` workflow jobs — `deploy.needs = release`.

## 7. File changes

| Path                                                     | New / Modified    | Purpose                            |
| -------------------------------------------------------- | ----------------- | ---------------------------------- |
| `specs/006-production-completion/SPEC.md`                | New (owner-saved) | Requirements and criteria.         |
| `specs/006-production-completion/PLAN.md`                | New               | This reverse plan.                 |
| `specs/006-production-completion/TASKS.md`               | New               | 16 production items with evidence. |
| `specs/006-production-completion/WALKTHROUGH.md`         | New               | Verification record.               |
| `specs/006-production-completion/design/phase5-specs.md` | Moved             | Original production plan.          |

No `src/` change.

## 8. Test strategy

| Criterion      | Test type         | Location / command                                                   |
| -------------- | ----------------- | -------------------------------------------------------------------- |
| AC-1.1, AC-1.2 | unit              | `src/core/storage/IndexedDBAdapter.spec.ts`                          |
| AC-1.3         | component         | `src/components/workout/PostWorkoutDialog.spec.ts`                   |
| AC-2.1, AC-2.4 | unit              | `src/stores/useProgressionStore.spec.ts`                             |
| AC-2.2         | unit              | `src/stores/useUserStore.spec.ts`, onboarding flow                   |
| AC-2.3         | unit              | `src/core/storage/HistoryAggregator.spec.ts`                         |
| AC-3.1         | inspection        | `src/views/DashboardView.vue` computed values                        |
| AC-3.2, AC-3.5 | unit + inspection | `src/views/WorkoutSetupView.spec.ts`; open item                      |
| AC-3.3         | inspection        | `src/views/ActiveWorkoutView.vue` engine bindings                    |
| AC-3.4         | component         | `src/components/progress/ProgressionMapGrid.spec.ts`                 |
| AC-4.1, AC-4.2 | inspection        | open item: `WorkoutTimerClock.vue`                                   |
| AC-5.1         | scripted          | `head -3 src/style.css`                                              |
| AC-5.2         | scripted          | `grep -rln '<style scoped>' src/components src/views` (currently 10) |
| AC-6.1         | build + manual    | `npm run build`; install and offline load are Claimed                |
| AC-6.2         | scripted          | `grep -n 'needs:' .github/workflows/deploy.yml`                      |
| Manual set     | manual            | seven phase-5 checks; Claimed                                        |

## 9. Risks and mitigations

| Risk                                                        | Likelihood | Impact | Mitigation                                                       |
| ----------------------------------------------------------- | ---------- | ------ | ---------------------------------------------------------------- |
| Manual offline and recovery checks never run                | High       | High   | Claimed in the walkthrough; required before release.             |
| Scoped-style rule conflicts with the 005 design-system rule | High       | Low    | Recorded as an open question; owner decides before T-014 closes. |
| Reverse spec overstates a guarantee                         | Low        | High   | Every tick cites a file and a check; unmet items stay open.      |
| Hardcoded fallbacks creep back                              | Medium     | Medium | Phase-5 greps repeated in verification.                          |

## 10. Key decisions

- `D-002`: characterization-first delivery.
- `D-006`: rename of the telemetry service remains a roadmap item (RM-04).
- The phase-5 status vocabulary is final; `SEALED` no longer exists.

## 11. Phases

| Phase  | Shippable deliverable                | Requirements covered |
| ------ | ------------------------------------ | -------------------- |
| Tier 0 | Atomic storage and precise telemetry | R1, R2               |
| Tier 1 | Canonical state and store wiring     | R2, R3               |
| Tier 2 | Clock, seal lifecycle, navigation    | R1, R4               |
| Tier 3 | Global stylesheet                    | R5 (partial)         |
| Tier 4 | PWA and release pipeline             | R6                   |

## 12. Revision log

| Version | Date       | Change      | Reason                                         |
| ------- | ---------- | ----------- | ---------------------------------------------- |
| 0.1     | 2026-10-26 | First draft | Reverse plan of the delivered production pass. |
