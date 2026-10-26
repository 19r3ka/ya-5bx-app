import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createVuetify } from 'vuetify'
import StorageWarningBanner from '@/components/common/StorageWarningBanner.vue'

const writeFailedText =
  'Storage is unavailable. Your progress may not be saved.'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: { storage: { writeFailed: writeFailedText } },
  },
})

const vuetify = createVuetify()

function mountBanner(visible: boolean): ReturnType<typeof mount> {
  return mount(StorageWarningBanner, {
    props: { visible },
    global: { plugins: [vuetify, i18n] },
  })
}

describe('StorageWarningBanner', () => {
  it('renders the warning text when visible', () => {
    const wrapper = mountBanner(true)

    expect(wrapper.text()).toContain(writeFailedText)
  })

  it('renders nothing when hidden', () => {
    const wrapper = mountBanner(false)

    expect(wrapper.text()).toBe('')
    expect(wrapper.find('.v-banner').exists()).toBe(false)
  })
})
