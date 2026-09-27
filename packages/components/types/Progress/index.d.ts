import { JSX } from '@solidjs/web';
import { ProgressGapPlacement, ProgressGapPosition, ProgressLinecap, ProgressSize, ProgressStatus, ProgressSteps, ProgressStrokeColor, ProgressSuccess, ProgressType } from 'upthrust-competence';
import { SemanticInput } from '../../common/semantic';
export type { ProgressType, ProgressStatus, ProgressSize, ProgressSteps, ProgressStrokeColor, ProgressGradient, ProgressLinecap, ProgressGapPlacement, ProgressGapPosition, ProgressSuccess, } from 'upthrust-competence';
export interface ProgressPercentPosition {
    /** 数值对齐，默认 'end'。 */
    align?: 'start' | 'center' | 'end';
    /** 数值在进度条内部或外部，默认 'outer'。 */
    type?: 'inner' | 'outer';
}
export interface ProgressSemanticClassNames {
    root?: string;
    body?: string;
    rail?: string;
    track?: string;
    indicator?: string;
}
export interface ProgressSemanticStyles {
    root?: JSX.CSSProperties;
    body?: JSX.CSSProperties;
    rail?: JSX.CSSProperties;
    track?: JSX.CSSProperties;
    indicator?: JSX.CSSProperties;
}
/** 函数形式的 classNames / styles 收到的信息：props 已合并默认值。 */
export interface ProgressSemanticInfo {
    props: ProgressProps;
}
export interface ProgressProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'class' | 'style' | 'children'> {
    /** 'line' | 'circle' | 'dashboard'，默认 'line'。 */
    type?: ProgressType;
    /** 百分比，默认 0。 */
    percent?: number;
    /** 未指定且 percent（或成功段）≥ 100 时自动为 success。 */
    status?: ProgressStatus;
    /** 是否显示进度数值或状态图标，默认 true。 */
    showInfo?: boolean;
    /** 内容模板，参数为钳制后的 percent 与成功段 percent。 */
    format?: (percent?: number, successPercent?: number) => JSX.Element;
    /** 'small' | 'medium'（'middle' / 'default' 为别名）、数字、[宽, 高] 或 { width, height }。 */
    size?: ProgressSize;
    /** 线宽：线形为 px，圆形为画布宽度的百分比（默认 6）。 */
    strokeWidth?: number;
    /** 进度条颜色：线形可为渐变对象，步骤可为数组，圆形可为 { '0%': c } 形式渐变。 */
    strokeColor?: ProgressStrokeColor;
    /** 未完成部分的颜色。 */
    railColor?: string;
    /** @deprecated 请使用 railColor */
    trailColor?: string;
    /** 端点形状，默认 'round'。 */
    strokeLinecap?: ProgressLinecap;
    /** 成功段：percent 与颜色。 */
    success?: ProgressSuccess;
    /** 步骤数；圆形可为 { count, gap }。 */
    steps?: ProgressSteps;
    /** 步骤模式的取整函数，默认 Math.round。 */
    rounding?: (step: number) => number;
    /** 数值位置（仅线形）。 */
    percentPosition?: ProgressPercentPosition;
    /** 仪表盘缺口角度，0~295，默认 75。 */
    gapDegree?: number;
    /** 仪表盘缺口位置，默认 'bottom'。 */
    gapPlacement?: ProgressGapPlacement;
    /** @deprecated 请使用 gapPlacement */
    gapPosition?: ProgressGapPosition;
    classNames?: SemanticInput<ProgressSemanticClassNames, ProgressSemanticInfo>;
    styles?: SemanticInput<ProgressSemanticStyles, ProgressSemanticInfo>;
    class?: string;
    style?: JSX.CSSProperties;
}
declare const Progress: (rawProps: ProgressProps) => JSX.Element;
export default Progress;
