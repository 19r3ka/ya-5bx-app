# SPEC: User interface implementation

**Feature ID:** 005-ux-implementation · **Status:** Implemented with open items · **Version:** 0.1 · **Updated:** 2026-10-26

> WHAT and WHY only. Technology and file-level design are in `PLAN.md`. This is a reverse spec of the delivered phase-4 UI, including the corrections that were applied and the two that were not.

## 1. Goal

Deliver the designed interface as a working Vuetify implementation: every screen reachable, every value bound to real state, and every visual rule from the design system applied.

## 2. Context

Phase 4 turned the UX specification and its mockups into views and components. Twenty-seven corrections followed, fixing runtime failures, prop contracts, design-system violations and missing screens. The 2026-10-26 audit verified 24 of them; two style rules still fail and seven browser-level checks were never run. The original documents are preserved in `design/`.

## 3. Users and scenarios

- User: completes onboarding, sees a dashboard with their own data, starts a workout, reviews progress.
- Reviewer: can trace each correction to a file and a check.
- Implementing agent: finds open corrections as unchecked tasks instead of assuming the phase is finished.

## 4. Scope

**In scope**

- App shell and navigation, the six onboarding steps, dashboard, workout setup, active workout, post-workout dialog, progress screen and settings.
- The 27 recorded corrections and the design-system rules they enforce.

**Out of scope (non-goals)**

- Accessibility audit and fixes: dedicated future feature, roadmap RM-13.
- New screens or interactions not present in the design documents.
- Engine, persistence and telemetry behavior; see `004-progression` and `006-production-completion`.
- Colour and typography token values themselves; they come from the design system.

## 5. Requirements

| ID  | Requirement                                                                                                                                                        | Priority |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| R1  | The app shell shall guard routes, keep navigation state consistent and hide the bottom bar on immersive screens.                                                   | Must     |
| R2  | Onboarding shall preserve, validate and display the user's input across all six steps and reloads.                                                                 | Must     |
| R3  | Workout screens shall reflect engine state, accept rep overrides only during exercise, and unlock audio on start.                                                  | Must     |
| R4  | Dashboard, progress and settings shall display live store data with the designed states and reachable routes.                                                      | Must     |
| R5  | Templates shall follow the design system and Vuetify contract: valid classes, no inline layout or border styles, correct card radius, no imported compiler macros. | Must     |
| R6  | Every correction shall be verifiable by a build, lint, component test, route check or an explicitly claimed manual check.                                          | Must     |

## 6. Acceptance criteria

**R1**

- AC-1.1: Given a fresh install, when the app opens, then it lands on onboarding and no route renders without a guard decision.
- AC-1.2: Given any screen except onboarding and active workout, then the bottom bar is visible; on those two it is hidden.
- AC-1.3 (edge): Given a navigation tab, when it is selected, then the route changes and the selected state follows the route.

**R2**

- AC-2.1: Given an age entry, when it is submitted, then the next step receives the value and the goal chart reflects it.
- AC-2.2: Given a step reload, when the app restores the draft, then step, age and aerobic selection return.
- AC-2.3 (edge): Given the ladder, then all twelve grades render and the goal chart is highlighted.
- AC-2.4 (edge): Given the ready step, then the goal chart and goal level come from the user's data, not fixed strings.

**R3**

- AC-3.1: Given an active interval, then the rep override panel is hidden; during the transition gate it is enabled.
- AC-3.2: Given the post-workout dialog, then a save action and a visible countdown exist, and the timeout path seals conservatively.
- AC-3.3 (edge): Given the start button, then audio is unlocked before the session initializes.

**R4**

- AC-4.1: Given hydrated data, then the dashboard shows the user's name, chart and level; before hydration it shows a skeleton.
- AC-4.2: Given the progress screen, then the map receives the current, goal and completed level IDs.
- AC-4.3 (edge): Given the settings entry point, then a settings view renders at its route.

**R5**

- AC-5.1: Given a template scan, then no invalid text or surface utility class, no imported compiler macro and no eager route component remains.
- AC-5.2: Given a card scan, then no card uses the extra-large radius; the required radius is the large one.
- AC-5.3 (edge): Given a border or height style, then it is expressed through a class, not an inline style.

**R6**

- AC-6.1: Given the feature, when `npm run build` and `npm run lint` run, then both pass.
- AC-6.2 (edge): Given a browser-only check, then the walkthrough marks it Claimed instead of Yes.

## 7. Failure modes and edge cases

- A missing declaration breaks a step at runtime → the build must fail first.
- A wrong nav binding throws silently → the route and the selected tab must agree.
- A reload mid-onboarding loses input → the draft restores step, age and aerobic choice.
- A component receives no props → the visible value must come from a store or a required prop.
- A style fix regresses later → the grep checks run in the feature verification.

## 8. Non-functional requirements

- Performance: routes are lazy; no eager view imports.
- Accessibility / i18n / offline: copy from the catalogs; the full accessibility audit stays on the roadmap.
- Privacy and security: no new data collection.
- Reviewability: corrections are individually verifiable; two open items are visible as unchecked tasks.

## 9. Open questions

None. The two unmet corrections are approved tasks, not questions.

## 10. Assumptions

- A1: The design documents in `design/` are the visual authority; where the code differs and no correction exists, the design wins in a future feature.
- A2: Seven browser checks were not run in this audit; they remain Claimed.
- A3: Accessibility work is excluded here by owner decision (roadmap RM-13).

## 11. Review log

| Date | Reviewer | Mode | Verdict | Blockers resolved |
| ---- | -------- | ---- | ------- | ----------------- |

## 12. Revision log

| Version | Date       | Change      | Reason                                    |
| ------- | ---------- | ----------- | ----------------------------------------- |
| 0.1     | 2026-10-26 | First draft | Reverse spec of the delivered phase-4 UI. |
