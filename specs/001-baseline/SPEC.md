# SPEC: YA-5BX Application Baseline and Roadmap

**Feature ID:** 001-baseline · **Status:** Implemented · **Version:** 2.2 · **Updated:** 2026-10-16

## 1. Goal

Provide an individual with an offline-first, time-efficient daily fitness routine based on the Royal Canadian Air Force (RCAF) 5BX principles, featuring high-precision interval timing, local progression history, periodic backup prompts, and a localized English/French interface.

## 2. Context

- **Product Vision:** An offline-first personal fitness companion ensuring absolute data sovereignty, robust local persistence for workout sessions and lightweight profile metadata, and seamless execution without internet or cloud dependencies.
- **Governance:** Operates strictly under the rules and quality gates of `CONSTITUTION.md`.

## 3. Users and Scenarios

- **New User:** Completes the six-step onboarding wizard specifying age bracket, target chart, and preferred aerobic option.
- **Active Exerciser:** Executes daily workouts using the classic 5BX strategy, following timed intervals, pause/resume controls, and gated repetition confirmation checkpoints.
- **Returning User:** Reviews progress against age-based RCAF session-volume rules and manages periodic local backups.

## 4. Scope

**In Scope (As-Built & Implemented)**

- Onboarding presented as a 6-step flow on `/onboarding` (age, goal chart, aerobic choice, tutorial, ready steps).
- Dashboard and lazy-loaded routes for setup, active workout, progress, and settings.
- Classic RCAF 5BX workout generation strategy using versioned RCAF 5BX Official Tables v1.0.
- High-precision interval timing, pause/resume, repetition confirmation rest gates, and workout lifecycle management.
- Local session persistence and post-workout feedback staging via TelemetryService.
- Progression eligibility validation based on versioned RCAF Tables v1.0 age thresholds and stiffness/soreness restriction flags.
- English and French localized catalogs with hardcoded strings in selected components.
- Responsive web UI and progressive web app offline installation configuration.

**In Scope (Target Capabilities — Unbuilt/In-Progress)**

- **McMaster HIIT Strategy:** Alternative workout generation strategy as an optional safe routine.
- **Gamified Automatic Progression:** Automated celebration animation and level update when progression eligibility is confirmed.
- **WhatsApp-Style Periodic Backups:** Periodic user reminders to export local data backups, paired with lossless JSON import/export and file export.
- **Screen Wake Lock:** Prevent display sleep during active workouts (Constitution §5).
- **Pre-Workout Health Screening:** Health screening and acknowledgment gate prior to workout execution.

**Out of Scope (Non-Goals)**

- Cloud synchronization, backend user accounts, online social/multi-user features, and automated remote telemetry.

- See [ROADMAP.md](../ROADMAP.md) for planned target capabilities.

## 5. Requirements

| ID  | Requirement                                                                                                                                                                   | Priority | Status                                                                                                                                                                       |
| :-- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | The application shall expose dashboard, onboarding, workout setup, active workout, progress, and settings routes.                                                             | Must     | As-Built                                                                                                                                                                     |
| R2  | The application shall collect onboarding choices, persist drafts locally, and store structured workout sessions locally.                                                      | Must     | As-Built                                                                                                                                                                     |
| R3  | The application shall generate timed workouts from chart, level, aerobic selection, and versioned RCAF datasets (v1.0), supporting classic 5BX.                               | Must     | As-Built (Classic) / Target (McMaster)                                                                                                                                       |
| R4  | The application shall enforce high-precision interval timing, pause/resume, repetition confirmation, finish, and abandon.                                                     | Must     | As-Built                                                                                                                                                                     |
| R4b | The application shall enforce Screen Wake Lock during active workouts.                                                                                                        | Must     | Target (Constitution §5)                                                                                                                                                     |
| R5  | The application shall persist completed workout records locally and stage local post-workout feedback via TelemetryService (note: name must change to match Constitution §1). | Must     | As-Built                                                                                                                                                                     |
| R6  | The application shall evaluate progression eligibility automatically from versioned RCAF 5BX v1.0 age-based session-volume rules and enforce stiffness restrictions.          | Must     | As-Built (Validator) / Target (Gamification)                                                                                                                                 |
| R7  | The application shall prompt users periodically to export local backups and support lossless JSON import/export and export.                                                   | Must     | Target                                                                                                                                                                       |
| R8  | The application shall provide English and French localization.                                                                                                                | Must     | Partially implemented (Gap: hardcoded strings in src/components/onboarding/Step1Hook.vue, src/components/onboarding/Step6Ready.vue, src/components/common/AppHelpDialog.vue) |
| R9  | The application shall operate as an installable, responsive Progressive Web App with complete offline asset caching.                                                          | Must     | As-Built (PWA Config) / UNVERIFIED (Offline Behavior)                                                                                                                        |
| R10 | The application shall support keyboard navigation, accessible control names, and avoid color-only status communication per Constitution §6.                                   | Must     | UNVERIFIED                                                                                                                                                                   |
| R11 | The application shall enforce pre-workout health screening and an acknowledgment gate.                                                                                        | Must     | Target — decision needed                                                                                                                                                     |

## 6. Acceptance Criteria

### R1: Routing & Navigation

- **AC-1.1:** Given the route table, when navigating to `/`, `/onboarding`, `/workout-setup`, `/workout`, `/progress`, or `/settings`, then the corresponding view component is rendered.
- **AC-1.2 (edge):** Given an unhandled route URL, when navigation occurs, then the application gracefully redirects to the dashboard root. (Status: Target)

### R2: Profile & Session Persistence

