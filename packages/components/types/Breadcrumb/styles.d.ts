import { VariantProps } from 'class-variance-authority';
declare const breadcrumbVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const breadcrumbItemVariants: (props?: ({
    active?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const breadcrumbLinkVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const breadcrumbSeparatorVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const breadcrumbClass: (variants: VariantProps<typeof breadcrumbVariants>) => string;
export declare const breadcrumbItemClass: (variants: VariantProps<typeof breadcrumbItemVariants>) => string;
export declare const breadcrumbLinkClass: (variants: VariantProps<typeof breadcrumbLinkVariants>) => string;
export declare const breadcrumbSeparatorClass: (variants: VariantProps<typeof breadcrumbSeparatorVariants>) => string;
export {};
