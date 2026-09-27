import { VariantProps } from 'class-variance-authority';
/**
 * antd 6 Statistic 样式（components/statistic/style）：
 *  - root：resetComponent（colorText、14px、lineHeight 1.5714）
 *  - header：paddingBottom marginXXS 4px；title：colorTextDescription、titleFontSize 14px
 *  - content：colorTextHeading、contentFontSize = fontSizeHeading3 24px，行高继承 root
 *  - value：inline-block + direction ltr；prefix / suffix：inline-block，与数值间距 4px
 *  - skeleton：paddingTop 16px
 */
declare const statisticVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const statisticHeaderVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const statisticTitleVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const statisticContentVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const statisticValueVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const statisticAffixVariants: (props?: ({
    side?: "prefix" | "suffix" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const statisticSkeletonVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const statisticClass: (variants: VariantProps<typeof statisticVariants>) => string;
export declare const statisticHeaderClass: (variants: VariantProps<typeof statisticHeaderVariants>) => string;
export declare const statisticTitleClass: (variants: VariantProps<typeof statisticTitleVariants>) => string;
export declare const statisticContentClass: (variants: VariantProps<typeof statisticContentVariants>) => string;
export declare const statisticValueClass: (variants: VariantProps<typeof statisticValueVariants>) => string;
export declare const statisticAffixClass: (variants: VariantProps<typeof statisticAffixVariants>) => string;
export declare const statisticSkeletonClass: (variants: VariantProps<typeof statisticSkeletonVariants>) => string;
export {};
