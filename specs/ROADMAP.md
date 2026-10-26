# ROADMAP: YA-5BX

**Scope:** Target capabilities not yet built, grouped by the feature that owns them. Items here are not part of the 001-baseline acceptance criteria. Each item moves to a feature spec when its phase starts.

**Status key:** Target (not started) · Blocked (waiting on an open question or decision) · Satisfied (delivered by another phase)

| ID    | Capability                                                               | Spec reference                         | Plan phase | Blocked by | Status                                    |
| ----- | ------------------------------------------------------------------------ | -------------------------------------- | ---------- | ---------- | ----------------------------------------- |
| RM-01 | McMaster HIIT selection: strategy UI and default                         | R3, AC-3.2, Goal, Scope                | 5          | D-007      | Blocked                                   |
| RM-02 | Automatic pause when the page is hidden or loses focus                   | R4, AC-4.4                             | 2          | D-005      | Target                                    |
| RM-03 | Screen Wake Lock during active workouts, with no-op where unsupported    | R4b, Constitution §5                   | 2          | D-005      | Target                                    |
| RM-04 | Rename `TelemetryService` to match Constitution §1                       | R5, Constitution §1                    | 5          | D-006      | Blocked                                   |
| RM-05 | Periodic backup prompt, JSON export, and `.tcx` export                   | R7, AC-7.1, AC-7.2                     | 4          | Q1         | Blocked                                   |
| RM-06 | Gamified level-up celebration                                            | R6, AC-6.2                             | 5          | Q2         | Blocked                                   |
| RM-07 | Redirect unknown URLs to the dashboard                                   | AC-1.2                                 | 1          | None       | Implemented (002, pending review)         |
| RM-08 | Guarded storage writes with user-visible errors                          | AC-2.3, Constitution §1                | 1          | None       | Implemented (002, pending review)         |
| RM-09 | Invalid-input fallback and error banner for workout generation           | AC-3.3                                 | 1          | None       | Implemented (002, pending review)         |
| RM-10 | Backup import with schema validation and rejection                       | AC-5.3                                 | 4          | D-004      | Blocked                                   |
| RM-11 | Pre-workout health screening and acknowledgment gate                     | R11, AC-11.1                           | 5          | Q3, D-009  | Blocked                                   |
| RM-12 | Automated test suite                                                     | Constitution quality gates 2 and 7     | 3          | None       | Satisfied (characterization suite, D-002) |
| RM-13 | Accessibility audit and fixes: focus, accessible names, non-color status | R10, AC-10.1, AC-10.2, Constitution §6 | 6          | None       | Target                                    |

## Open questions and decisions referenced

- **Q1:** Backup reminder frequency (SPEC §8).
- **Q2:** Celebration theme and reward sequence (SPEC §8).
- **Q3:** Health screening criteria and disclaimers (SPEC §8).
- **D-004:** Storage schema versioning, to write before Phase 4.
- **D-005:** Background pause and wake lock policy, to write before Phase 2.
- **D-006:** Telemetry naming and scope, to write before Phase 5.
- **D-007:** Default strategy and selection rules, to write before Phase 5.
- **D-008:** Invalid-input fallback policy, to write before Phase 1.
- **D-009:** Health screening gate design, to write before Phase 5.

## Not on this roadmap

- **Legacy timer alignment** (`useTimer.ts`, AC-4.1). This is an open finding in PLAN §11.2, to be resolved in Phase 2 planning. It becomes a roadmap item only if the owner decides to keep the legacy timer.
- **Cloud sync, accounts, social features, remote telemetry.** Out of scope permanently (SPEC §4).
