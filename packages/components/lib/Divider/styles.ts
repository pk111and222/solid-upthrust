// @unocss-include
import { cva } from "class-variance-authority";

/**
 * Divider 的三个节点：root（无标题时自身就是线）、rail（标题两侧的线段）、content（标题）。
 * 线色统一 border-outline-variant/40；所有类名均为 variants 下的字面量。
 */
export const dividerVariants = cva(["border-0", "border-outline-variant/40"], {
  variants: {
    layout: {
      /** 无标题水平线：顶边 1px，撑满宽度。 */
      horizontal: ["flex", "w-full", "min-w-full", "border-t"],
      /** 带标题：自身不画线，由两段 rail 画。 */
      titled: ["flex", "w-full", "min-w-full", "items-center", "whitespace-nowrap", "text-on-surface"],
      /** 垂直线：行内 0.9em 高，与文字基线对齐。 */
      vertical: ["relative", "top-[-0.06em]", "inline-block", "h-[0.9em]", "mx-xs", "align-middle", "border-l"],
    },
    variant: {
      solid: ["border-solid"],
      dashed: ["border-dashed"],
      dotted: ["border-dotted"],
    },
    /** 水平方向的上下外边距：无标题默认 24px，带标题默认 16px。 */
    spacing: {
      none: [],
      small: ["my-xs"],
      middle: ["my-md"],
      large: ["my-lg"],
    },
  },
});

/**
 * rail 的线色继承 root（与 antd 的 border-block-start-color: inherit 一致）：
 * 在带标题的 Divider 上写 class="border-primary" 或 style={{ 'border-color': … }} 会同时改变两段 rail。
 * 用 border-[inherit] 而不是 [border-color:inherit]：前者被 mergeClass 识别为边框颜色，
 * classNames.rail 里的颜色类能替换它；后者是独立的任意属性类，不参与合并且生成在颜色类之后，会反压覆盖色。
 */
export const dividerRailVariants = cva(["border-0", "border-t", "border-[inherit]"], {
  variants: {
    variant: {
      solid: ["border-solid"],
      dashed: ["border-dashed"],
      dotted: ["border-dotted"],
    },
    /** fill 占满剩余；short 为标题靠边时的 5% 短线；none 为 orientationMargin 模式下隐藏的一侧。 */
    extent: {
      fill: ["flex-1"],
      short: ["flex-none", "w-[5%]"],
      none: ["flex-none", "w-0"],
    },
  },
});

export const dividerContentVariants = cva(["inline-block", "px-[1em]", "text-on-surface"], {
  variants: {
    plain: {
      true: ["font-normal", "text-body"],
      false: ["font-medium", "text-body-lg"],
    },
  },
});
