import { useComponentProps } from '../ConfigProvider/context'
import { For, Show, children as resolveChildren, createEffect, createMemo, createSignal, merge, omit, untrack } from 'solid-js'
import type { JSX } from '@solidjs/web'
import {
  spinRootClass, spinSectionClass, spinDescriptionClass, spinHolderClass, spinDotClass, spinDotItemClass,
  spinCustomIndicatorClass, spinCircleClass, spinContainerClass,
} from './styles'
import { mergeClass } from '../../common/merge'
import { resolveSemantic, type SemanticInput } from '../../common/semantic'
import type { SizeType } from '../../common/type'

export interface SpinSemanticClassNames {
  root?: string
  section?: string
  indicator?: string
  description?: string
  container?: string
  /** @deprecated Use description. */
  tip?: string
  /** @deprecated Use root. */
  mask?: string
}
export interface SpinSemanticStyles {
  root?: JSX.CSSProperties
  section?: JSX.CSSProperties
  indicator?: JSX.CSSProperties
  description?: JSX.CSSProperties
  container?: JSX.CSSProperties
  /** @deprecated Use description. */
  tip?: JSX.CSSProperties
  /** @deprecated Use root. */
  mask?: JSX.CSSProperties
}
export interface SpinSemanticInfo { props: SpinProps }

/** A node, or a factory so one indicator can be rendered by many Spins at once. */
export type SpinIndicator = JSX.Element | (() => JSX.Element)

export interface SpinProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children' | 'class' | 'style'> {
  /** Loading state. Default true (a bare <Spin /> spins). */
  spinning?: boolean
  /** Delay before the spinner appears, ms (prevents flashing); hiding is immediate. */
  delay?: number
  size?: SizeType
  /** Description under the indicator. */
  description?: JSX.Element
  /** @deprecated Use description. */
  tip?: JSX.Element
  /** Custom indicator; sized by the Spin size (1em icons fit). */
  indicator?: SpinIndicator
  /** Fullscreen backdrop loader. */
  fullscreen?: boolean
  /** Progress 0–100; 'auto' estimates a progress that never finishes. */
  percent?: number | 'auto'
  /** Nested mode: children get a dimmed overlay while spinning. */
  children?: JSX.Element
  /** @deprecated Use classNames.root. */
  wrapperClass?: string
  rootClass?: string
  class?: string
  style?: JSX.CSSProperties
  classNames?: SemanticInput<SpinSemanticClassNames, SpinSemanticInfo>
  styles?: SemanticInput<SpinSemanticStyles, SpinSemanticInfo>
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void)
}

const OWN = [
  'spinning', 'delay', 'size', 'description', 'tip', 'indicator', 'fullscreen', 'percent', 'children',
  'wrapperClass', 'rootClass', 'class', 'style', 'classNames', 'styles', 'ref',
] as const

// antd usePercent: 'auto' climbs toward 100 in shrinking steps every 200ms, never finishing.
const AUTO_INTERVAL = 200
const STEP_BUCKETS: [limit: number, stepPtg: number][] = [[30, 0.05], [70, 0.03], [96, 0.01]]
export const nextAutoPercent = (prev: number): number => {
  for (const [limit, step] of STEP_BUCKETS) if (prev <= limit) return prev + (100 - prev) * step
  return prev
}

// antd Indicator/Progress geometry: 100×100 viewBox, stroke = 1/5.
const VIEW = 100
const STROKE = VIEW / 5
const RADIUS = VIEW / 2 - STROKE / 2
const CIRCUMFERENCE = RADIUS * 2 * Math.PI

let defaultIndicator: SpinIndicator | undefined
const renderIndicator = (indicator: SpinIndicator) => typeof indicator === 'function' ? (indicator as () => JSX.Element)() : indicator

