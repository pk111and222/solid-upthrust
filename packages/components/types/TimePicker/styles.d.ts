import { VariantProps } from 'class-variance-authority';
declare const timePickerDropdownVariants: (props?: ({
    visible?: boolean | null | undefined;
    placement?: "left" | "right" | "bottomLeft" | "bottomRight" | "bottom" | "topLeft" | "topRight" | "top" | "leftTop" | "leftBottom" | "rightTop" | "rightBottom" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const timePickerDropdownClass: (variants: VariantProps<typeof timePickerDropdownVariants>) => string;
/** The columns strip. */
export declare const timePickerColumnsClass: () => string;
/** One column. */
export declare const timePickerColumnClass: () => string;
/** One option row. */
export declare const timePickerOptionClass: (props?: ({
    selected?: boolean | null | undefined;
    active?: boolean | null | undefined;
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const timePickerOptionWrapClass: (variants: VariantProps<typeof timePickerOptionClass>) => string;
/** The input suffix (clock icon + clear ×). */
export declare const timePickerSuffixClass: () => string;
export declare const timePickerClearClass: (props?: ({
    visible?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const timePickerClearWrapClass: (variants: VariantProps<typeof timePickerClearClass>) => string;
/** The clock icon. */
export declare const timePickerIconClass: () => string;
export {};
