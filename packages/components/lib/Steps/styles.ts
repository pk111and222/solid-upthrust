// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

/**
 * Steps 视觉层（对齐 antd 6 Steps，默认 variant = filled）。
 *
 * 三种布局：
 *  - inline：水平方向、标题在图标右侧。rail 挂在标题内（absolute start-full，9999px 宽），
 *    由内容区的 overflow-hidden 裁到本项末端；下一项 ps-16 留出间距，最后一项 flex-none。
 *  - stack：水平方向、标题在图标下方（titlePlacement=vertical 或点状）。rail 以步骤项为定位
 *    祖先，从本项中心 + 半径 + 12px 画到下一项中心 − 半径 − 12px。
 *  - vertical：垂直方向。图标列（图标 + flex-1 竖线）+ 文本列。
 *
 * 全部视觉类都写在 variants 的合并键里（UnoCSS 静态扫描），不使用 compoundVariants。
 */

const FOCUS_RING = [
  "focus-visible:outline-2", "focus-visible:outline-solid", "focus-visible:outline-primary", "focus-visible:-outline-offset-2",
];

const stepsRootVariants = cva(
  ["flex", "box-border", "m-0", "p-0", "text-[14px]", "text-on-surface"],
  {
    variants: {
      orientation: {
        horizontal: ["flex-row", "items-start", "w-full"],
        vertical: ["flex-col"],
      },
    },
    defaultVariants: { orientation: "horizontal" },
  }
);

const stepItemVariants = cva(
  ["group", "relative", "box-border", "min-w-0", "outline-none", "rounded", ...FOCUS_RING],
  {
    variants: {
      layout: {
        inline: ["flex", "items-start"],
        stack: ["flex", "flex-col", "items-center", "text-center"],
        vertical: ["flex", "items-stretch"],
      },
      /** inline 非首项：与上一项的 rail 末端留 16px。 */
      pad: {
        true: ["ps-[16px]"],
        false: [],
      },
      /** inline 最后一项与 vertical 不参与平分宽度。 */
      fill: {
        true: ["flex-1"],
        false: ["flex-none"],
      },
      clickable: {
        true: ["cursor-pointer"],
        false: [],
      },
      disabled: {
        true: ["cursor-not-allowed"],
        false: [],
      },
    },
    defaultVariants: { layout: "inline", pad: false, fill: true, clickable: false, disabled: false },
  }
);

// NOTE：图标圆本身不加任何 i-mdi-*（mask 图标用 currentColor 背景，同元素 bg-* 会让图标隐形）。
const stepIconVariants = cva(
  [
    "relative", "inline-flex", "items-center", "justify-center", "flex-none", "rounded-full",
    "border", "border-solid", "box-border", "select-none", "leading-none", "transition-upthrust",
  ],
  {
    variants: {
      size: {
        default: ["w-[32px]", "h-[32px]", "text-[16px]"],
        small: ["w-[24px]", "h-[24px]", "text-[12px]"],
      },
      tone: {
        "filled-wait": ["bg-on-surface/6", "border-transparent", "text-on-surface/65"],
        "filled-process": ["bg-primary", "border-primary", "text-on-primary"],
        "filled-finish": ["bg-primary/10", "border-transparent", "text-primary"],
        "filled-error": ["bg-error/10", "border-transparent", "text-error"],
        "outlined-wait": ["bg-transparent", "border-on-surface/25", "text-on-surface/45"],
        "outlined-process": ["bg-primary", "border-primary", "text-on-primary"],
        "outlined-finish": ["bg-transparent", "border-primary", "text-primary"],
        "outlined-error": ["bg-transparent", "border-error", "text-error"],
        // 自定义图标：无底色无边框，图标 24px（antd customIconFontSize）。
        "custom-wait": ["bg-transparent", "border-transparent", "text-[24px]", "text-on-surface/45"],
        "custom-process": ["bg-transparent", "border-transparent", "text-[24px]", "text-primary"],
        "custom-finish": ["bg-transparent", "border-transparent", "text-[24px]", "text-primary"],
        "custom-error": ["bg-transparent", "border-transparent", "text-[24px]", "text-error"],
      },
      /** 可点击的非当前项：悬浮时图标文字变 primary。 */
      hover: {
        true: ["group-hover:text-primary"],
        false: [],
      },
    },
    defaultVariants: { size: "default", tone: "filled-wait", hover: false },
  }
);

const stepGlyphVariants = cva(
  ["w-[1em]", "h-[1em]"],
  {
    variants: {
      glyph: {
        check: ["i-mdi-check"],
        close: ["i-mdi-close"],
        number: [],
      },
    },
    defaultVariants: { glyph: "number" },
  }
);

/** 当前步骤 percent 圆环：以图标中心为圆心叠在图标外。 */
export const STEP_PROGRESS_CLASS = [
  "absolute", "top-1/2", "left-1/2", "-translate-x-1/2", "-translate-y-1/2", "flex", "leading-[0]", "pointer-events-none",
];

const stepDotWrapVariants = cva(
  ["flex", "items-center", "justify-center", "flex-none"],
  {
    variants: {
      layout: {
        stack: ["h-[8px]", "w-full"],
        "vertical-default": ["h-[32px]", "w-[10px]"],
        "vertical-small": ["h-[24px]", "w-[10px]"],
      },
    },
    defaultVariants: { layout: "stack" },
  }
);

