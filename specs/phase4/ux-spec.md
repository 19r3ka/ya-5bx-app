# YA-5BX — Full UX/UI Specification

## For a Vuetify 3 implementation

**User:** 43-year-old male, socially-referred, knows nothing about 5BX  
**Phone position:** Surface during exercises, hand between sets, pocket during run  
**Rep logging:** Stepper with default target, timer-expiry prompt  
**Audio:** Web Speech API (MVP-viable)

---

## 1. Design System

### 1.1 Colour Tokens

The app's emotional register is **functional confidence** — not a gym bro energy drink, not a clinical medical app. Think RCAF utility meets modern calm. Dark background makes the timer legible at 1m on a floor. One warm accent (amber) for action, one cool accent (teal) for progress.

```typescript
// src/plugins/vuetify.ts — theme configuration
const theme = {
  dark: true,
  colors: {
    // ─── Core ───────────────────────────────────────
    background: '#0F1117', // near-black, not pure black (easier on eyes)
    surface: '#1A1D27', // card surfaces
    'surface-2': '#22263A', // elevated surfaces, modals

    // ─── Brand Accents ───────────────────────────────
    primary: '#F5A623', // amber — action, timers, CTAs
    'primary-dim': '#7A5312', // amber dim — disabled states, backgrounds

    secondary: '#3ECFCF', // teal — progress, completion, levels
    'secondary-dim': '#1A5A5A', // teal dim — completed cells background

    // ─── Semantic ────────────────────────────────────
    success: '#4CAF50', // green — completed sessions, passed levels
    warning: '#FF9800', // orange — eligible to advance
    error: '#CF6679', // muted red — errors, stiff/sore flag
    info: '#7B8CDE', // periwinkle — hints, tooltips

    // ─── Text ────────────────────────────────────────
    'on-background': '#E8EAF6', // primary text
    'on-surface': '#B0B8D4', // secondary text
    'on-surface-3': '#6B7399', // tertiary text, placeholders
  },
}
```

### 1.2 Typography

```typescript
// Two deliberate choices:
// Display: 'Barlow Condensed' — compact, military-manual energy
//          matches RCAF heritage; reads from 1m on a floor
// Body:    'Inter' — neutral, highly legible at small sizes
// Mono:    'JetBrains Mono' — rep counts, timer digits (tabular nums)

// Google Fonts import in index.html:
// Barlow+Condensed:wght@400;600;700
// Inter:wght@400;500;600
// JetBrains+Mono:wght@400;600

const typeScale = {
  // Timer display — readable from 1m on the floor
  'timer-display': {
    family: 'JetBrains Mono',
    size: '72px',
    weight: 600,
    letterSpacing: '-2px',
  },
  // Exercise name on workout card — readable at distance
  'exercise-name': {
    family: 'Barlow Condensed',
    size: '32px',
    weight: 700,
    letterSpacing: '0.5px',
    transform: 'uppercase',
  },
  // Target reps — large enough to glance at
  'rep-target': { family: 'JetBrains Mono', size: '48px', weight: 600 },
  // Section headers
  'section-header': {
    family: 'Barlow Condensed',
    size: '20px',
    weight: 600,
    transform: 'uppercase',
    letterSpacing: '1.5px',
  },
  // Body / labels
  body: { family: 'Inter', size: '16px', weight: 400 },
  'body-emphasis': { family: 'Inter', size: '16px', weight: 600 },
  // Captions
  caption: {
    family: 'Inter',
    size: '13px',
    weight: 400,
    color: 'on-surface-3',
  },
}
```

### 1.3 Spacing & Sizing (4px base grid)

```
Touch targets (middle-aged user):  min 48px tall, min 48px wide
Stepper buttons (sweaty hands):    64px × 64px
Timer display area:                full width, min 180px tall
Card border-radius:                12px (v-card rounded="lg")
Button border-radius:              8px (rounded="lg")
Bottom nav height:                 64px
Page horizontal padding:           16px (px-4)
Section gap:                       24px (my-6)
```

### 1.4 Vuetify 3 Theme Registration

```typescript
// src/plugins/vuetify.ts
import { createVuetify } from 'vuetify'
import { md3 } from 'vuetify/blueprints'

export default createVuetify({
  blueprint: md3,
  theme: {
    defaultTheme: 'ya5bxDark',
    themes: { ya5bxDark: theme },
  },
  defaults: {
    VBtn: { rounded: 'lg', elevation: 0 },
    VCard: { rounded: 'lg', elevation: 0 },
    VTextField: { variant: 'outlined', rounded: 'lg' },
    VBottomNavigation: { elevation: 0 },
  },
})
```

---

## 2. App Shell

### 2.1 Navigation Structure

```
App.vue
├── OnboardingFlow.vue        (shown until user profile complete)
└── MainLayout.vue            (shown after onboarding)
    ├── RouterView             (swappable content)
    │   ├── HomePage.vue
    │   ├── WorkoutPage.vue
    │   ├── ProgressPage.vue
    │   └── SettingsPage.vue
    └── BottomNav.vue
```

