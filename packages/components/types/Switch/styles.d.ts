declare const switchVariants: (props?: ({
    checked?: boolean | null | undefined;
    size?: "small" | "middle" | null | undefined;
    disabled?: boolean | null | undefined;
    loading?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const switchClass: (variants: Parameters<typeof switchVariants>[0]) => string;
/**
 * The handle knob. Position: absolute; the left offset is set inline per
 * checked state (antd: trackPadding 2px ↔ calc(100% - handleSize - 2px))
 * because the two sizes differ — a checked switch is a different element
 * position, not a variant swap.
 */
declare const switchHandleVariants: (props?: ({
    size?: "small" | "middle" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const switchHandleClass: (variants: Parameters<typeof switchHandleVariants>[0]) => string;
/**
 * Inner content (checkedChildren/unCheckedChildren). rc-switch uses a
 * margin-collapsing trick so both spans exist and slide; here the two
 * spans sit in a flex row and the container clips — the visual read is
 * identical (one child visible at a time, sliding with the handle).
 */
declare const switchInnerVariants: (props?: ({
    size?: "small" | "middle" | null | undefined;
    checked?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const switchInnerClass: (variants: Parameters<typeof switchInnerVariants>[0]) => string;
export {};
