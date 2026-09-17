declare const rateWrapperVariants: (props?: ({
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const rateWrapperClass: (variants: Parameters<typeof rateWrapperVariants>[0]) => string;
/**
 * One character cell. The cell is relative; the base icon sits full-size,
 * and a half-width overlay (selected-colored) clips on top when the value
 * lands on a half.
 */
export declare const rateCharacterClass: (props?: ({
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const rateCharacterWrapClass: (variants: Parameters<typeof rateCharacterClass>[0]) => string;
/** The base icon layer — full cell, unselected color. */
export declare const rateIconBaseClass: (props?: ({
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const rateIconBaseWrapClass: (variants: Parameters<typeof rateIconBaseClass>[0]) => string;
/**
 * The selected overlay — full cell in primary, clipped by an inline
 * `clip-path: inset(0 X% 0 0)` (left-anchored: 50% for a half, 0% full).
 */
export declare const rateIconFilledClass: (props?: ({
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const rateIconFilledWrapClass: (variants: Parameters<typeof rateIconFilledClass>[0]) => string;
/** The hidden keyboard-focusable listitem wrapper (antd rate is a ul). */
export declare const rateListClass: () => string;
export {};
