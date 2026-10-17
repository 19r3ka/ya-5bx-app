import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import vuetify from '@/plugins/vuetify'
import i18n from '@/plugins/i18n'
import router from '@/router'
import './assets/typography.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(vuetify)
app.use(i18n)
app.use(router)

import { useUserStore } from '@/stores/useUserStore'

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  const complete = userStore.profile?.isOnboardingCompleted ?? false
  if (!complete && to.name !== 'onboarding') return next({ name: 'onboarding' })
  if (complete && to.name === 'onboarding') return next({ name: 'dashboard' })
  next()
})

app.mount('#app')
