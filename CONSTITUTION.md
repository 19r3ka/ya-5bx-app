# CONSTITUTION.md

> Project-specific, non-negotiable principles and quality gates. Keep it to 10 to 20 lines of substance. Global engineering rules (KISS, DRY, config-first, minimal dependencies) live in `AGENTS.md`: do not repeat them here. Every `PLAN.md` is checked against this file. Only the human owner amends it, through a logged decision.

**Version:** 1.0 · **Ratified:** <date> · **Last reviewed:** <date>

## Principles
One short imperative rule each, then one line of why. Keep only what you will actually check.

1. **<Name>.** <Rule>. *Why:* <reason>.

Examples to adapt or delete:
- **Offline-first.** Core flows work without network; sync is an enhancement. *Why:* unreliable connectivity.
- **Data stays local by default.** No third-party analytics or remote storage without a logged decision. *Why:* family and financial data.
- **Mobile-first and accessible.** Design for small screens first; keyboard access and AA contrast. *Why:* phones are the main device.
- **Smallest thing that meets the spec.** No feature, abstraction, or dependency without a requirement that needs it. *Why:* hobby-scale maintenance budget.

## Constraints
- Platform and hosting: <e.g. static hosting, runs on a Raspberry Pi, free tiers only>
- Budget: <...>
- Compatibility: <browsers, devices, locales>
- Data and privacy: <what must never leave the device>

## Quality gates
A task is not done, and a feature is not shippable, until all apply:
- [ ] Tests pass; every acceptance criterion in `SPEC.md` has a test or a recorded manual check
- [ ] Lint and typecheck clean; build succeeds
- [ ] No secrets, debug output, or dead code in the diff
- [ ] `WALKTHROUGH.md` written; `DECISIONS.md` updated for non-obvious choices
- [ ] `SPEC.md` and `PLAN.md` match what was built (or the drift is logged and approved)
- [ ] Reviewer verdict recorded: Cleared or Conditionally cleared

## Governance
- Amend by proposing in chat, pressure-testing, logging in `DECISIONS.md`, then bumping the version above.
- Review this file when each feature closes. Remove principles nobody checks: stale rules get ignored.
- On conflict, this file beats `SPEC.md`, `PLAN.md`, and `TASKS.md`. Agents report conflicts; they never resolve them silently.
