import { VariantProps } from 'class-variance-authority';
declare const popoverOverlayVariants: (props?: ({
    visible?: boolean | null | undefined;
    placement?: "left" | "right" | "bottomLeft" | "bottomRight" | "bottom" | "topLeft" | "topRight" | "top" | "leftTop" | "leftBottom" | "rightTop" | "rightBottom" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const popoverTitleVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const popoverInnerVariants: (props?: ({
    hasTitle?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const popoverOverlayClass: (variants: VariantProps<typeof popoverOverlayVariants>) => string;
export declare const popoverTitleClass: (variants: VariantProps<typeof popoverTitleVariants>) => string;
export declare const popoverInnerClass: (variants: VariantProps<typeof popoverInnerVariants>) => string;
export declare const popoverArrowClass: (side: "top" | "bottom" | "left" | "right") => string;
export {};
