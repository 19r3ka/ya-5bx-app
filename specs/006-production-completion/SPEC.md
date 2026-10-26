# SPEC: Production completion

**Feature ID:** 006-production-completion · **Status:** Implemented with open items · **Version:** 0.1 · **Updated:** 2026-10-26

> WHAT and WHY only. Technology and file-level design are in `PLAN.md`. This is a reverse spec of the phase-5 production pass: it states the integrity, wiring, performance, styling and delivery guarantees, and it names the four items that are not fully met.

## 1. Goal

Make the app safe to trust and ready to ship: a session is either persisted or recoverable, every screen reads one canonical state, the clock does not re-render the tree, styling comes from one system, and the app installs and deploys as a versioned offline package.

## 2. Context

Phase 5 was the production pass over a working prototype. It fixed a write-ahead-log race, excluded unverified sessions from progression, made the profile the single source of position, wired the views to the stores and the engine, and added PWA and release automation. The 2026-10-26 audit found twelve items fully met, two partly met and two not met. The original plan is preserved in `design/`.

## 3. Users and scenarios

- User: finishes a workout, closes the app, and finds the session intact or recoverable on return.
- User: installs the app and uses it offline; updates arrive without losing data.
- Maintainer: tags a release without the deploy job writing back to the branch it deployed.
- Reviewer: sees exactly which production guarantees are proven and which are not.

## 4. Scope

**In scope**

- Storage atomicity and recovery, the status vocabulary, progression counting.
- Canonical position, onboarding completion payload, app bootstrap.
- Store wiring for dashboard, setup, active workout and progress.
- Clock performance, the post-workout seal lifecycle, navigation state.
- Global stylesheet, PWA manifest and icons, release/deploy workflow split.

**Out of scope (non-goals)**

- New product features; the roadmap owns those.
- Cloud, accounts and telemetry; see `specs/OUT_OF_SCOPE.md`.
- Accessibility audit; roadmap RM-13.
- UI corrections from phase 4; see `specs/005-ux-implementation`.

## 5. Requirements

| ID  | Requirement                                                                                                                                 | Priority |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| R1  | Persistence shall commit atomically, clear the recovery marker only after commit, and never lose a session silently.                        | Must     |
| R2  | Progression position shall derive from the stored profile; onboarding shall store a complete position; unverified sessions shall not count. | Must     |
| R3  | Every screen shall read live store and engine state instead of hardcoded values, and every exercise level shall render from chart data.     | Must     |
| R4  | A one-hertz clock shall not propagate updates to the parent tree.                                                                           | Must     |
| R5  | Styling shall come from the design system: no framework boilerplate, no colour or border rules hidden in component scopes.                  | Must     |
| R6  | The build shall be installable offline with a valid manifest, icons and service worker, and releases shall not mutate the deployed branch.  | Must     |

## 6. Acceptance criteria

**R1**

- AC-1.1: Given a successful write, when the transaction completes, then the recovery markers are cleared only at commit.
- AC-1.2 (edge): Given an abort, then the marker survives and the session is recoverable.
- AC-1.3 (edge): Given a dismissed dialog, then the session is sealed conservatively; given a failed seal, then a retry is surfaced and the record stays pending.

**R2**

- AC-2.1: Given a stored profile position, when the app hydrates, then chart and level match it.
- AC-2.2: Given onboarding completion, then the profile contains a current level and a goal level.
- AC-2.3 (edge): Given a pending session, then contiguous volume ignores it.
- AC-2.4 (edge): Given no stored position, then the default first chart and grade are used.

**R3**

- AC-3.1: Given hydrated stores, then the dashboard shows the profile name, chart, level, progress, streak and remaining sessions from computed values.
- AC-3.2: Given a workout start, then the engine receives the current chart, level and aerobic choice.
- AC-3.3: Given the active screen, then pause, resume and completion follow the engine snapshot.
- AC-3.4 (edge): Given the progress screen, then the map receives current, goal and completed level IDs.
- AC-3.5 (edge): Given the setup screen, then the exercise list and rep targets come from the current chart and level, not fixed numbers.

**R4**

- AC-4.1: Given an interval, then the clock updates locally at one hertz without changing a prop each tick.
- AC-4.2 (edge): Given an interval boundary, then only the static start and duration inputs change.

**R5**

- AC-5.1: Given the global stylesheet, then it contains the app classes and no framework template styles.
- AC-5.2 (edge): Given a colour or border rule, then it lives in the global sheet, not in a component scope.

**R6**

- AC-6.1: Given a production build, then the manifest, icons and service worker are present and the app loads offline after first visit.
- AC-6.2 (edge): Given a push to the release branch, then versioning and deployment run as separate jobs and deployment depends on release.

## 7. Failure modes and edge cases

- Transaction aborts after the request succeeds → marker must survive; the request callback must not clear it.
- App killed before feedback → the record stays pending, is excluded from volume, and recovery offers it on boot.
- Seal write fails → the dialog keeps the record pending and shows a retry.
- Stored position undefined → the default position is used and onboarding writes a complete one.
- Hardcoded screen values → the audit greps must catch them before merge.
- Scope-creep styling → scoped blocks return; a scan must catch them.
- Deploy runs before release → the workflow must gate deployment on the release job.

## 8. Non-functional requirements

- Performance: one clock update per second affects the clock only.
- Accessibility / i18n / offline: copy from catalogs; the app works offline after first load.
- Privacy and security: no remote transmission; the service worker caches only local assets.
- Release safety: no workflow writes to the branch it deploys.

## 9. Open questions

- Should the remaining scoped colour/border rules move to the global sheet (phase-5 T3-1), or is the 005 design-system rule the newer authority? Owner decision before T-014 is closed.

## 10. Assumptions

- A1: The phase-5 document is the production authority; phase-4 corrections that landed later may supersede a clause, and such conflicts are recorded, not silently resolved.
- A2: Browser checks (offline install, tab kill, IndexedDB inspection) were not run in this audit; they are Claimed.

## 11. Review log

| Date | Reviewer | Mode | Verdict | Blockers resolved |
| ---- | -------- | ---- | ------- | ----------------- |

## 12. Revision log

| Version | Date       | Change      | Reason                                         |
| ------- | ---------- | ----------- | ---------------------------------------------- |
| 0.1     | 2026-10-26 | First draft | Reverse spec of the delivered production pass. |
