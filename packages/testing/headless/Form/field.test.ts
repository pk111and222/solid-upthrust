import { createRoot, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createForm } from '../../../competence/src/form'
import { createFormField } from '../../../competence/src/formField'

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

/**
 * Validate one field and collect its settled error/warning signals. The
 * field's error-writing .then chain settles a few microtasks after the
 * validateFields promise (and after any onChange-dispatched duplicate run),
 * so wait two macrotasks before asserting.
 */
const settle = async (form: ReturnType<typeof createForm>, name: string = 'a') => {
  const p = form.validateFields([name])
  await p.then(
    () => undefined,
    () => undefined,
  )
  await new Promise(r => setTimeout(r, 10))
  flush()
}

describe('createFormField — validation wiring', () => {
  it('onChange dispatches validateTrigger onChange validation', async () => {
    const form = createForm()
    const { field } = bootField(form, {
      get name() { return 'a' },
      get rules() { return [{ required: true, message: '必填' }] },
    })
    // empty change → required error
    field.onChange('')
    await settle(form)
    expect(field.errors()).toEqual(['必填'])
    expect(form.getFieldError('a')).toEqual(['必填'])

    // valid value clears
    field.onChange('x')
    await settle(form)
    expect(field.errors()).toEqual([])
  })

  it('validateFields rejects with errorFields and outOfDate=false', async () => {
    const form = createForm()
    bootField(form, {
      get name() { return 'a' },
      get rules() { return [{ min: 3, message: '太短' }] },
    })
    form.updateValue('a', 'ab')
    flush()
    const failure = await form.validateFields().then(
      () => null,
      (e: any) => e,
    )
    expect(failure).not.toBeNull()
    expect(failure.outOfDate).toBe(false)
    expect(failure.errorFields).toEqual([{ name: ['a'], errors: ['太短'], warnings: [] }])

    form.setFieldValue('a', 'abc')
    const values = await form.validateFields()
    expect(values).toEqual({ a: 'abc' })
  })

  it('warningOnly rules land in warnings, not errors', async () => {
    const form = createForm()
    const { field } = bootField(form, {
      get name() { return 'a' },
      get rules() { return [{ warningOnly: true, required: true, message: '警告' } as any] },
    })
    field.onChange('')
    await settle(form)
    expect(field.errors()).toEqual([])
    expect(field.warnings()).toEqual(['警告'])
    expect(form.getFieldWarning('a')).toEqual(['警告'])
  })

  it('validateFirst=true stops at the first failing rule', async () => {
    const form = createForm()
    const { field } = bootField(form, {
      get name() { return 'a' },
      get validateFirst() { return true },
      get rules() { return [{ min: 5, message: '太短' }, { max: 1, message: '太长' }] },
    })
    field.onChange('abc')
    await settle(form)
    expect(field.errors()).toEqual(['太短'])
  })

  it('race: a newer validation discards the older run results', async () => {
    const form = createForm()
    let slowMode = true
    const slow: { release?: () => void } = {}
    const { field } = bootField(form, {
      get name() { return 'a' },
      get rules() {
        return slowMode
          ? [{
              validator: () => new Promise<void>((_resolve, reject) => {
                slow.release = () => reject(new Error('慢校验失败'))
              }),
            } as any]
          : [{ min: 2, message: '太短' }]
      },
    })

    // Run 1: slow failing validator (stays pending)
    const slowRun = form.validateFields(['a'])
    flush()
    expect(field.meta().validating).toBe(true)

    // Run 2: switch to the fast rule set and validate again
    slowMode = false
    const fastRun = form.validateFields(['a'])
    await fastRun.then(() => undefined, () => undefined)
    await new Promise(r => setTimeout(r, 20))
    flush()

    // Now release the slow run — its result must be discarded (superseded)
    slow.release?.()
    await slowRun.then(() => undefined, () => undefined)
    await new Promise(r => setTimeout(r, 20))
    flush()
    expect(field.errors()).toEqual([])
    expect(field.meta().validating).toBe(false)
  })

  it('trigger filtering: rules with validateTrigger onBlur skip onChange runs', async () => {
    const form = createForm()
    const { field } = bootField(form, {
      get name() { return 'a' },
      get validateTrigger() { return ['onChange', 'onBlur'] as string[] },
      get rules() {
        return [
          { min: 3, message: '太短' },
          { max: 5, message: '太长', validateTrigger: 'onBlur' },
        ]
      },
    })
    field.onChange('abcdef') // 'abcdef' violates max:5 but that rule is onBlur-only
    // wait for the onChange-dispatched run (trigger-filtered) to settle
    await new Promise(r => setTimeout(r, 20))
    flush()
    expect(field.errors()).toEqual([])

    // explicit onBlur validation picks it up
    await form.validateFields(['a'], { triggerName: 'onBlur' } as any).then(
      () => undefined,
      () => undefined,
    )
    await new Promise(r => setTimeout(r, 20))
    flush()
    expect(field.errors()).toEqual(['太长'])
  })

  it('field meta reports validating during a pending run', async () => {
    const form = createForm()
    const validator: { release?: () => void } = {}
    const { field } = bootField(form, {
      get name() { return 'a' },
      get rules() {
        return [
          { validator: () => new Promise<void>(resolve => { validator.release = () => resolve() }) } as any,
        ]
      },
    })
    // single run, no onChange dispatch
    const pending = form.validateFields(['a'])
    flush()
    expect(field.meta().validating).toBe(true)
    expect(form.isFieldValidating('a')).toBe(true)

    // the wrapped validator body runs in a microtask — wait one tick so the
    // release closure exists before calling it
    await new Promise(r => setTimeout(r, 0))
    validator.release?.()
    await pending.then(() => undefined, () => undefined)
    await new Promise(r => setTimeout(r, 20))
    flush()
    expect(field.meta().validating).toBe(false)
  })
})

describe('createFormField — async validator rules', () => {
  it('custom async validator rejection surfaces as error message', async () => {
    const form = createForm()
    const { field } = bootField(form, {
      get name() { return 'a' },
      get rules() {
        return [
          {
            validator: async (_rule: any, value: string) => {
              if (value !== 'magic') throw new Error('不是 magic')
            },
          } as any,
        ]
      },
    })
    field.onChange('other')
    await settle(form)
    expect(field.errors()).toEqual(['不是 magic'])

    field.onChange('magic')
    await settle(form)
    expect(field.errors()).toEqual([])
  })

  it('validateOnly runs rules without touching error state', async () => {
    const form = createForm()
    const { field } = bootField(form, {
      get name() { return 'a' },
      get rules() { return [{ required: true, message: '必填' }] },
    })
    const result = await form.validateFields(['a'], { validateOnly: true } as any).then(
      () => 'pass',
      (e: any) => e,
    )
    // required on undefined → fails
    expect(result).not.toBe('pass')
    // but the field's error state stays clean
    expect(field.errors()).toEqual([])
  })
})
