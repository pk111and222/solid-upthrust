import { VariantProps } from 'class-variance-authority';

declare const dividerVariants: (props?: {
    type?: "vertical" | "horizontal";
    dashed?: boolean;
    plain?: boolean;
} & import('class-variance-authority/dist/types').ClassProp) => string;
declare const dividerTextVariants: (props?: {
    orientation?: "center" | "left" | "right";
    plain?: boolean;
} & import('class-variance-authority/dist/types').ClassProp) => string;
export declare const dividerClass: (variants: VariantProps<typeof dividerVariants>) => string;
export declare const dividerTextClass: (variants: VariantProps<typeof dividerTextVariants>) => string;
export {};
