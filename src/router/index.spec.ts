// CHARACTERIZATION: known gap, see SPEC AC-1.2. An unknown path resolves to
// no route and is not redirected to the dashboard. Locked here, not fixed.
import { describe, expect, it, vi } from 'vitest'

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

  it('does not redirect an unknown path', async () => {
    const router = await loadRouter()

    const resolved = router.resolve('/does-not-exist')

    expect(resolved.matched).toHaveLength(0)
    expect(resolved.name).toBeUndefined()
  })
})
