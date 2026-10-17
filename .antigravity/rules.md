# YA-5BX Architecture & Design Rules (Vue 3 + Vuetify 3)

## 1. Design System & Theme Directives

- **Theme Source**: All visual tokens must map strictly to `plugins/vuetify.ts` ("Functional Confidence" theme).
  - Primary Accent: `#F5A623` (`primary-container`) / `#FFC880` (`primary`)
  - Secondary / Accent: `#4DDADA` (`secondary`)
  - Surface Background: `#1A1D27` (`surface`), `#111319` (`surface-dim`)
  - Text & Contrast: `#7B8AAE` (`on-surface-3`) — MUST pass WCAG AA (4.5:1) on surface cards.
- **Geometry & Border Radii**:
  - Cards (`v-card`): `12px` (`rounded-lg`)
  - Buttons (`v-btn`) & Form Inputs: `8px` (`rounded-md`)
  - Grid / Data Cells (e.g., Progression Map): `6px` radius (`28px` square cells)
  - Stepper Controls: Large `64px` circular or rounded-square buttons.

## 2. Component Mapping & Layout Controls

- **Vuetify Defaults**: ALWAYS convert raw HTML/CSS exports into standard Vuetify components (`v-container`, `v-row`, `v-col`, `v-card`, `v-btn`, `v-dialog`, `v-list`).
- **Zero Custom CSS for Layout**: Never write custom CSS for margins, padding, or flex layouts. Use Vuetify utility classes (`pa-4`, `d-flex`, `align-center`, `gap-2`, `elevation-0`).
- **Scoped Styles Restriction**: `<style scoped>` is strictly forbidden except for specialized keyframe animations (e.g., pulse borders) or canvas components.

## 3. Reactivity & Performance Boundaries

- **Script Setup Syntax**: Always use `<script setup lang="ts">` with `ref()` or `shallowRef()`.
- **Anti-Thrashing Rule (Critical)**: Timers (e.g., `WorkoutTimerClock.vue`) MUST be isolated inside self-contained components using `performance.now()` deltas. Never trigger full page or parent component re-renders on 1Hz timer ticks.
- **Floor Ergonomics Rule**: During active exercise phases, enforce a zero-touch UI (no interactive controls visible except `Pause`). Interactive stepper controls appear strictly during rest phases.
- **Onboarding Architecture**: Onboarding uses a single-route state machine (`/onboarding`) backed by Pinia. Do not create multi-route page splits for onboarding steps.
