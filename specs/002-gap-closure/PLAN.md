# PLAN: Gap closure (baseline Phase 1)

**Feature ID:** 002-gap-closure · **Spec version:** 0.1 · **Status:** Draft (awaiting SPEC.md and owner approval) · **Updated:** 2026-10-25

> HOW. Must satisfy every Must requirement in `SPEC.md` and pass the constitution check. Reuse before building. If the spec is ambiguous, raise a spec bug; do not guess in the plan.

## 1. Approach summary

Five small, independent changes, each replacing one locked characterization gap with a tested behavior: a local-write helper with a store-level failure flag, a catch-all route placed after the existing onboarding guard, a pure session-target resolver with a documented fallback chain, catalog-based copy plus a key-parity test, and one pure goal-level resolver over `ageGroups.json`. No new dependency, no schema change, no timer change. Every gap test (D-003) flips in the same commit as its fix.

## 2. Constitution check

| Principle / constraint                   | How this plan satisfies it                                                                        | Status |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------- | ------ |
| §1 Data sovereignty and portability      | Local-only writes; fallback never writes to the profile; no new storage location or network call. | OK     |
| §1 Storage failures handled without loss | R2: guarded writes, banner, previous value preserved (AC-2.5).                                    | OK     |
| §2 Deterministic, tested domain data     | R5: single pure resolver; table boundaries pinned by tests.                                       | OK     |
| §2 Versioned RCAF data                   | `ageGroups.json` stays the v1.0 dataset; no ad-hoc copy.                                          | OK     |
| §3 Offline-first                         | No runtime network use; all checks are local tests.                                               | OK     |
| §4 Bilingual parity                      | R4: catalogs complete, automated parity check (Constitution gate 5).                              | OK     |
| §5 Reliable timing                       | Untouched; no task edits `TimerEngine`, `useWorkoutEngine` timing, or `useTimer`.                 | OK     |
| §6 Accessibility                         | Out of scope (RM-13); banners are Vuetify components with text, not color-only.                   | OK     |
| Gate 1 Static checks                     | `npm run build` (includes `vue-tsc -b`) and `npm run lint` per task.                              | OK     |
| Gate 2 Automated tests                   | Every AC maps to a Vitest test (§8).                                                              | OK     |
| Gate 7 Regression protection             | Characterization tests are flipped, never deleted; profile writes become strictly safer.          | OK     |

## 3. Reuse audit

| Asset                                       | Covers                                        | Gap                                       |
| ------------------------------------------- | --------------------------------------------- | ----------------------------------------- |
| `useUserStore` (Pinia)                      | Draft/profile state, existing try/catch reads | Writes are unguarded; no failure signal   |
| `src/locales/en.json`, `fr.json`            | Existing onboarding/dashboard copy            | Five hardcoded strings; no parity test    |
| `vue-router` guard in `src/main.ts`         | Onboarding redirect                           | No catch-all; guard order must be checked |
| `charts_matrix.json` (6 × 12)               | Authoritative level keys for validity checks  | Not used for validation                   |
| `src/data/ageGroups.json`                   | Age → goal level table                        | Second, inconsistent path in `ages.ts`    |
| `getGoalLevelByAge` (`src/utils/levels.ts`) | Row lookup by age                             | Unused by the main onboarding view        |
| Vitest + happy-dom (D-002)                  | All new tests                                 | None                                      |
| Vuetify `v-banner`                          | AC-2.4 / AC-3.5 banners                       | Not used yet                              |

No new dependencies. `axe-core` is deliberately deferred to RM-13.

## 4. Architecture

```text
localStorage  <-- safeWriteJson() <-- useUserStore actions --> storageWriteFailed --> App.vue v-banner
                                             ^
                                             | failure flag clears on next successful write

profile.currentLevel ─┐
rawHistory[] ─────────┴--> resolveSessionTarget() --> isValidChartLevel() --> charts_matrix.json
                                   |                         (invalid chain -> C1_D-)
                                   v
                       WorkoutSetupView  --banner if source != 'profile'--> user
                                   |
                                   v
                       WorkoutOrchestrator.initializeSession (unchanged)

age (draft) --> resolveGoalLevel() --> ageGroups.json --> OnboardingView / Step2Age / OnboardingForm
```

Components:

