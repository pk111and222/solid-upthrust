import { VariantProps } from 'class-variance-authority';
declare const flexVariants: (props?: ({
    vertical?: boolean | null | undefined;
    wrap?: "wrap" | "nowrap" | "wrap-reverse" | null | undefined;
    justify?: "center" | "space-around" | "space-between" | "space-evenly" | "flex-end" | "flex-start" | "normal" | null | undefined;
    align?: "center" | "stretch" | "flex-end" | "flex-start" | "baseline" | "normal" | null | undefined;
    inline?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export type FlexStyleVariants = VariantProps<typeof flexVariants>;
export declare const flexClass: (variants: FlexStyleVariants) => string;
export {};
