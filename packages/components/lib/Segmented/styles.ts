// @unocss-include
import { twMerge } from "tailwind-merge";
import { cva, type VariantProps } from "class-variance-authority";

/**
 * Segmented styles — antd6 spec:
 *  - group: the pill track (bg-surface-variant, radius 6, inner padding 2)
 *  - item: equal-height transparent label; selected paints on-primary over
 *    the SHARED sliding thumb (the thumb renders behind items as an
 *    absolutely positioned white chip with a soft shadow)
 *  - sizes: control heights minus the 2px track padding (28/36/44 →
 *    item 24/32/40)
 *  - block: the group stretches to full width and items share it evenly
 */
const segmentedGroupVariants = cva(
  [
    "relative",
    "inline-flex",
    "items-center",
    "p-[2px]",
    "rounded",
    "bg-surface-variant",
    "border",
    "border-solid",
    "border-transparent",
    "box-border",
  ],
  {
    variants: {
      size: {
        small: [],
        middle: [],
        large: [],
      },
      block: {
        true: ["flex", "w-full"],
        false: [],
      },
      disabled: {
        true: ["opacity-60"],
        false: [],
      },
      status: {
        default: [],
        error: ["!border-error"],
        warning: ["!border-[#faad14]"],
      },
    },
    defaultVariants: { size: "middle", block: false, disabled: false, status: "default" },
  },
)

export const segmentedGroupClass = (v: VariantProps<typeof segmentedGroupVariants>) =>
  twMerge(segmentedGroupVariants(v))

// ---------------------------------------------------------------------------
// The sliding thumb — absolutely positioned, driven by inline left/width
// (measured in the component), transition on left+width+opacity.
// ---------------------------------------------------------------------------

export const segmentedThumbClass = () =>
  twMerge([
    "absolute",
    "top-[2px]",
    "bottom-[2px]",
    "left-0",
    "rounded-sm",
    "bg-surface",
    "shadow",
    "pointer-events-none",
    "transition-upthrust",
    // Guard against a first-paint flash at (0,0): opacity flips on only
    // once the first measurement lands (inline style sets it to 1).
    "opacity-0",
  ])

// ---------------------------------------------------------------------------
// Items
// ---------------------------------------------------------------------------

const segmentedItemVariants = cva(
  [
    "relative",
    "z-[1]",
    "inline-flex",
    "items-center",
    "justify-center",
    "gap-[4px]",
    "px-[11px]",
    "rounded-sm",
    "whitespace-nowrap",
    "select-none",
    "cursor-pointer",
    "transition-upthrust-fast",
    "text-on-surface-variant",
    "hover:text-on-surface",
  ],
  {
    variants: {
      size: {
        small: ["h-[24px]", "text-[12px]", "px-[7px]", "gap-[4px]"],
        middle: ["h-[32px]", "text-[14px]", "px-[11px]", "gap-[4px]"],
        large: ["h-[40px]", "text-[16px]", "px-[15px]", "gap-[6px]"],
      },
      selected: {
        true: ["!text-on-surface", "font-medium"],
        false: [],
      },
      disabled: {
        true: ["cursor-not-allowed", "!text-on-surface/25", "hover:!text-on-surface/25", "pointer-events-none"],
        false: [],
      },
      focused: {
        true: ["text-on-surface"],
        false: [],
      },
      block: {
        true: ["flex-1", "min-w-0"],
        false: [],
      },
    },
    defaultVariants: {
      size: "middle",
      selected: false,
      disabled: false,
      focused: false,
      block: false,
    },
  },
)

export const segmentedItemClass = (v: VariantProps<typeof segmentedItemVariants>) =>
  twMerge(segmentedItemVariants(v))

export const segmentedItemIconClass = () =>
  twMerge(["text-[14px]", "shrink-0", "leading-none"])

// The hidden keyboard anchor input (roving tabindex alternative): a single
// focusable element inside the group.
export const segmentedFocusAnchorClass = () =>
  twMerge(["absolute", "opacity-0", "w-0", "h-0", "pointer-events-none"])
