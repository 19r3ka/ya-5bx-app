---
name: Functional Confidence
colors:
  surface: '#1A1D27'
  surface-dim: '#111319'
  surface-bright: '#373940'
  surface-container-lowest: '#0c0e14'
  surface-container-low: '#191b22'
  surface-container: '#1e1f26'
  surface-container-high: '#282a30'
  surface-container-highest: '#33343b'
  on-surface: '#e2e2eb'
  on-surface-variant: '#d7c3ae'
  inverse-surface: '#e2e2eb'
  inverse-on-surface: '#2e3037'
  outline: '#9f8e7a'
  outline-variant: '#524534'
  surface-tint: '#ffb955'
  primary: '#ffc880'
  on-primary: '#452b00'
  primary-container: '#f5a623'
  on-primary-container: '#644000'
  inverse-primary: '#835500'
  secondary: '#4ddada'
  on-secondary: '#003737'
  secondary-container: '#00b3b3'
  on-secondary-container: '#003e3e'
  tertiary: '#c8cfff'
  on-tertiary: '#142876'
  tertiary-container: '#a3b2ff'
  on-tertiary-container: '#2f418e'
  error: '#CF6679'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffddb4'
  primary-fixed-dim: '#ffb955'
  on-primary-fixed: '#291800'
  on-primary-fixed-variant: '#633f00'
  secondary-fixed: '#6ff7f6'
  secondary-fixed-dim: '#4ddada'
  on-secondary-fixed: '#002020'
  on-secondary-fixed-variant: '#004f50'
  tertiary-fixed: '#dde1ff'
  tertiary-fixed-dim: '#b9c3ff'
  on-tertiary-fixed: '#001356'
  on-tertiary-fixed-variant: '#2f408d'
  background: '#111319'
  on-background: '#e2e2eb'
  surface-variant: '#33343b'
  surface-elevated: '#22263A'
  primary-dim: '#7A5312'
  secondary-dim: '#1A5A5A'
  success: '#4CAF50'
  text-primary: '#E8EAF6'
  text-secondary: '#B0B8D4'
  text-tertiary: '#6B7399'
typography:
  timer-display:
    fontFamily: JetBrains Mono
    fontSize: 72px
    fontWeight: '600'
    lineHeight: 80px
    letterSpacing: -2px
  exercise-name:
    fontFamily: Barlow Condensed
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: 0.5px
  rep-target:
    fontFamily: JetBrains Mono
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
  section-header:
    fontFamily: Barlow Condensed
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 1.5px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-emphasis:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  caption:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  grid-unit: 4px
  touch-target-min: 48px
  stepper-button: 64px
  container-padding: 24px
  section-gap: 24px
  gutter: 16px
---

# Design System: Functional Confidence

## Brand & Style

The design system is built on a foundation of **Functional Confidence**, a style that bridges the gap between rugged military utility and sleek modern digital clarity. It is designed specifically for high-intensity fitness environments where legibility at a distance is paramount.

The aesthetic follows a **Corporate / Modern** framework with a **Minimalist** focus on information density. It prioritizes "Distance UI"—ensuring that a user performing floor exercises can glance at their device from over a meter away and instantly comprehend their progress, remaining time, and next task. The atmosphere is disciplined and technical, yet calm and encouraging, eschewing aggressive gamification for professional reliability.

## Colors

The color palette is optimized for a high-contrast dark mode environment to prevent eye strain and maximize visibility in varied lighting conditions.

- **Primary (Amber):** Used for critical actions, active timers, and primary calls to action. It signals "Active" or "In-Progress."
- **Secondary (Teal):** Dedicated to progress, completion, and achievements. It signals "Success" and "Movement."
- **Neutral (Dark Core):** The foundation is a deep, near-black slate. Layering is achieved through shifting hues of charcoal and navy rather than transparency.
- **Semantic Logic:** Success (Green) and Error (Muted Red) are used sparingly to maintain the focus on the Brand/Progress colors.

## Typography

This design system employs a tri-font strategy to balance heritage and technical utility.

- **Barlow Condensed:** Used for headers and exercise titles. Its tall, narrow profile evokes military signage and provides high impact without wasting horizontal space.
- **Inter:** The workhorse for all instructional and body text. It ensures maximum readability for complex movement descriptions.
- **JetBrains Mono:** Reserved exclusively for data, timers, and repetitions. The monospaced nature prevents "shimmering" or layout shifts as numbers count down, providing a stable visual anchor.

All headings should favor uppercase to reinforce the disciplined, utilitarian nature of the system.

## Layout & Spacing

The system follows a strict **4px grid** to ensure mathematical harmony across all components.

The layout model is a **fluid grid** for mobile-first application, but with heavy constraints on vertical rhythm. Given the "Distance UI" requirements, touch targets are intentionally oversized. Any primary interactive element must meet a minimum of 48px, while high-frequency exercise controls (like incrementing reps) use a 64px hit area to accommodate sweaty or shaking hands.

Horizontal margins are set to 24px for main containers to provide a visual breathing room against the screen edges, while internal component gutters sit at 16px.

## Elevation & Depth

The system rejects traditional shadows in favor of **Tonal Layers**. Hierarchy is communicated through color luminance:

- **Level 0 (Base):** `#0F1117` - The main background.
- **Level 1 (Surface):** `#1A1D27` - Standard cards and navigation bars.
- **Level 2 (Elevated):** `#22263A` - Interactive cards, modals, and active states.

During a "Paused" state, a 60% dimmed overlay is applied to the entire viewport to maintain context while signaling a break in the workout flow. Borders are used instead of shadows to define the boundaries of input fields and active containers, maintaining a flat, architectural feel.

## Shapes

The shape language is "Rounded-Soft," balancing the harshness of the high-contrast dark theme with approachable geometry.

- **Cards:** Use a 12px (`rounded-lg`) radius to create clear containment for exercise data.
- **Buttons & Inputs:** Use an 8px (`rounded-md`) radius for a more precise, tool-like feel.
- **Data Cells:** Small indicators, such as the progression map cells, use a 6px radius to maintain distinctness even at small scales.

## Components

### Buttons

- **Primary:** Solid `#F5A623` background with dark text. 8px radius.
- **Secondary:** Outlined with a 2px border in `#3ECFCF` or `#B0B8D4`.
- **Stepper Buttons:** Large 64px circular or rounded-square buttons for rapid tap interactions during workouts.

### Cards

- **Exercise Card:** `#1A1D27` background, 12px radius, no shadow. Uses `#F5A623` for the left-hand accent border when the exercise is active.
- **Progress Card:** Uses `#1A5A5A` (Secondary-dim) to indicate completed sections.

### Inputs

- **Text Fields:** Outlined variant with an 8px radius. 2px solid `#F5A623` border on focus.
- **Checkboxes/Radios:** Use `#3ECFCF` for checked states to signal positive completion.

### Interactive Elements

- **Timers:** Full-width display with `#F5A623` text. When the timer expires, the border of the container should pulse in Amber.
- **Progression Map:** 28px square cells with 6px radius. Empty states are `#22263A`; completed states are `#3ECFCF`.

### Iconography

- Use **Material Design Icons (MDI)**.
- Standard UI icons: 24px.
- Primary Action/FAB: 32px.
- Exercise status indicators: 14px.
