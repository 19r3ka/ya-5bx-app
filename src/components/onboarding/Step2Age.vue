<template>
  <div class="fill-height d-flex flex-column justify-space-between pa-6">
    <div class="mt-8 w-100 mx-auto max-width-400">
      <h1 class="fc-section text-primary text-center tracking-widest mb-2">
        ONBOARDING STEP 02
      </h1>
      <h2 class="fc-exercise text-on-surface text-center mb-12">
        HOW OLD ARE YOU?
      </h2>

      <div class="d-flex justify-center mb-8">
        <v-text-field
          v-model.number="age"
          type="number"
          inputmode="numeric"
          min="10"
          max="99"
          autofocus
          variant="outlined"
          rounded="md"
          color="primary-container"
          class="text-center fc-rep-target age-input"
          hide-details
        />
      </div>

      <v-expand-transition>
        <GoalChartCard
          v-if="isValidAge && goalChart"
          :chart-number="goalChart"
          :age-range="ageRangeLabel"
        />
      </v-expand-transition>
    </div>

    <div class="mb-4">
      <v-btn
        color="primary-container"
        block
        size="x-large"
        rounded="md"
        :disabled="!isValidAge"
        append-icon="mdi-arrow-right"
        @click="onNext"
      >
        <span class="fc-section">Continue to Step 3</span>
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import GoalChartCard from './GoalChartCard.vue'
  import { extractChartAndLevel, getAgeGroupForAge } from '@/utils/levels'

  const emit = defineEmits<{
    next: [age: number]
  }>()

  const age = ref<number | null>(null)

  const isValidAge = computed(() => {
    return age.value !== null && age.value >= 10 && age.value <= 99
  })

  const goalAgeGroup = computed(() =>
    isValidAge.value && age.value !== null ? getAgeGroupForAge(age.value) : null
  )

  const goalChart = computed(() => {
    const group = goalAgeGroup.value
    if (!group) return null

    const [chart] = extractChartAndLevel(group.goalLevel)
    return Number(chart.replace('C', '')) || null
  })

  const ageRangeLabel = computed(() => {
    const group = goalAgeGroup.value
    if (!group) return ''

    return group.minAge === group.maxAge
      ? String(group.minAge)
      : `${group.minAge}–${group.maxAge}`
  })

  function onNext() {
    if (isValidAge.value && age.value !== null) {
      emit('next', age.value)
    }
  }
</script>
