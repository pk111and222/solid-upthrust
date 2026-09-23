import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { MentionOption } from 'upthrust-competence';
export type { MentionOption };
export interface MentionsProps {
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
    placeholder?: string;
    /** Fixed rows for the textarea. Default 3. */
    rows?: number;
    status?: 'error' | 'warning';
    /** Controlled dropdown open. */
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    id?: string;
    name?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    class?: string;
    style?: JSX.CSSProperties;
    onChange?: (value: string) => void;
    onSelect?: (option: MentionOption, prefix: string) => void;
    onSearch?: (text: string, prefix: string) => void;
    onFocus?: (e: FocusEvent) => void;
    onBlur?: (e: FocusEvent) => void;
    ref?: (el: HTMLTextAreaElement) => void;
}
/**
 * Mentions — the antd-style @-mention textarea.
 *
 * COMPOSITION: the headless createMentions owns the text buffer (IME
 * gated), caret-aware trigger detection ('@token' under the caret via
 * parseTrigger), query filtering, active-row navigation and the
 * token-replacement insertion. The dropdown layer is createTrigger; the
 * open state is DERIVED (dropdown follows trigger activity — no manual
 * open management). This layer renders a TextArea frame + the suggestion
 * listbox.
 */
declare const Mentions: Component<MentionsProps>;
export default Mentions;
