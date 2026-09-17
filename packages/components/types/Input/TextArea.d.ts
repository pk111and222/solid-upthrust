import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
export interface TextAreaProps {
    value?: string;
    defaultValue?: string;
    onChange?: (value: string, event?: Event) => void;
    placeholder?: string;
    disabled?: boolean;
    /** Fixed rows when autoSize is off (default 3, antd parity). */
    rows?: number;
    /** Grow with content; { minRows, maxRows } clamps the growth. */
    autoSize?: boolean | {
        minRows?: number;
        maxRows?: number;
    };
    maxLength?: number;
    showCount?: boolean | {
        formatter?: (props: {
            value: string;
            count: number;
            maxLength?: number;
        }) => string;
    };
    allowClear?: boolean;
    status?: 'error' | 'warning';
    id?: string;
    name?: string;
    readonly?: boolean;
    class?: string;
    style?: JSX.CSSProperties;
    onFocus?: JSX.EventHandler<HTMLTextAreaElement, FocusEvent>;
    onBlur?: JSX.EventHandler<HTMLTextAreaElement, FocusEvent>;
    onPressEnter?: (e: KeyboardEvent) => void;
    onResize?: (size: {
        width: number;
        height: number;
    }) => void;
    ref?: (el: HTMLTextAreaElement) => void;
}
/**
 * Input.TextArea — antd-aligned multiline input.
 *
 * autoSize uses the react-textarea-autosize measurement algorithm: a hidden
 * mirror textarea copies the sizing styles, its scrollHeight becomes the
 * content height, min/maxRows clamp it via a single-row measurement. The
 * mirror lives lazily on document.body and is reused across renders.
 */
declare const TextArea: Component<TextAreaProps>;
export default TextArea;
