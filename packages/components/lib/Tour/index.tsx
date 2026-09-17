import { ConfigPortal as Portal } from '../ConfigProvider/Portal'
import { useComponentProps } from '../ConfigProvider/context'
import { createEffect, createSignal, Show, untrack } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { createTour, createTourPosition, type TourConfig, type TourStepConfig, type TourIns } from 'upthrust-competence'
import { twMerge } from 'tailwind-merge'
import { dialogStack, registerDialog, unregisterDialog } from '../_dialogStack'
import { tourPanelClass, tourButtonClass, tourCloseClass, tourCloseIcon } from './styles'
export interface TourStep extends TourStepConfig {
  title?: JSX.Element
  description?: JSX.Element
  cover?: JSX.Element
  type?: 'default' | 'primary'
  nextText?: JSX.Element
  previousText?: JSX.Element
}
export interface TourProps extends TourConfig<TourStep>, Omit<TourStepConfig, 'target'> {
  type?: 'default' | 'primary'
  width?: number
  zIndex?: number
  closable?: boolean
  keyboard?: boolean
  maskClosable?: boolean
  showSkip?: boolean
  showIndicators?: boolean
  finishText?: JSX.Element
  skipText?: JSX.Element
  indicatorsRender?: (current: number, total: number) => JSX.Element
  footerRender?: (instance: TourIns<TourStep>) => JSX.Element
  class?: string
  style?: JSX.CSSProperties
}
export type { TourPlacement, TourCloseReason, TourIns } from 'upthrust-competence'
const Tour = (providedProps: TourProps) => {
  const props = useComponentProps('Tour', providedProps)
  const machine = createTour(props)
  const [panel, setPanel] = createSignal<HTMLDivElement | undefined>(undefined, { ownedWrite: true })
  const layout = createTourPosition({ open: machine.open, step: machine.step, panel, defaults: () => ({ placement: props.placement, gap: props.gap, scrollIntoView: props.scrollIntoView }) })
  const masked = () => (machine.step()?.mask ?? props.mask) !== false
  const blocked = () => (machine.step()?.disabledInteraction ?? props.disabledInteraction) !== false
  const modal = () => masked() && blocked()
  const titleId = `tour-title-${Math.random().toString(36).slice(2)}`
  const descriptionId = `${titleId}-description`
  const stackId = Symbol('tour')
  const topmost = () => {
    const stack = dialogStack(); let top = stack[0]
    for (const item of stack) if (!top || item.zIndex >= top.zIndex) top = item
    return top?.id === stackId
  }
  createEffect(() => ({ open: machine.open(), z: props.zIndex ?? 1100, keyboard: props.keyboard }), ({ open, z, keyboard }) => {
    if (!open || typeof document === 'undefined') return
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : undefined
    registerDialog({ id: stackId, zIndex: z, onEscape: () => { if (keyboard !== false) machine.close('escape') } })
    const focus = (event: FocusEvent) => untrack(() => { if (modal() && topmost() && panel() && !panel()!.contains(event.target as Node)) panel()!.focus({ preventScroll: true }) })
    const key = (event: KeyboardEvent) => untrack(() => {
      if (event.key !== 'Tab' || !modal() || !topmost() || !panel()) return
      const nodes = [...panel()!.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')].filter(el => el.getClientRects().length)
      const first = nodes[0], last = nodes.at(-1)
      if (!first) { event.preventDefault(); panel()!.focus(); return }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel())) { event.preventDefault(); last!.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    })
    document.addEventListener('focusin', focus); document.addEventListener('keydown', key)
    return () => { unregisterDialog(stackId); document.removeEventListener('focusin', focus); document.removeEventListener('keydown', key); if (previous?.isConnected) previous.focus({ preventScroll: true }) }
  })
  createEffect(() => ({ open: machine.open(), current: machine.current(), panel: panel() }), value => { if (value.open) value.panel?.focus({ preventScroll: true }) })
  const path = () => {
    const rect = layout.rect()
    if (!rect) return 'M0 0 H100000 V100000 H0 Z'
    const { left: x, top: y, width: w, height: h } = rect
    const r = Math.min(Math.max(0, machine.step()?.radius ?? props.radius ?? 6), w / 2, h / 2)
    return `M0 0 H100000 V100000 H0 Z M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${y + r} Q${x} ${y} ${x + r} ${y} Z`
  }
  return <Portal><Show when={machine.open()}>
    <Show when={masked()}><svg aria-hidden="true" class="fixed inset-0 w-full h-full" style={{ 'z-index': props.zIndex ?? 1100, 'pointer-events': 'none' }}>
      <path d={path()} fill="rgba(0,0,0,0.48)" fill-rule="evenodd" style={{ 'pointer-events': 'auto' }} onClick={() => { if (props.maskClosable) machine.close('mask') }} />
    </svg></Show>
    <Show when={layout.rect()}>{rect => <div aria-hidden="true" class="fixed box-border border-2 border-solid border-primary rounded" style={{ left: `${rect().left}px`, top: `${rect().top}px`, width: `${rect().width}px`, height: `${rect().height}px`, 'border-radius': `${machine.step()?.radius ?? props.radius ?? 6}px`, 'z-index': props.zIndex ?? 1100, 'pointer-events': blocked() ? 'auto' : 'none' }} />}</Show>
    <div ref={setPanel} role="dialog" aria-modal={modal() ? 'true' : 'false'} aria-labelledby={machine.step()?.title ? titleId : undefined} aria-label={machine.step()?.title ? undefined : '操作引导'} aria-describedby={descriptionId} aria-busy={machine.pending() ? 'true' : 'false'} tabindex={-1}
      class={twMerge(tourPanelClass({ type: machine.step()?.type ?? props.type ?? 'default' }), props.class)}
      style={{ ...props.style, width: `min(${props.width ?? 360}px, calc(100vw - 16px))`, left: `${layout.position().left}px`, top: `${layout.position().top}px`, 'z-index': (props.zIndex ?? 1100) + 1 }}>
      <Show when={props.closable !== false}><button type="button" class={tourCloseClass} aria-label="关闭引导" onClick={() => machine.close('close')}><span class={tourCloseIcon} /></button></Show>
      <Show when={machine.step()?.cover}><div class="overflow-hidden rounded-t-lg">{machine.step()?.cover}</div></Show>
      <div class="p-4"><Show when={machine.step()?.title}><h3 id={titleId} class="m-0 pr-7 text-[16px] font-semibold">{machine.step()?.title}</h3></Show>
        <div id={descriptionId} class="mt-2 text-[14px] leading-relaxed">{machine.step()?.description}</div>
        <div class="mt-4 flex items-center justify-between gap-3 flex-wrap">
          <Show when={props.showIndicators !== false}><div aria-live="polite" class="text-[12px] opacity-80">{props.indicatorsRender?.(machine.current(), props.steps.length) ?? `${machine.current() + 1} / ${props.steps.length}`}</div></Show>
          <Show when={props.footerRender} fallback={<div class="flex items-center gap-2 ml-auto">
            <Show when={props.showSkip !== false}><button type="button" class={twMerge(tourButtonClass, 'border-transparent')} onClick={() => machine.close('skip')}>{props.skipText ?? '跳过'}</button></Show>
            <Show when={machine.current() > 0}><button type="button" class={tourButtonClass} disabled={machine.pending()} onClick={() => { void machine.previous() }}>{machine.step()?.previousText ?? '上一步'}</button></Show>
            <button type="button" class={twMerge(tourButtonClass, 'font-semibold')} disabled={machine.pending()} onClick={() => { void machine.next() }}>{machine.pending() ? '请稍候…' : machine.current() === props.steps.length - 1 ? props.finishText ?? '完成' : machine.step()?.nextText ?? '下一步'}</button>
          </div>}>{props.footerRender?.(machine)}</Show>
        </div>
      </div>
    </div>
  </Show></Portal>
}
export default Tour
