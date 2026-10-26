import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import en from '@/locales/en.json'
import fr from '@/locales/fr.json'

type Catalog = Record<string, unknown>

function flattenKeys(catalog: Catalog, prefix = ''): string[] {
  return Object.entries(catalog).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    return value !== null && typeof value === 'object'
      ? flattenKeys(value as Catalog, path)
      : [path]
  })
}

function flattenValues(catalog: Catalog, path = ''): string[] {
  return Object.entries(catalog).flatMap(([key, value]) => {
    const next = path ? `${path}.${key}` : key
    return value !== null && typeof value === 'object'
      ? flattenValues(value as Catalog, next)
      : [String(value)]
  })
}

function vueFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      return vueFiles(full)
    }
    return full.endsWith('.vue') ? [full] : []
  })
}

function usedLiteralKeys(): string[] {
  const pattern = /\$t\(\s*'([^'`$]+)'/g
  const keys = new Set<string>()

  for (const file of vueFiles(resolve(process.cwd(), 'src'))) {
    const source = readFileSync(file, 'utf8')
    for (const match of source.matchAll(pattern)) {
      if (match[1]) {
        keys.add(match[1])
      }
    }
  }

  return [...keys].sort()
}

const enKeys = flattenKeys(en as Catalog).sort()
const frKeys = flattenKeys(fr as Catalog).sort()

describe('locales', () => {
  it('have identical key sets', () => {
    expect(frKeys).toEqual(enKeys)
  })

  it('have no empty values', () => {
    const empty = [
      ...flattenValues(en as Catalog),
      ...flattenValues(fr as Catalog),
    ]
      .map((value) => value.trim())
      .filter((value) => value.length === 0)

    expect(empty).toEqual([])
  })

  it('resolve every literal key used in components', () => {
    const missing = usedLiteralKeys().filter(
      (key) => !enKeys.includes(key) || !frKeys.includes(key)
    )

    expect(missing).toEqual([])
  })
})
