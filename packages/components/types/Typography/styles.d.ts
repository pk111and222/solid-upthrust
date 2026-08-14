import { VariantProps } from 'class-variance-authority';

export declare const typographyVariants: (props?: {
    type?: "danger" | "success" | "warning" | "secondary";
    disabled?: boolean;
    ellipsis?: boolean;
} & import('class-variance-authority/dist/types').ClassProp) => string;
export declare const titleVariants: (props?: {
    level?: 1 | 2 | 3 | 4 | 5;
} & import('class-variance-authority/dist/types').ClassProp) => string;
export declare const linkVariants: (props?: {
    disabled?: boolean;
} & import('class-variance-authority/dist/types').ClassProp) => string;
export declare const paragraphVariants: (props?: {} & import('class-variance-authority/dist/types').ClassProp) => string;
export declare const typographyClass: (variants: VariantProps<typeof typographyVariants>) => string;
export declare const titleClass: (variants: VariantProps<typeof titleVariants>) => string;
export declare const linkClass: (variants: VariantProps<typeof linkVariants>) => string;
export declare const paragraphClass: (variants: VariantProps<typeof paragraphVariants>) => string;
