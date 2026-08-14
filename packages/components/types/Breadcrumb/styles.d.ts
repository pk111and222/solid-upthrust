import { VariantProps } from 'class-variance-authority';

declare const breadcrumbVariants: (props?: {} & import('class-variance-authority/dist/types').ClassProp) => string;
declare const breadcrumbItemVariants: (props?: {
    active?: boolean;
} & import('class-variance-authority/dist/types').ClassProp) => string;
declare const breadcrumbSeparatorVariants: (props?: {} & import('class-variance-authority/dist/types').ClassProp) => string;
export declare const breadcrumbClass: (variants: VariantProps<typeof breadcrumbVariants>) => string;
export declare const breadcrumbItemClass: (variants: VariantProps<typeof breadcrumbItemVariants>) => string;
export declare const breadcrumbSeparatorClass: (variants: VariantProps<typeof breadcrumbSeparatorVariants>) => string;
export {};
