declare const inputNumberVariants: (props?: ({
    size?: "small" | "middle" | "large" | null | undefined;
    status?: "error" | "warning" | "default" | null | undefined;
    disabled?: boolean | null | undefined;
    readonly?: boolean | null | undefined;
    focused?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const inputNumberClass: (variants: Parameters<typeof inputNumberVariants>[0]) => string;
/** The inner text input — borderless, native spinners hidden. */
export declare const inputNumberInputClass: (props?: ({
    size?: "small" | "middle" | "large" | null | undefined;
    outOfRange?: boolean | null | undefined;
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const inputNumberInputWrapClass: (variants: Parameters<typeof inputNumberInputClass>[0]) => string;
/** prefix/suffix slot — flex none, self-center, 4px gap. */
export declare const inputNumberAffixClass: (props?: ({
    side?: "prefix" | "suffix" | null | undefined;
    size?: "small" | "middle" | "large" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const inputNumberAffixWrapClass: (variants: Parameters<typeof inputNumberAffixClass>[0]) => string;
/**
 * Up/down actions column — handleWidth 22px (antd: controlHeightSM - 2×lineWidth).
 * Two modes (antd): "input" (the embedded column, revealed on hover/focus,
 * chevrons stacked, separator border between them) and "spinner" (always
 * visible, buttons on both sides). We ship the embedded "input" mode.
 */
export declare const inputNumberActionsClass: (props?: ({
    hidden?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const inputNumberActionsWrapClass: (variants: Parameters<typeof inputNumberActionsClass>[0]) => string;
/** A single up/down action button — colorIcon, hover colorPrimary, active bg. */
export declare const inputNumberActionClass: (props?: ({
    direction?: "up" | "down" | null | undefined;
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const inputNumberActionWrapClass: (variants: Parameters<typeof inputNumberActionClass>[0]) => string;
export {};
