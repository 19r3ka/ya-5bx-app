<template>
  <div class="fill-height d-flex flex-column justify-space-between pa-6">
    <div class="mt-8">
      <!-- Headline -->
      <h1
        class="fc-timer text-primary text-uppercase mb-8"
        style="line-height: 1.1"
      >
        {{ $t('onboarding.hook.headline1') }}<br />
        {{ $t('onboarding.hook.headline2') }}<br />
        {{ $t('onboarding.hook.headline3') }}
      </h1>

      <!-- Heritage Body Text -->
      <div
        class="pl-4 py-2"
        style="
          border-left: 2px solid rgba(var(--v-theme-primary-container), 0.3);
        "
      >
        <p class="fc-body-lg text-on-surface mb-6">
          {{ $t('onboarding.hook.bodyPrefix') }}
          <span class="text-primary font-weight-bold">{{
            $t('onboarding.hook.airForce')
          }}</span>
          {{ $t('onboarding.hook.bodySuffix') }}
        </p>
        <p class="fc-body text-on-surface-variant">
          {{ $t('onboarding.hook.bodySecondary') }}
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
        <span class="fc-section">{{ $t('onboarding.hook.cta') }}</span>
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
  const emit = defineEmits<{
    (e: 'next'): void
  }>()
</script>
