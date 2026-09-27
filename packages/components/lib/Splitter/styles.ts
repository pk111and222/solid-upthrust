// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";

/**
 * 标记类：不产生样式，供嵌套选择器（面板内只含一个子 Splitter 时隐藏滚动条）
 * 与使用方定位节点。
 */
export const SPLITTER_MARKER = {
  root: "upthrust-splitter",
  panel: "upthrust-splitter-panel",
  bar: "upthrust-splitter-bar",
  dragger: "upthrust-splitter-dragger",
  draggerIcon: "upthrust-splitter-dragger-icon",
  preview: "upthrust-splitter-preview",
  collapse: "upthrust-splitter-collapse",
  mask: "upthrust-splitter-mask",
} as const;

export const splitterVariants = cva(
  ["upthrust-splitter", "flex", "w-full", "h-full", "items-stretch", "box-border", "text-on-surface"],
  {
    variants: {
      orientation: {
        horizontal: ["flex-row"],
        vertical: ["flex-col"],
      },
    },
    defaultVariants: { orientation: "horizontal" },
  },
);

/**
 * 面板：自身滚动（细滚动条）；尺寸为 0 时裁剪；只含一个嵌套 Splitter 时不滚动。
 * motion 过渡只作用于 flex-basis（折叠按钮与键盘调整时动画，拖拽中由组件关闭）。
 */
export const splitterPanelVariants = cva(
  [
    "upthrust-splitter-panel", "box-border", "overflow-auto", "[scrollbar-width:thin]",
    "[&:has(>.upthrust-splitter:only-child)]:overflow-hidden",
  ],
  {
    variants: {
      collapsed: {
        true: ["overflow-hidden"],
        false: [],
      },
      motion: {
        true: ["[transition:flex-basis_0.3s_cubic-bezier(0.645,0.045,0.355,1)]", "motion-reduce:transition-none"],
        false: [],
      },
    },
    defaultVariants: { collapsed: false, motion: false },
  },
);

/** 分隔条本身不占空间（宽或高为 0），拖拽热区与按钮都绝对定位在它两侧。 */
export const splitterBarVariants = cva(
  ["upthrust-splitter-bar", "group/bar", "relative", "flex-none", "select-none"],
  {
    variants: {
      orientation: {
        horizontal: ["w-0"],
        vertical: ["h-0"],
      },
    },
    defaultVariants: { orientation: "horizontal" },
  },
);

/**
 * 拖拽热区 6px；::before 为 2px 分隔线，::after 为 20px 抓手。
 * state：idle 悬停变浅主色；active 拖拽中加深；disabled 无抓手、默认光标。
 * customize：自定义 draggerIcon 时隐藏默认抓手。
 */
export const splitterDraggerVariants = cva(
  [
    "upthrust-splitter-dragger", "absolute", "top-1/2", "left-1/2", "-translate-x-1/2", "-translate-y-1/2",
    "touch-none", "outline-none",
    "before:content-['']", "before:absolute", "before:top-1/2", "before:left-1/2",
    "before:-translate-x-1/2", "before:-translate-y-1/2", "before:bg-on-surface/4",
    "after:content-['']", "after:absolute", "after:top-1/2", "after:left-1/2",
    "after:-translate-x-1/2", "after:-translate-y-1/2", "after:bg-on-surface/15",
    "focus-visible:before:bg-primary",
  ],
  {
    variants: {
      orientation: {
        horizontal: ["h-full", "w-[6px]", "cursor-col-resize", "before:h-full", "before:w-[2px]", "after:h-5", "after:w-[2px]"],
        vertical: ["w-full", "h-[6px]", "cursor-row-resize", "before:w-full", "before:h-[2px]", "after:w-5", "after:h-[2px]"],
      },
      state: {
        idle: ["z-1", "hover:before:bg-primary-container"],
        active: ["z-2", "before:bg-primary/30"],
        disabled: ["z-0", "cursor-default", "after:hidden"],
      },
      customize: {
        true: ["after:hidden"],
        false: [],
      },
    },
    defaultVariants: { orientation: "horizontal", state: "idle", customize: false },
  },
);

