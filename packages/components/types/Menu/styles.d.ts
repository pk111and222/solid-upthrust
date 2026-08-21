import { VariantProps } from 'class-variance-authority';
declare const menuContainerVariants: (props?: ({
    mode?: "inline" | "horizontal" | "vertical" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const menuItemVariants: (props?: ({
    state?: "idle" | "selected-vertical" | "selected-inline" | "selected-horizontal" | null | undefined;
    disabled?: boolean | null | undefined;
    danger?: boolean | null | undefined;
    mode?: "inline" | "horizontal" | "vertical" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const menuSubPopupVariants: (props?: ({
    open?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const menuSubTitleVariants: (props?: ({
    open?: boolean | null | undefined;
    mode?: "inline" | "horizontal" | "vertical" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const menuGroupTitleVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const menuDividerVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const menuSubContentVariants: (props?: ({
    open?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const menuContainerClass: (variants: VariantProps<typeof menuContainerVariants>) => string;
export declare const menuItemClass: (variants: VariantProps<typeof menuItemVariants>) => string;
export declare const menuSubTitleClass: (variants: VariantProps<typeof menuSubTitleVariants>) => string;
export declare const menuSubPopupClass: (variants: VariantProps<typeof menuSubPopupVariants>) => string;
export declare const menuGroupTitleClass: (variants: VariantProps<typeof menuGroupTitleVariants>) => string;
export declare const menuDividerClass: (variants: VariantProps<typeof menuDividerVariants>) => string;
export declare const menuSubContentClass: (variants: VariantProps<typeof menuSubContentVariants>) => string;
export {};