const stepDotVariants = cva(
  ["block", "rounded-full", "transition-upthrust"],
  {
    variants: {
      tone: {
        wait: ["bg-on-surface/25"],
        process: ["bg-primary"],
        finish: ["bg-primary"],
        error: ["bg-error"],
      },
      /** 当前点放大（antd dotSize 8 / dotCurrentSize 10）。 */
      size: {
        default: ["w-[8px]", "h-[8px]"],
        "default-current": ["w-[10px]", "h-[10px]"],
        small: ["w-[6px]", "h-[6px]"],
        "small-current": ["w-[8px]", "h-[8px]"],
      },
    },
    defaultVariants: { tone: "wait", size: "default" },
  }
);

const stepRailVariants = cva(
  ["block", "pointer-events-none", "border-0", "border-solid", "transition-upthrust"],
  {
    variants: {
      /** 本项已完成时 rail 为 primary（antd：finish 项的 tail）。 */
      tone: {
        finish: ["border-primary"],
        rest: ["border-outline-variant"],
      },
      layout: {
        "inline-default": ["absolute", "top-[16px]", "start-full", "w-[9999px]", "border-t"],
        "inline-small": ["absolute", "top-[12px]", "start-full", "w-[9999px]", "border-t"],
        "stack-default": ["absolute", "top-[16px]", "left-[calc(50%+28px)]", "right-[calc(-50%+28px)]", "border-t"],
        "stack-small": ["absolute", "top-[12px]", "left-[calc(50%+24px)]", "right-[calc(-50%+24px)]", "border-t"],
        dot: ["absolute", "top-[2.5px]", "left-[calc(50%+12px)]", "right-[calc(-50%+12px)]", "border-t-3"],
        vertical: ["flex-1", "w-0", "min-h-[16px]", "my-[4px]", "border-s"],
      },
    },
    defaultVariants: { tone: "rest", layout: "inline-default" },
  }
);

/** 垂直方向的图标列：图标在上，竖线 flex-1 撑满本项高度。 */
export const STEP_VERTICAL_COLUMN_CLASS = ["flex", "flex-col", "items-center", "flex-none"];

const stepBodyVariants = cva(
  ["box-border", "min-w-0"],
  {
    variants: {
      layout: {
        // 内容区裁掉 rail 超出本项的部分（图标不在内容区内，percent 圆环不被裁）。
        inline: ["ms-[8px]", "flex-1", "overflow-hidden"],
        stack: ["mt-[12px]", "flex", "flex-col", "items-center", "px-[8px]"],
        dot: ["mt-[8px]", "flex", "flex-col", "items-center", "px-[8px]"],
        vertical: ["ms-[12px]", "flex-1", "pb-[24px]"],
        "vertical-last": ["ms-[12px]", "flex-1"],
      },
    },
    defaultVariants: { layout: "inline" },
  }
);

const stepTitleVariants = cva(
  ["relative", "inline-block", "transition-upthrust-fast"],
  {
    variants: {
      layout: {
        "inline-default": ["text-[16px]", "leading-[32px]", "pe-[16px]"],
        "inline-small": ["text-[14px]", "leading-[24px]", "pe-[16px]"],
        "stack-default": ["text-[16px]", "leading-[24px]"],
        "stack-small": ["text-[14px]", "leading-[22px]"],
        "vertical-default": ["text-[16px]", "leading-[32px]"],
        "vertical-small": ["text-[14px]", "leading-[24px]"],
      },
      tone: {
        wait: ["text-on-surface/45"],
        process: ["text-on-surface"],
        finish: ["text-on-surface"],
        error: ["text-error"],
      },
      hover: {
        true: ["group-hover:text-primary"],
        false: [],
      },
    },
    defaultVariants: { layout: "inline-default", tone: "wait", hover: false },
  }
);

export const STEP_SUBTITLE_CLASS = ["inline", "ms-[8px]", "text-[14px]", "font-normal", "text-on-surface/45"];

const stepContentVariants = cva(
  ["text-[14px]", "leading-[22px]", "break-words", "transition-upthrust-fast"],
  {
    variants: {
      tone: {
        wait: ["text-on-surface/45"],
        process: ["text-on-surface"],
        finish: ["text-on-surface/45"],
        error: ["text-error"],
      },
      layout: {
        inline: ["max-w-[140px]"],
        stack: ["max-w-[140px]"],
        vertical: [],
      },
    },
    defaultVariants: { tone: "wait", layout: "inline" },
  }
);

export const stepsRootClass = (v: VariantProps<typeof stepsRootVariants>) => twMerge(stepsRootVariants(v));
export const stepItemClass = (v: VariantProps<typeof stepItemVariants>) => twMerge(stepItemVariants(v));
export const stepIconClass = (v: VariantProps<typeof stepIconVariants>) => twMerge(stepIconVariants(v));
export const stepGlyphClass = (v: VariantProps<typeof stepGlyphVariants>) => twMerge(stepGlyphVariants(v));
export const stepDotWrapClass = (v: VariantProps<typeof stepDotWrapVariants>) => twMerge(stepDotWrapVariants(v));
export const stepDotClass = (v: VariantProps<typeof stepDotVariants>) => twMerge(stepDotVariants(v));
export const stepRailClass = (v: VariantProps<typeof stepRailVariants>) => twMerge(stepRailVariants(v));
export const stepBodyClass = (v: VariantProps<typeof stepBodyVariants>) => twMerge(stepBodyVariants(v));
export const stepTitleClass = (v: VariantProps<typeof stepTitleVariants>) => twMerge(stepTitleVariants(v));
export const stepContentClass = (v: VariantProps<typeof stepContentVariants>) => twMerge(stepContentVariants(v));

export type StepIconTone = NonNullable<VariantProps<typeof stepIconVariants>["tone"]>;
export type StepRailLayout = NonNullable<VariantProps<typeof stepRailVariants>["layout"]>;
