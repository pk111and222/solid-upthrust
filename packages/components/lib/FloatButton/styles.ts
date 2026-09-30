// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { mergeClass } from "../../common/merge";

/**
 * FloatButton styles — antd 6 `float-button/style` (button.js + group.js):
 *  - button: Button size=large as a 40px column (width 40, min-height 40,
 *    height auto, padding 4px 0, gap 2px), text wraps; icon-only → icon 18px
 *    (fontSizeIcon × 1.5), content 12px (fontSizeSM)
 *  - shape: circle 50% | square borderRadiusLG 8px
 *  - individual (not in a group): fixed, z-index 1000 (zIndexPopupBase),
 *    inset-inline-end 24 (marginLG), bottom 48 (marginXXL), boxShadowSecondary
 *  - group: fixed at the same corner; the list is a Flex (circle: gap 16,
 *    every item keeps its own shadow) or a Space.Compact (square: borders
 *    collapse, the list carries the shadow + 8px radius); menu mode (trigger)
 *    positions the list absolutely one size + padding (56px) from the trigger
 *    and animates it from translate(±40px) + opacity 0 over 0.3s
 *  - badge: absolute top / inline-end, translate(50%, -50%) unless dot; the
 *    circle shape insets it by r·(√2−1)/√2 (controlHeight / 2 based)
 */

const floatButtonVariants = cva(
  [
    "relative", "inline-flex", "flex-col", "items-center", "justify-center",
    "m-0", "py-xxs", "px-0", "w-[40px]", "min-h-[40px]", "h-auto", "gap-[2px]",
    "border", "border-solid", "break-words", "whitespace-normal",
    "text-[16px]", "leading-[1.5714]", "select-none", "transition-upthrust", "no-underline",
    "focus-visible:outline-2", "focus-visible:outline-offset-1",
  ],
  {
    variants: {
      colorScheme: {
        default: ["bg-surface", "border-outline", "text-on-surface", "hover:border-primary", "hover:text-primary", "active:border-primary/80", "active:text-primary/80", "focus-visible:outline-primary/40"],
        primary: ["bg-primary", "border-transparent", "text-on-primary", "hover:bg-primary/85", "active:bg-primary/70", "focus-visible:outline-primary/40"],
        disabled: ["bg-on-surface/4", "border-outline", "text-on-surface/25", "cursor-not-allowed"],
      },
      shape: {
        circle: ["rounded-full"],
        square: ["rounded-lg"],
      },
      /** fixed: standalone; item: inside a circle group (own shadow); compact: inside a square group (list shadow). */
      layout: {
        fixed: ["fixed", "z-[1000]", "right-[24px]", "bottom-[48px]", "shadow-secondary"],
        item: ["shadow-secondary"],
        compact: ["rounded-none", "hover:z-1", "focus-visible:z-1"],
      },
      /** Space.Compact joins: overlap borders by 1px and round only the outer corners. */
      compact: {
        none: [],
        vertical: ["mt-[-1px]", "first:mt-0", "first:rounded-t-lg", "last:rounded-b-lg"],
        horizontal: ["ml-[-1px]", "first:ml-0", "first:rounded-l-lg", "last:rounded-r-lg"],
      },
      clickable: {
        true: ["cursor-pointer"],
        false: [],
      },
    },
    defaultVariants: { colorScheme: "default", shape: "circle", layout: "fixed", compact: "none", clickable: true },
  },
);

export type FloatButtonStyleVariants = VariantProps<typeof floatButtonVariants>
export const floatButtonClass = (v: FloatButtonStyleVariants) => mergeClass(floatButtonVariants(v))

const floatButtonIconVariants = cva(["inline-flex", "items-center", "justify-center", "leading-none"], {
  variants: {
    iconOnly: {
      true: ["text-[18px]"],
      false: [],
    },
  },
  defaultVariants: { iconOnly: true },
})
export const floatButtonIconClass = (v: VariantProps<typeof floatButtonIconVariants>) => floatButtonIconVariants(v)

export const floatButtonContentClass = "text-[12px] leading-[1.5714]"

