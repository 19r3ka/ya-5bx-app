# Phase 4 — Corrective Implementation Directives

**Type:** QA Remediation Plan  
**Scope:** Post-implementation review of after-snapshot vs. Phase 4 blueprint  
**Priority:** P0 = app breaks · P1 = data contract violation · P2 = spec violation · P3 = missing

---

## P0 — App-Breaking Bugs (Fix First)

### P0-1 · Router guard is completely absent

`main.ts` registers no `router.beforeEach`. Users land on the dashboard without completing onboarding.

**Add to `main.ts` after `app.use(pinia)` and `app.use(router)`:**

```typescript
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  const complete = userStore.profile?.isOnboardingCompleted ?? false
  if (!complete && to.name !== 'onboarding') return next({ name: 'onboarding' })
  if (complete && to.name === 'onboarding') return next({ name: 'dashboard' })
  next()
})
```

Import `useUserStore` at the top of `main.ts`. The guard must run after Pinia is installed.

---

### P0-2 · `BottomNav` — `v-model` bound to a readonly computed crashes silently

```typescript
// WRONG — computed() is readonly; v-model cannot write to it
const value = computed(() => { ... })
```

**Fix — replace with a writable ref synced to the route:**

```typescript
const value = ref(route.name as string)
watch(
  () => route.name,
  (name) => {
    value.value = name as string
  }
)
```

---

### P0-3 · `App.vue` — `BottomNav` shown during active workout

```vue
<!-- WRONG -->
<BottomNav v-if="route.name !== 'onboarding'" />

<!-- CORRECT -->
<BottomNav
  v-if="route.name !== 'onboarding' && route.name !== 'active-workout'"
/>
```

---

### P0-4 · `Step3Ladder.vue` — `currentGoalChart` is undeclared

The template uses `currentGoalChart` but the script never defines it. **Add prop:**

```typescript
defineProps<{ goalChart: number }>()
```

Then replace every `currentGoalChart` in the template with `goalChart`. The parent `OnboardingView` must pass `:goal-chart="derivedGoalChart"` to this step.

---

### P0-5 · `Step4Exercises.vue` — `exercises` array is undeclared

The `v-for="(exercise, index) in exercises"` iterates over nothing. The list renders empty.

**Define the static exercise data inside the component script:**

```typescript
const exercises = [
  {
    name: 'Stretching',
    description: 'Full range mobility warm-up',
    target: '2:00 min',
  },
  {
    name: 'Sit-Ups',
    description: 'Core strength and hip flexor work',
    target: '12 reps',
  },
  {
    name: 'Back Extensions',
    description: 'Posterior chain activation',
    target: '10 reps',
  },
  {
    name: 'Push-Ups',
    description: 'Upper body pressing strength',
    target: '10 reps',
  },
  {
    name: 'Aerobic Exercise',
    description: 'Select your preferred cardio mode',
    target: '6:00 min',
  },
]
```

---

### P0-6 · `Step5Tutorial.vue` — `tutorialElapsed` undeclared; timer never starts

The template binds `:elapsed-seconds="tutorialElapsed"` and conditionally renders `v-if="tutorialElapsed < 59"`, but `tutorialElapsed` is not defined. The tutorial is frozen at 0 and the interactive part never triggers.

**Add to script:**

```typescript
const tutorialElapsed = ref(0)
const isLogged = ref(false)
let intervalId: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  intervalId = setInterval(() => {
    if (tutorialElapsed.value < 59) tutorialElapsed.value++
  }, 130) // compressed: 59 steps × 130ms ≈ 7.7s real time
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})

function handleLog() {
  isLogged.value = true
  if (intervalId) clearInterval(intervalId)
}
```

---

### P0-7 · `PostWorkoutDialog.vue` — `save()` function and countdown timer are cut off / missing

The script ends mid-definition at `(e: 'saved', data: { stiffOrSo`. `remainingSeconds` and `countdownPct` are used in the template but never defined.

