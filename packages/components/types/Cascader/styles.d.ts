import { VariantProps } from 'class-variance-authority';
declare const selectorVariants: (props?: ({
    size?: "small" | "middle" | "large" | null | undefined;
    open?: boolean | null | undefined;
    disabled?: boolean | null | undefined;
    status?: "error" | "warning" | "default" | null | undefined;
    multiple?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const cascaderSelectorClass: (variants: VariantProps<typeof selectorVariants>) => string;
/** The inline search input (mirrors Select's). */
export declare const cascaderSearchInputClass: () => string;
/** Placeholder / value display. */
export declare const cascaderItemClass: (props?: ({
    state?: "value" | "placeholder" | null | undefined;
    size?: "small" | "middle" | "large" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const cascaderItemWrapClass: (variants: VariantProps<typeof cascaderItemClass>) => string;
/** Suffix area: clear × + the chevron (arrow points right when open). */
export declare const cascaderSuffixClass: (props?: ({
    size?: "small" | "middle" | "large" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const cascaderSuffixWrapClass: (variants: VariantProps<typeof cascaderSuffixClass>) => string;
export declare const cascaderArrowClass: (props?: ({
    open?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const cascaderArrowWrapClass: (variants: VariantProps<typeof cascaderArrowClass>) => string;
export declare const cascaderClearClass: (props?: ({
    visible?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const cascaderClearWrapClass: (variants: VariantProps<typeof cascaderClearClass>) => string;
export declare const cascaderTagClass: (props?: ({
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const cascaderTagWrapClass: (variants: VariantProps<typeof cascaderTagClass>) => string;
export declare const cascaderTagCloseClass: (props?: ({
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const cascaderTagCloseWrapClass: (variants: VariantProps<typeof cascaderTagCloseClass>) => string;
export declare const cascaderTagRestClass: () => string;
/** The floating panel: columns strip horizontally. */
export declare const cascaderDropdownClass: (props?: ({
    visible?: boolean | null | undefined;
    placement?: "left" | "right" | "bottomLeft" | "bottomRight" | "bottom" | "topLeft" | "topRight" | "top" | "leftTop" | "leftBottom" | "rightTop" | "rightBottom" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const cascaderDropdownWrapClass: (variants: VariantProps<typeof cascaderDropdownClass>) => string;
/** The columns strip: horizontal flex, each column scrolls independently. */
export declare const cascaderColumnsClass: () => string;
/** One menu column. */
export declare const cascaderColumnClass: () => string;
/** One menu row. */
export declare const cascaderOptionClass: (props?: ({
    selected?: boolean | null | undefined;
    active?: boolean | null | undefined;
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const cascaderOptionWrapClass: (variants: VariantProps<typeof cascaderOptionClass>) => string;
/** The expand chevron on rows with children. */
export declare const cascaderOptionExpandClass: (props?: ({
    active?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const cascaderOptionExpandWrapClass: (variants: VariantProps<typeof cascaderOptionExpandClass>) => string;
/** The check box in checkable mode (visual box + derived state). */
export declare const cascaderCheckboxClass: (props?: ({
    state?: "checked" | "indeterminate" | "unchecked" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const cascaderCheckboxWrapClass: (variants: VariantProps<typeof cascaderCheckboxClass>) => string;
/** The check mark / dash inside the box. */
export declare const cascaderCheckboxMarkClass: (props?: ({
    state?: "checked" | "indeterminate" | "unchecked" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const cascaderCheckboxMarkWrapClass: (variants: VariantProps<typeof cascaderCheckboxMarkClass>) => string;
/** The search input row at the top of the panel (antd renders it inside). */
export declare const cascaderPanelSearchClass: () => string;
export declare const cascaderPanelSearchInputClass: () => string;
/** The flat search result rows (path joined with ' / '). */
export declare const cascaderSearchItemClass: (props?: ({
    selected?: boolean | null | undefined;
    active?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const cascaderSearchItemWrapClass: (variants: VariantProps<typeof cascaderSearchItemClass>) => string;
/** Empty / no-match block. */
export declare const cascaderEmptyClass: () => string;
export {};
