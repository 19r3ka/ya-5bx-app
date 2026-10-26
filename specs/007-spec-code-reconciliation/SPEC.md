# SPEC: Specification and Implementation Reconciliation

**Feature ID:** 007-spec-code-reconciliation · **Status:** Proposed · **Version:** 0.4 · **Updated:** 2026-10-26
**Governed by:** Constitution YA-5bx (Principles 1-6, Quality Gates G1-G7)

> WHAT and WHY only. Architecture, file layout, and task sequencing belong in `PLAN.md` and `TASKS.md`.
> Version 0.4 applies the owner's Option A: strict 005/006 reconciliation. Browser/PWA checks C1–C10, R8 and R9 are deferred. This version supersedes v0.3 for 007.

## 1. Goal

Bring features 005 and 006 to verified parity with their specifications for the six defects in §5. A task is complete only when it has evidence produced by an automated test, static check, build/lint run, or recorded device check. Nothing may remain in a "claimed" state at feature close.

## 2. Scope

**In scope:**

- Features 005 and 006.
- Defects detailed in §5 (P2-2, P2-3, T1-1, T1-5, T2-1, T3-1).
- The smallest supporting changes required by those defects: import the global stylesheet, reconcile duplicate global/scoped classes, wire the timer contract through `ActiveWorkoutView` and `Step5Tutorial`, and record evidence for the six source tasks.
- Verification in §3: Vitest/happy-dom, static greps, build, lint, Prettier, and a DEVICE visual pass.

**Out of scope:**

- New features, including McMaster HIIT beyond its stub (stub untouched).
- RCAF calculation logic and age tables (changes only to remove hardcoded duplicates per R3/T1-1).
- Backend or cloud sync.
- Full accessibility audit (deferred; existing gates catch keyboard/label regressions).
- iOS Safari and any device not listed in §3.
- Browser/PWA checks C1–C10 from SPEC v0.3, R8, and R9. They are deferred to a later feature.
- Playwright/Chromium, a verification check registry, and French parity re-verification.
- New product behavior. The timer still displays the workout clock, the engine still owns session progression, and the existing routes and screens remain.

## 3. Verification

**Devices (DEVICE tier):** Lenovo Miixpad (landscape reference), Pixel 8, Pixel 9 (all Chrome). English only in 007.
**Tiers:** `AUTO` (Vitest/happy-dom, static greps, build/lint/format), `DEVICE` (manual, recorded per device), `REVIEW` (manual evidence audit recorded in the walkthrough), `DEFERRED` (not in 007).
**Deferred checks:** C1–C10, R8 and R9 from SPEC v0.3 are `DEFERRED`. No Playwright, Chromium, browser harness, or check registry is added in 007.

| ID  | Check                                                                                                                                                                                        | Tier   | Gate                                                                                                       |
| :-- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----- | :--------------------------------------------------------------------------------------------------------- |
| V1  | Progression position derives from the profile and updates when the profile changes                                                                                                           | AUTO   | Vitest                                                                                                     |
| V2  | Setup list, reps and durations match `charts_matrix.json` for every chart/level pair; no fixed set or total strings remain                                                                   | AUTO   | Vitest                                                                                                     |
| V3  | Timer countdown, pause/resume, reset, single `expired`, `started`, and `timeScale` demo                                                                                                      | AUTO   | Vitest                                                                                                     |
| V4  | Parent render count unchanged across 60 simulated ticks                                                                                                                                      | AUTO   | Vitest                                                                                                     |
| V5  | Engine exposes no per-tick elapsed ref and no per-tick parent render                                                                                                                         | AUTO   | Vitest                                                                                                     |
| V6  | Style contract over `src/**/*.vue`: zero scoped blocks; no inline border in `Step3Ladder`; no `rounded="xl"` in `Step6Ready`/`AppHelpDialog`; no `:elapsed-seconds`; no legacy setup strings | AUTO   | Vitest + static greps                                                                                      |
| V7  | Typecheck, build, lint and format pass                                                                                                                                                       | AUTO   | `npm run build`, `npm run lint` (inspect the diff because the script uses `--fix`), `npx prettier --check` |
| V8  | Visual parity of onboarding 1-6, dashboard, setup, active workout, pause overlay, post-workout dialog, progress map, help dialog and bottom navigation                                       | DEVICE | manual record                                                                                              |
| V9  | 005/006 reconciliation: every unevidenced tick is reverted to CLAIMED                                                                                                                        | REVIEW | audit recorded in walkthrough                                                                              |

