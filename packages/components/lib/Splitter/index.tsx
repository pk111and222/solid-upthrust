import {
  For, Show, children as resolveChildren, createContext, createEffect, createMemo, createSignal,
  omit, onCleanup, untrack, useContext, type Accessor,
} from 'solid-js'
import type { JSX } from '@solidjs/web'
import {
  createOwnerCleanup,
  createSplitter,
  type SplitterCollapseType,
  type SplitterCollapsibleIconMode,
  type SplitterOrientation,
  type SplitterPanelCollapsible,
  type SplitterPanelConfig,
  type SplitterSize,
} from 'upthrust-competence'
import { mergeClass } from '../../common/merge'
import {
  PANEL_STANDALONE_CLASS,
  SPLITTER_COLLAPSE_ICON,
  splitterBarVariants,
  splitterCollapseVariants,
  splitterDraggerIconVariants,
  splitterDraggerVariants,
  splitterMaskVariants,
  splitterPanelVariants,
  splitterPreviewVariants,
  splitterVariants,
  type SplitterCollapseVisibility,
  type SplitterDraggerState,
} from './styles'

export type { SplitterCollapseType, SplitterCollapsibleIconMode, SplitterOrientation, SplitterPanelCollapsible, SplitterSize }

type DivAttributes = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'class' | 'style' | 'children' | 'ref'>

/** 折叠配置：motion 开启面板尺寸过渡；icon 替换折叠按钮的图标。 */
export interface SplitterCollapsibleConfig {
  motion?: boolean
  icon?: { start?: JSX.Element; end?: JSX.Element }
}

/** 语义化类名：dragger 传字符串等同 `{ default }`，active 只在拖拽中追加。 */
export interface SplitterClassNames {
  root?: string
  panel?: string
  dragger?: string | { default?: string; active?: string }
}

export interface SplitterStyles {
  root?: JSX.CSSProperties
  panel?: JSX.CSSProperties
  dragger?: { default?: JSX.CSSProperties; active?: JSX.CSSProperties }
}

