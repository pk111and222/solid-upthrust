// @unocss-include
import { twMerge } from "tailwind-merge";
import { cva, type VariantProps } from "class-variance-authority";

/**
 * Upload styles — antd6 spec:
 *  - trigger button: the Button family (solid-primary / outlined / text)
 *  - list rows (text): name + status icon + size, hover shows the remove ✕
 *  - picture / picture-card: 66px thumb tiles, picture rows 48px leading
 *    thumb; uploading overlays an inline progress bar / ring percent
 *  - dragger: the large dashed drop zone with hover/dragOver primary tint
 *  - progress: the Progress line family, h-[2px] track under the row
 */
import type { SizeType } from '../../common/type'

// ---------------------------------------------------------------------------
// Trigger (button family — reuse semantics, local definition)
// ---------------------------------------------------------------------------

const uploadButtonVariants = cva(
  [
    "inline-flex",
    "items-center",
    "justify-center",
    "rounded",
    "border",
    "border-solid",
    "font-normal",
    "cursor-pointer",
    "transition-upthrust",
    "select-none",
    "whitespace-nowrap",
    "bg-surface",
    "border-outline",
    "text-on-surface",
    "hover:border-primary",
    "hover:text-primary",
  ],
  {
    variants: {
      size: {
        small: ["h-control-sm", "text-[12px]", "px-[7px]", "gap-[4px]"],
        middle: ["h-control", "text-[14px]", "px-[15px]", "gap-[6px]"],
        large: ["h-control-lg", "text-[16px]", "px-[19px]", "gap-[8px]"],
      },
      disabled: {
        true: ["!bg-on-surface/4", "!border-on-surface/15", "!text-on-surface/25", "cursor-not-allowed", "hover:!border-on-surface/15", "hover:!text-on-surface/25"],
        false: [],
      },
      status: {
        default: [],
        error: ["!border-error", "hover:!border-error", "hover:!text-error"],
        warning: ["!border-[#faad14]", "hover:!border-[#faad14]", "hover:!text-[#b45309]"],
      },
    },
    defaultVariants: {
      size: "middle",
      disabled: false,
      status: "default",
    },
  },
)

export const uploadButtonClass = (v: VariantProps<typeof uploadButtonVariants>) =>
  twMerge(uploadButtonVariants(v))

// ---------------------------------------------------------------------------
// List — text rows (default listType)
// ---------------------------------------------------------------------------

const uploadListVariants = cva(
  ["flex", "flex-col", "gap-[4px]", "mt-[8px]", "text-[14px]", "text-on-surface"],
  {
    variants: {
      size: {
        small: ["text-[12px]"],
        middle: [],
        large: ["text-[16px]"],
      },
    },
    defaultVariants: { size: "middle" },
  },
)

export const uploadListClass = (v: VariantProps<typeof uploadListVariants>) =>
  twMerge(uploadListVariants(v))

const uploadListItemVariants = cva(
  [
    "group/row",
    "flex",
    "items-center",
    "gap-[8px]",
    "h-[24px]",
    "px-[8px]",
    "rounded-sm",
    "transition-upthrust",
    "hover:bg-on-surface/6",
    "break-all",
  ],
  {
    variants: {
      state: {
        pending: ["text-on-surface"],
        uploading: ["text-on-surface"],
        done: ["text-on-surface"],
        error: ["text-error"],
        removed: ["hidden"],
      },
      size: {
        small: ["text-[12px]"],
        middle: [],
        large: ["text-[16px]"],
      },
    },
    defaultVariants: { state: "done", size: "middle" },
  },
)

export const uploadListItemClass = (v: VariantProps<typeof uploadListItemVariants>) =>
  twMerge(uploadListItemVariants(v))

export const uploadItemNameClass = () =>
  twMerge(["flex-1", "min-w-0", "truncate", "cursor-pointer", "hover:text-primary"])

export const uploadItemRemoveClass = () =>
  twMerge([
    "shrink-0",
    "w-[16px]",
    "h-[16px]",
    "inline-flex",
    "items-center",
    "justify-center",
    "text-[12px]",
    "text-on-surface-variant",
    "hover:text-on-surface",
    "cursor-pointer",
    "opacity-0",
    "group-hover/row:opacity-100",
    "transition-upthrust-fast",
  ])

