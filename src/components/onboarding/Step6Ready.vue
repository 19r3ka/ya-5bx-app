<template>
  <div class="fill-height d-flex flex-column pa-6">
    <div class="flex-grow-1 w-100 mx-auto" style="max-width: 600px">
      <div class="mb-8 mt-8">
        <h2 class="fc-exercise text-primary text-uppercase mb-2">
          ONE LAST THING
        </h2>
        <p class="fc-body text-on-surface-variant">
          Personalize your training record before we begin the baseline
          assessment.
        </p>
      </div>

      <div class="mb-10">
        <label
          class="fc-caption text-on-surface-variant text-uppercase font-weight-bold d-block mb-2 tracking-wide"
        >
          Your name (Optional)
        </label>
        <v-text-field
          v-model="name"
          :label="$t ? $t('onboarding.ready.namePlaceholder') : 'RECRUIT NAME'"
          variant="outlined"
          color="primary"
          rounded="lg"
          prepend-inner-icon="mdi-badge-account-outline"
          hide-details
        />
      </div>

      <div class="mb-8">
        <h3 class="fc-section text-primary text-uppercase mb-4">
          YOUR STARTING POINT
        </h3>
        <v-row>
          <v-col cols="6">
            <v-card
              color="surface-elevated"
              rounded="lg"
              class="pa-4 h-100 d-flex flex-column justify-space-between tier-card-start"
            >
              <div>
                <span class="fc-caption text-on-surface-variant text-uppercase"
                  >Current Tier</span
                >
                <h4 class="fc-exercise text-on-surface tier-title">CHART 1</h4>
              </div>
              <div class="text-right mt-4">
                <span class="fc-rep-target text-error line-height-1">D-</span>
              </div>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card
              color="surface-elevated"
              rounded="lg"
              class="pa-4 h-100 d-flex flex-column justify-space-between tier-card-goal"
            >
              <div>
                <span class="fc-caption text-on-surface-variant text-uppercase"
                  >Objective</span
                >
                <h4 class="fc-exercise text-on-surface tier-title">
                  CHART {{ goalChart }}
                </h4>
              </div>
              <div class="text-right mt-4">
                <span class="fc-rep-target text-secondary line-height-1">{{
                  goalLevel
                }}</span>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </div>

    <div class="w-100 mx-auto" style="max-width: 600px">
      <v-btn
        color="primary-container"
        block
        size="x-large"
        rounded="md"
        class="mb-4 text-on-primary-fixed submit-btn"
        @click="handleProceed(true)"
      >
        <span class="fc-exercise font-size-20">START MY FIRST WORKOUT</span>
        <v-icon end size="28">mdi-play</v-icon>
      </v-btn>
      <v-btn
        variant="text"
        block
        color="on-surface-variant"
        class="fc-body-strong"
        @click="handleProceed(false)"
      >
        Skip for now
      </v-btn>
    </div>

    <!-- Confirm Blank Name Dialog -->
    <v-dialog v-model="showConfirmDialog" max-width="420" persistent>
      <v-card color="surface-elevated" rounded="xl" class="pa-6">
        <div class="d-flex align-center ga-3 mb-3">
          <v-icon color="secondary" size="28"
            >mdi-account-question-outline</v-icon
          >
          <h3 class="fc-section text-on-surface text-uppercase mb-0">
            {{
              $t
                ? $t('onboarding.ready.confirmEmptyTitle')
                : 'Leave name blank?'
            }}
          </h3>
        </div>
        <p class="fc-body text-on-surface-variant mb-6">
          {{
            $t
              ? $t('onboarding.ready.confirmEmptyMessage')
              : "You haven't entered a name. Would you like to proceed as Recruit?"
          }}
        </p>
        <div class="d-flex flex-column ga-2">
          <v-btn
            color="primary"
            block
            size="large"
            rounded="md"
            @click="confirmProceed"
          >
            {{
              $t
                ? $t('onboarding.ready.confirmEmptyProceed')
                : 'Continue as Recruit'
            }}
          </v-btn>
          <v-btn
            variant="text"
            block
            color="on-surface-variant"
            @click="showConfirmDialog = false"
          >
            {{ $t ? $t('onboarding.ready.confirmEmptyCancel') : 'Enter Name' }}
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  defineProps<{
    goalChart: number
    goalLevel: string
  }>()

  const emit = defineEmits<{
    (e: 'complete', payload: { name: string; startWorkout: boolean }): void
  }>()

  const name = ref('')
  const showConfirmDialog = ref(false)
  const pendingStartWorkout = ref(false)

  function handleProceed(isStartWorkout: boolean) {
    if (!name.value.trim()) {
      pendingStartWorkout.value = isStartWorkout
      showConfirmDialog.value = true
      return
    }
    emit('complete', {
      name: name.value.trim(),
      startWorkout: isStartWorkout,
    })
  }

  function confirmProceed() {
    showConfirmDialog.value = false
    emit('complete', {
      name: '',
      startWorkout: pendingStartWorkout.value,
    })
  }
</script>

<style scoped>
  .tracking-wide {
    letter-spacing: 1px;
  }
  .tier-card-start {
    border-left: 4px solid rgb(var(--v-theme-error));
  }
  .tier-card-goal {
    border-left: 4px solid rgb(var(--v-theme-secondary));
  }
  .tier-title {
    font-size: 24px;
    line-height: 28px;
  }
  .line-height-1 {
    line-height: 1;
  }
  .submit-btn {
    height: 64px;
  }
  .font-size-20 {
    font-size: 20px;
  }
  .text-on-primary-fixed {
    color: #291800 !important;
  }
</style>
