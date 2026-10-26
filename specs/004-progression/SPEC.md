# SPEC: Progression and session history

**Feature ID:** 004-progression · **Status:** Implemented · **Version:** 0.1 · **Updated:** 2026-10-26

> WHAT and WHY only. Technology and file-level design are in `PLAN.md`. This is a reverse spec of delivered work: every requirement below is proven by the code and tests named in `TASKS.md`, not by intent.

## 1. Goal

Give the user a trustworthy local record of completed sessions and a visible progression position, so training advances on verified effort and never on a lost or unsaved session.

## 2. Context

Phase 3 of the baseline delivered persistence, telemetry sealing, the progression store and the progression map. Later tiers renamed one status and moved two components, which left the original document stale. This spec restates the delivered behavior in the current shape and pins each claim to evidence. The constitution's local-only rule (§1) and deterministic-data rule (§2) are the governing principles.

## 3. Users and scenarios

- User: finishes a workout and states how they feel; the session is stored and later counts toward progression.
- User: opens the progress screen and sees which levels are completed, current, eligible or locked.
- Implementing agent: reads one requirement per behavior and finds the matching test.

## 4. Scope

**In scope**

- Typed session records, the local persistence adapter, the contiguous-volume rule, telemetry staging and sealing.
- The progression store, its hydration barrier and derived position.
- The post-workout capture dialog and the progression map.
- The completion hook that starts the capture flow.

**Out of scope (non-goals)**

- Cloud sync, accounts and remote telemetry; see `specs/OUT_OF_SCOPE.md`.
- Backups and export (roadmap RM-05, RM-10).
- Level-up celebration (roadmap RM-06).
- The workout engine and timer; see `specs/006-production-completion`.

## 5. Requirements

| ID  | Requirement                                                                                                                                | Priority |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| R1  | The system shall persist each completed session as a typed local record with version, token, timestamp, chart, level, duration and status. | Must     |
| R2  | The system shall commit a session atomically and clear the recovery marker only after the storage transaction commits.                     | Must     |
| R3  | The system shall count only contiguous, sealed sessions that match the target chart and level.                                             | Must     |
| R4  | The system shall capture post-workout feedback and seal the record as user-confirmed or conservative.                                      | Must     |
| R5  | The system shall restore progression state before rendering and derive the position from the stored profile.                               | Must     |
| R6  | The system shall render the six-chart by twelve-level map with completed, current, eligible and locked states.                             | Must     |
| R7  | The system shall open the capture flow when the workout engine reports completion.                                                         | Must     |

## 6. Acceptance criteria

**R1**

- AC-1.1: Given a finished session, when it is persisted, then the record carries the version, token, completion time, chart, level and duration fields.
- AC-1.2 (edge): Given a record written by an older schema, when it is read, then missing optional fields do not prevent hydration.

**R2**

- AC-2.1: Given a successful write, when the transaction completes, then the recovery marker is removed only at that point.
- AC-2.2 (edge): Given a transaction that aborts, then the marker survives so recovery can retry.

**R3**

- AC-3.1: Given a history of matching sessions, when volume is calculated, then the count stops at the first non-matching record.
- AC-3.2 (edge): Given a session still pending feedback, when volume is calculated, then it is skipped.

**R4**

- AC-4.1: Given a completed session, when the dialog is shown, then the user can confirm "fine" or "stiff or sore" and the record is sealed accordingly.
- AC-4.2 (edge): Given no answer within sixty seconds, or a dismissal, then the record is sealed conservatively and the user is not blocked.
- AC-4.3 (edge): Given a failed seal write, then the failure is surfaced and the record is not marked as confirmed.

**R5**

- AC-5.1: Given stored profile data, when the store initializes, then the current chart and level match the profile.
- AC-5.2 (edge): Given no stored position, then the first chart and first level are used without inventing a different value.
- AC-5.3 (edge): Given hydration still running, then consumers see an unhydrated state, not a zero position.

**R6**

- AC-6.1: Given hydrated history, when the map renders, then completed, current, eligible and locked levels are distinguishable by text or icon, not colour alone.
- AC-6.2 (edge): Given no history, then every level renders locked except the current one.

**R7**

- AC-7.1: Given a workout reaching completion, when the engine emits the terminal state, then the session is staged and the dialog opens.

## 7. Failure modes and edge cases

- Storage unavailable → the session cannot be sealed; the user sees the failure and the record stays pending.
- Transaction abort → the recovery marker stays; a retry can re-stage the session.
- Dismissed dialog → conservative seal, never a silent loss.
- Corrupt stored history → hydration falls back to an empty history, not a crash.
- Duplicate completion events → one session token per workout prevents double staging.

## 8. Non-functional requirements

- Performance: the map renders after hydration without layout thrash; one dialog timer per session.
- Accessibility / i18n / offline: map states are text-labelled; dialog copy comes from the catalogs; all behavior is offline.
- Privacy and security: data stays on the device; no remote transmission.
- Determinism: volume and positioning are pure functions of stored data.

## 9. Open questions

None.

## 10. Assumptions

- A1: This reverse spec restates delivered behavior; where the phase-3 document and the code disagree, the code and its tests win.
- A2: Manual browser checks were not run for this feature; they are marked Claimed in the walkthrough.

## 11. Review log

| Date | Reviewer | Mode | Verdict | Blockers resolved |
| ---- | -------- | ---- | ------- | ----------------- |

## 12. Revision log

| Version | Date       | Change      | Reason                                  |
| ------- | ---------- | ----------- | --------------------------------------- |
| 0.1     | 2026-10-26 | First draft | Reverse spec of delivered phase-3 work. |
