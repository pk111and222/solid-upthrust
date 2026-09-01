import { VariantProps } from 'class-variance-authority';
declare const notificationViewportVariants: (props?: ({
    placement?: "bottom" | "top" | "bottomLeft" | "bottomRight" | "topLeft" | "topRight" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const notificationNoticeVariants: (props?: ({
    state?: "closing" | "visible" | "enter" | null | undefined;
    side?: "center" | "left" | "right" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const notificationEnterVariants: (props?: ({
    side?: "center" | "left" | "right" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const notificationBodyVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const notificationMessageVariants: (props?: ({
    withIcon?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const notificationDescriptionVariants: (props?: ({
    withIcon?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const notificationIconVariants: (props?: ({
    type?: "success" | "info" | "warning" | "error" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const notificationCloseVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const notificationActionsVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const notificationProgressVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const notificationProgressFillVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const notificationViewportClass: (variants: VariantProps<typeof notificationViewportVariants>) => string;
export declare const notificationNoticeClass: (variants: VariantProps<typeof notificationNoticeVariants>) => string;
export declare const notificationEnterClass: (variants: VariantProps<typeof notificationEnterVariants>) => string;
export declare const notificationBodyClass: (variants: VariantProps<typeof notificationBodyVariants>) => string;
export declare const notificationMessageClass: (variants: VariantProps<typeof notificationMessageVariants>) => string;
export declare const notificationDescriptionClass: (variants: VariantProps<typeof notificationDescriptionVariants>) => string;
export declare const notificationIconClass: (variants: VariantProps<typeof notificationIconVariants>) => string;
export declare const notificationCloseClass: (variants: VariantProps<typeof notificationCloseVariants>) => string;
export declare const notificationActionsClass: (variants: VariantProps<typeof notificationActionsVariants>) => string;
export declare const notificationProgressClass: (variants: VariantProps<typeof notificationProgressVariants>) => string;
export declare const notificationProgressFillClass: (variants: VariantProps<typeof notificationProgressFillVariants>) => string;
export declare const NOTIFICATION_CLOSE_ICON = "i-mdi-close";
export {};
