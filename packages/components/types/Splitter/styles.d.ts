import { VariantProps } from 'class-variance-authority';

declare const splitterVariants: (props?: {
    layout?: "vertical" | "horizontal";
} & import('class-variance-authority/dist/types').ClassProp) => string;
declare const splitterBarVariants: (props?: {
    layout?: "vertical" | "horizontal";
    active?: boolean;
} & import('class-variance-authority/dist/types').ClassProp) => string;
declare const splitterPanelVariants: (props?: {
    layout?: "vertical" | "horizontal";
} & import('class-variance-authority/dist/types').ClassProp) => string;
export declare const splitterClass: (variants: VariantProps<typeof splitterVariants>) => string;
export declare const splitterBarClass: (variants: VariantProps<typeof splitterBarVariants>) => string;
export declare const splitterPanelClass: (variants: VariantProps<typeof splitterPanelVariants>) => string;
export {};
