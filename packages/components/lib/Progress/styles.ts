// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { mergeClass } from "../../common/merge";

/**
 * antd 6 Progress 样式（components/progress/style）：
 *  - root：inline-flex、14px / 1.5714；纯线形 relative + 撑满；small 线形 12px；inline-circle 行高 1
 *  - line body：inline-flex 居中、gap 8px；bottom 布局纵向 gap 4px
 *  - rail：colorFillSecondary、圆角 100px、溢出隐藏；track 绝对定位、0.3s circ 缓动、min-width max-content
 *  - steps body：横向 gap 2px；item 最小宽 2px，点亮为 colorInfo
 *  - circle：导轨 colorFillSecondary，路径按状态着色（渐变时不着色）；数值绝对居中 1em
 */
const progressVariants = cva(
  ["inline-flex", "m-0", "p-0", "text-on-surface", "text-[14px]", "leading-[1.5714]", "list-none"],
  {
    variants: {
      kind: {
        line: ["relative", "w-full"],
        "line-small": ["relative", "w-full", "text-[12px]"],
        steps: [],
        circle: [],
        "inline-circle": ["leading-none"],
      },
    },
    defaultVariants: { kind: "line" },
  }
);

const progressBodyVariants = cva([], {
  variants: {
    kind: {
      line: ["inline-flex", "items-center", "w-full", "gap-[8px]"],
      "line-bottom": ["inline-flex", "flex-col", "items-center", "w-full", "gap-[4px]"],
      steps: ["flex", "flex-row", "items-center", "gap-[2px]"],
      circle: ["relative", "leading-none", "bg-transparent"],
    },
  },
  defaultVariants: { kind: "line" },
});

const progressRailVariants = cva(
  ["relative", "flex-auto", "w-full", "overflow-hidden", "rounded-[100px]", "bg-on-surface/6"],
  { variants: {}, defaultVariants: {} }
);

const progressTrackVariants = cva(
  [
    "absolute", "start-0", "inset-y-0", "rounded-[inherit]", "flex", "items-center", "min-w-max",
    "transition-all", "duration-300", "ease-[cubic-bezier(0.78,0.14,0.15,0.86)]",
  ],
  {
    variants: {
      tone: {
        normal: ["bg-primary"],
        active: [
          "bg-primary",
          "after:content-['']", "after:absolute", "after:inset-0", "after:bg-surface",
          "after:rounded-[inherit]", "after:opacity-0", "after:animate-progress-active",
        ],
        exception: ["bg-error"],
        success: ["bg-[#52c41a]"],
      },
    },
    defaultVariants: { tone: "normal" },
  }
);

const progressIndicatorVariants = cva(
  ["text-on-surface", "leading-none", "align-middle", "[word-break:normal]"],
  {
    variants: {
      kind: {
        line: ["whitespace-nowrap"],
        "line-start": ["whitespace-nowrap", "order-[-1]"],
        inner: ["whitespace-nowrap", "text-white", "px-[4px]", "w-full", "flex", "justify-center"],
        "inner-start": ["whitespace-nowrap", "text-white", "px-[4px]", "w-full", "flex", "[justify-content:start]"],
        "inner-end": ["whitespace-nowrap", "text-white", "px-[4px]", "w-full", "flex", "[justify-content:end]"],
        steps: ["whitespace-nowrap", "ms-[8px]"],
        circle: [
          "absolute", "top-1/2", "start-0", "w-full", "m-0", "p-0", "text-[1em]", "whitespace-normal",
          "text-center", "-translate-y-1/2",
        ],
      },
      tone: {
        normal: [],
        exception: ["text-error"],
        success: ["text-[#52c41a]"],
        // 亮色进度条上的内部数值：antd 固定 rgba(0,0,0,0.45)。
        bright: ["text-black/45"],
      },
    },
    defaultVariants: { kind: "line", tone: "normal" },
  }
);

const progressIconVariants = cva(["inline-block", "align-[-0.125em]"], {
  variants: {
    size: {
      line: ["text-[14px]"],
      "line-small": ["text-[12px]"],
      circle: ["text-[1.1667em]"],
    },
  },
  defaultVariants: { size: "line" },
});

const progressStepItemVariants = cva(
  ["shrink-0", "min-w-[2px]", "transition-all", "duration-300"],
  {
    variants: {
      active: {
        true: ["bg-primary"],
        false: ["bg-on-surface/6"],
      },
    },
    defaultVariants: { active: false },
  }
);

/** SVG 描边颜色：导轨、按状态着色的路径、未点亮的步骤格。字符串色走内联 stroke 覆盖。 */
export const progressCircleStroke = {
  rail: "stroke-on-surface/6",
  normal: "stroke-primary",
  active: "stroke-primary",
  exception: "stroke-error",
  success: "stroke-[#52c41a]",
} as const;

export const progressClass = (v: VariantProps<typeof progressVariants>) => mergeClass(progressVariants(v));
export const progressBodyClass = (v: VariantProps<typeof progressBodyVariants>) => mergeClass(progressBodyVariants(v));
export const progressRailClass = (v: VariantProps<typeof progressRailVariants>) => mergeClass(progressRailVariants(v));
export const progressTrackClass = (v: VariantProps<typeof progressTrackVariants>) => mergeClass(progressTrackVariants(v));
export const progressIndicatorClass = (v: VariantProps<typeof progressIndicatorVariants>) => mergeClass(progressIndicatorVariants(v));
export const progressIconClass = (v: VariantProps<typeof progressIconVariants>) => mergeClass(progressIconVariants(v));
export const progressStepItemClass = (v: VariantProps<typeof progressStepItemVariants>) => mergeClass(progressStepItemVariants(v));
