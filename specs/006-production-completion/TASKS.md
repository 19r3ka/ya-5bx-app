# TASKS: Production completion

**Feature ID:** 006-production-completion · **Spec v:** 0.1 · **Plan v:** 0.1 · **Updated:** 2026-10-26

APPROVED: v0.1 2026-10-26

> The owner approved the four open 006 items on 2026-10-26 as part of the 007 go. The twelve delivered items remain historical. Browser-only checks stay Claimed.

## How to read this file

1. A `[x]` task cites the file and the check that proved it.
2. A `[~]` task is partly met; the note names exactly what is missing.
3. A `[ ]` task is not implemented.
4. Browser-only checks are listed in `WALKTHROUGH.md` as Claimed, never as Yes.

## Conventions

- Evidence format: `Evidence: <path> · <test or command>`.
- The phase-5 tier IDs (`T0-1` to `T4-2`) are kept in the titles for traceability.
- `npm run build`, `npm run lint` and `npx vitest run` must pass before any claim.

## Milestone 1: Tier 0, data integrity (R1, R2)

- [x] T-001 (T0-1) Clear the recovery markers on transaction commit
      Refs: R1, AC-1.1, AC-1.2
      Depends: none
      Files: `src/core/storage/IndexedDBAdapter.ts`
      Do: Remove the marker deletion from the request callback; delete it only in the transaction-complete handler and reject on error or abort.
      Done when: a successful write clears the marker after commit; an abort keeps it.
      Out of scope: the schema.
      Notes: Evidence: `src/core/storage/IndexedDBAdapter.ts` (tx handlers) · `src/core/storage/IndexedDBAdapter.spec.ts` (commit and abort paths).

- [x] T-002 (T0-2) Exclude pending sessions from progression
      Refs: R2, AC-2.3
      Depends: none
      Files: `src/core/storage/HistoryAggregator.ts`
      Do: Skip `PENDING_TELEMETRY` records before counting contiguous volume.
      Done when: a pending record does not increment the count and does not break the run.
      Out of scope: sealing.
      Notes: Evidence: `src/core/storage/HistoryAggregator.ts:14-24` · `src/core/storage/HistoryAggregator.spec.ts` (pending skip test).

- [x] T-003 (T0-3) Split the sealed status into two values
      Refs: R1, AC-1.3
      Depends: none
      Files: `src/core/StorageTypes.ts`, `src/core/telemetry/TelemetryService.ts`, `src/components/workout/PostWorkoutDialog.vue`
      Do: Replace `SEALED` with `SEALED_USER_CONFIRMED` and `SEALED_CONSERVATIVE` everywhere.
      Done when: no reference to the old value remains and both seal paths produce the right status.
      Out of scope: migration of stored records.
      Notes: Evidence: `src/core/StorageTypes.ts` (TelemetryStatus) · `src/core/telemetry/TelemetryService.spec.ts`, `src/components/workout/PostWorkoutDialog.spec.ts`.

## Milestone 2: Tier 1, canonical state and wiring (R2, R3)

- [~] T-004 (T1-1) Derive the position from the profile only
  Refs: R2, AC-2.1, AC-2.4
  Depends: T-003
  Files: `src/stores/useProgressionStore.ts`
  Do: Remove the literal initialisers so chart and level exist only after derivation from `userStore.profile.currentLevel`.
  Done when: `grep -rn 'currentChart = ref(1)' src/stores` returns 0 and hydration still yields the profile position.
  Out of scope: the profile shape.
  Notes: Partly met. Derivation exists in `initAsync` (`useProgressionStore.ts:27-31`), but the refs are still initialised literally at `:23-24` and the grep still finds one hit. Either the placeholders are accepted as pre-hydration defaults, or they move behind a derived state. Owner decision needed.

- [x] T-005 (T1-2) Persist a complete position on onboarding completion
      Refs: R2, AC-2.2
      Depends: none
      Files: `src/views/OnboardingView.vue`
      Do: Write `currentLevel` and `goalLevel` in the completion payload.
      Done when: a completed profile contains both fields.
      Out of scope: the derived goal chart table.
      Notes: Evidence: `src/views/OnboardingView.vue:119-125` · `src/stores/useUserStore.spec.ts`.

