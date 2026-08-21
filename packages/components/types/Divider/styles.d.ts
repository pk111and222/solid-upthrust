import { VariantProps } from 'class-variance-authority';
declare const dividerVariants: (props?: ({
    type?: "horizontal" | "vertical" | null | undefined;
    dashed?: boolean | null | undefined;
    hasText?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const dividerTextVariants: (props?: ({
    plain?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const dividerLineVariants: (props?: ({
    dashed?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export type DividerStyleVariants = VariantProps<typeof dividerVariants>;
export declare const dividerClass: (variants: DividerStyleVariants) => string;
export declare const dividerTextClass: (variants: VariantProps<typeof dividerTextVariants>) => string;
export declare const dividerLineClass: (variants: VariantProps<typeof dividerLineVariants>) => string;
export {};
