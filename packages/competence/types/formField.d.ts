import { FormFieldEntity, FormInstance, StoreValue } from './form';
import { InternalNamePath, NamePath } from './formUtils';
/**
 * Headless field entity — the signal-based port of rc-field-form's Field.
 *
 * Lifecycle: call inside a Solid component body (or createRoot in tests).
 * Registration happens immediately; onCleanup unregisters with the store's
 * preserve semantics. A `name` change re-registers and resets the field
 * (antd achieves this with a React key remount).
 */
export type FieldValidateTrigger = string | string[] | false;
export type FormFieldConfig = {
    /** Field name path. undefined → pure render-region field (no value bound). */
    readonly name?: NamePath | undefined;
    readonly rules?: FormFieldRule[] | undefined;
    readonly initialValue?: StoreValue | undefined;
    readonly dependencies?: NamePath[] | undefined;
    /** Default 'onChange'. false disables trigger validation. */
    readonly validateTrigger?: FieldValidateTrigger | undefined;
    readonly validateFirst?: boolean | 'parallel' | undefined;
    readonly messageVariables?: Record<string, any> | undefined;
    readonly validateDebounce?: number | undefined;
    /** Escape hatch for components that emit events instead of values. */
    readonly getValueFromEvent?: ((...args: any[]) => StoreValue) | undefined;
    readonly normalize?: ((value: StoreValue, prevValue: StoreValue, allValues: any) => StoreValue) | undefined;
    readonly preserve?: boolean | undefined;
    readonly disabled?: boolean | undefined;
    onReset?: () => void;
};
/** Rule shape (subset used before the validation engine lands in P1). */
export type FormFieldRule = {
    required?: boolean;
    message?: string;
    warningOnly?: boolean;
    validator?: (rule: FormFieldRule, value: StoreValue, callback: (error?: string | Error) => void) => Promise<void | any> | void;
    [key: string]: any;
};
export type FormFieldMeta = {
    touched: boolean;
    validating: boolean;
    errors: string[];
    warnings: string[];
    name: InternalNamePath;
    validated: boolean;
};
export declare function createFormField(form: FormInstance, config: FormFieldConfig): {
    value: import('solid-js').SourceAccessor<any>;
    touched: import('solid-js').SourceAccessor<boolean>;
    errors: import('solid-js').SourceAccessor<string[]>;
    warnings: import('solid-js').SourceAccessor<string[]>;
    meta: () => FormFieldMeta;
    onChange: (...args: any[]) => void;
    setPrefixName: (prefix: InternalNamePath) => void;
    entity: FormFieldEntity;
    getRules: () => FormFieldRule[];
};
export type FormField = ReturnType<typeof createFormField>;
