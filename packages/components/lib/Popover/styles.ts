// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

// Popover overlay: surface card, 8px radius, standard shadow, fade.
// Only opacity transitions — NEVER position or transform (createTrigger
// re-positions on open/scroll/resize; transitioning position makes the layer
// visibly fly across the screen).
const popoverOverlayVariants = cva(
  [
    "bg-surface", "rounded-lg", "shadow",
    "transition-opacity", "duration-fast", "ease-upthrust", "origin-bottom",
    "outline-none",
  ],
  {
    variants: {
      visible: {
        true: ["opacity-100"],
        false: ["opacity-0", "pointer-events-none"],
      },
      placement: {
        bottomLeft: ["origin-top-left"],
        bottomRight: ["origin-top-right"],
        bottom: ["origin-top"],
        topLeft: ["origin-bottom-left"],
        topRight: ["origin-bottom-right"],
        top: ["origin-bottom"],
        leftTop: ["origin-top-right"],
        leftBottom: ["origin-bottom-right"],
        left: ["origin-right"],
        rightTop: ["origin-top-left"],
        rightBottom: ["origin-bottom-left"],
        right: ["origin-left"],
      },
    },
    defaultVariants: { visible: false, placement: "top" },
  }
)

const popoverTitleVariants = cva(
  ["px-3", "pt-3", "pb-[8px]", "text-[16px]", "font-medium", "text-on-surface", "min-w-[160px]", "leading-[1.5]"],
  { variants: {}, defaultVariants: {} }
)

// No-title popovers still need top padding — the title block normally
// provides it. antd's .ant-popover-inner has padding on the wrapper itself.
const popoverInnerVariants = cva(
  ["px-3", "pb-3", "pt-3", "text-[14px]", "text-on-surface", "leading-[1.5714]"],
  {
    variants: {
      hasTitle: {
        true: ["pt-0"],
        false: [],
      },
    },
    defaultVariants: { hasTitle: false },
  }
)

export const popoverOverlayClass = (variants: VariantProps<typeof popoverOverlayVariants>) =>
  twMerge(popoverOverlayVariants(variants))
export const popoverTitleClass = (variants: VariantProps<typeof popoverTitleVariants>) =>
  twMerge(popoverTitleVariants(variants))
export const popoverInnerClass = (variants: VariantProps<typeof popoverInnerVariants>) =>
  twMerge(popoverInnerVariants(variants))

// The pointing triangle (antd parity): an 8px square rotated 45°, CENTERED on
// the layer edge — the inner half merges into the layer background (same
// color) and only the outer half reads as a triangle. Do NOT set both inline
// `top` and the `-bottom` class: over-constrained absolute positioning makes
// `top` win and drops the arrow fully outside the layer.
export const popoverArrowClass = (side: 'top' | 'bottom' | 'left' | 'right') =>
  twMerge([
    "absolute", "w-[8px]", "h-[8px]", "bg-surface",
    "rotate-45", "pointer-events-none",
    side === 'top' && "-top-[4px]",
    side === 'bottom' && "-bottom-[4px]",
    side === 'left' && "-left-[4px]",
    side === 'right' && "-right-[4px]",
  ].filter(Boolean) as string[])