- [x] T-006 (T1-3) Bootstrap the progression store
      Refs: R3, AC-3.1
      Depends: T-004
      Files: `src/App.vue`
      Do: Replace the legacy user loader with `progressionStore.initAsync()` on mount.
      Done when: one bootstrap path hydrates history and position.
      Out of scope: route guards.
      Notes: Evidence: `src/App.vue:13-14` · `src/__smoke__/app.smoke.spec.ts`.

- [x] T-007 (T1-4) Wire every dashboard value
      Refs: R3, AC-3.1
      Depends: T-006
      Files: `src/views/DashboardView.vue`
      Do: Take name, chart, level, progress, session count, streak and remaining sessions from stores; route the start action to setup.
      Done when: no hardcoded display value remains and the skeleton covers hydration.
      Out of scope: the last-session fallback list, which is defensive when chart data is absent.
      Notes: Evidence: `src/views/DashboardView.vue:222` (name), computed chart and level, `:132` (advance text), `:332` (setup route) · `npm run build`.

- [ ] T-008 (T1-5) Build the exercise list from the chart and level
      Refs: R3, AC-3.5
      Depends: T-006
      Files: `src/views/WorkoutSetupView.vue`
      Do: Replace the fixed sets, reps and totals with values from the current chart and level, using the strategy output or the progression store.
      Done when: the setup list changes with the level and matches the chart table.
      Out of scope: the start flow, which is already wired with audio unlock and session initialisation.
      Notes: Not met. `WorkoutSetupView.vue:94` shows "3 Sets · 15 Reps" and `:98` shows "45 Total" as fixed strings; the start flow at `:247-261` is wired. Approved for a future go, not executed in 003.

- [x] T-009 (T1-6) Wire the active screen to the engine
      Refs: R3, AC-3.3
      Depends: T-006
      Files: `src/views/ActiveWorkoutView.vue`
      Do: Read the snapshot for current, previous and next intervals; bind pause and resume; stage the pending session and open the dialog on completion.
      Done when: engine state drives the screen and completion opens the dialog.
      Out of scope: engine rules.
      Notes: Evidence: `src/views/ActiveWorkoutView.vue:252` (pause), `:334-336` (completion stages the session) · `src/__smoke__/app.smoke.spec.ts`.

- [x] T-010 (T1-7) Wire the progress screen to the store
      Refs: R3, AC-3.4
      Depends: T-006
      Files: `src/views/ProgressView.vue`, `src/components/progress/ProgressionMapGrid.vue`
      Do: Derive completed level IDs from sealed history and pass current, goal, completed and hydration values to the map.
      Done when: the map receives store-derived props and ignores pending sessions.
      Out of scope: map styling.
      Notes: Evidence: `src/views/ProgressView.vue:60-63` · `src/components/progress/ProgressionMapGrid.spec.ts` (6 tests).

## Milestone 3: Tier 2, performance and seal lifecycle (R1, R4)

- [ ] T-011 (T2-1) Make the clock self-driven
      Refs: R4, AC-4.1, AC-4.2
      Depends: T-009
      Files: `src/components/workout/WorkoutTimerClock.vue`, `src/views/ActiveWorkoutView.vue`
      Do: Remove the elapsed-seconds prop; accept static start and duration, tick locally, and emit expiry.
      Done when: no per-tick prop is passed and the parent does not re-render each second.
      Out of scope: the engine clock.
      Notes: Not met. The component still declares `elapsedSeconds` (`WorkoutTimerClock.vue:25`) and the view passes it each tick; a local fallback exists but the contract is unchanged. Approved for a future go, not executed in 003.

- [x] T-012 (T2-2) Fix the dialog seal lifecycle
      Refs: R1, AC-1.3
      Depends: T-003
      Files: `src/components/workout/PostWorkoutDialog.vue`, `src/views/ActiveWorkoutView.vue`
      Do: Guard duplicate seals, seal conservatively on unmount or dismissal, keep the record pending on failure, and surface a retry.
      Done when: timeout, dismissal and failure each produce the documented outcome.
      Out of scope: dialog copy.
      Notes: Evidence: `src/components/workout/PostWorkoutDialog.vue:113,132-160` (isSealing, autoSeal, failure emit) · `src/components/workout/PostWorkoutDialog.spec.ts` (7 tests).

