# WALKTHROUGH: Spec/code reconciliation

**Feature:** 007-spec-code-reconciliation · **Tasks:** T-001 to T-015 · **Agent / model:** OpenCode / DeepSeek Flash · **Date:** 2026-10-26
**Status:** In progress (M-3 complete, T-014 complete, T-015 pending)
**Verification:** Tests 246/246 · Typecheck ok · Lint ok · Build ok

> Written by the implementing agent. Factual and dense: no narrative, no celebration. Marked "claimed" when no test or recorded check proves a criterion.

## 1. Task results

| Task  | Refs           | Result | Evidence                                                                        |
| ----- | -------------- | ------ | ------------------------------------------------------------------------------- |
| T-001 | R4, AC-4.1     | Done   | `useProgressionStore.spec.ts` 6 passed; literal grep zero; build/lint           |
| T-002 | R3, AC-3.1     | Done   | `WorkoutSetupView.spec.ts` 8 passed over the full chart/level oracle            |
| T-003 | R1, AC-1.1     | Done   | Inline-border grep zero; build/lint                                             |
| T-004 | R1, AC-1.2     | Done   | `rounded="xl"` grep zero; build                                                 |
| T-005 | R2, AC-2.1     | Done   | `WorkoutTimerClock.spec.ts` 8 passed; full suite 240; build/lint                |
| T-006 | R2, AC-2.1     | Done   | Parent render test, paused overlay, tutorial switch; full suite 240; build/lint |
| T-007 | R4, AC-4.1     | Done   | `style.css` imported once; canonical classes; full suite 240; build/lint        |
| T-008 | R4, AC-4.1     | Done   | Five shared/layout files have no scoped block; full suite 240; build/lint       |
| T-009 | R4, AC-4.1     | Done   | Six onboarding files have no scoped block; full suite 240; build/lint           |
| T-010 | R4, AC-4.1     | Done   | Four workout files have no scoped block; 24 targeted tests; build/lint          |
| T-011 | R4, AC-4.1     | Done   | Grid scoped block removed; 6 grid tests; build/lint                             |
| T-012 | R4, AC-4.1     | Done   | Five views have no scoped block; full suite 240; build/lint                     |
| T-013 | R4, AC-4.1, V6 | Done   | `style-contract.spec.ts`; zero scoped blocks and zero `:elapsed-seconds`        |
| T-014 | R5, R6, V9     | Done   | Six named 005/006 tasks closed with 007 test/grep/build evidence                |
| T-015 | R7, AC-7.1, V8 | Open   | Final gate and DEVICE record pending                                            |

## 2. What changed

| File                                             | Change   | Summary                                                            |
| ------------------------------------------------ | -------- | ------------------------------------------------------------------ |
| `src/style.css`                                  | Modified | Canonical global classes; loaded from `main.ts`                    |
| `src/components/onboarding/*.vue`                | Modified | Six scoped blocks removed; canonical classes                       |
| `src/components/workout/*.vue`                   | Modified | Four scoped blocks removed; timer classes canonical                |
| `src/components/progress/ProgressionMapGrid.vue` | Modified | Scoped block removed; `.border-top-accent` used                    |
| `src/views/*.vue`                                | Modified | Five scoped blocks removed; canonical z-index/width/border classes |
| `src/__smoke__/style-contract.spec.ts`           | Created  | V6 static contract over `src/**/*.vue` and the progression store   |
| `specs/005-ux-implementation/TASKS.md`           | Modified | Closed T-019/T-020 with 007 evidence                               |
| `specs/006-production-completion/TASKS.md`       | Modified | Closed T-004/T-008/T-011/T-014 with 007 evidence                   |

## 3. Acceptance criteria status

| Criterion | Met?    | Evidence                                                                  |
| --------- | ------- | ------------------------------------------------------------------------- |
| AC-1.1    | Yes     | Inline border removed; `.border-s-primary` is global                      |
| AC-1.2    | Yes     | Both P2-3 cards use `rounded="lg"`                                        |
| AC-2.1    | Yes     | Timer contract and parent-render tests                                    |
| AC-3.1    | Yes     | Full oracle comparison in `WorkoutSetupView.spec.ts`                      |
| AC-4.1    | Yes     | Zero scoped blocks; canonical global sheet; V6 contract                   |
| AC-5.1    | Yes     | Every 007 tick cites a test/grep/build/lint result; T-014 audit           |
| AC-6.1    | Yes     | Six named 005/006 tasks closed with evidence; no audited tick unevidenced |
| AC-7.1    | Pending | T-015 DEVICE record                                                       |

