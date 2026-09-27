/**
 * Progress 的纯计算层：对照 antd 6.6.5 `progress/{progress,utils,Line,Steps,Circle}`
 * 与 `@rc-component/progress` 的 Circle / util 逐项移植。只输出数值与样式对象，UI 层负责渲染。
 */
export type ProgressType = 'line' | 'circle' | 'dashboard';
export type ProgressStatus = 'normal' | 'exception' | 'active' | 'success';
export type ProgressLinecap = 'round' | 'butt' | 'square';
export type ProgressGapPlacement = 'top' | 'bottom' | 'start' | 'end';
/** @deprecated 请使用 ProgressGapPlacement */
export type ProgressGapPosition = 'top' | 'bottom' | 'left' | 'right';
/** `{ from, to, direction }` 或 `{ '0%': c1, '100%': c2 }` 形式的渐变。 */
export type ProgressGradient = {
    direction?: string;
} & Record<string, string>;
export type ProgressStrokeColor = string | string[] | ProgressGradient;
export type ProgressSize = 'small' | 'medium' | 'middle' | 'default' | number | [number | undefined, number | undefined] | {
    width?: number;
    height?: number;
};
export interface ProgressSuccess {
    percent?: number;
    strokeColor?: string;
}
export type ProgressSteps = number | {
    count: number;
    gap?: number;
};
export declare const PROGRESS_STATUSES: readonly ProgressStatus[];
/** antd presetPrimaryColors.green / blue。 */
export declare const PROGRESS_SUCCESS_COLOR = "#52c41a";
export declare const PROGRESS_DEFAULT_GRADIENT_COLOR = "#1677ff";
/** 0–100 钳制；非数与负数为 0。 */
export declare const validProgress: (progress?: number | null) => number;
/** 只有 success 对象里显式写了 percent 才算有成功段。 */
export declare const getSuccessPercent: (success?: ProgressSuccess | null) => number | undefined;
/** [成功段, 剩余进度段]，两段相加不超过 100。 */
export declare const getPercentage: (percent?: number, success?: ProgressSuccess | null) => [number, number];
export declare const getStrokeColor: <C>(success: ProgressSuccess | null | undefined, strokeColor: C | undefined) => [string, C | null];
/** aria-valuenow：有成功段时取成功段，否则取 percent（parseInt 截断）。 */
export declare const progressPercentNumber: (percent?: number, success?: ProgressSuccess | null) => number;
/** 未指定合法状态且 ≥ 100 时自动为 success。 */
export declare const progressStatusOf: (status: string | undefined, percentNumber: number) => ProgressStatus;
/** size 的 'middle' / 'default' 是 'medium' 的别名。 */
export declare const normalizeProgressSize: (size: ProgressSize | undefined) => Exclude<ProgressSize, "middle" | "default"> | undefined;
/** antd getSize：line 返回 [宽(-1=撑满), 高]；step 返回 [总宽, 高]；circle 返回 [直径, 直径]。 */
export declare const getProgressSize: (size: ProgressSize | undefined, type: "line" | "step" | "circle" | "dashboard", extra?: {
    steps?: number;
    strokeWidth?: number;
}) => [number, number];
/** `{ '0%': a, '50%': b }` → 'a 0%, b 50%'（按数值排序，非数字键忽略）。 */
export declare const sortGradient: (gradients: Record<string, string>) => string;
/** 线形进度条渐变背景。 */
export declare const handleGradient: (strokeColor: ProgressGradient) => string;
/** 进度色是否为亮色（内部数值改用 0.45 黑字）：FastColor.isLight 的亮度公式。 */
export declare const isBrightStrokeColor: (strokeColor: ProgressStrokeColor | undefined) => boolean;
/** 步骤进度条：点亮的格数。 */
export declare const progressStepsCurrent: (steps: number, percent?: number, rounding?: (n: number) => number) => number;
export declare const CIRCLE_VIEW_BOX = 100;
export type CircleStyle = {
    stroke?: string;
    'stroke-dasharray': string;
    'stroke-dashoffset': number;
    transform: string;
    'transform-origin': string;
    transition: string;
    'fill-opacity': number;
};
/** rc-progress getCircleStyle（原样移植，键名改为 CSS kebab-case）。 */
export declare const getCircleStyle: (perimeter: number, perimeterWithoutGap: number, offset: number, percent: number, rotateDeg: number, gapDegree: number, gapPosition: ProgressGapPosition | undefined, strokeColor: unknown, strokeLinecap: ProgressLinecap, strokeWidth: number, stepSpace?: number) => CircleStyle;
/** 圆形默认线宽：至少 3px 视觉宽度，且不小于 6（viewBox 单位）。 */
export declare const circleStrokeWidth: (width: number, strokeWidth?: number) => number;
/** gapDegree：显式值（含 0）优先，仪表盘默认 75，圆形 0。 */
export declare const circleGapDegree: (type: ProgressType, gapDegree?: number) => number;
/** gapPlacement 优先于废弃的 gapPosition；仪表盘默认 bottom；start / end 映射为 left / right（未处理 RTL）。 */
export declare const circleGapPosition: (type: ProgressType, gapPlacement?: ProgressGapPlacement, gapPosition?: ProgressGapPosition) => ProgressGapPosition | undefined;
export interface CircleGradientFill {
    /** 外层 div：线性渐变兜底。 */
    linear: string;
    /** 内层 div：锥形渐变，沿圆弧着色。 */
    conic: string;
}
export interface CirclePathSpec {
    /** 0 = 成功段，1 = 进度段；步骤模式为格序号。 */
    index: number;
    ptg: number;
    /** 字符串色走内联 stroke；null / undefined 时由状态类着色。 */
    color: string | null | undefined;
    /** 渐变色：UI 用 mask + foreignObject 渲染。 */
    gradient?: CircleGradientFill;
    /** 步骤模式：该格是否点亮（未点亮用导轨色）。 */
    active?: boolean;
    opacity: number;
    /** 步骤模式的格子不写 stroke-linecap 属性。 */
    linecap?: ProgressLinecap;
    style: CircleStyle;
}
export interface CircleLayout {
    radius: number;
    strokeWidth: number;
    linecap: ProgressLinecap;
    /** 步骤模式没有导轨。 */
    rail?: CircleStyle;
    /** 已按 rc-progress 的绘制顺序排列（进度段先画，成功段压在上面）。 */
    paths: CirclePathSpec[];
}
/** rc-progress PtgCircle 的渐变填充：linear 外层 + conic 内层。 */
export declare const circleGradientFill: (color: Record<string, string>, gapDegree: number) => CircleGradientFill;
/** rc-progress Circle 的几何：导轨、分段描边（成功 + 进度）或步骤格。 */
export declare const circleLayout: (options: {
    percent: number | number[];
    strokeColor: unknown;
    strokeWidth: number;
    gapDegree: number;
    gapPosition?: ProgressGapPosition;
    strokeLinecap?: ProgressLinecap;
    railColor?: string;
    steps?: ProgressSteps;
}) => CircleLayout;
