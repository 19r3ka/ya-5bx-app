<template>
  <v-container class="pa-0 fill-height" fluid>
    <!-- Top Bar for steps 2-6 (index 2-6) -->
    <div
      v-if="currentStep > 1"
      class="w-100 px-6 pt-4 pb-0 bg-surface position-absolute top-0 top-bar"
    >
      <div
        class="d-flex align-center justify-space-between h-touch-target-min mx-auto max-width-600"
      >
        <div class="d-flex align-center ga-3">
          <v-icon color="primary">mdi-weight-lifter</v-icon>
          <span class="fc-section text-primary">YA-5BX</span>
        </div>
        <v-btn
          icon="mdi-help-circle-outline"
          variant="text"
          color="on-surface-variant"
          @click="showHelp = true"
        ></v-btn>
      </div>
      <OnboardingProgress
        :current-step="currentStep"
        class="mx-auto max-width-600"
      />
    </div>

    <!-- Main Content -->
    <v-window v-model="currentStep" :touch="false" class="fill-height w-100">
      <v-window-item :value="1" class="fill-height">
        <Step1Hook @next="nextStep" />
      </v-window-item>

      <v-window-item :value="2" class="fill-height pt-16">
        <Step2Age @next="nextStep" />
      </v-window-item>

      <v-window-item :value="3" class="fill-height pt-16">
        <Step3Ladder :goal-chart="derivedGoalChart" @next="nextStep" />
      </v-window-item>

      <v-window-item :value="4" class="fill-height pt-16">
        <Step4Exercises
          :model-value="userStore.draftAerobic"
          @update:aerobic="onUpdateAerobic"
          @next="nextStep"
        />
      </v-window-item>

      <v-window-item :value="5" class="fill-height pt-16">
        <Step5Tutorial @next="nextStep" />
      </v-window-item>

      <v-window-item :value="6" class="fill-height pt-16">
        <Step6Ready
          :goal-chart="derivedGoalChart"
          goal-level="A+"
          @complete="completeOnboarding"
        />
      </v-window-item>
    </v-window>

    <AppHelpDialog v-model="showHelp" />
  </v-container>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import AppHelpDialog from '@/components/common/AppHelpDialog.vue'
  import OnboardingProgress from '@/components/common/OnboardingProgress.vue'
  import Step1Hook from '@/components/onboarding/Step1Hook.vue'
  import Step2Age from '@/components/onboarding/Step2Age.vue'
  import Step3Ladder from '@/components/onboarding/Step3Ladder.vue'
  import Step4Exercises from '@/components/onboarding/Step4Exercises.vue'
  import Step5Tutorial from '@/components/onboarding/Step5Tutorial.vue'
  import Step6Ready from '@/components/onboarding/Step6Ready.vue'
  import { useUserStore } from '@/stores/useUserStore'
  import { getGoalChartByAge } from '@/utils/ages'

  const router = useRouter()
  const userStore = useUserStore()
  const showHelp = ref(false)

  const currentStep = computed({
    get: () => userStore.draftStep,
    set: (val: number) => userStore.setDraftStep(val),
  })

  const derivedGoalChart = computed(() =>
    userStore.draftAge ? getGoalChartByAge(userStore.draftAge) : 3
  )

  function nextStep(payload?: number) {
    if (currentStep.value === 2 && payload) {
      userStore.setDraftAge(payload)
    }
    if (currentStep.value < 6) {
      currentStep.value++
    }
  }

  function onUpdateAerobic(val: string) {
    userStore.setDraftAerobic(val)
  }

  function completeOnboarding(payload: {
    name: string
    startWorkout: boolean
  }) {
    userStore.completeOnboarding({
      name: payload.name || undefined,
      age: userStore.draftAge ?? undefined,
      currentLevel: 'C1_D-',
      goalLevel: `C${derivedGoalChart.value}_A+`,
      preferredAerobic: userStore.draftAerobic,
    })
    if (router) {
      if (payload.startWorkout) {
        router.push({ name: 'workout-setup' })
      } else {
        router.push({ name: 'dashboard' })
      }
    }
  }
</script>

<style scoped>
  .top-bar {
    z-index: 10;
  }
  .max-width-600 {
    max-width: 600px;
  }
  .v-window-item {
    height: 100%;
  }
</style>
