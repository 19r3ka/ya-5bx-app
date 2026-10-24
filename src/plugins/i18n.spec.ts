import { describe, expect, it } from 'vitest'
import i18n from '@/plugins/i18n'

describe('i18n plugin defaults', () => {
  it('uses fr-FR as the default locale', () => {
    expect(i18n.global.locale.value).toBe('fr-FR')
  })

  it('uses en-US as the fallback locale', () => {
    expect(i18n.global.fallbackLocale.value).toBe('en-US')
  })

  it('loads both message catalogs', () => {
    const en = i18n.global.getLocaleMessage('en-US')
    const fr = i18n.global.getLocaleMessage('fr-FR')

    expect(Object.keys(en).length).toBeGreaterThan(0)
    expect(Object.keys(fr).length).toBeGreaterThan(0)
  })

  it('resolves a message from the French catalog', () => {
    expect(i18n.global.t('onboarding.title')).toContain('5BX')
  })
})
