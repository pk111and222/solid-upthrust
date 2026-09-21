declare const checkboxWrapperVariants: (props?: ({
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const checkboxWrapperClass: (variants: Parameters<typeof checkboxWrapperVariants>[0]) => string;
declare const checkboxBoxVariants: (props?: ({
    checked?: boolean | null | undefined;
    indeterminate?: boolean | null | undefined;
    size?: "small" | "middle" | null | undefined;
    disabled?: boolean | null | undefined;
    checkedHover?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const checkboxBoxClass: (variants: Parameters<typeof checkboxBoxVariants>[0]) => string;
/** The checkmark — white, rotated 45°, scale-in (antd ::after). */
export declare const checkboxCheckClass: (props?: ({
    disabled?: boolean | null | undefined;
    size?: "small" | "middle" | null | undefined;
    visible?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const checkboxCheckWrapClass: (variants: Parameters<typeof checkboxCheckClass>[0]) => string;
/** The indeterminate dash — primary, centered (antd ::after 8×8 block). */
export declare const checkboxDashClass: (props?: ({
    size?: "small" | "middle" | null | undefined;
    visible?: boolean | null | undefined;
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const checkboxDashWrapClass: (variants: Parameters<typeof checkboxDashClass>[0]) => string;
/** The hidden native input — opacity-0 but focusable/clickable. */
export declare const checkboxInputClass: () => string;
/** Label text — paddingXS both sides (antd `& + span`). */
export declare const checkboxLabelClass: (props?: ({
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const checkboxLabelWrapClass: (variants: Parameters<typeof checkboxLabelClass>[0]) => string;
/** Group container — inline-flex wrap, columnGap marginXS (8px). */
export declare const checkboxGroupClass: (class_?: string) => string;
export {};
