# PLAN: YA-5BX Baseline

**Feature ID:** 001-baseline · **Spec version:** 2.2 · **Status:** Delivered · **Updated:** 2026-10-17

> HOW. Must satisfy every Must requirement in `SPEC.md` and pass the constitution check. Reuse before building. If the spec is ambiguous, raise a spec bug; do not guess in the plan.

## 1. Approach summary

Keep the existing client-only Vue 3 and Vuetify app and bring it into line with SPEC v2.2. Remove dead code first, verified by knip (D-001), so the plan describes live code only. Add a characterization suite that locks current behavior, including known gaps (D-002, D-003), before any behavior changes. Then close the Must gaps, add the timing safety behaviors required by constitution §5, and phase the target features. No backend, state library, or storage technology is introduced.

**Execution order:** Phase 0 → Phase 3 (characterization) → Phase 1 → Phase 2 → Phase 4 → Phase 5. Characterization must precede Phases 1 and 2, because those phases change behavior that the suite locks.

## 2. Constitution check

| Principle / constraint                                          | How this plan satisfies it                                                                                                                                                        | Status                                        |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| §1 Data sovereignty, no telemetry                               | No outbound calls found in `src/` (confirm with a full grep in Phase 3). The name `TelemetryService` conflicts with "no telemetry" wording.                                       | Violation (name only; D-006, RM-04)           |
| §1 Transactional storage                                        | Sessions use IndexedDB. Profile and draft use localStorage, which is not transactional.                                                                                           | Violation (D-004)                             |
| §1 Export and restore in open formats                           | Not implemented.                                                                                                                                                                  | Violation (Phase 4, RM-05, RM-10)             |
| §1 No silent data loss on storage failure                       | `persistDraft()` has no try/catch. Locked as a gap by TASKS T-020.                                                                                                                | Violation (Phase 1, RM-08)                    |
| §2 Versioned contracts and migrations                           | No schema version found on any stored key.                                                                                                                                        | Violation (D-004)                             |
| §2 Runtime validation at boundaries                             | Malformed profile JSON is caught on hydrate. No import validation.                                                                                                                | Partial (Phase 4, RM-10)                      |
| §3 Offline-first                                                | Precache configured in `vite.config.ts`. Offline launch not yet verified.                                                                                                         | Unverified (M-1)                              |
| §4 Bilingual parity, no hardcoded strings                       | Literal strings in `Step1Hook.vue`, `Step6Ready.vue`, `AppHelpDialog.vue`. No missing-key check.                                                                                  | Violation (Phase 1)                           |
| §5 Clock-derived timing                                         | `TimerEngine.ts` derives elapsed time from `performance.now()`. The legacy `useTimer.ts` increments per `setInterval` tick and is reachable from the live workout screen (§11.2). | OK in `TimerEngine`; violation in legacy path |
| §5 Auto-pause on background                                     | No `visibilitychange` handling in `src/`.                                                                                                                                         | Violation (Phase 2, RM-02, D-005)             |
| §5 Wake lock                                                    | Not implemented.                                                                                                                                                                  | Violation (Phase 2, RM-03, D-005)             |
| §6 Accessibility                                                | Not verified. Four `aria-label` occurrences in `src/`.                                                                                                                            | Unverified (M-2; Phase 1)                     |
| Quality gate 1: static checks                                   | Build and lint exist. Knip added by TASKS T-001 (D-001). Test script added by T-007 (D-002).                                                                                      | Partial until Phase 0 and 3 complete          |
| Quality gates 2, 3, 4, 7: tests, contracts, offline, regression | No test suite existed. Characterization suite added in Phase 3. Contract validation for RCAF datasets not yet defined.                                                            | Partial (Phase 3; contracts Phase 4)          |
| Quality gate 5: localization completeness                       | No automated missing-key check.                                                                                                                                                   | Violation (Phase 1)                           |

## 3. Reuse audit

