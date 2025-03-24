<template>
  <v-form ref="form">
    <v-text-field
      v-model="name"
      :label="$t('onboarding.nameLabel')"
      variant="outlined"
      clearable
    ></v-text-field>

    <v-text-field
      v-model="dob"
      :label="$t('onboarding.dobLabel')"
      type="date"
      variant="outlined"
      :rules="dobRules"
      required
    ></v-text-field>

    <v-btn
      class="mt-4"
      type="submit"
      block
      color="primary"
      :disabled="!isValid"
      @click="submitForm"
    >
      {{ $t('onboarding.submit') }}
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { calculateAge } from '@/utils/ages'
  import { getGoalLevelByAge } from '@/utils/levels'
  import { useI18n } from 'vue-i18n'
  import { MINIMUM_REQUIRED_AGE } from '@/constants'

  import type { Ref } from 'vue'
  import type { LevelId } from '@/models/Level'
  import type { VForm } from 'vuetify/components'

  const emit = defineEmits(['submit'])
  const { t } = useI18n()

  const form: Ref<InstanceType<typeof VForm> | null> = ref(null)
  const DEFAULT_NAME = computed(() => t('onboarding.defaultName'))
  const name = ref<string | undefined>('') // name is optional
  const dob = ref<string>('')
  const goalLevel = ref<LevelId | null>(null)
  const age = ref<number | null>(null)

  //   computed variables
  const isValid = computed(() => form.value?.isValid)

  //   validation rules
  const dobRules = [
    // required
    (value: string) =>
      !!value || t('onboarding.validationMessages.dobRequired'),

    // date must be at least 6 years ago
    (value: string) => {
      const fiveYearsAgo = new Date()
      fiveYearsAgo.setFullYear(
        fiveYearsAgo.getFullYear() - MINIMUM_REQUIRED_AGE
      )
      const selectedDate = new Date(value)
      return (
        selectedDate <= fiveYearsAgo ||
        t('onboarding.validationMessages.dobTooRecent')
      )
    },
  ]

  const submitForm = (e: Event) => {
    e.preventDefault()

    if (!isValid.value) return
    name.value ||= DEFAULT_NAME.value

    emit('submit', {
      name: name.value,
      dob: dob.value,
      goalLevel: goalLevel.value,
    })
  }

  // Update age and goalLevel when dob changes
  const updateAgeAndGoalLevel = () => {
    if (dob.value) {
      age.value = calculateAge(dob.value)
      goalLevel.value = getGoalLevelByAge(age.value)
    }
  }

  // Watch for changes in dob to update age and goalLevel
  watch(dob, updateAgeAndGoalLevel)
</script>
