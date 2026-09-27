/**
 * Statistic 的纯格式化逻辑（antd 6 components/statistic/{Number.tsx,utils.ts} 的移植）。
 * 计时器的 interval 属于渲染层（与 Carousel 的 autoplay 相同），这里只提供可单测的纯函数。
 */
export type StatisticValue = number | string;
export interface StatisticNumberConfig {
    precision?: number;
    /** 默认 ','。 */
    groupSeparator?: string;
    /** 默认 '.'。 */
    decimalSeparator?: string;
}
/** 合法数字拆成整数（含负号与千分位）与小数（含小数点）；非法值原样返回字符串。 */
export type StatisticNumberParts = {
    kind: 'number';
    int: string;
    decimal: string;
} | {
    kind: 'raw';
    text: string;
};
/**
 * antd StatisticNumber：按字符串匹配 `-?\d*(\.\d+)?`，所以数字字符串同样分组；
 * precision 为截断补零（padEnd + slice），不是四舍五入；'1e21'、'abc'、'-' 等原样显示。
 */
export declare const formatStatisticNumber: (value: StatisticValue, config?: StatisticNumberConfig) => StatisticNumberParts;
/**
 * antd formatTimeStr：只计算模板中出现的单位，最大的单位吸收溢出
 * （'HH:mm:ss' 下 2 天显示 48 小时）；`[...]` 内为转义文本。
 */
export declare const formatTimeStr: (duration: number, format: string) => string;
/** 时间戳、日期字符串、Date 或 dayjs（valueOf）统一转毫秒；无法解析为 NaN。 */
export declare const toTimestamp: (value: unknown) => number;
/** 计时器差值：countdown 为 target - now，countup 为 now - target（未钳制，onChange 使用）。 */
export declare const timerDiff: (target: number, now: number, down: boolean) => number;
/** antd formatCounter：展示值钳制到 ≥ 0；目标无法解析时按 0 展示（antd 会显示 NaN）。 */
export declare const formatCounter: (target: number, format: string, down: boolean, now: number) => string;