- **AC-2.1:** Given saved profile data, when the user store initializes, then state is hydrated; malformed JSON is caught and ignored.
- **AC-2.2:** Given completion of the 6-step onboarding wizard, when saved, then the completed profile is saved locally and draft keys are removed.
- **AC-2.3:** Given storage write failures or quota exceptions, when writing to storage, then errors are caught and handled safely. (Status: Target)

### R3: Workout Generation Strategies

- **AC-3.1:** Given a valid chart and level from RCAF Tables v1.0, when generating via the classic strategy, then four repetition intervals and one aerobic interval are created.
- **AC-3.2:** Given the McMaster HIIT strategy selected, when generation runs, then the alternative safe interval sequence is constructed. (Status: Target)
- **AC-3.3 (edge):** Given an invalid or missing chart/level key, when strategy generation fails, then the system displays an explicit error banner in the UI and falls back safely to Chart 1, Level D- without corrupting state. (Status: Target)

### R4: Timer & Lifecycle Engine

- **AC-4.1:** Given an active session, elapsed time must be derived from monotonic clock measurements rather than accumulated interval callbacks.
- **AC-4.2:** Given a running session, when paused and resumed, elapsed active time excludes pause duration.
- **AC-4.3:** Given a gated exercise boundary, when reached, the timer holds at rest until repetition confirmation is registered. (Status: UNVERIFIED)
- **AC-4.4:** Given the document becoming hidden or unfocused, when a workout is active, then the session automatically pauses to prevent timing drift and unsafe background execution. (Status: Target)

### R5: Local Storage & Backup Integrity

- **AC-5.1:** Given a completed workout, when committed, then it is written to the IndexedDB sessions store keyed by session token.
- **AC-5.2:** Given post-workout feedback submission, when staged via TelemetryService, then stiffness flags and status indicators are saved locally without external transmission.
- **AC-5.3:** Given an imported backup file, when processed, then invalid or schema-incompatible files are rejected and blocked without modifying existing stored data. (Status: Target)

### R6: Progression & Gamified Advancement

- **AC-6.1:** Given age-specific rules in RCAF Tables v1.0, when validation runs, then required session volume is compared against contiguous verified sessions.
- **AC-6.2:** Given progression eligibility criteria are met, when confirmed, then the system triggers a gamified level-up celebration animation and automatically updates the user's current chart/level state. (Status: Target)
- **AC-6.3:** Given a stiffness/soreness flag, when validation runs, then progression is restricted and required volume thresholds are increased.

### R7: WhatsApp-Style Backup Prompts

- **AC-7.1 [Blocked by Q1]:** Given active usage reaching backup thresholds defined by Q1, the application shall display a periodic prompt reminding the user to export a local backup. (Status: Target)
- **AC-7.2:** Given an export request, the application shall generate a lossless JSON backup payload as well as a sports export. (Status: Target)

### R8, R9, R10, & R11: Localization, Offline PWA, Accessibility, and Health Screening

- **AC-8.1:** Given language configuration, French is default and English is fallback.
- **AC-9.1:** Given initial PWA caching, the application launches and executes fully without an active internet connection. (Status: UNVERIFIED)
- **AC-10.1:** Given keyboard navigation, all controls are reachable via tab focus with visible focus outlines and proper ARIA names. (Status: UNVERIFIED)
- **AC-10.2:** Status indicators incorporate text or icon labels alongside color changes. (Status: UNVERIFIED)
- **AC-11.1:** Given startup of a workout session, the user must pass a health screening acknowledgment gate before exercises begin. (Status: Target)

## 7. Non-Functional Requirements

- **Performance:** UNVERIFIED: no budget in repo. Define one or remove.
- **Privacy & Sovereignty:** 100% on-device data containment; local feedback and backups remain strictly client-side.

## 8. Open Questions [NEEDS CLARIFICATION]

- **Q1 [NEEDS CLARIFICATION]:** What exact usage frequency threshold (e.g., every 7 completed workouts or every 14 calendar days) should trigger the WhatsApp-style backup reminder prompt? · _Owner: Product Owner_
- **Q2 [NEEDS CLARIFICATION]:** What specific visual celebration theme or reward sequence should accompany the gamified automatic progression level-up? · _Owner: UX Designer / Product Owner_
- **Q3 [NEEDS CLARIFICATION]:** What exact disclaimers and health screening criteria must be included in the pre-workout health screening acknowledgment gate? · _Owner: Product Owner_

## 9. Assumptions

- **A1:** Users have local file upload/download access on their browsers to support backup import and export workflows.
- **A2:** Browser storage quotas on modern mobile devices are sufficient for multi-year workout logs in IndexedDB.

## 10. Known Risks

- Progression depends entirely on user self-report; the app does not verify session completion or physical effort.
- The app does not verify session completion beyond user interaction.
- The app does not screen for medical conditions before workouts.
  _(Each item is a known limitation, not a control.)_

## 11. Review Log

| Date | Reviewer | Mode | Verdict | Blockers resolved |
| :--- | :------- | :--- | :------ | :---------------- |

## 12. Revision log

| Version | Date       | Reviewer              | Mode                    | Verdict                                | Notes                                |
| :------ | :--------- | :-------------------- | :---------------------- | :------------------------------------- | :----------------------------------- |
| 2.0     | 2026-10-16 | Architect / Reviewer  | Consolidated Spec       | Cleared                                | Merged baseline and target features. |
| 2.1     | 2026-10-16 | Code conformance pass | Snapshot reconciliation | Conformed with UNVERIFIED items listed | Target items moved to ROADMAP.md.    |
| 2.2     | 2026-10-26 | Documentation pass    | Status normalization    | Implemented                            | No requirement change.               |