const SpinComponent = (providedProps: SpinProps): JSX.Element => {
  const rawProps = useComponentProps('Spin', providedProps)
  const props = merge({ size: 'middle' as const, fullscreen: false }, rawProps)
  const rest = omit(rawProps, ...OWN)

  // antd: initial = spinning && !shouldDelay; showing is debounced by `delay`, hiding is immediate.
  const [spinning, setSpinning] = createSignal(
    untrack(() => props.spinning !== false && !(Number(props.delay) > 0)),
    { ownedWrite: true },
  )
  createEffect(
    () => ({ on: props.spinning !== false, delay: Number(props.delay) || 0 }),
    ({ on, delay }) => {
      if (!on) { setSpinning(false); return }
      if (delay <= 0) { setSpinning(true); return }
      const timer = setTimeout(() => setSpinning(true), delay)
      return () => clearTimeout(timer)
    },
  )

  const [mockPercent, setMockPercent] = createSignal(0, { ownedWrite: true })
  createEffect(
    () => props.percent === 'auto' && spinning(),
    (auto) => {
      if (!auto) return
      setMockPercent(0)
      const timer = setInterval(() => setMockPercent(nextAutoPercent), AUTO_INTERVAL)
      return () => clearInterval(timer)
    },
  )
  const percent = createMemo(() => props.percent === 'auto' ? mockPercent() : props.percent)
  // antd Progress mounts the ring once percent first leaves 0 and keeps it (so it can fade out).
  const [ringMounted, setRingMounted] = createSignal(false, { ownedWrite: true })
  createEffect(() => percent(), (value) => { if (value !== undefined && value !== 0) setRingMounted(true) })

  const description = resolveChildren(() => props.description ?? props.tip)
  const hasDescription = () => {
    const value = description()
    return value !== undefined && value !== null && value !== false && value !== ''
  }
  const content = resolveChildren(() => props.children)
  const hasChildren = () => content() !== undefined
  const nested = () => hasChildren() || !!props.fullscreen

  const semanticInfo = (): SpinSemanticInfo => ({
    props: merge(props, {
      get spinning() { return spinning() },
      get description() { return description() },
      get tip() { return description() },
      get percent() { return percent() },
    }) as SpinProps,
  })
  const classNames = createMemo(() => resolveSemantic(props.classNames, semanticInfo()))
  const styles = createMemo(() => resolveSemantic(props.styles, semanticInfo()))

  const mode = () => props.fullscreen ? (spinning() ? 'fullscreen-on' : 'fullscreen-off') : hasChildren() ? 'nested' : 'section'

  const safePercent = () => Math.max(Math.min(percent() ?? 0, 100), 0)
  const Looper = () => (
    <>
      <span
        class={mergeClass(spinHolderClass({ size: props.size, hidden: (percent() ?? 0) > 0, progress: false }), classNames().indicator)}
        style={styles().indicator}
        data-spin-part="indicator"
      >
        <span class={spinDotClass({})}>
          <For each={['1', '2', '3', '4'] as const}>{position => <i class={spinDotItemClass({ position })} />}</For>
        </span>
      </span>
      <Show when={ringMounted()}>
        <span class={spinHolderClass({ size: props.size, hidden: safePercent() <= 0, progress: true })} data-spin-part="progress">
          <svg viewBox={`0 0 ${VIEW} ${VIEW}`} width="100%" height="100%" class="block" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={safePercent()}>
            <circle class={spinCircleClass({ rail: true })} r={RADIUS} cx={VIEW / 2} cy={VIEW / 2} stroke-width={STROKE} />
            <circle
              class={spinCircleClass({ rail: false })} r={RADIUS} cx={VIEW / 2} cy={VIEW / 2} stroke-width={STROKE}
              style={{
                'stroke-dashoffset': `${CIRCUMFERENCE / 4}`,
                'stroke-dasharray': `${(CIRCUMFERENCE * safePercent()) / 100} ${(CIRCUMFERENCE * (100 - safePercent())) / 100}`,
              }}
            />
          </svg>
        </span>
      </Show>
    </>
  )

  const indicatorNode = () => {
    const custom = props.indicator ?? defaultIndicator
    return (
      <>
        {custom !== undefined
          ? (
            <span
              class={mergeClass(spinCustomIndicatorClass({ size: props.size }), classNames().indicator)}
              style={styles().indicator}
              data-spin-part="indicator"
            >{renderIndicator(custom)}</span>
          )
          : <Looper />}
        <Show when={hasDescription()}>
          <div
            class={mergeClass(spinDescriptionClass({ fullscreen: !!props.fullscreen }), classNames().tip, classNames().description)}
            style={{ ...styles().tip, ...styles().description }}
            data-spin-part="description"
          >{description()}</div>
        </Show>
      </>
    )
  }

  return (
    <div
      ref={props.ref}
      class={mergeClass(
        spinRootClass({ mode: mode() }),
        props.rootClass,
        classNames().root,
        props.fullscreen ? classNames().mask : undefined,
        nested() ? props.wrapperClass : classNames().section,
        props.class,
      )}
      style={{
        ...styles().root,
        ...(!nested() ? styles().section : {}),
        ...(props.fullscreen ? styles().mask : {}),
        ...props.style,
      }}
      aria-live="polite"
      aria-busy={spinning() ? 'true' : 'false'}
      data-spin-part="root"
      {...rest}
    >
      <Show when={spinning()}>
        <Show when={nested()} fallback={indicatorNode()}>
          <div
            class={mergeClass(spinSectionClass({ fullscreen: !!props.fullscreen }), classNames().section)}
            style={styles().section}
            data-spin-part="section"
          >{indicatorNode()}</div>
        </Show>
      </Show>
      <Show when={hasChildren()}>
        <div
          class={mergeClass(spinContainerClass({ spinning: spinning() }), classNames().container)}
          style={styles().container}
          data-spin-part="container"
        >{content()}</div>
      </Show>
    </div>
  )
}

/** Set the global default indicator (antd Spin.setDefaultIndicator). Pass a factory to share it across Spins. */
const setDefaultIndicator = (indicator: SpinIndicator | undefined) => { defaultIndicator = indicator }

const Spin = /* @__PURE__ */ Object.assign(SpinComponent, { setDefaultIndicator })
export default Spin
