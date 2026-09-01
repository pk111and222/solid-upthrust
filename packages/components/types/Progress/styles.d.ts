import { VariantProps } from 'class-variance-authority';
declare const progressTrackVariants: (props?: ({
    size?: "small" | "middle" | "large" | null | undefined;
    shape?: "round" | "square" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const progressIndicatorVariants: (props?: ({
    status?: "active" | "success" | "normal" | "exception" | null | undefined;
    shape?: "round" | "square" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const progressSuccessVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const progressTextVariants: (props?: ({
    size?: "small" | "middle" | "large" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const progressStepVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const progressStepItemVariants: (props?: ({
    size?: "small" | "middle" | "large" | null | undefined;
    filled?: boolean | null | undefined;
    status?: "success" | "normal" | "exception" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const progressStepFillClass: (status: "normal" | "success" | "exception") => string;
declare const progressCircleVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const progressCircleTextVariants: (props?: ({
    size?: "small" | "middle" | "large" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const progressTrackClass: (variants: VariantProps<typeof progressTrackVariants>) => string;
export declare const progressIndicatorClass: (variants: VariantProps<typeof progressIndicatorVariants>) => string;
export declare const progressSuccessClass: (variants: VariantProps<typeof progressSuccessVariants>) => string;
export declare const progressTextClass: (variants: VariantProps<typeof progressTextVariants>) => string;
export declare const progressStepClass: (variants: VariantProps<typeof progressStepVariants>) => string;
export declare const progressStepItemClass: (variants: VariantProps<typeof progressStepItemVariants>) => string;
export declare const progressCircleClass: (variants: VariantProps<typeof progressCircleVariants>) => string;
export declare const progressCircleTextClass: (variants: VariantProps<typeof progressCircleTextVariants>) => string;
export {};
