import { FormFieldRule } from './formField';
export type NumericValueConfig = {
    /** Controlled numeric value; undefined = uncontrolled. Getter form so
     *  wrappers (Slider/Rate translate live props) can feed it reactively. */
    value?: number | null | (() => number | null | undefined);
    defaultValue?: number | null;
    min?: number | (() => number);
    max?: number | (() => number);
    /** Increment per step. Default 1. */
    step?: number | (() => number);
    /** Explicit decimals to round to on commit; default derives from step. */
    precision?: number;
    disabled?: boolean | (() => boolean);
    readonly?: boolean;
    onChange?: (value: number | null) => void;
    /** Form integration: rules for the enclosing Item. */
    rules?: FormFieldRule[];
};
export type NumericValueIns = {
    /** The effective (controlled-aware) value. */
    value: () => number | null;
    min: () => number;
    max: () => number;
    step: () => number;
    /** Live write: clamps to range but does NOT round to precision (drags). */
    setValue: (value: number | null) => void;
    /** Snap write: clamps AND rounds to precision (blur / drag end). */
    commitValue: (value: number | null) => void;
    /** Snap the CURRENT value in place (InputNumber blur). */
    commit: () => void;
    /** Step by ±n steps (clamped). Keyboard arrows / steppers ride on this. */
    stepBy: (steps: number) => void;
    /** Map a value into the nearest evenly-spaced tick index (0-based). */
    index: (value?: number | null) => number;
    /** Map a 0-based tick index back to its value (step-snapped). */
    stepToIndex: (index: number) => number;
    isDisabled: () => boolean;
    isReadonly: () => boolean;
    isAtMin: () => boolean;
    isAtMax: () => boolean;
};
/**
 * Decimals implied by a step value (antd getPrecision): 0.1 → 1, 0.01 → 2.
 */
export declare const stepPrecision: (step: number) => number;
export declare const toFixedWithPrecision: (value: number, precision: number) => number;
export declare const createNumericValue: (config?: NumericValueConfig) => NumericValueIns;
export declare const numericValueSplits: (keyof NumericValueConfig)[];
export type SelectionOption = {
    label: string;
    value: string | number;
    disabled?: boolean;
};
export type SelectionConfig = {
    /** Controlled selected keys; undefined = uncontrolled. Getter form so
     *  wrappers (RadioGroup's single-key API) can translate live props. */
    value?: Array<string | number> | (() => Array<string | number> | undefined);
    defaultValue?: Array<string | number>;
    options?: SelectionOption[];
    disabled?: boolean;
    /**
     * Max simultaneously selectable keys. 1 = radio semantics (a new pick
     * REPLACES the old one); Infinity = checkbox semantics.
     */
    maxSelect?: number | (() => number);
    /** Whether an already-selected key can be deselected. Radio = false. */
    allowDeselect?: boolean | (() => boolean);
    onChange?: (value: Array<string | number>) => void;
    /** Form integration: rules for the enclosing Item. */
    rules?: FormFieldRule[];
};
export type SelectionIns = {
    value: () => Array<string | number>;
    options: () => SelectionOption[];
    isSelected: (value: string | number) => boolean;
    isDisabled: (value: string | number) => boolean;
    /** Toggle/add/replace per the cardinality rules. Returns the new value. */
    select: (value: string | number) => Array<string | number>;
    deselect: (value: string | number) => Array<string | number>;
    /** Replace the whole selection atomically (one onChange). Card-linked
     *  bulk toggles (Cascader's parent check) need this: per-key select
     *  loops read a STALE value inside a Solid 2 batch and clobber each
     *  other. maxSelect still applies: extra keys are dropped. */
    replaceAll: (values: Array<string | number>) => Array<string | number>;
    clear: () => Array<string | number>;
    /** Everything checked? (group "check all" indeterminate logic). */
    isAllSelected: () => boolean;
    /** Some but not all enabled options selected? */
    isIndeterminate: () => boolean;
    /** The enabled option keys (disabled options are skipped by bulk ops). */
    enabledValues: () => Array<string | number>;
};
export declare const createSelection: (config?: SelectionConfig) => SelectionIns;
export declare const selectionSplits: (keyof SelectionConfig)[];