### 2.2 Bottom Navigation

```vue
<!-- BottomNav.vue -->
<v-bottom-navigation
  :elevation="0"
  bg-color="surface"
  color="primary"
  height="64"
>
  <v-btn value="home">
    <v-icon>mdi-home-outline</v-icon>
    <span>Today</span>
  </v-btn>
  <v-btn value="workout" size="x-large">
    <!-- FAB-style centre button — primary action -->
    <v-icon size="32">mdi-play-circle-outline</v-icon>
    <span>Workout</span>
  </v-btn>
  <v-btn value="progress">
    <v-icon>mdi-chart-line</v-icon>
    <span>Progress</span>
  </v-btn>
  <v-btn value="settings">
    <v-icon>mdi-cog-outline</v-icon>
    <span>Settings</span>
  </v-btn>
</v-bottom-navigation>
```

**Rules:**

- Active tab: `color="primary"` (amber icon + label)
- Inactive: `color="on-surface-3"`
- During active workout: hide bottom nav entirely (`v-if="!workoutActive"`)
- The centre Workout button is 4px taller than the others (visual emphasis without a true FAB)

---

## 3. Onboarding Flow

### 3.1 User Problems This Solves

| Problem                              | Solution                                                    |
| ------------------------------------ | ----------------------------------------------------------- |
| "What is 5BX? Why should I do this?" | Step 1: Hook screen — promise + time commitment up front    |
| "Why do you need my age?"            | Step 2: Age input with inline explanation of why it matters |
| "What is a Chart? What is a Level?"  | Step 3: Animated ladder reveal — visual, not a text wall    |
| "What are the 5 exercises?"          | Step 4: Exercise preview cards — illustrated, named         |
| "How do I actually use this?"        | Step 5: Interactive mock run of the rep logging UI          |
| "What is the aerobic option?"        | Shown in Step 4 as a variant — not a separate concept       |

### 3.2 Onboarding Step Structure

```
OnboardingFlow.vue
├── OnboardingStep1_Hook.vue        — What 5BX is + 11-min promise
├── OnboardingStep2_Age.vue         — Age input → goal chart reveal
├── OnboardingStep3_Ladder.vue      — Charts/levels visual explainer
├── OnboardingStep4_Exercises.vue   — The 5 exercises + aerobic option
├── OnboardingStep5_Tutorial.vue    — Interactive rep-logging demo
└── OnboardingStep6_Ready.vue       — Name entry + first workout CTA
```

### 3.3 Step 1 — The Hook

**User problem:** Complete ignorance. Will abandon if confused in the first 10 seconds.

```
┌─────────────────────────────────────────┐
│                                         │
│   11 MINUTES.                           │  ← Barlow Condensed, 72px, amber
│   NO EQUIPMENT.                         │
│   EVERY DAY.                            │
│                                         │
│   5BX is the fitness program the        │  ← Inter 16px, on-surface
│   Canadian Air Force used to keep       │
│   pilots mission-ready with no gym,     │
│   no schedule, and no excuses.          │
│                                         │
│   ─────────────────────────────────     │
│                                         │
│   5 exercises · 6 charts · 12 levels    │  ← caption, on-surface-3
│   Progress at your own pace             │
│                                         │
│             [ Let's go → ]              │  ← v-btn color="primary" block
└─────────────────────────────────────────┘
```

```vue
<!-- Component spec -->
<v-container class="fill-height d-flex flex-column justify-space-between pa-6">
  <div>
    <p class="text-caption text-on-surface-3 mb-2">YA-5BX</p>
    <h1 class="hook-headline mb-6">
      11 MINUTES.<br>NO EQUIPMENT.<br>EVERY DAY.
    </h1>
    <p class="text-body-1">{{ $t('onboarding.hook.body') }}</p>
  </div>

  <div>
    <v-divider class="mb-6 opacity-20" />
    <p class="text-caption text-center text-on-surface-3 mb-6">
      {{ $t('onboarding.hook.tagline') }}
    </p>
    <v-btn color="primary" block size="x-large" @click="next">
      {{ $t('onboarding.hook.cta') }}
      <v-icon end>mdi-arrow-right</v-icon>
    </v-btn>
  </div>
</v-container>
```

### 3.4 Step 2 — Age Input

**User problem:** Confused why age matters. Privacy concern about giving personal data.

```
┌─────────────────────────────────────────┐
│  ← back                                 │
│                                         │
│  HOW OLD ARE YOU?                       │  ← section-header
│                                         │
│  Your age sets your target fitness      │  ← body, on-surface
│  chart — the program scales difficulty  │
│  automatically so you progress safely.  │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  43                             │    │  ← v-text-field type="number"
│  └─────────────────────────────────┘    │
│                                         │
│  ────── Your goal chart ──────          │  ← revealed after age input
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  📊  Chart 3                    │    │  ← v-card color="surface-2"
│  │  Designed for adults 40–49      │    │
│  │  Peak fitness target for        │    │
│  │  your age group                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│             [ Continue → ]              │
└─────────────────────────────────────────┘
```

