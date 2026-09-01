// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

// Card root: surface block with LG radius. Variant matrix (antd6):
//   outlined   = 1px hairline, no shadow
//   borderless = tertiary shadow (antd's boxShadowTertiary — a soft lift)
//   inner      = nested card — tighter radius, grey header band
//   hoverable  = border fades + card lifts on a smooth Y-translate shadow
// All visual classes are scannable literals inside variant values.
const cardVariants = cva(
  ["relative", "bg-surface", "rounded-lg", "text-on-surface", "text-[14px]"],
  {
    variants: {
      variant: {
        outlined: ["border", "border-solid", "border-outline-variant"],
        borderless: ["shadow-tertiary"],
      },
      inner: {
        true: ["rounded"],
        false: [],
      },
      hoverable: {
        true: [
          "cursor-pointer",
          "transition-upthrust",
          // Lift: hairline fades under a soft shadow and the card rises 2px.
          // box-shadow + transform both live in the same transition, so the
          // float reads as one motion (antd hoverable, softened).
          "hover:shadow",
          "hover:border-transparent",
          "hover:-translate-y-[2px]",
        ],
        false: [],
      },
      loading: {
        true: ["overflow-hidden"],
        false: [],
      },
    },
    defaultVariants: { variant: "outlined", inner: false, hoverable: false, loading: false },
  }
)

// Card head: the title/extra row (and tabs under it). antd geometry:
// headerHeight = fontSizeLG*lineHeightLG + padding*2 = 16*1.5714 + 32 ≈ 57px,
// bottom hairline, top radius (the head is the card's top cap).
// The wrapper row carries the vertical breathing room (py) so the hairline
// sits flush against the title block, not over body padding.
const cardHeadVariants = cva(
  [
    "flex", "flex-col", "justify-center",
    "px-[24px]",
    "text-on-surface", "font-medium",
    "rounded-t-lg",
    "border-b", "border-b-solid", "border-b-outline-variant",
  ],
  {
    variants: {
      size: {
        // antd small: headerHeightSM = 14*1.5714 + 16 ≈ 38px, fontSize 14.
        // pt/pb split (not py) so the grid variant's pb-0 lands in the same
        // twMerge conflict group and reliably wins over the base padding.
        small: ["pt-[11px]", "pb-[11px]", "px-[12px]", "text-[14px]"],
        middle: ["pt-[16px]", "pb-[16px]", "text-[16px]"],
      },
      inner: {
        // inner card: grey header band + compact title row.
        true: ["bg-surface-variant", "text-[14px]", "pt-[9px]", "pb-[9px]"],
        false: [],
      },
      hasTabs: {
        // Tabs replace the head's own hairline (the tab bar carries it),
        // and the title row keeps its padding while tabs strip it (antd
        // contain-tabs collapses the head's min-height to the title row).
        true: ["border-b-0", "py-0"],
        false: [],
      },
      grid: {
        // contain-grid: the grid's first row of inset-shadow lines sits
        // flush against the head — the head's BOTTOM padding would read
        // as a stray white band between title and grid (antd strips it
        // via the body's negative margin; we drop the padding instead).
        true: ["pb-0"],
        false: [],
      },
    },
    defaultVariants: { size: "middle", inner: false, hasTabs: false, grid: false },
  }
)

// head wrapper: title left, extra right. When the head has NO tabs the
// wrapper itself carries the vertical padding (py); with tabs the title row
// needs ONLY the top half — the tab strip below (Tabs item py-8/12) already
// provides the bottom breathing, and a full py here would double it.
const cardHeadWrapperVariants = cva(
  ["w-full", "flex", "items-center", "gap-[12px]"],
  {
    variants: {
      padded: {
        // hasTabs branch: top padding only (the tab bar owns the gap below).
        true: ["pt-[16px]", "pb-[4px]"],
        false: [],
      },
    },
    defaultVariants: { padded: false },
  }
)

// Title: flex-1 with ellipsis (antd textEllipsis).
const cardTitleVariants = cva(
  ["flex-1", "min-w-0", "truncate", "font-medium", "leading-[1.5]"],
  { variants: {}, defaultVariants: {} }
)

