<template>
  <v-row class="ma-0" align="center" justify="space-around">
    <v-btn
      v-for="(option, index) in workoutOptions"
      :key="index"
      icon
      flat
      class="ma-2"
      @click="handleClick(option.action)"
    >
      <v-icon>{{ option.icon }}</v-icon>
    </v-btn>
  </v-row>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  const workoutOptions = ref([
    {
      icon: 'mdi-poll',
      color: 'success',
      action: 'history',
    },
    {
      icon: 'mdi-information-outline',
      color: 'info',
      action: 'details',
    },
    {
      icon: 'mdi-account-box-outline',
      color: 'warning',
      action: 'profile',
    },
    {
      icon: 'mdi-tune-variant',
      color: 'secondary',
      action: 'settings',
    },
  ])

  const handleClick = (action: string) => {
    // Emit an event to handle the click action
    emit('click', action)
  }

  const emit = defineEmits(['click'])
</script>
