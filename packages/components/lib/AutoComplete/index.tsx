import { ConfigPortal as Portal } from '../ConfigProvider/Portal'
import { useComponentProps } from '../ConfigProvider/context'
import { Component, For, Show, createEffect, merge } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import {
  createAutoComplete,
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
    get onChange() { return props.onChange },
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
    get onChange() { return props.onChange },
    get onSelect() { return props.onSelect },
    get onSearch() { return props.onSearch },
    get onBlur() { return props.onBlur ? () => props.onBlur?.(undefined as unknown as FocusEvent) : undefined },
    get onFocus() { return props.onFocus ? () => props.onFocus?.(undefined as unknown as FocusEvent) : undefined },
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
  const open = () => trigger.open()

  // trigger.open mirrors into the machine (open re-anchors active).
  createEffect(() => open(), (isOpen) => {
    machine.setOpen(isOpen)
  })

  const inputRef: { current?: HTMLInputElement } = {}
  const setInputRef = (el: HTMLInputElement) => {
    inputRef.current = el
    props.ref?.(el)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    const mm = m()
    if (resolvedDisabled()) return
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

  const handleInput = (e: Event) => {
    m().setInputText((e.target as HTMLInputElement).value)
  }

  const handleSelect = (option: AutoCompleteOption) => {
    if (option.disabled) return
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
        value={m().value()}
        placeholder={props.placeholder}
        disabled={resolvedDisabled()}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={e => { m().notifyFocus(); props.onFocus?.(e) }}
        onBlur={e => { m().notifyBlur(); props.onBlur?.(e) }}
        onCompositionStart={() => m().notifyCompositionStart()}
        onCompositionEnd={() => m().notifyCompositionEnd()}
      />
      <Portal>
        <Show when={trigger.mounted()}>
          <div
            ref={(el) => { trigger.layerRef(el) }}
            class={autoCompleteDropdownClass({ visible: open(), placement: trigger.actualPlacement() })}
            style={trigger.layerStyle()}
            role="listbox"
            tabindex={-1}
          >
            <Show
              when={m().suggestions().length > 0}
              fallback={<div class={autoCompleteEmptyClass()}>无匹配结果</div>}
            >
              <For each={m().suggestions()}>
                {option => (
                  <div
                    class={autoCompleteOptionWrapClass({
                      active: m().activeValue() === option.value,
                      selected: m().value() === (option.label ?? option.value),
                      disabled: option.disabled,
                    })}
                    role="option"
                    aria-selected={m().activeValue() === option.value ? 'true' : 'false'}
                    aria-disabled={option.disabled ? 'true' : 'false'}
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => m().setActiveValue(option.value)}
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
