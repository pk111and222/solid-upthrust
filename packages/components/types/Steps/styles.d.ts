import { VariantProps } from 'class-variance-authority';
declare const stepsContainerVariants: (props?: ({
    direction?: "horizontal" | "vertical" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const stepItemVariants: (props?: ({
    direction?: "horizontal" | "vertical" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const stepTitleRowVariants: (props?: ({
    size?: "small" | "default" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const stepIconVariants: (props?: ({
    status?: "error" | "wait" | "finish" | "process" | null | undefined;
    size?: "small" | "default" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const stepGlyphVariants: (props?: ({
    glyph?: "number" | "close" | "check" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const stepConnectorVariants: (props?: ({
    status?: "error" | "wait" | "finish" | "process" | null | undefined;
    dirSize?: "horizontal-default" | "horizontal-small" | "vertical-default" | "vertical-small" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const stepTitleVariants: (props?: ({
    status?: "error" | "wait" | "finish" | "process" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const stepSubTitleVariants: (props?: ({
    status?: "error" | "wait" | "finish" | "process" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const stepDescriptionVariants: (props?: ({
    status?: "error" | "wait" | "finish" | "process" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const stepDotVariants: (props?: ({
    status?: "error" | "wait" | "finish" | "process" | null | undefined;
    size?: "small" | "default" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const stepsContainerClass: (variants: VariantProps<typeof stepsContainerVariants>) => string;
export declare const stepItemClass: (variants: VariantProps<typeof stepItemVariants>) => string;
export declare const stepTitleRowClass: (variants: VariantProps<typeof stepTitleRowVariants>) => string;
export declare const stepIconClass: (variants: VariantProps<typeof stepIconVariants>) => string;
export declare const stepGlyphClass: (variants: VariantProps<typeof stepGlyphVariants>) => string;
export declare const stepConnectorClass: (variants: VariantProps<typeof stepConnectorVariants>) => string;
export declare const stepTitleClass: (variants: VariantProps<typeof stepTitleVariants>) => string;
export declare const stepSubTitleClass: (variants: VariantProps<typeof stepSubTitleVariants>) => string;
export declare const stepDescriptionClass: (variants: VariantProps<typeof stepDescriptionVariants>) => string;
export declare const stepDotClass: (variants: VariantProps<typeof stepDotVariants>) => string;
export {};
