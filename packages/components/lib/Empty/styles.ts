// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { mergeClass } from "../../common/merge";

/**
 * antd 6 Empty 样式（components/empty/style）：
 *  - root：marginInline marginXS、fontSize 14、lineHeight 1.5714、居中
 *  - image：高 controlHeightLG × 2.5 = 100px，下边距 8px；svg/img 撑满高度
 *  - description：colorTextDescription（0.45）
 *  - footer：marginTop 16px
 *  - normal（简洁插画）：marginBlock 32px、图片高 40px、文字 colorTextDescription
 */
const emptyVariants = cva(
  ["mx-[8px]", "text-[14px]", "leading-[1.5714]", "text-center"],
  {
    variants: {
      simple: {
        true: ["my-[32px]", "text-on-surface/45"],
        false: [],
      },
    },
    defaultVariants: { simple: false },
  }
);

const emptyImageVariants = cva(
  // img 在带 preflight 的页面里是 block，text-align 不再居中，需与 svg 一样 margin auto。
  ["mb-[8px]", "[&_img]:h-full", "[&_img]:mx-auto", "[&_svg]:h-full", "[&_svg]:max-w-full", "[&_svg]:m-auto"],
  {
    variants: {
      simple: {
        true: ["h-[40px]"],
        false: ["h-[100px]"],
      },
    },
    defaultVariants: { simple: false },
  }
);

const emptyDescriptionVariants = cva(["text-on-surface/45"], { variants: {}, defaultVariants: {} });

const emptyFooterVariants = cva(["mt-[16px]"], { variants: {}, defaultVariants: {} });

export const emptyClass = (variants: VariantProps<typeof emptyVariants>) => mergeClass(emptyVariants(variants));
export const emptyImageClass = (variants: VariantProps<typeof emptyImageVariants>) => mergeClass(emptyImageVariants(variants));
export const emptyDescriptionClass = (variants: VariantProps<typeof emptyDescriptionVariants>) => mergeClass(emptyDescriptionVariants(variants));
export const emptyFooterClass = (variants: VariantProps<typeof emptyFooterVariants>) => mergeClass(emptyFooterVariants(variants));

/**
 * 内置插画颜色：antd 用 getAsSolidColor 把半透明填充色预先混到容器底色上，
 * 重叠图形才不会叠色。这里用 color-mix 在 on-surface 与 surface 之间混出实色，随明暗主题变化。
 * （SVG 属性里直接写 var(--upthrust-colors-*) 会静默失效，只能走工具类。）
 */
export const emptyImageColors = {
  /** colorFillQuaternary 0.02 */
  fill2: "fill-[color-mix(in_srgb,rgb(var(--upthrust-colors-on-surface))_2%,rgb(var(--upthrust-colors-surface)))]",
  /** colorFillTertiary 0.04 */
  fill4: "fill-[color-mix(in_srgb,rgb(var(--upthrust-colors-on-surface))_4%,rgb(var(--upthrust-colors-surface)))]",
  /** colorFillSecondary 0.06 */
  fill6: "fill-[color-mix(in_srgb,rgb(var(--upthrust-colors-on-surface))_6%,rgb(var(--upthrust-colors-surface)))]",
  /** colorFill 0.15 */
  fill15: "fill-[color-mix(in_srgb,rgb(var(--upthrust-colors-on-surface))_15%,rgb(var(--upthrust-colors-surface)))]",
  /** colorTextQuaternary 0.25 */
  fill25: "fill-[color-mix(in_srgb,rgb(var(--upthrust-colors-on-surface))_25%,rgb(var(--upthrust-colors-surface)))]",
  /** colorFill 0.15（描边） */
  stroke15: "stroke-[color-mix(in_srgb,rgb(var(--upthrust-colors-on-surface))_15%,rgb(var(--upthrust-colors-surface)))]",
  /** colorBgContainer */
  surface: "fill-surface",
} as const;
