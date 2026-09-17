declare const sliderWrapperVariants: (props?: ({
    disabled?: boolean | null | undefined;
    vertical?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const sliderWrapperClass: (variants: Parameters<typeof sliderWrapperVariants>[0]) => string;
/** The groove — full-length background rail. Horizontal: centered on the
 *  wrapper's midline (the h-control row is taller than the 4px rail). */
export declare const sliderRailClass: (props?: ({
    vertical?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const sliderRailWrapClass: (variants: Parameters<typeof sliderRailClass>[0]) => string;
/** The filled selection between the two handles. Same midline centering. */
export declare const sliderTrackClass: (props?: ({
    vertical?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const sliderTrackWrapClass: (variants: Parameters<typeof sliderTrackClass>[0]) => string;
/** The draggable thumb. */
export declare const sliderHandleClass: (props?: ({
    dragging?: boolean | null | undefined;
    size?: "middle" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const sliderHandleWrapClass: (variants: Parameters<typeof sliderHandleClass>[0]) => string;
/** A mark dot on the rail. */
export declare const sliderMarkDotClass: (props?: ({
    passed?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const sliderMarkDotWrapClass: (variants: Parameters<typeof sliderMarkDotClass>[0]) => string;
/** A mark label below the rail. */
export declare const sliderMarkLabelClass: (props?: ({
    passed?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const sliderMarkLabelWrapClass: (variants: Parameters<typeof sliderMarkLabelClass>[0]) => string;
export {};
