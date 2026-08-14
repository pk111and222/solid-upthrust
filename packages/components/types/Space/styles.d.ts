import { VariantProps } from 'class-variance-authority';

declare const spaceVariants: (props?: {
    direction?: "vertical" | "horizontal";
    wrap?: boolean;
    align?: "start" | "end" | "center" | "baseline";
    block?: boolean;
} & import('class-variance-authority/dist/types').ClassProp) => string;
declare const compactVariants: (props?: {
    direction?: "vertical" | "horizontal";
    block?: boolean;
} & import('class-variance-authority/dist/types').ClassProp) => string;
export declare const spaceClass: (variants: VariantProps<typeof spaceVariants>) => string;
export declare const compactClass: (variants: VariantProps<typeof compactVariants>) => string;
export {};
