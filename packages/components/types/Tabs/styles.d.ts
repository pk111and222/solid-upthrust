import { VariantProps } from 'class-variance-authority';

declare const tabsContainerVariants: (props?: {
    tabPosition?: "left" | "right" | "bottom" | "top";
} & import('class-variance-authority/dist/types').ClassProp) => string;
declare const tabBarVariants: (props?: {
    tabPosition?: "left" | "right" | "bottom" | "top";
    type?: "line" | "card";
    centered?: boolean;
} & import('class-variance-authority/dist/types').ClassProp) => string;
declare const tabItemVariants: (props?: {
    active?: boolean;
    disabled?: boolean;
    type?: "line" | "card";
    size?: "small" | "large" | "middle";
} & import('class-variance-authority/dist/types').ClassProp) => string;
declare const tabInkBarVariants: (props?: {
    tabPosition?: "left" | "right" | "bottom" | "top";
} & import('class-variance-authority/dist/types').ClassProp) => string;
declare const tabPanelVariants: (props?: {} & import('class-variance-authority/dist/types').ClassProp) => string;
export declare const tabsContainerClass: (variants: VariantProps<typeof tabsContainerVariants>) => string;
export declare const tabBarClass: (variants: VariantProps<typeof tabBarVariants>) => string;
export declare const tabItemClass: (variants: VariantProps<typeof tabItemVariants>) => string;
export declare const tabInkBarClass: (variants: VariantProps<typeof tabInkBarVariants>) => string;
export declare const tabPanelClass: (variants: VariantProps<typeof tabPanelVariants>) => string;
export {};
