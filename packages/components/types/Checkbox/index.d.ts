import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { CheckboxOption } from 'upthrust-competence';
export type { CheckboxOption };
export interface CheckboxProps {
    /** Controlled checked. */
    checked?: boolean;
    defaultChecked?: boolean;
    /** Presentational dash (never part of the checked arithmetic). */
    indeterminate?: boolean;
    disabled?: boolean;
    /** Render standalone even inside a CheckboxGroup. */
    skipGroup?: boolean;
    id?: string;
    name?: string;
    value?: string | number;
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
    onChange?: (checked: boolean, event?: Event) => void;
    ref?: (el: HTMLInputElement) => void;
}
/**
 * Checkbox — the antd-style boolean picker.
 *
 * The headless createCheckbox owns the checked machine (controlled or not,
 * disabled gate, indeterminate as presentation only). The native input is
 * kept in the DOM (opacity-0) so keyboard focus and screen readers work;
 * the visual box is a sibling that reads the input's :checked via peer
 * classes where possible and the machine state otherwise.
 *
 * Inside a CheckboxGroup the props (checked/disabled/onChange) are wired
 * by the group through context — standalone usage falls back to the
 * machine directly.
 */
declare const Checkbox: Component<CheckboxProps>;
export interface CheckboxGroupProps {
    /** Controlled value array. */
    value?: Array<string | number>;
    defaultValue?: Array<string | number>;
    options?: CheckboxOption[];
    disabled?: boolean;
    name?: string;
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
    onChange?: (value: Array<string | number>) => void;
}
/**
 * CheckboxGroup — renders a checkbox per option and manages the value
 * array. Standalone usage only (a Form.Item wraps this component and
 * receives the array value through the standard context contract).
 */
export declare const CheckboxGroup: Component<CheckboxGroupProps>;
export type CheckboxGroupContextValue = {
    isChecked: (value: string | number) => boolean;
    isDisabled: (value: string | number) => boolean;
    toggleValue: (value: string | number) => void;
};
export declare const CheckboxGroupContext: import('solid-js').Context<CheckboxGroupContextValue | null>;
export declare const useCheckboxGroupContext: () => CheckboxGroupContextValue | null;
export default Checkbox;