// Title accent bar: 3px primary pill — the B-end list-row cue that reads
// at any zoom. Hidden when the head is only `extra`.
const cardTitleAccentVariants = cva(
  ["shrink-0", "w-[3px]", "h-[14px]", "rounded-full", "bg-primary", "opacity-90"],
  {
    variants: {
      size: {
        small: ["h-[12px]"],
        middle: ["h-[14px]"],
      },
    },
    defaultVariants: { size: "middle" },
  }
)

// Extra: pushed to the inline-end, normal weight (antd extraColor).
const cardExtraVariants = cva(
  ["ml-auto", "shrink-0", "text-[14px]", "font-normal", "text-on-surface", "flex", "items-center", "gap-[8px]"],
  { variants: {}, defaultVariants: {} }
)

// Tabs block under the wrapper: the FIRST tab's TEXT aligns with the head
// title's text. Title text starts at 24(head px) + 3(accent) + 12(gap) = 39px;
// line tabs have no item padding, so the strip padding IS the text start.
// 39 = 24 + 15 keeps it on the spacing grid (antd tabs sit slightly inset
// from the title — 15 reads closer than 39's full flush).
const cardTabsVariants = cva(
  ["clear-both", "text-on-surface", "font-normal", "text-[14px]", "pl-[39px]", "pr-[24px]"],
  { variants: {}, defaultVariants: {} }
)

// Cover: full-bleed media slot. The wrapper clips the top radius and meets
// the outlined hairline edge-to-edge (antd's negative-margin cover now via
// the child's w-full + the wrapper's own zero padding; the -1px offset is
// NOT used — our border draws inside the radius, so the cover simply
// fills up to it). Direct child stretches to 100% width; hoverable cards
// zoom it slightly (transform-only, compositor-friendly).
const cardCoverVariants = cva(
  [
    "overflow-hidden", "rounded-t-lg",
    "bg-surface-variant",
    "[&>*]:!block", "[&>*]:w-full",
    "[&>*]:transition-transform", "[&>*]:duration-slow", "[&>*]:ease-upthrust",
  ],
  {
    variants: {
      zoom: {
        true: ["[&>*]:hover:scale-[1.03]"],
        false: [],
      },
    },
    defaultVariants: { zoom: false },
  }
)

// Body: paddingLG=24 default, 12 small; inner uses 16y/24x. First-child
// body keeps top radius when no head/cover precedes it; a following
// actions bar takes the bottom radius instead.
// NOTE: the inner variant must spell the FULL padding in ONE p-* class —
// a px-* + py-* + p-0 sequence would let twMerge keep only p-0 and the
// inner paddings would silently vanish.
const cardBodyVariants = cva(
  ["rounded-b-lg"],
  {
    variants: {
      size: {
        small: ["p-[12px]"],
        middle: ["p-[24px]"],
      },
      inner: {
        // antd inner body: padding 16px (block) 24px (inline) — single
        // arbitrary compound so nothing can clobber it.
        true: ["p-[16px_24px]"],
        false: [],
      },
      first: {
        // No head/cover above → the body is the top cap too.
        true: ["rounded-t-lg"],
        false: [],
      },
      last: {
        // Actions bar follows → body keeps no bottom radius (antd
        // &:not(:last-child) zeroes the end radii).
        false: ["rounded-b-none"],
        true: [],
      },
      grid: {
        // contain-grid: body becomes a flex-wrap stage and the grid's own
        // shadow borders replace the padding (antd margin -1 trick).
        true: ["flex", "flex-wrap", "p-0"],
        false: [],
      },
    },
    defaultVariants: { size: "middle", inner: false, first: false, last: true, grid: false },
  }
)

// Actions bar: flex row of equal li columns, top hairline, bottom radius.
const cardActionsVariants = cva(
  [
    "m-0", "p-0", "list-none", "flex",
    "bg-surface",
    "border-t", "border-t-solid", "border-t-outline-variant",
    "rounded-b-lg",
  ],
  { variants: {}, defaultVariants: {} }
)

// Action item: equal column; the BETWEEN divider is drawn via the
// `divide-x` on the parent list (never a border-l + border-l-0 pair —
// twMerge resolves that conflict to border-l-0 and the divider never
// appears).
const cardActionItemVariants = cva(
  ["flex-1", "text-center", "py-[12px]", "px-[8px]", "text-on-surface-variant"],
  { variants: {}, defaultVariants: {} }
)
const cardActionItemDividerVariants = cva(
  ["divide-x", "divide-x-solid", "divide-outline-variant"],
  { variants: {}, defaultVariants: {} }
)

