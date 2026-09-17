import { VariantProps } from 'class-variance-authority';
/** The floating two-month panel. */
declare const rangePickerDropdownVariants: (props?: ({
    visible?: boolean | null | undefined;
    placement?: "left" | "right" | "bottomLeft" | "bottomRight" | "bottom" | "topLeft" | "topRight" | "top" | "leftTop" | "leftBottom" | "rightTop" | "rightBottom" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const rangePickerDropdownClass: (variants: VariantProps<typeof rangePickerDropdownVariants>) => string;
/** The two panels strip. */
export declare const rangePickerPanelsClass: () => string;
/** One month panel (reuses the DatePicker panel body styles). */
export declare const rangePickerPanelClass: () => string;
/** The input separator ("~"). */
export declare const rangePickerSeparatorClass: () => string;
/**
 * Range day cells — endpoint pills keep the selected background with the
 * OUTER corner fully rounded (antd's capsule effect: the start pill rounds
 * its left corners, the end pill its right); in-range cells wash primary/8.
 */
declare const rangePickerCellVariants: (props?: ({
    selected?: boolean | null | undefined;
    today?: boolean | null | undefined;
    adjacent?: boolean | null | undefined;
    active?: boolean | null | undefined;
    inRange?: boolean | null | undefined;
    hoverInRange?: boolean | null | undefined;
    hoverEndpoint?: boolean | null | undefined;
    'range-start'?: boolean | null | undefined;
    'range-end'?: boolean | null | undefined;
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const rangePickerCellWrapClass: (variants: VariantProps<typeof rangePickerCellVariants>) => string;
/** The input suffix (calendar icon + clear ×) — shared frame, one icon. */
export declare const rangePickerSuffixClass: () => string;
export declare const rangePickerClearClass: (props?: ({
    visible?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const rangePickerClearWrapClass: (variants: VariantProps<typeof rangePickerClearClass>) => string;
/** The per-end input inside the shared frame. */
export declare const rangePickerInputClass: (variants: {
    size?: "small" | "middle" | "large";
}) => string;
export {};