| Asset (library, component, existing code)                | Covers                                  | Gap                                                    |
| -------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------ |
| Vue 3, Vuetify, `@mdi/font`                              | UI, icons                               | None                                                   |
| Pinia (`useUserStore`, `useProgressionStore`)            | State                                   | None. Dead consumers removed in Phase 0                |
| Vue Router (`src/router/index.ts`)                       | Six routes                              | No wildcard route (RM-07)                              |
| vue-i18n (`src/plugins/i18n.ts`)                         | fr-FR default, en-US fallback           | Hardcoded strings bypass it (R8)                       |
| vite-plugin-pwa (`vite.config.ts`)                       | Installable PWA, precache, `autoUpdate` | Offline behavior unverified (M-1)                      |
| `performance.now()` in `TimerEngine.ts`                  | Monotonic timing                        | No visibility handling (RM-02)                         |
| `ProgressionValidator.ts`                                | Eligibility, reason codes               | No celebration (RM-06)                                 |
| `IndexedDBAdapter.ts`                                    | Sessions store                          | No import or export (RM-10); no schema version (D-004) |
| `TelemetryService.ts`                                    | Local feedback staging                  | Name (RM-04, D-006)                                    |
| knip (new)                                               | Dead-code detection                     | Installed by TASKS T-001 (D-001)                       |
| vitest, @vue/test-utils, happy-dom, fake-indexeddb (new) | Characterization tests                  | Installed by TASKS T-007 (D-002)                       |
| Screen Wake Lock API (browser)                           | Keep screen awake during workouts       | Not used (RM-03)                                       |

New dependencies require a DECISIONS.md entry. Both are recorded: D-001 (knip) and D-002 (test tooling).

## 4. Architecture

```text
 router/ + views/ + components/          Vue, Vuetify, vue-router, vue-i18n
        |
 stores/useUserStore.ts                  Pinia: profile, onboarding draft
 stores/useProgressionStore.ts           Pinia: progression state
 composables/useWorkoutEngine.ts         workout lifecycle
        |
 core/WorkoutOrchestrator.ts             sessions, checkpoints
 core/ClassicRCAFStrategy.ts             interval generation
 core/TimerEngine.ts                     performance.now() clock
 core/ProgressionValidator.ts            eligibility, reason codes
 core/telemetry/TelemetryService.ts      post-workout feedback staging
        |
 core/storage/IndexedDBAdapter.ts        sessions (IndexedDB)
 localStorage (keys in the constants module; path to confirm)
```

Components:

- **Router**: route table, no wildcard yet. `src/router/index.ts`
- **User store**: profile and onboarding draft. `src/stores/useUserStore.ts`
- **Progression store**: progression state, used by `DashboardView`. `src/stores/useProgressionStore.ts`
- **Workout composable**: drives the timer and orchestrator. `src/composables/useWorkoutEngine.ts`
- **Orchestrator**: builds the session and writes the checkpoint. `src/core/WorkoutOrchestrator.ts`
- **Strategy**: classic 5BX intervals. `src/core/ClassicRCAFStrategy.ts`
- **Timer**: clock-derived elapsed time, pause and resume. `src/core/TimerEngine.ts`
- **Legacy timer**: `setInterval`-based, reachable from the live workout via `ActiveWorkoutView.vue` → `WorkoutTimer.vue`. `src/composables/useTimer.ts`
- **Progression validator**: eligibility. `src/core/ProgressionValidator.ts`
- **Telemetry**: local feedback staging. `src/core/telemetry/TelemetryService.ts`
- **Storage**: IndexedDB sessions. `src/core/storage/IndexedDBAdapter.ts`
- **Post-workout dialog**: live version. `src/components/workout/PostWorkoutDialog.vue`

### 4.1 Runtime flows

