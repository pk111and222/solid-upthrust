import { createSignal, untrack } from 'solid-js'
import { allPromiseFinish } from './formValidate'
import {
  type InternalNamePath,
  type NamePath,
  NameMap,
  cloneByNamePathList,
  containsNamePath,
  getNamePath,
  getValue,
  matchNamePath,
  setValue,
} from './formUtils'

/**
 * Headless form engine — the signal-based port of rc-field-form's FormStore.
 *
 * Key Solid adaptation: instead of React's notifyObservers + forceUpdate
 * broadcast, the store is a single signal and each Field derives its value
 * through a memo. Reference-stable reads keep unrelated fields from
 * re-rendering (the equivalent of antd's `prevValue !== nextValue` check).
 *
 * Form-level broadcasts that memo graph can't express (reset / remove) ride
 * dedicated signals: `resetCount` and `removeEvent`.
 */

export type StoreValue = any
export type Store = Record<string, StoreValue>

/** Entity contract every registered field must satisfy (createFormField). */
export type FormFieldEntity = {
  getNamePath: () => InternalNamePath
  /** Field prop getters — the store reads them lazily on demand. */
  getInitialValue: () => StoreValue | undefined
  getRules: () => unknown[] | undefined
  isListField: () => boolean
  isList: () => boolean
  isPreserve: () => boolean | undefined
  isFieldTouched: () => boolean
  isFieldDirty: () => boolean
  isFieldValidating: () => boolean
  getErrors: () => string[]
  getWarnings: () => string[]
  /** Kick off validation for this field (formValidate-backed). */
  validateRules: (options?: Record<string, any>) => Promise<any>
  /** Sync props from a `setFields` call (errors/touched/validating). */
  onSetField: (data: Record<string, any>) => void
  /** Reset touched/dirty/errors/warnings state. */
  onReset: () => void
}

export type FormCallbacks = {
  onValuesChange?: (changedValues: AnyStore, allValues: AnyStore) => void
  onFieldsChange?: (changedFields: FormFieldChangeData[], allFields: FormFieldChangeData[]) => void
  onFinish?: (values: AnyStore) => void
  onFinishFailed?: (errorInfo: FormValidateErrorEntity) => void
}

export type FormFieldChangeData = {
  name: InternalNamePath
  value?: StoreValue
  touched?: boolean
  validating?: boolean
  errors?: string[]
  warnings?: string[]
}

export type FormValidateErrorEntity = {
  values: AnyStore
  errorFields: { name: InternalNamePath; errors: string[]; warnings: string[] }[]
  outOfDate: boolean
}

export type FormWatchCallback = (values: AnyStore, allValues: AnyStore, namePathList: InternalNamePath[]) => void

export type FormValidateOptions = {
  /** Only run the validation, do not touch field errors state. */
  validateOnly?: boolean
  /** Validate nested children of the given nameList paths. */
  recursive?: boolean
  /** Only validate dirty fields (used by dependency cascade). */
  dirty?: boolean
}

type AnyStore = Store

export type FormConfig = {
  readonly initialValues?: Store | undefined
  readonly preserve?: boolean | undefined
  readonly validateMessages?: Record<string, any> | undefined
  readonly callbacks?: FormCallbacks | undefined
}


export type FormInstance = ReturnType<typeof createForm>

/**
 * Create a headless form instance. Can be used standalone (TanStack-Form
 * style) or wired into the `<Form>` UI layer via the `form` prop.
 */
