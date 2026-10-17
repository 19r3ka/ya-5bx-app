<template>
  <div class="fill-height d-flex flex-column justify-space-between pa-6">
    <div class="mt-8">
      <!-- Headline -->
      <h1
        class="fc-timer text-primary text-uppercase mb-8"
        style="line-height: 1.1"
      >
        11 MINUTES.<br />
        NO EQUIPMENT.<br />
        EVERY DAY.
      </h1>

      <!-- Heritage Body Text -->
      <div
        class="pl-4 py-2"
        style="
          border-left: 2px solid rgba(var(--v-theme-primary-container), 0.3);
        "
      >
        <p class="fc-body-lg text-on-surface mb-6">
          Born from the rigorous demands of the
          <span class="text-primary font-weight-bold"
            >Royal Canadian Air Force</span
          >
          in the 1950s, the 5BX (Five Basic Exercises) system was engineered for
          maximum results in minimum time.
        </p>
        <p class="fc-body text-on-surface-variant">
          No gym memberships. No complex gear. Just a scientifically sequenced
          physical fitness plan designed to reach peak condition wherever you
          are.
        </p>
      </div>
    </div>

    <div class="mb-4">
      <v-btn
        color="primary-container"
        block
        size="x-large"
        rounded="md"
        class="mb-4"
        append-icon="mdi-arrow-right"
        @click="emit('next')"
      >
        <span class="fc-section">Let's go</span>
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
  const emit = defineEmits<{
    (e: 'next'): void
  }>()
</script>
