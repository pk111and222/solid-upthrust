import { VariantProps } from 'class-variance-authority';
declare const buttonVariants: (props?: ({
    colorScheme?: "solid-primary" | "solid-default" | "solid-danger" | "outlined-primary" | "text-primary" | "outlined-default" | "outlined-danger" | "dashed-primary" | "dashed-default" | "dashed-danger" | "filled-primary" | "filled-default" | "filled-danger" | "text-default" | "text-danger" | "link-primary" | "link-default" | "link-danger" | null | undefined;
    size?: "small" | "middle" | "large" | null | undefined;
    shape?: "default" | "round" | "circle" | null | undefined;
    disabled?: boolean | null | undefined;
    ghost?: boolean | null | undefined;
    block?: boolean | null | undefined;
    loading?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const waveVariants: (props?: ({
    active?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export type ButtonStyleVariants = VariantProps<typeof buttonVariants>;
export declare const buttonClass: (variants: ButtonStyleVariants) => string;
export declare const waveClass: (variants: VariantProps<typeof waveVariants>) => string;
export {};