**Interaction notes:**

- Age field is the only focused element on mount (`autofocus`)
- Goal chart card is `v-expand-transition` — slides in when valid age entered (no button press needed)
- No DOB field — just age. Simpler, less privacy-sensitive, sufficient for the validator
- Validation: age < 10 → error "That seems too young"; age > 100 → error "Check that number"
- `type="number"` + `inputmode="numeric"` — numeric keyboard on mobile, no letters

```vue
<v-text-field
  v-model="age"
  :label="$t('onboarding.age.label')"
  type="number"
  inputmode="numeric"
  :min="10"
  :max="99"
  autofocus
  variant="outlined"
  color="primary"
  :rules="[ageRules]"
  class="mb-4"
/>

<v-expand-transition>
  <GoalChartCard v-if="isValidAge" :chart="derivedGoalChart" />
</v-expand-transition>
```

### 3.5 Step 3 — The Ladder (Charts & Levels)

**User problem:** "Chart" and "Level" are abstract. A wall of text here causes drop-off.

```
┌─────────────────────────────────────────┐
│  HOW THE PROGRAM WORKS                  │
│                                         │
│  6 charts. 12 levels each.              │
│  You start at Chart 1, Level D-.        │
│  Complete enough sessions to advance.   │
│                                         │
│  ┌─ Chart 1 ──────────────────────┐     │
│  │  D-  D  D+  C-  C  C+  B-  …  │     │  ← scrollable row of chips
│  │  ↑ you start here              │     │
│  └────────────────────────────────┘     │
│  ┌─ Chart 2 ──────────────────────┐     │
│  │  D-  D  D+  C-  C  C+  B-  …  │  ←  locked, dimmed
│  └────────────────────────────────┘     │
│  ┌─ Chart 3 ──────────────────────┐     │
│  │  …                             │  ←  your goal chart, amber highlight
│  └────────────────────────────────┘     │
│  ┌─ Chart 4 ──────────────────────┐     │
│  │  …                             │     │
│  └────────────────────────────────┘     │
│                                         │
│  Your goal is Chart 3 · A+              │  ← derived from age
│                                         │
│             [ Got it → ]                │
└─────────────────────────────────────────┘
```

**Interaction notes:**

- Each chart row is a horizontal `v-chip-group` in scrollable mode
- Current position chip: `color="primary"` with a small arrow below
- Goal chart row: border `color="primary" variant="outlined"`
- Locked charts: `opacity: 0.35`
- No need for user to interact — it's read-only education
- `v-scroll-y-reverse-transition` animates rows in from bottom one by one (staggered 120ms)

### 3.6 Step 4 — The 5 Exercises

**User problem:** Doesn't know what the exercises are. "Burpees? I can't do that."

```
┌─────────────────────────────────────────┐
│  THE 5 EXERCISES                        │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  1  STRETCHING           ~2 min │    │  ← v-card, tap to expand
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │  2  SIT-UPS               1 min │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │  3  BACK EXTENSIONS       1 min │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │  4  PUSH-UPS              1 min │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │  5  RUNNING / WALKING    ~6 min │    │
│  │     ↳ tap to see alternatives  │    │  ← aerobic options hint
│  └─────────────────────────────────┘    │
│                                         │
│             [ Continue → ]              │
└─────────────────────────────────────────┘
```

**Expanded card (tap to open):**

```
│  5  RUNNING / WALKING    ~6 min         │
│  ─────────────────────────────────      │
│  Can't run? Choose an alternative:      │
│                                         │
│  ○ Outdoor run (default)                │
│  ○ Treadmill                            │
│  ○ Stationary bike                      │
│  ○ Brisk walk                           │
│  ○ Stationary run (in place)            │
│                                         │
│  You can change this before any         │
│  workout session.                       │
```

```vue
<v-expansion-panels variant="accordion" bg-color="surface-2">
  <v-expansion-panel
    v-for="exercise in exercises"
    :key="exercise.id"
    :title="exercise.displayName"
    :text="exercise.description"
    rounded="lg"
  >
    <template #text>
      <!-- Exercise description + aerobic alternatives for exercise 5 -->
    </template>
  </v-expansion-panel>
</v-expansion-panels>
```

### 3.7 Step 5 — Interactive Tutorial

**User problem:** Will not know how to log reps the first time without a demo.

```
┌─────────────────────────────────────────┐
│  HOW TO LOG A SET                       │
│                                         │
│  TRY IT NOW                             │  ← body-emphasis, primary
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  PUSH-UPS                       │    │
│  │                                 │    │
│  │         0:45                    │    │  ← fake countdown, animating
│  │    ──────────────               │    │  ← timer progress bar
│  │                                 │    │
│  │     Target: 10 reps             │    │
│  │                                 │    │
│  │   [ – ]    10    [ + ]          │    │  ← stepper
│  │                                 │    │
│  │        [ ✓ Log set ]            │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ← Tap – or + to adjust, then ✓ to log │
│                                         │
│  ↓ When the timer runs out, we'll       │
│    remind you to log if you haven't.    │
│                                         │
└─────────────────────────────────────────┘
```

