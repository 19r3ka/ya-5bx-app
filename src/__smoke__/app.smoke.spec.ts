import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import App from '@/App.vue'
import router from '@/router'
import BottomNav from '@/components/layout/BottomNav.vue'
import vuetify from '@/plugins/vuetify'
import i18n from '@/plugins/i18n'
import { useProgressionStore } from '@/stores/useProgressionStore'
import { useUserStore } from '@/stores/useUserStore'

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()
  return {
    ...actual,
    createWebHistory: () => actual.createMemoryHistory(),
  }
})

router.beforeEach((to) => {
  const userStore = useUserStore()
  const complete = userStore.profile?.isOnboardingCompleted ?? false
  if (!complete && to.name !== 'onboarding') return { name: 'onboarding' }
  if (complete && to.name === 'onboarding') return { name: 'dashboard' }
  return true
})

let pinia: Pinia
let wrapper: ReturnType<typeof mount> | null = null

function mountApp(): ReturnType<typeof mount> {
  wrapper = mount(App, {
    global: { plugins: [pinia, router, vuetify, i18n] },
  })
  return wrapper
}

describe('app smoke', () => {
  beforeEach(() => {
    localStorage.clear()
    pinia = createPinia()
    setActivePinia(pinia)
    const progression = useProgressionStore()
    vi.spyOn(progression, 'initAsync').mockResolvedValue(undefined)
  })

  it('lands a fresh install on onboarding', async () => {
    mountApp()
    await router.isReady()
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('onboarding')
    wrapper?.unmount()
    wrapper = null
  })

  it('goes to the dashboard after onboarding completes', async () => {
    mountApp()
    await router.isReady()
    await flushPromises()

    const user = useUserStore()
    user.completeOnboarding({ age: 30 })
    await router.push({ name: 'dashboard' })
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('dashboard')
    expect(wrapper?.findComponent(BottomNav).exists()).toBe(true)
    wrapper?.unmount()
    wrapper = null
  })

  it('navigates from workout setup to the active workout and hides the nav', async () => {
    mountApp()
    await router.isReady()
    await flushPromises()

    const user = useUserStore()
    user.completeOnboarding({ age: 30 })

    await router.push({ name: 'workout-setup' })
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('workout-setup')

    await router.push({ name: 'active-workout' })
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('active-workout')
    expect(wrapper?.findComponent(BottomNav).exists()).toBe(false)

    await router.push({ name: 'dashboard' })
    await flushPromises()
    wrapper?.unmount()
    wrapper = null
  })
})
