import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import stylistic from '@stylistic/eslint-plugin'

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['**/*.{js,mjs,cjs,ts,vue}'],
    ignores: [
      '**/node_modules/**', // Ignore node_modules
      '**/dist/**', // Ignore dist folder
      '**/coverage/**', // ignore coverage folder
      // Add other paths or file patterns you want to ignore here
    ],
  },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    files: ['**/*.vue'],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
  eslintPluginPrettierRecommended,
  {
    plugins: { '@stylistic': stylistic },
    rules: { '@stylistic/no-extra-semi': 'warn' },
  },
]
