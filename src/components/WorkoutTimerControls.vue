<template>
  <v-row justify="space-between" class="ma-4">
    <v-col cols="auto">
      <v-btn
        :icon="resetIcon"
        color="primary"
        variant="text"
        @click="$emit('timer:reset')"
      >
        <v-icon></v-icon>
      </v-btn>
    </v-col>
    <v-col cols="auto">
      <v-btn
        :icon="playPauseIcon"
        color="primary"
        size="x-large"
        variant="outlined"
        @click="$emit(`${'timer:run-or-stop'}`)"
      >
      </v-btn>
    </v-col>
    <v-col cols="auto">
      <v-btn
        :icon="skipIcon"
        color="primary"
        variant="text"
        @click="$emit('timer:skip')"
      >
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  const props = defineProps<{
    isRunning: boolean
  }>()

  defineEmits<{
    'timer:run-or-stop': () => void
    'timer:skip': () => void
    'timer:reset': () => void
  }>()

  const skipIcon = 'mdi-skip-next'
  const resetIcon = 'mdi-restart'
  const playPauseIcon = computed(() =>
    props.isRunning ? 'mdi-pause' : 'mdi-play'
  )
</script>
