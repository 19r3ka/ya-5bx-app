# SPEC: Specification corpus alignment

**Feature ID:** 003-specs-align · **Status:** Implemented · **Version:** 0.1 · **Updated:** 2026-10-26

> WHAT and WHY only. Technology and file-level design are in `PLAN.md`. Every requirement and criterion has an ID so tasks and tests can cite it.

## 1. Goal

Make `specs/` a single, evidence-backed SDD corpus that follows the current kit conventions, so that any agent can work from it without trusting stale prose.

## 2. Context

The repository began on kit 0.2.2 and now runs kit 0.3.0. Three loose phase folders (`specs/phase3`, `phase4`, `phase5`) predate the `NNN-slug` feature layout and mix delivered work with open items. An audit on 2026-10-26 found that several claims are stale or unproven:

- `phase5` T2-1 and T1-5 are not implemented, although the surrounding tiers are.
- `phase4` corrections P2-2 and P2-3 fail their own checklist.
- `phase3` names files and a telemetry status that later tasks replaced.
- Manual browser/IndexedDB/PWA checks were never run, yet surrounding tasks read as complete.

The existing 001 and 002 features are close to the kit shape but carry stale status fields and vendor product names.

## 3. Users and scenarios

- Implementing agent: opens one feature folder and finds the spec, the plan, the ordered tasks and the evidence without reading four legacy documents.
- Owner: reads the roadmap to see what is built, planned or dropped, with a source for every row.
- Reviewer: checks a claimed status against a cited test or command instead of prose.

## 4. Scope

**In scope**

- `specs/ROADMAP.md` in the current kit schema, with the same rule IDs plus rows for open work that already has a source.
- Conversion of `specs/phase3`, `specs/phase4`, `specs/phase5` into `specs/004-progression`, `specs/005-ux-implementation` and `specs/006-production-completion`, each with `SPEC.md`, `PLAN.md`, `TASKS.md` and `WALKTHROUGH.md`.
- Truthful status in every converted task, backed by the 2026-10-26 audit evidence.
- Hygiene of the whole `specs/` tree: status fields, stale artefact references, vendor product names, emoji headings, dead links.
- `D-012` in `DECISIONS.md`: mapping, numbering and the no-rewrite rule.
- Removal of the junk file `specs/phase5/phase5-specs.md:Zone.Identifier` and of the emptied phase folders.

**Out of scope (non-goals)**

- Any change under `src/`, `package.json`, the test suite or CI. Open code gaps found by the audit are recorded as tasks, not fixed here.
- Changes to `CONSTITUTION.md`, `AGENTS.md` or the kit repository. The `AGENTS.md` version stamp stays at 0.2.2.
- Translating the design documents; they remain in English and move unchanged except for banned product names.
- Splitting requirements by capability: one feature per historical phase is the chosen structure.

## 5. Requirements

| ID  | Requirement                                                                                                                                   | Priority |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| R1  | The roadmap shall use the kit 0.3.0 schema: five columns, four status values, one source per row, and stable rule IDs.                        | Must     |
| R2  | Each historical phase document shall become one feature folder with the four kit files, and its detailed design content shall be preserved.   | Must     |
| R3  | Every task marked done in a converted feature shall cite code and a passing check; unverified checks shall stay open and be marked claimed.   | Must     |
| R4  | The `specs/` tree shall contain no vendor product names, no emoji headings, no stale artefact references, and true status and version fields. | Must     |
| R5  | Finished task text in the existing 001 and 002 features shall not be rewritten.                                                               | Must     |
| R6  | The phase folders and the junk stream file shall be gone, with no link left pointing at them.                                                 | Must     |
| R7  | Every new feature shall trace requirements to criteria and tasks, and the roadmap shall name the feature that pulls each item in.             | Must     |

## 6. Acceptance criteria

**R1**

- AC-1.1: Given `specs/ROADMAP.md`, when its header row is read, then it is `ID | Description | Source | Status | Pulled into`, and every status value is one of Target, Planned, Built, Dropped.
- AC-1.2 (edge): Given a delivered item such as RM-07, when its row is read, then the status is Built and "Pulled into" cites `specs/002-gap-closure` with the criterion ID.
- AC-1.3 (edge): Given an open item such as the self-driven timer, when its row is read, then the status is Planned and "Pulled into" cites `specs/006-production-completion` with a requirement ID.

**R2**

