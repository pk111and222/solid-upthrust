import { useComponentProps } from '../ConfigProvider/context'
import { Component, Show, createEffect, createMemo, createSignal, merge } from 'solid-js'
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

  const [innerValue, setInnerValue] = createSignal(props.defaultValue ?? '')
  const isControlled = () => props.value !== undefined || form.value() !== undefined
  const currentValue = () => (props.value !== undefined ? props.value : (form.value() ?? (isControlled() ? '' : innerValue())) as string)

  const [composing, setComposing] = createSignal(false)

  const handleChange = (e: Event) => {
    const target = e.target as HTMLTextAreaElement
    if (!isControlled()) setInnerValue(target.value)
    if (!composing()) form.onChange(target.value, e)
  }


  const handleCompositionEnd = (e: CompositionEvent) => {
    setComposing(false)
    const target = e.currentTarget as HTMLTextAreaElement
    if (!isControlled()) setInnerValue(target.value)
    form.onChange(target.value, e)
  }

  let textareaEl: HTMLTextAreaElement | undefined
  const [autoSizeStyle, setAutoSizeStyle] = createSignal<JSX.CSSProperties>({})

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
    if (!node || !props.autoSize) return

    if (!mirrorEl) {
      mirrorEl = document.createElement('textarea')
      mirrorEl.setAttribute('tab-index', '-1')
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
      parseFloat(style.getPropertyValue('padding-bottom')) +
      parseFloat(style.getPropertyValue('padding-top'))
    const borderSize =
      parseFloat(style.getPropertyValue('border-bottom-width')) +
      parseFloat(style.getPropertyValue('border-top-width'))
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
    let overflowY: 'hidden' | undefined
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
        overflowY = height > maxHeight ? undefined : 'hidden'
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
    () => [currentValue(), props.autoSize, props.rows] as const,
    () => { measure() },
  )

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
      <span class="text-on-surface/25 tabular-nums whitespace-nowrap">
        {text}
      </span>
    )
  })

  const handleClear = (e: MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!isControlled()) setInnerValue('')
    form.onChange('', e)
    textareaEl?.focus()
  }

  const autoSizeOn = () => !!props.autoSize

  return (
    <span class={twMerge('relative inline-flex w-full', props.class)} style={props.style}>
      <textarea
        ref={el => { textareaEl = el; props.ref?.(el) }}
        id={form.id()}
        name={props.name}
        value={currentValue()}
        placeholder={props.placeholder}
        disabled={resolvedDisabled()}
        readonly={props.readonly || undefined}
        maxlength={props.maxLength ?? undefined}
        rows={autoSizeOn() ? undefined : props.rows}
        class={textAreaClass({
          status: resolvedStatus(),
          disabled: !!resolvedDisabled(),
          autoSize: autoSizeOn(),
        })}
        style={autoSizeOn() ? { ...autoSizeStyle(), ...props.style } : props.style}
        onInput={handleChange}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        onCompositionStart={() => setComposing(true)}
        onCompositionEnd={handleCompositionEnd}
        onKeyUp={e => { if (e.key === 'Enter') props.onPressEnter?.(e) }}
      />
      <Show when={showClear() || showCountOn()}>
        <span class="absolute right-[11px] bottom-[4px] flex items-center gap-[4px]">
          <Show when={!!props.allowClear}>
            <span
              class={clearIconClass({ visible: showClear() })}
              onClick={handleClear}
              role="button"
              aria-label="clear"
              tabindex={-1}
            >
              <span class="i-mdi-close-circle-outline text-[12px]" />
            </span>
          </Show>
          {countNode()}
        </span>
      </Show>
    </span>
  )
}

export default TextArea
