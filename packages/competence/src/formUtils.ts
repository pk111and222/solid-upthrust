/**
 * Form utilities — name path handling, immutable store get/set, and the
 * NameMap keyed by string[] paths.
 *
 * Ported from rc-field-form's valueUtil/NameMap (semantics kept, code
 * rewritten for this repo's conventions: no runtime deps, Solid-friendly).
 */

// ============================== NamePath ==============================

export type NamePathSegment = string | number
/** Internal normalized path — always a flat array of string|number. */
export type InternalNamePath = NamePathSegment[]
/** User-facing name: string ('a.b' NOT supported — plain key), number, or array. */
export type NamePath = string | number | InternalNamePath

/**
 * Convert a user-provided name into the internal flat array format.
 * 'a' => ['a']; 123 => [123]; ['a', 123] => ['a', 123]
 * Only string/number segments are supported by the public contract.
 */
export function getNamePath(path?: NamePath | null): InternalNamePath {
  if (path == null) return []
  if (Array.isArray(path)) return path.map(unit => (typeof unit === 'number' ? unit : String(unit)))
  return [typeof path === 'number' ? path : String(path)]
}

// ============================== Get / Set ==============================

type AnyRecord = Record<string, any>

function isPlainObject(val: unknown): val is AnyRecord {
  return typeof val === 'object' && val !== null && !Array.isArray(val)
}

/** Get value at path. Returns undefined for any missing segment. */
export function getValue(store: unknown, namePath: InternalNamePath): any {
  let current: any = store
  for (const unit of namePath) {
    if (current == null) return undefined
    current = current[unit as any]
  }
  return current
}

/**
 * Immutable set: returns a new store with `value` placed at `namePath`,
 * shallow-cloning only the containers along the path. `remove` (true)
 * deletes the leaf instead (rc-util `set` third-flag semantics).
 */
export function setValue<T>(store: T, namePath: InternalNamePath, value: any, remove?: boolean): T {
  if (!namePath.length) return (remove ? undefined : value) as T

  const root: any = isPlainObject(store) ? { ...store } : {}
  let current = root
  for (let i = 0; i < namePath.length - 1; i += 1) {
    const key = namePath[i] as any
    const next = current[key]
    // Shallow-clone existing containers; the clone keeps the original type so
    // arrays stay arrays. Missing/leaf containers are created based on the
    // NEXT segment's type (number → array).
    if (Array.isArray(next)) current[key] = next.slice()
    else if (isPlainObject(next)) current[key] = { ...next }
    else current[key] = typeof namePath[i + 1] === 'number' ? [] : {}
    current = current[key]
  }

  const lastKey = namePath[namePath.length - 1] as any
  if (remove) {
    if (Array.isArray(current)) current.splice(lastKey, 1)
    else delete current[lastKey]
  } else {
    current[lastKey] = value
  }
  return root as T
}

/** Clone `store` restricted to the given paths (missing paths stay missing). */
export function cloneByNamePathList(store: unknown, namePathList: InternalNamePath[]): AnyRecord {
  let newStore: AnyRecord = {}
  namePathList.forEach(namePath => {
    newStore = setValue(newStore, namePath, getValue(store, namePath)) as AnyRecord
  })
  return newStore
}

// ============================== Matching ==============================

/**
 * Is `namePath` a super-set of (or equal to) `subNamePath`?
 * With partialMatch, [a, b] matches [a, b, c].
 */
export function matchNamePath(namePath?: InternalNamePath | null, subNamePath?: InternalNamePath | null, partialMatch = false): boolean {
  if (!namePath || !subNamePath) return false
  if (!partialMatch && namePath.length !== subNamePath.length) return false
  return subNamePath.every((unit, i) => namePath[i] === unit)
}

/** Does `namePathList` include `namePath` (exact, or partial when enabled)? */
export function containsNamePath(namePathList: InternalNamePath[] | null | undefined, namePath: InternalNamePath, partialMatch = false): boolean {
  return !!namePathList && namePathList.some(path => matchNamePath(namePath, path, partialMatch))
}

// ============================== Misc ==============================

/** Move array item (pure — returns a new array). */
export function move<T>(array: T[], from: number, to: number): T[] {
  const next = array.slice()
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

/**
 * Escape hatch for custom components whose `onChange` emits an Event rather
 * than a bare value: read `event.target[valuePropName]` when possible,
 * otherwise pass the first arg through unchanged.
 */
export function defaultGetValueFromEvent(valuePropName: string, ...args: any[]): any {
  const [event] = args
  if (event && typeof event === 'object' && 'target' in event && event.target && typeof event.target === 'object' && valuePropName in event.target) {
    return (event.target as AnyRecord)[valuePropName]
  }
  return event
}

// ============================== NameMap ==============================

const SPLIT = '__@field_split__'

/** Normalize a path to a string key: [a, 0] → 'string:a__@field_split__number:0'. */
function normalizeNamePath(namePath: InternalNamePath): string {
  return namePath.map(cell => `${typeof cell}:${cell}`).join(SPLIT)
}

/**
 * A Map keyed by NamePath (string[]). `type:value` normalization keeps
 * number 0 and string '0' distinct.
 */
export class NameMap<V> {
  private kvs = new Map<string, V>()

  set(key: InternalNamePath, value: V) {
    this.kvs.set(normalizeNamePath(key), value)
  }

  get(key: InternalNamePath): V | undefined {
    return this.kvs.get(normalizeNamePath(key))
  }

  update(key: InternalNamePath, updater: (prev?: V) => V) {
    this.set(key, updater(this.get(key)))
  }

  has(key: InternalNamePath): boolean {
    return this.kvs.has(normalizeNamePath(key))
  }

  delete(key: InternalNamePath) {
    this.kvs.delete(normalizeNamePath(key))
  }

  map<T>(mapper: (item: { key: InternalNamePath; value: V }) => T): T[] {
    return [...this.kvs.entries()].map(([normalized, value]) => {
      const key = normalized.split(SPLIT).map(unit => {
        const [type, raw] = unit.split(':')
        return type === 'number' ? Number(raw) : raw
      }) as InternalNamePath
      return mapper({ key, value })
    })
  }

  forEach(consumer: (item: { key: InternalNamePath; value: V }) => void) {
    this.map(item => item).forEach(consumer)
  }

  get size(): number {
    return this.kvs.size
  }
}
