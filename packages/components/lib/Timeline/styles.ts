// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { mergeClass } from "../../common/merge";

/**
 * antd 6 Timeline（基于 Steps dot 类型，components/timeline/style + steps/style）实测值：
 *  - 纵向 li：min-h 48、pb 12；wrapper 横向 gap 16；圆点 10×10、mt 7、边框 2、圆角
 *  - 导轨：绝对定位 top 17 / bottom -7 / start 5、-ms-1、2px colorSplit
 *  - 交替布局（alternate 或纵向含 title）：li pb 20；圆点与导轨定位到 --ut-tl-span；
 *    section 横向 gap 40，header / content 各占 span ∓ 20px
 *  - 横向：li flex 1；wrapper 纵向 gap 12、居中；导轨 top 0、mt 4、宽 calc(100%-10px)、start calc(50%+5px)
 *  - 横向交替：wrapper 高 78；圆点 / 导轨垂直居中；标题 / 内容绝对定位到 56px 偏移
 * 标题占比通过根节点的 CSS 变量 --ut-tl-span 传入（默认 50%）。
 */
const timelineVariants = cva(["m-0", "p-0", "list-none", "text-on-surface", "text-[14px]", "leading-[1.5714]"], {
  variants: {
    orientation: {
      vertical: ["flex", "flex-col"],
      horizontal: ["flex", "flex-row", "items-stretch"],
    },
  },
  defaultVariants: { orientation: "vertical" },
});

/** 布局：vertical / vertical-end（同侧）、alternate / alternate-end（交替，按节点 placement）、horizontal 系列。 */
type Layout = "vertical" | "vertical-end" | "alternate" | "alternate-end" | "horizontal" | "horizontal-end" | "horizontal-alternate-start" | "horizontal-alternate-end";

const timelineItemVariants = cva(["relative", "text-[14px]"], {
  variants: {
    layout: {
      vertical: ["min-h-[48px]", "pb-[12px]", "text-start"],
      "vertical-end": ["min-h-[48px]", "pb-[12px]", "text-end"],
      alternate: ["pb-[20px]", "text-start"],
      "alternate-end": ["pb-[20px]", "text-start"],
      horizontal: ["flex-[1_1_0%]", "min-w-0", "pb-0"],
      "horizontal-end": ["flex-[1_1_0%]", "min-w-0", "pb-0", "flex", "items-end"],
      "horizontal-alternate-start": ["flex-[1_1_0%]", "min-w-0", "pb-0"],
      "horizontal-alternate-end": ["flex-[1_1_0%]", "min-w-0", "pb-0"],
    } satisfies Record<Layout, string[]>,
  },
  defaultVariants: { layout: "vertical" },
});

const timelineWrapperVariants = cva(["flex"], {
  variants: {
    layout: {
      vertical: ["flex-row", "gap-x-[16px]"],
      "vertical-end": ["flex-row", "gap-x-[16px]"],
      alternate: ["flex-row", "gap-x-[16px]"],
      "alternate-end": ["flex-row", "gap-x-[16px]"],
      horizontal: ["flex-col", "items-center", "gap-y-[12px]"],
      "horizontal-end": ["flex-col-reverse", "flex-auto", "items-center", "gap-y-[12px]"],
      "horizontal-alternate-start": ["flex-col", "items-center", "h-[78px]"],
      "horizontal-alternate-end": ["flex-col", "items-center", "h-[78px]"],
    } satisfies Record<Layout, string[]>,
  },
  defaultVariants: { layout: "vertical" },
});

