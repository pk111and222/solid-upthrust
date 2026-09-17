import { Component } from 'solid-js';
import { InputProps } from './index';
export interface PasswordProps extends Omit<InputProps, 'type' | 'suffix' | 'prefix'> {
    /** Whether to show the visibility toggle icon. Default true. */
    visibilityToggle?: boolean;
    /** 'click' (default) or 'hover' triggers the toggle. */
    action?: 'click' | 'hover';
    /** Control the visibility from outside. */
    visible?: boolean;
    onVisibleChange?: (visible: boolean) => void;
}
/**
 * Input.Password — eye-icon visibility toggle riding the base Input.
 *
 * The eye renders as a real suffix through the base component, so the
 * focus-stable DOM contract is inherited for free. antd details preserved:
 * mousedown/mouseup are suppressed on the icon (keeps caret position, see
 * antd #15173/#23524), Enter/Space toggles with a button role.
 *
 * hover action: antd toggles on onMouseOver only (a boolean flip per entry).
 * The "hover out too fast, never toggles back" bug comes from toggling on
 * over alone — a quick sweep enters without leaving, leaving visible=true
 * forever. We pair onMouseOver with onMouseLeave restoring the pre-hover
 * state (antd's own demo lives with the quirk; we fix it).
 */
declare const Password: Component<PasswordProps>;
export default Password;
