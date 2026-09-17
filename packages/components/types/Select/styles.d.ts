import { VariantProps } from 'class-variance-authority';
declare const selectorVariants: (props?: ({
    size?: "small" | "middle" | "large" | null | undefined;
    open?: boolean | null | undefined;
    disabled?: boolean | null | undefined;
    status?: "error" | "warning" | "default" | null | undefined;
    multiple?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const selectorClass: (variants: VariantProps<typeof selectorVariants>) => string;
/** The inline search input (mirrors Input's innerInput). */
export declare const searchInputClass: () => string;
/** Placeholder / single-value display text. */
export declare const selectionItemClass: (props?: ({
    state?: "value" | "placeholder" | null | undefined;
    size?: "small" | "middle" | "large" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const selectionItemWrapClass: (variants: VariantProps<typeof selectionItemClass>) => string;
/** The suffix area: clear × and/or the down chevron. */
export declare const selectorSuffixClass: (props?: ({
    size?: "small" | "middle" | "large" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const selectorSuffixWrapClass: (variants: VariantProps<typeof selectorSuffixClass>) => string;
/** The down-chevron arrow — rotates 180° while open (antd). */
export declare const selectorArrowClass: (props?: ({
    open?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const selectorArrowWrapClass: (variants: VariantProps<typeof selectorArrowClass>) => string;
/** The clear × (appears on hover when allowClear and non-empty). */
export declare const selectorClearClass: (props?: ({
    visible?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const selectorClearWrapClass: (variants: VariantProps<typeof selectorClearClass>) => string;
export declare const selectTagClass: (props?: ({
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const selectTagWrapClass: (variants: VariantProps<typeof selectTagClass>) => string;
export declare const selectTagCloseClass: (props?: ({
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const selectTagCloseWrapClass: (variants: VariantProps<typeof selectTagCloseClass>) => string;
/** The "+N …" overflow chip (maxTagCount). */
export declare const selectTagRestClass: () => string;
/** The floating listbox — same overlay family as Dropdown. */
export declare const selectDropdownClass: (props?: ({
    visible?: boolean | null | undefined;
    placement?: "left" | "right" | "bottomLeft" | "bottomRight" | "bottom" | "topLeft" | "topRight" | "top" | "leftTop" | "leftBottom" | "rightTop" | "rightBottom" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const selectDropdownWrapClass: (variants: VariantProps<typeof selectDropdownClass> & {
    maxHeight?: string;
}) => string;
/** One option row. */
export declare const selectOptionClass: (props?: ({
    selected?: boolean | null | undefined;
    active?: boolean | null | undefined;
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const selectOptionWrapClass: (variants: VariantProps<typeof selectOptionClass>) => string;
/** The check mark next to a selected option. */
export declare const selectOptionCheckClass: (props?: ({
    visible?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const selectOptionCheckWrapClass: (variants: VariantProps<typeof selectOptionCheckClass>) => string;
/** The not-found block. */
export declare const selectEmptyClass: () => string;
export {};
