import { VariantProps } from 'class-variance-authority';
declare const alertContainerVariants: (props?: ({
    type?: "success" | "info" | "warning" | "error" | null | undefined;
    hasDescription?: boolean | null | undefined;
    banner?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const alertIconVariants: (props?: ({
    type?: "success" | "info" | "warning" | "error" | null | undefined;
    hasDescription?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const alertMessageVariants: (props?: ({
    hasDescription?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const alertDescriptionVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const alertCloseVariants: (props?: ({
    hasDescription?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const alertContainerClass: (variants: VariantProps<typeof alertContainerVariants>) => string;
export declare const alertIconClass: (variants: VariantProps<typeof alertIconVariants>) => string;
export declare const alertMessageClass: (variants: VariantProps<typeof alertMessageVariants>) => string;
export declare const alertDescriptionClass: (variants: VariantProps<typeof alertDescriptionVariants>) => string;
export declare const alertCloseClass: (variants: VariantProps<typeof alertCloseVariants>) => string;
export {};
