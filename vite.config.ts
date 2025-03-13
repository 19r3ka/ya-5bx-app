import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

// https://vite.dev/config/
export default defineConfig({
  base: '/ya-5bx-app/',
  plugins: [vue(), vuetify({ autoImport: true })],
})
