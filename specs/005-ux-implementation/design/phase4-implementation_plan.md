# Phase 4 — Implementation Blueprint

## Stitch Design → Vue 3 / Vuetify 3 Components

**App:** ya-5bx-app · **Stack:** Vue 3 + Composition API + Vuetify 3 + TypeScript  
**Status:** Agent-ready

---

## 0. What the Agent Receives

For each view, the agent is given **three inputs** and **two source-of-truth files**.

### Inputs per view (provided alongside this document)

| File          | Type             | Purpose                                              |
| ------------- | ---------------- | ---------------------------------------------------- |
| `[view].png`  | Screenshot       | Spatial layout reference                             |
| `[view].html` | Vanilla HTML/CSS | Exact element structure, text, and raw colour values |

### Source-of-truth files (always active — never override)

| File                                    | Governs                                                                 |
| --------------------------------------- | ----------------------------------------------------------------------- |
| `functional_confidence_design_specs.md` | All colours, typography, spacing, border-radius, component rules        |
| `ux-spec.md`                            | Interaction behaviour, state logic, component props/emits, copy strings |

**When the Stitch HTML and a source-of-truth file conflict, the source-of-truth wins.**  
Stitch HTML provides _structure_. Source-of-truth files provide _semantics_.

---

## 1. Non-Negotiable Agent Rules

Treat these as compiler errors — not warnings.

### 1.1 Vuetify First

Every visual element from the Stitch HTML must be mapped to a native Vuetify 3 component before any custom HTML is written. See the mapping table in Section 2.

### 1.2 No Raw CSS for Layout or Colour

- ❌ `style="padding: 16px; background: #1A1D27"`
- ✅ `class="pa-4" color="surface"`
- ❌ `style="color: #F5A623"`
- ✅ `class="text-primary"` or `color="primary"`

Custom `<style scoped>` blocks are **only** permitted for:

- Typography classes not in Vuetify's type scale (`.timer-display`, `.exercise-name`, `.rep-target`, `.section-header`, `.caption-fc`)
- Animation keyframes (`@keyframes pulse`, `@keyframes fadeUp`)
- Progression map cell sizing and state classes

### 1.3 No Hardcoded Hex Values in Templates

All colours must reference theme tokens. The Vuetify `color` prop accepts any key defined in `vuetify.ts`:

```
color="primary"           → #FFC880 (amber)
color="primary-container" → #F5A623 (deep amber, inputs/focus)
color="secondary"         → #4DDADA (teal)
color="surface"           → #1A1D27
color="surface-elevated"  → #22263A  (modals, active cards)
color="error"             → #CF6679
color="success"           → #4CAF50
```

`on-surface-3` (`#7B8AAE`) is only accessible via CSS variable: `color: rgb(var(--v-theme-on-surface-3))`.

### 1.4 Script Setup + TypeScript Always

```vue
<script setup lang="ts">
  // All components. No Options API. No defineComponent.
</script>
```

### 1.5 Two-Phase Implementation Per View

- **Phase 1 — Static:** Build the template with correct Vuetify components, colour props, and typography classes. No logic, no store connections, use hardcoded fixture data.
- **Phase 2 — Live:** Wire store/composable bindings, `v-model`, emits, conditional rendering, and animations.
- Run `npm run dev`, open the browser, screenshot the result, and compare against `[view].png` before marking Phase 1 complete.

### 1.6 Component Size Limit

- Views (`src/views/`) orchestrate. They contain no layout logic beyond composable calls and a `<v-container>` wrapper.
- Components (`src/components/`) render. Any block repeated across ≥2 views is extracted as a component.
- No single `.vue` file exceeds 200 lines of template + script combined.

---

## 2. Stitch → Vuetify Element Map

