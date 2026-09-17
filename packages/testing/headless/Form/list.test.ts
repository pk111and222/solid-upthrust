import { createRoot, flush } from 'solid-js'
import { describe, expect, it } from 'vitest'
import { createForm } from '../../../competence/src/form'
import { createFormField } from '../../../competence/src/formField'
import { createFormList } from '../../../competence/src/formList'

const bootList = (
  config: Parameters<typeof createFormList>[1],
  form: ReturnType<typeof createForm> = createForm(),
) => {
  let list!: ReturnType<typeof createFormList>
  const dispose = createRoot(dispose => {
    list = createFormList(form, config)
    return dispose
  })
  flush()
  return { list, form, dispose }
}

describe('createFormList — keyManager', () => {
  it('add appends rows with fresh keys', () => {
    const { list, form } = bootList({ get name() { return 'users' } })
    list.operations.add()
    list.operations.add('seed')
    flush()
    expect(form.getFieldValue(['users'])).toEqual([undefined, 'seed'])
    expect(list.fields().map(f => f.key)).toEqual([0, 1])
    expect(list.fields().map(f => f.name)).toEqual([0, 1])
  })

  it('remove keeps remaining row keys stable (no identity churn)', () => {
    const { list } = bootList({ get name() { return 'users' } })
    list.operations.add('a')
    list.operations.add('b')
    list.operations.add('c')
    flush()
    const keysBefore = list.fields().map(f => f.key)
    expect(keysBefore).toEqual([0, 1, 2])

    list.operations.remove(1)
    flush()
    // surviving rows keep their ORIGINAL keys — For rows are not remounted
    expect(list.fields().map(f => f.key)).toEqual([0, 2])
    expect(list.value()).toEqual(['a', 'c'])
  })

  it('remove accepts multiple indices at once', () => {
    const { list } = bootList({ get name() { return 'users' } })
    list.operations.add('a')
    list.operations.add('b')
    list.operations.add('c')
    list.operations.add('d')
    flush()
    list.operations.remove([0, 2])
    flush()
    expect(list.value()).toEqual(['b', 'd'])
    expect(list.fields().map(f => f.key)).toEqual([1, 3])
  })

  it('move carries both the value and the key', () => {
    const { list } = bootList({ get name() { return 'users' } })
    list.operations.add('a')
    list.operations.add('b')
    list.operations.add('c')
    flush()
    list.operations.move(0, 2)
    flush()
    expect(list.value()).toEqual(['b', 'c', 'a'])
    // the 'a' row (key 0) moved to position 2 with its key
    expect(list.fields().map(f => f.key)).toEqual([1, 2, 0])
  })

  it('move out of range is a no-op', () => {
    const { list } = bootList({ get name() { return 'users' } })
    list.operations.add('a')
    flush()
    list.operations.move(0, 5)
    list.operations.move(-1, 0)
    flush()
    expect(list.value()).toEqual(['a'])
  })

  it('add with index inserts at the position (value + key)', () => {
    const { list } = bootList({ get name() { return 'users' } })
    list.operations.add('a')
    list.operations.add('c')
    flush()
    list.operations.add('b', 1)
    flush()
    expect(list.value()).toEqual(['a', 'b', 'c'])
    expect(list.fields().map(f => f.key)).toEqual([0, 2, 1])
  })
})

describe('createFormList — store integration', () => {
  it('initialValue seeds the store on first read', () => {
    const { form } = bootList({
      get name() { return 'users' },
      get initialValue() { return ['x', 'y'] },
    })
    flush()
    expect(form.getFieldValue(['users'])).toEqual(['x', 'y'])
  })

  it('fields inside a list row bind by prefix + index', () => {
    const form = createForm()
    const { list } = bootList({ get name() { return 'users' } }, form)
    list.operations.add({ name: '甲' })
    list.operations.add({ name: '乙' })
    flush()

    // Simulate a row field binding ['users', 0, 'name']
    let rowField!: ReturnType<typeof createFormField>
    createRoot(dispose => {
      rowField = createFormField(form, {
        get name() { return ['users', 0, 'name'] },
        get initialValue() { return undefined },
        get rules() { return undefined },
        get dependencies() { return undefined },
        get validateTrigger() { return false as const },
        get validateFirst() { return undefined },
        get validateDebounce() { return undefined },
        get messageVariables() { return undefined },
        get normalize() { return undefined },
        get getValueFromEvent() { return undefined },
        get preserve() { return undefined },
        get disabled() { return undefined },
      })
      return dispose
    })
    flush()
    expect(rowField.value()).toBe('甲')

    rowField.onChange('丙')
    flush()
    expect(form.getFieldValue(['users', 0, 'name'])).toBe('丙')
  })

  it('non-array values fall back to an empty list', () => {
    const form = createForm()
    form.updateValue('users', 'not-an-array')
    const { list } = bootList({ get name() { return 'users' } }, form)
    flush()
    expect(list.value()).toEqual([])
    expect(list.fields()).toEqual([])
  })

  it('value is reactive to external setFieldsValue', () => {
    const form = createForm()
    const { list } = bootList({ get name() { return 'users' } }, form)
    flush()
    form.setFieldsValue({ users: ['a', 'b'] })
    flush()
    expect(list.value()).toEqual(['a', 'b'])
    // seeded keys for grown arrays
    expect(list.fields().map(f => f.key)).toEqual([0, 1])
  })
})
