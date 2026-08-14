import { VariantProps } from 'class-variance-authority';

declare const dropdownOverlayVariants: (props?: {
    visible?: boolean;
} & import('class-variance-authority/dist/types').ClassProp) => string;
declare const dropdownItemVariants: (props?: {
    active?: boolean;
    disabled?: boolean;
    danger?: boolean;
} & import('class-variance-authority/dist/types').ClassProp) => string;
declare const dropdownDividerVariants: (props?: {} & import('class-variance-authority/dist/types').ClassProp) => string;
export declare const dropdownOverlayClass: (variants: VariantProps<typeof dropdownOverlayVariants>) => string;
export declare const dropdownItemClass: (variants: VariantProps<typeof dropdownItemVariants>) => string;
export declare const dropdownDividerClass: (variants: VariantProps<typeof dropdownDividerVariants>) => string;
export {};
