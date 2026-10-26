import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const SRC = join(process.cwd(), 'src')

function filesWithExtension(extension: string): string[] {
  const files: string[] = []

  function walk(directory: string): void {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const fullPath = join(directory, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
      } else if (entry.name.endsWith(extension)) {
        files.push(fullPath)
      }
    }
  }

  walk(SRC)
  return files.sort()
}

function read(file: string): string {
  return readFileSync(file, 'utf8')
}

function relativePath(file: string): string {
  return relative(process.cwd(), file)
}

const vueFiles = filesWithExtension('.vue')

describe('style contract (V6)', () => {
  it('keeps every Vue component free of scoped style blocks', () => {
    const offenders = vueFiles
      .filter((file) => /<style\b[^>]*\bscoped\b/i.test(read(file)))
      .map(relativePath)

    expect(offenders).toEqual([])
  })

  it('keeps Step3Ladder free of inline border styles', () => {
    const source = read(join(SRC, 'components/onboarding/Step3Ladder.vue'))

    expect(source).not.toMatch(/style\s*=\s*["'][^"']*\bborder\b/i)
  })

  it('keeps the P2-3 cards on the large theme radius', () => {
    const offenders = [
      join(SRC, 'components/onboarding/Step6Ready.vue'),
      join(SRC, 'components/common/AppHelpDialog.vue'),
    ].filter((file) => read(file).includes('rounded="xl"'))

    expect(offenders.map(relativePath)).toEqual([])
  })

  it('keeps the clock free of the removed elapsed prop', () => {
    const offenders = vueFiles
      .filter((file) => read(file).includes(':elapsed-seconds'))
      .map(relativePath)

    expect(offenders).toEqual([])
  })

  it('keeps the legacy fixed setup strings out of the templates', () => {
    const legacyStrings = ['3 Sets · 15 Reps', '45 Total']
    const offenders = vueFiles.filter((file) => {
      const source = read(file)
      return legacyStrings.some((value) => source.includes(value))
    })

    expect(offenders.map(relativePath)).toEqual([])
  })

  it('keeps progression position derived instead of writable', () => {
    const store = read(join(SRC, 'stores/useProgressionStore.ts'))

    expect(store).not.toMatch(/currentChart\s*=\s*ref\s*\(\s*1\s*\)/)
    expect(store).not.toMatch(/currentLevel\s*=\s*ref\s*\(/)
  })
})
