# DECISIONS.md

> Append-only log, newest at the bottom. One entry per non-obvious choice: dependency picks, deviations from `PLAN.md`, constitution exceptions, rejected alternatives. Agents may add entries with Status: Proposed. Only the owner, after reviewer check, sets Accepted. Never edit an old entry: supersede it with a new one.

## Entry template

### D-001: <short title>

- **Date:** <date> · **Status:** Proposed | Accepted | Superseded by D-0xx
- **Feature:** NNN-<slug> | global
- **Context:** <situation and forces, 1 to 3 lines>
- **Decision:** <what was chosen, stated unambiguously>
- **Alternatives:** <option: why not>
- **Consequences:** <+ benefits / - tradeoffs>
- **Review trigger:** <when to revisit>
- **Raised by:** owner | reviewer | agent (<tool / model>)

---

### D-001: Dead-code detection and removal with knip

- **Date:** 2026-10-17 · **Status:** Accepted
- **Feature:** 000-ya-5bx-core
- **Context:** The snapshot contains unreferenced views, components, and a composable. Some dead files import other dead files, so grep-based checks miss the chains. No dead-code tool is installed.
- **Decision:** Add knip as a devDependency with `npm run knip` as a static check. knip's report is the authority for unused files, exports, and dependencies. Deletion is limited to the owner-accepted file set in TASKS T-003, plus the `ya_5bx_wal` removal line and `chalk` if knip reports them.
- **Alternatives:** Manual grep only (rejected: misses dead-file chains). unimported, ts-prune, depcheck (rejected: each covers one category of finding). eslint-plugin-unused-imports (rejected: file-local only). `noUnusedLocals` in tsconfig is allowed as a secondary check, not a replacement.
- **Consequences:** + Finds chained dead code; repeatable. − One devDependency. knip may not resolve dynamic imports; TASKS T-002 audits this.
- **Review trigger:** Adding dynamic imports or plugin loading, or repeated knip false positives.
- **Raised by:** agent (proposed); owner (accepted).

### D-002: Test tooling for characterization tests

- **Date:** 2026-10-17 · **Status:** Accepted
- **Feature:** 000-ya-5bx-core
- **Context:** The project has no test runner, no test script, and no test files. Characterization tests need a runner and simulated DOM and IndexedDB.
- **Decision:** Add devDependencies `vitest`, `@vue/test-utils`, `happy-dom`, and `fake-indexeddb`. Add the script `"test": "vitest run"`. Specs are co-located as `src/**/*.spec.ts` and excluded from the application type-check. No runtime dependencies. No browser end-to-end runner.
- **Alternatives:** Jest (rejected: weaker fit with Vite and TypeScript). Playwright or Cypress (rejected for now: heavier, and offline and accessibility checks are manual per PLAN M-1 and M-2).
- **Consequences:** + No application code change; runs without a browser. − Four devDependencies. IndexedDB behavior is simulated, so Phase 4 needs a real-browser check.
- **Review trigger:** Before Phase 4 (data safety), or when real-browser testing is required.
- **Raised by:** agent (proposed); owner (accepted).

### D-003: Known gaps are locked by characterization tests

- **Date:** 2026-10-17 · **Status:** Accepted
- **Feature:** 000-ya-5bx-core
- **Context:** Several SPEC acceptance criteria (AC-1.2, AC-2.3, AC-3.3, AC-4.4) and one legacy timer behavior (AC-4.1) are not met by current code. Without tests, the fixes in later phases cannot be verified against current behavior.
- **Decision:** Characterization tests assert what the code does now, including gaps, and mark each gap with `// CHARACTERIZATION: known gap, see SPEC <AC-ID>`. Each gap test is updated in the same commit as the fix, in the phase that makes the fix. Characterization tasks do not change product code, except the transient sanity mutations in TASKS T-033 to T-037.
- **Alternatives:** Write no tests for gaps (rejected: fixes would be unverifiable). Write failing tests for unmet criteria (rejected: a suite that is red from day one blocks every commit).
- **Consequences:** + The suite is green and documents reality. − Gap tests must be deliberately flipped. A forgotten flip shows up as a failing test, which is the intended signal.
- **Review trigger:** When the first gap-fixing phase starts.
- **Raised by:** agent (proposed); owner (accepted).

### D-004: Vuetify-aware component test harness

- **Date:** 2026-10-21 · **Status:** Proposed
- **Feature:** 001-baseline
- **Context:** Component characterization tests must mount SFCs that use Vuetify components. Vuetify is auto-imported by `vite-plugin-vuetify` in the application, but the initial Vitest config had only the Vue plugin, so components rendered as unresolved custom elements and Vuetify's defaults injection failed.
- **Decision:** Add `vite-plugin-vuetify({ autoImport: true })` to `vitest.config.ts` and inline `vuetify` via `test.server.deps.inline`. Component specs install the real `createVuetify()` plugin (or the app plugin) when mounting. No product code changed.
- **Alternatives:** Stub every Vuetify component per spec (rejected: verbose, brittle, and does not exercise real props/disabled behavior). Add a global component registry (rejected: duplicates the app's auto-import configuration).
- **Consequences:** + Faithful component mounts without a browser. − Test harness diverges slightly from the T-007 config; keeping it in sync with `vite.config.ts` is a maintenance point.
- **Review trigger:** When Vitest or Vuetify upgrades change CSS handling or auto-import behavior.
- **Raised by:** agent (proposed).
