import { VariantProps } from 'class-variance-authority';
declare const resultContainerVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const resultIconVariants: (props?: ({
    status?: "success" | "info" | "warning" | "error" | "404" | "403" | "500" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const resultTitleVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const resultSubtitleVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const resultExtraVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const resultImageVariants: (props?: ({
    status?: "success" | "info" | "warning" | "error" | "404" | "403" | "500" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const resultContainerClass: (variants: VariantProps<typeof resultContainerVariants>) => string;
export declare const resultIconClass: (variants: VariantProps<typeof resultIconVariants>) => string;
export declare const resultTitleClass: (variants: VariantProps<typeof resultTitleVariants>) => string;
export declare const resultSubtitleClass: (variants: VariantProps<typeof resultSubtitleVariants>) => string;
export declare const resultExtraClass: (variants: VariantProps<typeof resultExtraVariants>) => string;
export declare const resultImageClass: (variants: VariantProps<typeof resultImageVariants>) => string;
export {};
