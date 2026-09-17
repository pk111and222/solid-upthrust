import { VariantProps } from 'class-variance-authority';
/** The floating calendar panel. */
export declare const datePickerDropdownClass: (variants: {
    visible?: boolean;
    placement?: string;
}) => string;
/** Panel header bar. */
export declare const datePickerHeaderClass: () => string;
/** The year/month label buttons (drill into month/year mode). */
export declare const datePickerHeaderLabelClass: () => string;
/** Prev/next arrow buttons. */
export declare const datePickerHeaderNavClass: (props?: ({
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const datePickerHeaderNavWrapClass: (variants: VariantProps<typeof datePickerHeaderNavClass>) => string;
/** The weekday header row. */
export declare const datePickerWeekHeaderClass: () => string;
export declare const datePickerWeekHeaderCellClass: () => string;
/** The 6×7 day grid. */
export declare const datePickerGridClass: () => string;
declare const datePickerCellVariants: (props?: ({
    selected?: boolean | null | undefined;
    today?: boolean | null | undefined;
    adjacent?: boolean | null | undefined;
    active?: boolean | null | undefined;
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const datePickerCellWrapClass: (variants: VariantProps<typeof datePickerCellVariants>) => string;
/** The month/year list grids (12 cells: 4 rows × 3 cols). */
export declare const datePickerListClass: () => string;
declare const datePickerMonthCellVariants: (props?: ({
    selected?: boolean | null | undefined;
    active?: boolean | null | undefined;
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const datePickerMonthCellWrapClass: (variants: VariantProps<typeof datePickerMonthCellVariants>) => string;
/** Footer bar (今天 button). */
export declare const datePickerFooterClass: () => string;
export declare const datePickerTodayBtnClass: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const datePickerTodayBtnWrapClass: () => string;
/** The input suffix (calendar icon + clear ×). */
export declare const datePickerSuffixClass: () => string;
export declare const datePickerClearClass: (props?: ({
    visible?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const datePickerClearWrapClass: (variants: VariantProps<typeof datePickerClearClass>) => string;
export {};
