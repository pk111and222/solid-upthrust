import { FormFieldRule } from './formField';
export type AutoCompleteOption = {
    value: string;
    label?: string;
    disabled?: boolean;
    [key: string]: unknown;
};
export type AutoCompleteConfig = {
    /** Controlled text value. */
    value?: string;
    defaultValue?: string;
    /** The full suggestion pool (client-filtered) — or the current server-driven list. */
    options?: AutoCompleteOption[];
    disabled?: boolean;
    /** (input, option) => boolean; false disables client filtering. Default: substring on value/label. */
    filterOption?: ((input: string, option: AutoCompleteOption) => boolean) | false;
    /** Controlled dropdown open (composed with the UI's trigger). */
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onChange?: (value: string) => void;
    onSelect?: (value: string, option: AutoCompleteOption) => void;
    onSearch?: (value: string) => void;
    onBlur?: () => void;
    onFocus?: () => void;
    /** Form integration: rules for the enclosing Item. */
    rules?: FormFieldRule[];
};
export type AutoCompleteIns = {
    /** The effective text (controlled wins). */
    value: () => string;
    /** Replace the buffer (typing); fires onChange + onSearch. */
    setInputText: (text: string) => void;
    /** The filtered suggestion list for the current input. */
    suggestions: () => AutoCompleteOption[];
    /** True while an IME composition is in progress (input events ignored). */
    isComposing: () => boolean;
    notifyCompositionStart: () => void;
    /** compositionEnd commits the pending text once (antd semantics). */
    notifyCompositionEnd: () => void;
    /** The active (keyboard-highlighted) suggestion value. */
    activeValue: () => string | undefined;
    moveActive: (delta: number) => void;
    setActiveValue: (value: string) => void;
    resetActive: () => void;
    /** Commit the active suggestion (Enter): replaces the text. */
    commitActive: () => void;
    /** Select a suggestion by click: replaces the text + fires onSelect. */
    selectOption: (option: AutoCompleteOption) => void;
    /** Open state (the UI trigger owns the DOM; this mirrors for search reset). */
    isOpen: () => boolean;
    setOpen: (open: boolean) => void;
    notifyFocus: () => void;
    notifyBlur: () => void;
    isDisabled: () => boolean;
};
export declare const createAutoComplete: (config?: AutoCompleteConfig) => AutoCompleteIns;
export declare const autoCompleteSplits: (keyof AutoCompleteConfig)[];
