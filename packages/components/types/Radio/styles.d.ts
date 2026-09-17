declare const radioWrapperVariants: (props?: ({
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const radioWrapperClass: (variants: Parameters<typeof radioWrapperVariants>[0]) => string;
declare const radioDotVariants: (props?: ({
    checked?: boolean | null | undefined;
    size?: "small" | "middle" | null | undefined;
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const radioDotClass: (variants: Parameters<typeof radioDotVariants>[0]) => string;
/** The inner dot — primary, scale-in when checked (antd ::after 8×8). */
export declare const radioInnerDotClass: (props?: ({
    size?: "small" | "middle" | null | undefined;
    visible?: boolean | null | undefined;
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const radioInnerDotWrapClass: (variants: Parameters<typeof radioInnerDotClass>[0]) => string;
/** The hidden native input — opacity-0 but focusable/clickable. */
export declare const radioInputClass: () => string;
/** Label text — paddingXS both sides (antd `& + span`). */
export declare const radioLabelClass: (props?: ({
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const radioLabelWrapClass: (variants: Parameters<typeof radioLabelClass>[0]) => string;
/** Group container — inline-flex wrap, columnGap marginXS (8px). */
export declare const radioGroupClass: (class_?: string) => string;
export declare const radioButtonVariants: (props?: ({
    checked?: boolean | null | undefined;
    position?: "middle" | "first" | "last" | null | undefined;
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const radioButtonClass: (variants: Parameters<typeof radioButtonVariants>[0]) => string;
/** The hidden input inside a button-style radio. */
export declare const radioButtonInputClass: () => string;
/** Button group container — inline-flex, no wrap (a segmented strip). */
export declare const radioButtonGroupClass: (class_?: string) => string;
export {};
