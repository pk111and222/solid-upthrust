import { JSX } from '@solidjs/web';
import { StatisticValue } from 'upthrust-competence';
export type { StatisticValue } from 'upthrust-competence';
export interface StatisticSemanticClassNames {
    root?: string;
    header?: string;
    title?: string;
    content?: string;
    value?: string;
    prefix?: string;
    suffix?: string;
}
export interface StatisticSemanticStyles {
    root?: JSX.CSSProperties;
    header?: JSX.CSSProperties;
    title?: JSX.CSSProperties;
    content?: JSX.CSSProperties;
    value?: JSX.CSSProperties;
    prefix?: JSX.CSSProperties;
    suffix?: JSX.CSSProperties;
}
export interface StatisticProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'class' | 'style' | 'children' | 'title' | 'prefix'> {
    title?: JSX.Element;
    /** 数值，默认 0；数字字符串同样按千分位格式化，非法值原样显示。 */
    value?: StatisticValue;
    /** 小数位数：截断补零，不四舍五入（与 antd 一致）。 */
    precision?: number;
    /** 千分位分隔符，默认 ','。 */
    groupSeparator?: string;
    /** 小数点，默认 '.'。 */
    decimalSeparator?: string;
    /** 自定义数值展示，接管内置格式化。 */
    formatter?: (value: StatisticValue) => JSX.Element;
    /** 包装数值节点（在 prefix / suffix 之间）。 */
    valueRender?: (node: JSX.Element) => JSX.Element;
    prefix?: JSX.Element;
    suffix?: JSX.Element;
    /** 数值区显示骨架屏。 */
    loading?: boolean;
    /** @deprecated 请使用 styles.content */
    valueStyle?: JSX.CSSProperties;
    classNames?: StatisticSemanticClassNames;
    styles?: StatisticSemanticStyles;
    class?: string;
    style?: JSX.CSSProperties;
}
export type StatisticTimerType = 'countdown' | 'countup';
/** 时间戳（ms）、可被 Date 解析的字符串、Date，或 dayjs 等带 valueOf 的对象。 */
export type StatisticTimerValue = number | string | Date | {
    valueOf(): number;
};
export interface StatisticTimerProps extends Omit<StatisticProps, 'value' | 'formatter' | 'valueRender' | 'precision' | 'groupSeparator' | 'decimalSeparator' | 'onChange'> {
    /** countdown：倒计时到 value；countup：从 value 开始正计时。 */
    type: StatisticTimerType;
    value?: StatisticTimerValue;
    /** 时间格式，默认 'HH:mm:ss'；支持 Y M D H m s S，最大单位吸收溢出，[] 内为转义文本。 */
    format?: string;
    /** 每次刷新触发，参数为未钳制的差值（倒计时 = 目标 - 现在，正计时 = 现在 - 目标）。 */
    onChange?: (value: number) => void;
    /** 仅倒计时：越过目标时间时触发一次，随后停止刷新。 */
    onFinish?: () => void;
}
export declare const StatisticTimer: (props: StatisticTimerProps) => JSX.Element;
export type CountdownProps = Omit<StatisticTimerProps, 'type'>;
/** @deprecated 请使用 `<Statistic.Timer type="countdown" />` */
export declare const StatisticCountdown: (props: CountdownProps) => JSX.Element;
declare const Statistic: ((rawProps: StatisticProps) => JSX.Element) & {
    Timer: (props: StatisticTimerProps) => JSX.Element;
    Countdown: (props: CountdownProps) => JSX.Element;
};
export default Statistic;
