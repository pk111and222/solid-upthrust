import { VariantProps } from 'class-variance-authority';
/**
 * antd 6 Empty 样式（components/empty/style）：
 *  - root：marginInline marginXS、fontSize 14、lineHeight 1.5714、居中
 *  - image：高 controlHeightLG × 2.5 = 100px，下边距 8px；svg/img 撑满高度
 *  - description：colorTextDescription（0.45）
 *  - footer：marginTop 16px
 *  - normal（简洁插画）：marginBlock 32px、图片高 40px、文字 colorTextDescription
 */
declare const emptyVariants: (props?: ({
    simple?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const emptyImageVariants: (props?: ({
    simple?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const emptyDescriptionVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const emptyFooterVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const emptyClass: (variants: VariantProps<typeof emptyVariants>) => string;
export declare const emptyImageClass: (variants: VariantProps<typeof emptyImageVariants>) => string;
export declare const emptyDescriptionClass: (variants: VariantProps<typeof emptyDescriptionVariants>) => string;
export declare const emptyFooterClass: (variants: VariantProps<typeof emptyFooterVariants>) => string;
/**
 * 内置插画颜色：antd 用 getAsSolidColor 把半透明填充色预先混到容器底色上，
 * 重叠图形才不会叠色。这里用 color-mix 在 on-surface 与 surface 之间混出实色，随明暗主题变化。
 * （SVG 属性里直接写 var(--upthrust-colors-*) 会静默失效，只能走工具类。）
 */
export declare const emptyImageColors: {
    /** colorFillQuaternary 0.02 */
    readonly fill2: "fill-[color-mix(in_srgb,rgb(var(--upthrust-colors-on-surface))_2%,rgb(var(--upthrust-colors-surface)))]";
    /** colorFillTertiary 0.04 */
    readonly fill4: "fill-[color-mix(in_srgb,rgb(var(--upthrust-colors-on-surface))_4%,rgb(var(--upthrust-colors-surface)))]";
    /** colorFillSecondary 0.06 */
    readonly fill6: "fill-[color-mix(in_srgb,rgb(var(--upthrust-colors-on-surface))_6%,rgb(var(--upthrust-colors-surface)))]";
    /** colorFill 0.15 */
    readonly fill15: "fill-[color-mix(in_srgb,rgb(var(--upthrust-colors-on-surface))_15%,rgb(var(--upthrust-colors-surface)))]";
    /** colorTextQuaternary 0.25 */
    readonly fill25: "fill-[color-mix(in_srgb,rgb(var(--upthrust-colors-on-surface))_25%,rgb(var(--upthrust-colors-surface)))]";
    /** colorFill 0.15（描边） */
    readonly stroke15: "stroke-[color-mix(in_srgb,rgb(var(--upthrust-colors-on-surface))_15%,rgb(var(--upthrust-colors-surface)))]";
    /** colorBgContainer */
    readonly surface: "fill-surface";
};
export {};
