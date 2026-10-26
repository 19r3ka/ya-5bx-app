# Ya-5BX — Final Implementation Plan

## Production Completion

**Ground rule:** UserStore hydrates synchronously from localStorage in its `state()` initializer.  
No navigation flash risk. IDB hydration (ProgressionStore) uses skeleton loaders in views, not route guards.  
`vue-tsc --noEmit && eslint src/` must exit 0 after every tier.

---

## Stale items — DO NOT re-implement

The following were already correctly resolved in the current repository:

- Router guard (`main.ts`)
- Lazy route imports
- BottomNav hidden during `active-workout`
- Settings view + route
- Onboarding draft persistence

---

## Tier 0 — Data Integrity (implement first; nothing else is safe without these)

### T0-1 · `src/core/storage/IndexedDBAdapter.ts` — WAL cleared on request success, not transaction commit

**Bug:** `localStorage.removeItem(WAL_KEY)` runs inside `request.onsuccess`. An IDB request can succeed while its parent transaction subsequently aborts, permanently deleting the WAL for a session that was never actually persisted.

```typescript
// WRONG — currently in commitCompletedWorkoutAsync
request.onsuccess = () => {
  localStorage.removeItem('ya_5bx_wal') // ← race: tx may still abort
  resolve()
}

// CORRECT
request.onsuccess = () => {
  /* do nothing here */
}

tx.oncomplete = () => {
  localStorage.removeItem('ya_5bx_wal')
  localStorage.removeItem(`workout_checkpoint_${record.sessionToken}`)
  resolve()
}

tx.onerror = () => reject(tx.error ?? new Error('IDB transaction error'))
tx.onabort = () => reject(new Error('IDB transaction aborted — WAL preserved'))
```

---

### T0-2 · `src/core/storage/HistoryAggregator.ts` — PENDING_TELEMETRY sessions must not count toward progression

**Bug:** `calculateContiguousVolume` counts all matching sessions regardless of `telemetryStatus`. A session that crashed before the user submitted their feeling stays `PENDING_TELEMETRY` and inflates the verified count.

```typescript
// Add at the top of the for-loop body:
if (record.telemetryStatus === 'PENDING_TELEMETRY') continue
```

This makes `PENDING_TELEMETRY` invisible to the progression algorithm. Only `SEALED` and `SEALED_CONSERVATIVE` count.

---

### T0-3 · `src/core/StorageTypes.ts` — rename ambiguous `SEALED` status

`SEALED` is semantically ambiguous. The telemetry is either user-confirmed or conservatively auto-sealed.

```typescript
export type TelemetryStatus =
  | 'PENDING_TELEMETRY'
  | 'SEALED_USER_CONFIRMED'
  | 'SEALED_CONSERVATIVE'
```

Update all references: `TelemetryService.ts` (replace `'SEALED'` with `'SEALED_USER_CONFIRMED'`), `PostWorkoutDialog.vue`.

---

## Tier 1 — Canonical State & Store Wiring

### T1-1 · `src/stores/useProgressionStore.ts` — remove hardcoded chart/level

`currentChart = ref(1)` and `currentLevel = ref('D-')` are hardcoded. These must derive from `useUserStore`.

```typescript
// Inside initAsync():
import { useUserStore } from './useUserStore'

const userStore = useUserStore()
const rawLevel = userStore.profile?.currentLevel ?? 'C1_D-'
const [chartStr, levelStr] = rawLevel.split('_')
currentChart.value = parseInt(chartStr.replace('C', ''), 10)
currentLevel.value = levelStr
```

**One canonical source:** `userStore.profile.currentLevel` owns progression position. `ProgressionStore` derives, never invents.

---

### T1-2 · `src/views/OnboardingView.vue` — persist `currentLevel` and `goalLevel` on complete

`completeOnboarding()` currently saves the profile without `currentLevel` or `goalLevel`. All users end up with `undefined` position after onboarding.