| Stitch HTML pattern          | Vuetify 3 equivalent                                       | Notes                                                      |
| ---------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- |
| `<div class="card ...">`     | `<v-card rounded="lg" color="surface">`                    | elevation=0 always                                         |
| `<div class="modal ...">`    | `<v-dialog>` or `<v-bottom-sheet>`                         | Dialog for centre overlays; bottom sheet for action sheets |
| `<div class="row ...">`      | `<v-row>` inside `<v-container>`                           | Never raw flexbox for page layout                          |
| `<div class="col ...">`      | `<v-col :cols="12">`                                       |                                                            |
| `<button class="primary">`   | `<v-btn color="primary-container" rounded="md">`           |                                                            |
| `<button class="ghost">`     | `<v-btn variant="text" color="on-surface">`                |                                                            |
| `<button class="outlined">`  | `<v-btn variant="outlined" color="secondary">`             |                                                            |
| `<button class="icon ...">`  | `<v-btn icon="mdi-*" variant="text">`                      |                                                            |
| `<input type="text">`        | `<v-text-field variant="outlined" rounded="md">`           |                                                            |
| `<input type="number">`      | `<v-text-field type="number" inputmode="numeric">`         |                                                            |
| `<select>`                   | `<v-select variant="outlined" rounded="md">`               |                                                            |
| `<input type="radio">`       | `<v-radio-group>` + `<v-radio>`                            | color="secondary"                                          |
| `<input type="checkbox">`    | `<v-checkbox color="secondary">`                           |                                                            |
| `<progress>` or progress bar | `<v-progress-linear color="secondary" rounded height="6">` |                                                            |
| `<ul>` / `<li>` list         | `<v-list>` + `<v-list-item>`                               |                                                            |
| Accordion / expandable       | `<v-expansion-panels variant="accordion">`                 |                                                            |
| Stepper dots / pips          | `<v-stepper>` or custom `div` with CSS                     | See OnboardingProgress spec                                |
| Chip / badge                 | `<v-chip size="small" rounded="md">`                       |                                                            |
| Alert / banner               | `<v-alert variant="tonal" density="compact">`              |                                                            |
| Bottom navigation            | `<v-bottom-navigation>`                                    |                                                            |
| Skeleton loader              | `<v-skeleton-loader type="...">`                           | During async hydration                                     |
| Divider                      | `<v-divider class="opacity-20">`                           | Never `<hr>`                                               |
| Spacer                       | `<v-spacer>` in flex rows                                  | Never margin hacks                                         |
| Icon                         | `<v-icon>mdi-[name]</v-icon>`                              | Never `<img>` for icons                                    |
| Window / carousel            | `<v-window>` + `<v-window-item>`                           | Used for onboarding steps                                  |
| Expanding section            | `<v-expand-transition>` wrapping the element               |                                                            |
| Slide transition             | `<v-slide-x-reverse-transition>`                           | Onboarding step direction                                  |

---

## 3. Typography Classes

These are **not** in Vuetify's type scale. Define once in `src/assets/typography.css` and import globally in `main.ts`.

```css
/* src/assets/typography.css */
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');

.fc-timer {
  font: 600 72px/80px 'JetBrains Mono';
  letter-spacing: -2px;
  font-variant-numeric: tabular-nums;
}
.fc-exercise {
  font: 700 32px/40px 'Barlow Condensed';
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.fc-rep-target {
  font: 600 48px/56px 'JetBrains Mono';
  font-variant-numeric: tabular-nums;
}
.fc-section {
  font: 600 20px/24px 'Barlow Condensed';
  letter-spacing: 1.5px;
  text-transform: uppercase;
}
.fc-body-lg {
  font: 400 18px/28px 'Inter';
}
.fc-body {
  font: 400 16px/24px 'Inter';
}
.fc-body-strong {
  font: 600 16px/24px 'Inter';
}
.fc-caption {
  font: 400 13px/18px 'Inter';
  color: rgb(var(--v-theme-on-surface-3));
}
```

**Usage rule:** Use `class="fc-timer text-primary"` — the `fc-*` class controls font; the Vuetify `text-*` class controls colour. Never combine both in a single custom class.

---

## 4. Spacing Quick Reference

