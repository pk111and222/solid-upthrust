import { VariantProps } from 'class-variance-authority';

declare const layoutVariants: (props?: {
    direction?: "vertical" | "horizontal";
} & import('class-variance-authority/dist/types').ClassProp) => string;
declare const headerVariants: (props?: {} & import('class-variance-authority/dist/types').ClassProp) => string;
declare const footerVariants: (props?: {} & import('class-variance-authority/dist/types').ClassProp) => string;
declare const contentVariants: (props?: {} & import('class-variance-authority/dist/types').ClassProp) => string;
declare const siderVariants: (props?: {
    collapsed?: boolean;
} & import('class-variance-authority/dist/types').ClassProp) => string;
export declare const layoutClass: (variants: VariantProps<typeof layoutVariants>) => string;
export declare const headerClass: (variants: VariantProps<typeof headerVariants>) => string;
export declare const footerClass: (variants: VariantProps<typeof footerVariants>) => string;
export declare const contentClass: (variants: VariantProps<typeof contentVariants>) => string;
export declare const siderClass: (variants: VariantProps<typeof siderVariants>) => string;
export {};
