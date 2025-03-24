<template>
  <v-card class="pa-4 mb-4">
    <v-card-title class="text-h6 font-weight-bold">{{
      $t('levelOverview.title')
    }}</v-card-title>
    <v-card-text>
      <v-row>
        <v-col v-for="(item, index) in overviewItems" :key="index" cols="4">
          <div class="text-center">
            <p class="text-subtitle-1">
              {{ $t(`levelOverview.${item.label}`) }}
            </p>
            <p class="text-h5 font-weight-bold">{{ item.value }}</p>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useUser } from '@/composables/useUser'
  import { extractChartAndLevel } from '@/utils/levels'

  const { user } = useUser()

  const [userChart, userLevel] = extractChartAndLevel(
    user.value?.currentLevel ?? ''
  )

  const overviewItems = computed(() => [
    { label: 'chart', value: userChart ?? '-' },
    { label: 'level', value: userLevel ?? '-' },
    { label: 'days', value: '3 of 4' }, // TODO: Replace with actual day data
  ])
</script>