const timelineIconVariants = cva(
  ["box-border", "shrink-0", "w-[10px]", "h-[10px]", "rounded-full", "z-1", "leading-none"],
  {
    variants: {
      layout: {
        vertical: ["relative", "mt-[7px]"],
        "vertical-end": ["relative", "mt-[7px]", "order-1"],
        alternate: ["absolute", "mt-[7px]", "start-[var(--ut-tl-span)]", "-ms-[5px]"],
        "alternate-end": ["absolute", "mt-[7px]", "start-[calc(100%-var(--ut-tl-span))]", "-ms-[5px]"],
        horizontal: ["relative"],
        "horizontal-end": ["relative"],
        "horizontal-alternate-start": ["absolute", "top-1/2", "-translate-y-1/2", "m-0"],
        "horizontal-alternate-end": ["absolute", "top-1/2", "-translate-y-1/2", "m-0"],
      } satisfies Record<Layout, string[]>,
      /** `${variant}-${color}` 或 `custom-${color}`（自定义图标）。 */
      scheme: {
        "outlined-blue": ["border-2", "border-solid", "border-primary", "bg-transparent", "text-primary"],
        "outlined-red": ["border-2", "border-solid", "border-error", "bg-transparent", "text-error"],
        "outlined-green": ["border-2", "border-solid", "border-[#52c41a]", "bg-transparent", "text-[#52c41a]"],
        "outlined-gray": ["border-2", "border-solid", "border-on-surface/25", "bg-transparent", "text-on-surface/25"],
        "filled-blue": ["border-2", "border-solid", "border-transparent", "bg-primary", "text-primary"],
        "filled-red": ["border-2", "border-solid", "border-transparent", "bg-error", "text-error"],
        "filled-green": ["border-2", "border-solid", "border-transparent", "bg-[#52c41a]", "text-[#52c41a]"],
        "filled-gray": ["border-2", "border-solid", "border-transparent", "bg-on-surface/25", "text-on-surface/25"],
        // 自定义图标：无边框、12px，内容居中并允许溢出 10×10 的圆点盒；子元素禁止收缩（否则 16px 图标被 flex 压成 10px）。
        "custom-blue": ["border-0", "text-[12px]", "text-primary", "flex", "items-center", "justify-center", "overflow-visible", "[&>*]:shrink-0"],
        "custom-red": ["border-0", "text-[12px]", "text-error", "flex", "items-center", "justify-center", "overflow-visible", "[&>*]:shrink-0"],
        "custom-green": ["border-0", "text-[12px]", "text-[#52c41a]", "flex", "items-center", "justify-center", "overflow-visible", "[&>*]:shrink-0"],
        "custom-gray": ["border-0", "text-[12px]", "text-on-surface/25", "flex", "items-center", "justify-center", "overflow-visible", "[&>*]:shrink-0"],
      },
    },
    defaultVariants: { layout: "vertical", scheme: "outlined-blue" },
  }
);

const timelineSectionVariants = cva(["min-w-0"], {
  variants: {
    layout: {
      vertical: ["flex", "flex-col", "flex-auto"],
      "vertical-end": ["flex", "flex-col", "flex-auto"],
      alternate: ["flex", "flex-nowrap", "flex-auto", "gap-x-[40px]"],
      "alternate-end": ["flex", "flex-nowrap", "flex-auto", "gap-x-[40px]"],
      horizontal: ["flex", "flex-col", "items-center", "w-full"],
      "horizontal-end": ["flex", "flex-col", "items-center", "w-full"],
      "horizontal-alternate-start": [],
      "horizontal-alternate-end": [],
    } satisfies Record<Layout, string[]>,
  },
  defaultVariants: { layout: "vertical" },
});

const timelineHeaderVariants = cva(["flex"], {
  variants: {
    layout: {
      vertical: ["flex-[0_1_auto]"],
      "vertical-end": ["flex-[0_1_auto]", "[justify-content:end]"],
      alternate: ["flex-col", "items-stretch", "text-end", "flex-[1_1_calc(var(--ut-tl-span)-20px)]"],
      "alternate-end": ["flex-col", "items-stretch", "text-start", "order-1", "flex-[1_1_calc(var(--ut-tl-span)-20px)]"],
      horizontal: ["justify-center", "text-center"],
      "horizontal-end": ["justify-center", "text-center"],
      "horizontal-alternate-start": [],
      "horizontal-alternate-end": [],
    } satisfies Record<Layout, string[]>,
    titled: {
      true: ["min-h-[24px]"],
      false: ["min-h-0"],
    },
  },
  defaultVariants: { layout: "vertical", titled: false },
});

const timelineTitleVariants = cva(["text-[14px]", "leading-[22px]", "text-on-surface"], {
  variants: {
    layout: {
      vertical: [],
      "vertical-end": [],
      alternate: [],
      "alternate-end": [],
      horizontal: [],
      "horizontal-end": [],
      "horizontal-alternate-start": ["absolute", "whitespace-nowrap", "left-1/2", "-translate-x-1/2", "bottom-[56px]"],
      "horizontal-alternate-end": ["absolute", "whitespace-nowrap", "left-1/2", "-translate-x-1/2", "top-[56px]"],
    } satisfies Record<Layout, string[]>,
  },
  defaultVariants: { layout: "vertical" },
});

