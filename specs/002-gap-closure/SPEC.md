# SPEC: Gap closure (baseline Phase 1)

**Feature ID:** 002-gap-closure · **Spec version:** 0.1 · **Status:** Draft (reconstructed 2026-10-26) · **Owner:** project owner · **Updated:** 2026-10-26

> WHAT and WHY, not HOW. This is a thin delta on `specs/001-baseline/SPEC.md`: it closes Phase 1 gaps only and does not restate baseline criteria that are already met.

> **Reconstruction note:** the 2026-10-25 draft lived in `/tmp/opencode/002-gap-closure-SPEC.md` and was lost when temporary storage was cleared. This file was rebuilt from `PLAN.md`, `TASKS.md`, `DECISIONS.md` and the delivered code and tests. Treat the wording as recovering intent, not as the original text; confirm before citing it as authoritative..

## 1. Purpose

Phase 1 of the baseline spec left several acceptance criteria with locked characterization tests or unverified behavior. This feature replaces each locked gap with a tested behavior, without new dependencies, schema changes, timer changes or redesigns.

Delivered requirements: R1 (routing), R2 (storage safety), R3 (session target), R4 (localization), R5 (goal-level authority).

## 2. Sources of truth

| Fact                                 | Source                                                    |
| ------------------------------------ | --------------------------------------------------------- |
| Baseline requirements and criteria   | `specs/001-baseline/SPEC.md`                              |
| Product principles and quality gates | `CONSTITUTION.md`                                         |
| Valid chart/level keys               | `src/core/data/charts_matrix.json` (6 charts × 12 grades) |
| Age → goal level table               | `src/data/ageGroups.json`                                 |
| Locale catalogs                      | `src/locales/en.json`, `src/locales/fr.json`              |
| Decisions                            | `DECISIONS.md` D-003, D-008, D-011                        |

## 3. Requirements

- **R1 — Routing recovery.** An unknown URL shall never leave the app on a blank route. Known routes and the onboarding guard keep their current behavior.
- **R2 — Storage write safety.** Local-storage writes shall never throw into the UI. A failed write shall be visible to the user, shall not destroy previously stored data, and shall clear on the next successful write.
- **R3 — Session target resolution.** Before generation, the app shall resolve one valid chart/level target without writing to the profile. Invalid profile data shall not reach the strategy; if generation still fails, the UI shall show an explicit error and keep the app usable.
- **R4 — Localization coverage.** The three screens named in AC-8.1 shall contain no hardcoded user-facing copy. French and English catalogs shall stay in key parity, enforced by a test.
- **R5 — Goal-level authority.** `src/data/ageGroups.json` shall be the single authority for the age → goal level mapping, read through one pure function. No second chart-only mapping shall remain reachable.

## 4. Acceptance criteria

All criteria are Given/When/Then. Criteria keep their baseline ids where they replace a baseline `Target`; new ids are marked.

### R1: Routing

- **AC-1.2:** Given an unhandled route URL, when navigation occurs, then the app redirects to the dashboard root.
- **AC-1.3 (new):** Given the catch-all route and the onboarding guard, when the profile is incomplete, then an unknown URL lands on `/onboarding`; when the profile is complete, it lands on the dashboard. Known routes still resolve to their own names.

### R2: Storage

- **AC-2.3:** Given a storage write that throws (quota, `SecurityError`, unavailable storage), when the store persists a draft or the profile, then no exception escapes to the caller and the failure is recorded in store state.
- **AC-2.4:** Given the last write failed, when the app renders, then a text warning banner states that progress may not be saved; after the next successful write the banner disappears. Status is never color-only.
- **AC-2.5:** Given a failed profile write during onboarding completion, when the action returns, then the previously stored profile and the onboarding draft are unchanged, the in-memory profile is still usable, and no partially written profile exists in storage.

### R3: Session generation

- **AC-3.3:** Given an invalid or missing chart/level, when the user starts a workout, then the app silently substitutes a valid target and shows a warning naming it; the session runs and the profile is not modified. If generation still throws, an explicit error banner is shown.
- **AC-3.4:** Given a profile level and the completed-session history, when the target is resolved, then the order is: valid profile level → most recent completed record with a valid chart/level → Chart 1, Level D-. Resolution never throws and never writes.
- **AC-3.5:** Given a generation failure at the setup boundary, when the error is caught, then the user stays on the setup screen, an error banner is shown, and no session state is corrupted.

