import { VariantProps } from 'class-variance-authority';
declare const timeRangePickerDropdownVariants: (props?: ({
    visible?: boolean | null | undefined;
    placement?: "left" | "right" | "bottomLeft" | "bottomRight" | "bottom" | "topLeft" | "topRight" | "top" | "leftTop" | "leftBottom" | "rightTop" | "rightBottom" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const timeRangePickerDropdownClass: (variants: VariantProps<typeof timeRangePickerDropdownVariants>) => string;
/** The two panel groups strip. */
export declare const timeRangePickerPanelsClass: () => string;
/** One end's panel group (columns + the divider slot). */
export declare const timeRangePickerPanelClass: () => string;
/** One end's columns strip (borderless variant of the TimePicker strip). */
export declare const timeRangePickerColumnsClass: () => string;
/** The input separator ("~"). */
export declare const timeRangePickerSeparatorClass: () => string;
/** The shared input suffix (clock icon + clear ×). */
export declare const timeRangePickerSuffixClass: () => string;
/** The per-end input inside the shared frame. */
export declare const timeRangePickerInputClass: (variants: {
    size?: "small" | "middle" | "large";
}) => string;
export {};
