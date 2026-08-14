import { VariantProps } from 'class-variance-authority';

declare const masonryVariants: (props?: {
    sequential?: boolean;
} & import('class-variance-authority/dist/types').ClassProp) => string;
export declare const masonryClass: (variants: VariantProps<typeof masonryVariants>) => string;
export {};
