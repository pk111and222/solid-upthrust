import type { FormFieldRule } from '../../../competence/src/formField'
import { describe, expect, it, vi } from 'vitest'
import {
  allPromiseFinish,
  defaultValidateMessages,
  isRequiredRule,
  mergeMessages,
  replaceMessage,
  validateRules,
  type RuleError,
} from '../../../competence/src/formValidate'

const run = (rules: FormFieldRule[], value: unknown, opts: Parameters<typeof validateRules>[3] = {}) =>
  validateRules(['user'], value, rules, opts).then(
    () => [] as RuleError[],
    (e: RuleError[]) => e,
  )

describe('validateRules — basic rule types', () => {
  it('required catches empty values', async () => {
    const errors = await run([{ required: true, message: '必填' }], '')
    expect(errors.length).toBe(1)
    expect(errors[0].errors).toEqual(['必填'])
  })

  it('required passes with a value', async () => {
    const errors = await run([{ required: true, message: '必填' }], 'x')
    expect(errors).toEqual([])
  })

  it('min/max/len on strings', async () => {
    expect((await run([{ min: 3, message: '太短' }], 'ab')).length).toBe(1)
    expect((await run([{ min: 3, message: '太短' }], 'abc')).length).toBe(0)
    expect((await run([{ max: 2, message: '太长' }], 'abc')).length).toBe(1)
    expect((await run([{ len: 2, message: '长度' }], 'ab')).length).toBe(0)
  })

  it('pattern mismatch', async () => {
    expect((await run([{ pattern: /^\d+$/, message: '数字' }], 'abc')).length).toBe(1)
    expect((await run([{ pattern: /^\d+$/, message: '数字' }], '123')).length).toBe(0)
  })

  it("enum (requires type: 'enum' — async-validator dispatches by type)", async () => {
    expect((await run([{ type: 'enum', enum: ['a', 'b'], message: '枚举' } as any], 'c')).length).toBe(1)
    expect((await run([{ type: 'enum', enum: ['a', 'b'], message: '枚举' } as any], 'a')).length).toBe(0)
  })

  it('type email/url', async () => {
    expect((await run([{ type: 'email', message: '邮箱' }], 'not-email')).length).toBe(1)
    expect((await run([{ type: 'email', message: '邮箱' }], 'a@b.com')).length).toBe(0)
  })

  it('whitespace', async () => {
    expect((await run([{ whitespace: true, message: '空白' }], '   ')).length).toBe(1)
    expect((await run([{ whitespace: true, message: '空白' }], ' a ')).length).toBe(0)
  })
})

describe('validateRules — custom validator', () => {
  it('promise-returning validator (resolve = pass)', async () => {
    const errors = await run([{ validator: async () => undefined } as any], 'x')
    expect(errors).toEqual([])
  })

  it('promise-returning validator (reject = fail with message)', async () => {
    const errors = await run([{ validator: async () => Promise.reject('不对') } as any], 'x')
    expect(errors[0].errors).toEqual(['不对'])
  })

  it('throwing validator becomes CODE_LOGIC_ERROR → messages.default', async () => {
    const errors = await run([
      { validator: () => { throw new Error('boom') } } as any,
    ], 'x')
    expect(errors.length).toBe(1)
    // CODE_LOGIC_ERROR maps to messages.default with ${name} filled
    expect(errors[0].errors[0]).toBe('字段校验错误：user')
  })

  it('legacy callback style validator', async () => {
    const errors = await run([
      { validator: (_rule, _value, callback) => { callback('回调错误') } },
    ], 'x')
    expect(errors[0].errors).toEqual(['回调错误'])
  })
})

