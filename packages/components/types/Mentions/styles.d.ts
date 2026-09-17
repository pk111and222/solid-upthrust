import { VariantProps } from 'class-variance-authority';
declare const mentionsDropdownVariants: (props?: ({
    visible?: boolean | null | undefined;
    placement?: "left" | "right" | "bottomLeft" | "bottomRight" | "bottom" | "topLeft" | "topRight" | "top" | "leftTop" | "leftBottom" | "rightTop" | "rightBottom" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const mentionsDropdownClass: (variants: VariantProps<typeof mentionsDropdownVariants>) => string;
/** One suggestion row (same family as AutoComplete's). */
export declare const mentionsOptionClass: (props?: ({
    active?: boolean | null | undefined;
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const mentionsOptionWrapClass: (variants: VariantProps<typeof mentionsOptionClass>) => string;
/** Avatar-ish glyph placeholder inside a suggestion row (antd shows an avatar). */
export declare const mentionsOptionAvatarClass: () => string;
/** Empty block. */
export declare const mentionsEmptyClass: () => string;
export {};
