import { VariantProps } from 'class-variance-authority';
declare const collapseRootVariants: (props?: ({
    bordered?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const collapsePanelVariants: (props?: ({
    bordered?: boolean | null | undefined;
    last?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const collapseHeaderVariants: (props?: ({
    ghost?: boolean | null | undefined;
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const collapseHeaderLabelVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const collapseRegionVariants: (props?: ({
    open?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const collapseContentVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const collapseContentInnerVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const collapseExpandIconVariants: (props?: ({
    open?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const collapseRootClass: (variants: VariantProps<typeof collapseRootVariants>) => string;
export declare const collapsePanelClass: (variants: VariantProps<typeof collapsePanelVariants>) => string;
export declare const collapseHeaderClass: (variants: VariantProps<typeof collapseHeaderVariants>) => string;
export declare const collapseHeaderLabelClass: (variants: VariantProps<typeof collapseHeaderLabelVariants>) => string;
export declare const collapseRegionClass: (variants: VariantProps<typeof collapseRegionVariants>) => string;
export declare const collapseContentClass: (variants: VariantProps<typeof collapseContentVariants>) => string;
export declare const collapseContentInnerClass: (variants: VariantProps<typeof collapseContentInnerVariants>) => string;
export declare const collapseExpandIconClass: (variants: VariantProps<typeof collapseExpandIconVariants>) => string;
export declare const COLLAPSE_EXPAND_ICON = "i-mdi-chevron-right";
export {};
