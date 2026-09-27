/**
 * Divider 的三个节点：root（无标题时自身就是线）、rail（标题两侧的线段）、content（标题）。
 * 线色统一 border-outline-variant/40；所有类名均为 variants 下的字面量。
 */
export declare const dividerVariants: (props?: ({
    layout?: "horizontal" | "vertical" | "titled" | null | undefined;
    variant?: "dashed" | "dotted" | "solid" | null | undefined;
    spacing?: "small" | "middle" | "large" | "none" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
/**
 * rail 的线色继承 root（与 antd 的 border-block-start-color: inherit 一致）：
 * 在带标题的 Divider 上写 class="border-primary" 或 style={{ 'border-color': … }} 会同时改变两段 rail。
 * 用 border-[inherit] 而不是 [border-color:inherit]：前者被 mergeClass 识别为边框颜色，
 * classNames.rail 里的颜色类能替换它；后者是独立的任意属性类，不参与合并且生成在颜色类之后，会反压覆盖色。
 */
export declare const dividerRailVariants: (props?: ({
    variant?: "dashed" | "dotted" | "solid" | null | undefined;
    extent?: "none" | "fill" | "short" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const dividerContentVariants: (props?: ({
    plain?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