**Complete the script:**

```typescript
const SEAL_TIMEOUT = 60
const selected = ref<'great' | 'sore' | null>(null)
const remainingSeconds = ref(SEAL_TIMEOUT)
const countdownPct = computed(
  () => ((SEAL_TIMEOUT - remainingSeconds.value) / SEAL_TIMEOUT) * 100
)

let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    remainingSeconds.value--
    if (remainingSeconds.value <= 0) autoSeal()
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// Conservative default on timeout — Phase 3 Patch 3.1
function autoSeal() {
  if (timer) clearInterval(timer)
  emit('saved', { stiffOrSore: true, sealStatus: 'SEALED_CONSERVATIVE' })
}

function save() {
  if (!selected.value) return
  if (timer) clearInterval(timer)
  emit('saved', {
    stiffOrSore: selected.value === 'sore',
    sealStatus: 'SEALED_USER_CONFIRMED',
  })
}

const emit = defineEmits<{
  saved: [
    data: {
      stiffOrSore: boolean
      sealStatus: 'SEALED_USER_CONFIRMED' | 'SEALED_CONSERVATIVE'
    },
  ]
}>()
```

---

### P0-8 · `ProgressionMapGrid.vue` — `getCellState` and `getCellClass` are truncated

Script ends at `if (chart < pr...`. The grid will throw at runtime on every cell render.

**Complete both functions:**

```typescript
function getCellState(chart: number, levelIdx: number): string {
  if (chart === props.currentChart && levelIdx === props.currentLevelIdx)
    return 'current'
  if (
    chart < props.currentChart ||
    (chart === props.currentChart && levelIdx < props.currentLevelIdx)
  )
    return 'completed'
  if (chart === props.goalChart && levelIdx === props.goalLevelIdx)
    return 'goal'
  return 'locked'
}

function getCellClass(
  chart: number,
  levelIdx: number
): Record<string, boolean> {
  const state = getCellState(chart, levelIdx)
  return {
    'cell-current': state === 'current',
    'cell-completed': state === 'completed',
    'cell-goal': state === 'goal',
    'cell-locked': state === 'locked',
  }
}
```

**Add scoped styles:**

```css
.progression-cell {
  width: 28px;
  height: 28px;
}
.cell-current {
  background: rgb(var(--v-theme-primary));
}
.cell-completed {
  background: rgb(var(--v-theme-secondary-dim));
}
.cell-goal {
  border: 1.5px solid rgb(var(--v-theme-primary));
  background: transparent;
}
.cell-locked {
  background: rgb(var(--v-theme-surface-elevated));
  opacity: 0.25;
}
```

---

## P1 — Data / Props Contract Violations

### P1-1 · `GoalChartCard.vue` — receives no props; shows static placeholder

The card shows "Profile Calibrating..." regardless of age. **Replace the empty script with:**

```typescript
defineProps<{
  chartNumber: number // e.g. 3
  ageRange: string // e.g. '40–49'
}>()
```

**Update template to display `chartNumber` and `ageRange` dynamically.** Remove all static copy referencing "metabolic efficiency" — it conveys no actionable information.

`Step2Age.vue` must derive and pass these:

```typescript
// Add to Step2Age.vue computed section:
const goalChart = computed(() => {
  if (!isValidAge.value || age.value === null) return null
  // Map age to chart using the existing age utility
  return getGoalChartByAge(age.value) // import from @/utils/ages
})
```

Pass to GoalChartCard: `<GoalChartCard v-if="goalChart" :chart-number="goalChart" :age-range="ageRangeLabel" />`

---

### P1-2 · `Step2Age.vue` — emits no payload; age value lost

```typescript
// WRONG
emit('next')

// CORRECT — emit age so OnboardingView can store it in the draft
emit('next', age.value)
```

`OnboardingView.nextStep` must accept this payload:

```typescript
function nextStep(payload?: number) {
  if (currentStep.value === 2 && payload) {
    draft.value.age = payload
  }
  currentStep.value++
  saveDraft()
}
```

---

### P1-3 · `Step2Age.vue` — `v-show` not `v-expand-transition` on GoalChartCard

`v-show` hides/shows with `display:none`. The animated expansion is lost.

```vue
<!-- WRONG -->
<div v-show="isValidAge">
  <GoalChartCard />
</div>

<!-- CORRECT -->
<v-expand-transition>
  <GoalChartCard v-if="isValidAge && goalChart" :chart-number="goalChart" :age-range="ageRangeLabel" />
</v-expand-transition>
```

---

### P1-4 · `WorkoutRepOverridePanel.vue` — hardcoded reps, missing props

`const reps = ref(15)` is hardcoded. The panel must pre-fill at the exercise's target reps.

```typescript
// CORRECT
const props = defineProps<{
  defaultReps: number // pre-fill at target
  exerciseName: string // shown in panel header
}>()
const reps = ref(props.defaultReps)
```

Every caller must pass these props. In `Step5Tutorial.vue`: `<WorkoutRepOverridePanel :default-reps="15" exercise-name="Push-Ups" @logged="handleLog" />`

---

### P1-5 · `OnboardingView.vue` — draft only saves `currentStep`

On reload, age and aerobic selection are lost. **Expand the draft object:**

```typescript
interface OnboardingDraft {
  step: number
  age: number | null
  aerobicPreference: string
}

const draft = ref<OnboardingDraft>({
  step: 1,
  age: null,
  aerobicPreference: 'run',
})
```

Also: replace the inline `STORAGE_KEY_ONBOARDING_DRAFT` string literal with the imported constant:

```typescript
import { STORAGE_KEY_ONBOARDING_DRAFT } from '@/constants'
```

---

### P1-6 · `Step3Ladder.vue` — only 6 of 12 grades displayed

The chip group shows `['D-', 'D', 'D+', 'C-', 'C', 'C+']`. The full ladder has 12 grades.

```typescript
// CORRECT
const grades = [
  'D-',
  'D',
  'D+',
  'C-',
  'C',
  'C+',
  'B-',
  'B',
  'B+',
  'A-',
  'A',
  'A+',
]
```

---

### P1-7 · `Step6Ready.vue` — goal chart and level are hardcoded strings

`CHART 3` and `A+` are static. They must be derived from the age set in Step 2.

**Add props and use them:**

```typescript
defineProps<{
  goalChart: number // from draft.age via getGoalChartByAge()
  goalLevel: string // always 'A+' per 5BX spec — but driven from prop, not hardcoded
}>()
```

`OnboardingView` passes `:goal-chart="derivedGoalChart" :goal-level="'A+'"` to this step.

---

### P1-8 · `ProgressionMapGrid.vue` — prop shape mismatches store contract

Blueprint specifies `currentLevelId: string` (format: `'C1_D+'`). The component uses `currentChart: number` and `currentLevelIdx: number`. This is incompatible with `useProgressionStore`.

**Two options — pick one and be consistent:**

**Option A (preferred — aligns with store):** Change props to use `LevelId` strings and parse internally:

```typescript
defineProps<{
  currentLevelId: string // 'C1_D+'
  goalLevelId: string // 'C3_A+'
  completedLevelIds: string[]
  isHydrated: boolean
}>()
// Parse: const [chart, grade] = currentLevelId.split('_')
```

**Option B (keep integers):** Keep integer props but rename all callers. Do NOT mix both shapes across the codebase.

`ProgressView.vue` currently passes hardcoded `:current-chart="3" :current-level-idx="7"`. These must be wired to `useProgressionStore` after option is chosen.

---

### P1-9 · `ActiveWorkoutView.vue` — rep override panel shown during exercise phase

Blueprint rule: **no interactive controls during exercise phase except pause**. `WorkoutRepOverridePanel` is rendered unconditionally alongside the timer.