**Interaction:**

- Fake timer counts from 0:59 to 0:00 (compressed to 8 seconds real-time for demo)
- At 0:00 the timer border flashes amber and a prompt appears: "Log your reps to continue"
- User taps Log → green checkmark + haptic + confetti particle burst (small, 1 second)
- Then: "That's it. Ready?" → [ Start my first workout ]

### 3.8 Step 6 — Ready

```
┌─────────────────────────────────────────┐
│                                         │
│  ONE LAST THING                         │
│                                         │
│  What should we call you?               │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  Your name (optional)           │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ─────────────────────────────────      │
│                                         │
│  YOUR STARTING POINT                    │
│                                         │
│  Chart 1 · Level D-                     │  ← everyone starts here
│  Goal: Chart 3 · A+                     │  ← their age-derived goal
│                                         │
│       [ Start my first workout ]        │  ← v-btn color="primary" block x-large
│                                         │
│    Skip for now                         │  ← text-only, on-surface-3
└─────────────────────────────────────────┘
```

### 3.9 Onboarding Progress Indicator

```vue
<!-- Persistent across all steps, top of screen -->
<div class="d-flex gap-1 justify-center py-3">
  <div
    v-for="step in totalSteps"
    :key="step"
    class="progress-pip"
    :class="{ active: step <= currentStep }"
  />
</div>

<!-- CSS -->
<style scoped>
  .progress-pip {
    width: 24px;
    height: 4px;
    border-radius: 2px;
    background: var(--v-theme-surface-2);
    transition: background 300ms ease;
  }
  .progress-pip.active {
    background: var(--v-theme-primary);
  }
</style>
```

---

## 4. Home Screen (Dashboard)

### 4.1 User Problems This Solves

| Problem                                         | Solution                                  |
| ----------------------------------------------- | ----------------------------------------- |
| "What do I do today?"                           | Clear single CTA above the fold           |
| "How long has it been since I last worked out?" | Last workout date shown prominently       |
| "Am I on track?"                                | Streak indicator + sessions to next level |
| "Where am I in the program?"                    | Current level chip + mini progress bar    |

### 4.2 Layout

```
┌─────────────────────────────────────────┐
│  Good morning, Yem          [⚙]         │  ← top app bar, no elevation
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  TODAY'S WORKOUT                │    │  ← v-card color="surface"
│  │  Chart 1 · Level D+             │    │
│  │                                 │    │
│  │  ████████████░░░░  D+ → C-      │    │  ← progression bar
│  │  3 of 4 sessions complete       │    │
│  │                                 │    │
│  │      [ ▶  Start workout ]       │    │  ← primary btn, full width
│  └─────────────────────────────────┘    │
│                                         │
│  LAST SESSION                           │  ← section-header
│  2 days ago · 11:24 · all sets logged   │
│                                         │
│  YOUR PROGRESS                          │
│  ┌─────────────────────────────────┐    │
│  │  [ProgressionMap component]     │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

```vue
<!-- Today's workout card -->
<v-card color="surface" class="pa-4 mb-6">
  <div class="d-flex justify-space-between align-center mb-2">
    <span class="text-caption text-on-surface-3">TODAY'S WORKOUT</span>
    <v-chip size="small" color="secondary" variant="tinted">
      {{ currentLevelLabel }}
    </v-chip>
  </div>

  <div class="mb-4">
    <div class="d-flex justify-space-between mb-1">
      <span class="text-body-2">{{ $t('home.sessionsToAdvance', { n: sessionsRemaining }) }}</span>
      <span class="text-caption text-on-surface-3">{{ currentLevel }} → {{ nextLevel }}</span>
    </div>
    <v-progress-linear
      :model-value="progressPercent"
      color="secondary"
      bg-color="surface-2"
      rounded
      height="6"
    />
  </div>

  <v-btn
    color="primary"
    block
    size="x-large"
    prepend-icon="mdi-play"
    @click="startWorkout"
  >
    {{ $t('home.startWorkout') }}
  </v-btn>