| Spec token          | Value | Vuetify class                                 |
| ------------------- | ----- | --------------------------------------------- |
| `grid-unit`         | 4px   | `ma-1`, `pa-1`                                |
| `gutter`            | 16px  | `pa-4`, `ga-4`                                |
| `container-padding` | 24px  | `pa-6`                                        |
| `section-gap`       | 24px  | `mb-6`, `mt-6`                                |
| `touch-target-min`  | 48px  | `min-height: 48px` or `size="large"` on v-btn |
| `stepper-button`    | 64px  | `:width="64" :height="64"` on v-btn           |

---

## 5. File Structure

```
src/
├── assets/
│   └── typography.css              ← global FC type classes
├── components/
│   ├── common/
│   │   ├── BottomNav.vue
│   │   ├── WakeLockBanner.vue
│   │   └── OnboardingProgress.vue  ← pip indicator (steps 1–6)
│   ├── onboarding/
│   │   ├── Step1Hook.vue
│   │   ├── Step2Age.vue
│   │   ├── GoalChartCard.vue       ← revealed inside Step2Age
│   │   ├── Step3Ladder.vue
│   │   ├── Step4Exercises.vue
│   │   ├── Step5Tutorial.vue
│   │   └── Step6Ready.vue
│   ├── workout/
│   │   ├── WorkoutTimerClock.vue   ← isolated 1Hz component
│   │   ├── WorkoutRepOverridePanel.vue
│   │   ├── ExerciseInfoSheet.vue   ← bottom sheet on exercise name tap
│   │   └── PostWorkoutDialog.vue
│   └── progress/
│       └── ProgressionMapGrid.vue
├── views/
│   ├── OnboardingView.vue          ← single route, v-window state machine
│   ├── DashboardView.vue
│   ├── WorkoutSetupView.vue
│   ├── ActiveWorkoutView.vue
│   ├── ProgressView.vue
│   └── SettingsView.vue
├── plugins/
│   └── vuetify.ts                  ← already validated; do not modify colours
└── main.ts
```

---

## 6. Implementation Order

Build in this sequence. Each step depends on the prior.

| Step | Target                               | Phase 1 input                               | Phase 2 wires to                                      |
| ---- | ------------------------------------ | ------------------------------------------- | ----------------------------------------------------- |
| 1    | `vuetify.ts`                         | Already validated — confirm imports only    | —                                                     |
| 2    | `typography.css`                     | Design spec `typography` block              | `main.ts` import                                      |
| 3    | `OnboardingProgress.vue`             | Design spec spacing + primary colour        | `currentStep` prop                                    |
| 4    | `Step1Hook.vue`                      | `onboarding-hook-stitch.png` + `.html`      | emit `'next'`                                         |
| 5    | `Step2Age.vue` + `GoalChartCard.vue` | `onboarding-age-stitch.png` + `.html`       | `useUserStore`, `v-expand-transition`                 |
| 6    | `Step3Ladder.vue`                    | `onboarding-ladder-stitch.png` + `.html`    | `goalChart` prop                                      |
| 7    | `Step4Exercises.vue`                 | `onboarding-exercises-stitch.png` + `.html` | `useUserStore.aerobicPreference`                      |
| 8    | `Step5Tutorial.vue`                  | `onboarding-tutorial-stitch.png` + `.html`  | `WorkoutTimerClock` (fixture data)                    |
| 9    | `Step6Ready.vue`                     | `onboarding-ready-stitch.png` + `.html`     | `useUserStore.createProfile`                          |
| 10   | `OnboardingView.vue`                 | Assembles steps 3–9 into `v-window`         | `localStorage` draft persistence                      |
| 11   | `WorkoutTimerClock.vue`              | `active-workout-stitch.png` timer region    | props only; no store                                  |
| 12   | `WorkoutRepOverridePanel.vue`        | `active-workout-stitch.png` rest region     | emit `'logged'`                                       |
| 13   | `ExerciseInfoSheet.vue`              | `active-workout-stitch.png` info sheet      | `exercise` prop                                       |
| 14   | `PostWorkoutDialog.vue`              | `post-workout-stitch.png` + `.html`         | `useProgressionStore.recordSessionAsync`              |
| 15   | `ActiveWorkoutView.vue`              | `active-workout-stitch.png` + `.html`       | `useWorkoutEngine`, `useAudioFeedback`, `useWakeLock` |
| 16   | `ProgressionMapGrid.vue`             | `progression-map-stitch.png` + `.html`      | `useProgressionStore`                                 |
| 17   | `DashboardView.vue`                  | `dashboard-stitch.png` + `.html`            | `useUserStore`, `useProgressionStore`                 |
| 18   | `WorkoutSetupView.vue`               | `workout-setup-stitch.png` + `.html`        | `useUserStore.aerobicPreference`, router              |
| 19   | `ProgressView.vue`                   | Assembles `ProgressionMapGrid`              | `useProgressionStore`                                 |
| 20   | `BottomNav.vue` + `App.vue`          | `dashboard-stitch.png` nav region           | router, `useWorkoutEngine.isSessionActive`            |

