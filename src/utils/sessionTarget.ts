import { LEVEL_ID_SEPARATOR } from '@/constants'
import chartsMatrixJson from '@/core/data/charts_matrix.json'
import type { CompletedSessionRecord } from '@/core/StorageTypes'

type ChartsMatrix = Record<string, Record<string, unknown>>

const chartsMatrix = chartsMatrixJson as unknown as ChartsMatrix

export const FALLBACK_TARGET = { chartNumber: 1, levelString: 'D-' } as const

export type SessionTargetSource = 'profile' | 'history' | 'default'

export interface SessionTarget {
  chartNumber: number
  levelString: string
  source: SessionTargetSource
}

/** True only when the versioned dataset has a row for this chart and level. */
export function isValidChartLevel(
  chartNumber: number,
  levelString: string
): boolean {
  const chart = chartsMatrix[String(chartNumber)]
  return (
    chart !== undefined &&
    Object.prototype.hasOwnProperty.call(chart, levelString)
  )
}

/** Parses a level id such as `C3_D+` into its chart and level parts. */
export function parseLevelId(
  levelId: string | undefined | null
): { chartNumber: number; levelString: string } | null {
  if (!levelId) {
    return null
  }

  const [chartPart, ...levelParts] = levelId.split(LEVEL_ID_SEPARATOR)
  const levelString = levelParts.join(LEVEL_ID_SEPARATOR)
  const match = /^C(\d+)$/.exec(chartPart ?? '')

  if (!match || !levelString) {
    return null
  }

  return { chartNumber: Number(match[1]), levelString }
}

/**
 * Chooses a usable training target without touching stored data (D-008):
 * profile level, then the newest completed session with a valid level,
 * then Chart 1 / Level D-. "Newest" is decided by `completedAt`, not by
 * array position, so an out-of-order history cannot pick an older session.
 */
export function resolveSessionTarget(
  profileLevel: string | undefined,
  history: readonly CompletedSessionRecord[]
): SessionTarget {
  const fromProfile = parseLevelId(profileLevel)

  if (
    fromProfile &&
    isValidChartLevel(fromProfile.chartNumber, fromProfile.levelString)
  ) {
    return { ...fromProfile, source: 'profile' }
  }

  let newest: CompletedSessionRecord | null = null

  for (const record of history) {
    if (!isValidChartLevel(record.chartNumber, record.levelString)) {
      continue
    }

    if (newest === null || record.completedAt >= newest.completedAt) {
      newest = record
    }
  }

  if (newest !== null) {
    return {
      chartNumber: newest.chartNumber,
      levelString: newest.levelString,
      source: 'history',
    }
  }

  return { ...FALLBACK_TARGET, source: 'default' }
}
