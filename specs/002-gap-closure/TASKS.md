# TASKS: Gap closure (baseline Phase 1)

**Feature ID:** 002-gap-closure · **Spec v:** 0.1 · **Plan v:** 0.1 · **Updated:** 2026-10-25

> Ordered, atomic, agent-proof. One task = one session = one commit. Agents tick boxes and append Notes; they do not rewrite tasks. Scope changes go through the reviewer.

**Gate:** no code may be written until a line `APPROVED: v0.1 <date>` is appended to the end of this file by the owner. Writing this file, the plan and the decisions does not grant approval.

**Environment:** `node_modules` is absent. Run `npm ci` before the first task. Verification per task: `npm test`, `npm run build`, `npm run lint`.

## How an agent uses this file

1. Take the first unchecked task whose dependencies are all ticked.
2. Read only: `AGENTS.md`, that task, the requirements and criteria it cites, and the files it lists.
3. Stop and report under "Blocked / questions" if the task is ambiguous, blocked, or fails twice.

## Sizing rules

- At most 3 code files (a locale pair counts as one), one verifiable behavior, one commit.
- Every acceptance criterion is covered by at least one task; every task cites at least one R and one M.
- Gap tests flip in the same commit as their fix (D-003). Never delete a characterization test to make the suite pass.
- Commit format: `type(002): T-0x <summary>`.

---

## M-1: Storage write safety (delivers R2)

- [x] T-01 (M-1, R2) Add the guarded local-write helper
      Refs: R2, AC-2.3, AC-2.4
      Depends: none
      Files: `src/utils/storage.ts` (new), `src/utils/storage.spec.ts` (new)
      Do: Implement `safeWriteJson(key, value): boolean` and `safeRemove(key): boolean`. Wrap `localStorage` access in `try/catch`; return `false` on any throw (quota, `SecurityError`, unavailable storage) and never rethrow. Skip the write entirely when serialization throws.
      Done when: `npm test -- src/utils/storage.spec.ts` passes for: success writes JSON, quota throw returns `false`, `SecurityError` returns `false`, `undefined` storage returns `false`.
      Out of scope: touching stores, components, or IndexedDB.
      Notes: 8/8 tests pass. Spec stubs `localStorage` with a fake object instead of spying on happy-dom's proxy: `vi.restoreAllMocks()` did not undo a spy on `localStorage.setItem`, which leaked into the next describe block and caused a false failure.

- [x] T-02 (M-1, R2) Guard the three user-store writes and expose the failure flag
      Refs: R2, AC-2.4, AC-2.5
      Depends: T-01
      Files: `src/stores/useUserStore.ts`, `src/stores/useUserStore.spec.ts`
      Do: Replace the bare `setItem` calls in `persistDraft`, `setPreferredAerobic` and `completeOnboarding` with `safeWriteJson`. Add state `storageWriteFailed: boolean`; set it from each result and clear it on success. In `completeOnboarding`, only remove the draft key and mark onboarding complete in storage when the profile write succeeded.
      Done when: `npm test -- src/stores/useUserStore.spec.ts` passes, including: a throwing `setItem` leaves the previous stored value unchanged, `profile` in memory is still usable, the flag is `true`; a later successful write clears the flag.
      Out of scope: any UI, `App.vue`, locale files.
      Notes: Landed in the same commit as T-03: the fix makes the AC-2.3 characterization assertion fail, and D-003 requires the flip in the same commit. On failure `completeOnboarding` keeps the draft key so the user can retry; the in-memory profile is updated and remains usable.

- [x] T-03 (M-1, R2) Flip the AC-2.3 characterization test
      Refs: R2, AC-2.3, AC-2.5
      Depends: T-02
      Files: `src/stores/useUserStore.spec.ts`
      Do: Replace the `// CHARACTERIZATION: known gap, see SPEC AC-2.3` block (near line 60) with assertions for the target behavior: writes are caught and reported via `storageWriteFailed`, and no partial profile is persisted.
      Done when: `npm test -- src/stores/useUserStore.spec.ts` passes and `grep -n "AC-2.3" src/stores/useUserStore.spec.ts` shows no characterization comment for that criterion.
      Out of scope: adding new storage behavior; that belongs to T-02.
      Notes: Characterization block replaced by four target tests (no-throw, flag set, flag cleared, stored profile preserved, draft preserved). Spec 9/9 passes.

