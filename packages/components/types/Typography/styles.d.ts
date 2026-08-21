import { VariantProps } from 'class-variance-authority';
export declare const typographyVariants: (props?: ({
    type?: "danger" | "success" | "warning" | "secondary" | null | undefined;
    disabled?: boolean | null | undefined;
    ellipsis?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const titleVariants: (props?: ({
    level?: 1 | 2 | 3 | 4 | 5 | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const linkVariants: (props?: ({
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const paragraphVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const typographyClass: (variants: VariantProps<typeof typographyVariants>) => string;
export declare const titleClass: (variants: VariantProps<typeof titleVariants>) => string;
export declare const linkClass: (variants: VariantProps<typeof linkVariants>) => string;
export declare const paragraphClass: (variants: VariantProps<typeof paragraphVariants>) => string;
