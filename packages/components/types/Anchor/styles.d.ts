import { VariantProps } from 'class-variance-authority';
/** 最外层 wrapper：vertical 超出视口时自身滚动（max-height 由组件内联）。 */
declare const anchorWrapperVariants: (props?: ({
    direction?: "horizontal" | "vertical" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
/** 链接列表：vertical 的 ::before 是左侧 2px 轨道。 */
declare const anchorContainerVariants: (props?: ({
    direction?: "horizontal" | "vertical" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const anchorLinkVariants: (props?: ({
    layout?: "horizontal" | "vertical" | "nested" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const anchorTitleVariants: (props?: ({
    state?: "active" | "idle" | null | undefined;
    spacing?: "horizontal" | "vertical" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const anchorInkVariants: (props?: ({
    direction?: "horizontal" | "vertical" | null | undefined;
    visible?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const anchorWrapperClass: (variants: VariantProps<typeof anchorWrapperVariants>) => string;
export declare const anchorContainerClass: (variants: VariantProps<typeof anchorContainerVariants>) => string;
export declare const anchorLinkClass: (variants: VariantProps<typeof anchorLinkVariants>) => string;
export declare const anchorTitleClass: (variants: VariantProps<typeof anchorTitleVariants>) => string;
export declare const anchorInkClass: (variants: VariantProps<typeof anchorInkVariants>) => string;
export type AnchorTitleVariants = VariantProps<typeof anchorTitleVariants>;
export {};