```vue
<!-- WRONG — panel always visible -->
<WorkoutRepOverridePanel @logged="onLogged" />

<!-- CORRECT — panel only during rest phase -->
<WorkoutRepOverridePanel
  v-if="isRestPhase"
  :default-reps="currentInterval?.targetReps ?? 0"
  :exercise-name="previousInterval?.displayName ?? ''"
  @logged="onLogged"
/>
```

`isRestPhase` is derived from `snapshot.lifecycle === OrchestratorLifecycle.INTERVAL_REST`.

---

## P2 — Spec Violations

### P2-1 · `text-text-secondary` / `text-text-tertiary` are not valid Vuetify classes

These appear in `DashboardView`, `WorkoutSetupView`, `ProgressView`. The design spec defines color tokens named `text-secondary` (`#B0B8D4`) and `text-tertiary` (`#6B7399`), but Vuetify doesn't generate `text-text-secondary` utility classes from a color named `text-secondary`.

**Fix — two options, pick one:**

**Option A (recommended):** Rename the theme colors in `vuetify.ts` to drop the `text-` prefix:

```typescript
// vuetify.ts — rename these three entries
'content-primary':   '#E8EAF6',   // was text-primary
'content-secondary': '#B0B8D4',   // was text-secondary
'content-tertiary':  '#6B7399',   // was text-tertiary
```

Then use `class="text-content-secondary"` everywhere.

**Option B:** Replace every `class="text-text-secondary"` with inline CSS variable:

```vue
style="color: rgb(var(--v-theme-text-secondary))"
```

Apply Option A or B consistently across ALL files. Do not mix.

---

### P2-2 · Inline `style` attributes used for layout, borders, and heights

Violations found in: `BottomNav`, `DashboardView`, `WorkoutSetupView`, `ActiveWorkoutView`, `ProgressView`.

Examples:

```
style="border-top: 2px solid ...; height: 80px;"   ← BottomNav
style="border-left: 4px solid ...;"                 ← DashboardView card
style="max-width: 600px;"                           ← multiple views
```

**Rule:** The only permitted inline styles are `animation-delay` on staggered elements and explicit pixel dimensions for custom sub-components (map cells, stepper buttons). Everything else must use Vuetify props or utility classes.

**Fixes:**

- `height: 80px` on BottomNav → remove; Vuetify BottomNavigation `height` prop: `:height="80"`
- `border-left: 4px solid rgb(var(--v-theme-primary))` on cards → move to `<style scoped>` with a named class: `.card--accent-left { border-left: 4px solid rgb(var(--v-theme-primary)); }`
- `max-width: 600px` → create a scoped `.content-wrapper` class or use `<v-container :max-width="600">`

---

### P2-3 · `rounded="xl"` used on cards — spec requires `rounded="lg"`

Multiple views (`DashboardView`, `PostWorkoutDialog`, `ProgressionMapGrid`, `Step6Ready`) use `rounded="xl"`. The design spec is explicit: cards use 12px (`rounded="lg"`). `rounded="xl"` is 1.5rem (24px).

**Find and replace all `rounded="xl"` on `v-card` components with `rounded="lg"`.**  
Exception: bottom sheets may use `rounded="t-xl"` for the top-only rounded appearance.

---

### P2-4 · `surface-container` and `surface-container-low` used as `color` props on Vuetify components

These are in `WorkoutSetupView` and `ActiveWorkoutView`. `color="surface-container"` on `v-card` resolves to a CSS class that Vuetify does not generate for custom color keys used this way.

**Replace:**

- `color="surface-container"` → `color="surface"` (Level 1 cards)
- `color="surface-container-low"` → `color="surface"` or `bg-color="surface"` on `v-progress-linear`
- `bg-color="surface-container-low"` on progress bars → `bg-color="surface-elevated"`

---

### P2-5 · `border-outline-variant`, `border-b-surface-variant`, `border-t-surface-variant` are invalid Vuetify utility classes