---

## 7. Per-View Specification

### 7.1 OnboardingView

**Route:** `/onboarding` (single route — no sub-routes)  
**State machine:** `v-window` with `v-model="currentStep"` (1–6). No `v-slide-x-reverse-transition` on `v-window` — let Vuetify handle direction automatically via `:touch="false"`.

**Draft persistence contract:**

```typescript
// On every step advance: write draft to localStorage key STORAGE_KEY_ONBOARDING_DRAFT
// On mount: restore step + draft values
// On completeOnboarding(): removeItem(STORAGE_KEY_ONBOARDING_DRAFT)
```

**Step component contract (all steps share this):**

```typescript
// Props: none (receives data from OnboardingView via v-model or provide/inject)
// Emits: 'next' (with optional payload)
// No store access inside step components — parent handles commits
```

**Step 1 — Hook:**

- Layout: `fill-height` flex column, `justify-space-between`
- Headline: `class="fc-timer text-primary"` — the same 72px font as the timer, amber
- Body: `class="fc-body text-on-surface"`, `pa-6`
- CTA: `<v-btn color="primary-container" block size="x-large" rounded="md">`
- Bottom tagline: `class="fc-caption text-center"`

**Step 2 — Age:**

- `<v-text-field>` with `autofocus`, `type="number"`, `inputmode="numeric"`, `min="10"`, `max="99"`
- `GoalChartCard`: wrapped in `<v-expand-transition>` — renders when `age >= 10 && age <= 99`
- GoalChartCard: `<v-card color="surface-elevated" rounded="lg" class="pa-4">` — amber left-border accent via `border-left: 3px solid rgb(var(--v-theme-primary-container))`
- CTA button disabled while age invalid

**Step 3 — Ladder:**

- Outer: `<v-container class="pa-6">`
- Each chart row: `<v-row align="center" class="mb-3">` with stagger animation class `fc-fade-up` and `:style="{ animationDelay: idx * 120 + 'ms' }"`
- Grades: `<v-chip-group>` with `<v-chip>` per grade. States:
  - Current: `color="primary"` `variant="flat"`
  - Goal chart row: wrap row in `<v-card variant="outlined" color="primary">`
  - Locked: `class="opacity-25"`
  - Default: `color="surface-elevated"` `variant="flat"`

**Step 4 — Exercises:**

- `<v-expansion-panels variant="accordion" bg-color="surface-elevated" rounded="lg">`
- Each panel: `<v-expansion-panel>` with `:title` and `:subtitle` props
- Exercise 5 panel body: `<v-radio-group v-model="aerobicDraft" color="secondary">` with `<v-radio>` per option
- Emit aerobic selection upward to OnboardingView on each change (not just on advance)

**Step 5 — Tutorial:**

- Render `<WorkoutTimerClock :elapsed-seconds="tutorialElapsed" :total-interval-seconds="59" />` with compressed fake countdown (0→59 over 8 real seconds via `setInterval`)
- Render `<WorkoutRepOverridePanel>` only after tutorialElapsed >= 59 (timer expired)
- After user taps log: replace panel with success message + next CTA via `v-expand-transition`