### R4: Localization

- **AC-8.1:** Given the three screens named in the baseline gap (`Step1Hook.vue`, `Step6Ready.vue`, `AppHelpDialog.vue`), when they render, then all user-facing copy comes from the catalogs in both French and English.
- **AC-8.2:** Given the two catalogs, when the test suite runs, then both have identical key sets, no empty values, and every literal `$t('…')` key used in `src/**/*.vue` resolves in both locales.

### R5: Goal level

- **AC-6.4 (new):** Given an age, when the goal level is requested, then it comes from exactly one row of `ageGroups.json` through one pure function: boundaries inclusive, ages above the last row use the last row, ages below the first row return `null`. The table is pinned by a literal test, and the 30–34 row is `C4_C+`.

## 5. Out of scope

- Accessibility fixes (R10, AC-10.1/AC-10.2) — tracked as RM-13, dedicated future feature.
- Timer, lifecycle and progression logic (`TimerEngine`, `useWorkoutEngine` timing, `useTimer`, `ProgressionPolicy`).
- Data model or schema changes; new dependencies; IndexedDB changes.
- Dead-code removal (`LevelDetails.vue`, `OnboardingForm.vue`, other knip hits) — separate cleanup.
- Full localization of screens outside the three named files.
- Health screening (R11) and backup prompts (R7).

## 6. Non-functional constraints

- Offline-first: no runtime network access added; all checks run locally.
- Bilingual parity is a release gate (Constitution §4); the parity test must be able to fail on a missing key.
- No user data written outside local storage; a fallback target is transient and never persisted (D-008).
- Static checks: `npm run build` (includes type checking) and `npm run lint` must pass.
- Gap tests flip in the same commit as their fix; no characterization test is deleted (D-003).

## 7. Verification

| Criterion | Evidence                                                                      |
| --------- | ----------------------------------------------------------------------------- |
| AC-1.2    | `src/router/index.spec.ts`: unknown path redirects to `dashboard`             |
| AC-1.3    | same file: known routes keep names; guard precedence test                     |
| AC-2.3    | `src/stores/useUserStore.spec.ts`: no throw, failure flag set                 |
| AC-2.4    | `src/utils/storage.spec.ts`, `StorageWarningBanner.spec.ts`, store flag tests |
| AC-2.5    | store spec: stored profile and draft preserved, flag clears on success        |
| AC-3.3    | `src/utils/sessionTarget.spec.ts` + `ClassicRCAFStrategy.spec.ts` (flipped)   |
| AC-3.4    | `src/utils/sessionTarget.spec.ts` (order, skip-invalid, default)              |
| AC-3.5    | setup `try/catch` + manual check on the setup screen                          |
| AC-8.1    | grep gate on the three files + component specs                                |
| AC-8.2    | `src/locales/locales.spec.ts` (parity, non-empty, used keys)                  |
| AC-6.4    | `src/utils/levels.spec.ts` (18 pinned rows and both boundaries each)          |

Manual checks that no automated test covers: storage blocked in DevTools, onboarding at age 43 shows Chart 3, `/nope` in both onboarding states.

## 8. Definition of done

- Every criterion above is either proved by a test or recorded as "claimed" with the manual check that would prove it.
- `npm test`, `npm run build`, `npm run lint` pass.
- `WALKTHROUGH.md` lists tasks, deviations and criteria status.
- Roadmap updated; `DECISIONS.md` records D-008 and D-011 with the Q1 resolution.
- Milestone reviews completed; owner opens the PR.

## 9. Questions

- **Q1 — 30–34 goal level.** RCAF transcription says `C4_C+`; data said `C4_C-`. **Resolved 2026-10-25:** owner chose `C4_C+` (RCAF source); data corrected in T-14.
- **Q2 — fallback source.** Should the fallback prefer the newest completed session or the profile's chart with a reset level? **Resolved:** newest completed session with a valid level, then `C1_D-` (D-008).
- **Q3 — localization scope.** Only the three named files, or the whole app? **Resolved:** the three files, matching the baseline gap; the rest is follow-up work under R8.

## 10. Change log

| Version | Date       | Change                                                                         |
| ------- | ---------- | ------------------------------------------------------------------------------ |
| 0.1     | 2026-10-25 | Initial delta spec for baseline Phase 1 gap closure                            |
| 0.1     | 2026-10-26 | Reconstructed after the draft in `/tmp/opencode` was lost; Q1 recorded settled |
