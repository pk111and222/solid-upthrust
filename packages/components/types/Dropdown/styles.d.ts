import { VariantProps } from 'class-variance-authority';
declare const dropdownOverlayVariants: (props?: ({
    visible?: boolean | null | undefined;
    placement?: "left" | "right" | "bottom" | "top" | "bottomLeft" | "bottomRight" | "topLeft" | "topRight" | "leftTop" | "leftBottom" | "rightTop" | "rightBottom" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const dropdownItemVariants: (props?: ({
    disabled?: boolean | null | undefined;
    danger?: boolean | null | undefined;
    focused?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const dropdownDividerVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const dropdownOverlayClass: (variants: VariantProps<typeof dropdownOverlayVariants>) => string;
export declare const dropdownItemClass: (variants: VariantProps<typeof dropdownItemVariants>) => string;
export declare const dropdownDividerClass: (variants: VariantProps<typeof dropdownDividerVariants>) => string;
export {};
