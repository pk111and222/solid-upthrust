import RawAsyncValidator from 'async-validator'
import { type InternalNamePath, type NamePath } from './formUtils'
import type { FormFieldRule } from './formField'

/**
 * Validation engine — the async-validator adapter, ported from
 * rc-field-form's validateUtil with the same semantics:
 *
 *  - one rule per AsyncValidator run (avoids namePath collision issues)
 *  - ${var} message templates filled from rule fields + messageVariables
 *  - warningOnly rules sort last and land in `warnings` instead of `errors`
 *  - validateFirst: true = serial (stop at first failure), 'parallel' =
 *    first failure wins but all rules run, false/undefined = run all
 *  - `type: 'array'` + `defaultField` recurses into each item
 *  - validator functions that throw become a CODE_LOGIC_ERROR error
 */

// Silence async-validator's console warnings (fork parity with
// @rc-component/async-validator, which only adds this silencing).
const AsyncValidator = RawAsyncValidator as any
AsyncValidator.warning = () => undefined

const CODE_LOGIC_ERROR = 'CODE_LOGIC_ERROR'

// ---------------------------------------------------------------- messages

export const defaultValidateMessages = {
  default: '字段校验错误：${name}',
  required: '请输入${name}',
  enum: '字段 ${name} 必须是 [${enum}] 中的一个',
  whitespace: '字段 ${name} 不能为空白字符',
  date: {
    format: '字段 ${name} 的日期格式无效',
    parse: '字段 ${name} 无法解析为日期',
    invalid: '字段 ${name} 是无效日期',
  },
  types: {
    string: '字段 ${name} 的类型必须是 ${type}',
    method: '字段 ${name} 的类型必须是 ${type}',
    array: '字段 ${name} 的类型必须是 ${type}',
    object: '字段 ${name} 的类型必须是 ${type}',
    number: '字段 ${name} 的类型必须是 ${type}',
    date: '字段 ${name} 的类型必须是 ${type}',
    boolean: '字段 ${name} 的类型必须是 ${type}',
    integer: '字段 ${name} 的类型必须是 ${type}',
    float: '字段 ${name} 的类型必须是 ${type}',
    regexp: '字段 ${name} 的类型必须是 ${type}',
    email: '字段 ${name} 的类型必须是 ${type}',
    url: '字段 ${name} 的类型必须是 ${type}',
    hex: '字段 ${name} 的类型必须是 ${type}',
  },
  string: {
    len: '字段 ${name} 的长度必须是 ${len}',
    min: '字段 ${name} 的长度不能少于 ${min}',
    max: '字段 ${name} 的长度不能超过 ${max}',
    range: '字段 ${name} 的长度必须在 ${min} 到 ${max} 之间',
  },
  number: {
    len: '字段 ${name} 必须等于 ${len}',
    min: '字段 ${name} 不能小于 ${min}',
    max: '字段 ${name} 不能大于 ${max}',
    range: '字段 ${name} 必须在 ${min} 到 ${max} 之间',
  },
  array: {
    len: '字段 ${name} 的长度必须是 ${len}',
    min: '字段 ${name} 的长度不能少于 ${min}',
    max: '字段 ${name} 的长度不能超过 ${max}',
    range: '字段 ${name} 的长度必须在 ${min} 到 ${max} 之间',
  },
  pattern: {
    mismatch: '字段 ${name} 不匹配模式 ${pattern}',
  },
}

export type ValidateMessages = typeof defaultValidateMessages

/** Deep-merge user validateMessages over the defaults (rc-util merge). */
export function mergeMessages(base: any, override?: Record<string, any> | null): any {
  if (!override) return base
  const out: any = { ...base }
  Object.keys(override).forEach(key => {
    out[key] = typeof override[key] === 'object' && override[key] !== null && !Array.isArray(override[key])
      ? mergeMessages(base?.[key] ?? {}, override[key])
      : override[key]
  })
  return out
}

