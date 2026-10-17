# YA-5bx

Personal fitness companion and offline-first workout app based on the Royal Canadian Air Force 5BX (Five Basic Exercises) 11-minute daily plan.

[![Vue 3](https://img.shields.io/badge/Vue-3-brightgreen.svg)](https://v3.vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vuetify](https://img.shields.io/badge/Vuetify-%231867C0.svg?style=flat&logo=vuetify&logoColor=white)](https://vuetifyjs.com/)

## Status (agents read)

active · Core 5BX workout engine, onboarding, progress tracking, timer, and offline storage implemented.

## Overview (agents read)

- Problem: Achieving and maintaining physical fitness with minimal time, zero equipment, and no reliance on an internet connection.
- Users: Individuals looking for a structured, time-efficient (11 minutes/day) bodyweight workout routine.
- Key features:
  - 11-minute structured 5BX workouts with audio feedback and timer engine.
  - Progression tracking across charts and levels based on RCAF tables and age targets.
  - Offline-first operation saving data locally via IndexedDB and Local Storage.
  - Responsive Vuetify-powered UI for desktop and mobile devices.
  - Multi-language support (English and French).
- Out of scope: Cloud synchronization, backend user accounts, multi-user online social features, and custom exercise builders.

## Quick start

```sh
npm install
npm run dev
npm run build
```

All scripts: see `package.json` scripts section.

## Tech stack

Names only. Versions are in `package.json` and `package-lock.json`.

- Language and runtime: TypeScript, Node
- Framework and UI: Vue 3, Vuetify, Pinia, Vue Router, Vue I18n
- Data and storage: IndexedDB, Local Storage
- Testing and tooling: Vite, vite-plugin-pwa, ESLint, Prettier, Husky

## Project structure

One line per folder or key file: what lives there, what must not.

```text
src/
  assets/       Styles and visual design tokens (typography, global CSS)
  composables/  Reusable Vue composition functions (timer, audio, workout engine)
  core/         Core domain logic, progression validation, workout orchestrator, and storage adapters
  data/         Static 5BX configuration datasets (age groups, charts, exercises, levels)
  locales/      i18n translation catalogs (en, fr)
  models/       Domain entity TypeScript types and interfaces
  plugins/      Vue plugins configuration (Vuetify, i18n)
  router/       Client-side routing table
  stores/       Pinia state management stores
  utils/        Helper functions and chart/level calculations
  views/        Page-level route views (ActiveWorkout, Dashboard, Onboarding, Progress, Settings)
public/         Static public assets, icons, and exercise illustrations
specs/          Feature specifications, UX designs, and implementation plans
```

## Architecture (agents read)

- Data flow: Views trigger actions via Composables and Pinia stores -> Core orchestration logic -> Storage adapters (IndexedDB / Local Storage).
- Key decisions: see `PLAN.md` and `DECISIONS.md`.
- Conventions specific to this repo:
  - Offline-first with local persistence; avoid external network calls during workout.
  - Composition API with `<script setup>` for Vue components.
  - Exercise charts and progression adhere to standard RCAF 5BX rules.

## Configuration (agents read)

- Env variables: None required currently (entirely offline/client-side static PWA).
- Config files: `vite.config.ts` (Vite, PWA, Vuetify config), `tsconfig.json` (TypeScript options), `eslint.config.js` (linting).

## Data and domain notes (agents read)

- Data model: User profile, Chart (1-6), Level (D- to A+), Exercise definitions, Workout history records, Progression state.
- Domain terms:
  - 5BX: Five Basic Exercises (calisthenics routine designed by RCAF).
  - Chart: A progression bracket containing 12 distinct levels of exercise difficulty.
  - Level: Sub-step within a chart (D-, D, D+, C-, C, C+, B-, B, B+, A-, A, A+).

## Testing

- Approach: Code quality and build validation via TypeScript typechecking, Vue compilation, and ESLint.
- Run: `npm run build && npm run lint`

## Specs and workflow

- `SPEC.md`: what to build and acceptance criteria
- `PLAN.md`: architecture and decisions
- `TASKS.md`: current work queue
- `DECISIONS.md`: running decision log
- `AGENTS.md`: rules for AI agents

## Deployment

Web/PWA. Client-side static build deployable to any web host or usable offline as an installed PWA.

## Roadmap

- [ ] Complete active Phase specs in `specs/`
- [ ] Add automated unit testing suite (Vitest/Playwright)

## Contributing

We welcome non-commercial contributions! If you're interested in improving YA-5bx, please:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Submit a pull request with a clear description of your changes.

**Please note:** Any derivative works (modifications or improvements) must also be licensed under the **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License (CC BY-NC-SA 4.0)**.

## License

This project is licensed under the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-nc-sa/4.0/) (CC BY-NC-SA 4.0). See the `LICENSE` file for details.