```typescript
// In OnboardingView.completeOnboarding(name):
userStore.completeOnboarding({
  name,
  age: userStore.draftAge ?? undefined,
  currentLevel: 'C1_D-', // all users start here
  goalLevel: `C${derivedGoalChart}_A+`,
})
```

---

### T1-3 · `src/App.vue` — remove legacy `useUser()`, call `progressionStore.initAsync()`

```typescript
// REMOVE:
import { useUser } from './composables/useUser'
const { loadUser } = useUser()
onMounted(() => {
  loadUser()
})

// ADD:
import { useProgressionStore } from '@/stores/useProgressionStore'
const progressionStore = useProgressionStore()
onMounted(async () => {
  await progressionStore.initAsync()
})
```

---

### T1-4 · `src/views/DashboardView.vue` — wire all hardcoded values

Every static value must come from stores. Show `v-skeleton-loader type="card"` while `!progressionStore.isHydrated`.

| Remove (hardcoded)        | Replace with                                                                            |
| ------------------------- | --------------------------------------------------------------------------------------- |
| `"Good morning, Recruit"` | `userStore.profile?.name ?? 'Recruit'`                                                  |
| `"Chart 1 · Level D+"`    | `` `Chart ${progressionStore.currentChart} · Level ${progressionStore.currentLevel}` `` |
| `model-value="75"`        | `:model-value="sessionProgressPct"` computed from `validationResult`                    |
| `"3 of 4 Sessions"`       | from `validationResult?.verifiedCompletedSessionsAtCurrentLevel`                        |
| `12` (streak)             | computed from consecutive days in `progressionStore.rawHistory`                         |
| `"Advance in 2 days"`     | from `validationResult?.sessionsRemaining`                                              |
| `@click="startWorkout"`   | `router.push({ name: 'workout-setup' })`                                                |

---

### T1-5 · `src/views/WorkoutSetupView.vue` — wire exercise list and beginWorkout

Exercise list must read from `ClassicRCAFStrategy` output for the user's current chart/level (or expose reps directly from `progressionStore`).

```typescript
import { useAudioFeedback } from '@/composables/useAudioFeedback'
import { useWorkoutEngine } from '@/composables/useWorkoutEngine'
import { v4 as uuid } from 'uuid'

const { unlock } = useAudioFeedback()
const { initializeSession, startWorkout } = useWorkoutEngine()

async function beginWorkout() {
  unlock() // ← synchronous, always first
  initializeSession({
    sessionToken: uuid(),
    chartNumber: progressionStore.currentChart,
    levelString: progressionStore.currentLevel,
    aerobicVariant: userStore.draftAerobic,
  })
  startWorkout()
  router.push({ name: 'active-workout' })
}
```

---

### T1-6 · `src/views/ActiveWorkoutView.vue` — wire to useWorkoutEngine

Remove all local `IntervalInfo` stubs and connect the engine.

```typescript
import { watch, computed } from 'vue'
import { useWorkoutEngine } from '@/composables/useWorkoutEngine'
import { OrchestratorLifecycle } from '@/core/EngineTypes'

const { snapshot, pauseWorkout, resumeWorkout } = useWorkoutEngine()

const currentInterval  = computed(() => snapshot.value?.activeInterval ?? null)
const previousInterval = computed(() => snapshot.value?.previousInterval ?? null)
const nextInterval     = computed(() => snapshot.value?.nextInterval ?? null)

watch(() => snapshot.value?.lifecycle, (lc) => {
  if (lc === OrchestratorLifecycle.COMPLETED) {
    // Stage PENDING record immediately, then show dialog
    telemetry.stagePendingSessionAsync({ ... })
    showPostWorkout.value = true
  }
})
```

Wire pause button: `@click="pauseWorkout"`.  
Pass `sessionToken` from `snapshot.value?.sessionToken` as prop to `PostWorkoutDialog`.

---

### T1-7 · `src/views/ProgressView.vue` + `ProgressionMapGrid` — wire to store

