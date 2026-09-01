/**
 * Headless logic for Carousel — the slide-index state machine behind the
 * antd/react-slick behaviour subset this library needs:
 *
 *  - index state (controlled `current` prop wins over the internal signal)
 *  - next/prev/goTo with wrap-around (infinite) or clamped (finite) ends
 *  - DIRECTION inference for every transition: the renderer animates the
 *    track differently for forward vs backward moves, and a wrap from the
 *    last slide back to the first must still read as "forward"
 *  - autoplay: a play/pause gate (hover + focus pause it, antd semantics)
 *    and the slide-count guard — autoplay with a single slide never fires
 *
 * Deliberately renderer-owned: the interval/timer itself, the track DOM and
 * any swipe handling. This layer only decides WHICH index is current, WHICH
 * direction the move went, and WHETHER autoplay may run — all pure signal
 * state, fully testable with fake clocks.
 */
export type CarouselDirection = 'forward' | 'backward';
export type CarouselConfig = {
    /** Controlled current index. */
    current?: number;
    defaultCurrent?: number;
    /** Total number of slides. */
    count: number;
    /** Wrap around at the ends. Default true (react-slick infinite). */
    infinite?: boolean;
    /** Autoplay enabled. Default false. */
    autoplay?: boolean;
    /** ms between autoplay advances. Default 3000 (antd). */
    autoplaySpeed?: number;
    /** Pauses autoplay while hovered/focused. Default true (antd). */
    pauseOnHover?: boolean;
    beforeChange?: (from: number, to: number) => void;
    afterChange?: (current: number) => void;
};
export type CarouselIns = {
    /** Current slide index (controlled value wins). */
    current: () => number;
    /** Direction of the LAST transition — drives the track animation. */
    direction: () => CarouselDirection;
    /** Advance one slide. No-op at the end when not infinite. */
    next: () => void;
    /** Go back one slide. No-op at the start when not infinite. */
    prev: () => void;
    /** Jump to an index (clamped). `animate: false` skips the motion. */
    goTo: (index: number, animate?: boolean) => void;
    /** Whether the transition to `current` should animate. */
    animate: () => boolean;
    /** True when autoplay may run (enabled, unpaused, >1 slide). */
    autoplayActive: () => boolean;
    /** Autoplay gate — renderer calls these on hover/focus in and out. */
    pause: () => void;
    resume: () => void;
    /** Whether prev/next are possible (always true when infinite). */
    canPrev: () => boolean;
    canNext: () => boolean;
};
export declare const createCarousel: (config: CarouselConfig) => CarouselIns;
export declare const carouselSplits: (keyof CarouselConfig)[];
