import { VariantProps } from 'class-variance-authority';

declare const iconVariants: (props?: {
    size?: "small" | "medium" | "large";
    color?: "primary" | "danger" | "success" | "warning" | "secondary" | "inherit";
    spin?: boolean;
} & import('class-variance-authority/dist/types').ClassProp) => string;
export declare const iconClass: (variants: VariantProps<typeof iconVariants>) => string;
export {};
