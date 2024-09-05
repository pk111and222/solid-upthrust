import { VariantProps } from 'class-variance-authority';

declare const buttonVariants: (props?: {
    type?: "default" | "primary" | "danger" | "link" | "text" | "dashed";
    size?: "small" | "medium" | "large";
    shape?: "rounded" | "square" | "circle";
    disabled?: boolean;
    block?: boolean;
    loading?: boolean;
} & import('class-variance-authority/dist/types').ClassProp) => string;
export declare const buttonClass: (variants: VariantProps<typeof buttonVariants>) => string;
export {};
