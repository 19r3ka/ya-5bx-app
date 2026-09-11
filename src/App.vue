<script setup lang="ts">
  import { onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { useUser } from './composables/useUser'
  import BottomNav from '@/components/layout/BottomNav.vue'

  const { loadUser } = useUser()
  const route = useRoute()

  onMounted(() => {
    loadUser()
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