**Step 6 — Ready:**

- `<v-text-field :label="$t('onboarding.ready.namePlaceholder')" />` — optional, no validation
- Summary card: `<v-card color="surface-elevated" rounded="lg" class="pa-4 mb-4">` showing start level + goal level
- Primary CTA calls emit `'complete'` with name value

---

### 7.2 DashboardView

**Route:** `/`  
**Key data sources:** `useUserStore`, `useProgressionStore`  
**Layout:** Single `<v-container class="pa-6">`, no tabs, no nested grids beyond content cards.

**Today's Workout Card:**

```vue
<v-card rounded="lg" color="surface" class="pa-4 mb-6">
  <!-- Header row -->
  <div class="d-flex justify-space-between align-center mb-3">
    <span class="fc-caption">TODAY'S WORKOUT</span>
    <v-chip size="small" color="secondary" variant="tonal" rounded="md">
      C{{ chartNumber }} · {{ levelString }}
    </v-chip>
  </div>
  <!-- Progress row -->
  <div class="d-flex justify-space-between mb-1">
    <span class="fc-caption">{{ sessionsComplete }} of {{ sessionsRequired }} sessions</span>
    <span class="fc-caption">{{ currentLevel }} → {{ nextLevel }}</span>
  </div>
  <v-progress-linear :model-value="progressPercent" color="secondary" bg-color="surface-elevated" rounded height="6" class="mb-4" />
  <!-- CTA -->
  <v-btn color="primary-container" block size="x-large" rounded="md" prepend-icon="mdi-play" @click="goToSetup">
    Start workout
  </v-btn>
</v-card>
```

**Last Session Row:**

```vue
<div class="d-flex align-center gap-2 mb-6">
  <v-icon color="on-surface-3" size="16">mdi-history</v-icon>  <!-- use CSS var color -->
  <span class="fc-caption">{{ lastSessionLabel }}</span>
</div>
```

**Progress Map Section:**

```vue
<p class="fc-section text-on-surface mb-4">YOUR PROGRESS</p>
<ProgressionMapGrid
  :current-level-id="user.currentLevel"
  :goal-level-id="user.goalLevel"
  :completed-level-ids="completedLevelIds"
  :validation-result="progressionStore.validationResult"
  :is-hydrated="progressionStore.isHydrated"
/>
```

**Empty states:**

| Condition                              | Renders                                                                                                            |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `recentSessions.length === 0`          | Replace last session row with: `<v-alert type="info" variant="tonal" density="compact">` with first-session prompt |
| `daysSinceLast > 2`                    | Caption text: `"It's been {n} days — pick up where you left off."`                                                 |
| `validationResult.isEligible`          | `<v-chip color="warning" prepend-icon="mdi-arrow-up-circle">Ready to advance</v-chip>` above CTA                   |
| `!progressionStore.isStoragePersisted` | `<v-banner>` at top of page, `color="warning"`, `icon="mdi-database-alert-outline"`                                |

---

### 7.3 WorkoutSetupView

**Route:** `/workout/setup`  
**Purpose:** Exercise list preview + aerobic selection before committing to an active session.

```vue
<v-container class="pa-6">
  <div class="d-flex align-center mb-6">
    <v-btn icon="mdi-arrow-left" variant="text" @click="router.back()" />
    <span class="fc-section ml-3">TODAY'S SESSION</span>
  </div>

  <!-- Exercise list -->
  <v-list bg-color="transparent" class="mb-6">
    <v-list-item
      v-for="ex in exercises"
      :key="ex.id"
      :title="ex.displayName"
      :subtitle="ex.durationLabel"
      rounded="md"
      class="mb-2 bg-surface"
    >
      <template #append>
        <span class="fc-caption" v-if="ex.targetReps">{{ ex.targetReps }} reps</span>
      </template>
    </v-list-item>
  </v-list>

  <!-- Aerobic selector -->
  <v-select
    v-model="aerobicChoice"
    :items="aerobicOptions"
    item-title="label"
    item-value="value"
    :label="$t('setup.aerobicLabel')"
    prepend-inner-icon="mdi-run"
    color="primary-container"
    class="mb-6"
  />

  <v-btn
    color="primary-container"
    block size="x-large" rounded="md"
    prepend-icon="mdi-play"
    @click="beginWorkout"
  >
    {{ $t('setup.begin') }}
  </v-btn>
</v-container>
```

