<script setup lang="ts">
  import { onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { useProgressionStore } from '@/stores/useProgressionStore'
  import { useUserStore } from '@/stores/useUserStore'
  import BottomNav from '@/components/layout/BottomNav.vue'
  import StorageWarningBanner from '@/components/common/StorageWarningBanner.vue'

  const route = useRoute()
  const progressionStore = useProgressionStore()
  const userStore = useUserStore()

  onMounted(async () => {
    await progressionStore.initAsync()
  })
</script>

<template>
  <v-app>
    <StorageWarningBanner :visible="userStore.storageWriteFailed" />
    <v-main>
      <router-view />
    </v-main>
    <BottomNav
      v-if="route.name !== 'onboarding' && route.name !== 'active-workout'"
    />
  </v-app>
</template>

<style scoped></style>
