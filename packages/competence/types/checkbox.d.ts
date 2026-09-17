import { FormFieldRule } from './formField';
export type CheckboxConfig = {
    /** Controlled checked; undefined = uncontrolled. */
    checked?: boolean;
    defaultChecked?: boolean;
    /** Presentational dash; never part of the checked arithmetic. */
    indeterminate?: boolean;
    disabled?: boolean;
    /** Skip the enclosing CheckboxGroup (render standalone). */
    skipGroup?: boolean;
    onChange?: (checked: boolean, event?: Event) => void;
    /** Form integration: rules for the enclosing Item. */
    rules?: FormFieldRule[];
};
export type CheckboxIns = {
    checked: () => boolean;
    /** Visual state: indeterminate wins over checked for the dash box. */
    indeterminate: () => boolean;
    toggle: (event?: Event) => void;
    setChecked: (checked: boolean, event?: Event) => void;
    isDisabled: () => boolean;
};
export declare const createCheckbox: (config?: CheckboxConfig) => CheckboxIns;
export type CheckboxOption = {
    label: string;
    value: string | number;
    disabled?: boolean;
};
export type CheckboxGroupConfig = {
    /** Controlled value array; undefined = uncontrolled. */
    value?: Array<string | number>;
    defaultValue?: Array<string | number>;
    options?: CheckboxOption[];
    disabled?: boolean;
    onChange?: (value: Array<string | number>) => void;
    /** Form integration: rules for the enclosing Item. */
    rules?: FormFieldRule[];
};
export type CheckboxGroupIns = {
    value: () => Array<string | number>;
    /** Toggle one option's membership. */
    toggleValue: (value: string | number) => void;
    /** Check every ENABLED option (individual disabled options untouched). */
    checkAll: () => void;
    /** Uncheck everything. */
    clearAll: () => void;
    isChecked: (value: string | number) => boolean;
    isDisabled: (value: string | number) => boolean;
    /** All enabled options checked? (group indeterminate = partial) */
    isAllChecked: () => boolean;
    isIndeterminate: () => boolean;
    options: () => CheckboxOption[];
};
export declare const createCheckboxGroup: (config?: CheckboxGroupConfig) => CheckboxGroupIns;
export declare const checkboxSplits: (keyof CheckboxConfig)[];
export declare const checkboxGroupSplits: (keyof CheckboxGroupConfig)[];
