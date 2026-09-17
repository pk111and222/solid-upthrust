import { createSignal, onCleanup, untrack } from 'solid-js'
import type { TableColumn, TableConfig, TableKey, TableRowModel } from './types'

export interface TableEditDraft<T> {
  key: TableKey
  original: T
  record: T
  status: 'editing' | 'validating' | 'saving' | 'error'
  errors: Readonly<Record<string, string>>
}
const setPath = (record: unknown, path: readonly (string | number)[], value: unknown): unknown => {
  const [key, ...rest] = path
  if (key === undefined) return value
  if (['__proto__', 'constructor', 'prototype'].includes(String(key))) throw new Error('Unsafe Table edit path')
  const source = record !== null && typeof record === 'object' ? record : typeof key === 'number' ? [] : {}
  const copy = Array.isArray(source) ? [...source] : { ...source }
  const target = copy as Record<string | number, unknown>
  target[key] = setPath((source as Record<string | number, unknown>)[key], rest, value)
  return copy
}
export function createTableEditing<T>(config: TableConfig<T>, core: () => TableRowModel<T>, columns: () => readonly TableColumn<T>[]) {
  const [drafts, setDrafts] = createSignal<ReadonlyMap<TableKey, TableEditDraft<T>>>(new Map(), { ownedWrite: true })
  let current = new Map<TableKey, TableEditDraft<T>>()
  const versions = new Map<TableKey, number>()
  let disposed = false
  onCleanup(() => { disposed = true; versions.clear(); current.clear() })
  const put = (key: TableKey, draft?: TableEditDraft<T>) => {
    current = new Map(current)
    if (draft) current.set(key, draft); else current.delete(key)
    setDrafts(current)
  }
  const bump = (key: TableKey) => { const version = (versions.get(key) ?? 0) + 1; versions.set(key, version); return version }
  const begin = (key: TableKey) => untrack(() => {
    if (!config.editing || current.has(key)) return false
    const original = core().rowsByKey.get(key)?.original
    if (original === undefined) return false
    bump(key); put(key, { key, original, record: original, status: 'editing', errors: {} }); return true
  })
  const setValue = (key: TableKey, columnId: string, value: unknown) => untrack(() => {
    const draft = current.get(key), column = columns().find(c => c.id === columnId)
    if (!draft || draft.status === 'saving') return false
    const dataIndex = column?.definition.dataIndex
    if (dataIndex === undefined) throw new Error('Editable accessor columns require a dataIndex')
    const path = Array.isArray(dataIndex) ? dataIndex : [dataIndex as string | number]
    const record = setPath(draft.record, path, value) as T
    bump(key); put(key, { ...draft, record, status: 'editing', errors: {} }); return true
  })
  const cancel = (key: TableKey) => {
    // A save callback may already be externally committed; cancellation is
    // allowed during validation, but must not pretend to undo an active save.
    if (current.get(key)?.status === 'saving') return false
    bump(key); put(key); return true
  }
  const commit = async (key: TableKey): Promise<boolean> => {
    const draft = current.get(key), editing = untrack(() => config.editing)
    if (!draft || !editing || draft.status === 'saving' || draft.status === 'validating' || disposed) return false
    const version = bump(key), valid = () => !disposed && versions.get(key) === version && current.has(key)
    put(key, { ...draft, status: 'validating', errors: {} })
    try {
      const errors = await editing.validate?.(draft.record, draft.original)
      if (!valid()) return false
      if (errors && Object.keys(errors).length) { put(key, { ...draft, status: 'error', errors }); return false }
      const original = untrack(() => core().rowsByKey.get(key)?.original)
      if (original !== draft.original) { put(key, { ...draft, status: 'error', errors: { _row: 'Record changed or was removed while editing' } }); return false }
      put(key, { ...draft, status: 'saving', errors: {} })
      await editing.onSave(draft.record, draft.original, key)
      if (!valid()) return false
      put(key); return true
    } catch (error) {
      if (valid()) put(key, { ...draft, status: 'error', errors: { _row: error instanceof Error ? error.message : String(error) } })
      return false
    }
  }
  return { drafts, getDraft: (key: TableKey) => drafts().get(key), begin, setValue, cancel, commit }
}
