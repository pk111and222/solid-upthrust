import { VariantProps } from 'class-variance-authority';
declare const autoCompleteDropdownVariants: (props?: ({
    visible?: boolean | null | undefined;
    placement?: "left" | "right" | "bottomLeft" | "bottomRight" | "bottom" | "topLeft" | "topRight" | "top" | "leftTop" | "leftBottom" | "rightTop" | "rightBottom" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const autoCompleteDropdownClass: (variants: VariantProps<typeof autoCompleteDropdownVariants>) => string;
/** One suggestion row. */
export declare const autoCompleteOptionClass: (props?: ({
    active?: boolean | null | undefined;
    selected?: boolean | null | undefined;
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const autoCompleteOptionWrapClass: (variants: VariantProps<typeof autoCompleteOptionClass>) => string;
/** Empty block. */
export declare const autoCompleteEmptyClass: () => string;
export {};
