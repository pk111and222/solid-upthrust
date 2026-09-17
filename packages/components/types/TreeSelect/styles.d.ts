import { VariantProps } from 'class-variance-authority';
declare const selectorVariants: (props?: ({
    size?: "small" | "middle" | "large" | null | undefined;
    open?: boolean | null | undefined;
    disabled?: boolean | null | undefined;
    status?: "error" | "warning" | "default" | null | undefined;
    multiple?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const treeSelectSelectorClass: (variants: VariantProps<typeof selectorVariants>) => string;
/** The inline search input (mirrors Select's). */
export declare const treeSelectSearchInputClass: () => string;
/** The single-mode label / placeholder text. */
export declare const treeSelectItemClass: (variants: {
    state?: "value" | "placeholder";
    size?: "small" | "middle" | "large";
}) => string;
/** A selected tag (multiple). */
declare const treeSelectTagVariants: (props?: ({
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const treeSelectTagWrapClass: (variants: VariantProps<typeof treeSelectTagVariants>) => string;
/** The tag × close button. */
export declare const treeSelectTagCloseWrapClass: () => string;
/** The "+N …" collapsed counter (maxTagCount). */
export declare const treeSelectTagRestClass: () => string;
/** The suffix slot (clear × + down-chevron). */
export declare const treeSelectSuffixWrapClass: () => string;
/** The clear × button. */
export declare const treeSelectClearWrapClass: (variants: {
    visible?: boolean;
}) => string;
/** The down-chevron arrow — rotates 180° while open (antd). */
export declare const treeSelectArrowWrapClass: (variants: {
    open?: boolean;
}) => string;
declare const treeSelectDropdownVariants: (props?: ({
    visible?: boolean | null | undefined;
    placement?: "left" | "right" | "bottomLeft" | "bottomRight" | "bottom" | "topLeft" | "topRight" | "top" | "leftTop" | "leftBottom" | "rightTop" | "rightBottom" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const treeSelectDropdownWrapClass: (variants: VariantProps<typeof treeSelectDropdownVariants>) => string;
/** The empty state. */
export declare const treeSelectEmptyClass: () => string;
export {};