### Per-Check Pass Criteria

- **V1:** Rendered chart/level equals the profile; missing or unparsable profile falls back to Chart 1 / D-.
- **V2:** Every chart/level pair matches the versioned oracle, including target reps where present and interval durations.
- **V3:** The clock derives from anchors; pause/resume skips or duplicates no interval; `expired` fires once; `started` fires on mount and allocation reset; `timeScale` preserves the compressed 0:59 tutorial demo.
- **V4:** Parent render count is unchanged across 60 ticks.
- **V5:** No `elapsedSeconds` ref is updated per broadcast; the parent receives start, pause and complete events only.
- **V6:** Zero `<style scoped>` in `src/**/*.vue`; zero `style=.*border` in `Step3Ladder`; zero `rounded="xl"` in `Step6Ready` and `AppHelpDialog`; no `:elapsed-seconds`; no "3 Sets · 15 Reps" or "45 Total". T3-1 expects 10 components; the planning count is 22, and the 12-file difference is a finding.
- **V7:** `vue-tsc -b`, build, lint and Prettier pass on the changed files. Inspect the lint diff because the lint script uses `--fix`.
- **V8:** A DEVICE record with device, date and evidence link confirms every listed screen.
- **V9:** Every task tick has an evidence reference; every unevidenced 005/006 tick is `CLAIMED`.

_Physical-device note: DEVICE results are recorded per device. A failing device is marked FAILED with the defect logged. It is never silently excluded._

## 4. Requirements

| ID  | Requirement                                                                                                                                                                      | Priority                                 |
| :-- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------- |
| R1  | 005 style defects P2-2 and P2-3 are fixed (§5).                                                                                                                                  | Must                                     |
| R2  | The workout timer owns its clock state. Parents receive only start, pause, and complete events. No parent re-renders during ticks.                                               | Must                                     |
| R3  | Fixed repetition targets match RCAF 5BX Official Tables v1.0 for every level. No hardcoded duplicates remain.                                                                    | Must                                     |
| R4  | Defects T1-1 and T3-1 are fixed (§5).                                                                                                                                            | Must                                     |
| R5  | Every 007 task tick has a valid evidence reference: a Vitest/static/build/lint result, or a DEVICE record with device, date and evidence. The walkthrough records the reference. | Must                                     |
| R6  | Every 005/006 task tick without such evidence is reverted to CLAIMED.                                                                                                            | Must                                     |
| R7  | T3-1 visual parity requires a DEVICE record; static greps alone do not close it.                                                                                                 | Must                                     |
| R8  | Timing-drift message for gaps over 2s.                                                                                                                                           | Deferred to a later feature; not in 007. |
| R9  | Check registry mapping IDs to gate commands.                                                                                                                                     | Deferred to a later feature; not in 007. |

## 5. Defect Definitions

- **P2-2 (005), `Step3Ladder.vue`:** Inline `style` containing a border declaration. Fix: move to a design-token utility class.
- **P2-3 (005), `Step6Ready.vue`, `AppHelpDialog.vue`:** `rounded="xl"` on cards. Fix: use the token-defined large radius (`rounded="lg"`).
- **T1-1 (006), `useProgressionStore.ts:23-24`:** Hardcoded literals remain beside the derivation at `:27-31`. Fix: remove the literals; all values come from the derivation. Test asserts equality with the RCAF table.
- **T1-5 (006), `WorkoutSetupView.vue:94,98`:** Fixed reps and total are hardcoded. Fix: replace the fixed cards with the strategy output; derive reps and durations from the RCAF table per level; remove "3 Sets · 15 Reps" and "45 Total".
- **T2-1 (006), `WorkoutTimerClock.vue:25`:** Component still accepts the `elapsed` prop. Fix: remove the prop; the timer owns its clock using clock-derived deadlines; parents receive events only.
- **T3-1 (006):** 10 components retain `<style scoped>`. Fix: migrate to the global design-system sheet. Planner enumerates via `grep -rln --include='*.vue' '<style scoped' src/`. If the count is not 10, record the actual count and treat the difference as a finding. Planning count: 22 `.vue` files (21 non-empty; `src/App.vue` is empty); migrate all 22; record the 12-file difference as the finding.