export interface SplitterPanelProps extends DivAttributes {
  /** 受控尺寸：数字或纯数字字符串按 px，'30%' 按容器百分比。任一面板设置 size 时全部面板受控。 */
  size?: SplitterSize
  /** 初始尺寸（非受控）；未设置的面板平分剩余空间。 */
  defaultSize?: SplitterSize
  /** 最小尺寸。 */
  min?: SplitterSize
  /** 最大尺寸。 */
  max?: SplitterSize
  /** 是否可拖拽调整，默认 true；相邻两个面板都可调时分隔条才可拖拽。 */
  resizable?: boolean
  /** 快速折叠：true 两个方向都可折叠；对象形式分别配置 start / end 与按钮显示方式。 */
  collapsible?: SplitterPanelCollapsible
  /** 折叠（尺寸为 0）时卸载内容；不设置时继承 Splitter 的 destroyOnHidden。 */
  destroyOnHidden?: boolean
  ref?: (el: HTMLDivElement) => void
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

export interface SplitterProps extends Omit<DivAttributes, 'onResize'> {
  /** 排列方向，默认 horizontal。 */
  orientation?: SplitterOrientation
  /** 等同 orientation="vertical"；同时设置时 orientation 优先。 */
  vertical?: boolean
  /** @deprecated 请使用 orientation。 */
  layout?: SplitterOrientation
  /** 延迟模式：拖拽中只显示预览线，松开后才调整尺寸（期间不触发 onResize）。 */
  lazy?: boolean
  /** 面板折叠时卸载内容（面板自身的 destroyOnHidden 优先）。 */
  destroyOnHidden?: boolean
  /** 自定义拖拽抓手图标（替换默认短线）。 */
  draggerIcon?: JSX.Element
  /** 折叠动画与折叠按钮图标。 */
  collapsible?: SplitterCollapsibleConfig
  /** @deprecated 请使用 collapsible.icon。 */
  collapsibleIcon?: { start?: JSX.Element; end?: JSX.Element }
  /** 键盘方向键每次移动的像素，默认 16（本库扩展）。 */
  keyboardStep?: number
  /** 双击拖拽条。 */
  onDraggerDoubleClick?: (index: number) => void
  /** 开始拖拽，参数为拖拽前各面板像素尺寸。 */
  onResizeStart?: (sizes: number[]) => void
  /** 尺寸变化中（lazy 模式下不触发）。 */
  onResize?: (sizes: number[]) => void
  /** 拖拽结束 / 键盘调整 / 折叠后的最终尺寸。 */
  onResizeEnd?: (sizes: number[]) => void
  /** 点击折叠按钮后触发；collapsed[i] 表示第 i 个面板尺寸为 0。 */
  onCollapse?: (collapsed: boolean[], sizes: number[]) => void
  classNames?: SplitterClassNames
  styles?: SplitterStyles
  ref?: (el: HTMLDivElement) => void
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

/**
 * Panel 在 Splitter 内不直接渲染 DOM，而是返回一个描述对象，由 Splitter
 * 统一收集配置、决定顺序并在两两之间插入分隔条。SplitterScope 标记当前是否
 * 处在 Splitter 的 children 求值中；面板内容区会重置为 false，
 * 避免内容里单独使用的 Panel 被误当作描述对象。
 */
const PANEL = Symbol('upthrust-splitter-panel')

interface PanelDescriptor {
  [PANEL]: true
  config: SplitterPanelConfig
  props: SplitterPanelProps
}

const SplitterScope = createContext(false)

const isPanel = (value: unknown): value is PanelDescriptor =>
  typeof value === 'object' && value !== null && (value as Partial<PanelDescriptor>)[PANEL] === true

const PANEL_PROPS = [
  'size', 'defaultSize', 'min', 'max', 'resizable', 'collapsible', 'destroyOnHidden', 'class', 'style', 'children',
] as const

const SPLITTER_PROPS = [
  'orientation', 'vertical', 'layout', 'lazy', 'destroyOnHidden', 'draggerIcon', 'collapsible', 'collapsibleIcon',
  'keyboardStep', 'onDraggerDoubleClick', 'onResizeStart', 'onResize', 'onResizeEnd', 'onCollapse',
  'classNames', 'styles', 'ref', 'class', 'style', 'children',
] as const

/** 连续两次按下间隔小于该值时视为双击，不开始拖拽（antd 同值）。 */
const DOUBLE_CLICK_GAP = 300

/** 面板尺寸转 CSS：数字与纯数字字符串按 px，其余（百分比）原样使用。 */
const toCssSize = (size: number | string) => {
  if (typeof size === 'number') return `${size}px`
  return /^\s*-?\d+(\.\d+)?\s*$/.test(size) ? `${Number(size)}px` : size
}

const isZeroSize = (size: number | string | undefined) =>
  size === 0 || (typeof size === 'string' && Number.parseFloat(size) === 0)

/**
 * 面板排布在容器的内容区：offsetWidth / offsetHeight 含边框与内边距，直接使用会让
 * 面板之和超出可用空间（例如带 1px 边框的外框多出 2px，被 flex-shrink 悄悄压回，
 * 但回调上报的尺寸与 aria 百分比都会偏大），因此减去主轴两侧的边框与内边距。
 */
const contentSize = (el: HTMLElement, horizontal: boolean) => {
  const outer = horizontal ? el.offsetWidth : el.offsetHeight
  if (outer <= 0) return 0
  const style = getComputedStyle(el)
  const edges = horizontal
    ? [style.borderLeftWidth, style.borderRightWidth, style.paddingLeft, style.paddingRight]
    : [style.borderTopWidth, style.borderBottomWidth, style.paddingTop, style.paddingBottom]
  return Math.max(0, outer - edges.reduce((sum, edge) => sum + (Number.parseFloat(edge) || 0), 0))
}

const visibilityOf = (mode: SplitterCollapsibleIconMode): SplitterCollapseVisibility =>
  mode === true ? 'visible' : mode === false ? 'hidden' : 'hover'

export const Panel = (props: SplitterPanelProps): JSX.Element => {
  if (useContext(SplitterScope)) {
    const config: SplitterPanelConfig = {
      get size() { return props.size },
      get defaultSize() { return props.defaultSize },
      get min() { return props.min },
      get max() { return props.max },
      get resizable() { return props.resizable },
      get collapsible() { return props.collapsible },
    }
    const descriptor: PanelDescriptor = { [PANEL]: true, config, props }
    return descriptor as unknown as JSX.Element
  }
  // Splitter 之外：普通滚动块，不参与分割。
  const rest = omit(props, ...PANEL_PROPS)
  return (
    <div {...rest} class={mergeClass(...PANEL_STANDALONE_CLASS, props.class)} style={props.style}>
      {props.children}
    </div>
  )
}

const SplitterInner = (props: SplitterProps) => {
  const rest = omit(props, ...SPLITTER_PROPS)
  const resolved = resolveChildren(() => props.children)
  const descriptors = createMemo(() => resolved.toArray().filter(isPanel))
  const items = createMemo(() => descriptors().map(descriptor => descriptor.config))

  const splitter = createSplitter({
    get orientation() { return props.orientation },
    get vertical() { return props.vertical },
    get layout() { return props.layout },
    get items() { return items() },
    get keyboardStep() { return props.keyboardStep },
    get onResizeStart() { return props.onResizeStart },
    get onResize() { return props.onResize },
    get onResizeEnd() { return props.onResizeEnd },
    get onCollapse() { return props.onCollapse },
  })

  // ---- 容器测量：尺寸为 0（如隐藏的标签页中）时跳过，保留上一次结果。
  let root: HTMLDivElement | undefined
  const measure = () => {
    if (!root) return
    splitter.setContainerSize(contentSize(root, splitter.isHorizontal()))
  }
  // ref 回调在 Solid 2 里没有 owner，清理函数须绑定到组件创建时的 owner。
  const onOwnerCleanup = createOwnerCleanup()
  const setRoot = (el: HTMLDivElement) => {
    root = el
    untrack(() => props.ref?.(el))
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => measure())
      observer.observe(el)
      onOwnerCleanup(() => observer.disconnect())
    }
  }
  // 挂载后以及方向切换时重新测量（切换方向后读取的是另一条边）。
  createEffect(() => splitter.orientation(), () => measure())