/** Fill ${var} templates: '请输入${name}' + { name: '用户名' } → '请输入用户名'. */
export function replaceMessage(template: string, kv: Record<string, any>): string {
  return template.replace(/\\\$\{\w+\}|\$\{\w+\}/g, str => {
    if (str.startsWith('\\$')) return str.slice(1)
    const key = str.slice(2, -1)
    return kv[key] ?? ''
  })
}

// ---------------------------------------------------------------- rule shape

export type RuleError = {
  errors: string[]
  rule: FormFieldRule
}

export type ValidateFieldOptions = {
  validateMessages?: Record<string, any> | null
  messageVariables?: Record<string, any> | null
  [key: string]: any
}

/**
 * Validate one rule against one value. Resolves with an array of error
 * strings (empty = pass). Never rejects.
 */
async function validateRule(
  name: string,
  value: unknown,
  rule: FormFieldRule,
  options: ValidateFieldOptions,
  messageVariables?: Record<string, any>,
): Promise<string[]> {
  const cloneRule: FormFieldRule & { ruleIndex?: number; validator?: any } = { ...rule }
  // async-validator bug workaround (rc-field-form#316/#313): ruleIndex leaks
  // into the schema and breaks internal matching.
  delete cloneRule.ruleIndex

  // Wrap user validator so a synchronous throw becomes a rejected promise
  // instead of an uncaught exception.
  if (cloneRule.validator) {
    const originValidator = cloneRule.validator
    cloneRule.validator = (...args: any[]) => {
      try {
        return (originValidator as any)(...args)
      } catch (error) {
        console.error(error)
        return Promise.reject(CODE_LOGIC_ERROR)
      }
    }
  }

  // array + defaultField → validate each item recursively.
  let subRuleField: FormFieldRule | null = null
  if (cloneRule.type === 'array' && (cloneRule as any).defaultField) {
    subRuleField = (cloneRule as any).defaultField
    delete (cloneRule as any).defaultField
  }

  const validator = new AsyncValidator({ [name]: [cloneRule] })
  const messages = mergeMessages(defaultValidateMessages, options.validateMessages)
  validator.messages(messages)

  let results: string[] = []
  try {
    // suppressWarning: 4.2.5's own switch (the @rc-component fork's static
    // patch doesn't work here because 4.2.5 rebinds the local warning fn).
    await Promise.resolve(validator.validate({ [name]: value }, { suppressWarning: true, ...options }))
  } catch (err: any) {
    if (err?.errors) {
      results = err.errors.map((e: { message: string }) => (e.message === CODE_LOGIC_ERROR ? messages.default : e.message))
    }
  }

  // Recurse into array items when the array itself passed.
  if (!results.length && subRuleField && Array.isArray(value) && value.length > 0) {
    const subResults = await Promise.all(
      value.map((_, i) => validateRule(`${name}.${i}`, value[i], subRuleField as FormFieldRule, options, messageVariables)),
    )
    return subResults.reduce((prev, errors) => [...prev, ...errors], [] as string[])
  }

  // Fill message variables.
  const kv = {
    ...rule,
    name,
    enum: (rule.enum as any[] | undefined)?.join(', '),
    ...(messageVariables ?? {}),
  }
  return results.map(message => (typeof message === 'string' ? replaceMessage(message, kv) : message))
}

/**
 * Validate a field's rules. Returns a promise that ALWAYS rejects with
 * RuleError[] (empty array when valid) — rc-field-form's convention so the
 * caller can catch and inspect per-rule failures.
 */
