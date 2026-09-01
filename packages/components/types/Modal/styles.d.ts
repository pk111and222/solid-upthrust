import { VariantProps } from 'class-variance-authority';
declare const modalMaskVariants: (props?: ({
    visible?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const modalWrapperVariants: (props?: ({
    visible?: boolean | null | undefined;
    centered?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const modalPanelVariants: (props?: ({
    visible?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const modalHeaderVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const modalTitleVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const modalBodyVariants: (props?: ({
    bare?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const modalFooterVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const modalCloseVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const modalMaskClass: (variants: VariantProps<typeof modalMaskVariants>) => string;
export declare const modalWrapperClass: (variants: VariantProps<typeof modalWrapperVariants>) => string;
export declare const modalPanelClass: (variants: VariantProps<typeof modalPanelVariants>) => string;
export declare const modalHeaderClass: (variants: VariantProps<typeof modalHeaderVariants>) => string;
export declare const modalTitleClass: (variants: VariantProps<typeof modalTitleVariants>) => string;
export declare const modalBodyClass: (variants: VariantProps<typeof modalBodyVariants>) => string;
export declare const modalFooterClass: (variants: VariantProps<typeof modalFooterVariants>) => string;
export declare const modalCloseClass: (variants: VariantProps<typeof modalCloseVariants>) => string;
export declare const MODAL_CLOSE_ICON = "i-mdi-close";
export {};
