import { For, Show, createMemo, merge } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { createSteps, type StepItem as HeadlessStepItem, type StepStatus } from 'upthrust-competence'
import Progress from '../Progress'
import { mergeClass } from '../../common/merge'
import { resolveSemantic, type SemanticInput } from '../../common/semantic'
import {
  STEP_PROGRESS_CLASS, STEP_SUBTITLE_CLASS, STEP_VERTICAL_COLUMN_CLASS,
  stepBodyClass, stepContentClass, stepDotClass, stepDotWrapClass, stepGlyphClass, stepIconClass,
  stepItemClass, stepRailClass, stepTitleClass, stepsRootClass,
  type StepIconTone, type StepRailLayout,
} from './styles'

export type { StepStatus } from 'upthrust-competence'

export type StepsOrientation = 'horizontal' | 'vertical'
export type StepsTitlePlacement = 'horizontal' | 'vertical'
export type StepsSize = 'default' | 'small'
export type StepsType = 'default' | 'dot'
export type StepsVariant = 'filled' | 'outlined'

/** 单个步骤。 */
export interface StepItem {
  title?: JSX.Element
  subTitle?: JSX.Element
  /** 步骤详情（antd 6 名称）；与 description 二选一，content 优先。 */
  content?: JSX.Element
  /** 步骤详情（旧名称）。 */
  description?: JSX.Element
  /** 图标类名（如 'i-mdi-account'）或任意节点；设置后替换序号圆。 */
  icon?: string | JSX.Element
  /** 覆盖由 current 推导出的状态。 */
  status?: StepStatus
  /** 禁止点击。 */
  disabled?: boolean
  class?: string
  style?: JSX.CSSProperties
}

export type StepsSemanticName = 'root' | 'item' | 'itemIcon' | 'itemTitle' | 'itemSubtitle' | 'itemContent' | 'itemRail'
export type StepsClassNames = Partial<Record<StepsSemanticName, string>>
export type StepsStyles = Partial<Record<StepsSemanticName, JSX.CSSProperties>>
export interface StepsSemanticInfo { props: StepsProps }

export interface StepsProgressDotInfo {
  index: number
  status: StepStatus
  title?: JSX.Element
  content?: JSX.Element
  description?: JSX.Element
}
export type StepsProgressDotRender = (iconDot: JSX.Element, info: StepsProgressDotInfo) => JSX.Element

export interface StepsProps {
  items: StepItem[]
  /** 当前步骤（以 initial 为起点计数），默认 0。 */
  current?: number
  /** 起始序号，默认 0：影响显示编号、current 基准与 onChange 参数。 */
  initial?: number
  /** 当前步骤的状态，默认 'process'。 */
  status?: StepStatus
  /** 方向（antd 6 名称），优先于 direction。 */
  orientation?: StepsOrientation
  /** 方向（旧名称），默认 'horizontal'。 */
  direction?: StepsOrientation
  size?: StepsSize
  /** 标题位置（仅水平方向），默认 'horizontal'（图标右侧）。 */
  titlePlacement?: StepsTitlePlacement
  /** 标题位置（旧名称）。 */
  labelPlacement?: StepsTitlePlacement
  /** 'dot' 为点状步骤条。 */
  type?: StepsType
  /** 点状步骤条；传函数可自定义点的渲染。为真时等价 type="dot"。 */
  progressDot?: boolean | StepsProgressDotRender
  /** 外观，默认 'filled'。 */
  variant?: StepsVariant
  /** 当前步骤的进度（0–100），在当前图标外显示圆环（点状模式不显示）。 */
  percent?: number
  /** 点击步骤回调，参数为 initial + 序号；设置后未禁用的非当前步骤可点击、可键盘操作。 */
  onChange?: (current: number) => void
  classNames?: SemanticInput<StepsClassNames, StepsSemanticInfo>
  styles?: SemanticInput<StepsStyles, StepsSemanticInfo>
  class?: string
  style?: JSX.CSSProperties
}

