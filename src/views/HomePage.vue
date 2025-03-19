<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="6" lg="4">
        <!-- TODO: remove this hack for when there is no chart to load -->
        <ChartCard :chart="chart" v-if="chart" />
        <p v-else>No chart to display</p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
  import type { Chart } from '@/models/Chart'
  import ChartCard from '@/components/ChartCard.vue'
  import chartData from '@/data/charts.json'

  const charts = chartData as Chart[]

  const chartId = 'C1' // default chart to load for now.

  const chart = charts.find((chart) => chart.id === chartId)
  if (!chart) {
    console.error(`Chart with ID ${chartId} not found`)
  }
</script>
