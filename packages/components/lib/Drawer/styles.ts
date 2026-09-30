// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { mergeClass } from "../../common/merge";

// Root: fixed full-screen layer (absolute when rendered in place); hidden
// (keep-alive) after the leave animation.
const drawerRootVariants = cva(["inset-0", "pointer-events-none"], {
  variants: {
    inline: { true: ["absolute", "overflow-hidden"], false: ["fixed"] },
    hidden: { true: ["hidden"], false: [] },
  },
  defaultVariants: { inline: false, hidden: false },
})

// Mask: antd colorBgMask; `blur` adds backdrop-filter blur(4px).
const drawerMaskVariants = cva(
  ["absolute", "inset-0", "pointer-events-auto", "bg-black/45", "transition-opacity", "duration-slow", "ease-upthrust"],
  {
    variants: {
      visible: {
        true: ["opacity-100"],
        false: ["opacity-0"],
      },
      blur: { true: ["backdrop-blur-[4px]"], false: [] },
    },
    defaultVariants: { visible: false, blur: false },
  }
)

// Wrapper (antd .ant-drawer-content-wrapper): hugs one edge, carries the
// slide transform, the push offset and the size. No radius (antd drawers are
// square); the shadow faces the page.
const drawerWrapperVariants = cva(
  ["absolute", "pointer-events-auto", "max-w-[100vw]", "max-h-[100vh]", "transition-overlay", "duration-slow", "ease-upthrust"],
  {
    variants: {
      placement: {
        left: ["left-0", "top-0", "bottom-0", "shadow-[6px_0_16px_0_rgba(0,0,0,0.08),3px_0_6px_-4px_rgba(0,0,0,0.12),9px_0_28px_8px_rgba(0,0,0,0.05)]"],
        right: ["right-0", "top-0", "bottom-0", "shadow-[-6px_0_16px_0_rgba(0,0,0,0.08),-3px_0_6px_-4px_rgba(0,0,0,0.12),-9px_0_28px_8px_rgba(0,0,0,0.05)]"],
        top: ["top-0", "left-0", "right-0", "shadow-[0_6px_16px_0_rgba(0,0,0,0.08),0_3px_6px_-4px_rgba(0,0,0,0.12),0_9px_28px_8px_rgba(0,0,0,0.05)]"],
        bottom: ["bottom-0", "left-0", "right-0", "shadow-[0_-6px_16px_0_rgba(0,0,0,0.08),0_-3px_6px_-4px_rgba(0,0,0,0.12),0_-9px_28px_8px_rgba(0,0,0,0.05)]"],
      },
      // Merged placement × visibility keys (no compoundVariants): hidden
      // slides fully off its edge and fades to .7 (antd panel motion).
      motion: {
        "left-hidden": ["-translate-x-full", "opacity-70"],
        "right-hidden": ["translate-x-full", "opacity-70"],
        "top-hidden": ["-translate-y-full", "opacity-70"],
        "bottom-hidden": ["translate-y-full", "opacity-70"],
        visible: ["opacity-100"],
      },
      dragging: { true: ["transition-none"], false: [] },
    },
    defaultVariants: { placement: "right", motion: "visible", dragging: false },
  }
)

// Section (antd .ant-drawer-section): the elevated surface column.
const drawerSectionVariants = cva(
  ["flex", "flex-col", "w-full", "h-full", "overflow-auto", "bg-surface", "outline-none", "pointer-events-auto",
    "text-[14px]", "text-on-surface", "leading-[1.5714]"],
  { variants: {}, defaultVariants: {} }
)

// Header: 16px 24px, hairline bottom (colorSplit).
const drawerHeaderVariants = cva(
  ["flex", "items-center", "shrink-0", "py-md", "px-lg", "text-[16px]", "leading-[1.5]",
    "border-0", "border-b", "border-solid", "border-outline-variant"],
  {
    variants: {
      // Close-only header drops the divider (antd header-close-only).
      closeOnly: { true: ["border-b-0", "pb-0"], false: [] },
    },
    defaultVariants: { closeOnly: false },
  }
)

const drawerHeaderTitleVariants = cva(["flex", "flex-1", "items-center", "min-w-0", "min-h-0"], { variants: {}, defaultVariants: {} })

const drawerTitleVariants = cva(
  ["flex-1", "m-0", "text-[16px]", "font-semibold", "leading-[1.5]", "text-on-surface", "break-words", "min-w-0"],
  { variants: {}, defaultVariants: {} }
)

const drawerExtraVariants = cva(["flex-none"], { variants: {}, defaultVariants: {} })

// Body: 24px padding, scrollable.
const drawerBodyVariants = cva(
  ["flex-1", "min-w-0", "min-h-0", "p-lg", "overflow-auto", "break-words"],
  {
    variants: {
      loading: { true: ["flex", "items-center", "justify-center"], false: [] },
    },
    defaultVariants: { loading: false },
  }
)

