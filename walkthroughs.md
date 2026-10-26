# Walkthroughs and audit log

Append-only. One entry per agent session, newest first. The agent writes it at the end of the
session; never put a key, token, password or other secret in this file.

## Recurring issues and instruction proposals

| #   | Issue seen                                                                                      | Proposal (owner)                                                        |
| --- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 1   | Local remote-tracking refs were stale; 003 was reported as unpushed after PR #4 had been merged | Run `git fetch --prune` before any status claim, or use `git ls-remote` |
| 2   | sdd-kit `VERSION` is 0.3.0 on an unmerged branch while `main` and the latest tag are v0.2.2     | Tag the 0.3.0 release, or keep `VERSION` at 0.2.2 until it is tagged    |
| 3   | Agent `git push` is denied by the permission policy                                             | Owner pushes the branch and opens the PR                                |

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