describe('validateRules — validateFirst modes', () => {
  const rules = [
    { required: true, message: '必填' },
    { min: 5, message: '太短' },
  ]

  it('default (false): all rules run, errors merged in order', async () => {
    // 'ab' is non-empty so both required(pass) and min(fail) evaluate
    const errors = await run(rules, 'ab')
    expect(errors.length).toBe(1)
    expect(errors.map(e => e.errors[0])).toEqual(['太短'])
  })

  it('validateFirst=true: serial, first failure wins', async () => {
    const errors = await validateRules(['user'], 'ab', rules as any, {}, true).then(
      () => [] as RuleError[],
      (e: RuleError[]) => e,
    )
    // 'ab': required passes, min:5 fails → serial run stops with 1 error
    expect(errors.length).toBe(1)
    expect(errors[0].errors).toEqual(['太短'])
  })

  it("validateFirst='parallel': first failure wins even if others still pending", async () => {
    const mixed = [
      { validator: () => new Promise<void>(() => undefined) } as any, // never settles
      { required: true, message: '必填' },
    ]
    const errors = await validateRules(['user'], '', mixed, {}, 'parallel').then(
      () => [] as RuleError[],
      (e: RuleError[]) => e,
    )
    expect(errors.length).toBe(1)
    expect(errors[0].errors).toEqual(['必填'])
  })
})

describe('validateRules — warningOnly and array defaultField', () => {
  it('warningOnly rules run LAST', async () => {
    const rules = [
      { warningOnly: true, required: true, message: '警告' },
      { required: true, message: '错误' },
    ]
    const errors = await run(rules, '')
    expect(errors.length).toBe(2)
    // error rule evaluated first despite being declared second
    expect(errors[0].errors).toEqual(['错误'])
    expect(errors[1].errors).toEqual(['警告'])
  })

  it('array + defaultField validates each item', async () => {
    const rules = [{ type: 'array' as const, defaultField: { required: true, message: '项 ${name} 必填' } }]
    const errors = await run(rules as any, ['a', '', 'c'])
    expect(errors.length).toBe(1)
    expect(errors[0].errors[0]).toContain('user.1')
  })
})

describe('message templates', () => {
  it('replaceMessage fills ${var} and handles escapes', () => {
    expect(replaceMessage('请输入${name}', { name: '用户名' })).toBe('请输入用户名')
    expect(replaceMessage('\\${literal}', {})).toBe('${literal}')
    expect(replaceMessage('${missing}', {})).toBe('')
  })

  it('default messages use ${name}/${min}/${max} templates', () => {
    expect(defaultValidateMessages.required).toContain('${name}')
    expect(defaultValidateMessages.string.min).toContain('${min}')
  })

  it('rule fields are available as template variables', async () => {
    const errors = await run([{ min: 3 }], 'ab')
    // default template: 字段 ${name} 的长度不能少于 ${min}
    expect(errors[0].errors[0]).toBe('字段 user 的长度不能少于 3')
  })

  it('messageVariables participate', async () => {
    const errors = await validateRules(['user'], 'ab', [{ min: 3, message: '${label} 太短' }], {}, undefined, { label: '用户名' }).then(
      () => [] as RuleError[],
      (e: RuleError[]) => e,
    )
    expect(errors[0].errors[0]).toBe('用户名 太短')
  })

  it('mergeMessages deep-merges overrides', () => {
    const merged = mergeMessages(defaultValidateMessages as any, {
      required: '必填 ${name}',
      string: { min: '至少 ${min} 个字符' },
    })
    expect(merged.required).toBe('必填 ${name}')
    expect(merged.string.min).toBe('至少 ${min} 个字符')
    expect(merged.string.max).toBe(defaultValidateMessages.string.max)
  })
})

describe('allPromiseFinish', () => {
  it('resolves with results when all promises resolve', async () => {
    const out = await allPromiseFinish([Promise.resolve('a'), Promise.resolve('b')])
    expect(out).toEqual(['a', 'b'])
  })

  it('rejects with the collected rejection payloads when any fails', async () => {
    const out = await allPromiseFinish([
      Promise.resolve('ok'),
      Promise.reject('bad'),
    ]).then(
      () => 'resolved',
      (e: any) => e,
    )
    expect(out).toEqual(['ok', 'bad'])
  })
})

describe('isRequiredRule', () => {
  it('detects required in rule objects', () => {
    expect(isRequiredRule([{ required: true }])).toBe(true)
    expect(isRequiredRule([{ min: 3 }])).toBe(false)
    expect(isRequiredRule([])).toBe(false)
    expect(isRequiredRule(undefined)).toBe(false)
  })
})