## 4. Key decisions

- **D-007-1:** Option A (strict 005/006 reconciliation) is adopted in SPEC v0.4.
- **D-007-2:** T3-1 expects 10 components; the actual count is 22 `.vue` scoped blocks. All 22 are migrated; the difference is a finding, not a silent scope change.
- **D-007-3:** Vuetify utilities/props first; global CSS only for irreducible rules.
- **D-007-4:** `WorkoutTimerClock.vue` owns the display clock; the engine owns progression.
- **D-007-5:** Verification is Vitest/happy-dom, static/build/lint/Prettier and a DEVICE pass; no browser harness is added.
- **D-007-6:** `charts_matrix.json` is the versioned RCAF 5BX oracle.

## 5. Assumptions made

- The 22-file count includes `App.vue`'s empty scoped block, removed in T-007.
- The five M-3 batches cover every `.vue` file that had a scoped block at the start of 007.
- `OnboardingView`'s `.v-window-item { height: 100% }` was redundant with Vuetify's `.fill-height` (`height: 100% !important`).

## 6. Deviations

- T3-1 count: 22 actual vs 10 expected (+12). Recorded as finding **F-007-1** below.
- `.border-accent` has multiple scoped values in the starting tree. The canonical `.border-accent` is outline-variant 0.5; surface-variant 0.5 uses `.border-surface-variant`; outline-variant 0.3 uses `.border-accent-soft`.
- Vuetify's `.border-s-lg` cannot reliably colour the start border because its color declaration is ordered after `.border-current`; the documented global `.border-s-*` fallback is used.

## 7. Known gaps and follow-ups

- **F-007-1 (T3-1 count):** SPEC expects 10 components with scoped styles; the actual starting count was **22 `.vue` files** (one empty `App.vue` block and 21 component/view blocks). Difference: **+12**. All 22 are migrated; no subset remains. This is a specification-count finding, not an unimplemented defect.
- T-014 must audit 005/006 evidence; no owner statement alone counts.
- T-015 must record the DEVICE visual pass or mark unavailable devices `BLOCKED`.
- C1-C10, R8 and R9 remain deferred and are not claimed by 007.

## 8. How to verify

```sh
npm test
npm run build
npm run lint
npx prettier --check src/style.css src/main.ts src/App.vue src/components src/views
grep -rn '<style scoped' src --include='*.vue'
grep -rn ':elapsed-seconds' src --include='*.vue'
grep -rn '3 Sets · 15 Reps\|45 Total' src --include='*.vue'
```

## 9. 005/006 evidence audit

| Source task | Result | Exact 007 evidence                                                                  |
| ----------- | ------ | ----------------------------------------------------------------------------------- |
| 005 T-019   | Done   | `.border-s-primary`; `grep 'style="border'` zero; style contract 6; build           |
| 005 T-020   | Done   | `rounded="xl"` zero; both cards `rounded="lg"`; style contract 6; build             |
| 006 T-004   | Done   | Derived chart/level; literal grep zero; store spec 6; full suite 246; build/lint    |
| 006 T-008   | Done   | Strategy preview; legacy-string grep zero; setup spec 8; full suite 246; build/lint |
| 006 T-011   | Done   | No elapsed prop; `:elapsed-seconds` zero; clock spec 8 + ActiveWorkout; full 246    |
| 006 T-014   | Done   | Zero scoped blocks; style contract 6; 22-vs-10 finding F-007-1; full 246            |

- Both source files already carry `APPROVED: v0.1 2026-10-26`. 005's header names the wrong pair (T-021/T-022); an audit note records that the open pair was T-019/T-020 and that their notes carry the owner approval. 006's stale "needs a new APPROVED line" blocker is marked resolved.
- No audited tick was marked done from an owner statement alone. The six closures cite tests, greps, build or lint.
- Unrelated 005/006 ticks remain historical per T-014's out-of-scope clause; this audit does not reclassify them.
- Combined targeted run: `useProgressionStore`, `WorkoutSetupView`, `WorkoutTimerClock`, `ActiveWorkoutView` and `style-contract`: 30 passed.

## 10. Review packet

- This walkthrough, SPEC v0.4 (R1-R7, AC-1.1 to AC-7.1, V6), PLAN v0.3 §4.4 and §5, TASKS T-001 to T-015.
- Diff: `git diff main...HEAD` (or the M-3 range `56ce3e6..HEAD`).
