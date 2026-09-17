import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { SizeType } from '../../common/type';
export interface SwitchProps {
    /** Controlled checked. */
    checked?: boolean;
    defaultChecked?: boolean;
    /** Alias of checked. */
    value?: boolean;
    defaultValue?: boolean;
    checkedChildren?: JSX.Element;
    unCheckedChildren?: JSX.Element;
    disabled?: boolean;
    loading?: boolean;
    size?: SizeType;
    id?: string;
    autofocus?: boolean;
    name?: string;
    class?: string;
    style?: JSX.CSSProperties;
    onChange?: (checked: boolean, event?: Event) => void;
    onClick?: (checked: boolean, event: Event) => void;
    ref?: (el: HTMLButtonElement) => void;
}
/**
 * Switch — the antd-style toggle.
 *
 * The headless createSwitch owns the checked state machine (controlled or
 * not, loading/disabled gates); this layer renders the track + sliding
 * handle. Form.Item integration: the value is boolean — context fills
 * checked/disabled/id; onChange receives `checked` (value-first contract).
 */
declare const Switch: Component<SwitchProps>;
export default Switch;