// The clickable span inside each action: roomy hit area (min 2× icon),
// hover fills a subtle tint and turns the icon primary.
const cardActionSpanVariants = cva(
  [
    "inline-flex", "items-center", "justify-center",
    "min-w-[28px]", "min-h-[28px]", "rounded",
    "cursor-pointer", "text-[16px]",
    "transition-upthrust-fast",
    "hover:bg-primary/8", "hover:text-primary",
  ],
  { variants: {}, defaultVariants: {} }
)

// Card.Meta: avatar + title/description section (used inside the body).
const cardMetaVariants = cva(
  ["flex", "items-start"],
  { variants: {}, defaultVariants: {} }
)

const cardMetaAvatarVariants = cva(
  ["pr-[16px]", "shrink-0", "self-center"],
  { variants: {}, defaultVariants: {} }
)

const cardMetaSectionVariants = cva(
  ["flex-1", "min-w-0", "overflow-hidden"],
  { variants: {}, defaultVariants: {} }
)

const cardMetaTitleVariants = cva(
  ["text-[16px]", "font-medium", "text-on-surface", "truncate", "leading-[1.5]"],
  { variants: {}, defaultVariants: {} }
)

const cardMetaDescriptionVariants = cva(
  ["text-[14px]", "text-on-surface-variant", "mt-[4px]", "leading-[1.5714]"],
  { variants: {}, defaultVariants: {} }
)

// Card.Grid: a body cell drawn with shadow borders (the antd
// boxShadow-hairline trick — right/bottom offset shadows so cells stitch
// without double lines, plus INSET top/left so the grid's first row and
// column carry their outer edges too). Hover lifts the cell on the
// standard shadow; hoverable={false} keeps it flat.
const cardGridVariants = cva(
  [
    "w-1/3", "p-[24px]",
    "border-none", "rounded-none", "bg-transparent",
    "transition-upthrust",
    "shadow-[1px_0_0_0_var(--upthrust-colors-outline-variant),0_1px_0_0_var(--upthrust-colors-outline-variant),1px_0_0_0_var(--upthrust-colors-outline-variant)_inset,0_1px_0_0_var(--upthrust-colors-outline-variant)_inset]",
  ],
  {
    variants: {
      hoverable: {
        true: [
          "relative", "z-[1]",
          "hover:shadow",
          "hover:bg-surface",
        ],
        false: [],
      },
    },
    defaultVariants: { hoverable: true },
  }
)

export const cardClass = (variants: VariantProps<typeof cardVariants>) =>
  twMerge(cardVariants(variants))
export const cardHeadClass = (variants: VariantProps<typeof cardHeadVariants>) =>
  twMerge(cardHeadVariants(variants))
export const cardHeadWrapperClass = (variants: VariantProps<typeof cardHeadWrapperVariants>) =>
  twMerge(cardHeadWrapperVariants(variants))
export const cardTitleClass = () => twMerge(cardTitleVariants())
export const cardTitleAccentClass = (variants: VariantProps<typeof cardTitleAccentVariants>) =>
  twMerge(cardTitleAccentVariants(variants))
export const cardExtraClass = () => twMerge(cardExtraVariants())
export const cardTabsClass = () => twMerge(cardTabsVariants())
export const cardCoverClass = (variants: VariantProps<typeof cardCoverVariants>) =>
  twMerge(cardCoverVariants(variants))
export const cardBodyClass = (variants: VariantProps<typeof cardBodyVariants>) =>
  twMerge(cardBodyVariants(variants))
export const cardActionsClass = () => twMerge(cardActionsVariants())
export const cardActionItemClass = () => twMerge(cardActionItemVariants())
export const cardActionItemDividerClass = () => twMerge(cardActionItemDividerVariants())
export const cardActionSpanClass = () => twMerge(cardActionSpanVariants())
export const cardMetaClass = () => twMerge(cardMetaVariants())
export const cardMetaAvatarClass = () => twMerge(cardMetaAvatarVariants())
export const cardMetaSectionClass = () => twMerge(cardMetaSectionVariants())
export const cardMetaTitleClass = () => twMerge(cardMetaTitleVariants())
export const cardMetaDescriptionClass = () => twMerge(cardMetaDescriptionVariants())
export const cardGridClass = (variants: VariantProps<typeof cardGridVariants>) =>
  twMerge(cardGridVariants(variants))