</v-card>
```

### 4.3 Empty States

**No workouts logged yet (day 1 after onboarding):**

```
No sessions yet.
Your first workout takes about 11 minutes.
[ Start now ]
```

**Streak broken (>2 days gap):**

```
It's been 5 days.
No pressure — pick up where you left off.
[ Resume Chart 1 · D+ ]
```

---

## 5. Workout Screen

### 5.1 User Problems This Solves

| Problem                                                  | Solution                                                   |
| -------------------------------------------------------- | ---------------------------------------------------------- |
| "I can't read the screen from the floor"                 | Timer: 72px mono, exercise name: 32px all-caps             |
| "I don't know how many reps to do"                       | Target reps displayed as large as the timer                |
| "I forgot what this exercise is"                         | Exercise name tappable → full description sheet            |
| "I'm in the middle of a push-up set, can't tap anything" | Auto-advance with audio cue; no required taps mid-exercise |
| "I already logged but the timer is still going"          | Logged indicator appears; timer continues quietly          |
| "Timer ended but I forgot to log"                        | Amber flash + audio prompt + rep field highlights          |
| "I want to pause"                                        | Persistent pause button, large, always visible             |
| "I'm on the run — need one-handed glance info"           | Run screen is different: big time, distance/pace           |

### 5.2 Pre-Workout Screen (Aerobic Selection)

```
┌─────────────────────────────────────────┐
│  ←  Chart 1 · Level D+                  │
│                                         │
│  TODAY'S SESSION                        │
│                                         │
│  1  Stretching          2:00            │
│  2  Sit-ups             1:00    12 reps │
│  3  Back extensions     1:00    10 reps │
│  4  Push-ups            1:00    10 reps │
│  5  ──────────────────────────          │
│     AEROBIC EXERCISE    6:00            │
│                                         │
│     ┌────────────────────────────┐      │
│     │  ○  Outdoor run (1 mi)    │      │  ← v-radio-group
│     │  ○  Treadmill             │      │
│     │  ●  Stationary run        │      │  ← last selected remembered
│     │  ○  Brisk walk (2 mi)     │      │
│     └────────────────────────────┘      │
│                                         │
│         [ Begin workout ]               │
└─────────────────────────────────────────┘
```

```vue
<v-radio-group v-model="selectedAerobic" color="primary">
  <v-radio
    v-for="option in aerobicOptions"
    :key="option.value"
    :label="option.label"
    :value="option.value"
    class="aerobic-option py-2"
  />
</v-radio-group>
```

### 5.3 Active Exercise Screen (Surface Mode — floor)

```
┌─────────────────────────────────────────┐
│                          ❚❚             │  ← pause icon top-right, 44px tap
│                                         │
│  ● ○ ○ ○ ○                             │  ← exercise 1 of 5 dots
│                                         │
│  STRETCHING                             │  ← Barlow Condensed 32px uppercase
│                                         │
│                                         │
│          01:47                          │  ← JetBrains Mono 72px, amber
│     ─────────────────                   │  ← thin progress bar, animating
│                                         │
│                                         │
│     Target: 10 reps                     │  ← Barlow Condensed 24px
│                                         │
│                                         │
│   ┌──────┐   ┌──────┐   ┌──────┐       │
│   │      │   │  10  │   │      │       │  ← 64×64px tap targets
│   │  −   │   │      │   │  +   │       │
│   └──────┘   └──────┘   └──────┘       │
│                                         │
│         [ ✓  Log 10 reps ]              │  ← v-btn primary, 56px tall
│                                         │
│  ─────────────────────────────────      │
│  NEXT:  Sit-ups  →  12 reps  →  1:00   │  ← caption, always visible
└─────────────────────────────────────────┘
```

**Exact Vuetify spec for the stepper:**

```vue
<div class="rep-stepper d-flex align-center justify-center gap-4 my-6">
  <v-btn
    icon="mdi-minus"
    variant="tonal"
    color="primary"
    size="64"
    :disabled="actualReps <= 0"
    @click="actualReps--"
  />

  <div class="rep-display text-center" style="min-width: 80px">
    <span class="rep-number">{{ actualReps }}</span>
  </div>

  <v-btn
    icon="mdi-plus"
    variant="tonal"
    color="primary"
    size="64"
    @click="actualReps++"
  />
</div>

<v-btn
  color="primary"
  block
  size="x-large"
  :variant="hasLogged ? 'tonal' : 'elevated'"
  :prepend-icon="hasLogged ? 'mdi-check-circle' : 'mdi-check'"
  @click="logReps"
>
  {{ hasLogged
    ? $t('workout.logged', { n: actualReps })
    : $t('workout.logReps', { n: actualReps }) }}
</v-btn>
```

**Timer expiry prompt (not logged yet):**

```vue
<!-- Fires when timer hits 0 and hasLogged === false -->
<v-alert
  type="warning"
  variant="tonal"
  density="compact"
  class="mb-3"
  :icon="false"
>
  {{ $t('workout.logPrompt') }}
  <!-- "How many did you do? Log before moving on." -->