- [x] T-04 (M-1, R2) Create the storage warning banner component
      Refs: R2, AC-2.4
      Depends: T-02
      Files: `src/components/common/StorageWarningBanner.vue` (new), `src/components/common/StorageWarningBanner.spec.ts` (new)
      Do: A `v-banner` with `color="warning"`, `icon="mdi-database-alert-outline"`, `stacked`, text from `t('storage.writeFailed')`. Prop `visible: boolean`; render nothing when `false`. Text node only, never color-only status (Constitution §6).
      Done when: the component spec passes for visible and hidden states, and the visible template output contains the resolved key's text.
      Out of scope: mounting it in `App.vue` (T-05); adding the key (T-05 owns locales).
      Notes: 2/2 tests pass. The spec mounts a local i18n instance with the key so T-04 does not depend on T-05's catalog change.

- [ ] T-05 (M-1, R2) Wire the banner and add its copy
      Refs: R2, AC-2.4
      Depends: T-04
      Files: `src/App.vue`, `src/locales/en.json`, `src/locales/fr.json`
      Do: Render `<StorageWarningBanner :visible="userStore.storageWriteFailed" />` above `v-main`. Add `storage.writeFailed` to both catalogs: EN "Storage is unavailable. Your progress may not be saved."; FR equivalent, reviewed for parity.
      Done when: `npm run build` and `npm test` pass; manual check: with storage blocked in DevTools, changing an onboarding draft shows the banner, and a successful write hides it.
      Out of scope: other banners; changing store logic.
      Notes:

## M-2: Routing recovery (delivers R1)

- [ ] T-06 (M-2, R1) Add the catch-all route and flip its characterization test
      Refs: R1, AC-1.2, AC-1.3
      Depends: none
      Files: `src/router/index.ts`, `src/router/index.spec.ts`
      Do: Append `{ path: '/:pathMatch(.*)*', redirect: { name: 'dashboard' } }` as the last route. Replace the `does not redirect an unknown path` test with assertions that an unknown path resolves to `dashboard`, that known routes still match their own names, and that the onboarding guard in `src/main.ts` still takes precedence for an incomplete profile. Remove the `// CHARACTERIZATION: known gap, see SPEC AC-1.2` header.
      Done when: `npm test -- src/router/index.spec.ts` passes; manual check: `/nope` lands on the dashboard with onboarding complete, and on `/onboarding` when incomplete.
      Out of scope: editing `src/main.ts` guard logic.
      Notes:

## M-3: Session-target resolution (delivers R3)

- [ ] T-07 (M-3, R3) Add the session-target resolver
      Refs: R3, AC-3.4
      Depends: none
      Files: `src/utils/sessionTarget.ts` (new), `src/utils/sessionTarget.spec.ts` (new)
      Do: Implement `isValidChartLevel(chartNumber, levelString)` against `charts_matrix.json` (6 charts × 12 grades, no HTTP) and `resolveSessionTarget(profileLevel, history)` returning `{ chartNumber, levelString, source }`. Order: profile level if valid → most recent completed record whose chart/level is valid → `C1_D-` with `source: 'default'`. Never throw, never write. Parse level ids with `LEVEL_ID_SEPARATOR`.
      Done when: unit tests pass for: valid profile; malformed profile with valid history; malformed profile, invalid history record, then `C1_D-`; empty history; case where the profile level is valid but the chart does not exist.
      Out of scope: UI, store changes, `getExercisesForLevel`.
      Notes:

