import { For, Show, createMemo, createUniqueId, merge, omit } from 'solid-js'
import type { JSX } from '@solidjs/web'
import {
  circleGapDegree, circleGapPosition, circleLayout, circleStrokeWidth, getPercentage, getProgressSize, getStrokeColor,
  getSuccessPercent, handleGradient, isBrightStrokeColor, normalizeProgressSize, progressPercentNumber, progressStatusOf,
  progressStepsCurrent, validProgress,
  type CirclePathSpec, type ProgressGapPlacement, type ProgressGapPosition, type ProgressGradient, type ProgressLinecap,
  type ProgressSize, type ProgressStatus, type ProgressSteps, type ProgressStrokeColor, type ProgressSuccess, type ProgressType,
} from 'upthrust-competence'
import Tooltip from '../Tooltip'
import { mergeClass } from '../../common/merge'
import { numberToText } from '../../common/renderable'
import { resolveSemantic, type SemanticInput } from '../../common/semantic'
import {
  progressBodyClass, progressCircleStroke, progressClass, progressIconClass, progressIndicatorClass, progressRailClass,
  progressStepItemClass, progressTrackClass,
} from './styles'

export type {
  ProgressType, ProgressStatus, ProgressSize, ProgressSteps, ProgressStrokeColor, ProgressGradient, ProgressLinecap,
  ProgressGapPlacement, ProgressGapPosition, ProgressSuccess,
} from 'upthrust-competence'

export interface ProgressPercentPosition {
  /** 数值对齐，默认 'end'。 */
  align?: 'start' | 'center' | 'end'
  /** 数值在进度条内部或外部，默认 'outer'。 */
  type?: 'inner' | 'outer'
}

export interface ProgressSemanticClassNames { root?: string; body?: string; rail?: string; track?: string; indicator?: string }
export interface ProgressSemanticStyles {
  root?: JSX.CSSProperties; body?: JSX.CSSProperties; rail?: JSX.CSSProperties; track?: JSX.CSSProperties; indicator?: JSX.CSSProperties
}
/** 函数形式的 classNames / styles 收到的信息：props 已合并默认值。 */
export interface ProgressSemanticInfo { props: ProgressProps }

export interface ProgressProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'class' | 'style' | 'children'> {
  /** 'line' | 'circle' | 'dashboard'，默认 'line'。 */
  type?: ProgressType
  /** 百分比，默认 0。 */
  percent?: number
  /** 未指定且 percent（或成功段）≥ 100 时自动为 success。 */
  status?: ProgressStatus
  /** 是否显示进度数值或状态图标，默认 true。 */
  showInfo?: boolean
  /** 内容模板，参数为钳制后的 percent 与成功段 percent。 */
  format?: (percent?: number, successPercent?: number) => JSX.Element
  /** 'small' | 'medium'（'middle' / 'default' 为别名）、数字、[宽, 高] 或 { width, height }。 */
  size?: ProgressSize
  /** 线宽：线形为 px，圆形为画布宽度的百分比（默认 6）。 */
  strokeWidth?: number
  /** 进度条颜色：线形可为渐变对象，步骤可为数组，圆形可为 { '0%': c } 形式渐变。 */
  strokeColor?: ProgressStrokeColor
  /** 未完成部分的颜色。 */
  railColor?: string
  /** @deprecated 请使用 railColor */
  trailColor?: string
  /** 端点形状，默认 'round'。 */
  strokeLinecap?: ProgressLinecap
  /** 成功段：percent 与颜色。 */
  success?: ProgressSuccess
  /** 步骤数；圆形可为 { count, gap }。 */
  steps?: ProgressSteps
  /** 步骤模式的取整函数，默认 Math.round。 */
  rounding?: (step: number) => number
  /** 数值位置（仅线形）。 */
  percentPosition?: ProgressPercentPosition
  /** 仪表盘缺口角度，0~295，默认 75。 */
  gapDegree?: number
  /** 仪表盘缺口位置，默认 'bottom'。 */
  gapPlacement?: ProgressGapPlacement
  /** @deprecated 请使用 gapPlacement */
  gapPosition?: ProgressGapPosition
  classNames?: SemanticInput<ProgressSemanticClassNames, ProgressSemanticInfo>
  styles?: SemanticInput<ProgressSemanticStyles, ProgressSemanticInfo>
  class?: string
  style?: JSX.CSSProperties
}