- **Onboarding:** six steps in `src/views/OnboardingView.vue`. Each setter in `useUserStore` calls `persistDraft()`, which writes `STORAGE_KEY_ONBOARDING_DRAFT`. Completion writes the profile to `LOCALSTORAGE_USER_KEY` and removes the draft.
- **Workout:** setup chooses chart, level, and aerobic option. `WorkoutOrchestrator` uses `ClassicRCAFStrategy` to build four repetition blocks and one aerobic block. `useWorkoutEngine` drives `TimerEngine`. The orchestrator writes `workout_checkpoint_<sessionToken>` to localStorage. The active workout screen also mounts `WorkoutTimer.vue`, which uses the legacy `useTimer`. Which timer sets the stored duration is an open finding (§11.2).
- **Completion:** `src/components/workout/PostWorkoutDialog.vue` calls `TelemetryService.sealSessionTelemetryAsync` with the stiffness flag. The session is written to the IndexedDB `sessions` store. The adapter then removes the checkpoint key.
- **Progression:** `ProgressionValidator` receives verified completed sessions at the current level and `userFlaggedStiffOrSore`. It returns `USER_TELEMETRY_RESTRICTION` or `VOLUME_QUOTA_INCOMPLETE`.
- **Backup export:** not designed (RM-05).

### 4.2 Localization

- **Setup:** `src/plugins/i18n.ts` uses `locale: 'fr-FR'` and `fallbackLocale: 'en-US'` (AC-8.1, verified).
- **Catalogs:** `src/locales/fr.json` and `src/locales/en.json`.
- **Gaps:** literal strings in `Step1Hook.vue`, `Step6Ready.vue`, and `AppHelpDialog.vue` (R8).
- **Key checks:** none automated. Constitution §4 requires one.

### 4.3 Offline and PWA

- **Registration:** `registerType: 'autoUpdate'` in `vite.config.ts`.
- **Precache:** `globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}']`.
- **Runtime caching:** none configured.
- **Manifest:** `display: standalone`. Production `base` and `start_url` are `/ya-5bx-app/`. Icons `/icons/icon-192.png` and `/icons/icon-512.png` are referenced; the files are unverified.
- **Offline behavior:** unverified (AC-9.1, M-1). Depends on a first online visit to populate the cache.

## 5. Data model

| Entity           | Storage              | Key                                     | Fields                                                                                | Validation                        | Migration                                   |
| ---------------- | -------------------- | --------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------- |
| Profile          | localStorage         | `ya-5bx_user` (`LOCALSTORAGE_USER_KEY`) | `preferredAerobic` and others (unverified)                                            | Malformed JSON ignored on hydrate | Schema version absent (D-004)               |
| Onboarding draft | localStorage         | `STORAGE_KEY_ONBOARDING_DRAFT`          | `step`, `currentStep`, `age`, `aerobic`                                               | None                              | Same as profile                             |
| Session record   | IndexedDB `sessions` | keyPath `sessionToken`                  | `chartNumber`, `levelString`, `completedAt` (indexes `byLevel`, `byDate`: unverified) | Unverified                        | Schema version absent (D-004)               |
| Checkpoint       | localStorage         | `workout_checkpoint_<sessionToken>`     | Unverified                                                                            | Unverified                        | Absent (D-004)                              |
| WAL              | localStorage         | `ya_5bx_wal`                            | No writer in `src/`                                                                   | None                              | Orphaned removal line deleted (TASKS T-004) |

Notes:

- Every stored shape needs a version field and a tested upgrade path before Phase 4 (D-004).
- Existing profiles on user devices must survive the change.
- If older builds may have written `ya_5bx_wal`, a one-time cleanup in a migration is acceptable.

## 6. Interfaces and contracts

### 6.1 Stores and services

- **`useUserStore.persistDraft()`:** writes the draft to `STORAGE_KEY_ONBOARDING_DRAFT`. No error handling (RM-08). Target: a typed error handled by the caller.
- **`useUserStore.setPreferredAerobic(aerobic: string)`:** updates the profile and writes `LOCALSTORAGE_USER_KEY`. No error handling.
- **`TelemetryService.sealSessionTelemetryAsync(isStiffOrSore, ...)`:** stages feedback locally. Remaining parameters unverified.
- **`IndexedDBAdapter`:** `openAsync()`, store `sessions` (keyPath `sessionToken`), and a save method on commit. Method name unverified.

