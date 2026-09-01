import { VariantProps } from 'class-variance-authority';
declare const listRootVariants: (props?: ({
    scrollable?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const listItemVariants: (props?: ({
    last?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const listGroupHeaderVariants: (props?: ({
    sticky?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const listLoadingVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const listFooterVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const listRootClass: (variants: VariantProps<typeof listRootVariants>) => string;
export declare const listItemClass: (variants: VariantProps<typeof listItemVariants>) => string;
export declare const listGroupHeaderClass: (variants: VariantProps<typeof listGroupHeaderVariants>) => string;
export declare const listLoadingClass: (variants: VariantProps<typeof listLoadingVariants>) => string;
export declare const listFooterClass: (variants: VariantProps<typeof listFooterVariants>) => string;
export {};
