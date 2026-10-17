<script setup lang="ts">
  import { onMounted, onUnmounted } from 'vue'
  import { useProgressionStore } from '../stores/useProgressionStore'

  const props = defineProps<{
    sessionToken: string
    modelValue?: boolean
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'sealed'): void
  }>()

  const store = useProgressionStore()
  let timerId: ReturnType<typeof setTimeout> | null = null
  let hasSealed = false

  const sealTelemetry = async (
    isStiffOrSore: boolean,
    isConservative = false
  ): Promise<void> => {
    if (hasSealed) return
    hasSealed = true

    if (timerId !== null) {
      clearTimeout(timerId)
      timerId = null
    }

    await store.telemetryService.sealSessionTelemetryAsync(
      props.sessionToken,
      isStiffOrSore,
      isConservative
    )
    await store.reloadHistoryAsync()
    emit('update:modelValue', false)
    emit('sealed')
  }

  const handleFine = async (): Promise<void> => {
    await sealTelemetry(false, false)
  }

  const handleStiffOrSore = async (): Promise<void> => {
    await sealTelemetry(true, false)
  }

  onMounted(() => {
    timerId = setTimeout(() => {
      // Safety Fallback: 60s timeout fires -> seal conservative
      sealTelemetry(true, true)
    }, 60000)
  })

  onUnmounted(() => {
    // Safety Fallback: component unmounts before choice -> seal conservative
    if (!hasSealed) {
      sealTelemetry(true, true)
    }
  })
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    persistent
    max-width="500px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="pa-4 text-center">
      <v-card-title class="text-h5 font-weight-bold">
        Workout Completed!
      </v-card-title>
      <v-card-text class="py-4">
        How do you feel after this session? Please indicate if you feel any
        stiffness or soreness.
      </v-card-text>
      <v-card-actions class="justify-center ga-4">
        <v-btn
          color="success"
          variant="elevated"
          size="large"
          @click="handleFine"
        >
          I feel fine
        </v-btn>
        <v-btn
          color="warning"
          variant="elevated"
          size="large"
          @click="handleStiffOrSore"
        >
          I am stiff / sore
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
