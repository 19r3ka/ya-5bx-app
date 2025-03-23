<script setup lang="ts">
  import { onMounted } from 'vue'
  import HomePage from './views/HomePage.vue'
  import OnboardingPage from './views/OnboardingPage.vue'
  import { useUser } from './composables/useUser'

  const { user, loadUser } = useUser()

  onMounted(() => {
    loadUser()
  })
</script>

<template>
  <v-app>
    <v-main>
      <component :is="user ? HomePage : OnboardingPage" />
    </v-main>
  </v-app>
</template>

<style scoped></style>
