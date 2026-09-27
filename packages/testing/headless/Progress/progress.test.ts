import { describe, expect, it } from 'vitest'
import {
  circleGapDegree, circleGapPosition, circleGradientFill, circleLayout, circleStrokeWidth, getCircleStyle, getPercentage,
  getProgressSize, getStrokeColor, getSuccessPercent, handleGradient, isBrightStrokeColor, normalizeProgressSize,
  progressPercentNumber, progressStatusOf, progressStepsCurrent, sortGradient, validProgress,
} from '../../../competence/src/progress'

const round = (n: number, d = 3) => Number(n.toFixed(d))
const dash = (value: string) => value.split(' ').map(part => round(Number.parseFloat(part)))
const rotate = (transform: string) => round(Number(/rotate\((-?[\d.]+)deg\)/.exec(transform)?.[1]))

describe('progress math', () => {
  // validProgress：非数 / 负数为 0，超过 100 为 100，其余原样（含小数）。
  it('[progress.math.valid] clamps like antd validProgress', () => {
    expect([undefined, null, NaN, -5, 0, 30.5, 100, 120].map(v => validProgress(v as number))).toEqual([0, 0, 0, 0, 0, 30.5, 100, 100])
  })

  // 成功段只认显式 percent 字段；两段相加不超过 100；成功色默认 #52c41a。
  it('[progress.math.success] success percent, split and colors', () => {
    expect(getSuccessPercent(undefined)).toBeUndefined()
    expect(getSuccessPercent({ strokeColor: 'red' })).toBeUndefined()
    expect(getSuccessPercent({ percent: 0 })).toBe(0)
    expect(getPercentage(60, { percent: 30 })).toEqual([30, 30])
    expect(getPercentage(20, { percent: 50 })).toEqual([50, 0])
    expect(getPercentage(120, undefined)).toEqual([0, 100])
    expect(getStrokeColor(undefined, undefined)).toEqual(['#52c41a', null])
    expect(getStrokeColor({ strokeColor: '#389e0d' }, 'red')).toEqual(['#389e0d', 'red'])
  })

  // aria-valuenow 取成功段优先并截断取整；非法状态在 ≥100 时自动 success，合法状态原样保留。
  it('[progress.math.status] percent number and derived status', () => {
    expect(progressPercentNumber(75.9)).toBe(75)
    expect(progressPercentNumber(90, { percent: 30.2 })).toBe(30)
    expect(progressStatusOf(undefined, 100)).toBe('success')
    expect(progressStatusOf('bogus', 100)).toBe('success')
    expect(progressStatusOf('exception', 100)).toBe('exception')
    expect(progressStatusOf('active', 100)).toBe('active')
    expect(progressStatusOf(undefined, 99)).toBe('normal')
  })

  // getSize 三种类型的全部分支；'middle' / 'default' 归一为 'medium'。
  it('[progress.math.size] getSize matches antd for line, step and circle', () => {
    expect(normalizeProgressSize('middle')).toBe('medium')
    expect(normalizeProgressSize('default')).toBe('medium')
    expect(getProgressSize('medium', 'line')).toEqual([-1, 8])
    expect(getProgressSize('small', 'line')).toEqual([-1, 6])
    expect(getProgressSize('small', 'line', { strokeWidth: 10 })).toEqual([-1, 10])
    expect(getProgressSize(300, 'line')).toEqual([300, 300])
    expect(getProgressSize([300, 20], 'line')).toEqual([300, 20])
    expect(getProgressSize({ width: 200 }, 'line')).toEqual([200, 8])
    expect(getProgressSize('medium', 'step', { steps: 3 })).toEqual([42, 8])
    expect(getProgressSize('small', 'step', { steps: 5 })).toEqual([10, 8])
    expect(getProgressSize(20, 'step', { steps: 3 })).toEqual([60, 20])
    expect(getProgressSize([20, 30], 'step', { steps: 3 })).toEqual([60, 30])
    expect(getProgressSize([undefined, undefined], 'step', { steps: 2 })).toEqual([28, 8])
    expect(getProgressSize(undefined, 'circle')).toEqual([120, 120])
    expect(getProgressSize('small', 'circle')).toEqual([60, 60])
    expect(getProgressSize(80, 'dashboard')).toEqual([80, 80])
    expect(getProgressSize([undefined, 90], 'circle')).toEqual([90, 90])
  })

  // 渐变：多色标按数值排序并忽略非数字键；from / to 默认 #1677ff；direction 可覆盖。
  it('[progress.math.gradient] sortGradient and handleGradient', () => {
    expect(sortGradient({ '100%': '#fff', '0%': '#000', '50': 'red', foo: 'x' })).toBe('#000 0%, red 50%, #fff 100%')
    expect(handleGradient({ '0%': '#108ee9', '100%': '#87d068' })).toBe('linear-gradient(to right, #108ee9 0%, #87d068 100%)')
    expect(handleGradient({ from: '#108ee9', to: '#87d068' })).toBe('linear-gradient(to right, #108ee9, #87d068)')
    expect(handleGradient({ direction: 'to left' })).toBe('linear-gradient(to left, #1677ff, #1677ff)')
  })

  // 亮色判定：数组取第一项、渐变取第一个值；无法解析为 false。
  it('[progress.math.bright] bright stroke colors', () => {
    expect(isBrightStrokeColor('#ffe58f')).toBe(true)
    expect(isBrightStrokeColor('#1677ff')).toBe(false)
    expect(isBrightStrokeColor(['#fff', '#000'])).toBe(true)
    expect(isBrightStrokeColor({ '0%': '#87d068', '100%': '#000' })).toBe(true)
    expect(isBrightStrokeColor(undefined)).toBe(false)
    expect(isBrightStrokeColor('not-a-color')).toBe(false)
  })

  // 步骤点亮格数：默认四舍五入，可替换取整函数。
  it('[progress.math.steps] steps current with rounding', () => {
    expect(progressStepsCurrent(5, 30)).toBe(2)
    expect(progressStepsCurrent(3, 50)).toBe(2)
    expect(progressStepsCurrent(3, 50, Math.floor)).toBe(1)
    expect(progressStepsCurrent(5, 100)).toBe(5)
  })
})

