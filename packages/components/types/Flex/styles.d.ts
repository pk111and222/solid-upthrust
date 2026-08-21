import { VariantProps } from 'class-variance-authority';
declare const flexVariants: (props?: ({
    vertical?: boolean | null | undefined;
    wrap?: "nowrap" | "wrap" | "wrap-reverse" | null | undefined;
    justify?: "space-around" | "space-between" | "space-evenly" | "center" | "flex-end" | "flex-start" | "normal" | null | undefined;
    align?: "stretch" | "center" | "flex-end" | "flex-start" | "baseline" | "normal" | null | undefined;
    inline?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export type FlexStyleVariants = VariantProps<typeof flexVariants>;
export declare const flexClass: (variants: FlexStyleVariants) => string;
export {};