export function createForm(config: FormConfig = {}) {
  // ---------------------------------------------------------------- state
  // The single source of truth. Immutable updates via setValue() — memos
  // downstream de-duplicate by reference equality.
  // ownedWrite: mutated from imperative entry points (updateValue/setFields/
  // resetFields fire from event handlers and tests inside createRoot).
  const [store, setStore] = createSignal<AnyStore>({}, { name: 'form:store', ownedWrite: true })

  // Synchronous mirror of the store's pending value. Solid 2 commits signal
  // writes in batches — an imperative `getFieldValue` right after a mutation
  // must see the value the mutation just wrote, not the last committed one.
  // All writes go through commitStore(); all imperative reads read this.
  let storeRef: AnyStore = {}
  const commitStore = (next: AnyStore) => {
    storeRef = next
    setStore(() => next)
    return next
  }
  const readStore = () => storeRef

  // Field registry — insertion-ordered, entity objects (not signals; the
  // entities own their own signals).
  let fieldEntities: FormFieldEntity[] = []

  // Scope of the most recent resetFields call (null = whole form). Fields
  // read this when handling the reset broadcast to decide whether they are
  // targeted.
  let resetScope: InternalNamePath[] | null = null

  // Form-level broadcast signals (see file comment).
  const [resetCount, setResetCount] = createSignal(0, { name: 'form:resetCount', ownedWrite: true })
  const [removeEvent, setRemoveEvent] = createSignal<{ namePath: InternalNamePath; ts: number } | null>(null, { name: 'form:removeEvent', ownedWrite: true })

  let initialValues: AnyStore = {}
  let lastInitialValuesApplied = false
  let preserve: boolean | undefined
  let validateMessages: Record<string, any> | null = null
  let callbacks: FormCallbacks = {}
  /** Remembers non-preserved fields at destroy, to re-fill from initialValues. */
  let prevWithoutPreserves: NameMap<boolean> | null = null

  const watchList: FormWatchCallback[] = []

  // ---------------------------------------------------------------- helpers
  const readConfig = () => {
    if (config.initialValues && !lastInitialValuesApplied) {
      setInitialValues(config.initialValues, true)
      lastInitialValuesApplied = true
    }
    if (config.preserve !== undefined) preserve = config.preserve
    if (config.validateMessages) validateMessages = config.validateMessages
    if (config.callbacks) callbacks = config.callbacks
  }

  const isMergedPreserve = (fieldPreserve?: boolean | null) => {
    const merged = fieldPreserve !== undefined ? fieldPreserve : preserve
    return merged ?? true
  }

  const getFieldEntities = (pure = false): FormFieldEntity[] =>
    pure ? fieldEntities.filter(field => field.getNamePath().length) : fieldEntities

  const getFieldsMap = (pure = false): NameMap<FormFieldEntity> => {
    const cache = new NameMap<FormFieldEntity>()
    getFieldEntities(pure).forEach(field => cache.set(field.getNamePath(), field))
    return cache
  }

  /** Resolve entities for a nameList; missing paths become INVALIDATE markers. */
  const getFieldEntitiesForNamePathList = (nameList?: NamePath[]): (FormFieldEntity | { INVALIDATE_NAME_PATH: InternalNamePath })[] => {
    if (!nameList) return getFieldEntities(true)
    const cache = getFieldsMap(true)
    return nameList.map(name => cache.get(getNamePath(name)) ?? { INVALIDATE_NAME_PATH: getNamePath(name) })
  }

  // ---------------------------------------------------------------- watch
  const registerWatch = (callback: FormWatchCallback) => {
    watchList.push(callback)
    return () => {
      const idx = watchList.indexOf(callback)
      if (idx >= 0) watchList.splice(idx, 1)
    }
  }

  const notifyWatch = (namePathList: InternalNamePath[] = []) => {
    if (!watchList.length) return
    const values = getFieldsValue()
    const allValues = getFieldsValue(true)
    watchList.forEach(cb => cb(values, allValues, namePathList))
  }

  // ---------------------------------------------------------------- register
  /**
   * Apply a field's `initialValue` prop when the store has no value yet.
   * Called at registration time (mirrors initEntityValue).
   */
  const initEntityValue = (entity: FormFieldEntity) => {
    const initialValue = entity.getInitialValue()
    if (initialValue !== undefined) {
      const namePath = entity.getNamePath()
      if (getValue(storeRef, namePath) === undefined) {
        commitStore(setValue(storeRef, namePath, initialValue))
      }
    }
  }

  /**
   * Reset fields to their `initialValue` props (form initialValues win —
   * conflicts keep the form value, matching rc semantics of warning+skip).
   */
  const resetWithFieldInitialValue = (info: { entities?: FormFieldEntity[]; namePathList?: InternalNamePath[] } = {}) => {
    const cache = new NameMap<Set<{ entity: FormFieldEntity; value: StoreValue }>>()
    const entities = getFieldEntities(true)
    entities.forEach(field => {
      const initialValue = field.getInitialValue()
      if (initialValue !== undefined) {
        const namePath = field.getNamePath()
        const records = cache.get(namePath) ?? new Set()
        records.add({ entity: field, value: initialValue })
        cache.set(namePath, records)
      }
    })

    let targets: FormFieldEntity[]
    if (info.entities) targets = info.entities
    else if (info.namePathList) {
      targets = []
      info.namePathList.forEach(namePath => {
        cache.get(namePath)?.forEach(r => targets.push(r.entity))
      })
    } else targets = entities

    targets.forEach(field => {
      const initialValue = field.getInitialValue()
      if (initialValue === undefined) return
      const namePath = field.getNamePath()
      const formInitialValue = getValue(initialValues, namePath)
      if (formInitialValue !== undefined) return // form initialValues win
      const records = cache.get(namePath)
      if (!records || records.size > 1) return // ambiguous — skip
      if (field.isListField()) return
      if (info.namePathList && getValue(storeRef, namePath) !== undefined && !info.entities) {
        // namePathList-targeted resets only fill missing values
        // (fall through: resetFields already set the initial value)
      }
      if (!info.namePathList && getValue(storeRef, namePath) !== undefined && info.entities) {
        // skipExist semantics for registration-time calls
        return
      }
      commitStore(setValue(storeRef, namePath, [...records][0].value))
    })
  }

  const registerField = (entity: FormFieldEntity) => {
    fieldEntities.push(entity)
    const namePath = entity.getNamePath()
    notifyWatch([namePath])

    if (entity.getInitialValue() !== undefined) {
      initEntityValue(entity)
    }

    return (isListField: boolean, fieldPreserve?: boolean | null, subNamePath: InternalNamePath = []) => {
      fieldEntities = fieldEntities.filter(item => item !== entity)

      // Clean up store value when not preserved
      if (!isMergedPreserve(fieldPreserve) && (!isListField || subNamePath.length > 1)) {
        const defaultValue = isListField ? undefined : getValue(initialValues, namePath)
        const noOtherFieldClaims = fieldEntities.every(field => !matchNamePath(field.getNamePath(), namePath))
        if (namePath.length && getValue(storeRef, namePath) !== defaultValue && noOtherFieldClaims) {
          commitStore(setValue(storeRef, namePath, defaultValue, true))
          setRemoveEvent({ namePath, ts: Date.now() })
          notifyWatch([namePath])
        }
      }
      notifyWatch([namePath])
    }
  }

  // ---------------------------------------------------------------- getters
  const getFieldValue = (name?: NamePath) => {
    readConfig()
    return getValue(readStore(), getNamePath(name))
  }

  const getFieldsValue = (nameList?: NamePath[] | true, filterFunc?: ((meta: { name: InternalNamePath; touched: boolean; validating: boolean; errors: string[]; warnings: string[] }) => boolean)) => {
    readConfig()
    const mergedNameList = Array.isArray(nameList) || nameList === true ? nameList : undefined
    if (mergedNameList === true && !filterFunc) return readStore()

    const entities = getFieldEntitiesForNamePathList(Array.isArray(mergedNameList) ? mergedNameList : undefined)
    const filteredNameList: InternalNamePath[] = []
    entities.forEach(entity => {
      if ('INVALIDATE_NAME_PATH' in entity) {
        filteredNameList.push(entity.INVALIDATE_NAME_PATH)
        return
      }
      // Without an explicit nameList, list fields are represented by their
      // children — the list path itself yields [] and would shadow nothing.
      if (!mergedNameList && entity.isListField()) return
      if (!filterFunc) {
        filteredNameList.push(entity.getNamePath())
      } else {
        const meta = getMetaOf(entity)
        if (filterFunc(meta)) filteredNameList.push(entity.getNamePath())
      }
    })
    return cloneByNamePathList(readStore(), filteredNameList)
  }

  const getMetaOf = (entity: FormFieldEntity) => ({
    name: entity.getNamePath(),
    touched: entity.isFieldTouched(),
    validating: entity.isFieldValidating(),
    errors: entity.getErrors(),
    warnings: entity.getWarnings(),
  })

  const getFieldsError = (nameList?: NamePath[]) => {
    readConfig()
    const entities = getFieldEntitiesForNamePathList(nameList)
    return entities.map((entity, index) => {
      if (entity && !('INVALIDATE_NAME_PATH' in entity)) {
        return {
          name: entity.getNamePath(),
          errors: entity.getErrors(),
          warnings: entity.getWarnings(),
        }
      }
      return {
        name: getNamePath(nameList?.[index]),
        errors: [],
        warnings: [],
      }
    })
  }

  const getFieldError = (name?: NamePath): string[] => {
    readConfig()
    return getFieldsError([name as NamePath])[0]?.errors ?? []
  }

  const getFieldWarning = (name?: NamePath): string[] => {
    readConfig()
    return getFieldsError([name as NamePath])[0]?.warnings ?? []
  }

  const getFields = (): FormFieldChangeData[] =>
    getFieldEntities(true).map(field => ({
      ...getMetaOf(field),
      name: field.getNamePath(),
      value: getValue(readStore(), field.getNamePath()),
    }))

  const isFieldTouched = (name?: NamePath) => isFieldsTouched([name as NamePath])
  const isFieldValidating = (name?: NamePath) => isFieldsValidating([name as NamePath])

  const isFieldsTouched = (nameList?: NamePath[] | boolean, allFieldsTouched?: boolean) => {
    readConfig()
    let pathList: InternalNamePath[] | null = null
    let isAll = false
    if (nameList === undefined) {
      pathList = null
    } else if (Array.isArray(nameList)) {
      pathList = nameList.map(getNamePath)
      isAll = !!allFieldsTouched
    } else {
      pathList = null
      isAll = !!nameList
    }

    const entities = getFieldEntities(true)
    if (!pathList) {
      return isAll ? entities.every(e => e.isFieldTouched() || e.isList()) : entities.some(e => e.isFieldTouched())
    }

    // Group entities under each queried path, then apply some/every.
    const map = new NameMap<FormFieldEntity[]>()
    pathList.forEach(short => map.set(short, []))
    entities.forEach(field => {
      const fieldNamePath = field.getNamePath()
      pathList.forEach(short => {
        if (short.every((unit, i) => fieldNamePath[i] === unit)) {
          map.update(short, list => [...(list ?? []), field])
        }
      })
    })
    const groups = map.map(({ value }) => value)
    return isAll ? groups.every(list => list.some(f => f.isFieldTouched())) : groups.some(list => list.some(f => f.isFieldTouched()))
  }

  const isFieldsValidating = (nameList?: NamePath[]) => {
    readConfig()
    const entities = getFieldEntities()
    if (!nameList) return entities.some(f => f.isFieldValidating())
    const pathList = nameList.map(getNamePath)
    return entities.some(f => containsNamePath(pathList, f.getNamePath()) && f.isFieldValidating())
  }

  // ---------------------------------------------------------------- mutations
  const updateValue = (name: NamePath, value: StoreValue) => {
    const namePath = getNamePath(name)
    commitStore(setValue(storeRef, namePath, value))
    notifyWatch([namePath])
    // dependency cascade + callbacks (validation itself lands in P1)
    const childrenFields = triggerDependenciesUpdate(namePath)
    const { onValuesChange } = callbacks
    if (onValuesChange) {
      onValuesChange(cloneByNamePathList(readStore(), [namePath]), getFieldsValue())
    }
    triggerOnFieldsChange([namePath, ...childrenFields])
  }

  /** Validate dependency children of a changed path (P2 wires validation in). */
  const triggerDependenciesUpdate = (namePath: InternalNamePath): InternalNamePath[] => {
    const childrenFields = getDependencyChildrenFields(namePath)
    if (childrenFields.length && instance.validateFields) {
      instance.validateFields(childrenFields, { dirty: true })
    }
    notifyWatch([namePath])
    return childrenFields
  }

  const getDependencyChildrenFields = (rootNamePath: InternalNamePath): InternalNamePath[] => {
    const children = new Set<FormFieldEntity>()
    const childrenFields: InternalNamePath[] = []
    const dependencies2fields = new NameMap<Set<FormFieldEntity>>()

    fieldEntities.forEach(field => {
      const deps = (field as any).getDependencies?.() ?? []
      deps.forEach((dependency: NamePath) => {
        const dependencyNamePath = getNamePath(dependency)
        dependencies2fields.update(dependencyNamePath, fields => {
          const set = fields ?? new Set<FormFieldEntity>()
          set.add(field)
          return set
        })
      })
    })

    const fillChildren = (namePath: InternalNamePath) => {
      const fields = dependencies2fields.get(namePath) ?? new Set<FormFieldEntity>()
      fields.forEach(field => {
        if (!children.has(field)) {
          children.add(field)
          const fieldNamePath = field.getNamePath()
          if (field.isFieldDirty() && fieldNamePath.length) {
            childrenFields.push(fieldNamePath)
            fillChildren(fieldNamePath)
          }
        }
      })
    }
    fillChildren(rootNamePath)
    return childrenFields
  }

  const triggerOnFieldsChange = (namePathList: InternalNamePath[], filedErrors?: { name: InternalNamePath; errors: string[]; warnings: string[] }[]) => {
    const { onFieldsChange } = callbacks
    if (!onFieldsChange) return
    const fields = getFields()
    if (filedErrors) {
      const cache = new NameMap<string[]>()
      filedErrors.forEach(({ name, errors }) => cache.set(name, errors))
      fields.forEach(field => {
        const cached = cache.get(field.name)
        if (cached) field.errors = cached
      })
    }
    const changedFields = fields.filter(field => containsNamePath(namePathList, field.name))
    if (changedFields.length) onFieldsChange(changedFields, fields)
  }

  const setFieldsValue = (values?: AnyStore) => {
    readConfig()
    if (!values) return
    commitStore(deepMergeStore(storeRef, values))
    notifyWatch()
  }

  const setFieldValue = (name: NamePath, value: StoreValue) => {
    readConfig()
    setFields([{ name: getNamePath(name), value, errors: [], warnings: [] }])
  }

  const setFields = (fields: (Omit<FormFieldChangeData, 'name'> & { name: NamePath })[]) => {
    readConfig()
    fields.forEach(fieldData => {
      const namePath = getNamePath(fieldData.name as NamePath)
      if ('value' in fieldData) {
        commitStore(setValue(storeRef, namePath, fieldData.value))
      }
      const entity = getFieldsMap(true).get(namePath)
      entity?.onSetField(fieldData as Record<string, any>)
      notifyWatch([namePath])
    })
  }

  const resetFields = (nameList?: NamePath[]) => {
    readConfig()
    if (!nameList) {
      commitStore(cloneDeep(initialValues))
      resetWithFieldInitialValue()
      resetScope = null
      setResetCount(c => c + 1)
      notifyWatch()
      return
    }
    const namePathList = nameList.map(getNamePath)
    namePathList.forEach(namePath => {
      const initialValue = getValue(initialValues, namePath)
      commitStore(setValue(storeRef, namePath, initialValue))
    })
    resetWithFieldInitialValue({ namePathList })
    resetScope = namePathList
    setResetCount(c => c + 1)
    notifyWatch(namePathList)
  }

  const setInitialValues = (nextInitialValues?: AnyStore, init = false) => {
    initialValues = nextInitialValues ?? {}
    if (init) {
      let nextStore = deepMergeStore(cloneDeep(initialValues), storeRef)
      prevWithoutPreserves?.map(({ key }) => {
        nextStore = setValue(nextStore, key, getValue(initialValues, key))
      })
      prevWithoutPreserves = null
      commitStore(nextStore)
    }
  }

  const getInitialValue = (namePath: InternalNamePath): StoreValue => {
    const initValue = getValue(initialValues, namePath)
    return namePath.length ? cloneDeep(initValue) : initValue
  }

  const destroyForm = (clearOnDestroy?: boolean) => {
    if (clearOnDestroy) {
      commitStore({})
    } else {
      const without = new NameMap<boolean>()
      getFieldEntities(true).forEach(entity => {
        if (!isMergedPreserve(entity.isPreserve())) without.set(entity.getNamePath(), true)
      })
      prevWithoutPreserves = without
    }
  }

  // ---------------------------------------------------------------- validate / submit
  let lastValidatePromise: Promise<any> | null = null

  const validateFields = (_nameList?: NamePath[] | FormValidateOptions, _options?: FormValidateOptions): Promise<AnyStore> => {
    readConfig()
    let nameList: NamePath[] | undefined
    let options: FormValidateOptions = {}
    if (Array.isArray(_nameList) || typeof _nameList === 'string') {
      nameList = Array.isArray(_nameList) ? _nameList : [_nameList]
      options = _options ?? {}
    } else if (_nameList) {
      options = _nameList
    }

    const provideNameList = !!nameList
    const namePathList: InternalNamePath[] = provideNameList ? (nameList as NamePath[]).map(getNamePath) : []
    const promiseList: Promise<any>[] = []
    const TMP_SPLIT = String(Date.now())
    const validateNamePathList = new Set<string>()
    const { recursive, dirty, validateOnly } = options

    getFieldEntities(true).forEach(field => {
      if (!provideNameList) namePathList.push(field.getNamePath())

      const rules = field.getRules()
      if (!rules || !(rules as any[]).length) return
      if (dirty && !field.isFieldDirty()) return

      const fieldNamePath = field.getNamePath()
      validateNamePathList.add(fieldNamePath.join(TMP_SPLIT))

      if (!provideNameList || containsNamePath(namePathList, fieldNamePath, recursive)) {
        const promise = field.validateRules({
          validateMessages: validateMessages ?? undefined,
          ...options,
        })
        promiseList.push(
          promise.then(() => ({ name: fieldNamePath, errors: [], warnings: [] })).catch((ruleErrors: any[] = []) => {
            const mergedErrors: string[] = []
            const mergedWarnings: string[] = []
            ruleErrors.forEach(({ rule, errors }: any) => {
              if (rule?.warningOnly) mergedWarnings.push(...(errors ?? []))
              else mergedErrors.push(...(errors ?? []))
            })
            if (mergedErrors.length) {
              return Promise.reject({ name: fieldNamePath, errors: mergedErrors, warnings: mergedWarnings })
            }
            return { name: fieldNamePath, errors: mergedErrors, warnings: mergedWarnings }
          }),
        )
      }
    })

    // allPromiseFinish never settles on an empty list (no .then callbacks to
    // count) — a rules-free form resolves immediately instead.
    const summaryPromise = promiseList.length
      ? allPromiseFinish(promiseList)
      : Promise.resolve([])
    lastValidatePromise = summaryPromise

    // Validate finished → notify fields to refresh meta + onFieldsChange.
    summaryPromise
      .catch((results: any) => results)
      .then((results: any[] = []) => {
        const resultNamePathList = results.map(({ name }: any) => name)
        triggerOnFieldsChange(
          resultNamePathList,
          results.map(({ name, errors, warnings }: any) => ({ name, errors, warnings })),
        )
      })

    const returnPromise = summaryPromise
      .then(() => {
        if (lastValidatePromise === summaryPromise) {
          return Promise.resolve(getFieldsValue(provideNameList ? (nameList as NamePath[]) : true))
        }
        return Promise.reject([])
      })
      .catch((results: any) => {
        const errorList = (results ?? []).filter((result: any) => result && result.errors?.length)
        return Promise.reject({
          values: getFieldsValue(provideNameList ? (nameList as NamePath[]) : true),
          errorFields: errorList,
          outOfDate: lastValidatePromise !== summaryPromise,
        })
      })

    // Swallow unhandled-rejection noise for the internal chain.
    returnPromise.catch(() => undefined)
    return returnPromise
  }

  const submit = () => {
    readConfig()
    return validateFields()
      .then(values => {
        try {
          callbacks.onFinish?.(values)
        } catch (err) {
          console.error(err)
        }
        return values
      })
      .catch((e: FormValidateErrorEntity) => {
        callbacks.onFinishFailed?.(e)
        return Promise.reject(e)
      })
  }

  // ---------------------------------------------------------------- instance
  const instance = {
    // reactive accessors
    // values(): untracked read for event handlers / imperative calls —
    // sampling the store signal inside a handler trips Solid 2's
    // STRICT_READ_UNTRACKED. valuesTracked(): the raw signal read for
    // reactive scopes (memos/render) that must re-run on commits.
    values: () => readStore(),
    valuesTracked: () => store(),
    resetCountSignal: resetCount,
    removeEventSignal: removeEvent,
    getResetScope: () => resetScope,
    // getters
    getFieldValue,
    getFieldsValue,
    getFieldsError,
    getFieldError,
    getFieldWarning,
    getFields,
    isFieldTouched,
    isFieldsTouched,
    isFieldValidating,
    isFieldsValidating,
    // mutations
    validateField: (namePath: InternalNamePath, triggerName: string) => {
      validateFields([namePath as NamePath], { triggerName } as any)
    },
    setFieldValue,
    setFieldsValue,
    setFields,
    resetFields,
    validateFields,
    submit,
    /**
     * Reactive watch — returns a read-only signal tracking the value at
     * `path` (or the selector's return). Solid replaces rc-field-form's
     * registerWatch + useEffect machinery: a memo over this signal stays in
     * sync automatically; stringify de-dupes object churn (nested objects
     * get new references on unrelated writes).
     */
    watch: (pathOrSelector?: NamePath | ((values: AnyStore) => unknown), opts?: { preserve?: boolean }) => {
      const namePath = typeof pathOrSelector === 'function' ? [] : getNamePath(pathOrSelector)
      const selector = typeof pathOrSelector === 'function' ? pathOrSelector : (values: AnyStore) => getValue(values, namePath)
      // ownedWrite: commits fire from watch notifications that may run
      // inside a reactive scope (memo reads trigger notifyWatch chains).
      const [cached, setCached] = createSignal<any>(undefined, { name: 'form:watch', ownedWrite: true })
      const read = () => {
        // Raw store read (not the field-projected getFieldsValue) — a watch
        // must observe paths that have no registered field yet.
        // untrack: notifyWatch callbacks can fire inside event handlers
        // (updateValue) — reading the store signal there without untrack
        // trips Solid 2's STRICT_READ_UNTRACKED warning; the watch owns its
        // own reactivity via the registerWatch subscription, not by being
        // sampled mid-handler.
        const source = untrack(() => readStore())
        return selector(source)
      }
      // Seed + subscribe: every watch notification re-derives and commits
      // through the signal (equals=stringify comparison keeps memos stable
      // when the content is unchanged).
      const commit = () => {
        const next = read()
        const nextStr = stringifySafe(next)
        // untrack the cached() read: the seed commit runs inside the caller's
        // (often untracked, e.g. component-body) scope — a bare signal read
        // there trips STRICT_READ_UNTRACKED in dev.
        const prevStr = stringifySafe(untrack(() => cached()))
        if (nextStr !== prevStr) setCached(() => next)
      }
      commit()
      const cancel = registerWatch(() => commit())
      const signal = () => cached()
      ;(signal as any).dispose = cancel
      return signal as (() => any) & { dispose: () => void }
    },
    // internal API (used by createFormField / createFormList / Form UI layer)
    registerField,
    initEntityValue,
    setInitialValues,
    setCallbacks: (cb: FormCallbacks) => { callbacks = cb },
    setValidateMessages: (messages: Record<string, any> | null) => { validateMessages = messages },
    getMergedValidateMessages: () => validateMessages,
    setPreserve: (p?: boolean) => { preserve = p },
    getInitialValue,
    destroyForm,
    registerWatch,
    updateValue,
  }

  // Fields can consume valuesTracked without ever calling an imperative getter.
  // Seed defaults before those reactive consumers render.
  untrack(readConfig)
  return instance
}

export type FormInternal = FormInstance

/** JSON-stringify with a fallback for circular structures (rc parity). */
function stringifySafe(value: unknown): string {
  try {
    return JSON.stringify(value)
  } catch {
    return Math.random().toString()
  }
}

// ---------------------------------------------------------------- merge utils

/** Deep merge `patch` into `base`, immutably (rc-util merge semantics). */
function deepMergeStore<T>(base: T, patch: any): T {
  if (patch === undefined) return base
  if (!isMergableObject(patch)) return patch as T
  if (!isMergableObject(base)) return cloneDeep(patch) as T
  const output: any = Array.isArray(base) ? base.slice() : { ...(base as any) }
  Object.keys(patch).forEach(key => {
    output[key] = deepMergeStore((base as any)[key], patch[key])
  })
  return output
}

function isMergableObject(val: unknown): val is Record<string, any> {
  return typeof val === 'object' && val !== null
}

function cloneDeep<T>(value: T): T {
  if (Array.isArray(value)) return value.map(cloneDeep) as T
  if (isMergableObject(value)) {
    const out: any = {}
    Object.keys(value).forEach(key => { out[key] = cloneDeep((value as any)[key]) })
    return out
  }
  return value
}
