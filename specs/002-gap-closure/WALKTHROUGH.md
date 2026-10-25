# WALKTHROUGH: gap closure (session 1)

**Feature:** 002-gap-closure · **Tasks:** T-01 to T-13 · **Agent / model:** OpenCode / DeepSeek Flash · **Date:** 2026-10-25
**Status:** Complete with notes (M-1 to M-4 done; M-5 done except T-14, which is blocked by Q1)
**Verification:** Tests 201/201 · Typecheck ok (`npm run build`) · Lint ok · Build ok

> Written by the implementing agent at the end of every session. Mark a criterion "claimed" when no test or recorded check proves it.

## 1. Task results

| Task | Refs           | Result  | Evidence                                                              |
| ---- | -------------- | ------- | --------------------------------------------------------------------- |
| T-01 | R2, AC-2.3/2.4 | Done    | `src/utils/storage.spec.ts` 8/8                                       |
| T-02 | R2, AC-2.4/2.5 | Done    | `useUserStore.spec.ts` 9/9; same commit as T-03 (D-003)               |
| T-03 | R2, AC-2.3     | Done    | characterization block replaced; no AC-2.3 comment remains            |
| T-04 | R2, AC-2.4     | Done    | `StorageWarningBanner.spec.ts` 2/2                                    |
| T-05 | R2, AC-2.4     | Done    | banner mounted in `App.vue`; suite 195/195 at that point              |
| T-06 | R1, AC-1.2/1.3 | Done    | `router/index.spec.ts` 9/9 (redirect, known routes, guard precedence) |
| T-07 | R3, AC-3.4     | Done    | `sessionTarget.spec.ts` 9/9                                           |
| T-08 | R3, AC-3.5     | Done    | suite 206/206, build ok                                               |
| T-09 | R3, AC-3.3     | Done    | both AC-3.3 characterization comments removed                         |
| T-10 | R4, AC-8.1     | Done    | three files fully localized; no hardcoded template text remains       |
| T-11 | R4, AC-8.2     | Done    | `locales.spec.ts` 3/3; failure observed before the fix                |
| T-12 | R5, AC-6.4     | Done    | `levels.spec.ts` 30/30, 21 pinned ages                                |
| T-13 | R5, AC-6.4     | Done    | `grep getGoalChartByAge src` empty; suite 201/201                     |
| T-14 | R5, AC-6.4     | Blocked | Q1 (30–34 row) unanswered                                             |
| T-15 | close-out      | Not run | depends on T-14                                                       |

## 2. What changed

| File                                                     | Change   | Summary                                                          |
| -------------------------------------------------------- | -------- | ---------------------------------------------------------------- |
| `src/utils/storage.ts` (+spec)                           | Created  | `safeWriteJson`, `safeRemove`; never throw                       |
| `src/stores/useUserStore.ts` (+spec)                     | Modified | guarded writes, `storageWriteFailed`, draft kept on failure      |
| `src/components/common/StorageWarningBanner.vue` (+spec) | Created  | warning banner bound to the store flag                           |
| `src/App.vue`                                            | Modified | renders the banner above `v-main`                                |
| `src/router/index.ts` (+spec)                            | Modified | catch-all redirect placed last                                   |
| `src/utils/sessionTarget.ts` (+spec)                     | Created  | validity check + fallback chain (D-008)                          |
| `src/views/WorkoutSetupView.vue`                         | Modified | resolves target once, fallback and failure banners               |
| `src/core/ClassicRCAFStrategy.spec.ts`                   | Modified | AC-3.3 characterization comments removed                         |
| `src/components/onboarding/Step1Hook.vue`                | Modified | `onboarding.hook.*` keys                                         |
| `src/components/onboarding/Step6Ready.vue`               | Modified | `onboarding.ready.*` keys; dynamic chart and level               |
| `src/components/common/AppHelpDialog.vue`                | Modified | `help.*` keys                                                    |
| `src/locales/en.json`, `fr.json`                         | Modified | `storage`, `setup`, `onboarding.hook`, `help`, 10 new ready keys |
| `src/locales/locales.spec.ts`                            | Created  | parity, non-empty, used-key resolution                           |
| `src/utils/levels.ts` (+spec)                            | Modified | `getAgeGroupForAge`; `getGoalLevelByAge` delegates               |
| `src/utils/ages.ts` (+spec)                              | Modified | `getGoalChartByAge`, `getAgeRangeLabel` deleted                  |
| `src/views/OnboardingView.vue`                           | Modified | goal level from the table; no fabricated `A+`                    |
| `src/components/onboarding/Step2Age.vue` (+spec)         | Modified | chart and range from the same table row                          |