const floatButtonBadgeVariants = cva(["absolute", "top-0", "right-0"], {
  variants: {
    offset: {
      'circle': ["translate-x-1/2", "-translate-y-1/2", "mt-[4.686px]", "mr-[4.686px]"],
      'circle-dot': ["mt-[4.686px]", "mr-[4.686px]"],
      'square': ["translate-x-1/2", "-translate-y-1/2"],
      'square-dot': ["mt-[1.757px]", "mr-[1.757px]"],
    },
  },
  defaultVariants: { offset: 'circle' },
})
export const floatButtonBadgeClass = (v: VariantProps<typeof floatButtonBadgeVariants>) => floatButtonBadgeVariants(v)

// ---------------------------------------------------------------------------
// BackTop — antd `-fade` motion (opacity, motionDurationMid 0.2s linear)
// ---------------------------------------------------------------------------

const backTopFadeVariants = cva(["transition-opacity", "duration-mid", "ease-linear"], {
  variants: {
    visible: {
      true: ["opacity-100"],
      false: ["opacity-0", "pointer-events-none"],
    },
  },
  defaultVariants: { visible: true },
})
export const backTopFadeClass = (v: VariantProps<typeof backTopFadeVariants>) => backTopFadeVariants(v)

// ---------------------------------------------------------------------------
// Group
// ---------------------------------------------------------------------------

export const floatGroupClass = ["fixed", "z-[1000]", "right-[24px]", "bottom-[48px]", "block", "border-0", "p-0", "m-0", "text-[14px]", "leading-[1.5714]"].join(" ")

const floatGroupListVariants = cva(["flex", "rounded-lg"], {
  variants: {
    axis: {
      vertical: ["flex-col"],
      horizontal: ["flex-row"],
    },
    individual: {
      true: ["gap-md"],
      false: ["shadow-secondary"],
    },
    /** Menu mode: absolute, one button size + padding (56px) away from the trigger. */
    menu: {
      none: [],
      top: ["absolute", "bottom-[56px]"],
      bottom: ["absolute", "top-[56px]"],
      left: ["absolute", "right-[56px]"],
      right: ["absolute", "left-[56px]"],
    },
    /** Menu motion: `transition: all 0.3s`, enter / leave from translate(±40px) + opacity 0. */
    motion: {
      none: [],
      visible: ["transition-all", "duration-slow", "opacity-100", "translate-x-0", "translate-y-0"],
      'hidden-top': ["transition-all", "duration-slow", "opacity-0", "translate-y-[40px]", "pointer-events-none"],
      'hidden-bottom': ["transition-all", "duration-slow", "opacity-0", "-translate-y-[40px]", "pointer-events-none"],
      'hidden-left': ["transition-all", "duration-slow", "opacity-0", "translate-x-[40px]", "pointer-events-none"],
      'hidden-right': ["transition-all", "duration-slow", "opacity-0", "-translate-x-[40px]", "pointer-events-none"],
    },
  },
  defaultVariants: { axis: "vertical", individual: true, menu: "none", motion: "none" },
})
export const floatGroupListClass = (v: VariantProps<typeof floatGroupListVariants>) => floatGroupListVariants(v)

/** Every class the variants can emit — the dead-class theme test walks this. */
export const floatButtonClassMatrix = (): string[] => {
  const out: string[] = []
  for (const colorScheme of ["default", "primary", "disabled"] as const)
    for (const shape of ["circle", "square"] as const)
      for (const layout of ["fixed", "item", "compact"] as const)
        for (const compact of ["none", "vertical", "horizontal"] as const)
          out.push(floatButtonClass({ colorScheme, shape, layout, compact, clickable: true }))
  out.push(floatButtonIconClass({ iconOnly: true }), floatButtonIconClass({ iconOnly: false }), floatButtonContentClass)
  for (const offset of ["circle", "circle-dot", "square", "square-dot"] as const) out.push(floatButtonBadgeClass({ offset }))
  out.push(backTopFadeClass({ visible: true }), backTopFadeClass({ visible: false }), floatGroupClass)
  for (const axis of ["vertical", "horizontal"] as const)
    for (const individual of [true, false])
      for (const menu of ["none", "top", "bottom", "left", "right"] as const)
        for (const motion of ["none", "visible", "hidden-top", "hidden-bottom", "hidden-left", "hidden-right"] as const)
          out.push(floatGroupListClass({ axis, individual, menu, motion }))
  return out
}