### 6.2 Routes

`/`, `/onboarding`, `/workout-setup`, `/workout`, `/progress`, `/settings`. Target: wildcard redirect to `/` (RM-07).

### 6.3 Strategy

`ClassicRCAFStrategy` throws on invalid input. Target: typed error and user-visible banner (RM-09). The fallback policy requires D-008 first.

### 6.4 Timing contract (constitution §5)

- **Clock:** `performance.now()` in `TimerEngine.ts`. Elapsed time = now minus the start anchor, adjusted for pauses (AC-4.1, AC-4.2).
- **Pause and resume:** paused time is excluded. Exact arithmetic is locked by TASKS T-016.
- **Gates:** the timer holds at a gated boundary until repetition confirmation. Locked by TASKS T-016 and T-017; the code location is to be confirmed.
- **Background behavior:** none. Target: pause on `visibilitychange` (RM-02, D-005).
- **Wake lock:** none. Target: keep the screen awake during active workouts where supported, with a no-op otherwise (RM-03, D-005).
- **Legacy timer:** `useTimer.ts` increments `elapsedSeconds` per `setInterval` tick. This violates AC-4.1 if it drives any stored or displayed duration. Locked by TASKS T-023; the owner decides its fate in Phase 2 planning.

### 6.5 Progression contract

- **Inputs:** verified completed sessions at the current level; `userFlaggedStiffOrSore`; RCAF Tables v1.0.
- **Outputs:** eligibility and a reason code.
- **Reason codes:** `USER_TELEMETRY_RESTRICTION`, `VOLUME_QUOTA_INCOMPLETE`.
- **Self-reported inputs:** session completion and the stiffness flag. The app verifies neither.
- **Dataset:** location and version field of RCAF Tables v1.0 are unverified. Required by constitution §2.

## 7. File changes

| Path                                                                                                         | New / Modified / Deleted | Purpose                                                                                                          |
| ------------------------------------------------------------------------------------------------------------ | ------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `src/components/PostWorkoutDialog.vue` (root-level only; NOT `src/components/workout/PostWorkoutDialog.vue`) | Deleted                  | Dead. Only importer is `WorkoutCard.vue`, rendered only by `HomePage.vue`, which is not routed. (TASKS T-003)    |
| `src/views/HomePage.vue`                                                                                     | Deleted                  | Dead, not routed (T-003)                                                                                         |
| `src/components/WorkoutCard.vue`                                                                             | Deleted                  | Dead, used only by `HomePage.vue` (T-003)                                                                        |
| `src/components/LevelOverview.vue`                                                                           | Deleted                  | Dead, no importers (T-003)                                                                                       |
| `src/components/WelcomeCard.vue`                                                                             | Deleted                  | Dead, no importers (T-003)                                                                                       |
| `src/views/OnboardingPage.vue`                                                                               | Deleted                  | Dead; `OnboardingView.vue` is routed (T-003)                                                                     |
| `src/composables/useUser.ts`                                                                                 | Deleted                  | Dead; importers all dead; duplicate state (T-003)                                                                |
| `src/core/storage/IndexedDBAdapter.ts`                                                                       | Modified                 | Remove the `ya_5bx_wal` removal line (T-004)                                                                     |
| `package.json`                                                                                               | Modified                 | Add `knip` and `test` scripts; add test devDependencies; remove `chalk` if reported unused (T-001, T-005, T-007) |
| `package-lock.json`                                                                                          | Modified                 | Follows `package.json` changes                                                                                   |
| `knip.json`                                                                                                  | New                      | Entry points for knip (T-001)                                                                                    |
| `vitest.config.ts`                                                                                           | New                      | Test runner configuration (T-007)                                                                                |
| `tsconfig.app.json`                                                                                          | Modified                 | Exclude `src/**/*.spec.ts` from the application type-check (T-007)                                               |
| `specs/001-baseline/WALKTHROUGH.md`                                                                          | Modified                 | Knip audit, task logs, sanity results (T-002 onward)                                                             |
| `src/**/*.spec.ts`                                                                                           | New                      | Characterization tests (TASKS Phase 3c)                                                                          |
| `src/__smoke__/app.smoke.spec.ts`                                                                            | New                      | Smoke test of main flows, no browser (TASKS T-032)                                                               |
| `src/router/index.ts`                                                                                        | Modified (Phase 1)       | Wildcard route (RM-07)                                                                                           |
| `src/stores/useUserStore.ts`                                                                                 | Modified (Phase 1)       | Guard draft writes (RM-08)                                                                                       |
| `src/core/ClassicRCAFStrategy.ts`                                                                            | Modified (Phase 1)       | Typed error and fallback (RM-09)                                                                                 |
| `src/core/TimerEngine.ts`                                                                                    | Modified (Phase 2)       | Visibility pause (RM-02)                                                                                         |
| `src/composables/useWakeLock.ts`                                                                             | New (Phase 2)            | Wake lock lifecycle (RM-03)                                                                                      |
| `src/components/onboarding/Step1Hook.vue`, `Step6Ready.vue`, `src/components/common/AppHelpDialog.vue`       | Modified (Phase 1)       | Move literal strings to i18n (R8)                                                                                |
| `src/locales/en.json`, `src/locales/fr.json`                                                                 | Modified (Phase 1, 4, 5) | New keys for the changes above                                                                                   |

