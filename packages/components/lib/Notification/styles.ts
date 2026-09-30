// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { mergeClass } from "../../common/merge";

/**
 * antd 6 Notification（notification/style：index、placement、stack）：
 *  - list：fixed，z-index zIndexPopupBase 1000 + CONTAINER_MAX_OFFSET 1000 + 50 = 2050；top / bottom 偏移默认 24（内联 style），
 *    左右角距屏幕边 marginEdge 24px，top / bottom 水平居中。
 *  - wrapper：colorBgElevated、borderRadiusLG 8px、boxShadow；stack 模式下绝对定位贴 list 锚边，
 *    位置由 transform 表达（rc NoticeList 算法，transition transform 0.3s）。
 *  - notice：padding paddingMD 20px × paddingContentHorizontalLG 24px，width 384，max-width calc(100vw − 48px)，
 *    14px / 1.5714，word-wrap break-word，overflow hidden。
 *  - title：fontSizeLG 16 / lineHeightLG 1.5、colorTextHeading、margin-bottom 8；可关闭时右留 24；有图标时左让 12 + 24 = 36。
 *  - description：14px colorText、margin-top 8；首元素时 margin-top 0、右 12。
 *  - icon：absolute，24px（16 × 1.5）line-height 1；success / info / warning / error 各自语义色。
 *  - close：absolute top 20 / end 24，22×22（40 × 0.55），borderRadiusSM 4，colorIcon 0.45 → hover colorText + colorFillSecondary 0.06，
 *    active colorFill 0.15，color / background-color 0.2s。
 *  - actions：float right，margin-top 12。
 *  - progress：absolute bottom 0，左右内缩 8（borderRadiusLG），高 2，底 rgba(0,0,0,.04)，值为 primaryBorderHover → primary 渐变，显示剩余比例。
 *  - 动效：右侧角 translateX(100%)、左侧角 translateX(−100%)、top 自 −150px、bottom 自 +150px，配合 opacity 0.2s。
 */

const notificationListVariants = cva(
  ["fixed", "z-2050", "pointer-events-none", "text-[14px]", "text-on-surface", "leading-[1.5714]"],
  {
    variants: {
      placement: {
        topLeft: ["left-0", "ml-lg"],
        top: ["left-1/2", "-translate-x-1/2"],
        topRight: ["right-0", "mr-lg"],
        bottomLeft: ["left-0", "ml-lg"],
        bottom: ["left-1/2", "-translate-x-1/2"],
        bottomRight: ["right-0", "mr-lg"],
      },
    },
    defaultVariants: { placement: "topRight" },
  }
)

// 进场 translate 与 stack 的 transform 是两个独立属性，互不覆盖；只过渡 opacity / translate / transform，绝不过渡 top / left。
const notificationWrapperVariants = cva(
  ["pointer-events-auto", "bg-surface", "rounded-lg", "shadow"],
  {
    variants: {
      // stack：绝对定位贴锚边，位置全由 transform 表达；关闭 stack 时按文档流排列，离场收起 max-height / margin（内联值）。
      stacked: {
        true: ["absolute", "[transition:opacity_0.2s_cubic-bezier(0.645,0.045,0.355,1),translate_0.2s_cubic-bezier(0.645,0.045,0.355,1),transform_0.3s_cubic-bezier(0.645,0.045,0.355,1)]"],
        false: ["relative", "ms-auto", "mb-md", "[transition:opacity_0.2s_cubic-bezier(0.645,0.045,0.355,1),translate_0.2s_cubic-bezier(0.645,0.045,0.355,1),max-height_0.2s_cubic-bezier(0.645,0.045,0.355,1),margin_0.2s_cubic-bezier(0.645,0.045,0.355,1)]"],
      },
      anchor: {
        topLeft: ["top-0", "left-0"],
        top: ["top-0", "left-0"],
        topRight: ["top-0", "right-0"],
        bottomLeft: ["bottom-0", "left-0"],
        bottom: ["bottom-0", "left-0"],
        bottomRight: ["bottom-0", "right-0"],
      },
      state: {
        visible: ["opacity-100", "translate-x-0"],
        "enter-right": ["opacity-0", "translate-x-full"],
        "enter-left": ["opacity-0", "-translate-x-full"],
        "enter-top": ["opacity-0", "-translate-y-[150px]"],
        "enter-bottom": ["opacity-0", "translate-y-[150px]"],
        leave: ["opacity-0", "pointer-events-none"],
      },
      // 折叠态：第 2、3 张只露出卡片边（内容透明 + 背景模糊），更旧的完全隐藏；
      // 展开态每张下方挂 16px 透明伪元素桥接缝隙，指针穿过缝隙时不会丢 hover（antd stack-expanded ::after）。
      layer: {
        front: [],
        peek: ["overflow-hidden", "bg-transparent", "backdrop-blur-[10px]"],
        hidden: ["opacity-0", "overflow-hidden", "pointer-events-none"],
        bridge: ["after:content-empty", "after:absolute", "after:inset-x-0", "after:h-[16px]", "after:-bottom-[16px]", "after:pointer-events-auto"],
      },
    },
    defaultVariants: { stacked: true, anchor: "topRight", state: "visible", layer: "front" },
  }
)

const notificationNoticeVariants = cva(
  [
    "relative", "box-border", "w-[384px]", "max-w-[calc(100vw-48px)]", "py-[20px]", "px-lg",
    "rounded-lg", "overflow-hidden", "break-words", "text-[14px]", "text-on-surface", "leading-[1.5714]",
  ],
  { variants: {}, defaultVariants: {} }
)

