import { createInput } from 'upthrust-competence'
import { useComponentProps } from '../ConfigProvider/context'
import { Component, Show, createEffect, createMemo, createSignal, merge, onCleanup } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import { useFormItem } from './context'
import {
  clearIconClass,
  textAreaClass,
} from './styles'

export interface TextAreaProps {
  value?: string
  defaultValue?: string
  onChange?: (value: string, event?: Event) => void
  placeholder?: string
  disabled?: boolean
  /** Fixed rows when autoSize is off (default 3, antd parity). */
  rows?: number
  /** Grow with content; { minRows, maxRows } clamps the growth. */
  autoSize?: boolean | { minRows?: number; maxRows?: number }
  maxLength?: number
  showCount?: boolean | { formatter?: (props: { value: string; count: number; maxLength?: number }) => string }
  allowClear?: boolean
  status?: 'error' | 'warning'
  id?: string
  name?: string
  readonly?: boolean
  class?: string
  style?: JSX.CSSProperties
  onFocus?: JSX.EventHandler<HTMLTextAreaElement, FocusEvent>
  onBlur?: JSX.EventHandler<HTMLTextAreaElement, FocusEvent>
  onPressEnter?: (e: KeyboardEvent) => void
  onResize?: (size: { width: number; height: number }) => void
  ref?: (el: HTMLTextAreaElement) => void
}

/**
 * Input.TextArea — antd-aligned multiline input.
 *
 * autoSize uses the react-textarea-autosize measurement algorithm: a hidden
 * mirror textarea copies the sizing styles, its scrollHeight becomes the
 * content height, min/maxRows clamp it via a single-row measurement. The
 * mirror lives lazily on document.body and is reused across renders.
 */
