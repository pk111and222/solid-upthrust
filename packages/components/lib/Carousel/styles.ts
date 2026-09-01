// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

// Root: relative viewport that clips the sliding track.
const carouselRootVariants = cva(
  ["relative", "overflow-hidden", "rounded-lg", "bg-surface-variant"],
  { variants: {}, defaultVariants: {} }
)

// The sliding track: a flex row (horizontal) or column (vertical) shifted by
// -index * 100% on its main axis. Only transform is transitioned (never
// left/top — the track is one long element, transform is compositor-friendly
// and covered by transition-overlay).
const carouselTrackVariants = cva(
  ["flex", "h-full", "transition-overlay", "duration-mid", "ease-upthrust"],
  {
    variants: {
      animate: {
        true: [],
        // Jump without motion (initial render / goTo(index, false)).
        false: ["!transition-none"],
      },
      vertical: {
        // Vertical: the track is a column; w-full so cells fill the width
        // (the h-full in the base pairs with the horizontal row).
        true: ["flex-col", "w-full"],
        false: [],
      },
    },
    defaultVariants: { animate: true, vertical: false },
  }
)

// One slide cell: fills the viewport on both axes, shrink-0 so the track
// measures N*100% on its main axis.
const carouselSlideVariants = cva(
  ["w-full", "h-full", "shrink-0", "relative"],
  { variants: {}, defaultVariants: {} }
)

// Arrow buttons: centered on the movement axis's sides, translucent surface
// that becomes opaque on hover (antd family). Horizontal mode puts them at
// left/right; vertical mode at top/bottom with up/down chevrons.
// The chevron glyph is a CHILD span in index.tsx — a bg-* on the SAME
// element as an i-mdi-* class overrides the mask icon's
// background-color: currentColor (CSS order) and the glyph goes invisible.
const carouselArrowVariants = cva(
  [
    "absolute", "z-[10]",
    "inline-flex", "items-center", "justify-center",
    "w-[32px]", "h-[32px]",
    "text-[16px]", "text-on-surface",
    "cursor-pointer", "border-none",
    "bg-surface/60", "rounded-full",
    "transition-upthrust-fast",
    "hover:bg-surface",
  ],
  {
    variants: {
      side: {
        left: ["left-[8px]", "top-1/2", "-translate-y-1/2"],
        right: ["right-[8px]", "top-1/2", "-translate-y-1/2"],
        up: ["top-[8px]", "left-1/2", "-translate-x-1/2"],
        down: ["bottom-[8px]", "left-1/2", "-translate-x-1/2"],
      },
      // Hidden at the ends when not infinite.
      disabled: {
        true: ["opacity-0", "pointer-events-none"],
        false: [],
      },
    },
    defaultVariants: { side: "left", disabled: false },
  }
)

// Dots: centered row under (or over) the slides for horizontal carousels;
// for vertical ones they sit on the RIGHT edge as a column (react-slick's
// vertical dots placement).
const carouselDotsVariants = cva(
  ["absolute", "z-[10]", "flex", "items-center", "gap-[8px]"],
  {
    variants: {
      position: {
        inner: [],
        outer: [],
      },
      vertical: {
        true: [],
        false: [],
      },
    },
    compoundVariants: [
      // Horizontal + inner (antd default): bottom center.
      { position: "inner", vertical: false, class: ["left-1/2", "-translate-x-1/2", "bottom-[10px]"] },
      // Horizontal + outer: static row below the viewport is expressed by the
      // component (margin); here we only neutralize absolute for that case.
      { position: "outer", vertical: false, class: ["static", "translate-x-0", "mt-[10px]"] },
      // Vertical + inner: right edge, vertically centered column.
      { position: "inner", vertical: true, class: ["right-[12px]", "top-1/2", "-translate-y-1/2", "flex-col"] },
      // Vertical + outer: static column to the side.
      { position: "outer", vertical: true, class: ["static", "translate-y-0", "flex-col", "ml-[10px]"] },
    ],
    defaultVariants: { position: "inner", vertical: false },
  }
)

// A single dot: pill that widens (or lengthens, vertical) and darkens when
// active.
const carouselDotVariants = cva(
  [
    "rounded-full", "cursor-pointer", "border-none",
    "transition-upthrust-fast",
  ],
  {
    variants: {
      active: {
        true: ["bg-primary"],
        false: ["bg-on-surface/25", "hover:bg-on-surface/45"],
      },
      vertical: {
        // Horizontal dots are wide pills; vertical dots are tall pills.
        true: ["w-[6px]"],
        false: ["h-[6px]"],
      },
    },
    compoundVariants: [
      { active: true, vertical: false, class: ["w-[24px]", "h-[6px]"] },
      { active: false, vertical: false, class: ["w-[6px]", "h-[6px]"] },
      { active: true, vertical: true, class: ["h-[24px]", "w-[6px]"] },
      { active: false, vertical: true, class: ["h-[6px]", "w-[6px]"] },
    ],
    defaultVariants: { active: false, vertical: false },
  }
)

export const carouselRootClass = (variants: VariantProps<typeof carouselRootVariants>) =>
  twMerge(carouselRootVariants(variants))
export const carouselTrackClass = (variants: VariantProps<typeof carouselTrackVariants>) =>
  twMerge(carouselTrackVariants(variants))
export const carouselSlideClass = (variants: VariantProps<typeof carouselSlideVariants>) =>
  twMerge(carouselSlideVariants(variants))
export const carouselArrowClass = (variants: VariantProps<typeof carouselArrowVariants>) =>
  twMerge(carouselArrowVariants(variants))
export const carouselDotsClass = (variants: VariantProps<typeof carouselDotsVariants>) =>
  twMerge(carouselDotsVariants(variants))
export const carouselDotClass = (variants: VariantProps<typeof carouselDotVariants>) =>
  twMerge(carouselDotVariants(variants))

export const CAROUSEL_PREV_ICON = 'i-mdi-chevron-left'
export const CAROUSEL_NEXT_ICON = 'i-mdi-chevron-right'
export const CAROUSEL_UP_ICON = 'i-mdi-chevron-up'
export const CAROUSEL_DOWN_ICON = 'i-mdi-chevron-down'
