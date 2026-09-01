/**
 * Headless logic for Spin — spinning-state management with an optional
 * debounce: when `delay` is set, a `spinning` flip to true only shows the
 * spinner after the delay elapses (a flip to false hides immediately).
 * antd parity: `spinning` prop + `delay` prop + nested-content mode where
 * the spinner overlays the children.
 */
export type SpinConfig = {
    spinning?: boolean;
    /** Debounce before the spinner appears, ms. */
    delay?: number;
};
export type SpinIns = {
    active: () => boolean;
};
export declare const createSpin: (config?: SpinConfig) => {
    active: import('solid-js').SourceAccessor<boolean>;
    dispose: () => void;
    refs: SpinIns;
};
export declare const spinSplits: (keyof SpinConfig)[];