export function validateRules(
  namePath: InternalNamePath,
  value: unknown,
  rules: FormFieldRule[],
  options: ValidateFieldOptions,
  validateFirst?: boolean | 'parallel',
  messageVariables?: Record<string, any>,
): Promise<RuleError[]> {
  const name = namePath.join('.')

  const filledRules = rules.map((rule, ruleIndex) => {
    const cloneRule: any = { ...rule, ruleIndex }
    // Wrap validator to support the legacy callback style.
    if (rule.validator) {
      const originValidator = rule.validator
      cloneRule.validator = (r: any, val: any, callback: (err?: any) => void) => {
        let hasPromise = false
        const wrappedCallback = (...args: any[]) => {
          Promise.resolve().then(() => {
            if (!hasPromise) callback(...args)
          })
        }
        const promise = (originValidator as any)(r, val, wrappedCallback)
        hasPromise = !!promise && typeof promise.then === 'function' && typeof promise.catch === 'function'
        if (hasPromise) {
          promise.then(() => callback()).catch((err: any) => callback(err || ' '))
        }
      }
    }
    return cloneRule as FormFieldRule & { ruleIndex: number }
  })
    // warningOnly rules run last — an error should surface before a warning.
    .sort((w1, w2) => {
      if (!!w1.warningOnly === !!w2.warningOnly) return (w1 as any).ruleIndex - (w2 as any).ruleIndex
      return w1.warningOnly ? 1 : -1
    })

  let summaryPromise: Promise<RuleError[]>

  if (validateFirst === true) {
    // Serial: stop at the first failing rule. Like the parallel branch, the
    // summary ALWAYS rejects (with [] when valid) — rc-field-form's contract:
    // the caller inspects failures in .catch.
    summaryPromise = (async () => {
      for (const rule of filledRules) {
        const errors = await validateRule(name, value, rule, options, messageVariables)
        if (errors.length) return Promise.reject([{ errors, rule }]) as any
      }
      return Promise.reject([]) as any
    })()
  } else {
    const rulePromises = filledRules.map(rule =>
      validateRule(name, value, rule, options, messageVariables).then(errors => ({ errors, rule })),
    )
    const collected = validateFirst === 'parallel'
      ? finishOnFirstFailed(rulePromises)
      : finishOnAllFailed(rulePromises)
    summaryPromise = collected.then((ruleErrors): RuleError[] | Promise<RuleError[]> => {
      // Always reject so the caller's catch inspects failures (rc convention).
      return Promise.reject(ruleErrors) as any
    }) as any
  }

  // Swallow unhandled-rejection noise; the caller still gets the rejection.
  summaryPromise.catch(() => undefined)
  return summaryPromise
}

async function finishOnAllFailed(rulePromises: Promise<RuleError>[]): Promise<RuleError[]> {
  const errorsList = await Promise.all(rulePromises)
  return errorsList.reduce((prev, { errors, rule }) => (errors.length ? [...prev, { errors, rule }] : prev), [] as RuleError[])
}

async function finishOnFirstFailed(rulePromises: Promise<RuleError>[]): Promise<RuleError[]> {
  return new Promise(resolve => {
    let count = 0
    rulePromises.forEach(promise => {
      promise.then(ruleError => {
        if (ruleError.errors.length) resolve([ruleError])
        count += 1
        if (count === rulePromises.length) resolve([])
      })
    })
  })
}

// ---------------------------------------------------------------- promise utils

/**
 * Run every promise and settle with their REJECTION payloads (rc
 * allPromiseFinish). Rejections carry the per-field results; the aggregate
 * resolves with an array of those payloads (empty for all-success runs).
 */
export function allPromiseFinish<T>(promiseList: Promise<T>[]): Promise<T[]> {
  let hasError = false
  let count = 0
  return new Promise(resolve => {
    const results: T[] = []
    promiseList.forEach(promise => {
      promise.catch(e => {
        hasError = true
        return e
      }).then(result => {
        count += 1
        results.push(result as T)
        if (count === promiseList.length) resolve(hasError ? Promise.reject(results) as any : results)
      })
    })
  })
}

// ---------------------------------------------------------------- misc

/** Does this rule set mark the field required (drives the asterisk UI)? */
export function isRequiredRule(rules?: FormFieldRule[] | null, name?: NamePath): boolean {
  if (!rules?.length) return false
  return rules.some(rule => typeof rule === 'function' ? false : rule && (rule as any).required)
}