## 3. Acceptance criteria status

| Criterion | Met?    | Evidence                                                                    |
| --------- | ------- | --------------------------------------------------------------------------- |
| AC-1.2    | Yes     | router test: unknown path redirects to `dashboard`                          |
| AC-1.3    | Yes     | known routes keep names; guard test lands on `onboarding`                   |
| AC-2.3    | Yes     | four target tests replace the characterization test                         |
| AC-2.4    | Yes     | storage spec (throw paths) + banner spec; DevTools check not run            |
| AC-2.5    | Yes     | stored profile unchanged, draft kept, flag clears on success                |
| AC-3.3    | Yes     | strategy still rejects bad keys; setup resolves first and catches the throw |
| AC-3.4    | Yes     | resolver spec covers profile/history/default order                          |
| AC-3.5    | Claimed | banner is wired and translated; no component test for the view              |
| AC-8.1    | Yes     | the three named files contain no hardcoded user-facing text                 |
| AC-8.2    | Yes     | parity + used-key test; proven to fail on a missing FR key                  |
| AC-6.4    | Yes     | one source, 21 pinned ages; **30–34 value pending Q1**                      |

## 4. Key decisions

- D-008 fallback chain implemented as written; profile never written.
- D-011 single source implemented; `getGoalLevelByAge` kept instead of adding a synonym (DRY), the two stale helpers deleted.
- T-02 and T-03 share one commit because the fix invalidates the characterization assertion (D-003).

## 5. Assumptions

- `charts_matrix.json` is the authority for "does this level exist".
- The newest history record with a valid level is a safe fallback even if its telemetry is pending.
- Manual browser checks (DevTools storage block, onboarding at 43, unknown URL) were not run in this session.

## 6. Deviations

1. `LevelDetails.vue` untouched (T-08): knip reports it unused; its throw is unreachable.
2. `OnboardingForm.vue` untouched (T-13): knip reports it unused.
3. T-10 expanded from five strings to full localization of the three files: Constitution §4 outranks PLAN/TASKS.
4. T-12 adds no new function: `getGoalLevelByAge` already was the pure resolver.
5. `SPEC.md` is not in the repo: the owner's permission rules deny agent edits to `**/SPEC.md`. Draft v0.1 was staged at `/tmp/opencode/002-gap-closure-SPEC.md`.
6. Milestone reviews could not run: the reviewer subagent failed with provider quota (429, retry ~12 h).

## 7. Known gaps and follow-ups

- Q1: 30–34 row, `C4_C+` (RCAF table) vs `C4_C-` (data). Blocks T-14 and T-15.
- Dead files listed by knip: `ExerciseCard`, `ExerciseList`, `ExerciseTable`, `LevelDetails`, `OnboardingForm`, `ProgressionMap`, `ExerciseInfoSheet`, `WorkoutOptions`, `WorkoutTimer`, `WorkoutTimerControls`, `WorkoutTimerDisplay`, `src/core/scratch/generate_matrix.js`, `src/core/VerificationRunbook.ts`, `src/models/User.ts`, `types/vuetify.d.ts`. Cleanup is not in this feature's scope.
- Other components still hold hardcoded copy (dashboard, workout setup headings, onboarding steps 3-5); R8 stays partially met outside the three files named by AC-8.1.
- First test run after `npm ci` failed 3 tests, then passed twice. Cold-start flake, not reproduced.
- `versions` file absent at repo root, so the contract's version gate cannot be checked.

## 8. How to verify

```sh
npm ci
npm test
npm run build
npm run lint
grep -rn "getGoalChartByAge" src        # expect nothing
grep -rn "CHARACTERIZATION: known gap, see SPEC AC-[123]" src  # expect only AC-4.1/4.4
```

## 9. Review packet

- This walkthrough
- SPEC v0.1 (`/tmp/opencode/002-gap-closure-SPEC.md`, pending owner save)
- `specs/002-gap-closure/PLAN.md`, `TASKS.md` T-01 to T-13
- Diff: `git diff main...HEAD -- src/`