## 8. Test strategy

Characterization tests are defined in TASKS.md. Each row below names its task and the phase that flips a gap test. There is no browser end-to-end runner (D-002).

| Criterion | Test type                           | Location                                                                                                          | Status and phase                                                 |
| --------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| AC-1.1    | unit (component)                    | `src/router/index.spec.ts` (TASKS T-031)                                                                          | Locked                                                           |
| AC-1.2    | unit (component)                    | `src/router/index.spec.ts` (T-031)                                                                                | Gap locked; flipped in Phase 1 (RM-07)                           |
| AC-2.1    | unit                                | `src/stores/useUserStore.spec.ts` (T-020)                                                                         | Locked                                                           |
| AC-2.2    | unit                                | `src/stores/useUserStore.spec.ts` (T-020)                                                                         | Locked                                                           |
| AC-2.3    | unit                                | `src/stores/useUserStore.spec.ts` (T-020)                                                                         | Gap locked; flipped in Phase 1 (RM-08)                           |
| AC-3.1    | unit                                | `src/core/ClassicRCAFStrategy.spec.ts` (T-014)                                                                    | Locked                                                           |
| AC-3.2    | unit                                | `src/core/McMasterHIITStrategy.spec.ts` (T-015)                                                                   | Locked (off workout path); selection in Phase 5 (RM-01)          |
| AC-3.3    | unit                                | `src/core/ClassicRCAFStrategy.spec.ts` (T-014)                                                                    | Gap locked; flipped in Phase 1 (RM-09, D-008)                    |
| AC-4.1    | unit with fake clock                | `src/core/TimerEngine.spec.ts` (T-016); legacy in `src/composables/useTimer.spec.ts` (T-023)                      | Locked for `TimerEngine`; legacy gap locked; decision in Phase 2 |
| AC-4.2    | unit                                | `src/core/TimerEngine.spec.ts` (T-016)                                                                            | Locked                                                           |
| AC-4.3    | unit                                | `src/core/TimerEngine.spec.ts` (T-016), `src/core/WorkoutOrchestrator.spec.ts` (T-017)                            | Locked; code location to confirm                                 |
| AC-4.4    | unit and manual                     | `src/core/TimerEngine.spec.ts` (T-016); manual M-3                                                                | Gap locked; flipped in Phase 2 (RM-02)                           |
| AC-5.1    | unit                                | `src/core/storage/IndexedDBAdapter.spec.ts` (T-018)                                                               | Locked                                                           |
| AC-5.2    | unit                                | `src/core/telemetry/TelemetryService.spec.ts` (T-019), `src/components/workout/PostWorkoutDialog.spec.ts` (T-026) | Locked                                                           |
| AC-5.3    | unit                                | `src/core/storage/IndexedDBAdapter.spec.ts`                                                                       | Target; test added with RM-10 in Phase 4                         |
| AC-6.1    | unit                                | `src/core/storage/HistoryAggregator.spec.ts` (T-012), `src/stores/useProgressionStore.spec.ts` (T-021)            | Locked                                                           |
| AC-6.2    | component                           | Target; test added with RM-06 in Phase 5                                                                          | Not implemented                                                  |
| AC-6.3    | unit                                | `src/core/ProgressionValidator.spec.ts` (T-013)                                                                   | Locked                                                           |
| AC-7.1    | component                           | Target; test added with RM-05 in Phase 4                                                                          | Blocked by Q1                                                    |
| AC-7.2    | unit                                | Target; test added with RM-05 in Phase 4                                                                          | Not implemented                                                  |
| AC-8.1    | unit                                | `src/plugins/i18n.spec.ts` (T-030)                                                                                | Locked; completeness in Phase 1                                  |
| AC-9.1    | manual                              | M-1                                                                                                               | Manual                                                           |
| AC-10.1   | manual and axe-core                 | M-2                                                                                                               | Manual; fixes in Phase 1                                         |
| AC-10.2   | component and manual                | Component tests added in Phase 1; M-2                                                                             | Manual until Phase 1                                             |
| AC-11.1   | e2e substitute: component and smoke | Target; test added with RM-11 in Phase 5                                                                          | Blocked by Q3                                                    |