_Reclassification from walkthroughs: T-001, T-002, T-003, T-010, and T-012 are CLAIMED until a test or DEVICE record is linked. T-015 remains CLAIMED; its PWA browser proof is deferred with C1 and C8._

## 6. Acceptance Criteria

- **AC-1.1:** `grep -rn 'style=.*border' src/` returns zero matches in `Step3Ladder.vue`.
- **AC-1.2:** `grep -rn 'rounded="xl"'` returns zero matches in `Step6Ready.vue` and `AppHelpDialog.vue`.
- **AC-2.1:** Vitest: parent render count unchanged across 60 simulated ticks.
- **AC-2.2 (DEFERRED):** Hidden-period timing; deferred with C2/C6.
- **AC-3.1:** Automated test reads versioned RCAF table as oracle; rendered reps and durations match for every level.
- **AC-3.2 (DEFERRED):** Repetition values persist across reload; deferred with C5.
- **AC-4.1:** T1-1 and T3-1 fixed; `vue-tsc -b`, lint, format, and build pass.
- **AC-5.1:** Every 007 task has a recorded evidence reference per R5.
- **AC-6.1:** Reconciliation reverts every unevidenced 005/006 tick to CLAIMED; the walkthrough records the audit. No registry script is required.
- **AC-7.1:** T3-1 visual parity has a DEVICE record; static greps alone do not close it.
- **AC-8.1 (DEFERRED):** Timing-drift message; deferred with R8.
- **AC-9.1 (DEFERRED):** Check registry; deferred with R9.

## 7. Failure Modes

- **Global CSS migration:** `src/style.css` was never imported; importing it can change existing visuals. Reconcile duplicates and check each batch with tests/build/lint and a DEVICE pass.
- **Timer/engine divergence:** The display clock derives from anchors; the engine remains authoritative; tests cover pause/resume/reset. No visibility-pause behavior is added (C2 deferred).
- **Paused-overlay regression:** Removing `elapsedSeconds` can break the label; use the snapshot value captured at the pause/status transition and test it.
- **Onboarding demo regression:** The tutorial's 0:59 demo must stay compressed via `timeScale`; test it.
- **Setup target mismatch:** Use the same resolved target in preview and `beginWorkout`; test every chart/level.
- **Deferred checks:** C1–C10, R8 and R9 are out of 007; their failure modes are not acceptance criteria.

## 8. Assumptions and Decisions

- Option A: strict 005/006 reconciliation. C1–C10, R8 and R9 are deferred. No Playwright/Chromium, no registry, no French parity re-verification.
- Supported device matrix for the DEVICE visual pass is Lenovo Miixpad, Pixel 8, Pixel 9 (all Chrome). iOS Safari is untested.
- A DEVICE result is recorded per device with date and evidence. A failing device is FAILED with the defect logged; it is never silently excluded.
- The six defects are the only product changes in 007.
- The versioned RCAF table is the oracle for R3/T1-5.
- The §3 checks are canonical for 007.

## 9. Open Items

1. **Count Check:** The 006 walkthrough shows 12 Done, 2 Partial, 2 Not met (16 total). Partial and Not met correspond to T1-1, T3-1, T1-5, and T2-1.
2. **T3-1 count:** Planning grep finds 22 `.vue` files with `<style scoped>`, not 10. The 12-file difference is a recorded finding; all 22 are migrated.
3. **Open source tasks:** 005 T-019/T-020 and 006 T-004/T-008/T-011/T-014 need evidence before closure.