`beginWorkout()` sequence (Phase 2):

1. `audioFeedback.unlock()` ← must be in this synchronous click handler
2. `await wakeLock.request()`
3. `router.push({ name: 'workout-active' })`

---

### 7.4 ActiveWorkoutView

**Route:** `/workout/active`  
**Critical rule:** This view hides `<BottomNav>`. Set `workoutStore.isSessionActive = true` on mount.

**Exercise Phase layout:**

```vue
<v-container class="fill-height d-flex flex-column pa-6" fluid>
  <WakeLockBanner v-if="!isWakeLockActive" />

  <!-- Top bar: exercise dots + pause -->
  <div class="d-flex justify-space-between align-center mb-2">
    <ExerciseDots :current="currentIndex" :total="totalIntervals" />
    <v-btn icon="mdi-pause" variant="text" color="on-surface" :width="44" :height="44" @click="pause" />
  </div>

  <!-- Exercise identity block — floor readable -->
  <div class="text-center my-auto">
    <p class="fc-caption mb-2">Exercise {{ currentIndex + 1 }}</p>
    <h1 class="fc-exercise text-on-surface mb-4" @click="showExerciseInfo = true">
      {{ currentInterval.displayName }}
    </h1>
    <p class="fc-rep-target text-on-surface">{{ currentInterval.targetReps }}</p>
    <p class="fc-caption mt-1">reps</p>
  </div>

  <!-- Isolated timer — only this component re-renders at 1Hz -->
  <WorkoutTimerClock
    :elapsed-seconds="snapshot.elapsedSecondsInCurrentInterval"
    :total-interval-seconds="currentInterval.durationSeconds"
  />

  <!-- Next exercise footer -->
  <p class="fc-caption text-center mt-4">
    Next: {{ nextInterval?.displayName }} · {{ nextInterval?.targetReps }} reps
  </p>
</v-container>
```

**Rest Phase — WorkoutRepOverridePanel replaces identity block:**

- Shown when `snapshot.lifecycle === OrchestratorLifecycle.INTERVAL_REST`
- Panel is `<v-card color="surface-elevated" rounded="lg" class="pa-6">`
- Stepper buttons: `<v-btn :width="64" :height="64" variant="tonal" color="primary" icon>`

**Run Phase — special layout:**

- Same as exercise phase but no rep target, no rest panel
- Single CTA: `<v-btn color="primary-container" block size="x-large">Done running</v-btn>`
- `navigator.wakeLock` must remain active

**Paused overlay:**

```vue
<v-overlay
  v-model="isPaused"
  class="align-center justify-center"
  scrim="rgba(17,19,25,0.85)"
>
  <v-card color="surface-elevated" rounded="lg" class="pa-8 text-center" width="320">
    <p class="fc-section mb-2">PAUSED</p>
    <p class="fc-caption mb-6">{{ currentInterval.displayName }} · {{ remainingLabel }} remaining</p>
    <v-btn color="primary-container" block size="x-large" class="mb-3" @click="resume">Resume</v-btn>
    <v-btn color="error" variant="text" block @click="showAbandonSheet = true">Abandon workout</v-btn>
  </v-card>
</v-overlay>
```

**Abandon bottom sheet:**

```vue
<v-bottom-sheet v-model="showAbandonSheet">
  <v-card class="pa-6" rounded="t-xl">
    <p class="fc-body-strong mb-2">Abandon this session?</p>
    <p class="fc-caption mb-6">This session won't count toward your level.</p>
    <div class="d-flex gap-3">
      <v-btn variant="text" color="on-surface" flex-1 @click="showAbandonSheet = false">Cancel</v-btn>
      <v-btn color="error" variant="tonal" flex-1 @click="abandon">Yes, abandon</v-btn>
    </div>
  </v-card>
</v-bottom-sheet>
```