  const orientation = () => splitter.orientation()
  const icons = () => props.collapsible?.icon ?? props.collapsibleIcon
  const draggerClassNames = () => {
    const value = props.classNames?.dragger
    return typeof value === 'string' ? { default: value } : value
  }

  const PanelView = (view: { panel: PanelDescriptor; index: Accessor<number> }) => {
    const panelProps = view.panel.props
    const panelRest = omit(panelProps, ...PANEL_PROPS)
    const size = () => splitter.panelSizes()[view.index()]
    const collapsed = () => isZeroSize(size())
    const destroyed = () => (panelProps.destroyOnHidden ?? props.destroyOnHidden) === true && collapsed()
    // 拖拽中关闭过渡，否则面板会追着指针缓动。
    const motion = () => !!props.collapsible?.motion && splitter.movingIndex() === undefined
    const style = createMemo((): JSX.CSSProperties => {
      const value = size()
      const sized = value !== undefined
      return {
        ...props.styles?.panel,
        ...panelProps.style,
        // 未测量且没有尺寸时用 auto + grow，SSR 首屏也能铺满。
        'flex-basis': sized ? toCssSize(value) : 'auto',
        'flex-grow': sized ? '0' : '1',
      }
    })
    return (
      <div
        {...panelRest}
        class={mergeClass(
          splitterPanelVariants({ collapsed: collapsed(), motion: motion() }),
          props.classNames?.panel,
          panelProps.class,
        )}
        style={style()}
      >
        <SplitterScope value={false}>
          <Show when={!destroyed()}>{panelProps.children}</Show>
        </SplitterScope>
      </div>
    )
  }

