import { FormFieldRule } from './formField';
export type InputNumberParser = (text: string) => string;
export type InputNumberFormatter = (value: number) => string;
export type InputNumberConfig = {
    /** Controlled numeric value; undefined = uncontrolled. */
    value?: number | null;
    defaultValue?: number | null;
    min?: number;
    max?: number;
    /** Increment per step. Default 1. */
    step?: number | number[];
    /** Multiplier when stepping with Shift held. Default 10. */
    shiftMultiplier?: number;
    /** Explicit decimals; otherwise preserve value and step precision. */
    precision?: number;
    /** Runs on raw input text BEFORE numeric parsing. */
    parser?: InputNumberParser;
    /** Renders the display text from a committed number. */
    formatter?: InputNumberFormatter;
    disabled?: boolean;
    readonly?: boolean;
    onChange?: (value: number | null) => void;
    onStep?: (value: number, info: {
        offset: number;
        type: 'up' | 'down';
    }) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    /** Form integration: rules for the enclosing Item. */
    rules?: FormFieldRule[];
};
export type InputNumberIns = {
    /** The committed numeric value (null when empty/unparseable). */
    value: () => number | null;
    /** The raw input buffer — what the text field shows while focused. */
    textValue: () => string;
    /** Display text: the buffer while focused, formatter(value) otherwise. */
    displayValue: () => string;
    /** True while the buffer parses out of [min, max] (red text hint). */
    outOfRange: () => boolean;
    isFocused: () => boolean;
    /** Replace the buffer from a typing event; commits when parseable. */
    setInputText: (text: string) => void;
    up: (multiplied?: boolean) => void;
    down: (multiplied?: boolean) => void;
    /** Blur-time snap: re-parse, clamp, format. */
    commit: () => void;
    notifyFocus: () => void;
    setValue: (value: number | null) => void;
    isDisabled: () => boolean;
    isReadonly: () => boolean;
    /** Whether the up/down actions are currently available. */
    canUp: () => boolean;
    canDown: () => boolean;
};
export declare const createInputNumber: (config?: InputNumberConfig) => InputNumberIns;
export declare const inputNumberSplits: (keyof InputNumberConfig)[];
