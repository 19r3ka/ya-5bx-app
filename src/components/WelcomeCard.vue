<template>
  <v-card class="pa-4 mb-4" outlined>
    <v-card-title class="text-h5 font-weight-bold text-center">
      {{ $t('welcomeCard.greeting', { name: user?.name || 'Guest' }) }}
    </v-card-title>
    <v-card-text class="text-center">
      <p class="text-subtitle-1">{{ userNotifications }}</p>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import { useUser } from '@/composables/useUser'

  const { user } = useUser()

  //   a placeholder message that will be later personalized
  const userNotifications = 'No notifications'
</script>
