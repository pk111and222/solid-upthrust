import { VariantProps } from 'class-variance-authority';
declare const qrCodeVariants: (props?: ({
    bordered?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const qrMaskVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const qrMaskTextVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const qrExpiredIconVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const qrScannedIconVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const qrLoadingIconVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const qrRefreshVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const qrCodeClass: (variants: VariantProps<typeof qrCodeVariants>) => string;
export declare const qrMaskClass: (variants: VariantProps<typeof qrMaskVariants>) => string;
export declare const qrMaskTextClass: (variants: VariantProps<typeof qrMaskTextVariants>) => string;
export declare const qrExpiredIconClass: (variants: VariantProps<typeof qrExpiredIconVariants>) => string;
export declare const qrScannedIconClass: (variants: VariantProps<typeof qrScannedIconVariants>) => string;
export declare const qrLoadingIconClass: (variants: VariantProps<typeof qrLoadingIconVariants>) => string;
export declare const qrRefreshClass: (variants: VariantProps<typeof qrRefreshVariants>) => string;
export {};
