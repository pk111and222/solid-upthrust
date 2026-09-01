import { VariantProps } from 'class-variance-authority';
declare const drawerMaskVariants: (props?: ({
    visible?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const drawerWrapperVariants: (props?: ({
    placement?: "left" | "right" | "bottom" | "top" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const drawerPanelVariants: (props?: ({
    placement?: "left" | "right" | "bottom" | "top" | null | undefined;
    visible?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const drawerHeaderVariants: (props?: ({
    bare?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const drawerTitleVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const drawerBodyVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const drawerFooterVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const drawerCloseVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const drawerMaskClass: (variants: VariantProps<typeof drawerMaskVariants>) => string;
export declare const drawerWrapperClass: (variants: VariantProps<typeof drawerWrapperVariants>) => string;
export declare const drawerPanelClass: (variants: VariantProps<typeof drawerPanelVariants>) => string;
export declare const drawerHeaderClass: (variants: VariantProps<typeof drawerHeaderVariants>) => string;
export declare const drawerTitleClass: (variants: VariantProps<typeof drawerTitleVariants>) => string;
export declare const drawerBodyClass: (variants: VariantProps<typeof drawerBodyVariants>) => string;
export declare const drawerFooterClass: (variants: VariantProps<typeof drawerFooterVariants>) => string;
export declare const drawerCloseClass: (variants: VariantProps<typeof drawerCloseVariants>) => string;
export declare const DRAWER_CLOSE_ICON = "i-mdi-close";
export declare const DRAWER_SIZE_PRESET: Record<'default' | 'large', number>;
export {};
