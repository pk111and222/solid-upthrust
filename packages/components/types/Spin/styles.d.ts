import { VariantProps } from 'class-variance-authority';
declare const spinIndicatorVariants: (props?: ({
    size?: "small" | "middle" | "large" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const spinNestedVariants: (props?: ({
    spinning?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const spinWrapperVariants: (props?: ({
    spinning?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const spinBackdropVariants: (props?: ({
    spinning?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const spinTipVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const spinContainerVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const spinIndicatorClass: (variants: VariantProps<typeof spinIndicatorVariants>) => string;
export declare const spinNestedClass: (variants: VariantProps<typeof spinNestedVariants>) => string;
export declare const spinWrapperClass: (variants: VariantProps<typeof spinWrapperVariants>) => string;
export declare const spinBackdropClass: (variants: VariantProps<typeof spinBackdropVariants>) => string;
export declare const spinTipClass: (variants: VariantProps<typeof spinTipVariants>) => string;
export declare const spinContainerClass: (variants: VariantProps<typeof spinContainerVariants>) => string;
export {};
