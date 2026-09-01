import { Component, For, Show, createMemo, merge } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { createProgress, type ProgressIns, circlePath } from 'upthrust-competence'
import {
  progressTrackClass, progressIndicatorClass, progressSuccessClass,
  progressTextClass, progressStepClass, progressStepItemClass, progressStepFillClass,
  progressCircleClass, progressCircleTextClass,
} from './styles'
import { twMerge } from 'tailwind-merge'
import type { SizeType } from '../../common/type'

export type ProgressType = 'line' | 'circle' | 'dashboard'
export type ProgressStatus = 'success' | 'exception' | 'normal' | 'active'

export interface ProgressProps {
  type?: ProgressType
  percent?: number
  status?: ProgressStatus
  /** Show percent text. Default true for line with size>=default. */
  showInfo?: boolean
  size?: SizeType | number
  /** Line stroke height / circle stroke width, px. */
  strokeWidth?: number
  /** Segment steps count (line only). */
  steps?: number
  /** Success segment: percent + optional color. */
  success?: { percent?: number }
  strokeColor?: string
  trailColor?: string
  format?: (percent?: number, successPercent?: number) => JSX.Element
  class?: string
  style?: JSX.CSSProperties
  ref?: (val: ProgressIns) => void
}

const Progress: Component<ProgressProps> = (rawProps) => {
  const props = merge({ type: 'line' as ProgressType, percent: 0, showInfo: true, size: 'middle' as SizeType } as const, rawProps)

  const progress = createProgress({
    get percent() { return props.percent },
    get status() { return props.status },
    get success() { return props.success },
    get size() { return typeof props.size === 'number' ? props.size : undefined },
    get strokeWidth() { return props.strokeWidth },
    get steps() { return props.steps },
  })

  const sizeKey = createMemo((): 'small' | 'middle' | 'large' =>
    props.size === 'large' ? 'large' : props.size === 'small' ? 'small' : 'middle')

  const status = createMemo(() => progress.status())
  const percent = createMemo(() => progress.percent())
  const successPercent = createMemo(() => progress.successPercent())

  const formatNode = createMemo(() =>
    props.format ? props.format(percent(), successPercent()) : `${percent()}%`)

  props.ref?.(progress.refs)

  // ---- steps mode ----------------------------------------------------------
  const steps = createMemo(() => props.steps)
  const stepIndex = createMemo(() => progress.stepIndex())

  const lineStrokeStyle = createMemo(() => {
    const h = typeof props.size === 'number' ? props.size : undefined
    return h ? { height: `${h}px` } : {}
  })

  return (
    <Show
      when={steps()}
      fallback={
        <Show
          when={props.type === 'circle'}
          fallback={
            // ---- line ----
            <div class={twMerge('flex', 'items-center', 'gap-[8px]', props.class)} style={props.style}>
              <div
                class={twMerge(progressTrackClass({ size: sizeKey() }))}
                style={{ ...(props.trailColor ? { 'background-color': props.trailColor } : {}), ...lineStrokeStyle() }}
              >
                <div
                  class={progressIndicatorClass({ status: status(), shape: 'round' })}
                  style={{
                    width: `${percent()}%`,
                    ...(props.strokeColor ? { 'background-color': props.strokeColor } : {}),
                  }}
                />
                <Show when={successPercent() !== undefined}>
                  <div class={progressSuccessClass({})} style={{ width: `${successPercent()}%` }} />
                </Show>
              </div>
              <Show when={props.showInfo}>
                <span class={progressTextClass({ size: sizeKey() })}>
                  <Show when={status() === 'exception'} fallback={formatNode()}>
                    <span class="i-mdi-close-circle text-error align-middle" />
                  </Show>
                </span>
              </Show>
            </div>
          }
        >
          {/* ---- circle ---- */}
          <div
            class={twMerge(progressCircleClass({}), props.class)}
            style={{
              width: `${(typeof props.size === 'number' ? props.size : 120)}px`,
              height: `${(typeof props.size === 'number' ? props.size : 120)}px`,
              ...props.style as JSX.CSSProperties,
            }}
          >
            {renderCircle()}
            <Show when={props.showInfo}>
              <div class={progressCircleTextClass({ size: sizeKey() })}>
                <span class="font-medium">
                  <Show when={status() === 'exception'} fallback={formatNode()}>
                    <span class="i-mdi-close-circle text-error" />
                  </Show>
                </span>
              </div>
            </Show>
          </div>
        </Show>
      }
    >
      {/* ---- steps ---- */}
      <div class={twMerge(progressStepClass({}), props.class)} style={props.style}>
        <Show when={props.showInfo}>
          <span class={progressTextClass({ size: sizeKey() })}>{formatNode()}</span>
        </Show>
        <For each={Array.from({ length: steps()! })}>
          {(_, i) => {
            const filled = createMemo(() => i() < (stepIndex() ?? 0))
            const stepStatus = createMemo((): 'normal' | 'success' | 'exception' =>
              status() === 'exception' ? 'exception' : percent() >= 100 ? 'success' : 'normal')
            return (
              <div
                class={twMerge(
                  progressStepItemClass({ size: sizeKey() }),
                  filled() ? progressStepFillClass(stepStatus()) : '',
                )}
              />
            )
          }}
        </For>
      </div>
    </Show>
  )

  function renderCircle() {
    const g = progress.circleGeometry()
    const sizePx = typeof props.size === 'number' ? props.size : 120
    // Default colors go through UnoCSS stroke-* classes — they wrap the
    // theme CSS variables in rgb(var(...)) correctly. Raw
    // `var(--upthrust-colors-primary)` in a stroke ATTRIBUTE fails: the
    // variable holds bare "R G B" channel numbers, which is not a valid
    // color outside UnoCSS's generated wrappers. User-supplied colors use
    // the inline attribute (class omitted so the attribute wins).
    const trailClass = props.trailColor ? '' : 'stroke-outline-variant'
    const strokeClass = props.strokeColor ? '' : (
      status() === 'success' ? 'stroke-[#52c41a]'
        : status() === 'exception' ? 'stroke-error'
        : 'stroke-primary'
    )
    return (
      <svg width={sizePx} height={sizePx} viewBox="0 0 100 100" class="rotate-[-90deg]">
        <path
          d={circlePath(g.radius)}
          fill="none"
          class={trailClass}
          stroke={props.trailColor}
          stroke-width={g.strokeWidth}
        />
        <path
          d={circlePath(g.radius)}
          fill="none"
          class={twMerge('transition-[stroke-dashoffset] duration-mid ease-upthrust', strokeClass)}
          stroke={props.strokeColor}
          stroke-width={g.strokeWidth}
          stroke-linecap="round"
          stroke-dasharray={`${g.circumference}`}
          stroke-dashoffset={`${g.offset}`}
        />
      </svg>
    )
  }
}

export default Progress
