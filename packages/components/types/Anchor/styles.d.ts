import { VariantProps } from 'class-variance-authority';

declare const anchorContainerVariants: (props?: {
    direction?: "vertical" | "horizontal";
} & import('class-variance-authority/dist/types').ClassProp) => string;
declare const anchorLinkVariants: (props?: {
    active?: boolean;
    direction?: "vertical" | "horizontal";
} & import('class-variance-authority/dist/types').ClassProp) => string;
export declare const anchorContainerClass: (variants: VariantProps<typeof anchorContainerVariants>) => string;
export declare const anchorLinkClass: (variants: VariantProps<typeof anchorLinkVariants>) => string;
export {};
