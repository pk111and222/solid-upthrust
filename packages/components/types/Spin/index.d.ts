import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { SizeType } from '../../common/type';
export interface SpinProps {
    /** Spinner state; defaults true (a bare <Spin /> spins). */
    spinning?: boolean;
    /** Debounce before the spinner appears, ms — avoids flicker on fast loads. */
    delay?: number;
    size?: SizeType;
    /** Text under the spinner (standalone mode) or over the backdrop (nested). */
    tip?: JSX.Element;
    /** Custom indicator node replaces the default ring. */
    indicator?: JSX.Element;
    /** Nested mode: children get the spinner overlay while spinning. */
    children?: JSX.Element;
    wrapperClass?: string;
    class?: string;
    style?: JSX.CSSProperties;
}
/**
 * Spin keeps no headless counterpart — the only "logic" is a small debounced
 * visibility state, inlined here:
 *  - `delay` defers the spinner's APPEARANCE (a flip to false hides
 *    immediately — antd semantics)
 *  - the initial appearance is debounced too when spinning starts on
 *    mount with a delay configured
 */
declare const Spin: Component<SpinProps>;
export default Spin;