export const uploadItemStatusIconClass = (state: 'pending' | 'uploading' | 'done' | 'error' | 'removed') =>
  twMerge([
    "shrink-0",
    "text-[14px]",
    state === 'pending' ? "i-mdi-file-document-outline text-on-surface/45" : "",
    state === 'uploading' ? "i-mdi-loading animate-spin-upthrust text-primary" : "",
    state === 'done' ? "i-mdi-check-circle-outline text-primary" : "",
    state === 'error' ? "i-mdi-close-circle-outline text-error" : "",
  ])

// ---------------------------------------------------------------------------
// List — picture rows (leading thumbnail + meta)
// ---------------------------------------------------------------------------

const uploadPictureItemVariants = cva(
  [
    "group/row",
    "flex",
    "items-center",
    "gap-[8px]",
    "p-[8px]",
    "rounded",
    "border",
    "border-solid",
    "border-outline-variant",
    "transition-upthrust",
    "hover:border-primary",
  ],
  {
    variants: {
      state: {
        pending: ["border-outline-variant"],
        uploading: ["border-outline-variant"],
        done: ["border-outline-variant"],
        error: ["!border-error"],
        removed: ["hidden"],
      },
    },
    defaultVariants: { state: "done" },
  },
)

export const uploadPictureItemClass = (v: VariantProps<typeof uploadPictureItemVariants>) =>
  twMerge(uploadPictureItemVariants(v))

export const uploadPictureThumbClass = () =>
  twMerge([
    "shrink-0",
    "w-[48px]",
    "h-[48px]",
    "rounded-sm",
    "bg-surface-variant",
    "flex",
    "items-center",
    "justify-center",
    "overflow-hidden",
    "cursor-pointer",
    "object-cover",
  ])

export const uploadItemMetaClass = () =>
  twMerge(["flex-1", "min-w-0", "flex", "flex-col", "gap-[2px]"])

export const uploadItemSizeClass = () =>
  twMerge(["text-[12px]", "text-on-surface-variant"])

// ---------------------------------------------------------------------------
// Picture-card grid tiles
// ---------------------------------------------------------------------------

const uploadCardItemVariants = cva(
  [
    "group/row",
    "relative",
    "w-[104px]",
    "h-[104px]",
    "rounded",
    "border",
    "border-solid",
    "border-outline-variant",
    "bg-surface",
    "overflow-hidden",
    "flex",
    "items-center",
    "justify-center",
    "transition-upthrust",
  ],
  {
    variants: {
      state: {
        pending: ["border-outline-variant"],
        uploading: ["border-outline-variant"],
        done: ["border-outline-variant"],
        error: ["!border-error"],
        removed: ["hidden"],
      },
    },
    defaultVariants: { state: "done" },
  },
)

export const uploadCardItemClass = (v: VariantProps<typeof uploadCardItemVariants>) =>
  twMerge(uploadCardItemVariants(v))

export const uploadCardTileClass = () =>
  twMerge(["w-full", "h-full", "flex", "items-center", "justify-center", "bg-surface-variant", "cursor-pointer", "overflow-hidden"])

export const uploadCardActionsClass = () =>
  twMerge([
    "absolute",
    "inset-0",
    "bg-black/45",
    "opacity-0",
    "group-hover/row:opacity-100",
    "transition-upthrust-fast",
    "flex",
    "items-center",
    "justify-center",
    "gap-[8px]",
    "text-white",
    "text-[18px]",
  ])

export const uploadCardActionBtnClass = () =>
  twMerge(["w-[24px]", "h-[24px]", "inline-flex", "items-center", "justify-center", "cursor-pointer", "hover:text-primary-container"])

// antd's error corner: a 26×26 triangle in the top-right. Built like Badge's
// ribbon fold — an ::after box with a fixed-width current-color border and
// two transparent sides (arbitrary border WIDTHS like border-l-[26px] get
// parsed as colors by preset-wind4, so the numeric scale + an 8px box is
// the safe construction; here the triangle is scaled to cover 26px).
export const uploadCardErrorMarkClass = () =>
  twMerge([
    "absolute",
    "top-0",
    "right-0",
    "w-[26px]",
    "h-[26px]",
    "overflow-hidden",
    "rounded-tr",
    "pointer-events-none",
    "after:absolute",
    "after:top-0",
    "after:right-0",
    "after:w-[26px]",
    "after:h-[26px]",
    "after:bg-error",
    "after:content-['']",
    "after:origin-top-right",
    "after:scale-50",
    "after:rounded-bl-full",
  ])

