import { VariantProps } from 'class-variance-authority';

declare const stepsContainerVariants: (props?: {
    direction?: "vertical" | "horizontal";
} & import('class-variance-authority/dist/types').ClassProp) => string;
declare const stepItemVariants: (props?: {
    direction?: "vertical" | "horizontal";
} & import('class-variance-authority/dist/types').ClassProp) => string;
declare const stepIconVariants: (props?: {
    status?: "error" | "wait" | "finish" | "process";
    size?: "small" | "default";
} & import('class-variance-authority/dist/types').ClassProp) => string;
declare const stepConnectorVariants: (props?: {
    status?: "error" | "wait" | "finish" | "process";
    direction?: "vertical" | "horizontal";
} & import('class-variance-authority/dist/types').ClassProp) => string;
declare const stepTitleVariants: (props?: {
    status?: "error" | "wait" | "finish" | "process";
} & import('class-variance-authority/dist/types').ClassProp) => string;
declare const stepDescriptionVariants: (props?: {
    status?: "error" | "wait" | "finish" | "process";
} & import('class-variance-authority/dist/types').ClassProp) => string;
export declare const stepsContainerClass: (variants: VariantProps<typeof stepsContainerVariants>) => string;
export declare const stepItemClass: (variants: VariantProps<typeof stepItemVariants>) => string;
export declare const stepIconClass: (variants: VariantProps<typeof stepIconVariants>) => string;
export declare const stepConnectorClass: (variants: VariantProps<typeof stepConnectorVariants>) => string;
export declare const stepTitleClass: (variants: VariantProps<typeof stepTitleVariants>) => string;
export declare const stepDescriptionClass: (variants: VariantProps<typeof stepDescriptionVariants>) => string;
export {};
