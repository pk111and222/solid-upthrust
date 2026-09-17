// @unocss-include
import { twMerge } from "tailwind-merge";
import { cva, type VariantProps } from "class-variance-authority";

/**
 * FloatButton styles — antd6 spec:
 *  - button: 40×40 circle (square variant: 40×40 rounded), elevated shadow,
 *    primary tint on hover; icon centered
 *  - shape: circle (default) | square (rounded-lg like a mini card)
 *  - group: children fan out along `direction` with the trigger at the base;
 *    the fan container is a flex column/row REVERSED so the trigger sits at
 *    the visual bottom/right of the stack (antd renders trigger LAST)
 *  - entry/exit: scale + opacity through transition-overlay
 */
import type { FloatButtonDirection } from 'upthrust-competence'

const floatButtonVariants = cva(
  [
    "inline-flex",
    "items-center",
    "justify-center",
    "cursor-pointer",
    "select-none",
    "bg-surface",
    "text-on-surface",
    "shadow",
    "transition-upthrust",
    "hover:bg-primary-container",
    "hover:text-on-surface",
    "outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-primary/20",
  ],
  {
    variants: {
      shape: {
        circle: ["rounded-full"],
        square: ["rounded-lg"],
      },
      size: {
        middle: ["w-[40px]", "h-[40px]", "text-[18px]"],
        large: ["w-[48px]", "h-[48px]", "text-[20px]"],
      },
      hidden: {
        true: ["opacity-0", "scale-75", "pointer-events-none"],
        false: ["opacity-100", "scale-100"],
      },
      disabled: {
        true: ["cursor-not-allowed", "!bg-on-surface/4", "!text-on-surface/25", "pointer-events-none"],
        false: [],
      },
    },
    defaultVariants: {
      shape: "circle",
      size: "middle",
      hidden: false,
      disabled: false,
    },
  },
)

export const floatButtonClass = (v: VariantProps<typeof floatButtonVariants>) =>
  twMerge(floatButtonVariants(v))

// ---------------------------------------------------------------------------
// Group — the stack + fan-out container
// ---------------------------------------------------------------------------

const floatGroupVariants = cva(
  ["fixed", "z-[900]", "flex", "items-end", "gap-[16px]"],
  {
    variants: {
      direction: {
        // Children sit ABOVE the trigger; the stack reads bottom-up.
        up: ["flex-col-reverse"],
        down: ["flex-col"],
        left: ["flex-row-reverse"],
        right: ["flex-row"],
      },
      placement: {
        rt: ["right-[24px]", "bottom-[40px]"],
        rb: ["right-[24px]", "bottom-[24px]"],
        lt: ["left-[24px]", "bottom-[40px]"],
        lb: ["left-[24px]", "bottom-[24px]"],
      },
    },
    defaultVariants: { direction: "up", placement: "rt" },
  },
)

export const floatGroupClass = (v: VariantProps<typeof floatGroupVariants>) =>
  twMerge(floatGroupVariants(v))

/** The fanned children wrapper — collapses via grid-rows trick (max-height
 * animation without measuring). Reversed axes must ALSO reverse the fan gap
 * direction; the transition lives on each child instead (see itemClass). */
export const floatGroupItemsClass = (direction: FloatButtonDirection) =>
  twMerge([
    "flex",
    "items-center",
    "gap-[16px]",
    direction === 'up' || direction === 'down' ? "flex-col" : "flex-row",
    direction === 'up' && "order-1",
    // Children animate in staggered via inline transition-delay; visibility
    // collapses instantly so the fan opens/closes cleanly.
  ])

export const floatGroupItemClass = () =>
  twMerge([
    "transition-overlay",
    "duration-normal",
  ])

// ---------------------------------------------------------------------------
// BackTop trigger glyph
// ---------------------------------------------------------------------------

export const backTopIconClass = () =>
  twMerge(["i-mdi-arrow-up", "text-[20px]"])

export const floatTriggerIconClass = (open: boolean) =>
  twMerge([
    "text-[20px]",
    "transition-transform",
    "duration-200",
    open ? "rotate-45" : "",
  ])
