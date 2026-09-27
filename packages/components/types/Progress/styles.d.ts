import { VariantProps } from 'class-variance-authority';
/**
 * antd 6 Progress 样式（components/progress/style）：
 *  - root：inline-flex、14px / 1.5714；纯线形 relative + 撑满；small 线形 12px；inline-circle 行高 1
 *  - line body：inline-flex 居中、gap 8px；bottom 布局纵向 gap 4px
 *  - rail：colorFillSecondary、圆角 100px、溢出隐藏；track 绝对定位、0.3s circ 缓动、min-width max-content
 *  - steps body：横向 gap 2px；item 最小宽 2px，点亮为 colorInfo
 *  - circle：导轨 colorFillSecondary，路径按状态着色（渐变时不着色）；数值绝对居中 1em
 */
declare const progressVariants: (props?: ({
    kind?: "circle" | "line" | "line-small" | "steps" | "inline-circle" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const progressBodyVariants: (props?: ({
    kind?: "circle" | "line" | "line-bottom" | "steps" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const progressRailVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const progressTrackVariants: (props?: ({
    tone?: "success" | "active" | "normal" | "exception" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const progressIndicatorVariants: (props?: ({
    kind?: "circle" | "line" | "inner" | "steps" | "line-start" | "inner-start" | "inner-end" | null | undefined;
    tone?: "success" | "normal" | "exception" | "bright" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const progressIconVariants: (props?: ({
    size?: "circle" | "line" | "line-small" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const progressStepItemVariants: (props?: ({
    active?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
/** SVG 描边颜色：导轨、按状态着色的路径、未点亮的步骤格。字符串色走内联 stroke 覆盖。 */
export declare const progressCircleStroke: {
    readonly rail: "stroke-on-surface/6";
    readonly normal: "stroke-primary";
    readonly active: "stroke-primary";
    readonly exception: "stroke-error";
    readonly success: "stroke-[#52c41a]";
};
export declare const progressClass: (v: VariantProps<typeof progressVariants>) => string;
export declare const progressBodyClass: (v: VariantProps<typeof progressBodyVariants>) => string;
export declare const progressRailClass: (v: VariantProps<typeof progressRailVariants>) => string;
export declare const progressTrackClass: (v: VariantProps<typeof progressTrackVariants>) => string;
export declare const progressIndicatorClass: (v: VariantProps<typeof progressIndicatorVariants>) => string;
export declare const progressIconClass: (v: VariantProps<typeof progressIconVariants>) => string;
export declare const progressStepItemClass: (v: VariantProps<typeof progressStepItemVariants>) => string;
export {};
