import { NumericValueIns } from './selection';
import { FormFieldRule } from './formField';
export type RateConfig = {
    /** Controlled rating; undefined = uncontrolled. */
    value?: number;
    defaultValue?: number;
    /** Number of characters (stars). Default 5. */
    count?: number;
    /** Allow half-star values. Default false. */
    allowHalf?: boolean;
    /** Allow clearing by re-clicking the current value. Default false. */
    allowClear?: boolean;
    disabled?: boolean;
    /** Auto-focus the character container. */
    autoFocus?: boolean;
    onChange?: (value: number) => void;
    onHoverChange?: (value: number) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    /** Form integration: rules for the enclosing Item. */
    rules?: FormFieldRule[];
};
export type RateIns = {
    /** The committed rating (0 when unrated). */
    value: () => number;
    /** What the stars should PAINT: the hover preview while hovering, else value. */
    displayValue: () => number;
    count: () => number;
    isDisabled: () => boolean;
    isFocused: () => boolean;
    /** Pointer entered character area n (1-based; halves round to the lattice). */
    hoverAt: (position: number) => void;
    /** Pointer left the widget — preview off. */
    leaveHover: () => void;
    isHovering: () => boolean;
    /** Click character area n (1-based) — commits, or clears when equal & clearable. */
    clickAt: (position: number) => void;
    /** Keyboard: arrows move by one star (halves by half), 0 resets. */
    stepBy: (steps: number) => void;
    reset: () => void;
    notifyFocus: () => void;
    notifyBlur: () => void;
    /** The shared numeric machine (advanced composition). */
    core: () => NumericValueIns;
};
export declare const createRate: (config?: RateConfig) => RateIns;
export declare const rateSplits: (keyof RateConfig)[];
