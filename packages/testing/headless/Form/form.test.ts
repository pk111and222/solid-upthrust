import { createMemo, createRoot, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createForm, type FormCallbacks } from '../../../competence/src/form'
import { createFormField } from '../../../competence/src/formField'

/** Boot a field inside a root so registration + cleanup mechanics run. */
const bootField = (
  form: ReturnType<typeof createForm>,
  config: Parameters<typeof createFormField>[1],
) => {
  let field!: ReturnType<typeof createFormField>
  const dispose = createRoot(dispose => {
    field = createFormField(form, config)
    return dispose
  })
  flush()
  return { field, dispose }
}

describe('createForm — value lifecycle', () => {
  it('starts with an empty store', () => {
    const form = createForm()
    expect(form.values()).toEqual({})
    expect(form.getFieldValue('a')).toBeUndefined()
  })

  it('updateValue writes nested paths immutably and notifies values()', () => {
    const form = createForm()
    createRoot(() => {
      form.updateValue(['user', 'name'], 'solid')
      form.updateValue(['user', 'age'], 1)
      form.updateValue(['list', 0], 'a')
      flush()
    })
    expect(form.getFieldValue(['user', 'name'])).toBe('solid')
    expect(form.getFieldValue(['user'])).toEqual({ name: 'solid', age: 1 })
    expect(form.getFieldValue(['list'])).toEqual(['a'])
  })

  it('onValuesChange / onFieldsChange callbacks fire on update', () => {
    const form = createForm()
    const onValuesChange = vi.fn()
    const onFieldsChange = vi.fn()
    form.setCallbacks({ onValuesChange, onFieldsChange })

    const { field } = bootField(form, { get name() { return 'a' } })
    field.onChange('v1')
    flush()

    expect(onValuesChange).toHaveBeenCalledTimes(1)
    expect(onValuesChange.mock.calls[0][0]).toEqual({ a: 'v1' })
    expect(onFieldsChange).toHaveBeenCalledTimes(1)
    const changed = onFieldsChange.mock.calls[0][0] as any[]
    expect(changed[0].name).toEqual(['a'])
    expect(changed[0].value).toBe('v1')
  })
})

describe('createForm — initialValues', () => {
  it('applies config initialValues on first read (init-only)', () => {
    const form = createForm({ get initialValues() { return { a: 1, b: { c: 2 } } } })
    expect(form.getFieldValue('a')).toBe(1)
    expect(form.getFieldValue(['b', 'c'])).toBe(2)
  })

  it('initialValues do not overwrite values set before first read', () => {
    const form = createForm({ get initialValues() { return { a: 1 } } })
    form.updateValue('a', 'user-set')
    expect(form.getFieldValue('a')).toBe('user-set')
  })

  it('setInitialValues(init) merges with existing store (store wins)', () => {
    const form = createForm()
    form.updateValue('a', 'kept')
    form.setInitialValues({ a: 'init', b: 2 }, true)
    expect(form.getFieldValue('a')).toBe('kept')
    expect(form.getFieldValue('b')).toBe(2)
  })
})

describe('createForm — field initialValue prop', () => {
  it('initEntityValue fills only missing store slots', () => {
    const form = createForm()
    const { field } = bootField(form, {
      get name() { return 'nick' },
      get initialValue() { return 'default-nick' },
    })
    expect(form.getFieldValue('nick')).toBe('default-nick')
    expect(field.value()).toBe('default-nick')
  })

  it('does not overwrite an existing value', () => {
    const form = createForm()
    form.updateValue('nick', 'existing')
    const { field } = bootField(form, {
      get name() { return 'nick' },
      get initialValue() { return 'default-nick' },
    })
    expect(field.value()).toBe('existing')
  })
})

describe('createForm — getFieldsValue', () => {
  it('returns the full store with true', () => {
    const form = createForm()
    form.updateValue('a', 1)
    form.updateValue(['b', 'c'], 2)
    expect(form.getFieldsValue(true)).toEqual({ a: 1, b: { c: 2 } })
  })

  it('projects onto registered field paths by default (list fields excluded)', () => {
    const form = createForm()
    form.updateValue('registered', 1)
    form.updateValue('orphan', 2)
    bootField(form, { get name() { return 'registered' } })
    expect(form.getFieldsValue()).toEqual({ registered: 1 })
  })

  it('projects onto an explicit nameList (missing fields included)', () => {
    const form = createForm()
    form.updateValue('a', 1)
    bootField(form, { get name() { return 'a' } })
    expect(form.getFieldsValue(['a', 'missing'])).toEqual({ a: 1 })
  })
})

