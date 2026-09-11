<template>
  <v-bottom-navigation
    active-class="text-primary bg-surface-elevated"
    bg-color="surface"
    class="bottom-nav border-top-accent"
    fixed
  >
    <v-btn :to="{ name: 'dashboard' }" class="h-100 px-2 rounded-lg nav-btn">
      <v-icon size="24" class="mb-1">mdi-calendar-today</v-icon>
      <span class="fc-caption">Today</span>
    </v-btn>
    <v-btn
      :to="{ name: 'workout-setup' }"
      class="h-100 px-2 rounded-lg nav-btn"
    >
      <v-icon size="24" class="mb-1">mdi-weight-lifter</v-icon>
      <span class="fc-caption">Workout</span>
    </v-btn>
    <v-btn :to="{ name: 'progress' }" class="h-100 px-2 rounded-lg nav-btn">
      <v-icon size="24" class="mb-1">mdi-chart-line</v-icon>
      <span class="fc-caption">Progress</span>
    </v-btn>
    <v-btn :to="{ name: 'settings' }" class="h-100 px-2 rounded-lg nav-btn">
      <v-icon size="24" class="mb-1">mdi-cog</v-icon>
      <span class="fc-caption">Settings</span>
    </v-btn>
  </v-bottom-navigation>
</template>

<script setup lang="ts"></script>

<style scoped>
  .bottom-nav {
    height: 80px;
  }
  .border-top-accent {
    border-top: 1px solid rgba(var(--v-theme-surface-variant), 0.5);
  }
  .nav-btn {
    min-width: 64px;
  }
</style>