</v-alert>
```

- Alert slides in from top (`v-slide-y-transition`)
- Rep stepper border turns amber (`border: 2px solid rgb(var(--v-theme-primary))`)
- Audio: `speechSynthesis.speak("Log your reps before continuing")`

**After logging:**

- Button changes to tonal variant + check icon: "Logged: 10 reps"
- No modal, no navigation — timer continues
- User can update the count by tapping – or + again; button reverts to "Update to 9 reps"

### 5.4 Exercise Transition Screen

Between exercises — shown for 5 seconds:

```
┌─────────────────────────────────────────┐
│                                         │
│  ✓  STRETCHING COMPLETE                 │  ← success color
│     You logged 10 reps                  │
│                                         │
│  ─────────────────────────────────      │
│                                         │
│  NEXT                                   │  ← section-header
│                                         │
│  SIT-UPS                                │  ← exercise-name size
│  Target: 12 reps · 1:00                 │
│                                         │
│         5  4  3  2  1                   │  ← countdown dots, amber
│                                         │
│      [ Skip rest / start now ]          │  ← ghost btn
└─────────────────────────────────────────┘
```

- Audio fires on entering this screen: _"Stretching complete. Next: Sit-ups. 12 reps."_
- Countdown animates each dot off (not a number — too small)
- User can skip rest to start next exercise immediately

### 5.5 Run Screen (Phone in pocket/hand)

This is the only exercise where the phone travels with the user. Different layout priorities: big time, minimum interaction.

```
┌─────────────────────────────────────────┐
│                          ❚❚             │
│                                         │
│  ● ● ● ● ●                             │  ← exercise 5 of 5
│                                         │
│  RUN                                    │
│                                         │
│                                         │
│          05:23                          │  ← 72px, maximum readability
│                                         │
│                                         │
│     Keep your pace.                     │  ← motivational, calm
│                                         │
│                                         │
│                                         │
│         [ ✓  Done running ]             │  ← one big tap to complete
│                                         │
│  No rep count for this exercise.        │  ← caption
└─────────────────────────────────────────┘
```

**Notes:**

- Rep stepper is hidden (exercise has no reps)
- Screen wake lock requested: `navigator.wakeLock.request('screen')` — prevents screen sleep during run
- Audio at start of run: _"Final exercise — 6-minute run. Go."_
- Audio at halfway: _"3 minutes remaining."_
- Audio at 1 min: _"1 minute left."_

### 5.6 Paused Screen

```
┌─────────────────────────────────────────┐
│                                         │
│         PAUSED                          │
│         PUSH-UPS · 0:34 remaining       │
│                                         │
│     ─────────────────────────────       │
│                                         │
│         [ ▶  Resume ]                   │  ← primary
│         [ ✕  Abandon workout ]          │  ← error, text variant
│                                         │
│  Progress is saved. You can pick        │  ← reassurance copy
│  up exactly here if you close the app.  │
│                                         │
└─────────────────────────────────────────┘
```

- `Abandon workout` triggers a confirmation bottom sheet (not a dialog — less disruptive)
- Background goes to 60% dimmed version of workout screen (not a full modal)

### 5.7 Post-Workout Dialog

```
┌─────────────────────────────────────────┐
│  WORKOUT COMPLETE                       │  ← section-header, success color
│                                         │
│  Duration: 11:24                        │
│  Level: Chart 1 · D+                   │
│  Sets logged: 5/5                       │
│                                         │
│  ─────────────────────────────────      │
│                                         │
│  HOW DO YOU FEEL?                       │
│                                         │
│  ┌──────────────┐  ┌──────────────┐     │
│  │  💪 Great    │  │  😓 Stiff    │     │  ← two large toggle buttons
│  │  No issues   │  │  or sore     │     │
│  └──────────────┘  └──────────────┘     │
│                                         │
│         ───────── 0:52 ─────────        │  ← thin countdown bar, amber
│                                         │
│         [ Save & continue ]             │
└─────────────────────────────────────────┘
```

```vue
<v-card color="surface-2" class="pa-6">
  <!-- ... session summary ... -->

  <div class="feeling-toggle d-flex gap-3 my-6">
    <v-btn
      v-for="option in feelingOptions"
      :key="option.value"
      :color="selectedFeeling === option.value ? 'primary' : 'surface'"
      :variant="selectedFeeling === option.value ? 'elevated' : 'tonal'"
      class="feeling-btn flex-1 py-6"
      @click="selectedFeeling = option.value"
    >
      <div class="d-flex flex-column align-center">
        <span class="text-h5 mb-1">{{ option.emoji }}</span>
        <span class="text-body-2">{{ option.label }}</span>
        <span class="text-caption text-on-surface-3">{{ option.sub }}</span>
      </div>
    </v-btn>
  </div>

  <!-- Auto-save countdown (Patch 3.1: defaults to conservative/stiff) -->
  <div class="d-flex align-center gap-2 mb-4">
    <v-progress-linear
      :model-value="countdownPercent"
      color="primary"
      bg-color="surface"
      height="3"
      rounded
    />
    <span class="text-caption text-on-surface-3 text-no-wrap">
      {{ $t('postWorkout.autoSaveWarning', { seconds: countdown }) }}
    </span>
  </div>

  <v-btn
    color="primary"
    block
    size="x-large"
    :disabled="!selectedFeeling"
    @click="save"
  >
    {{ $t('postWorkout.saveButton') }}
  </v-btn>
</v-card>
```

**After save — progression summary (replaces buttons in same card):**

```
✓  Session saved

Sessions at this level: 3 of 4
─────────────────────────────
One more to unlock the next level.

[ Back to home ]     [ See my progress ]
```

If `validationResult.isEligible`:

```
🎯 You've earned the next level.

