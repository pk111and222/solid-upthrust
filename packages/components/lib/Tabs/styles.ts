// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

// Root container: position determines bar ↔ panel axis and order.
// No bg — the container is transparent; the bar carries the hairline.
const tabsContainerVariants = cva(
  ["flex", "w-full"],
  {
    variants: {
      tabPosition: {
        top: ["flex-col"],
        bottom: ["flex-col-reverse"],
        left: ["flex-row"],
        right: ["flex-row-reverse"],
      },
    },
    defaultVariants: { tabPosition: "top" },
  }
);

// The tab bar (tablist). Line type carries the hairline on the panel side;
// card type has no bar-level border (the cards themselves draw the base line).
const tabBarVariants = cva(
  ["flex", "relative", "shrink-0"],
  {
    variants: {
      tabPosition: {
        top: ["flex-row"],
        bottom: ["flex-row"],
        left: ["flex-col"],
        right: ["flex-col"],
      },
      type: {
        // horizontal tabs gap: 32px between line tab centers
        line: ["gap-[32px]"],
        card: ["gap-[2px]"],
      },
      // Line mode: the bar carries the hairline on the panel side.
      // Card mode: NO bar border — the cards' own borders form the structure
      // and the active card erases its panel-side border to merge with the
      // content (a bar hairline would slice through the merged active card).
      positionType: {
        "top-line": ["border-b", "border-outline-variant"],
        "bottom-line": ["border-t", "border-outline-variant"],
        "left-line": ["border-r", "border-outline-variant"],
        "right-line": ["border-l", "border-outline-variant"],
        "top-card": [],
        "bottom-card": [],
        "left-card": [],
        "right-card": [],
      },
      centered: {
        true: ["justify-center"],
        false: [],
      },
    },
    defaultVariants: { tabPosition: "top", type: "line", centered: false },
  }
);

// Single tab node. Merged state keys keep every visual class scannable.
// Sizing (tab bar heights): large 44px / middle 36px / small 28px.
const tabItemVariants = cva(
  ["flex", "items-center", "gap-[8px]", "cursor-pointer", "select-none",
   "whitespace-nowrap", "relative", "transition-upthrust-fast", "outline-none"],
  {
    variants: {
      state: {
        // line idle: secondary text, primary tint on hover
        "idle-line": ["text-on-surface-variant", "hover:text-primary/70"],
        // line active: primary text
        "active-line": ["text-primary"],
        // card idle: sits on the grey base, text secondary
        "idle-card": ["bg-surface-variant", "text-on-surface-variant", "border-outline-variant"],
        // card active: lifts to surface, erases the border toward the panel
        // so the tab visually merges with the content area
        "active-card": ["bg-surface", "text-primary", "border-outline-variant"],
      },
      disabled: {
        true: ["text-on-surface/25", "cursor-not-allowed", "pointer-events-none"],
        false: [],
      },
      type: {
        line: [],
        // card: border on all sides; the active card erases its panel-side
        // border via the statePosition variant below.
        card: ["border", "border-solid", "justify-center"],
      },
      size: {
        small: ["text-[14px]", "py-[4px]"],
        middle: ["text-[14px]", "py-[8px]"],
        large: ["text-[16px]", "py-[12px]"],
      },
      // type×size merged key — card tabs carry horizontal padding so text
      // can center; line tabs hug their content (gap handles spacing).
      typeSize: {
        "line-small": [],
        "line-middle": [],
        "line-large": [],
        "card-small": ["px-[12px]"],
        "card-middle": ["px-[16px]"],
        "card-large": ["px-[20px]"],
      },
      tabPosition: {
        top: [],
        bottom: [],
        // Vertical line tabs get a touch of breathing room from the hairline
        left: ["pr-[16px]"],
        right: ["pl-[16px]"],
      },
      // card tabs: corners toward the content area stay rounded (theme
      // borderRadiusLG), corners on the bar hairline stay square so the
      // tabs connect into one continuous base line.
      typePosition: {
        "card-top": ["rounded-t-lg"],
        "card-bottom": ["rounded-b-lg"],
        "card-left": ["rounded-l-lg"],
        "card-right": ["rounded-r-lg"],
        "line-top": [],
        "line-bottom": [],
        "line-left": [],
        "line-right": [],
      },
      // state×position merged key — the ACTIVE card erases the border on its
      // panel side, merging with the content area; idle cards keep all 4.
      statePosition: {
        "active-top": ["border-b-transparent"],
        "active-bottom": ["border-t-transparent"],
        "active-left": ["border-r-transparent"],
        "active-right": ["border-l-transparent"],
        "idle-top": [],
        "idle-bottom": [],
        "idle-left": [],
        "idle-right": [],
      },
    },
    defaultVariants: {
      state: "idle-line", disabled: false, type: "line", size: "middle",
      typeSize: "line-middle", tabPosition: "top", statePosition: "idle-top",
    },
  }
);

// The sliding ink bar under/ beside the ACTIVE tab (line type only).
// Positioned by measurement (index.tsx writes left/top/width/height),
// so variants only carry the fixed geometry per side.
const tabInkBarVariants = cva(
  ["absolute", "bg-primary", "rounded-full", "transition-all", "duration-slow", "ease-upthrust", "z-1"],
  {
    variants: {
      tabPosition: {
        top: ["bottom-0", "h-[2px]"],
        bottom: ["top-0", "h-[2px]"],
        left: ["right-0", "w-[2px]"],
        right: ["left-0", "w-[2px]"],
      },
    },
    defaultVariants: { tabPosition: "top" },
  }
);

// Panel region: padding is the consumer's business (renders content
// flush; demos add their own spacing), but flex-1 ensures side tabs fill.
const tabPanelVariants = cva(
  ["flex-1", "min-w-0", "min-h-0"],
  { variants: {}, defaultVariants: {} }
);

export const tabsContainerClass = (variants: VariantProps<typeof tabsContainerVariants>) => twMerge(tabsContainerVariants(variants));
export const tabBarClass = (variants: VariantProps<typeof tabBarVariants>) => twMerge(tabBarVariants(variants));
export const tabItemClass = (variants: VariantProps<typeof tabItemVariants>) => twMerge(tabItemVariants(variants));
export const tabInkBarClass = (variants: VariantProps<typeof tabInkBarVariants>) => twMerge(tabInkBarVariants(variants));
export const tabPanelClass = (variants: VariantProps<typeof tabPanelVariants>) => twMerge(tabPanelVariants(variants));
