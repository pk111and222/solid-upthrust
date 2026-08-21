import { VariantProps } from 'class-variance-authority';
declare const emptyVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const emptyDescriptionVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const emptyFooterVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const emptyClass: (variants: VariantProps<typeof emptyVariants>) => string;
export declare const emptyDescriptionClass: (variants: VariantProps<typeof emptyDescriptionVariants>) => string;
export declare const emptyFooterClass: (variants: VariantProps<typeof emptyFooterVariants>) => string;
export {};