### 8.1 Manual checks

- **M-1 (AC-9.1):** run `npm run build && npm run preview`. Open the app, let it load fully, switch the browser to offline, reload, and walk through setup, one workout, and progress. Pass: no network error; workout completes.
- **M-2 (AC-10.1, AC-10.2):** run axe-core on each routed view. Tab through each interactive control and confirm a visible focus outline. Confirm each status indicator has text or an icon in addition to color.
- **M-3 (AC-4.4, after RM-02):** start a workout, switch tabs for 10 seconds, and return. Pass: the session is paused and the hidden time is not counted.

### 8.2 Open verification items

- Exact installed versions: read `package-lock.json`.
- Knip results: TASKS T-002 and T-003.
- `sessions` indexes `byLevel` and `byDate`: read `IndexedDBAdapter.ts`.
- Schema version fields: grep `version` in storage and progression code.
- Icons exist: list `public/icons/`.
- Accessibility: axe-core scan and keyboard pass (M-2).
- Outbound network calls: grep `fetch(`, `XMLHttpRequest`, `sendBeacon` in `src/`.
- RCAF dataset location and version: locate Tables v1.0 in `src/`.
- Core has no Vue imports: grep `from 'vue'` in `src/core/`.
- Reachability of `WorkoutRepOverridePanel`, `WorkoutTimerClock`, `ProgressionMapGrid`: confirmed per task.

## 9. Risks and mitigations

| Risk                                                                                   | Likelihood | Impact | Mitigation                                                                                                    |
| -------------------------------------------------------------------------------------- | ---------- | ------ | ------------------------------------------------------------------------------------------------------------- |
| Deleting a file that is live through a path knip misses (dynamic import, template use) | Medium     | High   | Knip report and clean build required (T-002, T-006); owner confirmed intent (G-2)                             |
| Characterization locks a wrong behavior as correct                                     | Medium     | High   | Gaps marked as known and flipped deliberately (D-003); sanity mutations prove tests can fail (T-033 to T-037) |
| Two timers drive one workout, giving inconsistent durations                            | Medium     | High   | Trace in T-008; decision in Phase 2 planning (§11.2)                                                          |
| Visibility pause changes timing behavior users rely on                                 | Medium     | Medium | M-3 test; policy recorded in D-005                                                                            |
| Storage writes fail silently, losing the draft                                         | Medium     | Medium | RM-08 with a user-visible error (Phase 1)                                                                     |
| Schema change breaks existing profiles                                                 | Medium     | High   | Versioned schema and tested migration before Phase 4 (D-004)                                                  |
| Progression is gamed by self-reported sessions                                         | High       | Medium | Accepted product constraint, documented in SPEC §10; decision recorded in D-010                               |
| Missing medical screening causes injury                                                | Medium     | High   | RM-11, pending Q3 (D-009); interim disclaimer decided by owner                                                |
| Wake lock unsupported on some browsers                                                 | High       | Low    | Feature-detect and no-op; policy in D-005                                                                     |
| Orphaned `ya_5bx_wal` data on user devices                                             | Low        | Low    | One-time cleanup in a migration if needed                                                                     |

