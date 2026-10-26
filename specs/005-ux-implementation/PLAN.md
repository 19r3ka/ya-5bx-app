# PLAN: User interface implementation

**Feature ID:** 005-ux-implementation · **Spec version:** 0.1 · **Status:** Implemented with open items · **Updated:** 2026-10-26

> HOW. This plan records the delivered implementation and the two corrections still open. Detail lives in `design/`; it is not duplicated here.

## 1. Approach summary

The views compose Vuetify components and the existing stores; shared pieces are components under `components/`. The 27 corrections are tracked one task each. The reverse plan names the current files, the checks that prove each fix, and the two style rules that still fail. No new screen is proposed.

## 2. Constitution check

| Principle / constraint               | How the implementation satisfies it                                                 | Status              |
| ------------------------------------ | ----------------------------------------------------------------------------------- | ------------------- |
| §1 Local-only data                   | No network use; screens read local stores.                                          | OK                  |
| §2 Deterministic, tested domain data | The UI does not compute training values; it renders store and engine state.         | OK                  |
| §4 Bilingual parity                  | Copy comes from the catalogs; no hardcoded user-facing text in the corrected files. | OK                  |
| §6 Status not by colour alone        | Map and dialog states carry text or icons.                                          | OK                  |
| Quality gates                        | Build and lint pass; component and smoke tests cover the corrected behavior.        | OK                  |
| Design-system rules                  | P2-2 and P2-3 still fail; tracked as open tasks.                                    | Violation (tracked) |

## 3. Reuse audit

| Asset                                          | Covers                                                                                             | Gap                                         |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `design/ux-spec.md`                            | Tokens, typography, spacing, per-screen layout, states                                             | Source of truth for visual detail.          |
| `design/phase4-implementation_plan.md`         | Element map, file structure, per-view blueprint                                                    | Some file paths moved since.                |
| `design/phase4-corrections.md`                 | The 27 corrections and the verification checklist                                                  | Two rules unmet; seven manual checks unrun. |
| `design/functional_confidence_design_specs.md` | Defensive behaviour notes                                                                          | Reference only.                             |
| `design/*.html`, `design/*.png`                | 11 screen mockups                                                                                  | Reference only.                             |
| Existing components                            | `GoalChartCard`, `WorkoutRepOverridePanel`, `PostWorkoutDialog`, `ProgressionMapGrid`, `BottomNav` | None.                                       |

## 4. Architecture

```text
App.vue
├── BottomNav (hidden on onboarding, active workout)
└── router-view (lazy)
    ├── OnboardingView  -> Step1..Step6 + AppHelpDialog
    ├── DashboardView   -> skeleton | live data
    ├── WorkoutSetupView-> aerobic selection, start
    ├── ActiveWorkoutView -> engine, timer clock, rep override, post-workout dialog
    ├── ProgressView    -> ProgressionMapGrid
    └── SettingsView
```

## 5. Data model

No new model. The screens read `useUserStore` (profile, draft, onboarding state), `useProgressionStore` (history, position, validation) and `useWorkoutEngine` (snapshot, lifecycle). Onboarding drafts persist `step`, `age` and `aerobic`.

## 6. Interfaces and contracts

- Route table: six named routes plus the catch-all; lazy view imports.
- `BottomNav` uses a writable computed over the current route, not a ref plus watcher.
- `GoalChartCard` requires `chartNumber` and `ageRange`; `Step6Ready` requires `goalChart` and `goalLevel`.
- `WorkoutRepOverridePanel` requires `defaultReps`, optional `exerciseName` and `disabled`.
- `ProgressionMapGrid` requires `currentLevelId`, `goalLevelId`, `isHydrated`, optional `completedLevelIds`.

## 7. File changes

| Path                                         | New / Modified    | Purpose                                                 |
| -------------------------------------------- | ----------------- | ------------------------------------------------------- |
| `specs/005-ux-implementation/SPEC.md`        | New (owner-saved) | Requirements and criteria.                              |
| `specs/005-ux-implementation/PLAN.md`        | New               | This reverse plan.                                      |
| `specs/005-ux-implementation/TASKS.md`       | New               | 27 corrections with evidence.                           |
| `specs/005-ux-implementation/WALKTHROUGH.md` | New               | Verification record.                                    |
| `specs/005-ux-implementation/design/`        | Moved             | Original specification, plans, corrections and mockups. |

No `src/` change.

## 8. Test strategy

| Criterion              | Test type          | Location / command                                                                    |
| ---------------------- | ------------------ | ------------------------------------------------------------------------------------- |
| AC-1.1, AC-1.2, AC-1.3 | smoke + inspection | `src/__smoke__/app.smoke.spec.ts`; `App.vue:24`                                       |
| AC-2.1, AC-2.2         | component + unit   | `Step2Age.spec.ts`, `useUserStore.spec.ts`                                            |
| AC-2.3                 | inspection         | grades array has 12 entries                                                           |
| AC-2.4                 | inspection + build | `Step6Ready.vue` required props                                                       |
| AC-3.1                 | inspection         | `ActiveWorkoutView.vue` rep-phase flag                                                |
| AC-3.2                 | component          | `PostWorkoutDialog.spec.ts`                                                           |
| AC-3.3                 | unit               | `WorkoutSetupView.spec.ts`                                                            |
| AC-4.1                 | inspection         | dashboard store bindings and skeleton                                                 |
| AC-4.2                 | component          | `ProgressionMapGrid.spec.ts`                                                          |
| AC-4.3                 | build + inspection | `SettingsView.vue`, settings route                                                    |
| AC-5.1                 | scripted           | greps for invalid classes, macro imports, eager imports                               |
| AC-5.2                 | scripted           | `grep -rn 'rounded="xl"' src --include='*.vue'` (must be 0; currently 2)              |
| AC-5.3                 | scripted           | `grep -rn 'style="border' src --include='*.vue'` (must be 0; currently 1)             |
| AC-6.1                 | scripted           | `npm run build && npm run lint`                                                       |
| AC-6.2                 | manual             | seven browser checks recorded as Claimed                                              |
| Manual set             | manual             | onboarding reload, tutorial timer, IDB seal, nav hidden, grid console, device install |

## 9. Risks and mitigations

| Risk                              | Likelihood | Impact | Mitigation                                                                           |
| --------------------------------- | ---------- | ------ | ------------------------------------------------------------------------------------ |
| Manual checks never run           | High       | Medium | Recorded as Claimed; repeated in 006 verification.                                   |
| Style regressions after the phase | Medium     | Low    | Grep checks in the task list and the walkthrough.                                    |
| Design drift from the mockups     | Medium     | Medium | Mockups preserved in `design/`; accessibility and visual polish stay on the roadmap. |
| Reverse spec overstates a fix     | Low        | High   | Each tick cites a file and a check; unresolved items stay unchecked.                 |

## 10. Key decisions

- `D-003`: characterization tests flip with their fix.
- Accessibility is a separate future feature (roadmap RM-13), not part of this one.

## 11. Phases

| Phase     | Shippable deliverable                                           | Requirements covered |
| --------- | --------------------------------------------------------------- | -------------------- |
| Delivered | Shell, onboarding, dashboard, workout views, progress, settings | R1 to R4, R6         |
| Open      | Two style corrections (P2-2, P2-3)                              | R5                   |

## 12. Revision log

| Version | Date       | Change      | Reason                                    |
| ------- | ---------- | ----------- | ----------------------------------------- |
| 0.1     | 2026-10-26 | First draft | Reverse plan of the delivered phase-4 UI. |