Vuetify 3 border utilities are: `border`, `border-0`, `border-sm`, `border-md`, `border-lg`. There are no colour-suffixed border utilities.

**Replace with scoped CSS classes:**

```css
.border-accent {
  border: 1px solid rgba(var(--v-theme-outline-variant), 0.5);
}
.border-top-accent {
  border-top: 1px solid rgba(var(--v-theme-surface-variant), 0.5);
}
```

---

### P2-6 · `WorkoutSetupView.vue` — `beginWorkout()` does not call `audioFeedback.unlock()`

`unlock()` MUST be called synchronously inside the click handler. It cannot be deferred.

```typescript
// In WorkoutSetupView.vue script:
import { useAudioFeedback } from '@/composables/useAudioFeedback'
const { unlock } = useAudioFeedback()

function beginWorkout() {
  unlock() // ← must be first, inside click handler synchronously
  router.push({ name: 'active-workout' })
}
```

---

### P2-7 · `ExerciseInfoSheet.vue` — compiler macros explicitly imported

```typescript
// WRONG — defineProps and defineEmits are compiler macros in <script setup>, not imports
import { defineProps, defineEmits } from 'vue'
```

**Remove those two import lines.** The macros are available globally in `<script setup>` without importing.

---

### P2-8 · `router/index.ts` — eager imports instead of lazy

All 5 routes directly import view components at module load time, bloating the initial bundle.

```typescript
// WRONG
import DashboardView from '@/views/DashboardView.vue'
component: DashboardView

// CORRECT — all routes except onboarding (needed immediately by guard)
component: () => import('@/views/DashboardView.vue')
```

---

## P3 — Missing Deliverables

### P3-1 · `SettingsView.vue` not created

The route `{ path: '/settings', name: 'settings' }` is missing from the router. `BottomNav` has a Settings button with no `@click` handler.

**Create `src/views/SettingsView.vue`** with a minimal scaffold (profile display, sound toggle placeholder). **Add the route** to `router/index.ts`. **Add `@click="router.push({ name: 'settings' })"` to the Settings button in `BottomNav.vue`.**

---

### P3-2 · `BottomNav.vue` — Settings button has no route handler

```vue
<!-- WRONG — no handler -->
<v-btn value="settings" class="h-100 px-2 rounded-lg"></v-btn>
```

---

## Verification Checklist

Run these checks after applying all corrections. Do not mark Phase 4 complete until all pass.

| #   | Check                                                                       | Command / Method                                                |
| --- | --------------------------------------------------------------------------- | --------------------------------------------------------------- |
| 1   | Zero TypeScript errors                                                      | `vue-tsc --noEmit`                                              |
| 2   | Zero ESLint errors                                                          | `eslint src/`                                                   |
| 3   | Unauthenticated visit to `/` redirects to `/onboarding`                     | Browser — clear localStorage, visit `/`                         |
| 4   | Completing onboarding with age=43 shows Chart 3 in GoalChartCard            | Manual                                                          |
| 5   | Page reload at Step 4 of onboarding restores step + age + aerobic selection | Manual — reload at Step 4                                       |
| 6   | Tutorial timer counts down and unlocks rep panel                            | Manual                                                          |
| 7   | PostWorkoutDialog auto-seals after 60s with `SEALED_CONSERVATIVE`           | DevTools — check IDB record                                     |
| 8   | BottomNav hidden on `/workout` route                                        | Manual                                                          |
| 9   | ProgressionMapGrid renders full 6×12 grid with no runtime errors            | Browser DevTools console                                        |
| 10  | No `text-text-secondary` class in any template                              | `grep -r "text-text-" src/` → 0 results                         |
| 11  | No inline `style` with `border-*` or `height:` in templates                 | `grep -r "style=\"border" src/` → 0 results                     |
| 12  | No `rounded="xl"` on `v-card`                                               | `grep -r "rounded=\"xl\"" src/components src/views` → 0 results |