[ Advance to C- ]         ← primary CTA
[ Stay at D+ for now ]    ← ghost btn
```

---

## 6. Progress Screen

### 6.1 ProgressionMap Component

```
┌─────────────────────────────────────────┐
│  YOUR PROGRESS                          │
│                                         │
│         D- D  D+ C- C  C+ B- B  B+ A-  A  A+ │
│                                         │
│  C1  ✓  ✓  ●  ·  ·  ·  ·  ·  ·  ·  ·  · │  ← current: ●, done: ✓
│  C2  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  · │  ← locked: dimmed
│  C3  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ★ │  ← goal: star
│  C4  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  · │
│  C5  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  · │
│  C6  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  · │
│                                         │
│  ● Current   ✓ Done   ★ Goal            │  ← legend
└─────────────────────────────────────────┘
```

```vue
<!-- Cell states mapped to classes -->
<div
  v-for="cell in cells"
  :key="cell.id"
  class="map-cell"
  :class="{
    'cell--current': cell.isCurrent,
    'cell--completed': cell.isCompleted,
    'cell--eligible': cell.isEligible,
    'cell--goal': cell.isGoal,
    'cell--locked': cell.isLocked,
  }"
>
  <v-icon v-if="cell.isCompleted" size="14" color="success">mdi-check</v-icon>
  <v-icon v-else-if="cell.isGoal"  size="14" color="primary">mdi-star</v-icon>
  <span  v-else-if="cell.isCurrent" class="cell-dot cell-dot--active" />
  <span  v-else class="cell-dot" />
</div>

<style scoped>
  .map-cell {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgb(var(--v-theme-surface-2));
  }
  .cell--current {
    background: rgb(var(--v-theme-primary));
  }
  .cell--completed {
    background: rgb(var(--v-theme-secondary-dim));
  }
  .cell--eligible {
    background: rgb(var(--v-theme-warning));
    opacity: 0.8;
  }
  .cell--goal {
    border: 1.5px solid rgb(var(--v-theme-primary));
  }
  .cell--locked {
    opacity: 0.25;
  }
</style>
```

---

## 7. States, Feedback & Edge Cases

### 7.1 Loading Skeleton (Patch 3.2 — boot barrier)

```vue
<!-- While isHydrated === false -->
<v-skeleton-loader
  v-if="!progressionStore.isHydrated"
  type="card, list-item-two-line, list-item-two-line"
  color="surface"
/>
<ActualContent v-else />
```

### 7.2 Storage Unavailable Banner

```vue
<v-banner
  v-if="!progressionStore.isStoragePersisted"
  color="warning"
  icon="mdi-database-alert-outline"
  stacked
>
  <template #text>
    {{ $t('storage.persistenceWarning') }}
    <!-- "Private browsing detected. Your progress won't be saved." -->
  </template>
</v-banner>
```

### 7.3 Boot Recovery (Unsealed WAL)

```vue
<!-- In WorkoutCard.vue — shown on mount if pendingWALRecord is non-null -->
<v-dialog v-model="showRecoveryDialog" persistent max-width="400">
  <v-card color="surface-2" class="pa-6">
    <v-icon color="warning" size="40" class="mb-4">mdi-restore-alert</v-icon>
    <h3 class="text-h6 mb-2">{{ $t('recovery.title') }}</h3>
    <!-- "You completed a workout but we lost the record." -->
    <p class="text-body-2 text-on-surface mb-6">
      {{ $t('recovery.body') }}
    </p>
    <!-- Same PostWorkoutDialog feeling selector, pre-populated from WAL -->
    <FeelingSelector v-model="recoveryFeeling" />
    <v-btn color="primary" block class="mt-4" @click="saveRecovery">
      {{ $t('recovery.saveButton') }}
    </v-btn>
  </v-card>
</v-dialog>
```

### 7.4 Level Advancement Confirmation

```vue
<!-- Shown after user taps "Advance to C-" -->
<v-bottom-sheet v-model="showAdvanceSheet">
  <v-card class="pa-6">
    <p class="text-h6 mb-2">Chart 1 · C-</p>
    <p class="text-body-2 text-on-surface mb-2">
      {{ $t('progression.advanceBody') }}
      <!-- "Your target reps will increase. Take an extra rest day if you're unsure." -->
    </p>
    <div class="d-flex gap-3">
      <v-btn variant="text" color="on-surface-3" @click="closeSheet">
        {{ $t('common.notYet') }}
      </v-btn>
      <v-btn color="primary" flex-1 @click="confirmAdvance">
        {{ $t('progression.confirm') }}
      </v-btn>
    </div>
  </v-card>
