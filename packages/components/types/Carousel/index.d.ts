import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { CarouselIns } from 'upthrust-competence';
export interface CarouselProps {
    /** Slide content; array order = slide order. */
    children?: JSX.Element;
    /** Controlled current index. */
    current?: number;
    defaultCurrent?: number;
    /** Autoplay. Default false. */
    autoplay?: boolean;
    /** ms between autoplay advances. Default 3000. */
    autoplaySpeed?: number;
    /** Pause autoplay on hover (and focus). Default true. */
    pauseOnHover?: boolean;
    /** Wrap around at the ends. Default true. */
    infinite?: boolean;
    /**
     * Slide along the vertical axis: the track becomes a column, arrows move
     * to the top/bottom edges (chevrons up/down) and the dots sit on the right
     * edge as a column (react-slick vertical placement).
     */
    vertical?: boolean;
    /** Show prev/next arrows. Default true. */
    arrows?: boolean;
    /** Show the dot indicators. Default true. */
    dots?: boolean;
    /**
     * Dots inside the slide area (bottom for horizontal, right for vertical)
     * or outside it (below / to the side). Default 'inner'.
     */
    dotPosition?: 'inner' | 'outer';
    /** Fixed slide height, px or CSS length. Default 160 (antd demo height). */
    height?: number | string;
    beforeChange?: (from: number, to: number) => void;
    afterChange?: (current: number) => void;
    class?: string;
    ref?: (val: CarouselIns) => void;
}
declare const Carousel: Component<CarouselProps>;
export default Carousel;
