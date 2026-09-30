import { ConfigPortal as Portal } from '../ConfigProvider/Portal'
import { useComponentProps } from '../ConfigProvider/context'
import { createEffect, createMemo, createSignal, For, Show, untrack } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { createTour, createTourPosition, tourClosable, type TourConfig, type TourStepConfig, type TourIns, type TourMaskConfig } from 'upthrust-competence'
import { dialogStack, registerDialog, unregisterDialog } from '../_dialogStack'
import { lockBodyScroll, unlockBodyScroll } from '../_dialogLayer'
import { CloseOutlined } from '../../common/antIcons'
import { mergeClass } from '../../common/merge'
import { resolveSemantic, type SemanticInput } from '../../common/semantic'
import Button from '../Button'
import {
  tourActionsClass, tourArrowClass, tourCloseClass, tourCoverClass, tourDescriptionClass, tourFooterClass, tourHeaderClass, tourHoleClass,
  tourIndicatorClass, tourIndicatorsClass, tourMaskClass, tourNextButtonClass, tourPrevButtonClass, tourSkipButtonClass, tourRootClass, tourSectionClass, tourTitleClass,
} from './styles'

export type TourSemanticSlot = 'root' | 'cover' | 'mask' | 'section' | 'footer' | 'actions' | 'indicator' | 'indicators' | 'header' | 'title' | 'description'
export type TourSemanticClassNames = Partial<Record<TourSemanticSlot, string>>
export type TourSemanticStyles = Partial<Record<TourSemanticSlot, JSX.CSSProperties>>
export interface TourSemanticInfo { props: TourProps }
/** antd nextButtonProps / prevButtonProps。 */
export interface TourButtonProps { children?: JSX.Element; onClick?: () => void; class?: string; style?: JSX.CSSProperties }
/** closable 对象：可带 closeIcon 与 aria-* 属性（透传到关闭按钮）。 */
export type TourClosable = boolean | ({ closeIcon?: JSX.Element } & { [aria: `aria-${string}`]: string | undefined })
export interface TourStep extends TourStepConfig {
  title?: JSX.Element
  description?: JSX.Element
  cover?: JSX.Element
  type?: 'default' | 'primary'
  nextButtonProps?: TourButtonProps
  prevButtonProps?: TourButtonProps
  closable?: TourClosable
  closeIcon?: JSX.Element | boolean
  class?: string
  style?: JSX.CSSProperties
  classNames?: TourSemanticClassNames
  styles?: TourSemanticStyles
  /** @deprecated 使用 `nextButtonProps.children`。 */
  nextText?: JSX.Element
  /** @deprecated 使用 `prevButtonProps.children`。 */
  previousText?: JSX.Element
}
export interface TourProps extends TourConfig<TourStep>, Omit<TourStepConfig, 'target'> {
  type?: 'default' | 'primary'
  /** 面板宽度，默认 520（max-width: fit-content）。扩展。 */
  width?: number | string
  /** 默认 1001。 */
  zIndex?: number
  closable?: TourClosable
  closeIcon?: JSX.Element | boolean
  /** Escape 关闭 + ←/→ 切换步骤，默认 true。 */
  keyboard?: boolean
  /** 点击遮罩关闭（扩展，默认 false）。 */
  maskClosable?: boolean
  /** 在操作区显示“跳过”（扩展，默认 false）。 */
  showSkip?: boolean
  skipText?: JSX.Element
  /** 指示点开关（扩展，默认 true；仅 steps > 1 时渲染）。 */
  showIndicators?: boolean
  /** @deprecated 使用 `nextButtonProps.children`。 */
  finishText?: JSX.Element
  indicatorsRender?: (current: number, total: number) => JSX.Element
  actionsRender?: (originNode: JSX.Element, info: { current: number; total: number }) => JSX.Element
  /** @deprecated 使用 `actionsRender`。 */
  footerRender?: (instance: TourIns<TourStep>) => JSX.Element
  classNames?: SemanticInput<TourSemanticClassNames, TourSemanticInfo>
  styles?: SemanticInput<TourSemanticStyles, TourSemanticInfo>
  class?: string
  style?: JSX.CSSProperties
}
export type { TourPlacement, TourCloseReason, TourIns, TourGap, TourMaskConfig } from 'upthrust-competence'

