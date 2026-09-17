import { SelectionIns, SelectionOption } from './selection';
import { FormFieldRule } from './formField';
export type RadioConfig = {
    /** Controlled checked; undefined = uncontrolled. */
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    /** Skip the enclosing RadioGroup (render standalone). */
    skipGroup?: boolean;
    onChange?: (checked: boolean, event?: Event) => void;
    /** Form integration: rules for the enclosing Item. */
    rules?: FormFieldRule[];
};
export type RadioIns = {
    checked: () => boolean;
    /** Check (never unchecks itself — radio semantics). */
    check: (event?: Event) => void;
    setChecked: (checked: boolean, event?: Event) => void;
    isDisabled: () => boolean;
};
export declare const createRadio: (config?: RadioConfig) => RadioIns;
export type RadioOption = SelectionOption;
export type RadioGroupConfig = {
    /** Controlled selected value (single key, antd API shape); undefined = uncontrolled. */
    value?: string | number;
    defaultValue?: string | number;
    options?: RadioOption[];
    disabled?: boolean;
    /** Group-level change with the new single value (antd onRadioChange). */
    onChange?: (value: string | number) => void;
    /** Form integration: rules for the enclosing Item. */
    rules?: FormFieldRule[];
    /** Escape hatch for advanced consumers (Select): raw array events. */
    onSelectionChange?: (value: Array<string | number>) => void;
};
export type RadioGroupIns = {
    /** The selected key (or undefined when nothing is picked). */
    value: () => string | number | undefined;
    isSelected: (value: string | number) => boolean;
    isDisabled: (value: string | number) => boolean;
    /** Pick a key (replaces the previous one); disabled keys are ignored. */
    select: (value: string | number) => void;
    /** Clear the selection (group-level reset). */
    clear: () => void;
    options: () => RadioOption[];
    /** The underlying shared store — a future Select composes this directly. */
    store: () => SelectionIns;
};
export declare const createRadioGroup: (config?: RadioGroupConfig) => RadioGroupIns;
export declare const radioSplits: (keyof RadioConfig)[];
export declare const radioGroupSplits: (keyof RadioGroupConfig)[];
