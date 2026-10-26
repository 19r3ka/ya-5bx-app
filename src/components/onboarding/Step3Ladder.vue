<template>
  <v-container class="pa-6 fill-height flex-column">
    <div class="flex-grow-1 w-100 mt-8 mx-auto" style="max-width: 600px">
      <h2 class="fc-exercise text-on-surface text-uppercase mb-2">
        The Ladder
      </h2>
      <p class="fc-body text-on-surface-variant mb-8">
        The 5BX system is built on a progression of levels. You advance by
        completing targets within your specific chart.
      </p>

      <div class="mb-8">
        <v-row
          v-for="i in 6"
          :key="i"
          align="center"
          class="mb-3 fc-fade-up"
          :style="{ animationDelay: (i - 1) * 120 + 'ms' }"
        >
          <v-col cols="12" class="pa-0">
            <v-card
              :variant="i === props.goalChart ? 'outlined' : 'flat'"
              :color="i === props.goalChart ? 'primary' : 'surface-elevated'"
              rounded="lg"
              class="pa-4 w-100 d-flex flex-column ga-3"
              :class="{
                'opacity-25': i > props.goalChart + 1,
                'opacity-40': i === props.goalChart + 1,
              }"
            >
              <div class="d-flex justify-space-between align-center">
                <span
                  class="fc-section text-uppercase"
                  :class="
                    i === props.goalChart
                      ? 'text-primary'
                      : 'text-on-surface-variant'
                  "
                >
                  Chart {{ i }}
                </span>
                <v-chip
                  v-if="i === 1"
                  size="small"
                  color="primary-container"
                  variant="flat"
                  rounded="md"
                  class="text-on-primary-container font-weight-bold"
                >
                  ACTIVE LEVEL
                </v-chip>
                <div
                  v-if="i === props.goalChart"
                  class="d-flex align-center ga-1"
                >
                  <v-icon color="primary" size="small">mdi-star</v-icon>
                  <span
                    class="fc-caption text-primary font-weight-bold text-uppercase"
                    >Target Zone</span
                  >
                </div>
              </div>

              <v-chip-group>
                <v-chip
                  v-for="grade in grades"
                  :key="grade"
                  :color="
                    i === 1 && grade === 'D-'
                      ? 'primary-container'
                      : i === props.goalChart
                        ? 'surface-elevated'
                        : 'surface'
                  "
                  :variant="'flat'"
                  class="font-weight-bold"
                  size="large"
                >
                  <span
                    :class="
                      i === 1 && grade === 'D-'
                        ? 'text-on-primary-container font-weight-black'
                        : 'text-on-surface-variant'
                    "
                    >{{ grade }}</span
                  >
                </v-chip>
              </v-chip-group>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <v-card
        color="surface-elevated"
        rounded="lg"
        class="pa-4 mb-8 border-s-primary"
      >
        <div class="d-flex ga-4">
          <v-icon color="primary" class="mt-1">mdi-information</v-icon>
          <div>
            <h3 class="fc-body-strong text-primary mb-1">How to Advance</h3>
            <p class="fc-caption text-on-surface-variant mb-0">
              Each day you'll perform 5 exercises. Once you can complete the
              target repetitions for your level within the time limit, you'll
              move to the next step.
            </p>
          </div>
        </div>
      </v-card>
    </div>

    <div class="w-100 mx-auto" style="max-width: 600px">
      <v-btn
        color="primary-container"
        block
        size="x-large"
        rounded="md"
        append-icon="mdi-chevron-right"
        @click="emit('next')"
      >
        <span class="fc-section">Understood, Let's Begin</span>
      </v-btn>
    </div>
  </v-container>
</template>

<script setup lang="ts">
  const props = defineProps<{
    goalChart: number
  }>()

  const emit = defineEmits<{
    (e: 'next'): void
  }>()

  const grades = [
    'D-',
    'D',
    'D+',
    'C-',
    'C',
    'C+',
    'B-',
    'B',
    'B+',
    'A-',
    'A',
    'A+',
  ]
</script>

<style scoped>
  .fc-fade-up {
    animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .opacity-25 {
    opacity: 0.25;
  }
  .opacity-40 {
    opacity: 0.4;
  }
</style>
