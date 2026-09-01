import { VariantProps } from 'class-variance-authority';
declare const messageViewportVariants: (props?: ({
    placement?: "center" | "bottom" | "top" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const messageNoticeVariants: (props?: ({
    type?: "loading" | "success" | "info" | "warning" | "error" | null | undefined;
    state?: "closing" | "visible" | "enter" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const messageIconVariants: (props?: ({
    type?: "loading" | "success" | "info" | "warning" | "error" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const messageContentVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const messageViewportClass: (variants: VariantProps<typeof messageViewportVariants>) => string;
export declare const messageNoticeClass: (variants: VariantProps<typeof messageNoticeVariants>) => string;
export declare const messageIconClass: (variants: VariantProps<typeof messageIconVariants>) => string;
export declare const messageContentClass: (variants: VariantProps<typeof messageContentVariants>) => string;
export declare const MESSAGE_ICONS: Record<string, string>;
export {};
