# SPEC: <Feature name>

**Feature ID:** NNN-<slug> · **Status:** Draft | Reviewed | Approved | Implemented · **Version:** 0.1 · **Updated:** <date>

> WHAT and WHY only. No frameworks, libraries, file names, or schemas: those belong in `PLAN.md`. Every requirement and criterion has an ID so tasks and tests can cite it. A spec with open questions is not Approved.

## 1. Goal
<One sentence: what this achieves and for whom.>

## 2. Context
<Why now, 2 to 4 lines. Prior attempts. Constitution principles that matter here.>

## 3. Users and scenarios
- <User type>: <what they want to accomplish, in one line>

## 4. Scope
**In scope**
- <deliverable>

**Out of scope (non-goals)**
- <exclusion, and why>

## 5. Requirements
One observable, testable behavior per row.

| ID | Requirement | Priority |
|----|-------------|----------|
| R1 | The system shall <behavior> | Must |
| R2 | When <event>, the system shall <response> | Should |

Priority: Must / Should / Could.

## 6. Acceptance criteria
Given / When / Then, with concrete values. Include at least one edge or failure case per Must requirement.

**R1**
- AC-1.1: Given <state>, when <action>, then <observable result>.
- AC-1.2 (edge): Given <empty / invalid / limit state>, when <action>, then <result>.

## 7. Failure modes and edge cases
- <what can go wrong> → <required behavior>

## 8. Non-functional requirements
- Performance: <measurable target or "n/a">
- Accessibility / i18n / offline: <...>
- Privacy and security: <...>

## 9. Open questions
- [ ] Q1 [NEEDS CLARIFICATION]: <question> · Owner: <who decides>

## 10. Assumptions
- A1: <assumption> · Risk if wrong: <...>

## 11. Review log
| Date | Reviewer | Mode | Verdict | Blockers resolved |
|------|----------|------|---------|-------------------|

## 12. Revision log
| Version | Date | Change | Reason |
|---------|------|--------|--------|
