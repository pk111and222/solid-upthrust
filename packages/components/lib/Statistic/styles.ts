// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { mergeClass } from "../../common/merge";

/**
 * antd 6 Statistic 样式（components/statistic/style）：
 *  - root：resetComponent（colorText、14px、lineHeight 1.5714）
 *  - header：paddingBottom marginXXS 4px；title：colorTextDescription、titleFontSize 14px
 *  - content：colorTextHeading、contentFontSize = fontSizeHeading3 24px，行高继承 root
 *  - value：inline-block + direction ltr；prefix / suffix：inline-block，与数值间距 4px
 *  - skeleton：paddingTop 16px
 */
const statisticVariants = cva(
  ["m-0", "p-0", "text-on-surface", "text-[14px]", "leading-[1.5714]"],
  { variants: {}, defaultVariants: {} }
);

const statisticHeaderVariants = cva(["pb-[4px]"], { variants: {}, defaultVariants: {} });

const statisticTitleVariants = cva(["text-on-surface/45", "text-[14px]"], { variants: {}, defaultVariants: {} });

const statisticContentVariants = cva(["text-on-surface", "text-[24px]"], { variants: {}, defaultVariants: {} });

const statisticValueVariants = cva(["inline-block", "[direction:ltr]"], { variants: {}, defaultVariants: {} });

const statisticAffixVariants = cva(
  ["inline-block"],
  {
    variants: {
      side: {
        prefix: ["me-[4px]"],
        suffix: ["ms-[4px]"],
      },
    },
    defaultVariants: { side: "prefix" },
  }
);

const statisticSkeletonVariants = cva(["pt-[16px]"], { variants: {}, defaultVariants: {} });

export const statisticClass = (variants: VariantProps<typeof statisticVariants>) => mergeClass(statisticVariants(variants));
export const statisticHeaderClass = (variants: VariantProps<typeof statisticHeaderVariants>) => mergeClass(statisticHeaderVariants(variants));
export const statisticTitleClass = (variants: VariantProps<typeof statisticTitleVariants>) => mergeClass(statisticTitleVariants(variants));
export const statisticContentClass = (variants: VariantProps<typeof statisticContentVariants>) => mergeClass(statisticContentVariants(variants));
export const statisticValueClass = (variants: VariantProps<typeof statisticValueVariants>) => mergeClass(statisticValueVariants(variants));
export const statisticAffixClass = (variants: VariantProps<typeof statisticAffixVariants>) => mergeClass(statisticAffixVariants(variants));
export const statisticSkeletonClass = (variants: VariantProps<typeof statisticSkeletonVariants>) => mergeClass(statisticSkeletonVariants(variants));
