// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

// Mask layer: same scrim family as Modal.
const drawerMaskVariants = cva(
  ["fixed", "inset-0", "bg-black/45", "transition-opacity", "duration-mid", "ease-upthrust"],
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

// The panel wrapper hugs one screen edge; the panel slides along that edge.
// placement owns both the anchoring classes and the slide direction.
const drawerWrapperVariants = cva(
  ["fixed", "inset-0", "outline-none"],
  {
    variants: {
      placement: {
        left: [],
        right: [],
        top: [],
        bottom: [],
      },
    },
    defaultVariants: { placement: "right" },
  }
)

// Panel: elevated surface, no radius on the anchored edge (antd drawer has
// square corners on the screen edge side). Slide via translate — the panel
// starts off-screen and eases in. The anchored axes span the FULL viewport
// (antd drawers are edge-to-edge); only the thickness axis carries a max so an
// oversized explicit width/height still leaves breathing room.
const drawerPanelVariants = cva(
  [
    "absolute", "bg-surface", "shadow", "flex", "flex-col", "outline-none",
    "transition-transform", "duration-mid", "ease-upthrust",
    "max-w-[100vw]", "max-h-[100vh]",
  ],
  {
    variants: {
      placement: {
        left: ["left-0", "top-0", "bottom-0", "rounded-r-lg"],
        right: ["right-0", "top-0", "bottom-0", "rounded-l-lg"],
        top: ["top-0", "left-0", "right-0", "rounded-b-lg"],
        bottom: ["bottom-0", "left-0", "right-0", "rounded-t-lg"],
      },
      visible: {
        true: ["translate-x-0", "translate-y-0"],
        // Slide back off-screen toward the anchored edge. Both axes are
        // declared so twMerge keeps only the placement-relevant one.
        false: [],
      },
    },
    compoundVariants: [
      // Off-screen transforms per placement. compoundVariants are safe here:
      // pure transforms with no color classes, and each pair is exclusive.
      { placement: "left", visible: false, class: ["-translate-x-full"] },
      { placement: "right", visible: false, class: ["translate-x-full"] },
      { placement: "top", visible: false, class: ["-translate-y-full"] },
      { placement: "bottom", visible: false, class: ["translate-y-full"] },
    ],
    defaultVariants: { placement: "right", visible: false },
  }
)

// Header: title + close row, borderless bottom (antd keeps hairline via
// header styles; we use border-outline-variant/40 like Divider).
const drawerHeaderVariants = cva(
  [
    "flex", "items-center", "justify-between",
    "px-lg", "pt-md", "pb-sm",
    "border-b", "border-solid", "border-outline-variant/40",
  ],
  {
    variants: {
      // Headerless drawer keeps no reserved block.
      bare: { true: [], false: [] },
    },
    defaultVariants: { bare: false },
  }
)

const drawerTitleVariants = cva(
  ["text-[16px]", "font-medium", "text-on-surface", "leading-[1.5]", "break-words", "flex-1", "min-w-0"],
  { variants: {}, defaultVariants: {} }
)

// Body: scrollable flex-1 region.
const drawerBodyVariants = cva(
  ["flex-1", "overflow-auto", "px-lg", "py-md", "text-[14px]", "text-on-surface", "leading-[1.5714]", "break-words"],
  { variants: {}, defaultVariants: {} }
)

// Footer: right-aligned actions over a top hairline.
const drawerFooterVariants = cva(
  [
    "flex", "justify-end", "gap-xs",
    "px-lg", "pt-sm", "pb-lg",
    "border-t", "border-solid", "border-outline-variant/40",
  ],
  { variants: {}, defaultVariants: {} }
)

// Close button inside the header row (22px hit area, Alert family).
const drawerCloseVariants = cva(
  [
    "inline-flex", "items-center", "justify-center", "shrink-0",
    "w-[22px]", "h-[22px]",
    "text-[14px]", "text-on-surface-variant",
    "cursor-pointer", "border-none",
    "rounded-sm", "outline-none",
    "transition-upthrust-fast",
    "hover:text-on-surface", "hover:bg-on-surface/6",
  ],
  { variants: {}, defaultVariants: {} }
)

export const drawerMaskClass = (variants: VariantProps<typeof drawerMaskVariants>) =>
  twMerge(drawerMaskVariants(variants))
export const drawerWrapperClass = (variants: VariantProps<typeof drawerWrapperVariants>) =>
  twMerge(drawerWrapperVariants(variants))
export const drawerPanelClass = (variants: VariantProps<typeof drawerPanelVariants>) =>
  twMerge(drawerPanelVariants(variants))
export const drawerHeaderClass = (variants: VariantProps<typeof drawerHeaderVariants>) =>
  twMerge(drawerHeaderVariants(variants))
export const drawerTitleClass = (variants: VariantProps<typeof drawerTitleVariants>) =>
  twMerge(drawerTitleVariants(variants))
export const drawerBodyClass = (variants: VariantProps<typeof drawerBodyVariants>) =>
  twMerge(drawerBodyVariants(variants))
export const drawerFooterClass = (variants: VariantProps<typeof drawerFooterVariants>) =>
  twMerge(drawerFooterVariants(variants))
export const drawerCloseClass = (variants: VariantProps<typeof drawerCloseVariants>) =>
  twMerge(drawerCloseVariants(variants))

export const DRAWER_CLOSE_ICON = 'i-mdi-close'

// antd size presets (default 378px, large 736px) — horizontal placements
// map to width, vertical to height.
export const DRAWER_SIZE_PRESET: Record<'default' | 'large', number> = {
  default: 378,
  large: 736,
}
