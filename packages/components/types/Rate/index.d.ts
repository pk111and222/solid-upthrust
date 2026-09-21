import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
export interface RateProps {
    /** Controlled rating. */
    value?: number;
    defaultValue?: number;
    /** Number of characters. Default 5. */
    count?: number;
    /** Allow half-star values. */
    allowHalf?: boolean;
    /** Re-clicking the current value resets to 0. */
    allowClear?: boolean;
    disabled?: boolean;
    /** Custom character (defaults to a star icon). */
    character?: JSX.Element;
    /** Auto-focus the character container after mounting. */
    autoFocus?: boolean;
    /** Accessible name for the rating group. */
    'aria-label'?: string;
    /** Visible label element ID for the rating group. */
    'aria-labelledby'?: string;
    id?: string;
    class?: string;
    style?: JSX.CSSProperties;
    onChange?: (value: number) => void;
    onHoverChange?: (value: number) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    ref?: (el: HTMLUListElement) => void;
}
/**
 * Rate — the antd-style star rater.
 *
 * The headless createRate rides the SHARED createNumericValue machine
 * (min=0, max=count, step=0.5|1 — the same engine under InputNumber and
 * Slider). This layer renders the characters and feeds pointer positions:
 * each cell reports a fractional position (n - 0.5 for the left half, n
 * for the right) which the machine snaps to the lattice.
 */
declare const Rate: Component<RateProps>;
export default Rate;
