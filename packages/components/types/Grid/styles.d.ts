import { VariantProps } from 'class-variance-authority';
declare const rowVariants: (props?: ({
    justify?: "start" | "end" | "space-around" | "space-between" | "space-evenly" | "center" | null | undefined;
    align?: "middle" | "stretch" | "bottom" | "top" | null | undefined;
    wrap?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const colVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export type RowStyleVariants = VariantProps<typeof rowVariants>;
export declare const rowClass: (variants: RowStyleVariants) => string;
export declare const colClass: (variants: VariantProps<typeof colVariants>) => string;
export {};
