import { VariantProps } from 'class-variance-authority';

declare const buttonVariants: (props?: {
    type?: "primary" | "secondary" | "danger" | "link" | "text" | "dashed";
    size?: "small" | "medium" | "large";
    shape?: "rounded" | "square" | "circle";
    disabled?: boolean;
    block?: boolean;
} & import('class-variance-authority/dist/types').ClassProp) => string;
export interface ButtonVariants extends VariantProps<typeof buttonVariants> {
}
export declare const buttonClass: (variants: ButtonVariants) => string;
export {};
