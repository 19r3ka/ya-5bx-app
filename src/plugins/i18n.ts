import { createI18n } from 'vue-i18n'
import enUS from '@/locales/en.json'
import frFR from '@/locales/fr.json'

type MessageSchema = typeof enUS

const messages = { 'en-US': enUS, 'fr-FR': frFR }

const i18n = createI18n<[MessageSchema], 'en-US' | 'fr-FR'>({
  locale: 'fr-FR', // Set the initial locale
  fallbackLocale: 'en-US', // Fallback to English if a translation is missing
  messages,
  legacy: false,
})

export default i18n