const timelineContentVariants = cva(["text-[14px]", "leading-[22px]", "text-on-surface", "break-words"], {
  variants: {
    layout: {
      vertical: ["flex-[0_1_auto]", "text-start"],
      "vertical-end": ["flex-[0_1_auto]", "text-end"],
      alternate: ["text-start", "flex-[1_1_calc(100%-var(--ut-tl-span)-20px)]"],
      "alternate-end": ["text-end", "flex-[1_1_calc(100%-var(--ut-tl-span)-20px)]"],
      horizontal: ["text-center"],
      "horizontal-end": ["text-center"],
      "horizontal-alternate-start": ["absolute", "whitespace-nowrap", "left-1/2", "-translate-x-1/2", "top-[56px]"],
      "horizontal-alternate-end": ["absolute", "whitespace-nowrap", "left-1/2", "-translate-x-1/2", "bottom-[56px]"],
    } satisfies Record<Layout, string[]>,
    /** 无标题时内容下移 1px，与圆点居中对齐。 */
    emptyHeader: {
      true: ["mt-[1px]"],
      false: ["mt-0"],
    },
  },
  defaultVariants: { layout: "vertical", emptyHeader: true },
});

const timelineRailVariants = cva(["absolute", "border-solid", "border-on-surface/6", "border-0"], {
  variants: {
    layout: {
      vertical: ["top-[17px]", "bottom-[-7px]", "start-[5px]", "-ms-[1px]", "border-s-2"],
      "vertical-end": ["top-[17px]", "bottom-[-7px]", "end-[5px]", "-me-[1px]", "border-s-2"],
      alternate: ["top-[17px]", "bottom-[-7px]", "start-[var(--ut-tl-span)]", "-ms-[1px]", "border-s-2"],
      "alternate-end": ["top-[17px]", "bottom-[-7px]", "start-[calc(100%-var(--ut-tl-span))]", "-ms-[1px]", "border-s-2"],
      horizontal: ["top-0", "mt-[4px]", "border-t-2", "w-[calc(100%-10px)]", "start-[calc(50%+5px)]"],
      "horizontal-end": ["bottom-[4px]", "translate-y-1/2", "border-t-2", "w-[calc(100%-10px)]", "start-[calc(50%+5px)]"],
      "horizontal-alternate-start": ["top-1/2", "-translate-y-1/2", "m-0", "border-t-2", "w-[calc(100%-10px)]", "start-[calc(50%+5px)]"],
      "horizontal-alternate-end": ["top-1/2", "-translate-y-1/2", "m-0", "border-t-2", "w-[calc(100%-10px)]", "start-[calc(50%+5px)]"],
    } satisfies Record<Layout, string[]>,
  },
  defaultVariants: { layout: "vertical" },
});

export type TimelineLayout = Layout;
export const timelineClass = (v: VariantProps<typeof timelineVariants>) => mergeClass(timelineVariants(v));
export const timelineItemClass = (v: VariantProps<typeof timelineItemVariants>) => mergeClass(timelineItemVariants(v));
export const timelineWrapperClass = (v: VariantProps<typeof timelineWrapperVariants>) => mergeClass(timelineWrapperVariants(v));
export const timelineIconClass = (v: VariantProps<typeof timelineIconVariants>) => mergeClass(timelineIconVariants(v));
export const timelineSectionClass = (v: VariantProps<typeof timelineSectionVariants>) => mergeClass(timelineSectionVariants(v));
export const timelineHeaderClass = (v: VariantProps<typeof timelineHeaderVariants>) => mergeClass(timelineHeaderVariants(v));
export const timelineTitleClass = (v: VariantProps<typeof timelineTitleVariants>) => mergeClass(timelineTitleVariants(v));
export const timelineContentClass = (v: VariantProps<typeof timelineContentVariants>) => mergeClass(timelineContentVariants(v));
export const timelineRailClass = (v: VariantProps<typeof timelineRailVariants>) => mergeClass(timelineRailVariants(v));
