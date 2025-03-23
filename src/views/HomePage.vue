<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="6" lg="4">
        <template v-if="user">
          <WelcomeCard />
          <WorkoutOptions @click="handleClick" />
          <LevelOverview />
          <LevelDetails :level-id="user.currentLevel" />
        </template>
        <template v-else>
          <p>Login ASAP</p>
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
  import WelcomeCard from '@/components/WelcomeCard.vue'
  import WorkoutOptions from '@/components/WorkoutOptions.vue'
  import LevelOverview from '@/components/LevelOverview.vue'
  import LevelDetails from '@/components/LevelDetails.vue'
  import { useUser } from '@/composables/useUser'

  const { user } = useUser()
  function handleClick() {
    console.log('Clicked!')
  }
</script>
