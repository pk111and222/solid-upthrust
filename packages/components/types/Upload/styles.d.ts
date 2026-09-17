import { VariantProps } from 'class-variance-authority';
import { SizeType } from '../../common/type';
declare const uploadButtonVariants: (props?: ({
    size?: "small" | "middle" | "large" | null | undefined;
    disabled?: boolean | null | undefined;
    status?: "error" | "warning" | "default" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const uploadButtonClass: (v: VariantProps<typeof uploadButtonVariants>) => string;
declare const uploadListVariants: (props?: ({
    size?: "small" | "middle" | "large" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const uploadListClass: (v: VariantProps<typeof uploadListVariants>) => string;
declare const uploadListItemVariants: (props?: ({
    state?: "error" | "done" | "uploading" | "removed" | null | undefined;
    size?: "small" | "middle" | "large" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const uploadListItemClass: (v: VariantProps<typeof uploadListItemVariants>) => string;
export declare const uploadItemNameClass: () => string;
export declare const uploadItemRemoveClass: () => string;
export declare const uploadItemStatusIconClass: (state: "uploading" | "done" | "error") => string;
declare const uploadPictureItemVariants: (props?: ({
    state?: "error" | "done" | "uploading" | "removed" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const uploadPictureItemClass: (v: VariantProps<typeof uploadPictureItemVariants>) => string;
export declare const uploadPictureThumbClass: () => string;
export declare const uploadItemMetaClass: () => string;
export declare const uploadItemSizeClass: () => string;
declare const uploadCardItemVariants: (props?: ({
    state?: "error" | "done" | "uploading" | "removed" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const uploadCardItemClass: (v: VariantProps<typeof uploadCardItemVariants>) => string;
export declare const uploadCardTileClass: () => string;
export declare const uploadCardActionsClass: () => string;
export declare const uploadCardActionBtnClass: () => string;
export declare const uploadCardErrorMarkClass: () => string;
export declare const uploadCardErrorIconClass: () => string;
export declare const uploadProgressTrackClass: () => string;
export declare const uploadProgressFillClass: (state: "uploading" | "error") => string;
export declare const uploadPercentTextClass: () => string;
declare const draggerVariants: (props?: ({
    dragOver?: boolean | null | undefined;
    disabled?: boolean | null | undefined;
    status?: "error" | "warning" | "default" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const draggerClass: (v: VariantProps<typeof draggerVariants>) => string;
export declare const draggerIconClass: () => string;
export declare const draggerHintClass: () => string;
export declare const draggerHintStrongClass: () => string;
export declare const uploadCardAddTileClass: (disabled: boolean) => string;
export declare const uploadCardAddIconClass: () => string;
export declare const uploadPreviewClass: () => string;
export declare const uploadPreviewImgClass: () => string;
export declare const uploadPreviewCloseClass: () => string;
export type UploadListSize = SizeType;
export {};