const OWN = [
  'type', 'percent', 'status', 'showInfo', 'format', 'size', 'strokeWidth', 'strokeColor', 'railColor', 'trailColor',
  'strokeLinecap', 'success', 'steps', 'rounding', 'percentPosition', 'gapDegree', 'gapPlacement', 'gapPosition',
  'classNames', 'styles', 'class', 'style',
] as const

const isGradientObject = (value: unknown): value is ProgressGradient =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const px = (value: number) => `${value}px`

const Progress = (rawProps: ProgressProps) => {
  const props = merge({ type: 'line', percent: 0, size: 'medium', showInfo: true } as const, rawProps)
  const rest = omit(rawProps, ...OWN)
  const uid = createUniqueId()

  const classNames = createMemo(() => resolveSemantic(props.classNames, { props }))
  const styles = createMemo(() => resolveSemantic(props.styles, { props }))

  const size = createMemo(() => normalizeProgressSize(props.size))
  const infoAlign = () => props.percentPosition?.align ?? 'end'
  const infoType = () => props.percentPosition?.type ?? 'outer'
  const isLine = () => props.type === 'line'
  const isPureLine = () => isLine() && !props.steps
  const isCircle = () => props.type === 'circle' || props.type === 'dashboard'
  const railColor = () => props.railColor ?? props.trailColor

  const strokeColorNotArray = createMemo(() => Array.isArray(props.strokeColor) ? props.strokeColor[0] : props.strokeColor)
  const bright = createMemo(() => isBrightStrokeColor(props.strokeColor))
  const percentNumber = createMemo(() => progressPercentNumber(props.percent, props.success))
  const status = createMemo(() => progressStatusOf(props.status, percentNumber()))
  const circleWidth = createMemo(() => getProgressSize(size(), 'circle')[0])
  const smallCircle = () => isCircle() && circleWidth() <= 20

  // ---- 数值 / 图标 -----------------------------------------------------------
  const info = () => {
    if (!props.showInfo) return undefined
    const current = status()
    const inner = infoType() === 'inner'
    let text: JSX.Element
    if (inner || props.format || (current !== 'exception' && current !== 'success')) {
      const format = props.format ?? ((n?: number) => `${n}%`)
      text = numberToText(format(validProgress(props.percent), validProgress(getSuccessPercent(props.success))))
    } else {
      const icon = current === 'exception'
        ? (isLine() ? 'i-mdi-close-circle' : 'i-mdi-close')
        : (isLine() ? 'i-mdi-check-circle' : 'i-mdi-check')
      const iconSize = isCircle() ? 'circle' : isPureLine() && size() === 'small' ? 'line-small' : 'line'
      text = <span class={mergeClass(icon, progressIconClass({ size: iconSize }))} role="img" aria-label={current === 'exception' ? 'close' : 'check'} data-progress-icon={current} />
    }
    const kind = isCircle() ? 'circle'
      : props.steps ? 'steps'
      : inner ? (infoAlign() === 'start' ? 'inner-start' : infoAlign() === 'end' ? 'inner-end' : 'inner')
      : infoAlign() === 'start' ? 'line-start' : 'line'
    const tone = inner && isPureLine()
      ? (bright() ? 'bright' : 'normal')
      : current === 'exception' || current === 'success' ? current : 'normal'
    return (
      <span
        class={mergeClass(progressIndicatorClass({ kind, tone }), classNames().indicator)}
        style={styles().indicator}
        title={typeof text === 'string' ? text : undefined}
        data-progress-part="indicator"
      >
        {text}
      </span>
    )
  }

  // ---- 线形 ------------------------------------------------------------------
  const Line = () => {
    const lineSize = createMemo(() => getProgressSize(size(), 'line', { strokeWidth: props.strokeWidth }))
    const radius = () => props.strokeLinecap === 'square' || props.strokeLinecap === 'butt' ? '0px' : undefined
    const successPercent = () => getSuccessPercent(props.success)
    const trackBackground = () => {
      const color = strokeColorNotArray()
      if (!color) return undefined
      return typeof color === 'string' ? color : handleGradient(color)
    }
    const tone = () => status() === 'active' ? 'active' : status() === 'exception' ? 'exception' : status() === 'success' ? 'success' : 'normal'
    return (
      <div
        class={mergeClass(progressBodyClass({ kind: infoAlign() === 'center' && infoType() === 'outer' ? 'line-bottom' : 'line' }), classNames().body)}
        style={{ width: lineSize()[0] > 0 ? px(lineSize()[0]) : '100%', ...styles().body }}
        data-progress-part="body"
      >
        <div
          class={mergeClass(progressRailClass({}), classNames().rail)}
          style={{ 'background-color': railColor() || undefined, 'border-radius': radius(), height: px(lineSize()[1]), ...styles().rail }}
          data-progress-part="rail"
        >
          <div
            class={mergeClass(progressTrackClass({ tone: tone() }), classNames().track)}
            style={{
              width: `${validProgress(props.percent)}%`, height: px(lineSize()[1]), 'border-radius': radius(),
              background: trackBackground(), ...styles().track,
            }}
            data-progress-part="track"
          >
            {infoType() === 'inner' ? info() : undefined}
          </div>
          <Show when={successPercent() !== undefined}>
            <div
              class={mergeClass(progressTrackClass({ tone: 'success' }), classNames().track)}
              style={{
                width: `${validProgress(successPercent())}%`, height: px(lineSize()[1]), 'border-radius': radius(),
                'background-color': props.success?.strokeColor, ...styles().track,
              }}
              data-progress-part="track"
              data-progress-track="success"
            />
          </Show>
        </div>
        {infoType() === 'outer' ? info() : undefined}
      </div>
    )
  }

  // ---- 步骤 ------------------------------------------------------------------
  const Steps = () => {
    const count = createMemo(() => {
      const steps = props.steps
      return typeof steps === 'object' ? steps.count : steps ?? 0
    })
    const stepSize = createMemo(() => getProgressSize(size(), 'step', { steps: count(), strokeWidth: props.strokeWidth ?? 8 }))
    const current = createMemo(() => progressStepsCurrent(count(), props.percent, props.rounding))
    // 渐变对象不适用于步骤：只接受字符串或数组。
    const colorAt = (index: number) => {
      const color = props.strokeColor
      return Array.isArray(color) ? color[index] : typeof color === 'string' ? color : undefined
    }
    return (
      <div class={mergeClass(progressBodyClass({ kind: 'steps' }), classNames().body)} style={styles().body} data-progress-part="body">
        <For each={Array.from({ length: count() }, (_, i) => i)}>
          {index => {
            const active = () => index <= current() - 1
            return (
              <div
                class={mergeClass(progressStepItemClass({ active: active() }), classNames().track)}
                style={{
                  'background-color': active() ? colorAt(index) : railColor(),
                  width: px(stepSize()[0] / count()), height: px(stepSize()[1]), ...styles().track,
                }}
                data-progress-part="track"
                data-progress-step-active={active() ? 'true' : 'false'}
              />
            )
          }}
        </For>
        {info()}
      </div>
    )
  }

  // ---- 圆形 / 仪表盘 ---------------------------------------------------------
  const Circle = () => {
    const strokeWidth = createMemo(() => circleStrokeWidth(circleWidth(), props.strokeWidth))
    const gapDegree = createMemo(() => circleGapDegree(props.type, props.gapDegree))
    const gradient = () => isGradientObject(props.strokeColor)
    const layout = createMemo(() => {
      const percent = getPercentage(props.percent, props.success)
      const colors = getStrokeColor(props.success, strokeColorNotArray())
      return circleLayout({
        percent: props.steps ? percent[1] : percent,
        strokeColor: props.steps ? colors[1] : colors,
        strokeWidth: strokeWidth(),
        gapDegree: gapDegree(),
        gapPosition: circleGapPosition(props.type, props.gapPlacement, props.gapPosition),
        strokeLinecap: props.strokeLinecap,
        railColor: railColor(),
        steps: props.steps,
      })
    })
    const pathClass = (spec: CirclePathSpec) => {
      // 渐变时路径是 mask 里的白色描边，不能再加状态色类。
      if (gradient()) return undefined
      if (spec.active === false && !spec.color) return progressCircleStroke.rail
      return spec.color ? undefined : progressCircleStroke[status()]
    }
    const circle = (spec: CirclePathSpec, gradientStroke?: boolean) => (
      <circle
        class={mergeClass(pathClass(spec), classNames().track)}
        r={layout().radius}
        cx={50}
        cy={50}
        stroke={gradientStroke ? '#FFF' : undefined}
        stroke-linecap={spec.linecap}
        stroke-width={layout().strokeWidth}
        opacity={spec.opacity}
        style={{ ...spec.style, ...styles().track }}
        data-progress-part="track"
        data-progress-path={spec.active === undefined ? (spec.index === 0 ? 'success' : 'percent') : String(spec.index)}
      />
    )
    const body = () => (
      <div
        class={mergeClass(progressBodyClass({ kind: 'circle' }), classNames().body)}
        style={{ width: px(circleWidth()), height: px(circleWidth()), 'font-size': px(circleWidth() * 0.15 + 6), ...styles().body }}
        data-progress-part="body"
        data-progress-gradient={gradient() ? 'true' : undefined}
      >
        <svg viewBox="0 0 100 100" role="presentation" class="block w-full h-full">
          <Show when={layout().rail}>
            {rail => (
              <circle
                class={mergeClass(progressCircleStroke.rail, classNames().rail)}
                r={layout().radius}
                cx={50}
                cy={50}
                stroke={railColor()}
                stroke-linecap={layout().linecap}
                stroke-width={layout().strokeWidth}
                style={{ ...rail(), ...styles().rail }}
                data-progress-part="rail"
              />
            )}
          </Show>
          <For each={layout().paths}>
            {spec => (
              <Show when={spec.gradient} fallback={circle(spec)}>
                {fill => {
                  const maskId = `ut-progress-${uid}-${spec.index}-conic`
                  return <>
                    <mask id={maskId}>{circle(spec, true)}</mask>
                    <foreignObject x={0} y={0} width={100} height={100} {...({ mask: `url(#${maskId})` } as {})}>
                      <div style={{ width: '100%', height: '100%', background: fill().linear }}>
                        <div style={{ width: '100%', height: '100%', background: fill().conic }} />
                      </div>
                    </foreignObject>
                  </>
                }}
              </Show>
            )}
          </For>
        </svg>
        {smallCircle() ? undefined : info()}
      </div>
    )
    // 直径 ≤ 20 时数值改由 Tooltip 展示。
    return smallCircle() ? <Tooltip title={info()}>{body()}</Tooltip> : body()
  }

  const kind = () => isPureLine() ? (size() === 'small' ? 'line-small' : 'line')
    : isLine() ? 'steps'
    : props.type === 'circle' && circleWidth() <= 20 ? 'inline-circle' : 'circle'

  return (
    <div
      {...rest}
      class={mergeClass(progressClass({ kind: kind() }), props.class, classNames().root)}
      style={{ ...styles().root, ...props.style }}
      role="progressbar"
      aria-valuenow={percentNumber()}
      aria-valuemin={0}
      aria-valuemax={100}
      data-progress-type={props.type}
      data-progress-status={status()}
    >
      {isCircle() ? <Circle /> : props.steps ? <Steps /> : <Line />}
    </div>
  )
}

export default Progress
