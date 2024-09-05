import { VariantProps } from 'class-variance-authority';

export declare const alertClass: any;
declare const alertMessageVariants: (props?: {
    type?: "default" | "primary" | "danger" | "dashed";
    size?: "small" | "medium" | "large";
} & import('class-variance-authority/dist/types').ClassProp) => string;
export declare const alertMessageClass: (variants: VariantProps<typeof alertMessageVariants>) => any;
declare const alertDescVariants: (props?: {
    type?: "default" | "primary" | "danger" | "dashed";
    size?: "small" | "medium" | "large";
} & import('class-variance-authority/dist/types').ClassProp) => string;
export declare const alertDescClass: (v: VariantProps<typeof alertDescVariants>) => any;
declare const alertIconVariants: (props?: {
    type?: "error" | "info" | "success" | "warning" | "wait";
    size?: "small" | "medium" | "large";
} & import('class-variance-authority/dist/types').ClassProp) => string;
export declare const alertIconClass: (variants: VariantProps<typeof alertIconVariants>) => any;
export {};
