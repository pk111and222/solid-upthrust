// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

// Mask layer: full-screen scrim above the page. pointer-events enabled only
// while mounted so the closed dialog never swallows clicks.
const modalMaskVariants = cva(
  [
    "fixed", "inset-0", "bg-black/45",
    "transition-opacity", "duration-mid", "ease-upthrust",
  ],
  {
    variants: {
      visible: {
        true: ["opacity-100"],
        false: ["opacity-0"],
      },
    },
    defaultVariants: { visible: false },
  }
)

// Wrapper: full-screen scroll region centering the panel (ant's wrap role).
// pointer-events-none when closed so clicks fall through to the page.
const modalWrapperVariants = cva(
  [
    "fixed", "inset-0", "overflow-auto", "outline-none",
    "transition-opacity", "duration-mid", "ease-upthrust",
  ],
  {
    variants: {
      visible: {
        true: ["opacity-100"],
        false: ["opacity-0", "pointer-events-none"],
      },
      centered: {
        true: ["flex", "items-center", "justify-center", "p-md"],
        false: ["py-[100px]"],
      },
    },
    defaultVariants: { visible: false, centered: false },
  }
)

// The dialog panel: elevated surface, lg radius, standard shadow. Enter/leave
// is a zoom (scale .96 → 1) matching antd's zoom motion.
const modalPanelVariants = cva(
  [
    "relative", "bg-surface", "rounded-lg", "shadow", "outline-none",
    "mx-auto", "w-full", "max-w-[calc(100vw-32px)]",
    "transition-overlay", "duration-mid", "ease-upthrust",
  ],
  {
    variants: {
      visible: {
        true: ["opacity-100", "scale-100"],
        false: ["opacity-0", "scale-95"],
      },
    },
    defaultVariants: { visible: false },
  }
)

// Header: title left, close button right (16px title, antd fontSizeLG family).
const modalHeaderVariants = cva(
  ["px-lg", "pt-md", "pb-xs"],
  { variants: {}, defaultVariants: {} }
)

const modalTitleVariants = cva(
  ["text-[16px]", "font-medium", "text-on-surface", "leading-[1.5]", "pr-[32px]", "break-words"],
  { variants: {}, defaultVariants: {} }
)

// Body: padding lg (antd 24px), scrollable when tall.
const modalBodyVariants = cva(
  ["px-lg", "py-sm", "text-[14px]", "text-on-surface", "leading-[1.5714]", "break-words"],
  {
    variants: {
      // Bare modal (no header/footer) collapses vertical padding to lg.
      bare: { true: ["py-lg"], false: [] },
    },
    defaultVariants: { bare: false },
  }
)

// Footer: right-aligned action row, borderless (antd keeps no divider).
const modalFooterVariants = cva(
  ["px-lg", "pt-sm", "pb-lg", "flex", "justify-end", "gap-xs"],
  { variants: {}, defaultVariants: {} }
)

// Close button: absolute top-right, 22px square hit area (Alert family).
// NO bg-transparent: the close glyph is an i-mdi-* mask on this SAME element,
// and mask icons paint via `background-color: currentColor` — a bg-* class on
// the same element overrides it (same specificity, generated-CSS order decides)
// and the glyph goes invisible. button's UA background is already transparent.
const modalCloseVariants = cva(
  [
    "absolute", "top-[14px]", "right-[14px]",
    "inline-flex", "items-center", "justify-center",
    "w-[22px]", "h-[22px]",
    "text-[14px]", "text-on-surface-variant",
    "cursor-pointer", "border-none",
    "rounded-sm", "outline-none",
    "transition-upthrust-fast",
    "hover:text-on-surface", "hover:bg-on-surface/6",
  ],
  { variants: {}, defaultVariants: {} }
)

export const modalMaskClass = (variants: VariantProps<typeof modalMaskVariants>) =>
  twMerge(modalMaskVariants(variants))
export const modalWrapperClass = (variants: VariantProps<typeof modalWrapperVariants>) =>
  twMerge(modalWrapperVariants(variants))
export const modalPanelClass = (variants: VariantProps<typeof modalPanelVariants>) =>
  twMerge(modalPanelVariants(variants))
export const modalHeaderClass = (variants: VariantProps<typeof modalHeaderVariants>) =>
  twMerge(modalHeaderVariants(variants))
export const modalTitleClass = (variants: VariantProps<typeof modalTitleVariants>) =>
  twMerge(modalTitleVariants(variants))
export const modalBodyClass = (variants: VariantProps<typeof modalBodyVariants>) =>
  twMerge(modalBodyVariants(variants))
export const modalFooterClass = (variants: VariantProps<typeof modalFooterVariants>) =>
  twMerge(modalFooterVariants(variants))
export const modalCloseClass = (variants: VariantProps<typeof modalCloseVariants>) =>
  twMerge(modalCloseVariants(variants))

export const MODAL_CLOSE_ICON = 'i-mdi-close'
