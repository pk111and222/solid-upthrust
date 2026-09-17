import type { TableKey, TableUpdater } from './types'

export const tableRowId = (key: TableKey) => `${typeof key === 'number' ? 'n' : 's'}:${key}`
export const resolveTableUpdater = <T>(updater: TableUpdater<T>, previous: T): T =>
  typeof updater === 'function' ? (updater as (value: T) => T)(previous) : updater
export const positiveInteger = (value: number | undefined, fallback: number) =>
  value !== undefined && Number.isFinite(value) && value > 0 ? Math.max(1, Math.floor(value)) : fallback
export const unique = <T>(values: readonly T[]) => [...new Set(values)]
export const readPath = (record: unknown, path: readonly (string | number)[]): unknown => {
  let value = record
  for (const key of path) {
    if (value === null || typeof value !== 'object') return undefined
    value = (value as Record<string | number, unknown>)[key]
  }
  return value
}
export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