export const uploadCardErrorIconClass = () =>
  twMerge(["absolute", "top-[1px]", "right-[1px]", "text-[12px]", "text-white", "i-mdi-exclamation", "pointer-events-none"])

// ---------------------------------------------------------------------------
// Inline progress bar (both list and card)
// ---------------------------------------------------------------------------

export const uploadProgressTrackClass = () =>
  twMerge(["h-[2px]", "w-full", "rounded-full", "bg-on-surface/10", "overflow-hidden"])

export const uploadProgressFillClass = (state: 'uploading' | 'error') =>
  twMerge([
    "h-full",
    "rounded-full",
    "transition-[width]",
    "duration-upthrust-fast",
    state === 'uploading' ? "bg-primary" : "bg-error",
  ])

export const uploadPercentTextClass = () =>
  twMerge(["text-[12px]", "text-on-surface-variant", "tabular-nums"])

// ---------------------------------------------------------------------------
// Dragger
// ---------------------------------------------------------------------------

const draggerVariants = cva(
  [
    "relative",
    "flex",
    "flex-col",
    "items-center",
    "justify-center",
    "gap-[8px]",
    "p-[16px]",
    "rounded",
    "border-2",
    "border-dashed",
    "border-outline",
    "bg-surface",
    "cursor-pointer",
    "transition-upthrust",
    "text-on-surface-variant",
    "hover:border-primary",
  ],
  {
    variants: {
      dragOver: {
        true: ["!border-primary", "bg-primary/5"],
        false: [],
      },
      disabled: {
        true: ["!bg-on-surface/4", "!border-on-surface/15", "cursor-not-allowed", "hover:!border-on-surface/15"],
        false: [],
      },
      status: {
        default: [],
        error: ["!border-error"],
        warning: ["!border-[#faad14]"],
      },
    },
    defaultVariants: { dragOver: false, disabled: false, status: "default" },
  },
)

export const draggerClass = (v: VariantProps<typeof draggerVariants>) =>
  twMerge(draggerVariants(v))

export const draggerIconClass = () =>
  twMerge(["i-mdi-tray-arrow-up", "text-[40px]", "text-on-surface/30"])

export const draggerHintClass = () =>
  twMerge(["text-[14px]", "text-on-surface-variant"])

export const draggerHintStrongClass = () =>
  twMerge(["text-[14px]", "text-primary", "underline", "decoration-dotted"])

// ---------------------------------------------------------------------------
// Picture-card add tile (the dashed square)
// ---------------------------------------------------------------------------

export const uploadCardAddTileClass = (disabled: boolean) =>
  twMerge([
    "w-[104px]",
    "h-[104px]",
    "rounded",
    "border-2",
    "border-dashed",
    "border-outline-variant",
    "bg-surface-variant/40",
    "flex",
    "flex-col",
    "items-center",
    "justify-center",
    "gap-[4px]",
    "text-on-surface-variant",
    "text-[12px]",
    "cursor-pointer",
    "transition-upthrust",
    disabled ? ["!bg-on-surface/4", "!border-on-surface/15", "cursor-not-allowed"] : ["hover:border-primary", "hover:text-primary"],
  ])

export const uploadCardAddIconClass = () =>
  twMerge(["i-mdi-plus", "text-[20px]", "text-on-surface/40"])

// ---------------------------------------------------------------------------
// Preview overlay (picture zoom — mirrors Image's fullscreen layer)
// ---------------------------------------------------------------------------

export const uploadPreviewClass = () =>
  twMerge([
    "fixed",
    "inset-0",
    "z-1000",
    "bg-black/50",
    "flex",
    "items-center",
    "justify-center",
    "animate-none",
  ])

export const uploadPreviewImgClass = () =>
  twMerge(["max-w-[90vw]", "max-h-[90vh]", "object-contain", "rounded"])

export const uploadPreviewCloseClass = () =>
  twMerge([
    "absolute",
    "top-[16px]",
    "right-[16px]",
    "w-[32px]",
    "h-[32px]",
    "rounded-full",
    "bg-transparent",
    "border-none",
    "text-white",
    "text-[18px]",
    "cursor-pointer",
    "inline-flex",
    "items-center",
    "justify-center",
    "hover:bg-white/10",
  ])

export type UploadListSize = SizeType