**PostWorkoutDialog:** Triggered when `lifecycle === OrchestratorLifecycle.COMPLETED`.

```vue
<v-dialog v-model="showPostWorkout" persistent max-width="420">
  <PostWorkoutDialog
    :snapshot="snapshot"
    :chart-number="chartNumber"
    :level-string="levelString"
    :validation-result="progressionStore.validationResult"
    @saved="onSessionSaved"
  />
</v-dialog>
```

**PostWorkoutDialog internals:**

- Feeling tiles: two `<v-card>` side by side (not `v-btn`). Selected state adds `style="border: 2px solid rgb(var(--v-theme-primary-container))"` and `color="surface-elevated"`
- Countdown bar: `<v-progress-linear :model-value="countdownPct" color="primary" height="3" rounded>`
- Auto-seal at 60s: `stiffOrSore = true`, `sealStatus = 'SEALED_CONSERVATIVE'`, emit saved

---

### 7.5 ProgressionMapGrid

**Props:**

```typescript
defineProps<{
  currentLevelId: string // 'C1_D+'
  goalLevelId: string // 'C3_A+'
  completedLevelIds: string[]
  validationResult: ValidationResult | null
  isHydrated: boolean
}>()
```

**Skeleton while not hydrated:**

```vue
<v-skeleton-loader v-if="!isHydrated" type="table-row@6" />
```

**Grid when hydrated:**

```vue
<div class="progression-map">
  <!-- Grade header row -->
  <div class="map-grid-row header-row">
    <span class="map-label" />
    <span v-for="g in GRADES" :key="g" class="fc-caption map-header-cell">{{ g }}</span>
  </div>
  <!-- Chart rows -->
  <div v-for="c in 6" :key="c" class="map-grid-row">
    <span class="fc-caption map-label">C{{ c }}</span>
    <div
      v-for="g in GRADES"
      :key="g"
      class="map-cell"
      :class="getCellClass(c, g)"
    >
      <v-icon v-if="isCompleted(c,g)" size="12" color="success">mdi-check</v-icon>
      <v-icon v-else-if="isGoal(c,g)"  size="12" color="primary">mdi-star</v-icon>
    </div>
  </div>
</div>
```

```css
/* Scoped styles — only permitted block in this component */
.map-cell {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgb(var(--v-theme-surface-elevated));
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 300ms ease;
}
.map-cell.is-current {
  background: rgb(var(--v-theme-primary));
}
.map-cell.is-completed {
  background: rgb(var(--v-theme-secondary-dim));
}
.map-cell.is-goal {
  border: 1.5px solid rgb(var(--v-theme-primary));
}
.map-cell.is-eligible {
  background: rgba(var(--v-theme-warning), 0.2);
  border: 1.5px solid rgb(var(--v-theme-warning));
  animation: pulse 1.5s ease-in-out infinite;
}
.map-cell.is-locked {
  opacity: 0.2;
}
.map-grid-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}
.map-label {
  width: 24px;
  text-align: right;
  margin-right: 4px;
}
.map-header-cell {
  width: 28px;
  text-align: center;
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.45;
  }
}
```

---

### 7.6 WorkoutTimerClock

**Isolation rule:** This component receives **only primitive props**. It must not import any store or composable. This is the only component in the app that updates at 1Hz.

