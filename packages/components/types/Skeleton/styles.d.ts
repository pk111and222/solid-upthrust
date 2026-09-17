import { VariantProps } from 'class-variance-authority';
declare const skeletonElementVariants: (props?: ({
    shape?: "circle" | "line" | "square" | null | undefined;
    active?: boolean | null | undefined;
    round?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const skeletonRowVariants: (props?: ({
    first?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const skeletonTitleVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const skeletonBlockVariants: (props?: ({
    hasAvatar?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const skeletonAvatarVariants: (props?: ({
    shape?: "circle" | "square" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const skeletonElementClass: (variants: VariantProps<typeof skeletonElementVariants>) => string;
export declare const skeletonRowClass: (variants: VariantProps<typeof skeletonRowVariants>) => string;
export declare const skeletonTitleClass: (variants: VariantProps<typeof skeletonTitleVariants>) => string;
export declare const skeletonBlockClass: (variants: VariantProps<typeof skeletonBlockVariants>) => string;
export declare const skeletonAvatarClass: (variants: VariantProps<typeof skeletonAvatarVariants>) => string;
export {};
