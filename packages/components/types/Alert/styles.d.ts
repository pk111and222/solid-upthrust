import { VariantProps } from 'class-variance-authority';

export declare const alertClass: (v: VariantProps<(props?: {
    type?: "default" | "primary" | "danger" | "dashed";
    size?: "small" | "medium" | "large";
    banner?: boolean;
} & import('class-variance-authority/dist/types').ClassProp) => string>) => string;
export declare const alertMessageClass: (v: VariantProps<(props?: {
    type?: "default" | "primary" | "danger" | "dashed";
    size?: "small" | "medium" | "large";
} & import('class-variance-authority/dist/types').ClassProp) => string>) => string;
export declare const alertDescClass: (v: VariantProps<(props?: {
    type?: "default" | "primary" | "danger" | "dashed";
    size?: "small" | "medium" | "large";
} & import('class-variance-authority/dist/types').ClassProp) => string>) => string;
export declare const alertIconClass: (v: VariantProps<(props?: {
    type?: "info" | "success" | "warning" | "error" | "wait";
    size?: "small" | "medium" | "large";
} & import('class-variance-authority/dist/types').ClassProp) => string>) => string;
