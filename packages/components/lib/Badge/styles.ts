// @unocss-include
import { cva } from "class-variance-authority";

/**
 * antd 6.6.5 Badge 几何：数字高 20px（small 14px）、字号 12px、最小宽度等于高度，
 * 多字符左右 8px；点 6px；1px 表面色描边（badgeShadowColor = colorBorderBg）。
 * 颜色键合并状态、预设色板与本库 gray 扩展，全部以字面量列在 variants 中供 UnoCSS 扫描。
 * 预设色板取 antd 色板第 6 级（darkColor）。
 */

// ---- root ------------------------------------------------------------------

// inline-flex：UnoCSS 图标 span 没有 display，inline-block 父级下会塌成 0×0，
// 数字定位的锚点盒随之消失；flex 让子元素块级化（见 badge-icon-children-display）。
export const badgeRootClass = cva(["relative", "inline-flex"], {
  variants: {
    mode: {
      wrapped: ["items-center", "leading-none"],
      // antd -not-a-wrapper:not(-status): vertical-align: middle
      standalone: ["items-center", "leading-none", "align-middle"],
      // antd -status: line-height inherit, vertical-align baseline
      status: ["items-center", "leading-[inherit]", "align-baseline"],
    },
  },
  defaultVariants: { mode: "wrapped" },
});

// ---- indicator colors ----------------------------------------------------------

const indicatorColor = {
  error: ["bg-error"],
  success: ["bg-[#52c41a]"],
  warning: ["bg-[#faad14]"],
  processing: ["bg-primary"],
  default: ["bg-on-surface/25"],
  primary: ["bg-primary"],
  gray: ["bg-on-surface/25"],
  blue: ['bg-[#1677ff]'],
  purple: ['bg-[#722ed1]'],
  cyan: ['bg-[#13c2c2]'],
  green: ['bg-[#52c41a]'],
  magenta: ['bg-[#eb2f96]'],
  pink: ['bg-[#eb2f96]'],
  red: ['bg-[#f5222d]'],
  orange: ['bg-[#fa8c16]'],
  yellow: ['bg-[#fadb14]'],
  volcano: ['bg-[#fa541c]'],
  geekblue: ['bg-[#2f54eb]'],
  lime: ['bg-[#a0d911]'],
  gold: ['bg-[#faad14]'],
  // 自定义颜色：背景内联，保留描边
  custom: [],
} as const;

// ---- anchor ----------------------------------------------------------------------

// 包裹子元素时：top-0 right-0 + translate(50%, -50%)，transform-origin 100% 0%；
// 独立使用时：relative、无位移（antd -not-a-wrapper），offset 的 right 仍可生效。
const anchor = {
  wrapped: ["absolute", "top-0", "right-0", "translate-x-1/2", "-translate-y-1/2", "origin-top-right"],
  standalone: ["relative", "origin-center"],
} as const;

// 进入/离开缩放：只过渡 opacity 与独立 transform 属性，锚点位移不参与（transition-overlay）。
const motion = {
  true: ["opacity-100", "scale-100"],
  false: ["opacity-0", "scale-0", "pointer-events-none"],
} as const;

// ---- count pill ----------------------------------------------------------------------

export const badgeCountClass = cva(
  [
    "inline-flex", "items-center", "justify-center", "z-[auto]",
    "rounded-full", "whitespace-nowrap", "text-center", "select-none", "font-normal",
    "text-[#fff]", "ring-1", "ring-surface",
    "transition-overlay", "duration-slow", "ease-upthrust",
  ],
  {
    variants: {
      anchor,
      size: {
        middle: ["min-w-[20px]", "h-[20px]", "text-[12px]", "leading-[20px]"],
        small: ["min-w-[14px]", "h-[14px]", "text-[12px]", "leading-[14px]"],
      },
      color: indicatorColor,
      // antd -multiple-words: paddingInline = paddingXS，两种尺寸一致
      words: { true: ["px-[8px]"], false: [] },
      visible: motion,
    },
    defaultVariants: { anchor: "wrapped", size: "middle", color: "error", words: false, visible: true },
  },
);

// ---- dot ------------------------------------------------------------------------

export const badgeDotClass = cva(
  [
    "block", "w-[6px]", "min-w-[6px]", "h-[6px]", "rounded-full", "z-[auto]",
    "ring-1", "ring-surface",
    "transition-overlay", "duration-slow", "ease-upthrust",
  ],
  {
    variants: { anchor, color: indicatorColor, visible: motion },
    defaultVariants: { anchor: "wrapped", color: "error", visible: true },
  },
);

