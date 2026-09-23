import { ConfigPortal as Portal } from '../ConfigProvider/Portal'
import { useComponentProps } from '../ConfigProvider/context'
import { Component, For, Show, createEffect, createSignal, createUniqueId, merge, untrack } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import {
  createAutoComplete,
  createOwnerCleanup,
  createTrigger,
  type AutoCompleteOption,
} from 'upthrust-competence'
import type { SizeType } from '../../common/type'
import { useFormItem } from '../Input/context'
import {
  autoCompleteDropdownClass,
  autoCompleteEmptyClass,
  autoCompleteOptionWrapClass,
} from './styles'

export type { AutoCompleteOption }

export interface AutoCompleteProps {
  /** Controlled text value. */
  value?: string
  defaultValue?: string
  /** The suggestion pool (client-filtered) or the current server list. */
  options?: AutoCompleteOption[]
  disabled?: boolean
  /** (input, option) => boolean; false disables client filtering. */
  filterOption?: ((input: string, option: AutoCompleteOption) => boolean) | false
  placeholder?: string
  size?: SizeType
  status?: 'error' | 'warning'
  /** Controlled dropdown open. */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  id?: string
  name?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  class?: string
  style?: JSX.CSSProperties
  onChange?: (value: string) => void
  onSelect?: (value: string, option: AutoCompleteOption) => void
  onSearch?: (value: string) => void
  onFocus?: (e: FocusEvent) => void
  onBlur?: (e: FocusEvent) => void
  ref?: (el: HTMLInputElement) => void
}

/**
 * AutoComplete — the antd-style text input with suggestions.
 *
 * COMPOSITION: the headless createAutoComplete owns the text buffer (IME
 * gated), the filtered suggestions and the active-row keyboard navigation —
 * the same contract as Select minus the selection store (the value is free
 * text). The dropdown layer is createTrigger. This layer renders a plain
 * Input frame and the suggestion listbox.
 */
