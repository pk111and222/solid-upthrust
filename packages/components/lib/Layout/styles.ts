// @unocss-include
import { cva } from "class-variance-authority";

/**
 * 各区域的标记类。本身不产生样式，供 Layout 的子选择器定位直接子元素
 * （has-sider 时嵌套 Layout / Content 宽度归零），也方便消费方写选择器。
 */
export const LAYOUT_MARKER = {
  layout: "upthrust-layout",
  header: "upthrust-layout-header",
  footer: "upthrust-layout-footer",
  content: "upthrust-layout-content",
  sider: "upthrust-layout-sider",
} as const;

/**
 * Layout 根：纵向 flex 容器；含 Sider 时改为横向。
 * 横向时直接子级的嵌套 Layout / Content 宽度归零再由 flex-auto 撑开（antd 同款），
 * 宽表格等长内容因此不会把 Sider 挤窄。
 */
export const layoutVariants = cva([LAYOUT_MARKER.layout, "flex", "flex-auto", "min-h-0"], {
  variants: {
    hasSider: {
      true: ["flex-row", "[&>.upthrust-layout]:w-0", "[&>.upthrust-layout-content]:w-0"],
      false: ["flex-col"],
    },
  },
});

/** 顶部栏：64px 高、不参与伸缩。本库保持浅色顶栏（antd 默认深色 #001529）。 */
export const HEADER_CLASS = [
  LAYOUT_MARKER.header,
  "flex", "flex-none", "items-center", "h-[64px]", "px-lg",
  "bg-surface", "text-on-surface", "border-b", "border-solid", "border-outline-variant",
];

/** 底部栏：不参与伸缩。 */
export const FOOTER_CLASS = [
  LAYOUT_MARKER.footer,
  "flex-none", "px-lg", "py-lg",
  "bg-surface", "text-on-surface-variant", "border-t", "border-solid", "border-outline-variant",
];

/** 内容区：占满剩余空间；min-h-0 允许在定高布局里收缩并自行滚动。 */
export const CONTENT_CLASS = [LAYOUT_MARKER.content, "flex-auto", "min-h-0", "bg-surface-variant/40"];

/**
 * Sider 根：纵向 flex，body 占满、触发器贴底。宽度由内联 flex/width/min/max 决定。
 * 不在根上裁剪 overflow——零宽触发器画在根节点外侧（right:-40px）。
 * hasTrigger 时触发器在文档流内占 48px，内容不会被它盖住。
 */
export const siderVariants = cva(
  [LAYOUT_MARKER.sider, "relative", "flex", "flex-col", "min-w-0", "transition-upthrust"],
  {
    variants: {
      theme: {
        dark: ["bg-inverse-surface", "text-inverse-on-surface"],
        light: ["bg-surface", "text-on-surface"],
      },
    },
  }
);

/**
 * Sider 内容容器：纵向占满剩余高度。横向裁剪，使收起过渡中的超宽内容不溢出到内容区；
 * 纵向在 Sider 定高（例如 h-screen）时滚动，触发器保持可见。
 */
export const SIDER_BODY_CLASS = ["flex-auto", "min-h-0", "overflow-x-hidden", "overflow-y-auto"];

/**
 * 常规触发器：位于 Sider 底部，sticky 贴住视口底边——Sider 比视口高时仍可点击
 * （antd 用 position:fixed，嵌在容器里的布局会跑出容器，这里改为 sticky）。
 * sticky 时会盖在内容上方，所以背景必须不透明，悬停只改文字色。
 */
export const siderTriggerVariants = cva(
  [
    "sticky", "bottom-0", "z-1", "flex-none", "h-[48px]",
    "flex", "items-center", "justify-center", "cursor-pointer", "select-none",
    "border-t", "border-solid", "transition-upthrust-fast",
    "focus-visible:outline-2", "focus-visible:outline-solid", "focus-visible:-outline-offset-2", "focus-visible:outline-primary",
  ],
  {
    variants: {
      theme: {
        dark: ["border-inverse-on-surface/15", "bg-inverse-surface", "text-inverse-on-surface", "hover:text-inverse-primary"],
        light: ["border-outline-variant", "bg-surface", "text-on-surface-variant", "hover:text-primary"],
      },
    },
  }
);

/**
 * 零宽触发器（collapsedWidth=0 时）：40×40 的标签页挂在 Sider 外侧、距顶 64px，
 * Sider 收起到 0 宽后仍可点开。side 取决于 reverseArrow；配色按 theme。
 * 位置与配色合并成一个变体键，保证所有类名都是 variants 下的字面量。
 */
export const siderZeroTriggerVariants = cva(
  [
    "absolute", "top-[64px]", "z-1", "w-[40px]", "h-[40px]",
    "flex", "items-center", "justify-center", "text-xl", "cursor-pointer", "select-none",
    "transition-upthrust",
    "focus-visible:outline-2", "focus-visible:outline-solid", "focus-visible:outline-offset-2", "focus-visible:outline-primary",
  ],
  {
    variants: {
      scheme: {
        "end-dark": ["right-[-40px]", "rounded-r-lg", "bg-inverse-surface", "text-inverse-on-surface", "hover:text-inverse-primary"],
        "start-dark": ["left-[-40px]", "rounded-l-lg", "bg-inverse-surface", "text-inverse-on-surface", "hover:text-inverse-primary"],
        "end-light": [
          "right-[-40px]", "rounded-r-lg", "bg-surface", "text-on-surface", "hover:text-primary",
          "border", "border-solid", "border-outline-variant", "border-l-0",
        ],
        "start-light": [
          "left-[-40px]", "rounded-l-lg", "bg-surface", "text-on-surface", "hover:text-primary",
          "border", "border-solid", "border-outline-variant", "border-r-0",
        ],
      },
    },
  }
);

export type SiderTheme = "dark" | "light";
