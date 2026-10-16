# Project Constitution: YA-5bx

## Core Principles

### 1. Data Sovereignty and Portability

- All user data, workout history, and progression state remain on-device. No backend, cloud synchronization, telemetry, analytics, or third-party tracking.
- Outbound network requests must be limited to explicitly approved, non-user-data purposes necessary for application delivery or updates.
- Structured persistent workout history must use an appropriate transactional storage mechanism, preferably IndexedDB. Lightweight profile metadata, onboarding drafts, and user preferences may use Local Storage as an explicit exception.
- Users must be able to export and restore their data in documented, open formats (including a lossless canonical format for complete backups and `.tcx` for supported workout interoperability).
- Storage failures, invalid imports, and migration failures must be handled without silently corrupting or discarding user data.

### 2. Data Integrity and Domain Contracts

- Core domain models, progression algorithms, and state transitions must have explicit, versioned contracts (utilizing versioned RCAF 5BX Official Tables v1.0).
- Runtime validation is mandatory at persistence, import, and other untrusted-data boundaries.
- Progression rules and RCAF datasets must be deterministic, reproducible, and covered by automated tests, including boundary and invalid-input cases.
- Schema and dataset changes must include backward-compatible migration or an explicit, tested recovery strategy.

### 3. Offline-First Operation

- All core features must function without an internet connection after the application has been installed and its required assets have been cached.
- Core features include workout execution, timers, audio cues, progression calculations, and access to required local datasets.
- Service-worker caching, application updates, and asset versioning must preserve offline usability.
- Network failures and interrupted updates must degrade gracefully without compromising stored data or active workout state.

### 4. Bilingual Parity

- English and French are equally supported first-class languages.
- All user-facing text, validation errors, notifications, accessibility labels, and relevant date, time, and number formatting must be localized.
- No user-facing string may be hardcoded outside the localization system.
- Automated checks must detect missing translations, and both languages must be tested for functional parity.

### 5. Reliable Timing and Lifecycle Safety

- Workout timing must be based on clock-derived deadlines, not solely on accumulated interval callbacks.
- Screen Wake Lock API integration must be used where supported and appropriate, without treating it as a guarantee against browser suspension.
- The application must handle visibility changes, device sleep, wake-lock release, and interrupted execution according to a documented timing policy: **workouts pause upon backgrounding or visibility loss**.
- Timer recovery must not silently skip, duplicate, or misrepresent workout intervals.
- Timing limitations imposed by the browser or operating system must be handled explicitly and communicated when material to workout execution.

### 6. Accessibility and Usability

- Core workflows must support keyboard navigation, accessible control names, and assistive technologies.
- Color must not be the sole means of communicating status.
- Responsive layouts must remain usable on supported mobile devices and installed-PWA environments.

## Technical Constraints

- **Client-side only:** No application backend, server-side accounts, or cloud persistence.
- **PWA:** Installable and usable offline after initial installation and caching.
- **TypeScript:** Strict type checking for application code; runtime validation at external and persistence boundaries.
- **Dependencies:** Prefer maintained, minimal dependencies. New dependencies must not violate privacy, offline, security, or licensing requirements.

## Quality Gates

Before a change is considered complete:

1. **Static checks:** `vue-tsc -b`, linting, formatting, and production build must pass.
2. **Automated tests:** Relevant unit, integration, and end-to-end tests must pass. Domain logic, progression boundaries, persistence, and migrations require explicit coverage.
3. **Contract validation:** Storage schemas and RCAF progression datasets must pass automated validation and regression checks.
4. **Offline and PWA checks:** Verify offline startup, core workflows, cached assets, and update-failure behavior.
5. **Localization checks:** Verify translation completeness and core workflow parity in English and French.
6. **Privacy checks:** Review dependency changes and network requests for violations of data-sovereignty requirements.
7. **Regression protection:** No change may silently discard user data, bypass progression constraints, or regress critical workout workflows.

Required quality gates must pass before merging or committing, as enforced by the project's configured workflow. Any exception must be documented, justified, and explicitly approved.

## Constitutional Governance

- These principles take precedence over conflicting implementation preferences and lower-level project documentation.
- Changes to these principles require explicit review and an updated constitution.
- Implementation details belong in architecture documentation; feature behavior and acceptance criteria belong in specifications and tests.
- When requirements conflict, prioritize user data integrity, privacy, and safe workout execution.