// ---- custom count node --------------------------------------------------------------

// antd -custom-component：只定位，不画数字底色与描边。
export const badgeCustomClass = cva(
  ["flex", "items-center", "justify-center", "transition-overlay", "duration-slow", "ease-upthrust"],
  { variants: { anchor, visible: motion }, defaultVariants: { anchor: "wrapped", visible: true } },
);

// ---- status dot (in-flow, with text) --------------------------------------------------

// antd -status-dot：6px，relative top -1，vertical-align middle。processing 在 ::after
// 画脉冲环（边框取 currentColor，缩放 0.8→2.4 并淡出）。
export const badgeStatusDotClass = cva(
  ["relative", "-top-[1px]", "inline-block", "shrink-0", "w-[6px]", "h-[6px]", "rounded-full", "align-middle"],
  {
    variants: {
      color: indicatorColor,
      processing: {
        true: [
          "text-primary", "overflow-visible",
          "after:absolute", "after:inset-0", "after:rounded-full",
          "after:border", "after:border-solid", "after:border-current",
          "after:content-['']", "after:animate-badge-processing",
        ],
        false: [],
      },
    },
    defaultVariants: { color: "default", processing: false },
  },
);

export const badgeStatusTextClass = "ms-[8px] text-[14px] text-on-surface leading-[inherit]";

// ---- ribbon -------------------------------------------------------------------------

// antd ribbon：top 8px、外伸 8px、左右内边距 8px、行高 22px、4px 圆角、白字。
// 折角是 8×8 的 ::after，4px currentColor 边框，按方位两边透明，scaleY(0.75) + brightness(75%)。
export const ribbonClass = cva(
  ["absolute", "top-[8px]", "h-[22px]", "px-[8px]", "leading-[22px]", "rounded-sm", "whitespace-nowrap", "text-[14px]"],
  {
    variants: {
      placement: {
        end: [
          "right-[-8px]", "rounded-br-none",
          "after:absolute", "after:top-full", "after:right-0",
          "after:w-[8px]", "after:h-[8px]",
          "after:border-4", "after:border-solid", "after:border-current",
          "after:border-r-transparent", "after:border-b-transparent",
          "after:content-['']",
          "after:scale-y-75", "after:origin-top", "after:brightness-75",
        ],
        start: [
          "left-[-8px]", "rounded-bl-none",
          "after:absolute", "after:top-full", "after:left-0",
          "after:w-[8px]", "after:h-[8px]",
          "after:border-4", "after:border-solid", "after:border-current",
          "after:border-b-transparent", "after:border-l-transparent",
          "after:content-['']",
          "after:scale-y-75", "after:origin-top", "after:brightness-75",
        ],
      },
      // 底色与文字色同色：文字色驱动折角的 border-current，标签文字另设白色
      color: {
        primary: ["bg-primary", "text-primary"],
        gray: ["bg-on-surface/25", "text-on-surface/25"],
        blue: ['bg-[#1677ff]', 'text-[#1677ff]'],
        purple: ['bg-[#722ed1]', 'text-[#722ed1]'],
        cyan: ['bg-[#13c2c2]', 'text-[#13c2c2]'],
        green: ['bg-[#52c41a]', 'text-[#52c41a]'],
        magenta: ['bg-[#eb2f96]', 'text-[#eb2f96]'],
        pink: ['bg-[#eb2f96]', 'text-[#eb2f96]'],
        red: ['bg-[#f5222d]', 'text-[#f5222d]'],
        orange: ['bg-[#fa8c16]', 'text-[#fa8c16]'],
        yellow: ['bg-[#fadb14]', 'text-[#fadb14]'],
        volcano: ['bg-[#fa541c]', 'text-[#fa541c]'],
        geekblue: ['bg-[#2f54eb]', 'text-[#2f54eb]'],
        lime: ['bg-[#a0d911]', 'text-[#a0d911]'],
        gold: ['bg-[#faad14]', 'text-[#faad14]'],
        // 自定义颜色：背景与 color 内联
        custom: [],
      },
    },
    defaultVariants: { placement: "end", color: "primary" },
  },
);

export const ribbonContentClass = "text-[#fff]";
export const ribbonWrapperClass = "relative";