```typescript
const completedLevelIds = computed(() => [
  ...new Set(
    progressionStore.rawHistory
      .filter((s) => s.telemetryStatus !== 'PENDING_TELEMETRY')
      .map((s) => `C${s.chartNumber}_${s.levelString}`)
  ),
])
```

Pass to `ProgressionMapGrid`:

```vue
:current-level-id="`C${progressionStore.currentChart}_${progressionStore.currentLevel}`"
:goal-level-id="userStore.profile?.goalLevel ?? 'C3_A+'"
:completed-level-ids="completedLevelIds"
:is-hydrated="progressionStore.isHydrated"
```

---

## Tier 2 — Performance & Safety Correctness

### T2-1 · `src/components/workout/WorkoutTimerClock.vue` — self-driven timer (no reactive prop thrashing)

**Rule from the project rules §3:** 1Hz updates must not propagate to the parent component tree.

Remove `:elapsed-seconds` prop. Pass static bounds instead and drive the clock internally:

```typescript
defineProps<{
  startTimestamp: number // Date.now() when interval started
  durationSeconds: number // total interval length
}>()

const remaining = ref(durationSeconds)

onMounted(() => {
  const tick = () => {
    const elapsed = Math.floor((performance.now() - startTimestamp) / 1000)
    remaining.value = Math.max(0, durationSeconds - elapsed)
    if (remaining.value > 0) requestAnimationFrame(tick)
    else emit('expired')
  }
  requestAnimationFrame(tick)
})
```

`ActiveWorkoutView` passes `:start-timestamp` and `:duration-seconds` from the snapshot — both are primitives that only change on interval boundary, not every tick.

---

### T2-2 · `src/components/workout/PostWorkoutDialog.vue` — unmount leak + IDB failure handling

**Gap 1 (Specialist 2):** Clearing the timer on `onUnmounted` without sealing leaves the session in `PENDING_TELEMETRY` if the dialog is dismissed.

**Gap 2 (Specialist 1):** Setting `hasSealed = true` before the IDB write completes means a failed write is silently treated as success.

```typescript
// CORRECT lifecycle:
const isSealing = ref(false) // prevents duplicate seal attempts

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (!selected.value && !isSealing.value) autoSeal() // conservative on any close
})

async function autoSeal() {
  if (isSealing.value) return
  isSealing.value = true
  try {
    await telemetry.sealSessionTelemetryAsync(props.sessionToken, true, true)
    emit('saved')
  } catch {
    // WAL preserved; session remains PENDING_TELEMETRY for next boot recovery
    emit('seal-failed')
  }
}

async function save() {
  if (!selected.value || isSealing.value) return
  isSealing.value = true
  clearInterval(timer)
  try {
    await telemetry.sealSessionTelemetryAsync(
      props.sessionToken,
      selected.value === 'sore',
      false
    )
    emit('saved')
  } catch {
    isSealing.value = false // allow retry
    showRetryError.value = true // surface error to user
  }
}
```

`ActiveWorkoutView` must handle `@seal-failed` by showing a persistent retry banner rather than silently navigating away.

---

### T2-3 · `src/components/layout/BottomNav.vue` — writable computed (not ref + watch)

**Gap 5 (Specialist 2):** `ref + watch` creates two sources of truth. **the project rules** §3 bans redundant reactivity cycles.

```typescript
// REMOVE: const value = ref(...) + watch(...)
// ADD:
const activeTab = computed({
  get: () => route.name as string,
  set: (val: string) => router.push({ name: val }),
})
```

Bind: `<v-bottom-navigation v-model="activeTab">`

---

## Tier 3 — CSS Compliance

### T3-1 · `src/style.css` — replace Vite boilerplate, add global app classes

`src/style.css` currently contains Vite's default template CSS (wrong colors, wrong fonts). Replace entirely:

