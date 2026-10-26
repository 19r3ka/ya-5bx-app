<!-- sdd-kit v0.3.0 -->

# AGENTS.md

> Core rules are identical in every repo. Only section 2 and sections 12 to 14 are repo-specific ([FILL]). Everything derivable from a file stays in that file, not here. Keep this file under ~150 lines. Applies to any AI agent or tool.

## 1. Project facts: read, don't assume

Never rely on memory for versions, commands, or APIs. Read the file that owns the fact, once, and only the part you need.

| Need                                            | Read                                                                                              |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Purpose, status, structure detail, config names | `README.md`                                                                                       |
| Stack, versions, dependencies, scripts          | Manifest: `package.json`, `pyproject.toml`, `requirements.txt`, `Cargo.toml`, `go.mod`, `Gemfile` |
| Exact resolved versions                         | Lockfile: search for the one package, never read the whole file                                   |
| Commands and CI steps                           | Manifest scripts, `Makefile`, `justfile`, `.github/workflows/`                                    |
| Lint and format rules                           | `.eslintrc*`, `.prettierrc*`, `ruff`/`pyproject.toml`, `.editorconfig`                            |
| Env variables                                   | `.env.template` (names only, never values)                                                        |
| What to build, project principles               | `CONSTITUTION.md`, plus `SPEC.md`, `PLAN.md`, `TASKS.md` in the active feature folder             |

- Before using a library API, check its version in the manifest or lockfile.
- If a file contradicts this document, the file wins. Flag the stale line in your final message.
- Do not copy derivable facts (versions, script lists) into this file.
- Token economy: do not re-read files already in context. Prefer search and line ranges over whole-file reads. Skip generated and vendored folders (`node_modules`, `dist`, `.venv`).

## 2. Repo core

Only what files cannot tell you. Keep it under 20 lines.

- Purpose (one line): Personal fitness companion & offline-first workout app based on RCAF 5BX 11-min daily plan.
- Test command: `npm run build && npm run lint`
- Top-level folders (max 10 lines, detail lives in README):
  ```text
  src/         Vue 3 application source code (views, composables, stores, core domain logic)
  public/      Static assets, icons, and exercise illustrations
  specs/       Specification documents, designs, and phase implementation plans
  ```
- Pitfalls: Do not use Options API (use Vue 3 Composition API with `<script setup>`); keep calculations matching RCAF charts.

## 3. Source of truth

Precedence when files conflict (highest first):

1. The user's current instruction
2. `CONSTITUTION.md`: project principles and quality gates (repo root)
3. `SPEC.md`: what to build, acceptance criteria
4. `PLAN.md`: architecture and key decisions
5. `TASKS.md`: the work queue
6. `AGENTS.md`: how to work
7. `README.md`

- Boundaries in section 7 always apply, whatever the source.
- Feature files live in `specs/NNN-slug/` (`SPEC.md`, `PLAN.md`, `TASKS.md`, `WALKTHROUGH.md`). `CONSTITUTION.md` and `DECISIONS.md` live at the repo root.
- Active feature = the highest-numbered `specs/` folder with unchecked tasks, unless the user names another.
- Cite IDs when working: requirements `R#`, criteria `AC-#.#`, tasks `T-###`, decisions `D-###`.
- Never edit `CONSTITUTION.md`, `SPEC.md`, or `PLAN.md` unless the task says so.
- If the spec is ambiguous or contradicts the code, stop and ask.

## 4. Communication

- Professional, grounded, concise. No slang, emojis, or filler.
- Favor information density. Be direct, not pedantic.
- Do not guess. If a technical path is unclear, read the code or docs, or search, before proposing.
- Correctness and architectural integrity come before speed.

## 5. Engineering principles

- KISS and DRY. No over-engineering.
- No magic numbers, magic strings, or hardcoded config. Externalize to constants, `.env`, `settings.toml` or `mappings.toml`.
- Config-first: read existing config files rather than embedding logic in scripts.
- Small, decoupled, testable modules. Self-documenting code in standard formatting for the language.
- Clean data flow. Avoid global state.
- Minimal dependencies: prefer the standard library or platform. Ask before adding a package.

