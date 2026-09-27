/**
 * Statistic 的纯格式化逻辑（antd 6 components/statistic/{Number.tsx,utils.ts} 的移植）。
 * 计时器的 interval 属于渲染层（与 Carousel 的 autoplay 相同），这里只提供可单测的纯函数。
 */

export type StatisticValue = number | string

export interface StatisticNumberConfig {
  precision?: number
  /** 默认 ','。 */
  groupSeparator?: string
  /** 默认 '.'。 */
  decimalSeparator?: string
}

/** 合法数字拆成整数（含负号与千分位）与小数（含小数点）；非法值原样返回字符串。 */
export type StatisticNumberParts =
  | { kind: 'number'; int: string; decimal: string }
  | { kind: 'raw'; text: string }

/**
 * antd StatisticNumber：按字符串匹配 `-?\d*(\.\d+)?`，所以数字字符串同样分组；
 * precision 为截断补零（padEnd + slice），不是四舍五入；'1e21'、'abc'、'-' 等原样显示。
 */
export const formatStatisticNumber = (value: StatisticValue, config: StatisticNumberConfig = {}): StatisticNumberParts => {
  const { precision, groupSeparator = ',', decimalSeparator = '.' } = config
  const text = String(value)
  const cells = text.match(/^(-?)(\d*)(\.(\d+))?$/)
  if (!cells || text === '-') return { kind: 'raw', text }
  const negative = cells[1]
  const int = (cells[2] || '0').replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator)
  let decimal = cells[4] || ''
  if (typeof precision === 'number' && !Number.isNaN(precision)) {
    decimal = decimal.padEnd(precision, '0').slice(0, precision > 0 ? precision : 0)
  }
  return { kind: 'number', int: negative + int, decimal: decimal ? decimalSeparator + decimal : '' }
}

const TIME_UNITS: [string, number][] = [
  ['Y', 1000 * 60 * 60 * 24 * 365],
  ['M', 1000 * 60 * 60 * 24 * 30],
  ['D', 1000 * 60 * 60 * 24],
  ['H', 1000 * 60 * 60],
  ['m', 1000 * 60],
  ['s', 1000],
  ['S', 1],
]

/**
 * antd formatTimeStr：只计算模板中出现的单位，最大的单位吸收溢出
 * （'HH:mm:ss' 下 2 天显示 48 小时）；`[...]` 内为转义文本。
 */
export const formatTimeStr = (duration: number, format: string): string => {
  let left = duration
  const escape = /\[[^\]]*]/g
  const keep = (format.match(escape) || []).map(str => str.slice(1, -1))
  const template = format.replace(escape, '[]')
  const replaced = TIME_UNITS.reduce((current, [name, unit]) => {
    if (!current.includes(name)) return current
    const value = Math.floor(left / unit)
    left -= value * unit
    return current.replace(new RegExp(`${name}+`, 'g'), match => value.toString().padStart(match.length, '0'))
  }, template)
  let index = 0
  return replaced.replace(escape, () => keep[index++])
}

/** 时间戳、日期字符串、Date 或 dayjs（valueOf）统一转毫秒；无法解析为 NaN。 */
export const toTimestamp = (value: unknown): number => {
  if (value === undefined || value === null || value === '') return NaN
  if (typeof value === 'number') return value
  return new Date(value as string).getTime()
}

/** 计时器差值：countdown 为 target - now，countup 为 now - target（未钳制，onChange 使用）。 */
export const timerDiff = (target: number, now: number, down: boolean) => down ? target - now : now - target

/** antd formatCounter：展示值钳制到 ≥ 0；目标无法解析时按 0 展示（antd 会显示 NaN）。 */
export const formatCounter = (target: number, format: string, down: boolean, now: number): string => {
  const diff = timerDiff(target, now, down)
  return formatTimeStr(Number.isNaN(diff) ? 0 : Math.max(diff, 0), format)
}
