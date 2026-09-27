// @unocss-include
import { cva } from "class-variance-authority";
import type { SizeType } from "../../common/type";

/** 主轴对齐：对应 CSS justify-content。 */
export type FlexJustify =
  | "flex-start" | "flex-end" | "start" | "end" | "center"
  | "space-between" | "space-around" | "space-evenly"
  | "stretch" | "normal" | "left" | "right";

/** 交叉轴对齐：对应 CSS align-items。 */
export type FlexAlign =
  | "flex-start" | "flex-end" | "start" | "end" | "self-start" | "self-end"
  | "center" | "baseline" | "stretch" | "normal";

/** 换行方式：对应 CSS flex-wrap。 */
export type FlexWrap = "wrap" | "nowrap" | "wrap-reverse";

/** 间距：预设档位走主题 token，数字按 px 处理，其余字符串原样写入 CSS gap。 */
export type FlexGap = SizeType | "medium" | number | (string & {});

/** 走主题间距类的预设档位（small=8px，middle/medium=16px，large=24px）。 */
export type FlexPresetGap = "small" | "middle" | "medium" | "large";

const PRESET_GAPS: ReadonlySet<unknown> = new Set<FlexPresetGap>(["small", "middle", "medium", "large"]);

/** 用 Set 判断而非对象下标，避免 "constructor" 之类的字符串命中原型链。 */
export const isPresetGap = (gap: unknown): gap is FlexPresetGap => PRESET_GAPS.has(gap);

/**
 * wind4 没有 justify-content:start/end/stretch/normal/left/right、
 * align-items:start/end/self-*、normal 的工具类，统一用任意属性类表达；
 * 所有类名都是 variants 下的字面量，保证 UnoCSS 静态扫描能提取。
 * 未传的 wrap/justify/align/gap 不输出类，沿用 CSS 初始值。
 */
export const flexVariants = cva(["empty:hidden"], {
  variants: {
    inline: {
      true: ["inline-flex"],
      false: ["flex"],
    },
    vertical: {
      true: ["flex-col"],
      false: ["flex-row"],
    },
    wrap: {
      wrap: ["flex-wrap"],
      nowrap: ["flex-nowrap"],
      "wrap-reverse": ["flex-wrap-reverse"],
    },
    justify: {
      "flex-start": ["justify-start"],
      "flex-end": ["justify-end"],
      start: ["[justify-content:start]"],
      end: ["[justify-content:end]"],
      center: ["justify-center"],
      "space-between": ["justify-between"],
      "space-around": ["justify-around"],
      "space-evenly": ["justify-evenly"],
      stretch: ["[justify-content:stretch]"],
      normal: ["[justify-content:normal]"],
      left: ["[justify-content:left]"],
      right: ["[justify-content:right]"],
    },
    align: {
      "flex-start": ["items-start"],
      "flex-end": ["items-end"],
      start: ["[align-items:start]"],
      end: ["[align-items:end]"],
      "self-start": ["[align-items:self-start]"],
      "self-end": ["[align-items:self-end]"],
      center: ["items-center"],
      baseline: ["items-baseline"],
      stretch: ["items-stretch"],
      normal: ["[align-items:normal]"],
    },
    gap: {
      small: ["gap-xs"],
      middle: ["gap-md"],
      medium: ["gap-md"],
      large: ["gap-lg"],
    },
  },
});

export interface FlexClassOptions {
  inline: boolean;
  vertical: boolean;
  wrap?: FlexWrap;
  justify?: FlexJustify;
  align?: FlexAlign;
  gap?: FlexPresetGap;
}

export const flexClass = (options: FlexClassOptions) => flexVariants(options);