- [ ] T-08 (M-3, R3) Resolve the target in setup and guard the level-details lookup
      Refs: R3, AC-3.5
      Depends: T-07
      Files: `src/views/WorkoutSetupView.vue`, `src/components/LevelDetails.vue`, `src/locales/en.json`, `src/locales/fr.json`
      Do: In `beginWorkout`, compute the target once with `resolveSessionTarget(profile.currentLevel, progressionStore.rawHistory)`, pass it to `initializeSession`, and show a `v-alert type="warning"` naming the level when `source !== 'profile'`. Wrap `initializeSession` in `try/catch`: on throw show a `v-alert type="error"` and do not navigate. In `LevelDetails`, return no exercise list when the level is invalid instead of letting `getExercisesForLevel` throw. Add keys `setup.fallbackLevel` and `setup.generationFailed` to both catalogs.
      Done when: `npm run build` and `npm test` pass; manual check: with a tampered profile level, setup shows the fallback banner and the workout runs at the named level; the profile value is unchanged in DevTools.
      Out of scope: changing `WorkoutOrchestrator` or `ClassicRCAFStrategy`.
      Notes:

- [ ] T-09 (M-3, R3) Flip the AC-3.3 characterization test
      Refs: R3, AC-3.3, AC-3.5
      Depends: T-08
      Files: `src/core/ClassicRCAFStrategy.spec.ts`
      Do: Remove the `// CHARACTERIZATION: known gap, see SPEC AC-3.3` blocks (near lines 107 and 115) and assert the new contract at the boundary: the strategy still throws for an invalid key, and the setup boundary prevents the throw from reaching the user (covered by the resolver plus the setup `try/catch`).
      Done when: `npm test -- src/core/ClassicRCAFStrategy.spec.ts` passes and the suite contains no AC-3.3 characterization comment.
      Out of scope: changing strategy behavior or error messages.
      Notes:

## M-4: Localization coverage (delivers R4)

- [ ] T-10 (M-4, R4) Move the remaining hardcoded copy into the catalogs
      Refs: R4, AC-8.1
      Depends: none
      Files: `src/components/onboarding/Step1Hook.vue`, `src/components/onboarding/Step6Ready.vue`, `src/components/common/AppHelpDialog.vue`, `src/locales/en.json`, `src/locales/fr.json`
      Do: Replace the literal strings with `$t()` calls: `Step1Hook` ("Royal Canadian Air Force"), `Step6Ready` ("Current Tier", "Objective", "START MY FIRST WORKOUT"), `AppHelpDialog` ("Progression Rule"). Add the keys under the existing namespaces; write French copy, not placeholders.
      Done when: `grep -n '>Royal Canadian Air Force<\|>Current Tier<\|>Objective<\|>START MY FIRST WORKOUT<\|>Progression Rule<' src` returns nothing, and both screens render in EN and FR.
      Out of scope: other components; layout changes.
      Notes:

- [ ] T-11 (M-4, R4) Add the catalog parity and used-key check
      Refs: R4, AC-8.2
      Depends: T-10
      Files: `src/locales/locales.spec.ts` (new)
      Do: Flatten both catalogs and assert identical key sets and non-empty values. Scan `src/**/*.vue` for literal `$t('…')` / `t('…')` keys and assert each resolves in both locales, with a documented allowlist for dynamic keys. No new dependency.
      Done when: `npm test -- src/locales/locales.spec.ts` passes; removing one key from `fr.json` locally makes it fail (record the observed failure in Notes, then restore).
      Out of scope: lint rules; ICU/plural auditing.
      Notes:

## M-5: Goal-level authority (delivers R5)

- [ ] T-12 (M-5, R5) Add the single goal-level resolver
      Refs: R5, AC-6.4
      Depends: none
      Files: `src/utils/levels.ts`, `src/utils/levels.spec.ts`
      Do: Implement `resolveGoalLevel(age: number): LevelId | null` that finds the `ageGroups.json` row containing the age. Return the last row's level above the table, `null` below the first row. Do not add a chart-only variant; callers derive the chart from the returned id.
      Done when: unit tests pass for each boundary age, below the first row, above the last row, and a spot check at 43.
      Out of scope: correcting the 30–34 row (T-14) and swapping call sites (T-13).
      Notes:

- [ ] T-13 (M-5, R5) Swap the call sites and retire the second source of truth
      Refs: R5, AC-6.4
      Depends: T-12
      Files: `src/views/OnboardingView.vue`, `src/components/onboarding/Step2Age.vue`, `src/components/OnboardingForm.vue`, `src/utils/ages.ts`
      Do: Replace `getGoalChartByAge` usage with `resolveGoalLevel`; derive the chart with `extractChartAndLevel` where the UI needs it. Delete `getGoalChartByAge` (and its spec block) once no caller remains. Keep the `null` case explicit in each caller.
      Done when: `grep -rn "getGoalChartByAge" src` returns nothing; `npm run build` and `npm test` pass; manual check: onboarding at age 43 shows Chart 3.
      Out of scope: changing the table, adapting `GoalChartCard` props beyond what callers need.
      Notes:

- [ ] T-14 (M-5, R5) Pin the age table and correct the 30–34 row
      Refs: R5, AC-6.4
      Depends: T-13; **blocked by Q1 in SPEC §9**
      Files: `src/data/ageGroups.json`, `src/utils/levels.spec.ts`
      Do: If the owner confirms C4_C+ for 30–34, change the row; otherwise leave the data and record the decision in `DECISIONS.md` under D-011. Either way, add a table-driven test that pins every row and every boundary.
      Done when: the row matches the owner's decision, the table test passes for all 18 rows, and `DECISIONS.md` states the resolution.
      Out of scope: other rows; the 18–24 boundary (confirmed correct).
      Notes:

## M-6: Close-out

- [ ] T-15 (M-6, R1–R5) Write the walkthrough and update the roadmap
      Refs: R1, R2, R3, R4, R5
      Depends: T-05, T-06, T-09, T-11, T-14
      Files: `specs/002-gap-closure/WALKTHROUGH.md` (new), `specs/ROADMAP.md`, `DECISIONS.md`
      Do: Fill the walkthrough from the template, listing each criterion as Met or Claimed with evidence. Update the roadmap: RM-07, RM-08, RM-09 point at 002 and get their status; add `RM-13` (accessibility audit and fixes, AC-10.1/AC-10.2, Phase 6, unblocked, Target). Set D-008 and D-011 to Proposed with final text. Do not edit `specs/001-baseline/SPEC.md`.
      Done when: the walkthrough is complete, the roadmap has RM-13, and `npm test && npm run build && npm run lint` pass.
      Out of scope: marking any baseline AC as As-Built; that is the owner's review step.
      Notes:

---

## Blocked / questions

- **SPEC.md not yet in place.** The owner's permission rules deny agent edits to `**/SPEC.md`. Draft v0.1 is staged at `/tmp/opencode/002-gap-closure-SPEC.md`; the owner must save it as `specs/002-gap-closure/SPEC.md` before approval. (raised by agent, 2026-10-25)
- **Q1 (SPEC §9):** 30–34 row, `C4_C+` (source) vs `C4_C-` (current data). Blocks T-14 only. (raised by agent, 2026-10-25)

## Coverage matrix

| Requirement | Criteria               | Tasks                        |
| ----------- | ---------------------- | ---------------------------- |
| R1          | AC-1.2, AC-1.3         | T-06                         |
| R2          | AC-2.3, AC-2.4, AC-2.5 | T-01, T-02, T-03, T-04, T-05 |
| R3          | AC-3.3, AC-3.4, AC-3.5 | T-07, T-08, T-09             |
| R4          | AC-8.1, AC-8.2         | T-10, T-11                   |
| R5          | AC-6.4                 | T-12, T-13, T-14             |
| All         | close-out              | T-15                         |

## Phase reviews

- M-1: not started · M-2: not started · M-3: not started · M-4: not started · M-5: not started · M-6: not started

---

APPROVED: v0.1 2026-10-25
