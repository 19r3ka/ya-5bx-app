# Walkthroughs and audit log

Append-only. One entry per agent session, newest first. The agent writes it at the end of the
session; never put a key, token, password or other secret in this file.

## Recurring issues and instruction proposals

| #   | Issue seen                                                                                      | Proposal (owner)                                                        |
| --- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 1   | Local remote-tracking refs were stale; 003 was reported as unpushed after PR #4 had been merged | Run `git fetch --prune` before any status claim, or use `git ls-remote` |
| 2   | sdd-kit `VERSION` is 0.3.0 on an unmerged branch while `main` and the latest tag are v0.2.2     | Tag the 0.3.0 release, or keep `VERSION` at 0.2.2 until it is tagged    |
| 3   | Agent `git push` is denied by the permission policy                                             | Owner pushes the branch and opens the PR                                |

## 2026-10-26 — 007 spec/code reconciliation

- **Agent:** OpenCode / DeepSeek Flash
- **Machine:** pidev
- **Branch:** `feat/007-spec-code-reconciliation`
- **Commit:** `85f782a` (T-015); this audit entry is committed after it.
- **Tasks:** 007 T-001 to T-015; closed 005 T-019/T-020 and 006 T-004/T-008/T-011/T-014 with 007 evidence.
- **Commands (sanitized):** `npm test`; `npm run build`; `npm run lint`; `npx eslint src/`; `npx prettier --check` on changed supported files; `git diff main...HEAD --check`; `grep -rn --include='*.vue'` for `<style scoped`, `:elapsed-seconds`, `style="border`, `rounded="xl"`, `3 Sets · 15 Reps`, `45 Total`; `grep -rn 'currentChart = ref(1)\|currentLevel = ref' src/stores`.
- **Outcome:** Tests 246/246 in 34 files; build, lint and Prettier check pass; six static greps return zero; writable progression grep zero. All 22 `.vue` scoped blocks were migrated; SPEC expected 10, so the +12 difference is finding F-007-1. M-1, M-2 and M-3 are cleared. The DEVICE pass for Lenovo Miixpad, Pixel 8 and Pixel 9 is `BLOCKED`; no visual parity is claimed, and AC-7.1/R7 remain unresolved. C1-C10, R8 and R9 remain deferred. Branch remains local pending the final M-4 review and push.
- **Root cause:** Six defects combined with a stale global stylesheet that was never imported, a timer that accepted per-tick parent state, a setup preview with fixed strings, and an undercounted scoped-style inventory. No physical device was available for the mandatory visual record.
- **Instruction proposals:** Reconcile style-count claims with a fresh grep during planning; predefine the canonical border-class mapping before batch migration; confirm DEVICE access before claiming R7; correct stale 005 approval task IDs and the 006 approval blocker at their source.

## 2026-10-26 — sdd-kit v0.3.0 adoption

- **Agent:** implementing agent / implementing model
- **Machine:** pidev
- **Branch:** `chore/sdd-kit-0.3.0`
- **Commit:** `0e6ba5a` (upgrade)
- **Tasks:** Chore: adopt the sdd-kit 0.3.0 template; add `versions` and this audit log.
- **Commands (sanitized):** `git fetch --prune`; `git switch -c chore/sdd-kit-0.3.0 origin/main`; `npm test`; `npm run build`; `npm run lint`; `git push -u origin chore/sdd-kit-0.3.0` (attempted; denied by the permission policy).
- **Outcome:** `AGENTS.md` §9 now carries the 0.3.0 branch, worktree and push rules, and the stamp is v0.3.0. `README.md` Roadmap points to `specs/ROADMAP.md`. `versions` pins the supported runtime major.minor and Node major. Tests 228/228; build and lint pass; banned names 0; broken links 0; no `src/` change. The branch is local; push and PR are pending owner action.
- **Root cause:** The project was installed from v0.2.2. The 0.3.0 release exists only on the kit's `feat/001-docs-restructure` branch and was never tagged or merged, so the version numbers disagree.
- **Instruction proposals:** Tag kit releases before adopting them; make `git fetch --prune` the first step of any status check.
