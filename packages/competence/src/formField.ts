import { createEffect, createMemo, createSignal, onCleanup, untrack } from 'solid-js'
import { type FormFieldEntity, type FormInstance, type StoreValue } from './form'
import { type InternalNamePath, type NamePath, containsNamePath, defaultGetValueFromEvent, getNamePath as toNamePath, getValue } from './formUtils'
import { validateRules as runValidateRules } from './formValidate'

/**
 * Headless field entity — the signal-based port of rc-field-form's Field.
 *
 * Lifecycle: call inside a Solid component body (or createRoot in tests).
 * Registration happens immediately; onCleanup unregisters with the store's
 * preserve semantics. A `name` change re-registers and resets the field
 * (antd achieves this with a React key remount).
 */

export type FieldValidateTrigger = string | string[] | false

export type FormFieldConfig = {
  /** Field name path. undefined → pure render-region field (no value bound). */
  readonly name?: NamePath | undefined
  readonly rules?: FormFieldRule[] | undefined
  readonly initialValue?: StoreValue | undefined
  readonly dependencies?: NamePath[] | undefined
  /** Default 'onChange'. false disables trigger validation. */
  readonly validateTrigger?: FieldValidateTrigger | undefined
  readonly validateFirst?: boolean | 'parallel' | undefined
  readonly messageVariables?: Record<string, any> | undefined
  readonly validateDebounce?: number | undefined
  /** Escape hatch for components that emit events instead of values. */
  readonly getValueFromEvent?: ((...args: any[]) => StoreValue) | undefined
  readonly normalize?: ((value: StoreValue, prevValue: StoreValue, allValues: any) => StoreValue) | undefined
  readonly preserve?: boolean | undefined
  readonly disabled?: boolean | undefined
  onReset?: () => void
}

/** Rule shape (subset used before the validation engine lands in P1). */
export type FormFieldRule = {
  required?: boolean
  message?: string
  warningOnly?: boolean
  validator?: (rule: FormFieldRule, value: StoreValue, callback: (error?: string | Error) => void) => Promise<void | any> | void
  [key: string]: any
}

export type FormFieldMeta = {
  touched: boolean
  validating: boolean
  errors: string[]
  warnings: string[]
  name: InternalNamePath
  validated: boolean
}

const EMPTY_ERRORS: string[] = []

const toArray = (val?: string | string[] | false): string[] => {
  if (val === false) return []
  if (val === undefined || val === null) return []
  return Array.isArray(val) ? val : [val]
}

