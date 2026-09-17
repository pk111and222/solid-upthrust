import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { InputNumberFormatter, InputNumberParser, inputNumberSplits } from 'upthrust-competence';
import { SizeType } from '../../common/type';
export type { InputNumberFormatter, InputNumberParser };
export interface InputNumberProps {
    /** Controlled numeric value; null clears. */
    value?: number | null;
    defaultValue?: number | null;
    min?: number;
    max?: number;
    /** Increment per step. Default 1. */
    step?: number | number[];
    /** Multiplier when stepping with Shift. Default 10. */
    shiftMultiplier?: number;
    /** Decimals to round to; default derives from step. */
    precision?: number;
    /** Strips non-numeric text BEFORE parsing (e.g. remove '$'). */
    parser?: InputNumberParser;
    /** Renders the display text (e.g. add a unit). */
    formatter?: InputNumberFormatter;
    prefix?: JSX.Element;
    suffix?: JSX.Element;
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    id?: string;
    name?: string;
    size?: SizeType;
    status?: 'error' | 'warning';
    controls?: boolean;
    class?: string;
    style?: JSX.CSSProperties;
    onChange?: (value: number | null) => void;
    onStep?: (value: number, info: {
        offset: number;
        type: 'up' | 'down';
    }) => void;
    onPressEnter?: (e: KeyboardEvent) => void;
    onFocus?: (e: FocusEvent) => void;
    onBlur?: (e: FocusEvent) => void;
    ref?: (el: HTMLInputElement) => void;
}
/**
 * InputNumber — numeric input with embedded up/down steppers.
 *
 * The headless createInputNumber owns the buffer/parse/step/clamp machine;
 * this layer renders the antd-style frame: an inline-flex wrapper with a
 * borderless inner input and a hover-revealed actions column. Form.Item
 * integration follows the Input contract (value-first onChange, context
 * fills value/status/id/disabled/size).
 */
declare const InputNumber: Component<InputNumberProps>;
export default InputNumber;
export { inputNumberSplits };