- `src/utils/storage.ts` (new): guarded local writes, no Vue dependency.
- `src/utils/sessionTarget.ts` (new): validity check and fallback chain, no Vue dependency.
- `src/utils/levels.ts`: gains `resolveGoalLevel`; keeps `getGoalLevelByAge` as a thin alias or is replaced consistently (T-12).
- `src/views/WorkoutSetupView.vue`: computes the target once and renders the fallback/error banner.
- `src/App.vue`: renders the storage banner from store state.
- `src/router/index.ts`: catch-all last.

## 5. Data model

No schema change. `CompletedSessionRecord` untouched. `ageGroups.json` is corrected only for the 30–34 row if Q1 is answered yes (T-13). The storage failure flag is runtime-only state and is never persisted.

## 6. Interfaces and contracts

```ts
// src/utils/storage.ts (new)
export function safeWriteJson(key: string, value: unknown): boolean
export function safeRemove(key: string): boolean

// src/stores/useUserStore.ts (modified)
storageWriteFailed: boolean            // state, set by persistDraft/setPreferredAerobic/completeOnboarding
completeOnboarding(profileData?): void // unchanged signature; no longer throws on write failure

// src/utils/sessionTarget.ts (new)
export const FALLBACK_TARGET: { chartNumber: 1; levelString: 'D-' }
export function isValidChartLevel(chartNumber: number, levelString: string): boolean
export function resolveSessionTarget(
  profileLevel: string | undefined,
  history: readonly CompletedSessionRecord[]
): {
  chartNumber: number
  levelString: string
  source: 'profile' | 'history' | 'default'
}

// src/utils/levels.ts (modified)
export function resolveGoalLevel(age: number): LevelId | null // row lookup; null below first row; last row is open-ended

// src/router/index.ts (modified, last entry)
{ path: '/:pathMatch(.*)*', redirect: { name: 'dashboard' } }
```

Errors: `safeWriteJson` returns `false` and never throws; `resolveSessionTarget` never throws; `resolveGoalLevel` returns `null` rather than throwing. Generation failures remain `ClassicRCAFStrategy`'s throw, now caught at the setup boundary.

## 7. File changes

| Path                                         | New / Modified | Purpose                                             |
| -------------------------------------------- | -------------- | --------------------------------------------------- |
| `src/utils/storage.ts`                       | New            | `safeWriteJson`, `safeRemove`                       |
| `src/utils/storage.spec.ts`                  | New            | Success, quota, disabled-storage cases              |
| `src/stores/useUserStore.ts`                 | Modified       | Guard three writes, expose `storageWriteFailed`     |
| `src/stores/useUserStore.spec.ts`            | Modified       | AC-2.3 flip plus AC-2.4/2.5 coverage                |
| `src/App.vue`                                | Modified       | Storage banner                                      |
| `src/router/index.ts`                        | Modified       | Catch-all route                                     |
| `src/router/index.spec.ts`                   | Modified       | AC-1.2 flip, AC-1.3                                 |
| `src/utils/sessionTarget.ts`                 | New            | Validity and fallback chain                         |
| `src/utils/sessionTarget.spec.ts`            | New            | AC-3.4 chain and skip-invalid-history               |
| `src/views/WorkoutSetupView.vue`             | Modified       | Resolve target once, banners, error path            |
| `src/components/LevelDetails.vue`            | Modified       | Same validity guard for its exercise lookup         |
| `src/locales/en.json`, `src/locales/fr.json` | Modified       | Five strings plus banner keys                       |
| `src/locales/locales.spec.ts`                | New            | Key parity + used-key resolution (AC-8.2)           |
| `src/components/onboarding/Step1Hook.vue`    | Modified       | Catalog copy                                        |
| `src/components/onboarding/Step6Ready.vue`   | Modified       | Catalog copy                                        |
| `src/components/common/AppHelpDialog.vue`    | Modified       | Catalog copy                                        |
| `src/utils/levels.ts`                        | Modified       | `resolveGoalLevel`                                  |
| `src/utils/levels.spec.ts`                   | Modified       | Table and boundary tests (AC-6.4)                   |
| `src/utils/ages.ts`                          | Modified       | Remove `getGoalChartByAge` (single source)          |
| `src/views/OnboardingView.vue`               | Modified       | Use `resolveGoalLevel`                              |
| `src/components/onboarding/Step2Age.vue`     | Modified       | Preview level from `resolveGoalLevel`               |
| `src/components/OnboardingForm.vue`          | Modified       | Use `resolveGoalLevel` (legacy path, same function) |
| `specs/ROADMAP.md`                           | Modified       | RM-13, RM-07/08/09 status                           |
| `specs/002-gap-closure/WALKTHROUGH.md`       | New            | Handoff                                             |
| `DECISIONS.md`                               | Modified       | D-008, D-011 status and consequences                |

