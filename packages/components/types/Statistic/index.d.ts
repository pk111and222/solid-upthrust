import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
export interface StatisticProps {
    title?: JSX.Element;
    value?: number | string | DayjsLike;
    precision?: number;
    /** thousands separator, default ',' */
    groupSeparator?: string;
    /** decimal separator, default '.' */
    decimalSeparator?: string;
    formatter?: (value: StatisticProps['value'], props: StatisticProps) => JSX.Element;
    prefix?: JSX.Element;
    suffix?: JSX.Element;
    /** skeleton mode */
    loading?: boolean;
    valueStyle?: JSX.CSSProperties;
    class?: string;
    style?: JSX.CSSProperties;
}
/** minimal structural type so consumers can pass dayjs instances without a dep */
export interface DayjsLike {
    valueOf(): number;
    format?(template: string): string;
}
declare function formatNumber(value: number, opts: {
    precision?: number;
    groupSeparator?: string;
    decimalSeparator?: string;
}): string;
declare const Statistic: Component<StatisticProps>;
export interface CountdownProps extends Omit<StatisticProps, 'value' | 'formatter'> {
    /** target time; number = timestamp ms, Date, or dayjs-like */
    value?: number | Date | DayjsLike;
    /** dayjs-style format template; default HH:mm:ss */
    format?: string;
    onFinish?: () => void;
}
declare const Countdown: Component<CountdownProps>;
export default Statistic;
export { Countdown as StatisticCountdown, formatNumber };