const AutoComplete: Component<AutoCompleteProps> = providedProps => {
  const rawProps = useComponentProps('AutoComplete', providedProps)
  const props = merge({}, rawProps)

  const form = useFormItem({
    get value() { return props.value },
    get onChange() { return props.onChange ? (value: string) => props.onChange?.(value) : undefined },
    get disabled() { return props.disabled },
    get id() { return props.id },
    get size() { return props.size },
    get status() { return props.status },
  })

  const resolvedSize = () => props.size ?? form.size() ?? 'middle'
  const resolvedStatus = () => form.status()
  const resolvedDisabled = () => form.disabled()
  // Created ONCE (the createMemo-wraps-machine pitfall — see Select).
  const machine = createAutoComplete({
    get value() { return form.value() as string | undefined },
    get defaultValue() { return props.defaultValue },
    get options() { return props.options },
    get disabled() { return resolvedDisabled() },
    get filterOption() { return props.filterOption },
    get open() { return props.open },
    get defaultOpen() { return props.defaultOpen },
    onChange: value => {
      if (props.onChange) props.onChange(value)
      else form.onChange(value)
    },
    get onSelect() { return props.onSelect },
    get onSearch() { return props.onSearch },
  })

  const trigger = createTrigger({
    get open() { return props.open },
    get defaultOpen() { return props.defaultOpen },
    get disabled() { return resolvedDisabled() },
    action: 'focus',
    placement: 'bottomLeft',
    offset: 4,
    get onOpenChange() { return props.onOpenChange },
  })

  const m = () => machine
  const open = () => !resolvedDisabled() && trigger.open()
  const listId = `autocomplete-list-${createUniqueId()}`
  const activeIndex = () => machine.suggestions().findIndex(option => option.value === machine.activeValue())

  // trigger.open mirrors into the machine (open re-anchors active).
  createEffect(() => open(), (isOpen) => {
    machine.setOpen(isOpen)
  })

  const inputRef: { current?: HTMLInputElement } = {}
  const [inputWidth, setInputWidth] = createSignal(0, { ownedWrite: true })
  const onOwnerCleanup = createOwnerCleanup()
  let sizeObserver: ResizeObserver | undefined
  const measureInputWidth = (el: HTMLInputElement = inputRef.current!) => {
    if (el) setInputWidth(el.getBoundingClientRect().width)
  }
  const setInputRef = (el: HTMLInputElement) => {
    inputRef.current = el
    sizeObserver?.disconnect()
    const measure = () => measureInputWidth(el)
    measure()
    if (typeof ResizeObserver !== 'undefined') {
      sizeObserver = new ResizeObserver(measure)
      sizeObserver.observe(el)
    }
    untrack(() => props.ref?.(el))
  }
  onOwnerCleanup(() => sizeObserver?.disconnect())

  createEffect(() => m().value(), value => {
    const next = value ?? ''
    if (inputRef.current && inputRef.current.value !== next) inputRef.current.value = next
  })

  createEffect(() => [open(), activeIndex()] as const, ([visible, index]) => {
    if (!visible || index < 0) return
    const row = document.getElementById(`${listId}-option-${index}`)
    const list = row?.parentElement
    if (!row || !list) return
    if (row.offsetTop < list.scrollTop) list.scrollTop = row.offsetTop
    else if (row.offsetTop + row.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = row.offsetTop + row.offsetHeight - list.clientHeight
    }
  })

  const handleKeyDown = (e: KeyboardEvent) => {
    const mm = m()
    if (resolvedDisabled() || e.isComposing || e.keyCode === 229 || mm.isComposing()) return
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (!open()) { trigger.setOpen(true); return }
        mm.moveActive(1)
        return
      case 'ArrowUp':
        e.preventDefault()
        if (open()) mm.moveActive(-1)
        return
      case 'Enter':
        if (open() && mm.activeValue() !== undefined) {
          e.preventDefault()
          mm.commitActive()
          trigger.setOpen(false)
        }
        return
      case 'Escape':
        if (open()) {
          e.preventDefault()
          trigger.setOpen(false)
        }
        return
    }
  }

  // Browsers may emit a final input after compositionend with the same text.
  let composedText: string | undefined
  const handleInput = (e: Event) => {
    if (resolvedDisabled()) return
    const text = (e.target as HTMLInputElement).value
    if (composedText === text) { composedText = undefined; return }
    composedText = undefined
    m().setInputText(text)
    measureInputWidth()
    trigger.setOpen(true)
  }

  const handleSelect = (option: AutoCompleteOption) => {
    if (resolvedDisabled() || option.disabled) return
    m().selectOption(option)
    trigger.setOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div class={twMerge('relative inline-flex w-full', props.class)} style={props.style}>
      <input
        ref={el => { trigger.triggerRef(el); setInputRef(el) }}
        id={form.id()}
        name={props.name}
        type="text"
        role="combobox"
        aria-label={props['aria-label']}
        aria-labelledby={props['aria-labelledby']}
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-expanded={open() ? 'true' : 'false'}
        aria-controls={open() ? listId : undefined}
        aria-activedescendant={open() && activeIndex() >= 0 ? `${listId}-option-${activeIndex()}` : undefined}
        aria-invalid={resolvedStatus() === 'error' ? 'true' : undefined}
        value={m().value()}
        autocomplete="off"
        class={twMerge(
          'w-full min-w-0 bg-surface rounded border border-solid border-outline transition-upthrust',
          'text-on-surface placeholder:text-on-surface/25 outline-none',
          'hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/10',
          resolvedSize() === 'small' ? 'h-control-sm text-[12px] px-[7px]' : '',
          resolvedSize() === 'middle' ? 'h-control text-[14px] px-[11px]' : '',
          resolvedSize() === 'large' ? 'h-control-lg text-[16px] px-[11px]' : '',
          resolvedStatus() === 'error' ? '!border-error hover:!border-error focus:!border-error focus:!ring-error/8' : '',
          resolvedStatus() === 'warning' ? '!border-[#faad14] hover:!border-[#faad14] focus:!border-[#faad14] focus:!ring-[#faad14]/10' : '',
          resolvedDisabled() ? '!bg-on-surface/4 !text-on-surface/25 !border-on-surface/15 cursor-not-allowed hover:!border-on-surface/15 focus:!ring-transparent' : '',
        )}
        placeholder={props.placeholder}
        disabled={resolvedDisabled()}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={e => { measureInputWidth(); m().notifyFocus(); props.onFocus?.(e) }}
        onBlur={e => { m().notifyBlur(); props.onBlur?.(e) }}
        onCompositionStart={() => { composedText = undefined; m().notifyCompositionStart() }}
        onCompositionEnd={e => {
          if (!m().isComposing()) return
          composedText = e.currentTarget.value
          m().setInputText(composedText)
          m().notifyCompositionEnd()
          trigger.setOpen(true)
        }}
      />
      <Portal>
        <Show when={trigger.mounted()}>
          <div
            ref={(el) => { trigger.layerRef(el) }}
            class={autoCompleteDropdownClass({ visible: open(), placement: trigger.actualPlacement() })}
            style={{ ...trigger.layerStyle(), width: inputWidth() > 0 ? `${inputWidth()}px` : undefined }}
            role="listbox"
            id={listId}
            aria-label={props['aria-label'] ?? props.placeholder ?? '建议'}
            aria-hidden={!open() ? 'true' : undefined}
            onMouseDown={e => e.preventDefault()}
            tabindex={-1}
          >
            <Show
              when={m().suggestions().length > 0}
              fallback={<div class={autoCompleteEmptyClass()}>无匹配结果</div>}
            >
              <For each={m().suggestions()}>
                {(option, index) => (
                  <div
                    class={autoCompleteOptionWrapClass({
                      active: m().activeValue() === option.value,
                      selected: m().value() === (option.label ?? option.value),
                      disabled: option.disabled,
                    })}
                    role="option"
                    id={`${listId}-option-${index()}`}
                    aria-selected={m().activeValue() === option.value ? 'true' : 'false'}
                    aria-disabled={option.disabled ? 'true' : 'false'}
                    onClick={() => handleSelect(option)}
                    onMouseMove={() => m().setActiveValue(option.value)}
                  >
                    <span class="truncate">{option.label ?? option.value}</span>
                  </div>
                )}
              </For>
            </Show>
          </div>
        </Show>
      </Portal>
    </div>
  )
}

export default AutoComplete