- [x] T-013 (T2-3) Use one navigation state
      Refs: R4, AC-4.1
      Depends: none
      Files: `src/components/layout/BottomNav.vue`
      Do: Replace the ref-plus-watch pair with a writable computed over the route.
      Done when: the selected tab and the route cannot diverge.
      Out of scope: adding tabs.
      Notes: Evidence: `src/components/layout/BottomNav.vue:35` (computed with get and set) · `src/__smoke__/app.smoke.spec.ts`.

## Milestone 4: Tier 3, styling (R5)

- [~] T-014 (T3-1) Replace the boilerplate stylesheet and centralise rules
  Refs: R5, AC-5.1, AC-5.2
  Depends: none
  Files: `src/style.css`, component styles
  Do: Replace the framework template CSS with the global app classes and move colour and border rules out of component scopes.
  Done when: the global sheet owns those rules and `grep -rln '<style scoped>' src/components src/views` returns only keyframe-only blocks.
  Out of scope: data-driven inline sizes.
  Notes: Partly met. `src/style.css` is replaced and holds the app classes, but ten components still contain scoped blocks, including `ProgressionMapGrid.vue`, whose border class was introduced by the 005 correction P2-5. The 005 rule (border via class, not inline) and this rule (no scoped styles) conflict; the owner decides which wins before this task closes.

## Milestone 5: Tier 4, delivery (R6)

- [x] T-015 (T4-1) Make the app installable and offline-capable
      Refs: R6, AC-6.1
      Depends: none
      Files: `vite.config.ts`, `index.html`, `public/icons/`
      Do: Register the PWA plugin with a manifest, generate both icons, and set the theme colour.
      Done when: a production build emits a manifest and service worker and the icons exist.
      Out of scope: store submission.
      Notes: Evidence: `vite.config.ts:22-40` · `package.json` (`vite-plugin-pwa`) · `public/icons/icon-192.png`, `icon-512.png` · `index.html:7` · `npm run build`. Install and offline load were not run; see Claimed checks.

- [x] T-016 (T4-2) Split release from deployment
      Refs: R6, AC-6.2
      Depends: none
      Files: `.github/workflows/deploy.yml`
      Do: Run versioning in a release job and deployment in a dependent job that re-checks out and builds.
      Done when: `deploy` needs `release` and no deploy step writes to the source branch.
      Out of scope: changing the versioning tool.
      Notes: Evidence: `.github/workflows/deploy.yml:24` (release), `:41-42` (deploy needs release), `:59` (pages deploy).

## Blocked / questions

- **Owner decision (T-004):** accept the literal initialisers as pre-hydration defaults, or require a fully derived position and remove them.
- **Owner decision (T-014):** the 005 design-system rule and the phase-5 one-stylesheet rule conflict; choose the authority.
- **Execution:** T-008, T-011 and the closures above need a new `APPROVED:` line.
- **Manual checks:** seven phase-5 checks are unrun; repeated in the walkthrough.

## Phase reviews

- Tier 0 and Tier 1 (except T1-5): recorded 2026-10-26 from the audit.
- Tier 2 and Tier 3: recorded with the two partial and open items above.
- No reviewer has cleared the open items.

## Coverage matrix

| Requirement | Criteria               | Tasks                             |
| ----------- | ---------------------- | --------------------------------- |
| R1          | AC-1.1, AC-1.2, AC-1.3 | T-001, T-003, T-012               |
| R2          | AC-2.1 to AC-2.4       | T-002, T-004, T-005               |
| R3          | AC-3.1 to AC-3.5       | T-006, T-007, T-008, T-009, T-010 |
| R4          | AC-4.1, AC-4.2         | T-011, T-013                      |
| R5          | AC-5.1, AC-5.2         | T-014                             |
| R6          | AC-6.1, AC-6.2         | T-015, T-016                      |
