// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

// Popconfirm overlay: surface card, 8px radius, standard shadow, fade+scale.
// Only opacity/transform transition — NEVER top/left (createTrigger
// re-positions on open/scroll/resize; transitioning position makes the layer
// visibly fly across the screen).
const popconfirmOverlayVariants = cva(
  [
    "bg-surface", "rounded-lg", "shadow",
    "transition-overlay", "duration-fast", "ease-upthrust", "origin-bottom",
    "outline-none",
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

const popconfirmMessageVariants = cva(
  ["text-[14px]", "text-on-surface", "leading-[1.5714]", "min-w-[180px]", "max-w-[300px]"],
  {
    variants: {
      hasDescription: {
        true: ["font-medium"],
        false: [],
      },
    },
    defaultVariants: { hasDescription: false },
  }
)

const popconfirmDescriptionVariants = cva(
  ["text-[14px]", "text-on-surface-variant", "leading-[1.5714]", "mt-[4px]"],
  { variants: {}, defaultVariants: {} }
)

const popconfirmIconVariants = cva(
  ["shrink-0", "text-[16px]", "text-[#faad14]", "i-mdi-help-circle-outline"],
  { variants: {}, defaultVariants: {} }
)

const popconfirmActionsVariants = cva(
  ["flex", "justify-end", "gap-[8px]", "mt-[10px]"],
  { variants: {}, defaultVariants: {} }
)

export const popconfirmOverlayClass = (variants: VariantProps<typeof popconfirmOverlayVariants>) =>
  twMerge(popconfirmOverlayVariants(variants))
export const popconfirmMessageClass = (variants: VariantProps<typeof popconfirmMessageVariants>) =>
  twMerge(popconfirmMessageVariants(variants))
export const popconfirmDescriptionClass = (variants: VariantProps<typeof popconfirmDescriptionVariants>) =>
  twMerge(popconfirmDescriptionVariants(variants))
export const popconfirmIconClass = (variants: VariantProps<typeof popconfirmIconVariants>) =>
  twMerge(popconfirmIconVariants(variants))
export const popconfirmActionsClass = (variants: VariantProps<typeof popconfirmActionsVariants>) =>
  twMerge(popconfirmActionsVariants(variants))

// The pointing triangle (antd parity): an 8px square rotated 45°, CENTERED on
// the layer edge — the inner half merges into the layer background (same
// color) and only the outer half reads as a triangle. Do NOT set both inline
// `top` and the `-bottom` class: over-constrained absolute positioning makes
// `top` win and drops the arrow fully outside the layer.
export const popconfirmArrowClass = (side: 'top' | 'bottom' | 'left' | 'right') =>
  twMerge([
    "absolute", "w-[8px]", "h-[8px]", "bg-surface",
    "rotate-45", "pointer-events-none",
    side === 'top' && "-top-[4px]",
    side === 'bottom' && "-bottom-[4px]",
    side === 'left' && "-left-[4px]",
    side === 'right' && "-right-[4px]",
  ].filter(Boolean) as string[])
