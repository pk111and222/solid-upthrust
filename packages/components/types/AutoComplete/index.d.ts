import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { AutoCompleteOption } from 'upthrust-competence';
import { SizeType } from '../../common/type';
export type { AutoCompleteOption };
export interface AutoCompleteProps {
    /** Controlled text value. */
    value?: string;
    defaultValue?: string;
    /** The suggestion pool (client-filtered) or the current server list. */
    options?: AutoCompleteOption[];
    disabled?: boolean;
    /** (input, option) => boolean; false disables client filtering. */
    filterOption?: ((input: string, option: AutoCompleteOption) => boolean) | false;
    placeholder?: string;
    size?: SizeType;
    status?: 'error' | 'warning';
    /** Controlled dropdown open. */
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    id?: string;
    name?: string;
    class?: string;
    style?: JSX.CSSProperties;
    onChange?: (value: string) => void;
    onSelect?: (value: string, option: AutoCompleteOption) => void;
    onSearch?: (value: string) => void;
    onFocus?: (e: FocusEvent) => void;
    onBlur?: (e: FocusEvent) => void;
    ref?: (el: HTMLInputElement) => void;
}
/**
 * AutoComplete — the antd-style text input with suggestions.
 *
 * COMPOSITION: the headless createAutoComplete owns the text buffer (IME
 * gated), the filtered suggestions and the active-row keyboard navigation —
 * the same contract as Select minus the selection store (the value is free
 * text). The dropdown layer is createTrigger. This layer renders a plain
 * Input frame and the suggestion listbox.
 */
declare const AutoComplete: Component<AutoCompleteProps>;
export default AutoComplete;
