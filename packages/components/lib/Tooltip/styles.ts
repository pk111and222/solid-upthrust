// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

// Tooltip overlay: dark inverse surface, 6px radius, tiny padding, fade+scale.
// Only opacity/transform transition — NEVER top/left (createTrigger
// re-positions on open/scroll/resize; transitioning position makes the layer
// visibly fly across the screen).
const tooltipOverlayVariants = cva(
  [
    "bg-inverse-surface", "text-inverse-on-surface",
    "rounded", "px-[8px]", "py-[4px]", "text-[14px]", "max-w-[250px]",
    "transition-overlay", "duration-fast", "ease-upthrust", "origin-bottom",
    "outline-none", "select-none",
  ],
  {
    variants: {
      visible: {
        true: ["opacity-100", "scale-100"],
        false: ["opacity-0", "scale-95", "pointer-events-none"],
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

export type TooltipPlacementVariant = VariantProps<typeof tooltipOverlayVariants>['placement']

export const tooltipOverlayClass = (variants: VariantProps<typeof tooltipOverlayVariants>) =>
  twMerge(tooltipOverlayVariants(variants))

// The pointing triangle (antd parity): an 8px square rotated 45°, CENTERED on
// the layer edge — the inner half merges into the layer background (same
// color) and only the outer half reads as a triangle. Do NOT set both inline
// `top` and the `-bottom` class: over-constrained absolute positioning makes
// `top` win and drops the arrow fully outside the layer.
export const tooltipArrowClass = (side: 'top' | 'bottom' | 'left' | 'right') =>
  twMerge([
    "absolute", "w-[8px]", "h-[8px]", "bg-inverse-surface",
    "rotate-45", "pointer-events-none",
    side === 'top' && "-top-[4px]",
    side === 'bottom' && "-bottom-[4px]",
    side === 'left' && "-left-[4px]",
    side === 'right' && "-right-[4px]",
  ].filter(Boolean) as string[])
