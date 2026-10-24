import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import PostWorkoutDialog from '@/components/workout/PostWorkoutDialog.vue'

const mocks = vi.hoisted(() => ({
  sealSessionTelemetryAsync: vi.fn(),
}))

vi.mock('@/core/telemetry/TelemetryService', () => ({
  TelemetryService: vi.fn(function () {
    return {
      sealSessionTelemetryAsync: mocks.sealSessionTelemetryAsync,
      stagePendingSessionAsync: vi.fn(),
    }
  }),
}))

const vuetify = createVuetify()

function mountDialog(): ReturnType<typeof mount> {
  return mount(PostWorkoutDialog, {
    props: { sessionToken: 'session-1' },
    global: { plugins: [vuetify] },
  })
}

function saveButton(wrapper: ReturnType<typeof mount>) {
  return wrapper
    .findAll('button')
    .find((button) => button.text().includes('Save & continue'))
}

describe('PostWorkoutDialog', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    mocks.sealSessionTelemetryAsync.mockResolvedValue({})
  })

  it('auto-seals conservatively after 60 seconds', async () => {
    const wrapper = mountDialog()

    await vi.advanceTimersByTimeAsync(60000)
    await flushPromises()

    expect(mocks.sealSessionTelemetryAsync).toHaveBeenCalledWith(
      'session-1',
      true,
      true
    )
    expect(wrapper.emitted('saved')).toHaveLength(1)
    wrapper.unmount()
  })

  it('saves a great selection as user confirmed', async () => {
    const wrapper = mountDialog()

    await wrapper.findAll('.option-card')[0].trigger('click')
    await saveButton(wrapper)?.trigger('click')
    await flushPromises()

    expect(mocks.sealSessionTelemetryAsync).toHaveBeenCalledWith(
      'session-1',
      false,
      false
    )
    expect(wrapper.emitted('saved')).toHaveLength(1)
    wrapper.unmount()
  })

  it('saves a sore selection with the stiffness flag', async () => {
    const wrapper = mountDialog()

    await wrapper.findAll('.option-card')[1].trigger('click')
    await saveButton(wrapper)?.trigger('click')
    await flushPromises()

    expect(mocks.sealSessionTelemetryAsync).toHaveBeenCalledWith(
      'session-1',
      true,
      false
    )
    wrapper.unmount()
  })

  it('deduplicates while a seal is in flight', async () => {
    mocks.sealSessionTelemetryAsync.mockReturnValue(new Promise(() => {}))
    const wrapper = mountDialog()

    await wrapper.findAll('.option-card')[0].trigger('click')
    await saveButton(wrapper)?.trigger('click')
    await saveButton(wrapper)?.trigger('click')
    await vi.advanceTimersByTimeAsync(60000)

    expect(mocks.sealSessionTelemetryAsync).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('auto-seals conservatively when unmounted with no selection', async () => {
    const wrapper = mountDialog()

    wrapper.unmount()
    await flushPromises()

    expect(mocks.sealSessionTelemetryAsync).toHaveBeenCalledWith(
      'session-1',
      true,
      true
    )
  })

  // CHARACTERIZATION: a rejected manual save does not emit `seal-failed`.
  // It resets isSealing and shows the retry alert instead. Only the auto-seal
  // path emits `seal-failed`.
  it('shows the retry alert when a manual save rejects', async () => {
    mocks.sealSessionTelemetryAsync.mockRejectedValue(new Error('write failed'))
    const wrapper = mountDialog()

    await wrapper.findAll('.option-card')[0].trigger('click')
    await saveButton(wrapper)?.trigger('click')
    await flushPromises()

    expect(wrapper.emitted('saved')).toBeUndefined()
    expect(wrapper.emitted('seal-failed')).toBeUndefined()
    expect(wrapper.text()).toContain('Failed to save session telemetry')
    wrapper.unmount()
  })

  it('emits seal-failed when auto-seal rejects', async () => {
    mocks.sealSessionTelemetryAsync.mockRejectedValue(new Error('write failed'))
    const wrapper = mountDialog()

    await vi.advanceTimersByTimeAsync(60000)
    await flushPromises()

    expect(wrapper.emitted('saved')).toBeUndefined()
    expect(wrapper.emitted('seal-failed')).toHaveLength(1)
    wrapper.unmount()
  })
})
