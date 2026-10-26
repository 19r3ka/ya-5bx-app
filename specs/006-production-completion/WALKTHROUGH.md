# WALKTHROUGH: Production completion

**Feature:** 006-production-completion · **Tasks:** T-001 to T-016 · **Agent / model:** implementing agent (reverse spec session) · **Date:** 2026-10-26
**Status:** Complete with open items (two unmet, two partial)
**Verification:** Tests 228/228 · Typecheck ok (`npm run build`) · Lint ok · Build ok

> Recorded from the 2026-10-26 audit of `main` at `8a21f60`. Browser-only checks were not run and are marked Claimed.

## 1. Task results

| Task  | Tier item | Result       | Evidence                                                                  |
| ----- | --------- | ------------ | ------------------------------------------------------------------------- |
| T-001 | T0-1      | Done         | Adapter transaction handlers; adapter spec                                |
| T-002 | T0-2      | Done         | `HistoryAggregator.ts:14-24`; spec                                        |
| T-003 | T0-3      | Done         | `StorageTypes.ts`; telemetry and dialog specs                             |
| T-004 | T1-1      | **Partial**  | Derivation at `useProgressionStore.ts:27-31`; literals remain at `:23-24` |
| T-005 | T1-2      | Done         | `OnboardingView.vue:119-125`                                              |
| T-006 | T1-3      | Done         | `App.vue:13-14`                                                           |
| T-007 | T1-4      | Done         | Dashboard computed values; setup route                                    |
| T-008 | T1-5      | **Not met**  | `WorkoutSetupView.vue:94,98` fixed reps and total                         |
| T-009 | T1-6      | Done         | Engine bindings; completion stages the session                            |
| T-010 | T1-7      | Done         | `ProgressView.vue:60-63`; grid spec                                       |
| T-011 | T2-1      | **Not met**  | `WorkoutTimerClock.vue:25` still accepts the elapsed prop                 |
| T-012 | T2-2      | Done         | `PostWorkoutDialog.vue:113-160`; spec                                     |
| T-013 | T2-3      | Done         | `BottomNav.vue:35` writable computed                                      |
| T-014 | T3-1      | **Partial**  | Global sheet replaced; 10 components keep scoped blocks                   |
| T-015 | T4-1      | Done (build) | PWA plugin, manifest, icons, theme colour                                 |
| T-016 | T4-2      | Done         | Release and deploy jobs with `needs`                                      |

## 2. What changed

| File                                                     | Change                | Summary                            |
| -------------------------------------------------------- | --------------------- | ---------------------------------- |
| `specs/006-production-completion/SPEC.md`                | Created (owner-saved) | Requirements and criteria.         |
| `specs/006-production-completion/PLAN.md`                | Created               | Reverse plan and check map.        |
| `specs/006-production-completion/TASKS.md`               | Created               | 16 production items with evidence. |
| `specs/006-production-completion/WALKTHROUGH.md`         | Created               | This record.                       |
| `specs/006-production-completion/design/phase5-specs.md` | Moved                 | Original production plan.          |

## 3. Acceptance criteria status

| Criterion                                                                     | Met?    | Evidence                                                                    |
| ----------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------- |
| AC-1.1                                                                        | Yes     | Markers cleared in the transaction-complete handler.                        |
| AC-1.2                                                                        | Yes     | Abort path rejects and keeps the marker.                                    |
| AC-1.3                                                                        | Yes     | Timeout, dismissal and failure paths in the dialog spec.                    |
| AC-2.1                                                                        | Yes     | Chart and level derived from the stored position.                           |
| AC-2.2                                                                        | Yes     | Completion writes current and goal level.                                   |
| AC-2.3                                                                        | Yes     | Pending sessions skipped by the aggregator.                                 |
| AC-2.4                                                                        | Yes     | Default position used when the profile has none.                            |
| AC-3.1                                                                        | Yes     | Dashboard values are computed from stores.                                  |
| AC-3.2                                                                        | Yes     | Start passes chart, level and aerobic choice to the engine.                 |
| AC-3.3                                                                        | Yes     | Pause, resume and completion follow the snapshot.                           |
| AC-3.4                                                                        | Yes     | Map receives current, goal and completed IDs.                               |
| AC-3.5                                                                        | **No**  | Setup list is fixed at 3 sets of 15 and 45 total.                           |
| AC-4.1                                                                        | **No**  | The clock still takes an elapsed prop.                                      |
| AC-4.2                                                                        | **No**  | The view passes a changing prop each tick.                                  |
| AC-5.1                                                                        | Yes     | `src/style.css` is the app sheet, not framework boilerplate.                |
| AC-5.2                                                                        | **No**  | Ten components still use scoped style blocks.                               |
| AC-6.1                                                                        | Claimed | Manifest, icons and service worker build; install and offline load not run. |
| AC-6.2                                                                        | Yes     | Deploy depends on release; no deploy write-back step.                       |
| Manual: fresh install redirects to onboarding                                 | Claimed | Not run in a browser.                                                       |
| Manual: onboarding at age 43 shows Chart 3 and level D-                       | Claimed | Not run.                                                                    |
| Manual: stiff feedback produces user-confirmed and flagged record             | Claimed | Not inspected in IndexedDB.                                                 |
| Manual: 60 s timeout produces conservative seal                               | Claimed | Not run.                                                                    |
| Manual: kill tab before the dialog, reopen shows recovery without duplication | Claimed | Not run.                                                                    |
| Manual: pending record does not affect the count                              | Claimed | Logic tested; browser not run.                                              |
| Manual: install PWA and work offline                                          | Claimed | Not run.                                                                    |

## 4. Key decisions

- The phase-5 vocabulary is final; the ambiguous status is gone.
- Unmet items stay open; they are not reclassified as delivered.
- The T3-1 scoped-style clause conflicts with the 005 design-system correction; the owner decides which rule wins.

## 5. Assumptions made

- Unit and component tests plus the build are sufficient proof for the delivered items.
- The audit inspected the code at `8a21f60`; later local edits would need a recheck.

## 6. Deviations

- The earlier summary of this phase counted 13 of 16 items as delivered. This record counts 12 delivered, two partial and two unmet, because T3-1 fails its own grep check and T1-1 keeps the literal initialisers its check forbids.
- T3-1's scoped-style requirement arrived before the 005 correction that introduced a local border class; the two rules conflict.
- Seven browser-level checks were never executed.

## 7. Known gaps and follow-ups

- T-008 exercise list, T-011 clock contract, T-004 initialisers, T-014 scoped styles.
- Manual checks above; they are release blockers.
- Telemetry service rename: roadmap RM-04.

## 8. How to verify

```sh
npm run build && npm run lint && npx vitest run
grep -rn 'currentChart = ref(1)' src/stores
grep -rln '<style scoped>' src/components src/views
grep -n 'needs:' .github/workflows/deploy.yml
```

## 9. Review packet

- This walkthrough, `SPEC.md` §5 to §6, the 16 task entries, and `git diff main...HEAD -- specs/006-production-completion`.
