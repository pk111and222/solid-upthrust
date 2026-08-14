import { VariantProps } from 'class-variance-authority';

declare const flexVariants: (props?: {
    vertical?: boolean;
    wrap?: "nowrap" | "wrap" | "wrap-reverse";
    justify?: "space-around" | "space-between" | "space-evenly" | "center" | "flex-end" | "flex-start" | "normal";
    align?: "stretch" | "center" | "flex-end" | "flex-start" | "baseline" | "normal";
    inline?: boolean;
} & import('class-variance-authority/dist/types').ClassProp) => string;
export declare const flexClass: (variants: VariantProps<typeof flexVariants>) => string;
export {};