export function createFormField(form: FormInstance, config: FormFieldConfig) {
  // ---------------------------------------------------------------- signals
  // ownedWrite: async validation callbacks and event handlers write these
  // from outside the reactive owner (popconfirm precedent).
  const [touched, setTouched] = createSignal(false, { name: 'field:touched' })
  const [dirty, setDirty] = createSignal(false, { name: 'field:dirty' })
  const [errors, setErrors] = createSignal<string[]>(EMPTY_ERRORS, { name: 'field:errors' })
  const [warnings, setWarnings] = createSignal<string[]>(EMPTY_ERRORS, { name: 'field:warnings' })
  // validatePromise is plain state (not a signal) — validity checks are
  // imperative reference comparisons, not reactive reads.
  let validatePromise: Promise<any> | null | undefined

  const getNamePath = (): InternalNamePath => {
    const prefix = fieldPrefixName ?? []
    // untrack: `config.name` is a Solid props getter — this helper is called
    // from imperative store paths (registerField/notifyWatch) that run inside
    // untracked component bodies, and a bare getter read there trips
    // STRICT_READ_UNTRACKED in dev. The name is stable per read anyway.
    const name = untrack(() => config.name)
    // formUtils.getNamePath normalizes the user-facing name; the recursion
    // here is only over prefix + normalized segments (no self-call).
    return name !== undefined ? [...prefix, ...toNamePath(name)] : []
  }

  // List nesting support (createFormList injects a prefix + key manager).
  let fieldPrefixName: InternalNamePath | null = null
  const setPrefixName = (prefix: InternalNamePath) => { fieldPrefixName = prefix }

  const value = createMemo(() => {
    if (config.name === undefined) return undefined
    // valuesTracked: this memo must re-run on store commits, so it needs the
    // raw signal read (tracked inside a compute). values() stays untracked
    // for imperative/event-handler sampling (STRICT_READ_UNTRACKED).
    return getValue(form.valuesTracked(), getNamePath())
  })

  const namePathKey = createMemo(() => getNamePath().join(' '))
  // Reset broadcast from the store: dual-function effect (eager + owned;
  // Solid 2 rc has no `on` helper and unread memos never run).
  createEffect(
    () => form.resetCountSignal(),
    (count, prevCount) => {
      if (!count || prevCount === undefined) return
      // Scoped reset: only fields under the reset namePathList participate.
      const scope = form.getResetScope()
      if (scope && !containsNamePath(scope, getNamePath())) return
      setTouched(false)
      setDirty(false)
      validatePromise = undefined
      setErrors(EMPTY_ERRORS)
      setWarnings(EMPTY_ERRORS)
      config.onReset?.()
    },
  )

  // ---------------------------------------------------------------- entity
  // config getters are Solid props getters — the store calls these entity
  // methods from imperative paths (registration/reset/validation) that may run
  // inside untracked scopes. untrack keeps each read from tripping dev's
  // STRICT_READ_UNTRACKED; reactivity is preserved where it matters (value,
  // errors, warnings stay signals).
  const entity: FormFieldEntity = {
    getNamePath,
    getInitialValue: () => untrack(() => config.initialValue),
    getRules: () => untrack(() => config.rules),
    isListField: () => false,
    isList: () => false,
    isPreserve: () => untrack(() => config.preserve),
    isFieldTouched: () => untrack(() => touched()),
    isFieldDirty: () => untrack(() => dirty()) || untrack(() => config.initialValue) !== undefined || form.getInitialValue(getNamePath()) !== undefined,
    isFieldValidating: () => !!validatePromise,
    getErrors: () => errors(),
    getWarnings: () => warnings(),
    validateRules: (options: Record<string, any> = {}) => {
      const namePath = getNamePath()

      const { triggerName, validateOnly = false } = options as { triggerName?: string; validateOnly?: boolean }
      const validateFirst = config.validateFirst
      const debounce = config.validateDebounce

      let filteredRules = getRules()
      if (triggerName) {
        filteredRules = filteredRules.filter(rule => {
          const ruleTrigger = (rule as any).validateTrigger
          if (!ruleTrigger) return true
          return toArray(ruleTrigger).includes(triggerName)
        })
      }

      // Force async so rules OOD (out-of-date) under render-props fields
      // behave the same as event-triggered runs (rc parity).
      const rootPromise = Promise.resolve().then(async () => {
        if (!filteredRules.length) return []
        // Read the value INSIDE the async body: the value memo lags the
        // store write when validate is dispatched from the same onChange
        // that wrote it (rc reads the live store at validator start).
        const currentValue = value()

        // Debounce: wait, then bail if a newer run superseded us.
        if (debounce && triggerName) {
          await new Promise(resolve => setTimeout(resolve, debounce))
          if (validatePromise !== rootPromise) return []
        }

        return runValidateRules(
          namePath,
          currentValue,
          filteredRules,
          options,
          validateFirst,
          config.messageVariables,
        )
      })

      if (validateOnly) return rootPromise

      validatePromise = rootPromise
      setDirty(true)
      setErrors(EMPTY_ERRORS)
      setWarnings(EMPTY_ERRORS)

      // validateRules ALWAYS rejects (rc contract) — the rejection payload IS
      // the RuleError[] list; recover it in catch and settle in then.
      rootPromise
        .catch((ruleErrors: any[] = []) => ruleErrors)
        .then(ruleErrors => {
          // Race check: a newer validation superseded this one — discard.
          if (validatePromise !== rootPromise) return
          validatePromise = null

          const nextErrors: string[] = []
          const nextWarnings: string[] = []
          ruleErrors.forEach(({ rule, errors: ruleErrorList }: any) => {
            if (rule?.warningOnly) nextWarnings.push(...(ruleErrorList ?? []))
            else nextErrors.push(...(ruleErrorList ?? []))
          })
          setErrors(nextErrors)
          setWarnings(nextWarnings)
        })

      return rootPromise
    },
    onSetField: data => {
      if ('touched' in data) setTouched(!!data.touched)
      if ('validating' in data) validatePromise = data.validating ? Promise.resolve([]) : null
      if ('errors' in data) setErrors(data.errors || EMPTY_ERRORS)
      if ('warnings' in data) setWarnings(data.warnings || EMPTY_ERRORS)
      setDirty(true)
    },
    onReset: () => {
      setTouched(false)
      setDirty(false)
      validatePromise = undefined
      setErrors(EMPTY_ERRORS)
      setWarnings(EMPTY_ERRORS)
      config.onReset?.()
    },
  }

  // ---------------------------------------------------------------- register
  let cancelRegister: ((isListField: boolean, preserve?: boolean | null, subNamePath?: InternalNamePath) => void) | null = null

  const register = () => {
    form.initEntityValue(entity)
    cancelRegister = form.registerField(entity)
  }

  // Register eagerly — createFormField runs inside a component body (an
  // owner), which is the mount moment. Solid memos are lazy, so lifecycle
  // cannot live in an unread memo.
  register()

  // name change → re-register with a clean slate (React key remount parity).
  // createEffect is eager + owned; the reset-watcher memo above stays a memo
  // only because form.resetCountSignal() is read reactively elsewhere too.
  // Solid 2 dual-function effect: compute returns the tracked key, effect
  // body runs on changes (first run included — guarded by undefined prev).
  createEffect(
    () => namePathKey(),
    (key, prevKey) => {
      if (prevKey === undefined) return
      cancelRegister?.(entity.isListField(), config.preserve)
      setTouched(false)
      setDirty(false)
      validatePromise = undefined
      setErrors(EMPTY_ERRORS)
      setWarnings(EMPTY_ERRORS)
      register()
    },
  )

  onCleanup(() => {
    cancelRegister?.(entity.isListField(), config.preserve)
  })

  // ---------------------------------------------------------------- control
  const getRules = (): FormFieldRule[] => (config.rules ?? []).map(rule => (typeof rule === 'function' ? (rule as any)(form) : rule))

  const onChange = (...args: any[]) => {
    setTouched(true)
    setDirty(true)

    const prevValue = value()
    let newValue: StoreValue
    if (config.getValueFromEvent) {
      newValue = config.getValueFromEvent(...args)
    } else {
      newValue = defaultGetValueFromEvent('value', ...args)
    }
    if (config.normalize) {
      newValue = config.normalize(newValue, prevValue, form.getFieldsValue(true))
    }
    if (newValue !== prevValue) {
      form.updateValue(getNamePath(), newValue)
    }

    // validateTrigger (default 'onChange') — dispatch through the store so
    // same-name fields stay in sync (rc dispatch parity).
    const triggers = toArray(config.validateTrigger ?? 'onChange')
    if (triggers.includes('onChange') && getRules().length) {
      form.validateField(getNamePath(), 'onChange')
    }
  }

  const meta = (): FormFieldMeta => ({
    touched: touched(),
    validating: !!validatePromise,
    errors: errors(),
    warnings: warnings(),
    name: getNamePath(),
    validated: validatePromise === null,
  })

  const field = {
    // reactive state
    value,
    touched,
    errors,
    warnings,
    meta,
    // control
    onChange,
    setPrefixName,
    // internal (store contract)
    entity,
    getRules,
  }

  return field
}

export type FormField = ReturnType<typeof createFormField>