## 10. Key decisions

| ID    | Title                                                                           | Status                     | Needed before |
| ----- | ------------------------------------------------------------------------------- | -------------------------- | ------------- |
| D-001 | Dead-code detection with knip                                                   | Accepted                   | Phase 0       |
| D-002 | Test tooling for characterization tests                                         | Accepted                   | Phase 3       |
| D-003 | Known gaps locked by characterization tests                                     | Accepted                   | Phase 3       |
| D-004 | Storage schema versioning and migration (localStorage and IndexedDB)            | To write                   | Phase 4       |
| D-005 | Background pause and wake lock policy for `TimerEngine`                         | To write                   | Phase 2       |
| D-006 | Telemetry naming and scope (rename `TelemetryService`)                          | To write                   | Phase 5       |
| D-007 | Default strategy and selection rules (McMaster vs classic)                      | To write                   | Phase 5       |
| D-008 | Invalid-input fallback policy for strategy generation                           | To write                   | Phase 1       |
| D-009 | Health screening gate: design and storage                                       | To write                   | Phase 5       |
| D-010 | Progression evidence model: self-report accepted, or stronger evidence required | To write (owner to decide) | Phase 5       |

Each entry is written to DECISIONS.md before the phase that depends on it.

## 11. Phases

| Phase                         | Shippable deliverable                                                                                                                                                                                                           | Requirements covered                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 0. Dead code                  | Knip report saved; accepted dead files deleted; `ya_5bx_wal` removal line deleted; `chalk` removed if reported unused; build and lint clean (TASKS T-000 to T-006)                                                              | Hygiene; supports R1, R6                                                                              |
| 3. Characterization and gates | Test tooling installed (T-007); characterization suite green against unmodified source (T-009 to T-032); sanity mutations prove load-bearing tests (T-033 to T-037); RM-12 satisfied                                            | Quality gates 2, 7; locks AC-1.1, 1.2, 2.1, 2.2, 2.3, 3.1 to 3.3, 4.1 to 4.4, 5.1, 5.2, 6.1, 6.3, 8.1 |
| 1. Must gaps                  | Wildcard route (RM-07); guarded storage writes (RM-08); strategy fallback and error banner (RM-09, after D-008); hardcoded strings moved to i18n; accessibility fixes; missing-key check; gap tests flipped in the same commits | AC-1.2, AC-2.3, AC-3.3, R8, R10, Quality gate 5                                                       |
| 2. Timing safety              | Visibility auto-pause (RM-02); wake lock (RM-03); legacy timer authority decided and resolved; AC-4.4 gap test flipped; M-3 passes                                                                                              | R4, R4b, AC-4.4, constitution §5                                                                      |
| 4. Data safety                | Schema versioning (D-004); JSON and `.tcx` export and import with validation (RM-05, RM-10); backup prompt (blocked by Q1)                                                                                                      | R7, AC-5.3, AC-7.1, AC-7.2, constitution §1 and §2                                                    |
| 5. Target features            | McMaster selection (RM-01, D-007); TelemetryService rename (RM-04, D-006); celebration (RM-06, blocked by Q2); health gate (RM-11, blocked by Q3, D-009)                                                                        | R3, R6, R11, AC-3.2, AC-6.2, AC-11.1                                                                  |

