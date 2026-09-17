import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { FloatButtonDirection } from 'upthrust-competence';
export interface FloatButtonGroupProps {
    /** Which way the fan opens from the trigger. Default 'up'. */
    direction?: FloatButtonDirection;
    /** Trigger icon. */
    icon?: JSX.Element;
    /** Start expanded. */
    defaultOpen?: boolean;
    /** Controlled expansion. */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Corner anchor. Default 'rt'. */
    placement?: 'rt' | 'rb' | 'lt' | 'lb';
    shape?: 'circle' | 'square';
    size?: 'middle' | 'large';
    /** Tooltip on the trigger. */
    tooltip?: JSX.Element;
    class?: string;
    style?: JSX.CSSProperties;
    children: JSX.Element;
}
/**
 * FloatButton.Group — the collapsed stack that fans its children out along
 * `direction`. The trigger is the visual base of the stack (renders LAST in
 * the flex column so it sits at the bottom when fanning up); children ride
 * the fan with a per-child stagger (inline transition-delay).
 */
declare const FloatButtonGroup: Component<FloatButtonGroupProps>;
export default FloatButtonGroup;
