import { VariantProps } from 'class-variance-authority';
declare const popconfirmOverlayVariants: (props?: ({
    visible?: boolean | null | undefined;
    placement?: "left" | "right" | "bottomLeft" | "bottomRight" | "bottom" | "topLeft" | "topRight" | "top" | "leftTop" | "leftBottom" | "rightTop" | "rightBottom" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const popconfirmMessageVariants: (props?: ({
    hasDescription?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const popconfirmDescriptionVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const popconfirmIconVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const popconfirmActionsVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const popconfirmOverlayClass: (variants: VariantProps<typeof popconfirmOverlayVariants>) => string;
export declare const popconfirmMessageClass: (variants: VariantProps<typeof popconfirmMessageVariants>) => string;
export declare const popconfirmDescriptionClass: (variants: VariantProps<typeof popconfirmDescriptionVariants>) => string;
export declare const popconfirmIconClass: (variants: VariantProps<typeof popconfirmIconVariants>) => string;
export declare const popconfirmActionsClass: (variants: VariantProps<typeof popconfirmActionsVariants>) => string;
export declare const popconfirmArrowClass: (side: "top" | "bottom" | "left" | "right") => string;
export {};