const LOCALE = { next: '下一步', previous: '上一步', finish: '结束导览', close: '关闭', skip: '跳过' }
const DEFAULT_FILL = 'rgba(0,0,0,0.5)'
const ARROW_HALF = 4
const editable = (target: EventTarget | null) => target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
const ariaOf = (value: object | null) => Object.fromEntries(Object.entries(value ?? {}).filter(([key]) => key.startsWith('aria-')))

const Tour = (providedProps: TourProps) => {
  const props = useComponentProps('Tour', providedProps)
  const machine = createTour(props)
  const [panel, setPanel] = createSignal<HTMLDivElement | undefined>(undefined, { ownedWrite: true })
  const layout = createTourPosition({
    open: machine.open, step: machine.step, panel,
    defaults: () => ({ placement: props.placement, gap: props.gap, radius: props.radius, arrow: props.arrow, scrollIntoViewOptions: props.scrollIntoViewOptions, scrollIntoView: props.scrollIntoView }),
  })
  const total = () => props.steps.length
  const step = (): TourStep => machine.step() ?? {}
  const type = () => step().type ?? props.type ?? 'default'
  const z = () => props.zIndex ?? 1001
  const isLast = () => machine.current() === total() - 1
  // rc-tour：mask 步骤级优先；对象形态提供 style / color。
  const maskValue = () => step().mask ?? props.mask ?? true
  const maskConfig = (): TourMaskConfig | undefined => { const m = maskValue(); return typeof m === 'object' ? m : undefined }
  const showMask = () => maskValue() !== false
  const disabledInteraction = () => step().disabledInteraction ?? props.disabledInteraction ?? false
  const closable = createMemo(() => tourClosable<JSX.Element>(step().closable, step().closeIcon, props.closable, props.closeIcon))
  const info = (): TourSemanticInfo => ({ props })
  const classNames = createMemo((): TourSemanticClassNames => {
    const own = resolveSemantic(props.classNames, info()), s = step().classNames ?? {}
    return Object.fromEntries([...new Set([...Object.keys(own), ...Object.keys(s)])].map(k => [k, mergeClass(own[k as TourSemanticSlot], s[k as TourSemanticSlot])]))
  })
  const styles = createMemo((): TourSemanticStyles => {
    const own = resolveSemantic(props.styles, info()), s = step().styles ?? {}
    return Object.fromEntries([...new Set([...Object.keys(own), ...Object.keys(s)])].map(k => [k, { ...own[k as TourSemanticSlot], ...s[k as TourSemanticSlot] }]))
  })
  const id = Math.random().toString(36).slice(2, 9)
  const titleId = `ut-tour-${id}-title`, descriptionId = `ut-tour-${id}-description`, maskId = `ut-tour-${id}-mask`
  const stackId = Symbol('tour')
  const topmost = () => {
    const stack = dialogStack(); let top = stack[0]
    for (const item of stack) if (!top || item.zIndex >= top.zIndex) top = item
    return top?.id === stackId
  }
  const modal = () => showMask() && (!layout.rect() || disabledInteraction())

  // 打开期间：注册对话栈（Escape 只关最上层）、锁 body 滚动（rc Portal autoLock）、←/→ 切换步骤、模态时约束焦点，关闭后还原焦点。
  createEffect(() => ({ open: machine.open(), z: z(), keyboard: props.keyboard !== false }), ({ open, z, keyboard }) => {
    if (!open || typeof document === 'undefined') return
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : undefined
    registerDialog({ id: stackId, zIndex: z, kind: 'tour', onEscape: () => { if (keyboard && untrack(closable) !== null) machine.close('escape') } })
    lockBodyScroll()
    const focus = (event: FocusEvent) => untrack(() => { if (modal() && topmost() && panel() && !panel()!.contains(event.target as Node)) panel()!.focus({ preventScroll: true }) })
    const key = (event: KeyboardEvent) => untrack(() => {
      if (!topmost()) return
      if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && keyboard && !editable(event.target)) {
        const current = machine.current()
        if (event.key === 'ArrowLeft' && current > 0) { event.preventDefault(); void machine.previous() }
        if (event.key === 'ArrowRight' && current < total() - 1) { event.preventDefault(); void machine.next() }
        return
      }
      if (event.key !== 'Tab' || !modal() || !panel()) return
      const nodes = [...panel()!.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')].filter(el => el.getClientRects().length)
      const first = nodes[0], last = nodes.at(-1)
      if (!first) { event.preventDefault(); panel()!.focus(); return }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel())) { event.preventDefault(); last!.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    })
    document.addEventListener('focusin', focus); document.addEventListener('keydown', key)
    return () => {
      unregisterDialog(stackId); unlockBodyScroll()
      document.removeEventListener('focusin', focus); document.removeEventListener('keydown', key)
      if (previous?.isConnected) previous.focus({ preventScroll: true })
    }
  })
  createEffect(() => ({ open: machine.open(), current: machine.current(), panel: panel() }), value => { if (value.open) value.panel?.focus({ preventScroll: true }) })

  const prev = () => { void machine.previous(); step().prevButtonProps?.onClick?.() }
  const next = () => { void machine.next(); step().nextButtonProps?.onClick?.() }
  const defaultActions = () => <>
    <Show when={props.showSkip}>
      <Button size="small" type="text" class={tourSkipButtonClass({ type: type() })} data-tour-part="skip" onClick={() => machine.close('skip')}>{props.skipText ?? LOCALE.skip}</Button>
    </Show>
    <Show when={machine.current() !== 0}>
      <Button size="small" type="default" disabled={machine.pending()} data-tour-part="prev"
        class={mergeClass(tourPrevButtonClass({ type: type() }), step().prevButtonProps?.class)} style={step().prevButtonProps?.style} onClick={prev}>
        {step().prevButtonProps?.children ?? step().previousText ?? LOCALE.previous}
      </Button>
    </Show>
    <Button size="small" type={type() === 'primary' ? 'default' : 'primary'} loading={machine.pending()} data-tour-part="next"
      class={mergeClass(tourNextButtonClass({ type: type() }), step().nextButtonProps?.class)} style={step().nextButtonProps?.style} onClick={next}>
      {step().nextButtonProps?.children ?? (isLast() ? props.finishText ?? LOCALE.finish : step().nextText ?? LOCALE.next)}
    </Button>
  </>
  const actions = () => props.footerRender ? props.footerRender(machine)
    : props.actionsRender ? props.actionsRender(defaultActions(), { current: machine.current(), total: total() })
    : defaultActions()
  const cover = (r: NonNullable<ReturnType<typeof layout.rect>>) => [
    { x: 0, y: 0, width: '100%', height: Math.max(r.top, 0) },
    { x: 0, y: 0, width: Math.max(r.left, 0), height: '100%' },
    { x: 0, y: r.top + r.height, width: '100%', height: `calc(100% - ${r.top + r.height}px)` },
    { x: r.left + r.width, y: 0, width: `calc(100% - ${r.left + r.width}px)`, height: '100%' },
  ]
  const arrowStyle = (): JSX.CSSProperties | undefined => {
    const a = layout.position().arrow
    if (!a) return undefined
    return { ...(a.side === 'left' || a.side === 'right' ? { top: `${a.y - ARROW_HALF}px` } : { left: `${a.x - ARROW_HALF}px` }), ...styles().section?.['background-color'] ? { 'background-color': styles().section!['background-color'] } : {} }
  }

  return <Portal><Show when={machine.open()}>
    {/* rc-tour Mask：有高亮区且未禁用交互时容器 pointer-events: none，由 4 块透明覆盖矩形拦截点击，镂空处可操作目标。 */}
    <div data-tour-part="mask" class={mergeClass(tourMaskClass, classNames().mask)}
      style={{ 'z-index': z(), 'pointer-events': layout.rect() && !disabledInteraction() ? 'none' : 'auto', ...(maskConfig()?.style as JSX.CSSProperties | undefined), ...styles().mask }}
      onClick={() => { if (props.maskClosable) machine.close('mask') }}>
      <Show when={showMask()}>
        <svg aria-hidden="true" style={{ width: '100%', height: '100%', display: 'block' }}>
          <defs><mask id={maskId}>
            <rect x="0" y="0" width="100vw" height="100vh" fill="white" />
            <Show when={layout.rect()}>{r => <rect data-tour-part="hole" class={tourHoleClass.join(' ')} x={r().left} y={r().top} rx={r().radius} width={r().width} height={r().height} fill="black" />}</Show>
          </mask></defs>
          <rect x="0" y="0" width="100%" height="100%" fill={maskConfig()?.color ?? DEFAULT_FILL} mask={`url(#${maskId})`} />
          <Show when={layout.rect()}>{r => <For each={cover(r())}>{c => <rect data-tour-part="cover-rect" fill="transparent" style={{ 'pointer-events': 'auto' }} x={c.x} y={c.y} width={c.width} height={c.height} />}</For>}</Show>
        </svg>
      </Show>
    </div>
    <div ref={setPanel} role="dialog" tabindex={-1} data-tour-part="root" data-tour-type={type()} data-tour-placement={layout.position().placement}
      aria-modal={modal() ? 'true' : 'false'} aria-labelledby={step().title != null ? titleId : undefined} aria-label={step().title != null ? undefined : '操作引导'}
      aria-describedby={step().description != null ? descriptionId : undefined} aria-busy={machine.pending() ? 'true' : 'false'}
      class={mergeClass(tourRootClass({ type: type() }), classNames().root, props.class, step().class)}
      style={{ width: typeof props.width === 'string' ? props.width : `${props.width ?? 520}px`, ...styles().root, ...props.style, ...step().style, left: `${layout.position().left}px`, top: `${layout.position().top}px`, 'z-index': z() }}>
      <Show when={layout.position().arrow}>{a => <div aria-hidden="true" data-tour-part="arrow" class={tourArrowClass({ type: type(), side: a().side })} style={arrowStyle()} />}</Show>
      <div data-tour-part="section" class={mergeClass(tourSectionClass({ type: type() }), classNames().section)} style={styles().section}>
        <Show when={closable()}>{c => <button type="button" data-tour-part="close" class={tourCloseClass({ type: type() })} aria-label={LOCALE.close} {...ariaOf(c())} onClick={() => machine.close('close')}>
          {c().closeIcon ?? <CloseOutlined />}
        </button>}</Show>
        <Show when={step().cover != null}><div data-tour-part="cover" class={mergeClass(tourCoverClass, classNames().cover)} style={styles().cover}>{step().cover}</div></Show>
        <Show when={step().title != null}>
          <div data-tour-part="header" class={mergeClass(tourHeaderClass, classNames().header)} style={styles().header}>
            <div id={titleId} data-tour-part="title" class={mergeClass(tourTitleClass, classNames().title)} style={styles().title}>{step().title}</div>
          </div>
        </Show>
        <Show when={step().description != null}><div id={descriptionId} data-tour-part="description" class={mergeClass(tourDescriptionClass, classNames().description)} style={styles().description}>{step().description}</div></Show>
        <div data-tour-part="footer" class={mergeClass(tourFooterClass, classNames().footer)} style={styles().footer}>
          <Show when={total() > 1 && props.showIndicators !== false}>
            <div data-tour-part="indicators" aria-live="polite" class={mergeClass(tourIndicatorsClass, classNames().indicators)} style={styles().indicators}>
              {props.indicatorsRender ? props.indicatorsRender(machine.current(), total())
                : <For each={props.steps}>{(_, index) => <span data-tour-part="indicator" data-tour-active={index() === machine.current() ? 'true' : undefined}
                  class={mergeClass(tourIndicatorClass({ state: `${type()}-${index() === machine.current() ? 'active' : 'idle'}` }), classNames().indicator)} style={styles().indicator} />}</For>}
            </div>
          </Show>
          <div data-tour-part="actions" class={mergeClass(tourActionsClass, classNames().actions)} style={styles().actions}>{actions()}</div>
        </div>
      </div>
    </div>
  </Show></Portal>
}
export default Tour
