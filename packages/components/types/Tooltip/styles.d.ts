import { VariantProps } from 'class-variance-authority';
declare const tooltipOverlayVariants: (props?: ({
    visible?: boolean | null | undefined;
    placement?: "left" | "right" | "bottomLeft" | "bottomRight" | "bottom" | "topLeft" | "topRight" | "top" | "leftTop" | "leftBottom" | "rightTop" | "rightBottom" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export type TooltipPlacementVariant = VariantProps<typeof tooltipOverlayVariants>['placement'];
export declare const tooltipOverlayClass: (variants: VariantProps<typeof tooltipOverlayVariants>) => string;
export declare const tooltipArrowClass: (side: "top" | "bottom" | "left" | "right") => string;
export {};
