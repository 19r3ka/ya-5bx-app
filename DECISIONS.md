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

### D-008: Invalid chart/level fallback policy

- **Date:** 2026-10-25 · **Status:** Proposed
- **Feature:** 002-gap-closure
- **Context:** AC-3.3 requires an explicit error and a safe fallback when generation is asked for a chart/level that is absent from the versioned dataset. Today `ClassicRCAFStrategy` throws into `WorkoutSetupView.beginWorkout` with no handler, and the stored profile has no schema versioning (D-004 is Phase 4), so a corrupted `currentLevel` is reachable.
- **Decision:** Resolve the session target in two steps, transiently: the profile level if it exists in `charts_matrix.json`, else the most recent completed session whose chart/level is valid, else Chart 1 / Level D-. Show a visible warning naming the level in use. Never write the resolved target back to the profile. If generation still fails for the resolved target, show an error and start no session.
- **Alternatives:** Rewrite the profile with the fallback (rejected: mutates user data from a possibly corrupt read, unsafe before D-004). Block the session and send the user to settings (rejected: AC-3.3 requires a safe fallback; owner chose recovery on 2026-10-25).
- **Consequences:** + The user can always train; no data loss. − A persistent corruption repeats the warning every session until it is repaired. − A repeated warning is the accepted signal that repair needs its own decision after D-004.
- **Review trigger:** When D-004 schema versioning lands, or when import (RM-10) can introduce arbitrary levels.
- **Raised by:** owner (decision 2026-10-25); agent (text).

### D-011: Goal-level authority is the age table

- **Date:** 2026-10-25 · **Status:** Proposed
- **Feature:** 002-gap-closure
- **Context:** Two sources disagree. `getGoalChartByAge` (`src/utils/ages.ts`) returns a chart and the UI hardcodes goal level `A+`, while `getGoalLevelByAge` (`src/utils/levels.ts`) reads `src/data/ageGroups.json`. Example: age 28 gives Chart 5 / `C5_A+` versus `C4_A+`; age 43 gives `C3_A+` versus `C3_C`. T-009 and T-011 locked both as-is; PLAN §11.2 finding 3 assigns the resolution to Phase 1.
- **Decision:** `src/data/ageGroups.json` is the single authoritative age table, read by one pure function `getGoalLevelByAge(age)` (kept under its existing name; a `resolveGoalLevel` synonym was rejected as a duplicate). Callers derive the chart from the returned level id. `getGoalChartByAge` is deleted. Boundaries are inclusive; ages above the last row use the last row; ages below the first row return `null`. Q1 resolution (owner, 2026-10-25): the 30–34 row is `C4_C+` per the RCAF transcription, and the data row was corrected from `C4_C-`.
- **Alternatives:** Keep the chart-only bands (rejected: loses per-age level granularity already present in the dataset, and keeps two sources). Keep both and document (rejected: leaves AC-6.1 data ambiguous).
- **Consequences:** + One source of truth, deterministic and testable. − Changes onboarding goal output for several ages. − The 30–34 goal level changed from `C4_C-` to `C4_C+`; the pinned table test (`src/utils/levels.spec.ts`) fails on any unmirrored data edit.
- **Review trigger:** If a sourced RCAF table version supersedes the current dataset.
- **Raised by:** owner (decision 2026-10-25); agent (text).
