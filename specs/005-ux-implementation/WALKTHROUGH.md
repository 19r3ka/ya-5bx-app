# WALKTHROUGH: User interface implementation

**Feature:** 005-ux-implementation · **Tasks:** T-001 to T-027 · **Agent / model:** implementing agent (reverse spec session) · **Date:** 2026-10-26
**Status:** Complete with notes (two corrections open)
**Verification:** Tests 228/228 · Typecheck ok (`npm run build`) · Lint ok · Build ok

> Recorded from the 2026-10-26 audit of `main` at `8a21f60`. Browser-only checks that were never run are marked Claimed.

## 1. Task results

| Task  | Correction | Result   | Evidence                                                  |
| ----- | ---------- | -------- | --------------------------------------------------------- |
| T-001 | P0-1       | Done     | `src/main.ts:19`; smoke test                              |
| T-002 | P0-2       | Done     | `BottomNav.vue:35`; smoke nav                             |
| T-003 | P0-3       | Done     | `App.vue:24-25`; smoke hidden-nav                         |
| T-004 | P0-4       | Done     | `Step3Ladder.vue:22-35`; build                            |
| T-005 | P0-5       | Done     | `Step4Exercises.vue:140`; build                           |
| T-006 | P0-6       | Done     | `Step5Tutorial.vue:94-96`; build (countdown not observed) |
| T-007 | P0-7       | Done     | `PostWorkoutDialog.spec.ts` (7)                           |
| T-008 | P0-8       | Done     | `ProgressionMapGrid.spec.ts` (6)                          |
| T-009 | P1-1       | Done     | `GoalChartCard.spec.ts`                                   |
| T-010 | P1-2       | Done     | `Step2Age.spec.ts`                                        |
| T-011 | P1-3       | Done     | `Step2Age.vue:27`; build                                  |
| T-012 | P1-4       | Done     | `WorkoutRepOverridePanel.spec.ts`                         |
| T-013 | P1-5       | Done     | `useUserStore.spec.ts`                                    |
| T-014 | P1-6       | Done     | 12 entries in the grades array                            |
| T-015 | P1-7       | Done     | `Step6Ready.vue:147`; build                               |
| T-016 | P1-8       | Done     | grid props; `ProgressView.vue:60-63`                      |
| T-017 | P1-9       | Done     | `ActiveWorkoutView.vue:70`; build                         |
| T-018 | P2-1       | Done     | grep: 0 `text-text-`                                      |
| T-019 | P2-2       | **Open** | `Step3Ladder.vue:98`                                      |
| T-020 | P2-3       | **Open** | `Step6Ready.vue:108`, `AppHelpDialog.vue:7`               |
| T-021 | P2-4       | Done     | grep: 0 `surface-container` props                         |
| T-022 | P2-5       | Done     | only a locally defined border class remains               |
| T-023 | P2-6       | Done     | `WorkoutSetupView.vue:248`; setup spec                    |
| T-024 | P2-7       | Done     | grep: 0 imported macros                                   |
| T-025 | P2-8       | Done     | 6 lazy routes; router spec                                |
| T-026 | P3-1       | Done     | `SettingsView.vue`; build                                 |
| T-027 | P3-2       | Done     | `BottomNav.vue:21`; router spec                           |

## 2. What changed

| File                                         | Change                | Summary                                     |
| -------------------------------------------- | --------------------- | ------------------------------------------- |
| `specs/005-ux-implementation/SPEC.md`        | Created (owner-saved) | Reverse spec with the two open corrections. |
| `specs/005-ux-implementation/PLAN.md`        | Created               | Reverse plan, design pointers, check map.   |
| `specs/005-ux-implementation/TASKS.md`       | Created               | 27 correction tasks, two open.              |
| `specs/005-ux-implementation/WALKTHROUGH.md` | Created               | This record.                                |
| `specs/005-ux-implementation/design/`        | Moved                 | 4 design documents and 22 mockup assets.    |

## 3. Acceptance criteria status

| Criterion                                   | Met?    | Evidence                                              |
| ------------------------------------------- | ------- | ----------------------------------------------------- |
| AC-1.1                                      | Yes     | Fresh install lands on onboarding (smoke).            |
| AC-1.2                                      | Yes     | Nav hidden on onboarding and active workout (smoke).  |
| AC-1.3                                      | Yes     | Writable computed over the route.                     |
| AC-2.1                                      | Yes     | Age payload test; goal chart derived.                 |
| AC-2.2                                      | Yes     | Draft persists step, age and aerobic (unit tests).    |
| AC-2.3                                      | Yes     | 12 grades in the array.                               |
| AC-2.4                                      | Yes     | Ready step requires chart and level props.            |
| AC-3.1                                      | Yes     | Panel gated on the exercise phase.                    |
| AC-3.2                                      | Yes     | Dialog save, countdown and conservative seal tests.   |
| AC-3.3                                      | Yes     | Audio unlock before initialization (setup spec).      |
| AC-4.1                                      | Yes     | Store bindings and skeleton in the dashboard.         |
| AC-4.2                                      | Yes     | Map gets current, goal and completed IDs.             |
| AC-4.3                                      | Yes     | Settings view and route exist.                        |
| AC-5.1                                      | Yes     | Invalid classes, macros and eager imports are absent. |
| AC-5.2                                      | **No**  | Two cards still use the extra-large radius.           |
| AC-5.3                                      | **No**  | One inline border style remains.                      |
| AC-6.1                                      | Yes     | Build and lint pass.                                  |
| AC-6.2                                      | Yes     | Browser checks are marked Claimed below.              |
| Manual: reload at step 4                    | Claimed | Not run in a browser.                                 |
| Manual: tutorial timer counts down          | Claimed | Not observed.                                         |
| Manual: auto-seal after 60 s in IndexedDB   | Claimed | Not run.                                              |
| Manual: onboarding at age 43 shows Chart 3  | Claimed | Logic covered by tests; visual not checked.           |
| Manual: grid renders without console errors | Claimed | Component test only.                                  |

## 4. Key decisions

- The two unmet corrections are approved tasks; the feature is not marked fully delivered until they are closed.
- Accessibility stays out of this feature (roadmap RM-13).

## 5. Assumptions made

- Component tests and the build are sufficient proof for declaration and contract fixes.
- The design documents remain the visual authority.

## 6. Deviations

- The phase-4 checklist requires zero extra-large radii and zero inline border styles; both still fail.
- Seven checklist items are browser-level and were not executed.
- The original correction P2-5 targeted invalid utility classes; a locally defined class with a theme variable remains and is acceptable.

## 7. Known gaps and follow-ups

- T-019 and T-020 (P2-2, P2-3).
- Browser checks above; repeated in `006-production-completion`.
- Full accessibility audit: roadmap RM-13.

## 8. How to verify

```sh
npm run build && npm run lint
npx vitest run src/components src/views src/router
grep -rn 'style="border' src --include='*.vue'
grep -rn 'rounded="xl"' src --include='*.vue'
```

## 9. Review packet

- This walkthrough, `SPEC.md` §5 to §6, the 27 task entries, and `git diff main...HEAD -- specs/005-ux-implementation`.
