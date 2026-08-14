import { VariantProps } from 'class-variance-authority';

declare const rowVariants: (props?: {
    justify?: "start" | "end" | "space-around" | "space-between" | "space-evenly" | "center";
    align?: "stretch" | "middle" | "bottom" | "top";
    wrap?: boolean;
} & import('class-variance-authority/dist/types').ClassProp) => string;
declare const colVariants: (props?: {} & import('class-variance-authority/dist/types').ClassProp) => string;
export declare const rowClass: (variants: VariantProps<typeof rowVariants>) => string;
export declare const colClass: (variants: VariantProps<typeof colVariants>) => string;
export {};