```css
/* src/style.css — global non-Vuetify classes only */
/* Rule: <style scoped> is forbidden except for keyframes (rules.md §2) */

/* Progression map cells — pixel-exact sizing not achievable via Vuetify utilities */
.progression-cell {
  width: 28px;
  height: 28px;
  border-radius: 6px;
}
.cell-current {
  background: rgb(var(--v-theme-primary));
}
.cell-completed {
  background: rgb(var(--v-theme-secondary-dim));
}
.cell-goal {
  border: 1.5px solid rgb(var(--v-theme-primary));
}
.cell-eligible {
  border: 1.5px solid rgb(var(--v-theme-warning));
}
.cell-locked {
  background: rgb(var(--v-theme-surface-elevated));
  opacity: 0.25;
}

/* Accent borders — not coverable by Vuetify border utilities */
.border-accent {
  border: 1px solid rgba(var(--v-theme-primary-container), 0.3);
}
.border-top-accent {
  border-top: 1px solid rgba(var(--v-theme-surface-variant), 0.5);
}
.border-surface-variant {
  border: 1px solid rgba(var(--v-theme-outline-variant), 0.4);
}

/* Keyframe animations (only permitted scoped-like use) */
@keyframes pulse-amber {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
@keyframes fc-fade-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

Remove all `<style scoped>` blocks from `ProgressionMapGrid.vue` and any other component that used them for colour/border rules — move those rules here.

---

## Tier 4 — PWA + CI

### T4-1 · PWA

```bash
npm install -D vite-plugin-pwa
```

Add to `vite.config.ts` inside the `plugins` array:

```typescript
import { VitePWA } from 'vite-plugin-pwa'

VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
  },
  manifest: {
    name: 'YA-5BX',
    short_name: '5BX',
    theme_color: '#F5A623',
    background_color: '#111319',
    display: 'standalone',
    orientation: 'portrait',
    start_url: '/ya-5bx-app/',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  },
})
```

Generate `public/icons/icon-192.png` and `public/icons/icon-512.png` from the existing SVG assets (ImageMagick or Sharp). Add `<meta name="theme-color" content="#F5A623">` to `index.html`.

---

### T4-2 · `.github/workflows/deploy.yml` — decouple versioning from deployment

**Specialist 1:** The current workflow runs `standard-version` and pushes back to `main` during deployment, creating a write-during-deploy feedback loop.

Split into two jobs:

```yaml
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - run: npm ci
      - run: npx standard-version
      - run: git push origin main --follow-tags

  deploy:
    needs: release
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4 # re-checkout after version push
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
      - uses: actions/deploy-pages@v4
        id: deployment
```

---

## Verification

```bash
# After every tier:
vue-tsc --noEmit && eslint src/

# After Tier 0 — confirm WAL safety:
# Open DevTools → Application → IndexedDB
# Run a workout, kill the tab mid-write, reopen — session must still exist in IDB

# After Tier 4 — PWA:
npm run build && npx serve dist
# DevTools → Application → Manifest → confirm name, icons, display:standalone
# DevTools → Application → Service Workers → confirm registered

# Grep checks — all must return 0 results:
grep -rn 'style=".*#[0-9a-fA-F]' src/components src/views
grep -rn '<style scoped>' src/components src/views  # keyframes only exception
grep -rn 'currentChart = ref(1)' src/stores
grep -rn 'request.onsuccess.*removeItem' src/
```

| Manual check                                                  | Pass condition                                                         |
| ------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Fresh install (clear localStorage + IDB), visit `/`           | Redirects to onboarding                                                |
| Complete onboarding with age 43                               | Dashboard shows user name, Chart 3 goal, real level D-                 |
| Complete a workout, submit "Stiff"                            | IDB record has `SEALED_USER_CONFIRMED`, `userFlaggedStiffOrSore: true` |
| Complete a workout, wait 60s without submitting               | IDB record has `SEALED_CONSERVATIVE`, `stiffOrSore: true`              |
| Complete a workout, kill tab before PostWorkoutDialog, reopen | Recovery dialog shown, record not duplicated                           |
| `PENDING_TELEMETRY` record in IDB                             | Does NOT affect progression count                                      |
| Install PWA on mobile                                         | App installs, works fully offline                                      |
