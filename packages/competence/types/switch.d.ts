import { FormFieldRule } from './formField';
export type SwitchConfig = {
    /** Controlled checked; undefined = uncontrolled. */
    checked?: boolean;
    defaultChecked?: boolean;
    /** Alias of checked (antd 5.12+). */
    value?: boolean;
    /** Alias of defaultChecked. */
    defaultValue?: boolean;
    disabled?: boolean;
    /** Blocks toggling while showing a spinner. */
    loading?: boolean;
    onChange?: (checked: boolean, event?: Event) => void;
    onClick?: (checked: boolean, event?: Event) => void;
    /** Form integration: rules for the enclosing Item. */
    rules?: FormFieldRule[];
};
export type SwitchIns = {
    /** Effective checked state (controlled value wins). */
    checked: () => boolean;
    /** Toggle with the loading/disabled gate; fires onChange on success. */
    toggle: (event?: Event) => void;
    setChecked: (checked: boolean, event?: Event) => void;
    isDisabled: () => boolean;
    isLoading: () => boolean;
    /** True when toggling is blocked by either gate. */
    isBlocked: () => boolean;
};
export declare const createSwitch: (config?: SwitchConfig) => SwitchIns;
export declare const switchSplits: (keyof SwitchConfig)[];
