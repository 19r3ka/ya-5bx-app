<script setup lang="ts">
  import { onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { useProgressionStore } from '@/stores/useProgressionStore'
  import BottomNav from '@/components/layout/BottomNav.vue'

  const route = useRoute()
  const progressionStore = useProgressionStore()

  onMounted(async () => {
    await progressionStore.initAsync()
  })
</script>

<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
    <BottomNav
      v-if="route.name !== 'onboarding' && route.name !== 'active-workout'"
    />
  </v-app>
</template>

<style scoped></style>
