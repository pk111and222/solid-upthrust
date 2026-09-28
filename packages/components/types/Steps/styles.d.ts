import { VariantProps } from 'class-variance-authority';
declare const stepsRootVariants: (props?: ({
    orientation?: "horizontal" | "vertical" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const stepItemVariants: (props?: ({
    layout?: "vertical" | "inline" | "stack" | null | undefined;
    pad?: boolean | null | undefined;
    fill?: boolean | null | undefined;
    clickable?: boolean | null | undefined;
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const stepIconVariants: (props?: ({
    size?: "small" | "default" | null | undefined;
    tone?: "outlined-error" | "filled-error" | "filled-wait" | "filled-process" | "filled-finish" | "outlined-wait" | "outlined-process" | "outlined-finish" | "custom-wait" | "custom-process" | "custom-finish" | "custom-error" | null | undefined;
    hover?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const stepGlyphVariants: (props?: ({
    glyph?: "number" | "close" | "check" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
/** 当前步骤 percent 圆环：以图标中心为圆心叠在图标外。 */
export declare const STEP_PROGRESS_CLASS: string[];
declare const stepDotWrapVariants: (props?: ({
    layout?: "stack" | "vertical-default" | "vertical-small" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const stepDotVariants: (props?: ({
    tone?: "error" | "wait" | "process" | "finish" | null | undefined;
    size?: "small" | "default" | "default-current" | "small-current" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const stepRailVariants: (props?: ({
    tone?: "finish" | "rest" | null | undefined;
    layout?: "vertical" | "dot" | "inline-default" | "inline-small" | "stack-default" | "stack-small" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
/** 垂直方向的图标列：图标在上，竖线 flex-1 撑满本项高度。 */
export declare const STEP_VERTICAL_COLUMN_CLASS: string[];
declare const stepBodyVariants: (props?: ({
    layout?: "vertical" | "inline" | "dot" | "stack" | "vertical-last" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const stepTitleVariants: (props?: ({
    layout?: "vertical-default" | "vertical-small" | "inline-default" | "inline-small" | "stack-default" | "stack-small" | null | undefined;
    tone?: "error" | "wait" | "process" | "finish" | null | undefined;
    hover?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const STEP_SUBTITLE_CLASS: string[];
declare const stepContentVariants: (props?: ({
    tone?: "error" | "wait" | "process" | "finish" | null | undefined;
    layout?: "vertical" | "inline" | "stack" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const stepsRootClass: (v: VariantProps<typeof stepsRootVariants>) => string;
export declare const stepItemClass: (v: VariantProps<typeof stepItemVariants>) => string;
export declare const stepIconClass: (v: VariantProps<typeof stepIconVariants>) => string;
export declare const stepGlyphClass: (v: VariantProps<typeof stepGlyphVariants>) => string;
export declare const stepDotWrapClass: (v: VariantProps<typeof stepDotWrapVariants>) => string;
export declare const stepDotClass: (v: VariantProps<typeof stepDotVariants>) => string;
export declare const stepRailClass: (v: VariantProps<typeof stepRailVariants>) => string;
export declare const stepBodyClass: (v: VariantProps<typeof stepBodyVariants>) => string;
export declare const stepTitleClass: (v: VariantProps<typeof stepTitleVariants>) => string;
export declare const stepContentClass: (v: VariantProps<typeof stepContentVariants>) => string;
export type StepIconTone = NonNullable<VariantProps<typeof stepIconVariants>["tone"]>;
export type StepRailLayout = NonNullable<VariantProps<typeof stepRailVariants>["layout"]>;
export {};
