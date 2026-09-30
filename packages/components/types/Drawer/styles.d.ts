import { VariantProps } from 'class-variance-authority';
declare const drawerRootVariants: (props?: ({
    inline?: boolean | null | undefined;
    hidden?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const drawerMaskVariants: (props?: ({
    visible?: boolean | null | undefined;
    blur?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const drawerWrapperVariants: (props?: ({
    placement?: "left" | "right" | "bottom" | "top" | null | undefined;
    motion?: "visible" | "left-hidden" | "right-hidden" | "top-hidden" | "bottom-hidden" | null | undefined;
    dragging?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const drawerSectionVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const drawerHeaderVariants: (props?: ({
    closeOnly?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const drawerHeaderTitleVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const drawerTitleVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const drawerExtraVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const drawerBodyVariants: (props?: ({
    loading?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const drawerFooterVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const drawerCloseVariants: (props?: ({
    side?: "start" | "end" | null | undefined;
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const drawerDraggerVariants: (props?: ({
    placement?: "left" | "right" | "bottom" | "top" | null | undefined;
    dragging?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const drawerRootClass: (v: VariantProps<typeof drawerRootVariants>) => string;
export declare const drawerMaskClass: (v: VariantProps<typeof drawerMaskVariants>) => string;
export declare const drawerWrapperClass: (v: VariantProps<typeof drawerWrapperVariants>) => string;
export declare const drawerSectionClass: (v: VariantProps<typeof drawerSectionVariants>) => string;
export declare const drawerHeaderClass: (v: VariantProps<typeof drawerHeaderVariants>) => string;
export declare const drawerHeaderTitleClass: (v: VariantProps<typeof drawerHeaderTitleVariants>) => string;
export declare const drawerTitleClass: (v: VariantProps<typeof drawerTitleVariants>) => string;
export declare const drawerExtraClass: (v: VariantProps<typeof drawerExtraVariants>) => string;
export declare const drawerBodyClass: (v: VariantProps<typeof drawerBodyVariants>) => string;
export declare const drawerFooterClass: (v: VariantProps<typeof drawerFooterVariants>) => string;
export declare const drawerCloseClass: (v: VariantProps<typeof drawerCloseVariants>) => string;
export declare const drawerDraggerClass: (v: VariantProps<typeof drawerDraggerVariants>) => string;
export declare const DRAWER_SIZE_PRESET: Record<'default' | 'large', number>;
/** Every variant combination, for dead-class tests. */
export declare const drawerClassMatrix: () => string[];
export {};