/** 自定义拖拽图标：居中；拖拽中变主色；不可拖拽时隐藏。 */
export const splitterDraggerIconVariants = cva(
  [
    "upthrust-splitter-dragger-icon", "absolute", "top-1/2", "left-1/2", "-translate-x-1/2", "-translate-y-1/2",
    "flex", "items-center", "pointer-events-none",
  ],
  {
    variants: {
      state: {
        idle: ["text-on-surface/15"],
        active: ["text-primary"],
        disabled: ["hidden"],
      },
    },
    defaultVariants: { state: "idle" },
  },
);

/** lazy 模式的拖拽预览线：2px 主色 20% 透明度，按受约束的偏移平移。 */
export const splitterPreviewVariants = cva(
  ["upthrust-splitter-preview", "absolute", "z-1", "pointer-events-none", "bg-primary", "opacity-20"],
  {
    variants: {
      orientation: {
        horizontal: ["top-0", "left-[-1px]", "h-full", "w-[2px]"],
        vertical: ["left-0", "top-[-1px]", "w-full", "h-[2px]"],
      },
    },
    defaultVariants: { orientation: "horizontal" },
  },
);

/**
 * 折叠按钮：12×24（纵向 24×12），分别挂在分隔条前后 3px 处。
 * placement 合并了方向与前后位置；visibility：visible 常显、hidden 不显示、
 * hover 仅在悬停 / 聚焦分隔条（及无悬停能力的触屏）时显示。
 */
export const splitterCollapseVariants = cva(
  [
    "upthrust-splitter-collapse", "absolute", "z-1000", "flex", "items-center", "justify-center",
    "text-xs", "rounded-[2px]", "text-on-surface", "cursor-pointer",
    "focus-visible:outline-2", "focus-visible:outline-solid", "focus-visible:outline-offset-1", "focus-visible:outline-primary",
  ],
  {
    variants: {
      placement: {
        "horizontal-start": ["top-1/2", "right-[3px]", "-translate-y-1/2", "w-3", "h-6"],
        "horizontal-end": ["top-1/2", "left-[3px]", "-translate-y-1/2", "w-3", "h-6"],
        "vertical-start": ["left-1/2", "bottom-[3px]", "-translate-x-1/2", "w-6", "h-3"],
        "vertical-end": ["left-1/2", "top-[3px]", "-translate-x-1/2", "w-6", "h-3"],
      },
      appearance: {
        default: ["bg-on-surface/4", "hover:bg-primary-container", "active:bg-primary/30"],
        customize: ["bg-transparent"],
      },
      visibility: {
        visible: ["opacity-100"],
        hidden: ["hidden"],
        hover: [
          "opacity-0", "group-hover/bar:opacity-100", "group-active/bar:opacity-100",
          "group-focus-within/bar:opacity-100", "[@media(hover:none)]:opacity-100",
        ],
      },
    },
    defaultVariants: { placement: "horizontal-start", appearance: "default", visibility: "hover" },
  },
);

/** 折叠按钮的默认图标：横向左 / 右箭头，纵向上 / 下箭头。 */
export const SPLITTER_COLLAPSE_ICON = {
  "horizontal-start": "i-mdi-chevron-left",
  "horizontal-end": "i-mdi-chevron-right",
  "vertical-start": "i-mdi-chevron-up",
  "vertical-end": "i-mdi-chevron-down",
} as const;

/** 拖拽期间覆盖整个视口，锁定光标并挡住 iframe 等吞事件的元素。 */
export const splitterMaskVariants = cva(
  ["upthrust-splitter-mask", "fixed", "inset-0", "z-1000"],
  {
    variants: {
      orientation: {
        horizontal: ["cursor-col-resize"],
        vertical: ["cursor-row-resize"],
      },
    },
    defaultVariants: { orientation: "horizontal" },
  },
);

/** Splitter 外单独使用 Panel 时的普通块（不参与分割）。 */
export const PANEL_STANDALONE_CLASS = ["upthrust-splitter-panel", "box-border", "overflow-auto"];

export type SplitterStyleVariants = VariantProps<typeof splitterVariants>;
export type SplitterDraggerState = NonNullable<VariantProps<typeof splitterDraggerVariants>["state"]>;
export type SplitterCollapseVisibility = NonNullable<VariantProps<typeof splitterCollapseVariants>["visibility"]>;