</v-bottom-sheet>
```

### 7.5 First-Time Empty States

| Screen                     | Empty state copy                                                   |
| -------------------------- | ------------------------------------------------------------------ |
| Progress map (no sessions) | "Complete your first workout to see your progress here."           |
| Home (no history)          | "Your first session will appear here." (no guilt, no gamification) |
| Settings > History         | "No sessions logged yet."                                          |

### 7.6 Error States

| Scenario            | Component                  | Copy                                                         |
| ------------------- | -------------------------- | ------------------------------------------------------------ |
| IDB write failure   | `v-snackbar` color="error" | "Session couldn't be saved. Try again." + Retry btn          |
| Timer engine crash  | Full-screen error card     | "Something went wrong. Your progress is safe." + Restart btn |
| No audio permission | `v-alert` info inline      | "Audio cues need permission. Tap here to enable."            |

---

## 8. Micro-Interactions & Motion

| Trigger                    | Animation                          | Duration       | Library                        |
| -------------------------- | ---------------------------------- | -------------- | ------------------------------ |
| Exercise complete          | Border flash success → fade        | 600ms          | CSS transition                 |
| Rep logged                 | ✓ icon pops in (scale 0→1)         | 200ms          | `v-scale-transition`           |
| Timer expiry (not logged)  | Border pulses amber                | 1s loop        | CSS `@keyframes`               |
| Level advance              | Progression map cell animates to ✓ | 400ms per cell | CSS `transition-delay` stagger |
| Onboarding step transition | Slide left                         | 250ms          | `v-slide-x-reverse-transition` |
| Workout → post-dialog      | Slide up sheet                     | 300ms          | `v-bottom-sheet` default       |

**Reduced motion:** All animations wrap in `@media (prefers-reduced-motion: reduce) { transition: none; animation: none; }`. The Vuetify theme handles this globally when `animations: false` is set.

---

## 9. Audio Cues (Web Speech API — MVP)

```typescript
// src/composables/useAudioCues.ts
export function useAudioCues() {
  const speak = (message: string) => {
    if (!('speechSynthesis' in window)) return
    const utterance = new SpeechSynthesisUtterance(message)
    utterance.rate = 1.1 // slightly faster than natural
    utterance.pitch = 1.0
    utterance.volume = 1.0
    window.speechSynthesis.cancel() // prevent queue stacking
    window.speechSynthesis.speak(utterance)
  }

  return {
    announceExerciseStart: (name: string, reps: number, duration: number) =>
      speak(`${name}. ${reps} reps. Go.`),
    announceTransition: (nextName: string) =>
      speak(`Exercise complete. Get ready for ${nextName}.`),
    announceLogPrompt: () => speak('Log your reps before continuing.'),
    announceRunHalfway: (secondsRemaining: number) =>
      speak(`${Math.ceil(secondsRemaining / 60)} minutes remaining.`),
    announceWorkoutComplete: () => speak('Workout complete. Well done.'),
  }
}
```

**Permission:** No special permission needed for `speechSynthesis` — it works on first tap interaction. The only constraint is it cannot fire on page load without a user gesture (already satisfied since the user taps "Start workout").

---

## 10. Screen Wake Lock

```typescript
// src/composables/useWakeLock.ts
export function useWakeLock() {
  let wakeLock: WakeLockSentinel | null = null

  const request = async () => {
    if (!('wakeLock' in navigator)) return
    try {
      wakeLock = await navigator.wakeLock.request('screen')
    } catch {
      /* silently fail — not critical */
    }
  }

  const release = async () => {
    await wakeLock?.release()
    wakeLock = null
  }

  // Re-acquire if document becomes visible again (e.g. return from lock screen)
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') await request()
  })

  return { request, release }
}

// Used in WorkoutPage.vue:
// onMounted → request()
// onUnmounted → release()
```

---

## 11. Summary: Full Screen Inventory

| Screen               | Route             | Component                   | Notes               |
| -------------------- | ----------------- | --------------------------- | ------------------- |
| Onboarding Hook      | `/onboarding/1`   | `OnboardingStep1_Hook`      | First launch only   |
| Onboarding Age       | `/onboarding/2`   | `OnboardingStep2_Age`       | Goal chart reveal   |
| Onboarding Ladder    | `/onboarding/3`   | `OnboardingStep3_Ladder`    | Animated chart grid |
| Onboarding Exercises | `/onboarding/4`   | `OnboardingStep4_Exercises` | Expansion panels    |
| Onboarding Tutorial  | `/onboarding/5`   | `OnboardingStep5_Tutorial`  | Interactive mock    |
| Onboarding Ready     | `/onboarding/6`   | `OnboardingStep6_Ready`     | Name + first CTA    |
| Home / Dashboard     | `/`               | `HomePage`                  | Today card + map    |
| Pre-Workout          | `/workout/setup`  | `WorkoutSetupPage`          | Aerobic selection   |
| Active Workout       | `/workout/active` | `WorkoutPage`               | Timer + stepper     |
| Post-Workout         | (dialog)          | `PostWorkoutDialog`         | Telemetry capture   |
| Progress             | `/progress`       | `ProgressPage`              | Full map + history  |
| Settings             | `/settings`       | `SettingsPage`              | Profile + prefs     |
| Level Advance        | (bottom sheet)    | `LevelAdvanceSheet`         | Confirm/defer       |
| Boot Recovery        | (dialog)          | `SessionRecoveryDialog`     | Unsealed WAL        |
