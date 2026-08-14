import { VariantProps } from 'class-variance-authority';

declare const paginationContainerVariants: (props?: {
    align?: "start" | "end" | "center";
} & import('class-variance-authority/dist/types').ClassProp) => string;
declare const paginationItemVariants: (props?: {
    active?: boolean;
    disabled?: boolean;
    size?: "small" | "default";
} & import('class-variance-authority/dist/types').ClassProp) => string;
declare const paginationEllipsisVariants: (props?: {
    size?: "small" | "default";
} & import('class-variance-authority/dist/types').ClassProp) => string;
export declare const paginationContainerClass: (variants: VariantProps<typeof paginationContainerVariants>) => string;
export declare const paginationItemClass: (variants: VariantProps<typeof paginationItemVariants>) => string;
export declare const paginationEllipsisClass: (variants: VariantProps<typeof paginationEllipsisVariants>) => string;
export {};