## 6. Language standards

**Python**

- Use `uv` exclusively for environments and dependencies.
- When adding a capability that needs config, update `.template/.env.template` first. If a key is missing, ask the user to supply it for the local `.env`, then proceed.
- Follow PEP 8.

**JavaScript / TypeScript**

- Vite for builds, Node for runtime.
- Vue 3 with the Composition API and `<script setup>`. Put reusable logic in composables.
- Follow the repo's ESLint and Prettier config.

**Shell**

- Prefer zsh syntax when available, otherwise POSIX sh.

## 7. Boundaries

**Always**

- Read this file and the next task before coding.
- Keep the diff inside the task scope.
- Run `git branch --show-current`. It must match the active feature branch (e.g., `feat/001-baseline-phase0` or `feat/001-baseline-characterization`). If the current branch is `main`, `master`, or `chore/sdd-kit`, stop and ask for permission to create dedicated branch. Never commit directly to `main` or `master`.
- Before shell commands that modify the filesystem or environment, state the intended action in one or two lines.
- Log non-obvious decisions in `DECISIONS.md`.

**Ask first**

- Adding or upgrading a dependency.
- Changing schema or data model.
- Changing build, CI, or config files.
- Deleting or renaming files outside task scope.
- Anything touching auth, payments, or personal data.

**Never**

- Read, edit, or commit secrets (`.env`, keys, tokens).
- Push to `main` or force-push.
- Edit `CONSTITUTION.md`, `SPEC.md`, or `PLAN.md` uninstructed.
- Refactor unrelated code.
- Delete or weaken tests to make them pass.

## 8. Testing

- Framework and command: from the manifest scripts (see section 2 for the main test command).
- Every task has a test or a verifiable check. Tests and lint must pass before a task is marked done.
- If the same failure persists after two attempts, stop and report.

## 9. Git

- Never work on the default branch. Before editing, run `git branch --show-current`.
- On the default branch? If the active feature folder is `specs/NNN-slug/`, create and switch to `feat/NNN-slug` from an up-to-date default branch. Otherwise stop and ask. Never invent another branch name.
- Do not create worktrees, switch to branches you did not create, or delete branches. One agent per working tree.
- One commit per task, working state only (tests green). Message format: `type(scope): summary`, types: feat, fix, refactor, test, docs, chore. Add the task id.
- Push only your feature branch (`git push -u origin HEAD`) at the end of a session. Never push the default branch. Merging is the owner's job.
- Follow `CONTRIBUTING` or husky hooks if present.

## 10. Task protocol

1. Read this file and the next unchecked task in the active feature's `TASKS.md` whose dependencies are ticked. Then read only the requirements and criteria it cites and the files it lists (section 1).
2. Restate the task, files to touch, and done-when in 2 to 3 lines.
3. Implement only that task.
4. Run tests and lint.
5. Tick the task, commit.

Stop and report if: the task is ambiguous, tests fail twice, out-of-scope changes are needed, or an "Ask first" item comes up.

## 11. Handoff

Assume the next agent is a different model with no memory of this session.

- Update `TASKS.md`: ticks and short Notes. Never rewrite a task.
- Write `WALKTHROUGH.md` in the feature folder from the template. Mark a criterion "claimed" if no test proves it. List every deviation and assumption.
- Append non-obvious choices to `DECISIONS.md` with Status: Proposed.
- Final message: what changed, test results, stale lines found, what is next.
- Review is done by the reviewer, not by you: do not mark a phase Cleared.

## 12. Known pitfalls [FILL, optional]

- Ensure workout time/rep calculations adhere strictly to RCAF 5BX chart logic.

## 13. Environment notes [FILL, optional]

- Node runtime with Vite, Pinia, Vuetify, and PWA plugins.

## 14. Glossary [FILL, optional]

- 5BX: Five Basic Exercises (11-minute daily fitness plan originally developed by the RCAF).
- Chart: A progression chart (1 to 6) containing 12 distinct performance levels.
- Level: Exercise level sub-grade (D-, D, D+, C-, C, C+, B-, B, B+, A-, A, A+).
