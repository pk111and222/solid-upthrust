import { FormFieldRule } from './formField';
export type TimePickerUnit = 'hour' | 'minute' | 'second';
export type TimePickerConfig = {
    /** Controlled time string ('08:30:00'); null/undefined = empty. */
    value?: string | null;
    defaultValue?: string | null;
    /** 'HH:mm' (default) or 'HH:mm:ss'. */
    format?: 'HH:mm' | 'HH:mm:ss';
    /** Disallow times before/after (inclusive), 'HH:mm[:ss]' strings. */
    min?: string;
    max?: string;
    hourStep?: number;
    minuteStep?: number;
    secondStep?: number;
    disabled?: boolean;
    /** Hide the seconds column even in HH:mm:ss (panel-only concern). */
    hideDisabledOptions?: boolean;
    onChange?: (value: string | null) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    /** Controlled panel open (mirrors the UI trigger). */
    open?: boolean;
    /** Form integration: rules for the enclosing Item. */
    rules?: FormFieldRule[];
};
export type TimeParts = {
    hour: number;
    minute: number;
    second: number;
};
/** 'HH:mm[:ss]' → parts; null when unparseable/empty. */
export declare const parseTime: (value: string | null | undefined) => TimeParts | null;
/** parts → 'HH:mm' or 'HH:mm:ss' (zero-padded). */
export declare const formatTime: (parts: TimeParts, format?: "HH:mm" | "HH:mm:ss") => string;
/** Total seconds — comparison/arithmetic. */
export declare const toSeconds: (parts: TimeParts) => number;
export declare const fromSeconds: (total: number) => TimeParts;
/** Clamp parts into [min, max] (inclusive bounds; undefined = open). */
export declare const clampTime: (parts: TimeParts, min?: TimeParts, max?: TimeParts) => TimeParts;
/** The option lattice for a column: hours 0..23/hourStep, minutes &
 *  seconds 0..59/step (disabled options still render, flagged). */
export declare const unitOptions: (unit: TimePickerUnit, step: number) => Array<{
    value: number;
    disabled: boolean;
}>;
export type TimePickerIns = {
    /** The effective time string (controlled wins), null when empty. */
    value: () => string | null;
    /** The parsed parts (null when empty). */
    parts: () => TimeParts | null;
    format: () => 'HH:mm' | 'HH:mm:ss';
    isDisabled: () => boolean;
    /** Replace the RAW INPUT text (typing); commits when parseable. */
    setInputText: (text: string) => void;
    /** The raw buffer — what the input shows. */
    textValue: () => string;
    /** Blur-time snap: parse + clamp + relattice the buffer. */
    commit: () => void;
    notifyFocus: () => void;
    notifyBlur: () => void;
    isFocused: () => boolean;
    /** Imperative value write (programmatic/API). */
    setValue: (value: string | null) => void;
    /** The input segment the stepper acts on ('hour' default; typing/arrows move it). */
    selectedUnit: () => TimePickerUnit;
    setSelectedUnit: (unit: TimePickerUnit) => void;
    /**
     * Stepper: ±1 step on the selected unit (clamped + lattice-snapped).
     * `unit` should be passed EXPLICITLY by the UI (the stepper click knows
     * its column): reading the selectedUnit signal right after
     * setSelectedUnit returns the UNCOMMITTED old value inside a Solid 2
     * batch. Falls back to the signal for programmatic calls.
     */
    stepSelected: (delta: number, unit?: TimePickerUnit) => void;
    /** Panel columns in display order per format. */
    units: () => TimePickerUnit[];
    /** The option list of a column (per step). */
    columnOptions: (unit: TimePickerUnit) => Array<{
        value: number;
        disabled: boolean;
    }>;
    /** The panel's keyboard-active option per column. */
    activeValue: (unit: TimePickerUnit) => number | undefined;
    moveActive: (unit: TimePickerUnit, delta: number) => void;
    setActiveValue: (unit: TimePickerUnit, value: number) => void;
    /** Panel pick: set one unit, snapping onto the lattice. */
    pickUnit: (unit: TimePickerUnit, value: number) => void;
    /** Whether a lattice value is disabled (off-step or out of range). */
    isOptionDisabled: (unit: TimePickerUnit, value: number) => boolean;
    /** Panel open state (the UI trigger owns the DOM; this mirrors). */
    isOpen: () => boolean;
    setOpen: (open: boolean) => void;
    /** Clear to null. */
    clear: () => void;
};
export declare const createTimePicker: (config?: TimePickerConfig) => TimePickerIns;
export declare const timePickerSplits: (keyof TimePickerConfig)[];
