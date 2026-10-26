# ROADMAP

> Target items for this project: wanted or documented, not built. Nothing here is a requirement until a feature spec pulls it in by ID. Agents never implement from this file. One line per item. Reviewed at the end of every feature.

**Updated:** 2026-10-26

| ID    | Description                                                              | Source                                               | Status  | Pulled into                            |
| ----- | ------------------------------------------------------------------------ | ---------------------------------------------------- | ------- | -------------------------------------- |
| RM-01 | McMaster HIIT selection: strategy UI and default                         | SPEC R3, AC-3.2; D-007                               | Target  | -                                      |
| RM-02 | Automatic pause when the page is hidden or loses focus                   | SPEC R4, AC-4.4; D-005                               | Target  | -                                      |
| RM-03 | Screen Wake Lock during active workouts, no-op where unsupported         | SPEC R4b; Constitution §5; D-005                     | Target  | -                                      |
| RM-04 | Rename the telemetry service to match Constitution §1                    | SPEC R5; Constitution §1; D-006                      | Target  | -                                      |
| RM-05 | Periodic backup prompt, JSON export and `.tcx` export                    | SPEC R7, AC-7.1, AC-7.2; Q1                          | Target  | -                                      |
| RM-06 | Gamified level-up celebration                                            | SPEC R6, AC-6.2; Q2                                  | Target  | -                                      |
| RM-07 | Redirect unknown URLs to the dashboard                                   | SPEC AC-1.2                                          | Built   | `specs/002-gap-closure` (R1, AC-1.2)   |
| RM-08 | Guarded storage writes with user-visible errors                          | SPEC AC-2.3; Constitution §1                         | Built   | `specs/002-gap-closure` (R2, AC-2.3)   |
| RM-09 | Invalid-input fallback and error banner for workout generation           | SPEC AC-3.3                                          | Built   | `specs/002-gap-closure` (R3, AC-3.3)   |
| RM-10 | Backup import with schema validation and rejection                       | SPEC AC-5.3; D-004                                   | Target  | -                                      |
| RM-11 | Pre-workout health screening and acknowledgment gate                     | SPEC R11, AC-11.1; Q3, D-009                         | Target  | -                                      |
| RM-12 | Automated test suite                                                     | Constitution quality gates 2 and 7; D-002            | Built   | `specs/001-baseline` (T-007 to T-037)  |
| RM-13 | Accessibility audit and fixes: focus, accessible names, non-color status | SPEC R10, AC-10.1, AC-10.2; Constitution §6          | Target  | -                                      |
| RM-14 | Self-driven workout timer without reactive prop thrashing                | `specs/006-production-completion/SPEC.md` R4, AC-4.1 | Planned | `specs/006-production-completion` (R4) |
| RM-15 | Workout setup lists exercises from the current chart and level           | `specs/006-production-completion/SPEC.md` R3, AC-3.5 | Planned | `specs/006-production-completion` (R3) |

Status values: Target (wanted, not built) · Planned (pulled into a spec, not built) · Built (specs/NNN-slug) · Dropped (reason).

## Rules

- Add a row only with a source. No source, no row.
- To plan an item, name its ID in a spec's Scope. Set Planned and cite the spec requirement (`R#`) and feature folder in "Pulled into".
- After the feature ships and is verified, set Built and link the folder.
- Never delete or renumber rows; never reuse an ID.
- Capabilities excluded from the product go to `specs/OUT_OF_SCOPE.md`, not here.
