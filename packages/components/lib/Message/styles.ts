// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { mergeClass } from "../../common/merge";

/**
 * antd 6 Message（message/style + notification/style 共享的 list / item 样式）：
 *  - list：fixed、z-index zIndexPopupBase 1000 + CONTAINER_MAX_OFFSET 1000 + 10 = 2010，水平居中，
 *    可见 notice 顶边距视口 `top`（默认 8px），pointer-events none。
 *  - listContent：flex 纵向，notice 间距 notificationMarginBottom = margin 16px。
 *  - notice：padding (40 − 14×1.5714)/2 = 9px × paddingSM 12px，colorBgElevated、borderRadiusLG 8px、boxShadow，
 *    width max-content、max-width calc(100vw − 48px)，14px / 1.5714 / colorText，word-wrap break-word。
 *  - wrapper：flex items-center gap marginXS 8px；icon：flex none、fontSizeLG 16px、line-height 1，
 *    success / warning / error 各自色、info 与 loading 用 colorInfo（主色）。
 *  - 动效：transform / opacity motionDurationMid 0.2s；进出场自 translateY(∓64px) + opacity 0。
 */

// list 只负责定位；top / bottom 的 px 偏移走内联 style（message.config({ top })）。
const messageListVariants = cva(
  ["fixed", "inset-x-0", "z-2010", "pointer-events-none", "text-[14px]", "text-on-surface", "leading-[1.5714]"],
  {
    variants: {
      placement: {
        top: [],
        bottom: [],
        // 本库扩展：首条 notice（高 40px）垂直居中于视口，栈向下生长。
        center: ["top-1/2", "-mt-[20px]"],
      },
    },
    defaultVariants: { placement: "top" },
  }
)

const messageListContentVariants = cva(["flex", "w-full"], {
  variants: {
    placement: { top: ["flex-col"], center: ["flex-col"], bottom: ["flex-col-reverse"] },
  },
  defaultVariants: { placement: "top" },
})

// 每条一行：grid 行高 1fr → 0fr 过渡，关闭时其余 notice 平滑补位（antd 用绝对定位 + inset 过渡达到同样效果）。
// 间距用行内边距而非 flex gap，收起时间距随行一起收掉。
const messageRowVariants = cva(
  ["grid", "w-full", "[transition:grid-template-rows_0.2s_cubic-bezier(0.645,0.045,0.355,1)]"],
  {
    variants: {
      closing: { true: ["grid-rows-[0fr]"], false: ["grid-rows-[1fr]"] },
    },
    defaultVariants: { closing: false },
  }
)

// grid 子项本身不能有 padding（padding 撑住 0fr 轨道，收不到 0），间距放在内层 pad 上。
const messageRowInnerVariants = cva(["min-h-0"], {
  variants: {
    // 关闭时才裁剪：平时 overflow visible，保证阴影不被切掉。
    closing: { true: ["overflow-hidden"], false: [] },
  },
  defaultVariants: { closing: false },
})

const messageRowPadVariants = cva(["flex", "justify-center"], {
  variants: {
    placement: { top: ["pb-md"], center: ["pb-md"], bottom: ["pt-md"] },
  },
  defaultVariants: { placement: "top" },
})

// 只过渡 transform / opacity（transition-overlay），不过渡布局属性。
const messageNoticeVariants = cva(
  [
    "relative", "box-border", "pointer-events-auto", "w-max", "max-w-[calc(100vw-48px)]", "px-sm", "py-[9px]",
    "bg-surface", "rounded-lg", "shadow", "text-[14px]", "text-on-surface", "leading-[1.5714]", "break-words",
    "transition-overlay", "duration-mid", "ease-upthrust",
  ],
  {
    variants: {
      state: {
        visible: ["opacity-100", "translate-y-0"],
        "enter-top": ["opacity-0", "-translate-y-[64px]"],
        "enter-bottom": ["opacity-0", "translate-y-[64px]"],
      },
    },
    defaultVariants: { state: "visible" },
  }
)

const messageWrapperVariants = cva(["flex", "items-center", "gap-xs"], { variants: {}, defaultVariants: {} })

const messageIconVariants = cva(
  ["flex", "flex-none", "text-[16px]", "leading-none"],
  {
    variants: {
      type: {
        info: ["text-primary"],
        success: ["text-[#52c41a]"],
        warning: ["text-[#faad14]"],
        error: ["text-error"],
        loading: ["text-primary"],
        // open() 不带 type 但传了自定义 icon：antd 不加类型色。
        none: [],
      },
    },
    defaultVariants: { type: "none" },
  }
)

const messageTitleVariants = cva(["min-w-0", "text-on-surface", "text-[14px]", "leading-[1.5714]"], { variants: {}, defaultVariants: {} })

export const messageListClass = (variants: VariantProps<typeof messageListVariants>) => mergeClass(messageListVariants(variants))
export const messageListContentClass = (variants: VariantProps<typeof messageListContentVariants>) => mergeClass(messageListContentVariants(variants))
export const messageRowClass = (variants: VariantProps<typeof messageRowVariants>) => mergeClass(messageRowVariants(variants))
export const messageRowInnerClass = (variants: VariantProps<typeof messageRowInnerVariants>) => mergeClass(messageRowInnerVariants(variants))
export const messageRowPadClass = (variants: VariantProps<typeof messageRowPadVariants>) => mergeClass(messageRowPadVariants(variants))
export const messageNoticeClass = (variants: VariantProps<typeof messageNoticeVariants>) => mergeClass(messageNoticeVariants(variants))
export const messageWrapperClass = (variants: VariantProps<typeof messageWrapperVariants>) => mergeClass(messageWrapperVariants(variants))
export const messageIconClass = (variants: VariantProps<typeof messageIconVariants>) => mergeClass(messageIconVariants(variants))
export const messageTitleClass = (variants: VariantProps<typeof messageTitleVariants>) => mergeClass(messageTitleVariants(variants))

/** LoadingOutlined 的 1s 线性旋转。 */
export const MESSAGE_LOADING_SPIN = "animate-spin"

/** Every variant combination, for dead-class tests. */
export const messageClassMatrix = (): string[] => {
  const out: string[] = [MESSAGE_LOADING_SPIN]
  for (const placement of ["top", "bottom", "center"] as const) {
    out.push(messageListClass({ placement }), messageListContentClass({ placement }))
    out.push(messageRowPadClass({ placement }))
  }
  for (const closing of [true, false]) out.push(messageRowClass({ closing }), messageRowInnerClass({ closing }))
  for (const state of ["visible", "enter-top", "enter-bottom"] as const) out.push(messageNoticeClass({ state }))
  for (const type of ["info", "success", "warning", "error", "loading", "none"] as const) out.push(messageIconClass({ type }))
  out.push(messageWrapperClass({}), messageTitleClass({}))
  return out
}
