// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { mergeClass } from "../../common/merge";

/**
 * antd 6 Popconfirm（popconfirm/style + popover/style）：
 *  - 浮层：Popover 容器 colorBgElevated、borderRadiusLG 8px、padding 12px、width max-content / max-width 100vw，
 *    fontSize 14 / colorText，zIndexPopup = 1000 + 60。
 *  - message：flex nowrap items-start，margin-bottom 8px；图标 colorWarning、14px、line-height 1、右距 8px。
 *  - title：fontWeightStrong 600、colorTextHeading；无描述（only-child）时 normal。
 *  - description：margin-top 4px、colorText。
 *  - buttons：text-align end、nowrap、按钮之间 margin-inline-start 8px。
 */

// 只过渡 opacity / transform（transition-overlay），绝不过渡 top/left：
// createTrigger 在打开 / 滚动 / 缩放时重新定位，位置过渡会让浮层飞过屏幕。
const popconfirmOverlayVariants = cva(
  [
    "bg-surface", "rounded-lg", "shadow", "outline-none",
    "text-[14px]", "text-on-surface", "leading-[1.5714]", "w-max", "max-w-[100vw]",
    "transition-overlay", "duration-fast", "ease-upthrust",
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

const popconfirmContainerVariants = cva(["relative", "p-sm"], { variants: {}, defaultVariants: {} })

const popconfirmMessageVariants = cva(["flex", "flex-nowrap", "items-start", "mb-xs"], { variants: {}, defaultVariants: {} })

// 图标容器 flex 且高度等于标题首行（14px × 1.5714 = 22px），图标在首行内垂直居中；
// 让 inline 的 anticon 靠基线对齐会下偏约 4px。
const popconfirmIconVariants = cva(
  ["shrink-0", "flex", "items-center", "h-[22px]", "me-xs", "text-[14px]", "leading-none", "text-[#faad14]"],
  { variants: {}, defaultVariants: {} }
)

const popconfirmTitleVariants = cva(["text-on-surface"], {
  variants: {
    strong: { true: ["font-semibold"], false: ["font-normal"] },
  },
  defaultVariants: { strong: true },
})

const popconfirmDescriptionVariants = cva(["mt-xxs", "text-on-surface"], { variants: {}, defaultVariants: {} })

const popconfirmButtonsVariants = cva(
  ["flex", "justify-end", "flex-nowrap", "whitespace-nowrap", "gap-xs"],
  { variants: {}, defaultVariants: {} }
)

export const popconfirmOverlayClass = (variants: VariantProps<typeof popconfirmOverlayVariants>) => mergeClass(popconfirmOverlayVariants(variants))
export const popconfirmContainerClass = (variants: VariantProps<typeof popconfirmContainerVariants>) => mergeClass(popconfirmContainerVariants(variants))
export const popconfirmMessageClass = (variants: VariantProps<typeof popconfirmMessageVariants>) => mergeClass(popconfirmMessageVariants(variants))
export const popconfirmIconClass = (variants: VariantProps<typeof popconfirmIconVariants>) => mergeClass(popconfirmIconVariants(variants))
export const popconfirmTitleClass = (variants: VariantProps<typeof popconfirmTitleVariants>) => mergeClass(popconfirmTitleVariants(variants))
export const popconfirmDescriptionClass = (variants: VariantProps<typeof popconfirmDescriptionVariants>) => mergeClass(popconfirmDescriptionVariants(variants))
export const popconfirmButtonsClass = (variants: VariantProps<typeof popconfirmButtonsVariants>) => mergeClass(popconfirmButtonsVariants(variants))

// 箭头（与 Popover 一致）：8px 方块旋转 45° 并居中压在浮层边上，内半与浮层同色融合，只露出外半三角。
// 不要同时写内联 top 与 -bottom 类：绝对定位过约束时 top 胜出，箭头会整个落到浮层外。
const popconfirmArrowVariants = cva(
  ["absolute", "w-[8px]", "h-[8px]", "bg-surface", "rotate-45", "pointer-events-none"],
  {
    variants: {
      side: {
        top: ["-top-[4px]"],
        bottom: ["-bottom-[4px]"],
        left: ["-left-[4px]"],
        right: ["-right-[4px]"],
      },
    },
    defaultVariants: { side: "top" },
  }
)
export const popconfirmArrowClass = (side: 'top' | 'bottom' | 'left' | 'right') => mergeClass(popconfirmArrowVariants({ side }))

/** Every variant combination, for dead-class tests. */
export const popconfirmClassMatrix = (): string[] => {
  const out: string[] = []
  for (const visible of [true, false]) {
    for (const placement of ["bottomLeft", "bottomRight", "bottom", "topLeft", "topRight", "top", "leftTop", "leftBottom", "left", "rightTop", "rightBottom", "right"] as const) {
      out.push(popconfirmOverlayClass({ visible, placement }))
    }
    out.push(popconfirmTitleClass({ strong: visible }))
  }
  for (const side of ["top", "bottom", "left", "right"] as const) out.push(popconfirmArrowClass(side))
  out.push(
    popconfirmContainerClass({}), popconfirmMessageClass({}), popconfirmIconClass({}),
    popconfirmDescriptionClass({}), popconfirmButtonsClass({}),
  )
  return out
}