## 8. Test strategy

| Criterion                  | Test type | Location                                                         |
| -------------------------- | --------- | ---------------------------------------------------------------- |
| AC-1.2                     | unit      | `src/router/index.spec.ts` (flipped characterization test)       |
| AC-1.3                     | unit      | `src/router/index.spec.ts` (known routes, unresolved redirect)   |
| AC-2.3                     | unit      | `src/stores/useUserStore.spec.ts` (flipped)                      |
| AC-2.4                     | unit      | `src/utils/storage.spec.ts`, `src/stores/useUserStore.spec.ts`   |
| AC-2.5                     | unit      | `src/stores/useUserStore.spec.ts` (value preserved, flag clears) |
| AC-3.3                     | unit      | `src/core/ClassicRCAFStrategy.spec.ts` (flipped)                 |
| AC-3.4                     | unit      | `src/utils/sessionTarget.spec.ts`                                |
| AC-3.5                     | unit      | `src/utils/sessionTarget.spec.ts` + manual setup-screen check    |
| AC-8.1                     | unit      | `src/locales/locales.spec.ts` (used keys resolve)                |
| AC-8.2                     | unit      | `src/locales/locales.spec.ts` (parity)                           |
| AC-6.4                     | unit      | `src/utils/levels.spec.ts` (row bounds, above/below table)       |
| Banner visibility          | manual    | Clear storage permission in DevTools, change a draft, observe    |
| Onboarding goal for age 43 | manual    | Expect Chart 3, Level C (or C+ if Q1 is yes)                     |
| Unknown URL                | manual    | Navigate to `/nope` with onboarding complete and incomplete      |

## 9. Risks and mitigations

| Risk                                                 | Likelihood | Impact | Mitigation                                                        |
| ---------------------------------------------------- | ---------- | ------ | ----------------------------------------------------------------- |
| Catch-all shadows the onboarding guard               | Low        | High   | AC-1.3 test; manual check in both onboarding states               |
| Fallback hides a real data bug                       | Medium     | Medium | Banner names the source; `console.error` on invalid profile level |
| Goal-level swap changes onboarding copy unexpectedly | Medium     | Medium | Table test pins every row; manual age 43 check                    |
| i18n parity test breaks on dynamic keys              | Medium     | Low    | Allowlist for dynamic prefixes, documented in the test            |
| Changing `useUserStore` regresses App smoke test     | Low        | Medium | Run the full suite, not just the touched spec                     |
| Q1 unresolved blocks T-13                            | High       | Low    | T-11/T-12 land first; T-13 is last and isolated                   |

## 10. Key decisions

- **D-008** — invalid-input fallback: profile → latest valid completed session → `C1_D-`, transient, profile untouched.
- **D-011** — goal-level authority: `ageGroups.json`, one pure resolver; 30–34 correction pending Q1.
- **D-003** — gap tests flip in the same commit as the fix (applies to T-05, T-08, T-03).

## 11. Phases

| Phase | Shippable deliverable                                                          | Requirements |
| ----- | ------------------------------------------------------------------------------ | ------------ |
| M-1   | Storage writes never throw; banner reports the failure; AC-2.3 flipped         | R2           |
| M-2   | Unknown URLs land on the dashboard; AC-1.2 flipped                             | R1           |
| M-3   | Invalid level recovers deterministically with a visible banner; AC-3.3 flipped | R3           |
| M-4   | No hardcoded copy on the feature screens; parity gate in the suite             | R4           |
| M-5   | One goal-level resolver; table boundaries pinned                               | R5           |
| M-6   | Walkthrough, roadmap and decision status updated                               | all          |

## 12. Revision log

| Version | Date       | Change                           | Reason                   |
| ------- | ---------- | -------------------------------- | ------------------------ |
| 0.1     | 2026-10-25 | Initial plan for 002-gap-closure | Baseline phase 1 closure |