// 折叠露边时整块 notice 淡出（antd stack：`wrapper > notice` opacity 0，transition opacity 0.2s）。
const notificationContentVariants = cva(["[transition:opacity_0.2s]"], {
  variants: {
    concealed: { true: ["opacity-0"], false: ["opacity-100"] },
  },
  defaultVariants: { concealed: false },
})

const notificationIconVariants = cva(
  ["absolute", "top-[20px]", "left-[24px]", "flex", "text-[24px]", "leading-none"],
  {
    variants: {
      type: {
        info: ["text-primary"],
        success: ["text-[#52c41a]"],
        warning: ["text-[#faad14]"],
        error: ["text-error"],
        // 自定义 icon：antd 不加类型色。
        none: [],
      },
    },
    defaultVariants: { type: "none" },
  }
)

const notificationTitleVariants = cva(["mb-xs", "text-on-surface", "text-[16px]", "leading-[1.5]"], {
  variants: {
    closable: { true: ["pe-lg"], false: [] },
    withIcon: { true: ["ms-[36px]"], false: [] },
  },
  defaultVariants: { closable: true, withIcon: false },
})

const notificationDescriptionVariants = cva(["text-on-surface", "text-[14px]"], {
  variants: {
    first: { true: ["mt-0", "me-sm"], false: ["mt-xs"] },
    withIcon: { true: ["ms-[36px]"], false: [] },
  },
  defaultVariants: { first: false, withIcon: false },
})

const notificationActionsVariants = cva(["float-right", "mt-sm"], { variants: {}, defaultVariants: {} })

// 关闭按钮：图标是子元素（SVG），hover 背景不会盖住图标。
const notificationCloseVariants = cva(
  [
    "absolute", "top-[20px]", "right-[24px]", "flex", "items-center", "justify-center", "p-0",
    "w-[22px]", "h-[22px]", "text-[14px]", "leading-none", "rounded-sm", "border-none", "bg-transparent", "cursor-pointer",
    "text-on-surface/45", "outline-none", "transition-upthrust",
    "hover:text-on-surface", "hover:bg-on-surface/6", "active:bg-on-surface/15",
    "focus-visible:outline-2", "focus-visible:outline-solid", "focus-visible:outline-primary/30",
  ],
  { variants: {}, defaultVariants: {} }
)

const notificationProgressVariants = cva(
  ["absolute", "bottom-0", "left-[8px]", "right-[8px]", "h-[2px]", "rounded-lg", "overflow-hidden", "bg-on-surface/4"],
  { variants: {}, defaultVariants: {} }
)

const notificationProgressFillVariants = cva(
  ["h-full", "rounded-lg", "bg-[linear-gradient(90deg,rgb(var(--upthrust-colors-primary)/0.55),rgb(var(--upthrust-colors-primary)))]"],
  { variants: {}, defaultVariants: {} }
)

export const notificationListClass = (variants: VariantProps<typeof notificationListVariants>) => mergeClass(notificationListVariants(variants))
export const notificationWrapperClass = (variants: VariantProps<typeof notificationWrapperVariants>) => mergeClass(notificationWrapperVariants(variants))
export const notificationNoticeClass = (variants: VariantProps<typeof notificationNoticeVariants>) => mergeClass(notificationNoticeVariants(variants))
export const notificationContentClass = (variants: VariantProps<typeof notificationContentVariants>) => mergeClass(notificationContentVariants(variants))
export const notificationIconClass = (variants: VariantProps<typeof notificationIconVariants>) => mergeClass(notificationIconVariants(variants))
export const notificationTitleClass = (variants: VariantProps<typeof notificationTitleVariants>) => mergeClass(notificationTitleVariants(variants))
export const notificationDescriptionClass = (variants: VariantProps<typeof notificationDescriptionVariants>) => mergeClass(notificationDescriptionVariants(variants))
export const notificationActionsClass = (variants: VariantProps<typeof notificationActionsVariants>) => mergeClass(notificationActionsVariants(variants))
export const notificationCloseClass = (variants: VariantProps<typeof notificationCloseVariants>) => mergeClass(notificationCloseVariants(variants))
export const notificationProgressClass = (variants: VariantProps<typeof notificationProgressVariants>) => mergeClass(notificationProgressVariants(variants))
export const notificationProgressFillClass = (variants: VariantProps<typeof notificationProgressFillVariants>) => mergeClass(notificationProgressFillVariants(variants))

const PLACEMENTS = ["topLeft", "top", "topRight", "bottomLeft", "bottom", "bottomRight"] as const

/** Every variant combination, for dead-class tests. */
export const notificationClassMatrix = (): string[] => {
  const out: string[] = []
  for (const placement of PLACEMENTS) {
    out.push(notificationListClass({ placement }))
    for (const state of ["visible", "enter-right", "enter-left", "enter-top", "enter-bottom", "leave"] as const) {
      for (const layer of ["front", "peek", "hidden", "bridge"] as const) {
        for (const stacked of [true, false]) out.push(notificationWrapperClass({ stacked, anchor: placement, state, layer }))
      }
    }
  }
  for (const flag of [true, false]) {
    out.push(notificationContentClass({ concealed: flag }))
    for (const withIcon of [true, false]) out.push(notificationTitleClass({ closable: flag, withIcon }), notificationDescriptionClass({ first: flag, withIcon }))
  }
  for (const type of ["info", "success", "warning", "error", "none"] as const) out.push(notificationIconClass({ type }))
  out.push(
    notificationNoticeClass({}), notificationActionsClass({}), notificationCloseClass({}),
    notificationProgressClass({}), notificationProgressFillClass({}),
  )
  return out
}
