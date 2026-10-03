<template>
  <v-card
    color="surface"
    rounded="lg"
    class="pa-6 position-relative overflow-hidden card-dialog"
  >
    <div class="text-center mb-8 mt-4">
      <p class="fc-caption text-primary text-uppercase tracking-widest">
        Safety Protocol
      </p>
      <h2 class="fc-exercise text-on-surface text-uppercase">
        How do you feel?
      </h2>
    </div>

    <v-row class="mb-8">
      <v-col cols="6">
        <v-card
          :color="selected === 'great' ? 'primary-container' : 'surface'"
          rounded="lg"
          class="pa-6 text-center cursor-pointer transition-all d-flex flex-column align-center justify-center option-card"
          :class="{ 'selected-great': selected === 'great' }"
          @click="selected = 'great'"
        >
          <div class="emoji-text mb-3">💪</div>
          <span
            class="fc-body-strong text-uppercase"
            :class="
              selected === 'great'
                ? 'text-on-primary-container'
                : 'text-on-surface'
            "
            >Great</span
          >
        </v-card>
      </v-col>
      <v-col cols="6">
        <v-card
          :color="selected === 'sore' ? 'surface-elevated' : 'surface'"
          rounded="lg"
          class="pa-6 text-center cursor-pointer transition-all d-flex flex-column align-center justify-center option-card"
          :class="{ 'selected-sore': selected === 'sore' }"
          @click="selected = 'sore'"
        >
          <div class="emoji-text mb-3">😓</div>
          <span class="fc-body-strong text-uppercase text-on-surface"
            >Stiff or sore</span
          >
        </v-card>
      </v-col>
    </v-row>

    <v-alert v-if="showRetryError" type="error" density="compact" class="mb-4">
      Failed to save session telemetry. Please tap Save to try again.
    </v-alert>

    <div class="pt-4 mb-4">
      <v-btn
        color="primary-container"
        block
        size="x-large"
        rounded="lg"
        class="text-on-primary-fixed"
        @click="save"
        :disabled="!selected || isSealing"
        :loading="isSealing"
      >
        <span class="fc-body-strong">Save & continue</span>
        <v-icon end>mdi-chevron-right</v-icon>
      </v-btn>
    </div>

    <!-- Countdown Bar -->
    <div class="position-absolute bottom-0 left-0 w-100">
      <div
        class="px-6 py-2 bg-surface d-flex justify-space-between align-center border-top-accent"
      >
        <div class="d-flex align-center ga-2 text-primary">
          <v-icon size="small">mdi-cloud-upload</v-icon>
          <span class="fc-caption text-uppercase tracking-wide"
            >Auto-saving in
            <span class="font-weight-bold">{{ remainingSeconds }}</span
            >s</span
          >
        </div>
      </div>
      <v-progress-linear
        :model-value="countdownPct"
        color="primary"
        height="4"
        bg-color="surface-variant"
      />
    </div>
  </v-card>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { TelemetryService } from '@/core/telemetry/TelemetryService'

  const props = defineProps<{
    sessionToken: string
  }>()

  const emit = defineEmits<{
    (e: 'saved'): void
    (e: 'seal-failed'): void
  }>()

  const SEAL_TIMEOUT = 60
  const selected = ref<'great' | 'sore' | null>(null)
  const remainingSeconds = ref(SEAL_TIMEOUT)
  const isSealing = ref(false)
  const showRetryError = ref(false)
  const telemetry = new TelemetryService()

  const countdownPct = computed(
    () => ((SEAL_TIMEOUT - remainingSeconds.value) / SEAL_TIMEOUT) * 100
  )

  let timer: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    timer = setInterval(() => {
      remainingSeconds.value--
      if (remainingSeconds.value <= 0) autoSeal()
    }, 1000)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
    if (!selected.value && !isSealing.value) {
      autoSeal()
    }
  })

  async function autoSeal() {
    if (isSealing.value) return
    isSealing.value = true
    if (timer) clearInterval(timer)
    try {
      await telemetry.sealSessionTelemetryAsync(props.sessionToken, true, true)
      emit('saved')
    } catch {
      emit('seal-failed')
    }
  }

  async function save() {
    if (!selected.value || isSealing.value) return
    isSealing.value = true
    showRetryError.value = false
    if (timer) clearInterval(timer)
    try {
      await telemetry.sealSessionTelemetryAsync(
        props.sessionToken,
        selected.value === 'sore',
        false
      )
      emit('saved')
    } catch {
      isSealing.value = false
      showRetryError.value = true
    }
  }
</script>

<style scoped>
  .card-dialog {
    padding-bottom: 64px !important;
  }
  .tracking-widest {
    letter-spacing: 0.2em;
  }
  .tracking-wide {
    letter-spacing: 1px;
  }
  .option-card {
    height: 160px;
    border: 2px solid transparent;
  }
  .selected-great {
    border: 2px solid rgb(var(--v-theme-primary-container));
  }
  .selected-sore {
    border: 2px solid rgb(var(--v-theme-primary));
  }
  .emoji-text {
    font-size: 48px;
    line-height: 1;
  }
  .border-top-accent {
    border-top: 1px solid rgba(var(--v-theme-surface-variant), 0.5);
  }
  .text-on-primary-fixed {
    color: #291800 !important;
  }
</style>
