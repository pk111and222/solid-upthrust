import { VariantProps } from 'class-variance-authority';
declare const paginationContainerVariants: (props?: ({
    align?: "start" | "end" | "center" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const paginationItemVariants: (props?: ({
    state?: "active" | "idle" | "active-disabled" | "nav-disabled" | null | undefined;
    size?: "small" | "default" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const paginationEllipsisVariants: (props?: ({
    size?: "small" | "default" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const paginationJumperVariants: (props?: ({
    size?: "small" | "default" | null | undefined;
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const paginationTotalVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const paginationSizeChangerVariants: (props?: ({
    size?: "small" | "default" | null | undefined;
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const paginationContainerClass: (variants: VariantProps<typeof paginationContainerVariants>) => string;
export declare const paginationItemClass: (variants: VariantProps<typeof paginationItemVariants>) => string;
export declare const paginationEllipsisClass: (variants: VariantProps<typeof paginationEllipsisVariants>) => string;
export declare const paginationJumperClass: (variants: VariantProps<typeof paginationJumperVariants>) => string;
export declare const paginationTotalClass: (variants: VariantProps<typeof paginationTotalVariants>) => string;
export declare const paginationSizeChangerClass: (variants: VariantProps<typeof paginationSizeChangerVariants>) => string;
export {};
