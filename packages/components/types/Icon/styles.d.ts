import { VariantProps } from 'class-variance-authority';
declare const iconVariants: (props?: ({
    size?: "small" | "middle" | "large" | null | undefined;
    color?: "warning" | "success" | "primary" | "danger" | "inherit" | "secondary" | null | undefined;
    spin?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const iconClass: (variants: VariantProps<typeof iconVariants>) => string;
export {};
