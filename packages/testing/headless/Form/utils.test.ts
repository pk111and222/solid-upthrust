import { describe, expect, it } from 'vitest'
import {
  NameMap,
  cloneByNamePathList,
  containsNamePath,
  defaultGetValueFromEvent,
  getNamePath,
  getValue,
  matchNamePath,
  move,
  setValue,
} from '../../../competence/src/formUtils'

describe('getNamePath', () => {
  it('normalizes the supported shapes', () => {
    expect(getNamePath(undefined)).toEqual([])
    expect(getNamePath(null)).toEqual([])
    expect(getNamePath('a')).toEqual(['a'])
    expect(getNamePath(0)).toEqual([0])
    expect(getNamePath(['a', 0, 'b'])).toEqual(['a', 0, 'b'])
  })
})

describe('getValue', () => {
  it('reads nested objects and arrays', () => {
    const store = { a: { b: [10, { c: 'x' }] } }
    expect(getValue(store, ['a', 'b', 0])).toBe(10)
    expect(getValue(store, ['a', 'b', 1, 'c'])).toBe('x')
  })

  it('returns undefined on missing segments without throwing', () => {
    expect(getValue(undefined, ['a'])).toBeUndefined()
    expect(getValue({ a: null }, ['a', 'b'])).toBeUndefined()
    expect(getValue({}, ['a', 'b', 'c'])).toBeUndefined()
  })
})

describe('setValue', () => {
  it('sets a top-level key immutably', () => {
    const store = { a: 1, b: 2 }
    const next = setValue(store, ['c'], 3)
    expect(next).toEqual({ a: 1, b: 2, c: 3 })
    expect(next).not.toBe(store)
    expect(store).toEqual({ a: 1, b: 2 })
  })

  it('clones only containers along the path', () => {
    const store = { a: { b: { c: 1 }, other: 'keep' }, untouched: true }
    const next = setValue(store, ['a', 'b', 'c'], 2)
    expect(next.a.b.c).toBe(2)
    expect(next.a.b).not.toBe(store.a.b)
    expect(next.a.other).toBe('keep')
    expect(store.a.b.c).toBe(1)
  })

  it('creates missing intermediate containers (object for string key, array for number key)', () => {
    const next = setValue({}, ['a', 'b'], 1)
    expect(next).toEqual({ a: { b: 1 } })

    const nextArr = setValue({}, ['list', 0], 'x')
    expect(nextArr).toEqual({ list: ['x'] })
  })

  it('overwrites a non-container leaf into a container', () => {
    const store = { a: 5 }
    const next = setValue(store, ['a', 'b'], 1)
    expect(next).toEqual({ a: { b: 1 } })
  })

  it('removes the leaf with remove=true (object key and array index)', () => {
    const store = { a: { b: 1, c: 2 }, list: [1, 2, 3] }
    const next = setValue(store, ['a', 'b'], undefined, true)
    expect(next.a).toEqual({ c: 2 })

    const nextArr = setValue(store, ['list', 1], undefined, true)
    expect(nextArr.list).toEqual([1, 3])
    expect(store.list).toEqual([1, 2, 3])
  })

  it('replaces the whole store when path is empty', () => {
    expect(setValue({ a: 1 }, [], { b: 2 })).toEqual({ b: 2 })
  })
})

describe('cloneByNamePathList', () => {
  it('projects the store onto the requested paths', () => {
    const store = { a: 1, b: { c: 2 }, d: 3 }
    expect(cloneByNamePathList(store, [['a'], ['b', 'c']])).toEqual({ a: 1, b: { c: 2 } })
  })

  it('skips missing paths', () => {
    expect(cloneByNamePathList({ a: 1 }, [['zzz']])).toEqual({})
  })
})

describe('matchNamePath / containsNamePath', () => {
  it('requires equal length unless partialMatch', () => {
    expect(matchNamePath(['a', 'b'], ['a', 'b'])).toBe(true)
    expect(matchNamePath(['a', 'b', 'c'], ['a', 'b'], true)).toBe(true)
    expect(matchNamePath(['a', 'b', 'c'], ['a', 'b'])).toBe(false)
    expect(matchNamePath(['a'], ['b'])).toBe(false)
  })

  it('keeps number/string segments distinct', () => {
    expect(matchNamePath([0], ['0'])).toBe(false)
  })

  it('containsNamePath scans the list', () => {
    const list = [['a'], ['b', 'c']]
    expect(containsNamePath(list, ['a'])).toBe(true)
    expect(containsNamePath(list, ['b', 'c'])).toBe(true)
    expect(containsNamePath(list, ['b'])).toBe(false)
    expect(containsNamePath(list, ['b'], true)).toBe(false)
    expect(containsNamePath(list, ['b', 'c', 'd'], true)).toBe(true)
    expect(containsNamePath(null, ['a'])).toBe(false)
  })
})

describe('move', () => {
  it('moves an item and returns a new array', () => {
    const arr = [1, 2, 3, 4]
    expect(move(arr, 1, 3)).toEqual([1, 3, 4, 2])
    expect(arr).toEqual([1, 2, 3, 4])
    expect(move(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a'])
  })
})

describe('defaultGetValueFromEvent', () => {
  it('reads event.target[valuePropName] for event-like args', () => {
    expect(defaultGetValueFromEvent('value', { target: { value: 'v' } })).toBe('v')
    expect(defaultGetValueFromEvent('checked', { target: { checked: true } })).toBe(true)
  })

  it('passes the bare value through otherwise', () => {
    expect(defaultGetValueFromEvent('value', 'plain')).toBe('plain')
    expect(defaultGetValueFromEvent('value')).toBeUndefined()
  })
})

describe('NameMap', () => {
  it('keys by normalized path and keeps 0 distinct from "0"', () => {
    const map = new NameMap<string>()
    map.set([0], 'zero-number')
    map.set(['0'], 'zero-string')
    expect(map.get([0])).toBe('zero-number')
    expect(map.get(['0'])).toBe('zero-string')
    expect(map.size).toBe(2)
  })

  it('update() receives the previous value', () => {
    const map = new NameMap<number[]>()
    map.update(['a'], prev => [...(prev ?? []), 1])
    map.update(['a'], prev => [...(prev ?? []), 2])
    expect(map.get(['a'])).toEqual([1, 2])
  })

  it('map() recovers typed keys', () => {
    const map = new NameMap<number>()
    map.set(['a', 1], 10)
    map.set(['b'], 20)
    const entries = map.map(({ key, value }) => ({ key, value }))
    expect(entries).toContainEqual({ key: ['a', 1], value: 10 })
    expect(entries).toContainEqual({ key: ['b'], value: 20 })
  })

  it('delete / has', () => {
    const map = new NameMap<boolean>()
    map.set(['x'], true)
    expect(map.has(['x'])).toBe(true)
    map.delete(['x'])
    expect(map.has(['x'])).toBe(false)
    expect(map.get(['x'])).toBeUndefined()
  })
})
