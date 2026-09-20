import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { SizeType } from '../../common/type';
export interface InputProps {
    /** Input value (controlled); falls back to the surrounding Form.Item. */
    value?: string;
    /** Uncontrolled initial value. */
    defaultValue?: string;
    /**
     * Change handler. Receives the new VALUE (Solid convention, not the DOM
     * event) plus the raw event as a second arg. Wired to Form.Item when set
     * up as its child.
     */
    onChange?: (value: string, event?: Event) => void;
    placeholder?: string;
    disabled?: boolean;
    size?: SizeType;
    /** Prefix icon/text inside the input frame. */
    prefix?: JSX.Element;
    /** Suffix icon/text inside the input frame. */
    suffix?: JSX.Element;
    /** Show a clear button when non-empty. Default false. Can be customized with `{ clearIcon }`. */
    allowClear?: boolean | {
        clearIcon?: JSX.Element;
    };
    /** Override the status derived from Form.Item validateStatus. */
    status?: 'error' | 'warning';
    id?: string;
    name?: string;
    type?: string;
    maxLength?: number;
    /** Character count shown at the end (antd showCount). */
    showCount?: boolean | {
        formatter?: (props: {
            value: string;
            count: number;
            maxLength?: number;
        }) => string;
    };
    readonly?: boolean;
    class?: string;
    style?: JSX.CSSProperties;
    onFocus?: JSX.EventHandler<HTMLInputElement, FocusEvent>;
    onBlur?: JSX.EventHandler<HTMLInputElement, FocusEvent>;
    onPressEnter?: (e: KeyboardEvent) => void;
    onCompositionStart?: JSX.EventHandler<HTMLInputElement, CompositionEvent>;
    onCompositionEnd?: JSX.EventHandler<HTMLInputElement, CompositionEvent>;
    ref?: (el: HTMLInputElement) => void;
}
/**
 * Input — antd-aligned text input.
 *
 * DOM STABILITY CONTRACT (the focus-loss fix): the outer wrapper span is
 * ALWAYS rendered. prefix / suffix / clear icon / count live INSIDE it and
 * toggle with their own <Show> — only siblings after the <input> are added
 * or removed, never the <input> itself and never its parent. antd's own
 * dev warning ("dynamic add or remove prefix/suffix will make it lose
 * focus caused by dom structure change") is exactly the bug this avoids.
 */
declare const Input: Component<InputProps>;
export default Input;
export { default as InputPassword } from './Password';
export type { PasswordProps } from './Password';
export { default as InputTextArea } from './TextArea';
export type { TextAreaProps } from './TextArea';
export { default as InputSearch } from './Search';
export type { SearchProps } from './Search';