  const Bar = (bar: { index: Accessor<number> }) => {
    const info = createMemo(() => splitter.barInfo(bar.index()))
    const aria = createMemo(() => splitter.aria(bar.index()))
    const active = () => splitter.movingIndex() === bar.index()
    const state = (): SplitterDraggerState => (!info().resizable ? 'disabled' : active() ? 'active' : 'idle')
    const customDragger = () => props.draggerIcon !== undefined
    const [preview, setPreview] = createSignal(0, { ownedWrite: true })

    let lastPress = 0
    let stopDrag: (() => void) | undefined
    onCleanup(() => stopDrag?.())

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return
      event.stopPropagation()
      const now = Date.now()
      const gap = now - lastPress
      if (gap > 0 && gap < DOUBLE_CLICK_GAP) return
      lastPress = now

      const index = bar.index()
      if (!splitter.startResize(index)) return
      // 阻止文本选中；默认聚焦被阻止后手动聚焦，拖完可以继续用键盘微调。
      event.preventDefault()
      ;(event.currentTarget as HTMLElement).focus({ preventScroll: true })

      const lazy = !!props.lazy
      const horizontal = splitter.isHorizontal()
      const startX = event.pageX
      const startY = event.pageY
      let lazyOffset = 0

      const onMove = (move: PointerEvent) => {
        const offset = horizontal ? move.pageX - startX : move.pageY - startY
        if (lazy) {
          lazyOffset = splitter.constrainOffset(index, offset)
          setPreview(lazyOffset)
        } else {
          splitter.updateResize(index, offset)
        }
      }
      const onEnd = () => {
        stopDrag?.()
        if (lazy) {
          splitter.endResize(lazyOffset)
          setPreview(0)
        } else {
          splitter.endResize()
        }
      }
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onEnd)
      window.addEventListener('pointercancel', onEnd)
      stopDrag = () => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onEnd)
        window.removeEventListener('pointercancel', onEnd)
        stopDrag = undefined
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (splitter.keyboardResize(bar.index(), event.key)) event.preventDefault()
    }

    const draggerStyle = (): JSX.CSSProperties => ({
      ...props.styles?.dragger?.default,
      ...(active() ? props.styles?.dragger?.active : undefined),
    })

    const CollapseButton = (button: { type: SplitterCollapseType }) => {
      const placement = () => `${orientation()}-${button.type}` as const
      const custom = () => icons()?.[button.type]
      const mode = () => (button.type === 'start' ? info().showStartCollapsibleIcon : info().showEndCollapsibleIcon)
      const toggle = () => splitter.collapse(bar.index(), button.type)
      return (
        <div
          role="button"
          tabindex={0}
          aria-label={button.type === 'start' ? '切换起始侧面板' : '切换末尾侧面板'}
          class={splitterCollapseVariants({
            placement: placement(),
            appearance: custom() === undefined ? 'default' : 'customize',
            visibility: visibilityOf(mode()),
          })}
          onClick={toggle}
          onKeyDown={(event: KeyboardEvent) => {
            if (event.key !== 'Enter' && event.key !== ' ') return
            event.preventDefault()
            toggle()
          }}
        >
          <Show when={custom() !== undefined} fallback={<span class={SPLITTER_COLLAPSE_ICON[placement()]} aria-hidden="true" />}>
            <span class="flex items-center">{custom()}</span>
          </Show>
        </div>
      )
    }

    return (
      <div class={splitterBarVariants({ orientation: orientation() })}>
        <Show when={props.lazy && preview() !== 0}>
          <div
            class={splitterPreviewVariants({ orientation: orientation() })}
            style={{
              transform: splitter.isHorizontal() ? `translate3d(${preview()}px, 0, 0)` : `translate3d(0, ${preview()}px, 0)`,
            }}
          />
        </Show>
        <div
          role="separator"
          tabindex={info().resizable ? 0 : -1}
          aria-disabled={info().resizable ? 'false' : 'true'}
          aria-orientation={splitter.isHorizontal() ? 'vertical' : 'horizontal'}
          aria-valuenow={aria().valueNow}
          aria-valuemin={aria().valueMin}
          aria-valuemax={aria().valueMax}
          class={mergeClass(
            splitterDraggerVariants({ orientation: orientation(), state: state(), customize: customDragger() }),
            draggerClassNames()?.default,
            active() ? draggerClassNames()?.active : undefined,
          )}
          style={draggerStyle()}
          onPointerDown={onPointerDown}
          onKeyDown={onKeyDown}
          onDblClick={() => props.onDraggerDoubleClick?.(bar.index())}
        >
          <Show when={customDragger()}>
            <div class={splitterDraggerIconVariants({ state: state() })}>{props.draggerIcon}</div>
          </Show>
        </div>
        <Show when={info().startCollapsible}>
          <CollapseButton type="start" />
        </Show>
        <Show when={info().endCollapsible}>
          <CollapseButton type="end" />
        </Show>
      </div>
    )
  }

  return (
    <div
      {...rest}
      ref={setRoot}
      class={mergeClass(splitterVariants({ orientation: orientation() }), props.classNames?.root, props.class)}
      style={{ ...props.styles?.root, ...props.style }}
    >
      <For each={descriptors()}>
        {(panel, index) => (
          <>
            <PanelView panel={panel} index={index} />
            <Show when={index() < descriptors().length - 1}>
              <Bar index={index} />
            </Show>
          </>
        )}
      </For>
      <Show when={splitter.movingIndex() !== undefined}>
        <div aria-hidden="true" class={splitterMaskVariants({ orientation: orientation() })} />
      </Show>
    </div>
  )
}

const SplitterBase = (props: SplitterProps) => (
  <SplitterScope value={true}>
    <SplitterInner {...props} />
  </SplitterScope>
)

/** 分隔面板：拖拽分隔条调整相邻面板尺寸，支持受控尺寸、折叠、延迟模式与键盘操作。 */
const Splitter = Object.assign(SplitterBase, { Panel })
export default Splitter
