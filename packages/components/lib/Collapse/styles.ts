// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

// Root: the bordered stack. Default (bordered) draws a hairline around the
// whole group AND between panels (the divider rides on the panel's header,
// not a separate element). Ghost drops all borders/backgrounds.
// No flex — panels are block rows so the group's width is content-driven
// (antd Collapse is a block with 100% width of its container by default,
// but inline usage composes better in B-end forms; demos wrap as needed).
const collapseRootVariants = cva(
  ["w-full", "rounded-lg", "bg-surface"],
  {
    variants: {
      bordered: {
        true: ["border", "border-solid", "border-outline-variant"],
        false: [],
      },
    },
    defaultVariants: { bordered: true },
  }
)

// One panel: the header + the collapsible content region. In bordered mode
// non-last panels carry the bottom hairline (group-level divider). Ghost
// panels get no divider.
const collapsePanelVariants = cva(
  ["w-full"],
  {
    variants: {
      bordered: {
        true: ["border-b", "border-b-outline-variant", "border-b-solid"],
        false: [],
      },
      last: {
        true: ["border-b-0"],
        false: [],
      },
    },
    compoundVariants: [
      // Only bordered non-last panels keep the divider.
      { bordered: true, last: true, class: ["!border-b-0"] },
    ],
    defaultVariants: { bordered: true, last: false },
  }
)

// Panel header: one row, 40px tall (antd collapse header = 12px*2 padding +
// 16px line ≈ 40px optical), label left, expand icon right. It is a <button>
// for free focus/keyboard; ghost mode dims the hover tint.
// Sizing uses py instead of a fixed height: an extra/label with two lines
// (children nodes) must grow the header instead of clipping.
const collapseHeaderVariants = cva(
  [
    "flex", "w-full", "items-center", "gap-[8px]",
    "py-[11px]", "px-[16px]",
    "text-[14px]", "text-on-surface", "leading-[22px]",
    "cursor-pointer", "select-none", "text-left",
    "bg-transparent", "border-none", "outline-none",
    "transition-upthrust-fast",
  ],
  {
    variants: {
      ghost: {
        true: ["hover:bg-on-surface/4"],
        false: ["hover:bg-on-surface/4"],
      },
      disabled: {
        true: ["cursor-not-allowed", "text-on-surface/25", "hover:bg-transparent", "focus-visible:outline-none"],
        false: ["focus-visible:outline", "focus-visible:outline-2", "focus-visible:outline-primary/40"],
      },
    },
    defaultVariants: { ghost: false, disabled: false },
  }
)

// Header label: flex-1 so the expand icon pins right; min-w-0 for ellipsis
// when the consumer passes a long label.
const collapseHeaderLabelVariants = cva(
  ["flex-1", "min-w-0", "truncate"],
  { variants: {}, defaultVariants: {} }
)

// The collapsible region: grid-template-rows 0fr→1fr animation. The 0fr/1fr
// trick animates an UNKNOWN content height with pure CSS — the inner content
// div (collapseContent) carries min-height: 0 (via min-h-0) which is what
// lets the row track actually shrink to zero.
// grid-template-rows is transitioned directly; UnoCSS arbitrary-value
// transition lists would need the preset's interceptor — instead the open
// and closed states are separate classes and the transition property is
// spelled out via transition-[grid-template-rows] which wind4 handles
// natively (grid-template-rows IS in the wind4 transition whitelist).
const collapseRegionVariants = cva(
  [
    "grid", "overflow-hidden",
    "transition-[grid-template-rows]", "duration-slow", "ease-upthrust",
  ],
  {
    variants: {
      open: {
        true: ["grid-rows-[1fr]"],
        false: ["grid-rows-[0fr]"],
      },
    },
    defaultVariants: { open: false },
  }
)

// Content: the single grid cell. min-h-0 + overflow-hidden is REQUIRED —
// without BOTH the cell refuses to collapse below its content height and 0fr
// does nothing (min-height:0 alone lets the BOX shrink but the track's
// min-content still sees the in-flow children; overflow:hidden turns the
// cell into a scroll container whose min-content contribution is 0).
// Padding lives on an INNER div, not on the cell: the cell's own padding
// would count toward the track's min-content and floor the collapsed height
// at padding-height (exactly the 16px bug: py-16 + pt-0 left pb 16px).
const collapseContentVariants = cva(
  ["min-h-0", "overflow-hidden"],
  { variants: {}, defaultVariants: {} }
)

// Inner padding wrapper: keeps the content's vertical rhythm OUT of the
// animated track sizing.
const collapseContentInnerVariants = cva(
  ["px-[16px]", "pb-[16px]", "text-[14px]", "text-on-surface-variant", "leading-[1.5714]"],
  { variants: {}, defaultVariants: {} }
)

// Expand icon: rotates 90° when open (right arrow default). It is a CHILD
// span of the header button — never put a bg-* on the same element.
const collapseExpandIconVariants = cva(
  [
    "inline-flex", "shrink-0",
    "text-[16px]", "text-on-surface",
    "transition-transform", "duration-slow", "ease-upthrust",
  ],
  {
    variants: {
      open: {
        true: ["rotate-90"],
        false: [],
      },
    },
    defaultVariants: { open: false },
  }
)

export const collapseRootClass = (variants: VariantProps<typeof collapseRootVariants>) =>
  twMerge(collapseRootVariants(variants))
export const collapsePanelClass = (variants: VariantProps<typeof collapsePanelVariants>) =>
  twMerge(collapsePanelVariants(variants))
export const collapseHeaderClass = (variants: VariantProps<typeof collapseHeaderVariants>) =>
  twMerge(collapseHeaderVariants(variants))
export const collapseHeaderLabelClass = (variants: VariantProps<typeof collapseHeaderLabelVariants>) =>
  twMerge(collapseHeaderLabelVariants(variants))
export const collapseRegionClass = (variants: VariantProps<typeof collapseRegionVariants>) =>
  twMerge(collapseRegionVariants(variants))
export const collapseContentClass = (variants: VariantProps<typeof collapseContentVariants>) =>
  twMerge(collapseContentVariants(variants))
export const collapseContentInnerClass = (variants: VariantProps<typeof collapseContentInnerVariants>) =>
  twMerge(collapseContentInnerVariants(variants))
export const collapseExpandIconClass = (variants: VariantProps<typeof collapseExpandIconVariants>) =>
  twMerge(collapseExpandIconVariants(variants))

export const COLLAPSE_EXPAND_ICON = 'i-mdi-chevron-right'
