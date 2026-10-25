<script setup lang="ts">
  defineProps<{
    visible: boolean
  }>()
</script>

<template>
  <v-banner
    v-if="visible"
    color="warning"
    icon="mdi-database-alert-outline"
    stacked
  >
    <template #text>
      {{ $t('storage.writeFailed') }}
    </template>
  </v-banner>
</template>