// Footer: 8px 16px over a hairline.
const drawerFooterVariants = cva(
  ["shrink-0", "py-xs", "px-md", "border-0", "border-t", "border-solid", "border-outline-variant"],
  { variants: {}, defaultVariants: {} }
)

// Close: 24px square (fontSizeLG + paddingXS), 8px from the title on the
// placement side.
const drawerCloseVariants = cva(
  [
    "inline-flex", "items-center", "justify-center", "shrink-0", "p-0",
    "w-[24px]", "h-[24px]", "text-[16px]", "leading-none",
    "text-on-surface-variant", "bg-transparent", "cursor-pointer", "border-none",
    "rounded-sm", "outline-none", "transition-upthrust",
    "hover:text-on-surface", "hover:bg-on-surface/6",
    "focus-visible:outline-2", "focus-visible:outline-solid", "focus-visible:outline-primary/30",
  ],
  {
    variants: {
      side: { start: ["mr-xs"], end: ["ml-xs"] },
      disabled: { true: ["cursor-not-allowed", "opacity-25", "hover:bg-transparent"], false: [] },
    },
    defaultVariants: { side: "start", disabled: false },
  }
)

// Resize handle on the inner edge: 4px, primary tint on hover / drag.
const drawerDraggerVariants = cva(
  ["absolute", "z-1", "bg-transparent", "pointer-events-auto", "transition-upthrust", "hover:bg-primary/20"],
  {
    variants: {
      placement: {
        right: ["left-0", "top-0", "bottom-0", "w-[4px]", "cursor-col-resize"],
        left: ["right-0", "top-0", "bottom-0", "w-[4px]", "cursor-col-resize"],
        bottom: ["top-0", "left-0", "right-0", "h-[4px]", "cursor-row-resize"],
        top: ["bottom-0", "left-0", "right-0", "h-[4px]", "cursor-row-resize"],
      },
      dragging: { true: ["bg-primary/30", "hover:bg-primary/30"], false: [] },
    },
    defaultVariants: { placement: "right", dragging: false },
  }
)

export const drawerRootClass = (v: VariantProps<typeof drawerRootVariants>) => mergeClass(drawerRootVariants(v))
export const drawerMaskClass = (v: VariantProps<typeof drawerMaskVariants>) => mergeClass(drawerMaskVariants(v))
export const drawerWrapperClass = (v: VariantProps<typeof drawerWrapperVariants>) => mergeClass(drawerWrapperVariants(v))
export const drawerSectionClass = (v: VariantProps<typeof drawerSectionVariants>) => mergeClass(drawerSectionVariants(v))
export const drawerHeaderClass = (v: VariantProps<typeof drawerHeaderVariants>) => mergeClass(drawerHeaderVariants(v))
export const drawerHeaderTitleClass = (v: VariantProps<typeof drawerHeaderTitleVariants>) => mergeClass(drawerHeaderTitleVariants(v))
export const drawerTitleClass = (v: VariantProps<typeof drawerTitleVariants>) => mergeClass(drawerTitleVariants(v))
export const drawerExtraClass = (v: VariantProps<typeof drawerExtraVariants>) => mergeClass(drawerExtraVariants(v))
export const drawerBodyClass = (v: VariantProps<typeof drawerBodyVariants>) => mergeClass(drawerBodyVariants(v))
export const drawerFooterClass = (v: VariantProps<typeof drawerFooterVariants>) => mergeClass(drawerFooterVariants(v))
export const drawerCloseClass = (v: VariantProps<typeof drawerCloseVariants>) => mergeClass(drawerCloseVariants(v))
export const drawerDraggerClass = (v: VariantProps<typeof drawerDraggerVariants>) => mergeClass(drawerDraggerVariants(v))

// antd size presets (default 378px, large 736px); horizontal placements map
// to width, vertical to height.
export const DRAWER_SIZE_PRESET: Record<'default' | 'large', number> = {
  default: 378,
  large: 736,
}

/** Every variant combination, for dead-class tests. */
export const drawerClassMatrix = (): string[] => {
  const out: string[] = []
  const placements = ["left", "right", "top", "bottom"] as const
  for (const b of [true, false]) {
    out.push(drawerRootClass({ inline: b, hidden: b }), drawerMaskClass({ visible: b, blur: b }), drawerMaskClass({ visible: b, blur: !b }),
      drawerHeaderClass({ closeOnly: b }), drawerBodyClass({ loading: b }),
      drawerCloseClass({ side: "start", disabled: b }), drawerCloseClass({ side: "end", disabled: b }))
    for (const placement of placements) {
      out.push(drawerWrapperClass({ placement, motion: `${placement}-hidden`, dragging: b }), drawerWrapperClass({ placement, motion: "visible", dragging: b }),
        drawerDraggerClass({ placement, dragging: b }))
    }
  }
  out.push(drawerSectionClass({}), drawerHeaderTitleClass({}), drawerTitleClass({}), drawerExtraClass({}), drawerFooterClass({}))
  return out
}
