import { VariantProps } from 'class-variance-authority';
declare const anchorContainerVariants: (props?: ({
    direction?: "horizontal" | "vertical" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const anchorLinkVariants: (props?: ({
    direction?: "horizontal" | "vertical" | null | undefined;
    state?: "idle" | "active-vertical" | "active-horizontal" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const anchorInkVariants: (props?: ({
    direction?: "horizontal" | "vertical" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const anchorContainerClass: (variants: VariantProps<typeof anchorContainerVariants>) => string;
export declare const anchorLinkClass: (variants: VariantProps<typeof anchorLinkVariants>) => string;
export declare const anchorInkClass: (variants: VariantProps<typeof anchorInkVariants>) => string;
export type AnchorLinkVariants = VariantProps<typeof anchorLinkVariants>;
export {};