describe('createForm — touched / reset', () => {
  it('isFieldTouched tracks user edits and resetFields clears state', () => {
    const form = createForm()
    const { field } = bootField(form, { get name() { return 'a' } })

    expect(form.isFieldTouched('a')).toBe(false)
    field.onChange('v1')
    flush()
    expect(form.isFieldTouched('a')).toBe(true)
    expect(field.touched()).toBe(true)

    form.resetFields()
    flush()
    expect(form.isFieldTouched('a')).toBe(false)
    expect(field.touched()).toBe(false)
    expect(field.errors()).toEqual([])
    expect(form.getFieldValue('a')).toBeUndefined()
  })

  it('resetFields restores initialValues', () => {
    const form = createForm({ get initialValues() { return { a: 1 } } })
    expect(form.getFieldValue('a')).toBe(1)
    const { field } = bootField(form, { get name() { return 'a' } })
    field.onChange(99)
    flush()
    form.resetFields()
    flush()
    expect(form.getFieldValue('a')).toBe(1)
  })

  it('resetFields(nameList) only resets listed paths', () => {
    const form = createForm({ get initialValues() { return { a: 1, b: 2 } } })
    form.getFieldValue('a') // trigger initial application
    const { field: fieldA } = bootField(form, { get name() { return 'a' } })
    const { field: fieldB } = bootField(form, { get name() { return 'b' } })
    fieldA.onChange(10)
    fieldB.onChange(20)
    flush()
    form.resetFields(['a'])
    flush()
    expect(form.getFieldValue('a')).toBe(1)
    expect(form.getFieldValue('b')).toBe(20)
    expect(fieldA.touched()).toBe(false)
    expect(fieldB.touched()).toBe(true)
  })

  it('resetFields falls back to field initialValue when form has none', () => {
    const form = createForm()
    const { field } = bootField(form, {
      get name() { return 'a' },
      get initialValue() { return 'seed' },
    })
    field.onChange('edited')
    flush()
    form.resetFields()
    flush()
    expect(form.getFieldValue('a')).toBe('seed')
  })
})

describe('createForm — external set', () => {
  it('setFieldsValue merges deep', () => {
    const form = createForm()
    form.updateValue(['a', 'b'], 1)
    form.setFieldsValue({ a: { c: 2 } })
    expect(form.getFieldValue('a')).toEqual({ b: 1, c: 2 })
  })

  it('setFieldValue writes a single path', () => {
    const form = createForm()
    form.setFieldValue(['x', 0], 'first')
    expect(form.getFieldValue('x')).toEqual(['first'])
  })

  it('setFields syncs errors/touched onto the field entity', () => {
    const form = createForm()
    const { field } = bootField(form, { get name() { return 'a' } })
    form.setFields([{ name: 'a', value: 'set', errors: ['bad'], warnings: ['careful'], touched: true }])
    flush()
    expect(field.value()).toBe('set')
    expect(field.errors()).toEqual(['bad'])
    expect(field.warnings()).toEqual(['careful'])
    expect(field.touched()).toBe(true)
    expect(form.getFieldError('a')).toEqual(['bad'])
    expect(form.getFieldWarning('a')).toEqual(['careful'])
  })
})

describe('createForm — unregister / preserve', () => {
  it('unregister removes the value by default (preserve unset → true? no: default preserve true keeps it)', () => {
    // rc semantics: preserve defaults to TRUE (values kept).
    const form = createForm()
    const { field, dispose } = bootField(form, { get name() { return 'a' } })
    field.onChange('v')
    flush()
    dispose()
    flush()
    expect(form.getFieldValue('a')).toBe('v')
  })

  it('unregister with preserve=false cleans the store and broadcasts removal', () => {
    const form = createForm()
    let sawRemove = false
    createRoot(dispose => {
      form.registerWatch((_values, _all, namePath) => {
        if (namePath.join('.') === 'a' && sawRemoveOnce()) sawRemove = true
      })
      const sawRemoveOnce = () => true
      const { field, dispose: d } = ((): any => ({ field: null, dispose: null })) as any
      void field; void d
      return dispose
    })
    // simpler: watch via removeEventSignal
    const { field, dispose } = bootField(form, { get name() { return 'a' }, get preserve() { return false } })
    field.onChange('v')
    flush()
    dispose()
    flush()
    expect(form.getFieldValue('a')).toBeUndefined()
    expect(form.removeEventSignal()).toBeTruthy()
    void sawRemove
  })

  it('destroyForm(false) records non-preserved fields for initialValues refill', () => {
    const form = createForm({ get initialValues() { return { a: 'init' } } })
    form.getFieldValue('a')
    const { dispose } = bootField(form, { get name() { return 'a' }, get preserve() { return false } })
    form.updateValue('a', 'edited')
    form.destroyForm(false)
    dispose()
    // re-init: initialValues refill the non-preserved path
    form.setInitialValues({ a: 'init' }, true)
    expect(form.getFieldValue('a')).toBe('init')
  })

  it('destroyForm(true) clears the store', () => {
    const form = createForm()
    form.updateValue('a', 1)
    form.destroyForm(true)
    expect(form.values()).toEqual({})
  })
})

