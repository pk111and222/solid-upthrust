import { VariantProps } from 'class-variance-authority';
declare const modalRootVariants: (props?: ({
    hidden?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const modalMaskVariants: (props?: ({
    visible?: boolean | null | undefined;
    blur?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const modalWrapperVariants: (props?: ({
    visible?: boolean | null | undefined;
    centered?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const modalPanelVariants: (props?: ({
    visible?: boolean | null | undefined;
    centered?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const modalContainerVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const modalHeaderVariants: (props?: ({
    closable?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const modalTitleVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const modalBodyVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const modalFooterVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const modalCloseVariants: (props?: ({
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const modalRootClass: (variants: VariantProps<typeof modalRootVariants>) => string;
export declare const modalMaskClass: (variants: VariantProps<typeof modalMaskVariants>) => string;
export declare const modalWrapperClass: (variants: VariantProps<typeof modalWrapperVariants>) => string;
export declare const modalPanelClass: (variants: VariantProps<typeof modalPanelVariants>) => string;
export declare const modalContainerClass: (variants: VariantProps<typeof modalContainerVariants>) => string;
export declare const modalHeaderClass: (variants: VariantProps<typeof modalHeaderVariants>) => string;
export declare const modalTitleClass: (variants: VariantProps<typeof modalTitleVariants>) => string;
export declare const modalBodyClass: (variants: VariantProps<typeof modalBodyVariants>) => string;
export declare const modalFooterClass: (variants: VariantProps<typeof modalFooterVariants>) => string;
export declare const modalCloseClass: (variants: VariantProps<typeof modalCloseVariants>) => string;
/** Every variant combination, for dead-class tests. */
export declare const modalClassMatrix: () => string[];
export {};
