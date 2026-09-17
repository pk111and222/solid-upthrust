import { InternalNamePath, NamePath } from './formUtils';
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
export type StoreValue = any;
export type Store = Record<string, StoreValue>;
/** Entity contract every registered field must satisfy (createFormField). */
export type FormFieldEntity = {
    getNamePath: () => InternalNamePath;
    /** Field prop getters — the store reads them lazily on demand. */
    getInitialValue: () => StoreValue | undefined;
    getRules: () => unknown[] | undefined;
    isListField: () => boolean;
    isList: () => boolean;
    isPreserve: () => boolean | undefined;
    isFieldTouched: () => boolean;
    isFieldDirty: () => boolean;
    isFieldValidating: () => boolean;
    getErrors: () => string[];
    getWarnings: () => string[];
    /** Kick off validation for this field (formValidate-backed). */
    validateRules: (options?: Record<string, any>) => Promise<any>;
    /** Sync props from a `setFields` call (errors/touched/validating). */
    onSetField: (data: Record<string, any>) => void;
    /** Reset touched/dirty/errors/warnings state. */
    onReset: () => void;
};
export type FormCallbacks = {
    onValuesChange?: (changedValues: AnyStore, allValues: AnyStore) => void;
    onFieldsChange?: (changedFields: FormFieldChangeData[], allFields: FormFieldChangeData[]) => void;
    onFinish?: (values: AnyStore) => void;
    onFinishFailed?: (errorInfo: FormValidateErrorEntity) => void;
};
export type FormFieldChangeData = {
    name: InternalNamePath;
    value?: StoreValue;
    touched?: boolean;
    validating?: boolean;
    errors?: string[];
    warnings?: string[];
};
export type FormValidateErrorEntity = {
    values: AnyStore;
    errorFields: {
        name: InternalNamePath;
        errors: string[];
        warnings: string[];
    }[];
    outOfDate: boolean;
};
export type FormWatchCallback = (values: AnyStore, allValues: AnyStore, namePathList: InternalNamePath[]) => void;
export type FormValidateOptions = {
    /** Only run the validation, do not touch field errors state. */
    validateOnly?: boolean;
    /** Validate nested children of the given nameList paths. */
    recursive?: boolean;
    /** Only validate dirty fields (used by dependency cascade). */
    dirty?: boolean;
};
type AnyStore = Store;
export type FormConfig = {
    readonly initialValues?: Store | undefined;
    readonly preserve?: boolean | undefined;
    readonly validateMessages?: Record<string, any> | undefined;
    readonly callbacks?: FormCallbacks | undefined;
};
export type FormInstance = ReturnType<typeof createForm>;
/**
 * Create a headless form instance. Can be used standalone (TanStack-Form
 * style) or wired into the `<Form>` UI layer via the `form` prop.
 */
export declare function createForm(config?: FormConfig): {
    values: () => Store;
    valuesTracked: () => Store;
    resetCountSignal: import('solid-js').SourceAccessor<number>;
    removeEventSignal: import('solid-js').SourceAccessor<{
        namePath: InternalNamePath;
        ts: number;
    } | null>;
    getResetScope: () => InternalNamePath[] | null;
    getFieldValue: (name?: NamePath) => any;
    getFieldsValue: (nameList?: NamePath[] | true, filterFunc?: ((meta: {
        name: InternalNamePath;
        touched: boolean;
        validating: boolean;
        errors: string[];
        warnings: string[];
    }) => boolean)) => {
        [x: string]: any;
    };
    getFieldsError: (nameList?: NamePath[]) => {
        name: InternalNamePath;
        errors: string[];
        warnings: string[];
    }[];
    getFieldError: (name?: NamePath) => string[];
    getFieldWarning: (name?: NamePath) => string[];
    getFields: () => FormFieldChangeData[];
    isFieldTouched: (name?: NamePath) => boolean;
    isFieldsTouched: (nameList?: NamePath[] | boolean, allFieldsTouched?: boolean) => boolean;
    isFieldValidating: (name?: NamePath) => boolean;
    isFieldsValidating: (nameList?: NamePath[]) => boolean;
    validateField: (namePath: InternalNamePath, triggerName: string) => void;
    setFieldValue: (name: NamePath, value: StoreValue) => void;
    setFieldsValue: (values?: AnyStore) => void;
    setFields: (fields: (Omit<FormFieldChangeData, "name"> & {
        name: NamePath;
    })[]) => void;
    resetFields: (nameList?: NamePath[]) => void;
    validateFields: (_nameList?: NamePath[] | FormValidateOptions, _options?: FormValidateOptions) => Promise<AnyStore>;
    submit: () => Promise<Store>;
    /**
     * Reactive watch — returns a read-only signal tracking the value at
     * `path` (or the selector's return). Solid replaces rc-field-form's
     * registerWatch + useEffect machinery: a memo over this signal stays in
     * sync automatically; stringify de-dupes object churn (nested objects
     * get new references on unrelated writes).
     */
    watch: (pathOrSelector?: NamePath | ((values: AnyStore) => unknown), opts?: {
        preserve?: boolean;
    }) => (() => any) & {
        dispose: () => void;
    };
    registerField: (entity: FormFieldEntity) => (isListField: boolean, fieldPreserve?: boolean | null, subNamePath?: InternalNamePath) => void;
    initEntityValue: (entity: FormFieldEntity) => void;
    setInitialValues: (nextInitialValues?: AnyStore, init?: boolean) => void;
    setCallbacks: (cb: FormCallbacks) => void;
    setValidateMessages: (messages: Record<string, any> | null) => void;
    getMergedValidateMessages: () => Record<string, any> | null;
    setPreserve: (p?: boolean) => void;
    getInitialValue: (namePath: InternalNamePath) => StoreValue;
    destroyForm: (clearOnDestroy?: boolean) => void;
    registerWatch: (callback: FormWatchCallback) => () => void;
    updateValue: (name: NamePath, value: StoreValue) => void;
};
export type FormInternal = FormInstance;
export {};
