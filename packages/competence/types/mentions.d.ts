import { FormFieldRule } from './formField';
export type MentionOption = {
    value: string;
    label?: string;
    disabled?: boolean;
    [key: string]: unknown;
};
export type MentionsConfig = {
    /** Controlled text value. */
    value?: string;
    defaultValue?: string;
    /** The suggestion pool. */
    options?: MentionOption[];
    /** Trigger prefix. Default '@'. */
    prefix?: string;
    /** Word characters that may continue a mention token after the prefix. */
    split?: string;
    disabled?: boolean;
    /** (input, option) => boolean; false disables client filtering. */
    filterOption?: ((input: string, option: MentionOption) => boolean) | false;
    /** Controlled open (composed with the UI's trigger). */
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onChange?: (value: string) => void;
    onSelect?: (option: MentionOption, prefix: string) => void;
    onSearch?: (text: string, prefix: string) => void;
    onBlur?: () => void;
    onFocus?: () => void;
    /** Form integration: rules for the enclosing Item. */
    rules?: FormFieldRule[];
};
export type MentionTriggerState = {
    /** True when the caret sits in an active '@token'. */
    active: boolean;
    /** The query text after the prefix ('' right after typing '@'). */
    query: string;
    /** The token's range in the text, [start, end) INCLUDING the prefix. */
    range: [number, number];
    /** The matched prefix ('@'). */
    prefix: string;
};
export type MentionsIns = {
    /** The effective text (controlled wins). */
    value: () => string;
    /** Replace the text (typing); fires onChange. */
    setText: (text: string) => void;
    /** Set the caret position (UI layer feeds selectionStart). */
    setCaret: (index: number) => void;
    /**
     * Combined edit (typing): BOTH the new text and the new caret in ONE
     * call. Solid 2 batching makes separate calls read a stale value()
     * (setCaret would filter against the PREVIOUS text) — the UI's input
     * handler must use this.
     */
    setTextAndCaret: (text: string, caret: number) => void;
    caret: () => number;
    /** The trigger state under the current caret. */
    trigger: () => MentionTriggerState;
    /** Suggestions filtered by the active query (empty when inactive). */
    suggestions: () => MentionOption[];
    /** All '@token' mentions present in the current text (antd getMentions). */
    getMentions: () => string[];
    /** IME composition gating. */
    isComposing: () => boolean;
    notifyCompositionStart: () => void;
    notifyCompositionEnd: () => void;
    /** Active (keyboard-highlighted) suggestion value. */
    activeValue: () => string | undefined;
    moveActive: (delta: number) => void;
    setActiveValue: (value: string) => void;
    resetActive: () => void;
    /** Commit the active suggestion (Enter). */
    commitActive: () => void;
    /** Select an option: replaces the active token + trailing space. */
    selectOption: (option: MentionOption) => void;
    /** Open state (the UI trigger owns the DOM). */
    isOpen: () => boolean;
    setOpen: (open: boolean) => void;
    notifyFocus: () => void;
    notifyBlur: () => void;
    isDisabled: () => boolean;
};
/**
 * Parse the mention token under `caret` in `text` (pure — testable).
 * A token is '@' followed by non-whitespace, non-split characters; the
 * caret must sit INSIDE the token (between its start and end+1).
 */
export declare const parseTrigger: (text: string, caret: number, prefix?: string, split?: string) => MentionTriggerState;
/** Extract every mention token in the text (pure — antd getMentions). */
export declare const extractMentions: (text: string, prefix?: string, split?: string) => string[];
export declare const createMentions: (config?: MentionsConfig) => MentionsIns;
export declare const mentionsSplits: (keyof MentionsConfig)[];