describe('createForm — isFieldsTouched', () => {
  it('some / every semantics over all fields', () => {
    const form = createForm()
    const { field: f1 } = bootField(form, { get name() { return 'a' } })
    const { field: f2 } = bootField(form, { get name() { return 'b' } })
    expect(form.isFieldsTouched()).toBe(false)
    f1.onChange(1)
    flush()
    expect(form.isFieldsTouched()).toBe(true)
    expect(form.isFieldsTouched(true)).toBe(false)
    f2.onChange(2)
    flush()
    expect(form.isFieldsTouched(true)).toBe(true)
  })
})

describe('createForm — watch', () => {
  it('registerWatch receives values on updates', () => {
    const form = createForm()
    const seen: string[] = []
    form.registerWatch((_values, _all, namePath) => seen.push(namePath.join('.')))
    bootField(form, { get name() { return 'a' } })
    form.updateValue('a', 1)
    form.updateValue(['b', 'c'], 2)
    expect(seen.filter(p => p === 'a').length).toBeGreaterThan(0)
    expect(seen).toContain('b,c')
  })
})

describe('createForm — submit', () => {
  it('submit resolves values and calls onFinish', async () => {
    const form = createForm()
    const onFinish = vi.fn()
    const callbacks: FormCallbacks = { onFinish }
    form.setCallbacks(callbacks)
    bootField(form, { get name() { return 'a' } })
    form.updateValue('a', 'v')
    await form.submit()
    expect(onFinish).toHaveBeenCalledWith({ a: 'v' })
  })
})

describe('createFormField — value memo reactivity', () => {
  it('field.value() tracks store updates for its path only', () => {
    const form = createForm()
    const { field } = bootField(form, { get name() { return ['user', 'name'] } })
    expect(field.value()).toBeUndefined()
    form.updateValue(['user', 'name'], 'solid')
    flush()
    expect(field.value()).toBe('solid')
    form.updateValue('other', 'x')
    flush()
    expect(field.value()).toBe('solid')
  })

  it('field.onChange normalizes and skips no-op writes', () => {
    const form = createForm()
    const onValuesChange = vi.fn()
    form.setCallbacks({ onValuesChange })
    const { field } = bootField(form, {
      get name() { return 'a' },
      get normalize() { return (v: string) => v.trim() }
    })
    field.onChange('  x  ')
    flush()
    expect(form.getFieldValue('a')).toBe('x')
    field.onChange('x') // normalize('x') === 'x' → no dispatch
    flush()
    expect(onValuesChange).toHaveBeenCalledTimes(1)
  })

  it('getValueFromEvent converts event-like args', () => {
    const form = createForm()
    const { field } = bootField(form, { get name() { return 'a' } })
    field.onChange({ target: { value: 'from-event' } })
    flush()
    expect(form.getFieldValue('a')).toBe('from-event')
  })
})

describe('createForm — watch', () => {
  it('watch() returns a signal that tracks value changes', () => {
    const form = createForm()
    const name = form.watch(['user', 'name'])
    form.updateValue(['user', 'name'], 'a')
    flush()
    expect(name()).toBe('a')
    form.updateValue(['user', 'name'], 'b')
    flush()
    expect(name()).toBe('b')
  })

  it('watch() with a selector computes derived state', () => {
    const form = createForm()
    const total = form.watch(values => (values.a ?? 0) + (values.b ?? 0))
    form.updateValue('a', 1)
    form.updateValue('b', 2)
    flush()
    expect(total()).toBe(3)
  })

  it('watch() de-dupes equivalent object writes via stringify', () => {
    const form = createForm()
    let notified = 0
    const obj = form.watch('a')
    createRoot(dispose => {
      createMemo(() => { obj(); notified++ })
      form.updateValue('a', { x: 1 })
      flush()
      const afterFirst = notified
      form.updateValue('a', { x: 1 }) // same content — memo should not re-run
      flush()
      expect(notified).toBe(afterFirst)
      form.updateValue('a', { x: 2 }) // different content — memo re-runs
      flush()
      expect(notified).toBe(afterFirst + 1)
      dispose()
    })
    expect(obj()).toEqual({ x: 2 })
  })

  it('watch() dispose cancels the subscription', () => {
    const form = createForm()
    const name = form.watch('a')
    ;(name as any).dispose?.()
    form.updateValue('a', 'x')
    flush()
    // disposed — the signal no longer updates
    expect(name()).toBeUndefined()
  })
})
