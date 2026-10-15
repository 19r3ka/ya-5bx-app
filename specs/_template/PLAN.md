# PLAN: <Feature name>

**Feature ID:** NNN-<slug> · **Spec version:** x.y · **Status:** Draft | Reviewed | Approved · **Updated:** <date>

> HOW. Must satisfy every Must requirement in `SPEC.md` and pass the constitution check. Reuse before building. If the spec is ambiguous, raise a spec bug; do not guess in the plan.

## 1. Approach summary
<3 to 5 lines: the chosen approach and why it is the simplest one that meets the spec.>

## 2. Constitution check
| Principle / constraint | How this plan satisfies it | Status |
|------------------------|----------------------------|--------|
| <name> | <...> | OK / Violation (justify in DECISIONS.md) |

## 3. Reuse audit
| Asset (library, component, existing code) | Covers | Gap |
|-------------------------------------------|--------|-----|

New dependencies need a `DECISIONS.md` entry.

## 4. Architecture
```text
<ASCII sketch: components and data flow>
```
Components: <name>: <responsibility>, <folder>.

## 5. Data model
<Entities, fields, relationships, storage, validation rules. Migration notes if existing data changes.>

## 6. Interfaces and contracts
<Function and composable signatures, store actions, routes, events, file formats: inputs, outputs, errors.>

## 7. File changes
| Path | New / Modified | Purpose |
|------|----------------|---------|

## 8. Test strategy
Every acceptance criterion maps to a row. Manual checks list exact steps.

| Criterion | Test type (unit / component / e2e / manual) | Location |
|-----------|---------------------------------------------|----------|
| AC-1.1 | unit | <path> |

## 9. Risks and mitigations
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|

## 10. Key decisions
Link `DECISIONS.md` entries: D-0xx, D-0yy.

## 11. Phases
| Phase | Shippable deliverable | Requirements covered |
|-------|-----------------------|----------------------|

## 12. Revision log
| Version | Date | Change | Reason |
|---------|------|--------|--------|
