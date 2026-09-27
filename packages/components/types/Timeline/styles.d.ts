import { VariantProps } from 'class-variance-authority';
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
declare const timelineVariants: (props?: ({
    orientation?: "horizontal" | "vertical" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
/** 布局：vertical / vertical-end（同侧）、alternate / alternate-end（交替，按节点 placement）、horizontal 系列。 */
type Layout = "vertical" | "vertical-end" | "alternate" | "alternate-end" | "horizontal" | "horizontal-end" | "horizontal-alternate-start" | "horizontal-alternate-end";
declare const timelineItemVariants: (props?: ({
    layout?: "horizontal" | "vertical" | "alternate" | "horizontal-end" | "vertical-end" | "alternate-end" | "horizontal-alternate-start" | "horizontal-alternate-end" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const timelineWrapperVariants: (props?: ({
    layout?: "horizontal" | "vertical" | "alternate" | "horizontal-end" | "vertical-end" | "alternate-end" | "horizontal-alternate-start" | "horizontal-alternate-end" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const timelineIconVariants: (props?: ({
    layout?: "horizontal" | "vertical" | "alternate" | "horizontal-end" | "vertical-end" | "alternate-end" | "horizontal-alternate-start" | "horizontal-alternate-end" | null | undefined;
    scheme?: "outlined-blue" | "outlined-red" | "outlined-green" | "outlined-gray" | "filled-blue" | "filled-red" | "filled-green" | "filled-gray" | "custom-blue" | "custom-red" | "custom-green" | "custom-gray" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const timelineSectionVariants: (props?: ({
    layout?: "horizontal" | "vertical" | "alternate" | "horizontal-end" | "vertical-end" | "alternate-end" | "horizontal-alternate-start" | "horizontal-alternate-end" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const timelineHeaderVariants: (props?: ({
    layout?: "horizontal" | "vertical" | "alternate" | "horizontal-end" | "vertical-end" | "alternate-end" | "horizontal-alternate-start" | "horizontal-alternate-end" | null | undefined;
    titled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const timelineTitleVariants: (props?: ({
    layout?: "horizontal" | "vertical" | "alternate" | "horizontal-end" | "vertical-end" | "alternate-end" | "horizontal-alternate-start" | "horizontal-alternate-end" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const timelineContentVariants: (props?: ({
    layout?: "horizontal" | "vertical" | "alternate" | "horizontal-end" | "vertical-end" | "alternate-end" | "horizontal-alternate-start" | "horizontal-alternate-end" | null | undefined;
    emptyHeader?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const timelineRailVariants: (props?: ({
    layout?: "horizontal" | "vertical" | "alternate" | "horizontal-end" | "vertical-end" | "alternate-end" | "horizontal-alternate-start" | "horizontal-alternate-end" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export type TimelineLayout = Layout;
export declare const timelineClass: (v: VariantProps<typeof timelineVariants>) => string;
export declare const timelineItemClass: (v: VariantProps<typeof timelineItemVariants>) => string;
export declare const timelineWrapperClass: (v: VariantProps<typeof timelineWrapperVariants>) => string;
export declare const timelineIconClass: (v: VariantProps<typeof timelineIconVariants>) => string;
export declare const timelineSectionClass: (v: VariantProps<typeof timelineSectionVariants>) => string;
export declare const timelineHeaderClass: (v: VariantProps<typeof timelineHeaderVariants>) => string;
export declare const timelineTitleClass: (v: VariantProps<typeof timelineTitleVariants>) => string;
export declare const timelineContentClass: (v: VariantProps<typeof timelineContentVariants>) => string;
export declare const timelineRailClass: (v: VariantProps<typeof timelineRailVariants>) => string;
export {};
