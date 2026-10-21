import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(dirname(fileURLToPath(import.meta.url)), './src'),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.spec.ts'],
    passWithNoTests: true,
  },
})