const TextArea: Component<TextAreaProps> = providedProps => {
  const rawProps = useComponentProps('TextArea', providedProps)
  const props = merge({ rows: 3 }, rawProps)

  const form = useFormItem({
    get value() { return props.value },
    get onChange() { return props.onChange },
    get disabled() { return props.disabled },
    get id() { return props.id },
    get status() { return props.status },
  })

  const state = createInput({
    get value() { const v = form.value(); return v === undefined ? undefined : String(v ?? '') },
    get defaultValue() { return props.defaultValue },
    get disabled() { return form.disabled() },
    get readonly() { return props.readonly },
    onChange: (value, event) => form.onChange(value, event),
  })
  const currentValue = state.value
  const handleChange = (e: Event) => state.input((e.currentTarget as HTMLTextAreaElement).value, e)
  const handleCompositionEnd = (e: CompositionEvent & { currentTarget: HTMLTextAreaElement; target: Element }) => {
    state.compositionEnd(e.currentTarget.value, e)

  }

  let textareaEl: HTMLTextAreaElement | undefined
  const [autoSizeStyle, setAutoSizeStyle] = createSignal<JSX.CSSProperties>({}, { ownedWrite: true })

  // ---- autoSize measurement ---------------------------------------------
  let mirrorEl: HTMLTextAreaElement | undefined
  const SIZING_STYLE = [
    'letter-spacing', 'line-height', 'padding-top', 'padding-bottom',
    'font-family', 'font-weight', 'font-size', 'font-variant',
    'text-rendering', 'text-transform', 'width', 'text-indent',
    'padding-left', 'padding-right', 'border-width', 'box-sizing',
    'word-break', 'white-space',
  ]

  const measure = () => {
    const node = textareaEl
    if (!node || !props.autoSize) { mirrorEl?.remove(); mirrorEl = undefined; setAutoSizeStyle({}); return }

    if (!mirrorEl) {
      mirrorEl = document.createElement('textarea')
      mirrorEl.setAttribute('tabindex', '-1')
      mirrorEl.setAttribute('aria-hidden', 'true')
      mirrorEl.style.cssText =
        'min-height:0 !important; max-height:none !important; height:0 !important;' +
        'visibility:hidden !important; overflow:hidden !important;' +
        'position:absolute !important; z-index:-1000 !important; top:0 !important; right:0 !important;' +
        'pointer-events:none !important;'
      document.body.appendChild(mirrorEl)
    }

    const style = window.getComputedStyle(node)
    const boxSizing = style.getPropertyValue('box-sizing')
    const paddingSize =
      (parseFloat(style.getPropertyValue('padding-bottom')) || 0) +
      (parseFloat(style.getPropertyValue('padding-top')) || 0)
    const borderSize =
      (parseFloat(style.getPropertyValue('border-bottom-width')) || 0) +
      (parseFloat(style.getPropertyValue('border-top-width')) || 0)
    const sizingStyle = SIZING_STYLE.map(name => `${name}:${style.getPropertyValue(name)}`).join(';')

    mirrorEl.setAttribute('style', `${mirrorEl.style.cssText};${sizingStyle}`)
    if (node.getAttribute('wrap')) {
      mirrorEl.setAttribute('wrap', node.getAttribute('wrap')!)
    } else {
      mirrorEl.removeAttribute('wrap')
    }

    mirrorEl.value = node.value || node.placeholder || ''
    let height = mirrorEl.scrollHeight
    if (boxSizing === 'border-box') height += borderSize
    else if (boxSizing === 'content-box') height -= paddingSize

    let minHeight: number | undefined
    let maxHeight: number | undefined
    let overflowY: 'hidden' | 'auto' = 'hidden'
    const conf = typeof props.autoSize === 'object' ? props.autoSize : {}
    const minRows = conf.minRows ?? null
    const maxRows = conf.maxRows ?? null

    if (minRows !== null || maxRows !== null) {
      mirrorEl.value = ' '
      const singleRowHeight = mirrorEl.scrollHeight - paddingSize
      if (minRows !== null) {
        minHeight = singleRowHeight * minRows
        if (boxSizing === 'border-box') minHeight = minHeight + paddingSize + borderSize
        height = Math.max(minHeight, height)
      }
      if (maxRows !== null) {
        maxHeight = singleRowHeight * maxRows
        if (boxSizing === 'border-box') maxHeight = maxHeight + paddingSize + borderSize
        overflowY = height > maxHeight ? 'auto' : 'hidden'
        height = Math.min(maxHeight, height)
      }
    }

    setAutoSizeStyle({
      height: `${height}px`,
      'overflow-y': overflowY,
      resize: 'none',
      ...(minHeight !== undefined ? { 'min-height': `${minHeight}px` } : {}),
      ...(maxHeight !== undefined ? { 'max-height': `${maxHeight}px` } : {}),
    })
    props.onResize?.({ width: node.offsetWidth, height })
  }

  // Re-measure on value / autoSize config change. Dual-fn form (Solid 2 rc
  // has no `on` helper).
  createEffect(
    () => ({ value: currentValue(), revision: state.revision(), autoSize: props.autoSize, rows: props.rows, placeholder: props.placeholder, style: props.style }),
    ({ value }) => {
      if (textareaEl && textareaEl.value !== value) textareaEl.value = value
      measure()
    },
  )

  let observer: ResizeObserver | undefined
  onCleanup(() => { observer?.disconnect(); mirrorEl?.remove() })
  const setRef = (el: HTMLTextAreaElement) => {
    textareaEl = el
    props.ref?.(el)
    if (typeof ResizeObserver !== 'undefined') {
      let width = el.getBoundingClientRect().width
      observer = new ResizeObserver(() => {
        const next = el.getBoundingClientRect().width
        if (next !== width) { width = next; measure() }
      })
      observer.observe(el)
    }
  }

  const resolvedStatus = () => form.status()
  const resolvedDisabled = () => form.disabled()

  const showClear = createMemo(
    () => !!props.allowClear && !!currentValue() && !resolvedDisabled() && !props.readonly,
  )

  const showCountOn = () => props.showCount !== undefined && props.showCount !== false

  const countNode = createMemo<JSX.Element>(() => {
    if (!showCountOn()) return undefined
    const value = currentValue() ?? ''
    const formatter = typeof props.showCount === 'object' ? props.showCount.formatter : undefined
    const text = formatter
      ? formatter({ value, count: value.length, maxLength: props.maxLength })
      : props.maxLength !== undefined
        ? `${value.length} / ${props.maxLength}`
        : String(value.length)
    return (
      <span class="mt-1 self-end text-on-surface/45 tabular-nums whitespace-nowrap">
        {text}
      </span>
    )
  })

  const handleClear = (e: MouseEvent | KeyboardEvent) => {
    if (!showClear()) return
    e.stopPropagation()
    e.preventDefault()
    state.clear(e)
    textareaEl?.focus()
  }

  const autoSizeOn = () => !!props.autoSize

  return (
    <span class={twMerge('relative inline-flex flex-col w-full', props.class)} style={props.style}>
      <span class="relative inline-flex w-full">
      <textarea
        ref={setRef}
        id={form.id()}
        name={props.name}
        aria-invalid={resolvedStatus() === 'error' ? 'true' : undefined}
        value={currentValue()}
        placeholder={props.placeholder}
        disabled={resolvedDisabled()}
        readonly={props.readonly || undefined}
        maxlength={props.maxLength ?? undefined}
        rows={autoSizeOn() ? undefined : props.rows}
        class={twMerge(textAreaClass({
          status: resolvedStatus(),
          disabled: !!resolvedDisabled(),
          autoSize: autoSizeOn(),
        }), props.allowClear ? 'pr-7' : undefined)}
        style={autoSizeOn() ? { ...autoSizeStyle(), ...props.style } : props.style}
        onInput={handleChange}
        onFocus={e => props.onFocus?.(e)}
        onBlur={e => props.onBlur?.(e)}
        onCompositionStart={state.compositionStart}
        onCompositionEnd={handleCompositionEnd}
        onKeyDown={e => { if (e.key === 'Enter' && state.canEnter(e)) props.onPressEnter?.(e) }}
      />
      <Show when={showClear()}>
            <span
              class={twMerge(clearIconClass({ visible: true }), "absolute right-[11px] top-[8px]")}
              onClick={handleClear}
              role="button"
              aria-label="clear"
              tabindex={0}
              onMouseDown={e => e.preventDefault()}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClear(e) } }}
            >
              <span class="i-mdi-close-circle-outline text-[12px]" />
            </span>
      </Show>
      </span>
      {countNode()}
    </span>
  )
}

export default TextArea
