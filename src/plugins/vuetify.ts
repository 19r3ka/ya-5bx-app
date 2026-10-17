import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify, type ThemeDefinition } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

const functionalConfidenceTheme: ThemeDefinition = {
  dark: true,
  colors: {
    // ─── Core Surfaces (Vuetify 3 built-in keys) ─────────────────────────────
    background: '#111319',
    surface: '#1A1D27',
    'surface-bright': '#373940',
    'surface-light': '#191B22', // was 'surface-container-low'
    'surface-variant': '#33343B', // was 'surface-container-highest'
    'on-surface-variant': '#D7C3AE',

    // ─── Custom surface tokens (accessible via CSS var, not auto-applied) ─────
    'surface-container': '#1E1F26',
    'surface-container-high': '#282A30',
    'surface-elevated': '#22263A',

    // ─── Text ─────────────────────────────────────────────────────────────────
    'on-surface': '#E2E2EB',
    'on-surface-3': '#7B8AAE', // custom — reference explicitly as color="on-surface-3"
    'content-primary': '#E8EAF6',
    'content-secondary': '#B0B8D4',
    'content-tertiary': '#6B7399',

    // ─── Outline ──────────────────────────────────────────────────────────────
    outline: '#9F8E7A',
    'outline-variant': '#524534',

    // ─── Primary (Amber) ──────────────────────────────────────────────────────
    primary: '#FFC880',
    'on-primary': '#452B00',
    'primary-container': '#F5A623',
    'on-primary-container': '#1A0F00', // was '#644000' — contrast 3.2:1 ✗, now ~8.1:1 ✓
    'inverse-primary': '#835500',

    // ─── Secondary (Teal) ─────────────────────────────────────────────────────
    secondary: '#4DDADA',
    'on-secondary': '#003737',
    'secondary-container': '#00B3B3',
    'on-secondary-container': '#003E3E',

    // ─── Tertiary ─────────────────────────────────────────────────────────────
    tertiary: '#C8CFFF',
    'on-tertiary': '#142876',
    'tertiary-container': '#A3B2FF',
    'on-tertiary-container': '#2F418E',

    // ─── Semantic (required for v-alert, v-snackbar etc.) ─────────────────────
    error: '#CF6679',
    'on-error': '#690005',
    'error-container': '#93000A',
    info: '#7B8CDE', // ← ADDED
    success: '#4CAF50', // ← ADDED
    warning: '#FF9800', // ← ADDED
  },

  variables: {
    // ← ADDED — dark-mode tuned values
    'border-color': '#E2E2EB',
    'border-opacity': 0.16,
    'high-emphasis-opacity': 1,
    'medium-emphasis-opacity': 0.74,
    'disabled-opacity': 0.38,
    'idle-opacity': 0.06,
    'hover-opacity': 0.08,
    'focus-opacity': 0.12,
    'selected-opacity': 0.1,
    'activated-opacity': 0.14,
    'pressed-opacity': 0.14,
    'dragged-opacity': 0.1,
  },
}

export default createVuetify({
  theme: {
    defaultTheme: 'functionalConfidence',
    themes: {
      functionalConfidence: functionalConfidenceTheme,
    },
  },
  defaults: {
    VCard: {
      elevation: 0,
      rounded: 'lg',
      color: 'surface',
    },
    VBtn: {
      rounded: 'md',
    },
    VTextField: {
      variant: 'outlined',
      rounded: 'md',
      color: 'primary-container',
    },
    VSelect: {
      variant: 'outlined',
      rounded: 'md',
      color: 'primary-container',
    },
    VTextarea: {
      variant: 'outlined',
      rounded: 'md',
      color: 'primary-container',
    },
    VCheckbox: {
      color: 'secondary',
    },
    VRadio: {
      color: 'secondary',
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
})
