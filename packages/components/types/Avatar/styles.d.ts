import { VariantProps } from 'class-variance-authority';
declare const avatarVariants: (props?: ({
    shape?: "circle" | "square" | null | undefined;
    size?: "small" | "middle" | "large" | null | undefined;
    customColor?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const avatarGroupVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const avatarGroupItemVariants: (props?: ({
    shape?: "circle" | "square" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const avatarGroupMoreVariants: (props?: ({
    shape?: "circle" | "square" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const avatarClass: (variants: VariantProps<typeof avatarVariants>) => string;
export declare const avatarGroupClass: (variants: VariantProps<typeof avatarGroupVariants>) => string;
export declare const avatarGroupItemClass: (variants: VariantProps<typeof avatarGroupItemVariants>) => string;
export declare const avatarGroupMoreClass: (variants: VariantProps<typeof avatarGroupMoreVariants>) => string;
export {};
