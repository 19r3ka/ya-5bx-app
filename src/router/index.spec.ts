import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUserStore } from '@/stores/useUserStore'

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()
  return {
    ...actual,
    createWebHistory: () => actual.createMemoryHistory(),
  }
})

async function loadRouter() {
  vi.resetModules()
  return (await import('@/router')).default
}

describe('router', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it.each([
    ['dashboard', '/', () => import('@/views/DashboardView.vue')],
    ['onboarding', '/onboarding', () => import('@/views/OnboardingView.vue')],
    [
      'workout-setup',
      '/workout-setup',
      () => import('@/views/WorkoutSetupView.vue'),
    ],
    [
      'active-workout',
      '/workout',
      () => import('@/views/ActiveWorkoutView.vue'),
    ],
    ['progress', '/progress', () => import('@/views/ProgressView.vue')],
    ['settings', '/settings', () => import('@/views/SettingsView.vue')],
  ])('resolves %s to its view', async (name, path, loadView) => {
    const router = await loadRouter()
    const resolved = router.resolve({ name })

    expect(resolved.path).toBe(path)
    expect(resolved.name).toBe(name)

    const routeComponent = resolved.matched[0].components
      ?.default as () => Promise<{
      default: unknown
    }>
    expect(typeof routeComponent).toBe('function')
    const loaded = await routeComponent()
    const expected = await loadView()
    expect(loaded.default).toBe(expected.default)
  })

  it('redirects an unknown path to the dashboard', async () => {
    const router = await loadRouter()

    await router.push('/does-not-exist')

    expect(router.currentRoute.value.name).toBe('dashboard')
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('keeps every known route matched to its own name', async () => {
    const router = await loadRouter()

    for (const name of [
      'dashboard',
      'onboarding',
      'workout-setup',
      'active-workout',
      'progress',
      'settings',
    ]) {
      expect(router.hasRoute(name)).toBe(true)
      expect(router.resolve({ name }).name).toBe(name)
    }
  })

  it('lets the onboarding guard take precedence over the catch-all', async () => {
    const router = await loadRouter()
    router.beforeEach((to) => {
      const userStore = useUserStore()
      const complete = userStore.profile?.isOnboardingCompleted ?? false
      if (!complete && to.name !== 'onboarding') return { name: 'onboarding' }
      if (complete && to.name === 'onboarding') return { name: 'dashboard' }
      return true
    })

    await router.push('/does-not-exist')

    expect(router.currentRoute.value.name).toBe('onboarding')
  })
})