```vue
<template>
  <div class="timer-clock py-4 text-center">
    <p class="fc-timer text-primary">{{ formattedTime }}</p>
    <v-progress-linear
      :model-value="progressPercent"
      color="secondary"
      bg-color="surface-elevated"
      height="8"
      rounded
      class="mt-4"
      :class="{ 'timer-expired': isExpired }"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  const props = defineProps<{
    elapsedSeconds: number
    totalIntervalSeconds: number
  }>()

  const remaining = computed(() =>
    Math.max(0, props.totalIntervalSeconds - props.elapsedSeconds)
  )
  const isExpired = computed(
    () => props.elapsedSeconds >= props.totalIntervalSeconds
  )
  const formattedTime = computed(() => {
    const m = Math.floor(remaining.value / 60)
    const s = remaining.value % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  })
  const progressPercent = computed(() =>
    props.totalIntervalSeconds > 0
      ? Math.min(100, (props.elapsedSeconds / props.totalIntervalSeconds) * 100)
      : 0
  )
</script>

<style scoped>
  .timer-expired {
    animation: pulse-amber 1s ease-in-out infinite;
  }
  @keyframes pulse-amber {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
  }
</style>
```

---

## 8. Common Anti-Patterns (Reject on Sight)

| Anti-pattern                                            | Correct alternative                                                   |
| ------------------------------------------------------- | --------------------------------------------------------------------- |
| `style="background: #1A1D27"`                           | `color="surface"` prop or `class="bg-surface"`                        |
| `style="color: #F5A623"`                                | `class="text-primary"`                                                |
| `style="padding: 16px"`                                 | `class="pa-4"`                                                        |
| `style="gap: 16px"`                                     | `class="ga-4"`                                                        |
| `style="font-size: 72px"`                               | `class="fc-timer"`                                                    |
| `<div class="flex ...">` for page layout                | `<v-row>` + `<v-col>`                                                 |
| `elevation="2"`                                         | `elevation="0"` — this app uses tonal depth, not shadow               |
| `<img src="...icon.svg">`                               | `<v-icon>mdi-*</v-icon>`                                              |
| Hardcoded route string `router.push('/workout/active')` | `router.push({ name: 'workout-active' })`                             |
| `defineProps({ val: Object })`                          | `defineProps<{ val: Exercise }>()` — typed generics only              |
| `const emit = defineEmits(['done'])`                    | `defineEmits<{ done: [] }>()` — typed generics only                   |
| `useUserStore()` inside a component sub-component       | Pass data as props; only views and top-level components access stores |

---

## 9. Verification Checklist (Per View)

After Phase 1 of each view, the agent should, if tools and tokens are available:

1. Run `npm run dev` and open the browser preview
2. Screenshot the rendered view
3. Compare against `[view].png` — layout must match at ≥90% visual fidelity
4. Confirm no inline `style` attributes except `animation-delay` and cell sizing
5. Confirm no hardcoded hex values in templates
6. Run `vue-tsc --noEmit` — zero errors before Phase 2 begins

After Phase 2:

7. Confirm all `v-model` bindings update reactive store state correctly
8. Confirm emits are caught by parent components
9. Run `eslint src/` — zero errors
10. Run `vue-tsc --noEmit` — zero errors

---

## 10. Deliverables

Phase 4 is complete when:

| #   | Deliverable                                                                    | Verified by           |
| --- | ------------------------------------------------------------------------------ | --------------------- |
| 1   | All views render correctly against Stitch PNGs                                 | Visual comparison     |
| 2   | `typography.css` applied globally; all FC type classes render at correct sizes | Browser devtools      |
| 3   | No hardcoded colours or layout styles in any `.vue` template                   | ESLint + code review  |
| 4   | `WorkoutTimerClock` is the only component with per-second reactive updates     | Vue Devtools profiler |
| 5   | `BottomNav` hidden during active workout                                       | E2E manual test       |
| 6   | Onboarding draft survives page reload at any step                              | Manual reload test    |
| 7   | `audioFeedback.unlock()` called in `beginWorkout()` click handler              | Console log check     |
| 8   | `vue-tsc --noEmit && eslint src/` exits 0                                      | CI                    |

## 11. Agent work resume

The agent should create its own checklist of tasks and mark them as complete when done executing in such a way that the agent can implement this plan over a long period of time and can resume work later on. The checklist should be stored in a temp file in the project root and should be updated as the agent progresses through the implementation plan.
