import { VariantProps } from 'class-variance-authority';
declare const masonryVariants: (props?: ({
    gutter?: "small" | "middle" | "large" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const masonryColumnVariants: (props?: ({
    gutter?: "small" | "middle" | "large" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export type MasonryStyleVariants = VariantProps<typeof masonryVariants>;
export declare const masonryClass: (variants: MasonryStyleVariants) => string;
export declare const masonryColumnClass: (variants: VariantProps<typeof masonryColumnVariants>) => string;
export {};
