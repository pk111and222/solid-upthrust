import { VariantProps } from 'class-variance-authority';
declare const statisticVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const statisticTitleVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const statisticValueVariants: (props?: ({
    loading?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const statisticValueIntVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const statisticPrefixSuffixVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const statisticLoadingVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const statisticClass: (variants: VariantProps<typeof statisticVariants>) => string;
export declare const statisticTitleClass: (variants: VariantProps<typeof statisticTitleVariants>) => string;
export declare const statisticValueClass: (variants: VariantProps<typeof statisticValueVariants>) => string;
export declare const statisticValueIntClass: (variants: VariantProps<typeof statisticValueIntVariants>) => string;
export declare const statisticPrefixSuffixClass: (variants: VariantProps<typeof statisticPrefixSuffixVariants>) => string;
export declare const statisticLoadingClass: (variants: VariantProps<typeof statisticLoadingVariants>) => string;
export {};
