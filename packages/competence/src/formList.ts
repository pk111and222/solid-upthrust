import { createEffect, createMemo, createSignal } from 'solid-js'
import { type FormInstance, type StoreValue } from './form'
import { type InternalNamePath, type NamePath, getNamePath, getValue, move as arrayMove } from './formUtils'

/**
 * Headless form list — the signal-based port of rc-field-form's List.
 *
 * Owns the keyManager { keys, id } so rows keep stable identities across
 * add/remove/move (input focus and animations survive). The array value
 * itself lives in the store under `prefixName`; operations mutate through
 * the store so change events and validation fire like any field write.
 */

export type FormListField = {
  /** Row index in the CURRENT value array (positional). */
  name: number
  /** Stable identity key (survives remove/move; used as For key). */
  key: number
  isListField: true
}

export type FormListOperations = {
  /** Append (or insert at `index`) a row with an optional default value. */
  add: (defaultValue?: StoreValue, index?: number) => void
  /** Remove one index or several. */
  remove: (index: number | number[]) => void
  /** Move a row from one index to another (key travels with it). */
  move: (from: number, to: number) => void
}

export type FormListConfig = {
  readonly name: NamePath
  readonly initialValue?: StoreValue | undefined
  readonly rules?: unknown[] | undefined
  readonly preserve?: boolean | undefined
}

export function createFormList(form: FormInstance, config: FormListConfig) {
  const prefixName = createMemo<InternalNamePath>(() => getNamePath(config.name))

  // ------------------------------------------------------------ keyManager
  // keys[i] is the stable key of row i. Plain state, not a signal: row
  // identity changes ride the value signal (keys are read together with
  // value in the fields() memo).
  const keyManager = { keys: [] as number[], id: 0 }
  const [keysVersion, setKeysVersion] = createSignal(0, { name: 'formList:keys' })

  const seedKeys = (length: number) => {
    for (let i = 0; i < length; i += 1) {
      if (keyManager.keys[i] === undefined) {
        keyManager.keys[i] = keyManager.id
        keyManager.id += 1
      }
    }
  }

  // ---------------------------------------------------------------- value
  // The list value is read from the store (reactive for renders) —
  // valuesTracked so the memo re-runs on commits (values() is untracked
  // for event-handler sampling).
  const value = createMemo<StoreValue[]>(() => {
    const raw = getValue(form.valuesTracked(), prefixName())
    if (Array.isArray(raw)) return raw
    return []
  })

  // initEntityValue-equivalent: seed the store with initialValue when the
  // path is empty (createForm.initEntityValue only covers field entities).
  const initEffect = createEffect(
    () => prefixName().join('.'),
    () => {
      const initialValue = config.initialValue
      if (initialValue !== undefined && getValue(form.values(), prefixName()) === undefined) {
        form.updateValue(prefixName(), initialValue)
      }
    },
  )
  void initEffect

  const fields = createMemo<FormListField[]>(() => {
    void keysVersion()
    const list = value()
    seedKeys(list.length)
    return list.map((_, index) => ({
      name: index,
      key: keyManager.keys[index],
      isListField: true as const,
    }))
  })

  // ---------------------------------------------------------------- ops
  const getListValue = () => {
    // getFieldValue reads the store's synchronous mirror — consecutive
    // operations in one batch must each see the previous write (the signal
    // read form.values() lags a commit).
    const raw = form.getFieldValue(prefixName())
    return Array.isArray(raw) ? raw : []
  }

  const commit = (nextValue: StoreValue[], nextKeys: number[]) => {
    keyManager.keys = nextKeys
    setKeysVersion(v => v + 1)
    form.updateValue(prefixName(), nextValue)
  }

  const add: FormListOperations['add'] = (defaultValue, index) => {
    const current = getListValue()
    if (index !== undefined && index >= 0 && index <= current.length) {
      keyManager.keys = [
        ...keyManager.keys.slice(0, index),
        keyManager.id,
        ...keyManager.keys.slice(index),
      ]
      commit(
        [...current.slice(0, index), defaultValue, ...current.slice(index)],
        keyManager.keys,
      )
    } else {
      keyManager.keys = [...keyManager.keys, keyManager.id]
      commit([...current, defaultValue], keyManager.keys)
    }
    keyManager.id += 1
  }

  const remove: FormListOperations['remove'] = index => {
    const current = getListValue()
    const indexSet = new Set(Array.isArray(index) ? index : [index])
    if (indexSet.size <= 0) return
    keyManager.keys = keyManager.keys.filter((_, keysIndex) => !indexSet.has(keysIndex))
    commit(
      current.filter((_, valueIndex) => !indexSet.has(valueIndex)),
      keyManager.keys,
    )
  }

  const move: FormListOperations['move'] = (from, to) => {
    if (from === to) return
    const current = getListValue()
    if (from < 0 || from >= current.length || to < 0 || to >= current.length) return
    commit(arrayMove(current, from, to), arrayMove(keyManager.keys, from, to))
  }

  const operations: FormListOperations = { add, remove, move }

  return {
    /** Reactive row descriptors: { name: index, key: stable key }. */
    fields,
    /** Reactive list value (array in the store at prefixName). */
    value,
    prefixName,
    operations,
  }
}

export type FormList = ReturnType<typeof createFormList>
