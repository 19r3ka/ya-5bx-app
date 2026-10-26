<template>
  <v-dialog
    :model-value="modelValue"
    max-width="500"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card color="surface-elevated" rounded="lg" class="pa-6">
      <div class="d-flex justify-space-between align-center mb-4">
        <div class="d-flex align-center ga-2">
          <v-icon color="primary" size="28">mdi-information-outline</v-icon>
          <h3 class="fc-section text-primary text-uppercase mb-0">
            {{ $t('help.title') }}
          </h3>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          @click="emit('update:modelValue', false)"
        ></v-btn>
      </div>

      <div class="mb-4">
        <p class="fc-body-strong text-on-surface mb-2">
          {{ $t('help.subtitle') }}
        </p>
        <p class="fc-body text-on-surface-variant mb-3">
          {{ $t('help.intro') }}
        </p>
        <p class="fc-body text-on-surface-variant mb-0">
          {{ $t('help.listIntro') }}
        </p>
        <ul class="text-on-surface-variant pl-4 mt-2 fc-caption">
          <li>
            <strong>{{ $t('help.items.stretching.label') }}</strong
            >:
            {{ $t('help.items.stretching.detail') }}
          </li>
          <li>
            <strong>{{ $t('help.items.sitUps.label') }}</strong
            >:
            {{ $t('help.items.sitUps.detail') }}
          </li>
          <li>
            <strong>{{ $t('help.items.backExtensions.label') }}</strong
            >:
            {{ $t('help.items.backExtensions.detail') }}
          </li>
          <li>
            <strong>{{ $t('help.items.pushUps.label') }}</strong
            >:
            {{ $t('help.items.pushUps.detail') }}
          </li>
          <li>
            <strong>{{ $t('help.items.aerobic.label') }}</strong
            >:
            {{ $t('help.items.aerobic.detail') }}
          </li>
        </ul>
      </div>

      <v-card
        color="surface"
        rounded="lg"
        class="pa-3 mb-6 border-surface-variant"
      >
        <div class="d-flex align-center ga-2 text-secondary mb-1">
          <v-icon size="small">mdi-shield-check-outline</v-icon>
          <span class="fc-caption font-weight-bold text-uppercase">{{
            $t('help.progressionTitle')
          }}</span>
        </div>
        <p class="fc-caption text-on-surface-variant mb-0">
          {{ $t('help.progressionBody') }}
        </p>
      </v-card>

      <v-btn
        color="primary"
        block
        size="large"
        rounded="md"
        @click="emit('update:modelValue', false)"
      >
        {{ $t('help.close') }}
      </v-btn>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  defineProps<{
    modelValue: boolean
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', val: boolean): void
  }>()
</script>
