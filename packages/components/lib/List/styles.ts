// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

// Root: the scroll container (semantic slot `root`). With a numeric height
// the content scrolls; without it the list grows naturally (non-virtual).
// bg-surface + rounded-lg = Listy's container look.
// overflow-anchor-none: Chrome's NATIVE scroll anchoring fights the
// virtual spacer (padTop/padBottom change as rows measure → the browser
// "helpfully" re-anchors scrollTop → visible jump/flicker mid-scroll).
// The headless layer does its OWN anchor compensation (anchorDelta), so the
// native mechanism must stay off.
const listRootVariants = cva(
  ["relative", "w-full", "bg-surface", "rounded-lg", "text-[14px]", "text-on-surface", "overflow-anchor-none"],
  {
    variants: {
      scrollable: {
        true: ["overflow-y-auto", "overscroll-contain"],
        false: [],
      },
    },
    defaultVariants: { scrollable: false },
  }
)

// Item row (semantic slot `item`): Listy tokens — paddingBlock 12 /
// paddingInline 16, split line below (colorSplit ≈ outline-variant), hover
// background (controlItemBgHover ≈ on-surface/4).
const listItemVariants = cva(
  [
    "px-[16px]", "py-[12px]",
    "border-b", "border-b-outline-variant", "border-b-solid",
    "transition-upthrust-fast",
    "hover:bg-on-surface/4",
  ],
  {
    variants: {
      // The LAST rendered row keeps its split line in non-virtual mode? No —
      // antd Listy draws the split under every item including the last
      // inside the container; the container's rounded corners clip it.
      last: {
        true: [],
        false: [],
      },
    },
    defaultVariants: { last: false },
  }
)

// Group header (semantic slot `groupHeader`): sticky layer over the items,
// opaque surface background so rows scrolling beneath are masked. Height
// matches the headless estimate default (40px).
const listGroupHeaderVariants = cva(
  [
    "px-[16px]", "h-[40px]",
    "flex", "items-center",
    "bg-surface", "text-[12px]", "text-on-surface-variant", "font-medium",
    "border-b", "border-b-outline-variant", "border-b-solid",
    "z-1",
  ],
  {
    variants: {
      sticky: {
        true: ["sticky", "top-0"],
        false: [],
      },
    },
    defaultVariants: { sticky: false },
  }
)

// Loading indicator row (infinite loading): centered spinner + text under
// the last row. The glyph is a mask icon — no bg-* on this element.
const listLoadingVariants = cva(
  [
    "flex", "items-center", "justify-center", "gap-[8px]",
    "py-[12px]", "text-[13px]", "text-on-surface-variant",
    "border-b", "border-b-outline-variant", "border-b-solid",
  ],
  { variants: {}, defaultVariants: {} }
)

// Footer slot: after all rows, subtle divider + secondary text.
const listFooterVariants = cva(
  ["px-[16px]", "py-[12px]", "text-[13px]", "text-on-surface-variant"],
  { variants: {}, defaultVariants: {} }
)

export const listRootClass = (variants: VariantProps<typeof listRootVariants>) =>
  twMerge(listRootVariants(variants))
export const listItemClass = (variants: VariantProps<typeof listItemVariants>) =>
  twMerge(listItemVariants(variants))
export const listGroupHeaderClass = (variants: VariantProps<typeof listGroupHeaderVariants>) =>
  twMerge(listGroupHeaderVariants(variants))
export const listLoadingClass = (variants: VariantProps<typeof listLoadingVariants>) =>
  twMerge(listLoadingVariants(variants))
export const listFooterClass = (variants: VariantProps<typeof listFooterVariants>) =>
  twMerge(listFooterVariants(variants))