type Layout = 'inline' | 'stack' | 'dot' | 'vertical'

const Steps = (rawProps: StepsProps) => {
  const props = merge({ current: 0, initial: 0, size: 'default' as StepsSize, variant: 'filled' as StepsVariant }, rawProps)

  const steps = createSteps({
    get current() { return props.current - props.initial },
    // 只读取 status / disabled，UI 条目的节点类型不影响状态机。
    get items() { return props.items as unknown as HeadlessStepItem[] },
    get status() { return props.status },
    // antd：任意未禁用的步骤都可点击（headless 默认的“不许前跳”守卫只用于命令式向导）。
    clickNavigable: false,
  })

  const orientation = () => props.orientation ?? props.direction ?? 'horizontal'
  const isDot = () => !!props.progressDot || props.type === 'dot'
  const layout = createMemo((): Layout => {
    if (orientation() === 'vertical') return 'vertical'
    if (isDot()) return 'dot'
    return (props.titlePlacement ?? props.labelPlacement) === 'vertical' ? 'stack' : 'inline'
  })
  const small = () => props.size === 'small'
  const info = (): StepsSemanticInfo => ({ props })
  const classNames = createMemo(() => resolveSemantic(props.classNames, info()))
  const styles = createMemo(() => resolveSemantic(props.styles, info()))

  const clickableAt = (index: number) => !!props.onChange && !props.items[index]?.disabled
  const activate = (index: number) => {
    if (!clickableAt(index) || index === steps.current()) return
    props.onChange?.(props.initial + index)
  }
  const onKeyDown = (event: KeyboardEvent, index: number) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    activate(index)
  }

  const railLayout = (): StepRailLayout => {
    const value = layout()
    if (value === 'vertical') return 'vertical'
    if (value === 'dot') return 'dot'
    return `${value}-${small() ? 'small' : 'default'}`
  }

  const StepView = (p: { item: StepItem; index: number }) => {
    const status = createMemo(() => steps.getStepStatus(p.index))
    const isCurrent = () => p.index === steps.current()
    const last = () => p.index === props.items.length - 1
    const clickable = () => clickableAt(p.index)
    const hover = () => clickable() && status() !== 'process'
    const content = () => p.item.content ?? p.item.description

    const iconTone = (): StepIconTone => `${p.item.icon ? 'custom' : props.variant}-${status()}`
    const glyph = () => status() === 'finish' ? 'check' : status() === 'error' ? 'close' : 'number'
    const showProgress = () => props.percent !== undefined && isCurrent() && status() === 'process' && !isDot()

    const iconNode = () => (
      <span
        data-step-icon
        class={mergeClass(stepIconClass({ size: props.size, tone: iconTone(), hover: hover() }), classNames().itemIcon)}
        style={styles().itemIcon}
      >
        <Show when={p.item.icon} fallback={
          <Show when={glyph() !== 'number'} fallback={<span>{String(props.initial + p.index + 1)}</span>}>
            <span aria-hidden="true" class={stepGlyphClass({ glyph: glyph() })} />
          </Show>
        }>
          {typeof p.item.icon === 'string' ? <span aria-hidden="true" class={p.item.icon as string} /> : p.item.icon}
        </Show>
        <Show when={showProgress()}>
          <span data-step-progress class={mergeClass(STEP_PROGRESS_CLASS)}>
            <Progress type="circle" percent={props.percent} size={small() ? 32 : 40} strokeWidth={4} format={() => null} showInfo={false} />
          </span>
        </Show>
      </span>
    )

    const dotNode = () => {
      const size = () => isCurrent() ? (`${props.size}-current` as const) : props.size
      const dot = <span data-step-dot class={mergeClass(stepDotClass({ tone: status(), size: size() }), classNames().itemIcon)} style={styles().itemIcon} />
      const render = props.progressDot
      return typeof render === 'function'
        ? render(dot, { index: p.index, status: status(), title: p.item.title, content: p.item.content, description: p.item.description })
        : dot
    }

    const rail = () => (
      <span
        data-step-rail
        aria-hidden="true"
        class={mergeClass(stepRailClass({ tone: status() === 'finish' ? 'finish' : 'rest', layout: railLayout() }), classNames().itemRail)}
        style={styles().itemRail}
      />
    )

    const titleLayout = () => {
      const value = layout()
      const key = value === 'dot' ? 'stack' : value
      return `${key}-${small() ? 'small' : 'default'}` as const
    }

    const text = () => (
      <>
        <div
          data-step-title
          class={mergeClass(stepTitleClass({ layout: titleLayout(), tone: status(), hover: hover() }), classNames().itemTitle)}
          style={styles().itemTitle}
        >
          {p.item.title}
          <Show when={p.item.subTitle}>
            <span data-step-subtitle class={mergeClass(STEP_SUBTITLE_CLASS, classNames().itemSubtitle)} style={styles().itemSubtitle}>{p.item.subTitle}</span>
          </Show>
          <Show when={layout() === 'inline' && !last()}>{rail()}</Show>
        </div>
        <Show when={content()}>
          <div
            data-step-content
            class={mergeClass(stepContentClass({ tone: status(), layout: layout() === 'vertical' ? 'vertical' : layout() === 'inline' ? 'inline' : 'stack' }), classNames().itemContent)}
            style={styles().itemContent}
          >
            {content()}
          </div>
        </Show>
      </>
    )

    const itemLayout = () => {
      const value = layout()
      return value === 'dot' ? 'stack' : value
    }
    const bodyLayout = () =>layout() === 'vertical' ? (last() ? 'vertical-last' : 'vertical') : layout()

    return (
      <div
        data-step-status={status()}
        role={clickable() ? 'button' : undefined}
        tabindex={clickable() ? 0 : undefined}
        aria-current={isCurrent() ? 'step' : undefined}
        aria-disabled={p.item.disabled ? 'true' : undefined}
        class={mergeClass(
          stepItemClass({
            layout: itemLayout(),
            pad: layout() === 'inline' && p.index > 0,
            fill: layout() === 'inline' ? !last() : layout() !== 'vertical',
            clickable: clickable(),
            disabled: !!p.item.disabled,
          }),
          classNames().item,
          p.item.class,
        )}
        style={{ ...styles().item, ...p.item.style }}
        onClick={() => activate(p.index)}
        onKeyDown={event => onKeyDown(event, p.index)}
      >
        <Show when={layout() === 'vertical'} fallback={
          <>
            <Show when={isDot()} fallback={iconNode()}>
              <span class={stepDotWrapClass({ layout: 'stack' })}>{dotNode()}</span>
            </Show>
            <Show when={(layout() === 'stack' || layout() === 'dot') && !last()}>{rail()}</Show>
            <div class={stepBodyClass({ layout: bodyLayout() })}>{text()}</div>
          </>
        }>
          <div class={mergeClass(STEP_VERTICAL_COLUMN_CLASS)}>
            <Show when={isDot()} fallback={iconNode()}>
              <span class={stepDotWrapClass({ layout: small() ? 'vertical-small' : 'vertical-default' })}>{dotNode()}</span>
            </Show>
            <Show when={!last()}>{rail()}</Show>
          </div>
          <div class={stepBodyClass({ layout: bodyLayout() })}>{text()}</div>
        </Show>
      </div>
    )
  }

  return (
    <div
      data-steps-orientation={orientation()}
      data-steps-layout={layout()}
      class={mergeClass(stepsRootClass({ orientation: orientation() }), classNames().root, props.class)}
      style={{ ...styles().root, ...props.style }}
    >
      <For each={props.items}>
        {(item, index) => <StepView item={item} index={index()} />}
      </For>
    </div>
  )
}

export default Steps
