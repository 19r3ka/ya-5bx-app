# OUT OF SCOPE

> Capabilities the product deliberately excludes. Kept in one place so they can be compared and reconsidered for future releases without re-reading the whole corpus. This file is not a requirement list: nothing here is planned or approved for build.

**Updated:** 2026-10-26

| Capability                                         | Why it stays out                                                                                   | Source                                                | Reconsider when                                                                        | Status   |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------- | -------- |
| Cloud synchronization of workouts and profile      | The product is offline-first with absolute data sovereignty; no remote copy is allowed.            | `specs/001-baseline/SPEC.md` §4; `CONSTITUTION.md` §1 | The owner changes the data-sovereignty principle through a `CONSTITUTION.md` revision. | Excluded |
| Backend user accounts and server-side sessions     | Authentication would move personal data to a server and contradict the client-only constraint.     | `specs/001-baseline/SPEC.md` §4; `CONSTITUTION.md` §1 | The owner approves a server component in a new spec and updates the constitution.      | Excluded |
| Online social, sharing and multi-user features     | No network dependency is part of the product promise; sharing would expose personal training data. | `specs/001-baseline/SPEC.md` §4                       | A privacy review and an approved spec define exactly what is shared, with consent.     | Excluded |
| Automated remote telemetry, analytics and tracking | The app collects only local post-workout feedback; no third-party transmission is permitted.       | `specs/001-baseline/SPEC.md` §4; `CONSTITUTION.md` §1 | Never as silent collection; any change needs explicit consent and an approved spec.    | Excluded |

## Rules

- Rows are never deleted or renumbered; a capability leaves this register only through an approved spec change.
- Every row cites a source document; no source, no row.
- Review this file at the end of every feature and before any release; record the outcome in the feature walkthrough.
- A reconsidered capability enters `specs/ROADMAP.md` with a source and a roadmap ID before any spec pulls it in.
- This register replaces roadmap rows for permanently excluded work; it does not carry roadmap IDs.
