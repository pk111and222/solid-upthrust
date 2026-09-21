import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { RadioOption } from 'upthrust-competence';
export type { RadioOption };
export interface RadioProps {
    /** Controlled checked (standalone usage). */
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    /** Render standalone even inside a RadioGroup. */
    skipGroup?: boolean;
    id?: string;
    name?: string;
    /** The key this radio represents inside a group. */
    value?: string | number;
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
    onChange?: (checked: boolean, event?: Event) => void;
    ref?: (el: HTMLInputElement) => void;
}
/**
 * Radio — the antd-style single picker.
 *
 * The headless createRadio owns the checked machine (controlled or not,
 * disabled gate, never-uncheck-itself). Inside a RadioGroup the value
 * flows through the group's shared selection store (maxSelect: 1); standalone
 * usage rides the per-radio machine directly.
 */
declare const Radio: Component<RadioProps>;
export interface RadioGroupProps {
    /** Controlled selected value (single key). */
    value?: string | number;
    defaultValue?: string | number;
    options?: RadioOption[];
    disabled?: boolean;
    name?: string;
    /** Render options as the joined button strip (optionType="button"). */
    optionType?: 'default' | 'button';
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
    onChange?: (value: string | number) => void;
}
/**
 * RadioGroup — renders a radio per option and owns the single pick.
 * The headless createRadioGroup rides the SHARED selection store
 * (maxSelect: 1). Native inputs share a name for browser keyboard navigation.
 */
export declare const RadioGroup: Component<RadioGroupProps>;
export interface RadioButtonProps {
    value: string | number;
    disabled?: boolean;
    /** Corner rounding position in the strip (computed by the group). */
    position?: 'first' | 'middle' | 'last' | 'single';
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
    onChange?: (checked: boolean, event?: Event) => void;
}
export declare const RadioButton: Component<RadioButtonProps>;
export type RadioGroupContextValue = {
    isSelected: (value: string | number) => boolean;
    isDisabled: (value: string | number) => boolean;
    select: (value: string | number) => void;
    /** Shared native input name so browser arrow-key radio nav works. */
    name?: string;
    registerInput?: (input: HTMLInputElement, checked: () => boolean | undefined) => () => void;
    syncInputs?: () => void;
};
export declare const RadioGroupContext: import('solid-js').Context<RadioGroupContextValue | null>;
export declare const useRadioGroupContext: () => RadioGroupContextValue | null;
export default Radio;