- AC-2.1: Given the repository after the feature, when the `specs/` directory is listed, then `004-progression`, `005-ux-implementation` and `006-production-completion` each contain `SPEC.md`, `PLAN.md`, `TASKS.md` and `WALKTHROUGH.md`.
- AC-2.2: Given the same listing, when the design material is inspected, then the original phase documents and the phase-4 mockups exist under the owning feature's `design/` folder, and `specs/phase3`, `specs/phase4`, `specs/phase5` do not exist.
- AC-2.3 (edge): Given an item that was never delivered, when the converted feature is read, then it appears as an unchecked task and as a requirement or criterion in that feature's `SPEC.md`.

**R3**

- AC-3.1: Given any task marked done in 004, 005 or 006, when it is read, then its Notes cite a code path and a test file or a command whose output proves it.
- AC-3.2 (edge): Given a browser, IndexedDB or PWA check that no test covers, when the feature is read, then the criterion is marked Claimed in `WALKTHROUGH.md`, not Yes, and the task stays unchecked or is explicitly flagged.
- AC-3.3 (edge): Given the phase-3 conversion, when its paths are read, then they name the current files (`components/workout/PostWorkoutDialog.vue`, `components/progress/ProgressionMapGrid.vue`) and the current status `SEALED_USER_CONFIRMED`, not the superseded ones.

**R4**

- AC-4.1: Given `specs/` after the feature, when a case-insensitive search for the kit's banned product names runs over its markdown, then there are zero matches.
- AC-4.2: Given `specs/002-gap-closure`, when its headers are read, then the spec and plan statuses reflect the merged state, the walkthrough task range is T-01 to T-15, and no note points at a temporary path or a draft file.
- AC-4.3 (edge): Given any markdown link in `specs/`, when it is resolved, then its target file exists.

**R5**

- AC-5.1: Given the 001 and 002 task files, when their diff is reviewed, then no task line or task body has changed; only header fields, status lines and appended notes differ.

**R6**

- AC-6.1: Given the repository after the feature, when `specs/phase5` is inspected, then the `:Zone.Identifier` file and the folder itself are absent.
- AC-6.2: Given the same repository, when markdown links are resolved, then no link targets a removed phase folder and the only other mentions are historical.

**R7**

- AC-7.1: Given each new feature's `TASKS.md`, when the coverage matrix is read, then every requirement is mapped to at least one task and every task cites at least one R or AC ID.
- AC-7.2: Given `DECISIONS.md`, when D-012 is read, then it records the phase-to-feature mapping, the numbering, the design-carrier rule and the no-rewrite rule.

## 7. Failure modes and edge cases

- A move leaves a relative link broken → the link check in `PLAN.md` section 8 fails the task.
- A design document repeats a banned product name → replace it with a role or project reference before the move is committed.
- A converted task cannot be proven → leave it unchecked and record the missing evidence; never copy a tick.
- The roadmap gains a row without a source → reject the row; every row needs a source per R1.
- 001/002 task text drifts while fixing headers → R5 diff check fails the task.

## 8. Non-functional requirements

- Performance: n/a; documentation only.
- Accessibility / i18n / offline: n/a; no user-facing copy changes.
- Privacy and security: no secrets, no personal data; the corpus stays local to the repository.
- Reviewability: the change is documentation-only; `git diff main...HEAD -- src/` must be empty.
- Determinism: every check is a shell command with a pass condition, not a judgement call.

## 9. Open questions

None. Blockers from the intake were answered on 2026-10-26.

## 10. Assumptions

- A1: The reconciliation is its own feature, `003-specs-align`; the phases become 004, 005 and 006. Risk if wrong: renumbering touches every new link.
- A2: A `design/` subfolder inside a feature is acceptable for detailed design and mockups, with the four kit files as the working surface. Risk if wrong: design material has to move again.
- A3: The owner's instruction to reconcile `specs/` authorizes status and header edits in existing `SPEC.md` files, limited to R4 and R5. Risk if wrong: the edits must be reverted.
- A4: Evidence means a code path plus a test or command verified on 2026-10-26 against `main` at `8a21f60`. Risk if wrong: claims need re-verification.

## 11. Review log

| Date | Reviewer | Mode | Verdict | Blockers resolved |
| ---- | -------- | ---- | ------- | ----------------- |

## 12. Revision log

| Version | Date       | Change      | Reason                                                    |
| ------- | ---------- | ----------- | --------------------------------------------------------- |
| 0.1     | 2026-10-26 | First draft | Reconcile the phase documents into the current kit shape. |
