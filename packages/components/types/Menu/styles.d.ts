import { VariantProps } from 'class-variance-authority';

declare const menuContainerVariants: (props?: {
    mode?: "inline" | "vertical" | "horizontal";
} & import('class-variance-authority/dist/types').ClassProp) => string;
declare const menuItemVariants: (props?: {
    selected?: boolean;
    disabled?: boolean;
    danger?: boolean;
    mode?: "inline" | "vertical" | "horizontal";
} & import('class-variance-authority/dist/types').ClassProp) => string;
declare const menuSubTitleVariants: (props?: {
    open?: boolean;
} & import('class-variance-authority/dist/types').ClassProp) => string;
declare const menuGroupTitleVariants: (props?: {} & import('class-variance-authority/dist/types').ClassProp) => string;
declare const menuDividerVariants: (props?: {} & import('class-variance-authority/dist/types').ClassProp) => string;
declare const menuSubContentVariants: (props?: {
    open?: boolean;
} & import('class-variance-authority/dist/types').ClassProp) => string;
export declare const menuContainerClass: (variants: VariantProps<typeof menuContainerVariants>) => string;
export declare const menuItemClass: (variants: VariantProps<typeof menuItemVariants>) => string;
export declare const menuSubTitleClass: (variants: VariantProps<typeof menuSubTitleVariants>) => string;
export declare const menuGroupTitleClass: (variants: VariantProps<typeof menuGroupTitleVariants>) => string;
export declare const menuDividerClass: (variants: VariantProps<typeof menuDividerVariants>) => string;
export declare const menuSubContentClass: (variants: VariantProps<typeof menuSubContentVariants>) => string;
export {};