Phase 0 is required before any other phase. Phase 3 is required before Phases 1 and 2. Phases 1 to 3 are required before Phase 4. Phase 5 is blocked by open questions and does not block the baseline.

### 11.1 Deferred items (ROADMAP.md)

| ID    | Design gap                                                                                      | Blocked by                   |
| ----- | ----------------------------------------------------------------------------------------------- | ---------------------------- |
| RM-01 | Strategy selection UI and default. `McMasterHIITStrategy.ts` exists but is off the workout path | D-007                        |
| RM-02 | Visibility listener and pause policy in `TimerEngine.ts`                                        | D-005                        |
| RM-03 | Wake lock lifecycle with no-op where unsupported                                                | D-005                        |
| RM-04 | Rename `TelemetryService` across `src/core/telemetry/` and call sites                           | D-006                        |
| RM-05 | JSON and `.tcx` encoders, backup prompt                                                         | Q1                           |
| RM-06 | Celebration component, trigger, reduced-motion behavior                                         | Q2                           |
| RM-07 | Wildcard route in `src/router/index.ts`                                                         | None                         |
| RM-08 | Try/catch and quota handling in `persistDraft` and other localStorage writes                    | None                         |
| RM-09 | Fallback policy and error UI in `ClassicRCAFStrategy.ts`                                        | D-008                        |
| RM-10 | Import schema validation and rejection path                                                     | D-004                        |
| RM-11 | Screening screen and acknowledgment gate                                                        | Q3, D-009                    |
| RM-12 | Test suite                                                                                      | Satisfied by Phase 3 (D-002) |

### 11.2 Open findings

1. **Timer authority.** `ActiveWorkoutView.vue` mounts `WorkoutTimer.vue`, which uses the legacy `useTimer`. `useWorkoutEngine` drives `TimerEngine`. Which value becomes the stored session duration is to be traced by TASKS T-008. Owner decides in Phase 2 planning.
2. **Knip output.** Files that become orphaned after the Phase 0 deletions are logged in WALKTHROUGH.md under "Newly orphaned, not deleted." They are reviewed in a follow-up, not deleted in Phase 0.
3. **Goal-chart disagreement (Q-1).** `src/utils/ages.ts` and `src/data/ageGroups.json` disagree on goal charts at older ages. Locked as-is (TASKS T-009). Resolution belongs in Phase 1 or a spec change.
4. **Gap tests to flip.** AC-1.2 (Phase 1), AC-2.3 (Phase 1), AC-3.3 (Phase 1), AC-4.4 (Phase 2), legacy AC-4.1 (Phase 2, per finding 1). Each flip is a single commit with the code change and the updated test.

## 12. Revision log

| Version | Date       | Change                                                                                                                                                                                                                                                     | Reason                                                                           |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 0.1     | 2026-10-16 | Initial plan from snapshot reconciliation                                                                                                                                                                                                                  | Spec v2.2 conformed to snapshot; dead code identified                            |
| 0.2     | 2026-10-16 | Dead-code removal moved to Phase 0 with knip as authority                                                                                                                                                                                                  | Dead files create false findings; knip required before tasks                     |
| 0.3     | 2026-10-16 | Split knip and vitest into separate decisions; pinned the root-level PostWorkoutDialog path; ordered Phase 0 steps                                                                                                                                         | Review of 0.2: shared decision ID, ambiguous deletion row, unordered knip setup  |
| 0.4     | 2026-10-17 | Feature ID set to 001-baseline; decisions renumbered to match DECISIONS.md (D-001 to D-003 recorded); roadmap IDs renamed RM-01 to RM-12; e2e removed in favor of D-002; Phase 3 moved before Phases 1 and 2; structure aligned to the 12-section template | Owner review and TASKS alignment; avoids ID collisions between roadmap and tasks |
| 0.5     | 2026-10-26 | Status normalized to Delivered                                                                                                                                                                                                                             | Documentation pass; no content change                                            |
