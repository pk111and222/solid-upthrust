import { describe, expect, it } from 'vitest'
import { formatCounter, formatStatisticNumber, formatTimeStr, timerDiff, toTimestamp } from '../../../competence/src/statistic'

const num = (int: string, decimal = '') => ({ kind: 'number', int, decimal })
const raw = (text: string) => ({ kind: 'raw', text })

describe('formatStatisticNumber', () => {
  // 数字与数字字符串同样按千分位分组；整数为空时补 0；负号保留在整数段。
  it('[statistic.number.group] groups numbers and numeric strings', () => {
    expect(formatStatisticNumber(112893)).toEqual(num('112,893'))
    expect(formatStatisticNumber('1234567.891')).toEqual(num('1,234,567', '.891'))
    expect(formatStatisticNumber(-1234.5)).toEqual(num('-1,234', '.5'))
    expect(formatStatisticNumber('.5')).toEqual(num('0', '.5'))
    expect(formatStatisticNumber('-.5')).toEqual(num('-0', '.5'))
    expect(formatStatisticNumber(0)).toEqual(num('0'))
    expect(formatStatisticNumber(999)).toEqual(num('999'))
    expect(formatStatisticNumber(1000)).toEqual(num('1,000'))
  })

  // precision 截断补零而不是四舍五入；0 精度去掉小数；负数与 NaN 精度按 antd 处理。
  it('[statistic.number.precision] truncates and pads instead of rounding', () => {
    expect(formatStatisticNumber(1.999, { precision: 2 })).toEqual(num('1', '.99'))
    expect(formatStatisticNumber(112893, { precision: 2 })).toEqual(num('112,893', '.00'))
    expect(formatStatisticNumber(11.28, { precision: 1 })).toEqual(num('11', '.2'))
    expect(formatStatisticNumber(9.9, { precision: 0 })).toEqual(num('9'))
    expect(formatStatisticNumber(9.9, { precision: -1 })).toEqual(num('9'))
    expect(formatStatisticNumber(9.9, { precision: Number.NaN })).toEqual(num('9', '.9'))
    expect(formatStatisticNumber(-18.7, { precision: 1 })).toEqual(num('-18', '.7'))
  })

  // 自定义分隔符：分组与小数点可以互换（欧洲写法），空分组不分隔。
  it('[statistic.number.separator] custom separators', () => {
    expect(formatStatisticNumber(1234567.89, { groupSeparator: '.', decimalSeparator: ',' })).toEqual(num('1.234.567', ',89'))
    expect(formatStatisticNumber(123456789, { groupSeparator: ' ' })).toEqual(num('123 456 789'))
    expect(formatStatisticNumber(123456789, { groupSeparator: '' })).toEqual(num('123456789'))
  })

  // 无法匹配正则的值（科学计数法、NaN、字母、单独负号、空格、正号）原样返回。
  it('[statistic.number.raw] illegal values pass through', () => {
    for (const value of [1e21, Number.NaN, Infinity, 'abc', '-', '1,000', ' 1', '+1', '1.2.3']) {
      expect(formatStatisticNumber(value)).toEqual(raw(String(value)))
    }
    // 空字符串匹配正则，整数补 0（与 antd 一致）。
    expect(formatStatisticNumber('')).toEqual(num('0'))
  })
})

const S = 1000, M = 60 * S, H = 60 * M, D = 24 * H

describe('formatTimeStr', () => {
  // 默认 HH:mm:ss：补零；模板中最大的单位吸收溢出（2 天显示 48 小时）。
  it('[statistic.time.overflow] largest unit absorbs overflow', () => {
    expect(formatTimeStr(0, 'HH:mm:ss')).toBe('00:00:00')
    expect(formatTimeStr(H + 2 * M + 3 * S + 456, 'HH:mm:ss')).toBe('01:02:03')
    expect(formatTimeStr(2 * D + 30 * S, 'HH:mm:ss')).toBe('48:00:30')
    expect(formatTimeStr(2 * D + 30 * S, 'D 天 H 时 m 分 s 秒')).toBe('2 天 0 时 0 分 30 秒')
    expect(formatTimeStr(90 * M, 'mm:ss')).toBe('90:00')
    expect(formatTimeStr(123 * S, 's')).toBe('123')
  })

  // 毫秒：S 的个数决定补零宽度；SSS 保留三位。
  it('[statistic.time.millis] milliseconds padding', () => {
    expect(formatTimeStr(H + 5, 'HH:mm:ss:SSS')).toBe('01:00:00:005')
    expect(formatTimeStr(1234, 's.SS')).toBe('1.234')
  })

  // Y 按 365 天、M 按 30 天；[] 内的字母为转义文本，不参与替换。
  it('[statistic.time.escape] year/month units and escaped text', () => {
    expect(formatTimeStr(365 * D + 30 * D + D, 'Y-MM-DD')).toBe('1-01-01')
    expect(formatTimeStr(3 * H + 4 * M, 'H [H] m [mins] [s]')).toBe('3 H 4 mins s')
  })
})

describe('timer helpers', () => {
  // toTimestamp：数字原样；日期字符串 / Date / 带 valueOf 的对象转毫秒；空值为 NaN。
  it('[statistic.timer.timestamp] normalizes timer values', () => {
    expect(toTimestamp(1700000000000)).toBe(1700000000000)
    expect(toTimestamp('2024-01-01T00:00:00Z')).toBe(Date.UTC(2024, 0, 1))
    expect(toTimestamp(new Date(Date.UTC(2024, 0, 1)))).toBe(Date.UTC(2024, 0, 1))
    expect(toTimestamp({ valueOf: () => 42 })).toBe(42)
    for (const value of [undefined, null, '', 'not a date']) expect(toTimestamp(value)).toBeNaN()
  })

  // 差值方向：倒计时 = 目标 - 现在，正计时 = 现在 - 目标；不钳制。
  it('[statistic.timer.diff] countdown and countup direction', () => {
    expect(timerDiff(10 * S, 3 * S, true)).toBe(7 * S)
    expect(timerDiff(10 * S, 3 * S, false)).toBe(-7 * S)
    expect(timerDiff(3 * S, 10 * S, true)).toBe(-7 * S)
  })

  // formatCounter：展示钳制到 ≥ 0；NaN 目标显示为零。
  it('[statistic.timer.counter] clamps display at zero', () => {
    expect(formatCounter(10 * S, 'HH:mm:ss', true, 0)).toBe('00:00:10')
    expect(formatCounter(0, 'HH:mm:ss', true, 10 * S)).toBe('00:00:00')
    expect(formatCounter(0, 'HH:mm:ss', false, H)).toBe('01:00:00')
    expect(formatCounter(H, 'HH:mm:ss', false, 0)).toBe('00:00:00')
    expect(formatCounter(Number.NaN, 'HH:mm:ss', true, 0)).toBe('00:00:00')
  })
})
