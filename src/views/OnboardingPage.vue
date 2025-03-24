<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>
            {{ $t('onboarding.title') }}
          </v-card-title>
          <v-card-subtitle>
            {{ $t('onboarding.introduction') }}
          </v-card-subtitle>
          <v-card-text>
            <div class="mb-4 pa-4 bg-grey-darken-2 rounded-lg">
              <p>{{ $t('onboarding.dobExplanation') }}</p>
              <p>{{ $t('onboarding.nameExplanation') }}</p>
            </div>

            <OnboardingForm @submit="handleFormSubmit" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
  import OnboardingForm from '@/components/OnboardingForm.vue'
  import { useUser } from '@/composables/useUser'
  import { STARTER_LEVEL } from '@/constants'
  import type { LevelId } from '@/models/Level'

  const { saveUser } = useUser()

  const handleFormSubmit = (formData: {
    name: string | undefined
    dob: string
    goalLevel: LevelId
  }) => {
    const currentLevel = STARTER_LEVEL // default current level for now.
    saveUser({
      name: formData.name,
      dob: formData.dob,
      currentLevel: currentLevel,
      goalLevel: formData.goalLevel,
    })
  }
</script>