describe('progress circle geometry', () => {
  // 默认线宽：至少 3px 视觉宽度；缺口角度与位置的默认与映射。
  it('[progress.circle.defaults] stroke width, gap degree and gap position', () => {
    expect(circleStrokeWidth(120)).toBe(6)
    expect(circleStrokeWidth(20)).toBe(15)
    expect(circleStrokeWidth(14)).toBeCloseTo(21.43, 2)
    expect(circleStrokeWidth(14, 20)).toBe(20)
    expect(circleGapDegree('dashboard')).toBe(75)
    expect(circleGapDegree('dashboard', 0)).toBe(0)
    expect(circleGapDegree('circle')).toBe(0)
    expect(circleGapPosition('dashboard')).toBe('bottom')
    expect(circleGapPosition('circle')).toBeUndefined()
    expect(circleGapPosition('dashboard', 'start')).toBe('left')
    expect(circleGapPosition('dashboard', 'end')).toBe('right')
    expect(circleGapPosition('dashboard', undefined, 'top')).toBe('top')
    expect(circleGapPosition('dashboard', 'bottom', 'top')).toBe('bottom')
  })

  // 与 antd 实测一致：75% 圆形 dasharray 295.31px、dashoffset 76.8274；成功段 0 时透明度 0、偏移 295.3。
  it('[progress.circle.measured] circle 75% matches antd DOM', () => {
    const layout = circleLayout({ percent: getPercentage(75, undefined), strokeColor: getStrokeColor(undefined, undefined), strokeWidth: 6, gapDegree: 0 })
    expect(round(layout.radius)).toBe(47)
    expect(dash(layout.rail!['stroke-dasharray'])).toEqual([295.31, 295.31])
    expect(layout.rail!['stroke-dashoffset']).toBe(0)
    const [percent, success] = layout.paths
    expect(percent.index).toBe(1)
    expect(round(percent.style['stroke-dashoffset'], 4)).toBe(76.8274)
    expect(rotate(percent.style.transform)).toBe(-90)
    expect(percent.opacity).toBe(1)
    expect(success.color).toBe('#52c41a')
    expect(success.style.stroke).toBe('#52c41a')
    expect(success.opacity).toBe(0)
    expect(round(success.style['stroke-dashoffset'], 2)).toBe(295.3)
  })

  // 仪表盘：gap 75 → 233.787px、旋转 127.5deg；分段仪表盘进度段从成功段末尾起转（213deg）。
  it('[progress.circle.dashboard] dashboard gaps and segments', () => {
    const base = { strokeWidth: 6, gapDegree: 75, gapPosition: 'bottom' as const }
    const dashboard = circleLayout({ ...base, percent: getPercentage(60, { percent: 30 }), strokeColor: getStrokeColor(undefined, undefined) })
    expect(dash(dashboard.rail!['stroke-dasharray'])).toEqual([233.787, 295.31])
    expect(rotate(dashboard.rail!.transform)).toBe(127.5)
    expect(rotate(dashboard.paths[0].style.transform)).toBe(213)
    expect(round(dashboard.paths[0].style['stroke-dashoffset'], 3)).toBe(166.651)
    expect(rotate(dashboard.paths[1].style.transform)).toBe(127.5)
    const gap50 = circleLayout({ ...base, gapDegree: 50, percent: [0, 30], strokeColor: [null, null] })
    expect(dash(gap50.rail!['stroke-dasharray'])[0]).toBe(254.294)
    expect(rotate(gap50.rail!.transform)).toBe(115)
    // 顶部缺口 +180、左 +90、右 -90。
    expect(rotate(circleLayout({ ...base, gapPosition: 'top', percent: [0, 30], strokeColor: [null] }).rail!.transform)).toBe(307.5)
    expect(rotate(circleLayout({ ...base, gapPosition: 'left', percent: [0, 30], strokeColor: [null] }).rail!.transform)).toBe(217.5)
    expect(rotate(circleLayout({ ...base, gapPosition: 'right', percent: [0, 30], strokeColor: [null] }).rail!.transform)).toBe(37.5)
    // 分段圆形：进度段从成功段末尾起转（-90 + 108 = 18deg）。
    const segment = circleLayout({ strokeWidth: 6, gapDegree: 0, percent: getPercentage(60, { percent: 30 }), strokeColor: getStrokeColor(undefined, undefined) })
    expect(rotate(segment.paths[0].style.transform)).toBe(18)
  })

  // 圆头补偿：非 100% 时多偏移半个线宽，极小值保留 0.01；butt 不补偿。
  it('[progress.circle.linecap] round linecap compensation', () => {
    const round100 = getCircleStyle(100, 100, 0, 100, -90, 0, undefined, 'red', 'round', 6)
    expect(round100['stroke-dashoffset']).toBe(0)
    expect(getCircleStyle(100, 100, 0, 50, -90, 0, undefined, 'red', 'round', 6)['stroke-dashoffset']).toBe(53)
    expect(getCircleStyle(100, 100, 0, 1, -90, 0, undefined, 'red', 'round', 6)['stroke-dashoffset']).toBe(99.99)
    expect(getCircleStyle(100, 100, 0, 50, -90, 0, undefined, 'red', 'butt', 6)['stroke-dashoffset']).toBe(50)
    expect(round100.stroke).toBe('red')
    expect(getCircleStyle(100, 100, 0, 50, -90, 0, undefined, { '0%': 'red' }, 'butt', 6).stroke).toBeUndefined()
  })

  // 渐变圆：强制 butt，路径带 conic / linear 填充；有缺口时 conic 起点 180+gap/2、色标按比例缩放。
  it('[progress.circle.gradient] gradient forces butt and builds conic fill', () => {
    const color = { '0%': '#108ee9', '100%': '#87d068' }
    const layout = circleLayout({ percent: [0, 90], strokeColor: ['#52c41a', color], strokeWidth: 6, gapDegree: 0, strokeLinecap: 'round' })
    expect(layout.linecap).toBe('butt')
    expect(layout.paths[0].gradient).toEqual({
      linear: 'linear-gradient(to top, #108ee9 0%, #87d068 100%)',
      conic: 'conic-gradient(from 0deg, #108ee9 0%, #87d068 100%)',
    })
    expect(round(layout.paths[0].style['stroke-dashoffset'], 3)).toBe(29.531)
    expect(layout.paths[1].gradient).toBeUndefined()
    expect(circleGradientFill(color, 75)).toEqual({
      linear: 'linear-gradient(to bottom, #108ee9 0%, #87d068 100%)',
      conic: 'conic-gradient(from 217.5deg, #108ee9 0%, #87d068 79%)',
    })
  })

  // 步骤圆：无导轨，按格累加旋转；点亮格用进度色，其余用导轨色；实测 8 格仪表盘 198.968px / 176.097 / 127.5→163.125→198.75。
  it('[progress.circle.steps] step circle matches antd DOM', () => {
    const layout = circleLayout({ percent: 50, strokeColor: null, strokeWidth: 20, gapDegree: 75, gapPosition: 'bottom', railColor: 'rgba(0,0,0,0.06)', steps: 8 })
    expect(layout.rail).toBeUndefined()
    expect(layout.paths).toHaveLength(8)
    expect(dash(layout.paths[0].style['stroke-dasharray'])).toEqual([198.968, 251.327])
    expect(round(layout.paths[0].style['stroke-dashoffset'], 3)).toBe(176.097)
    expect(layout.paths.slice(0, 3).map(p => rotate(p.style.transform))).toEqual([127.5, 163.125, 198.75])
    expect(layout.paths.map(p => p.active)).toEqual([true, true, true, true, false, false, false, false])
    expect(layout.paths[5].color).toBe('rgba(0,0,0,0.06)')
    expect(layout.paths[0].color).toBeNull()
    expect(layout.paths[0].linecap).toBeUndefined()
    // { count, gap } 形式自定义间隔。
    const custom = circleLayout({ percent: 100, strokeColor: 'red', strokeWidth: 20, gapDegree: 0, steps: { count: 4, gap: 7 } })
    expect(custom.paths.every(p => p.active && p.color === 'red')).toBe(true)
    expect(round(custom.paths[0].style['stroke-dashoffset'], 3)).toBe(round(0.75 * 2 * Math.PI * 40 + 7, 3))
  })
})
