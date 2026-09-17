import { ConfigPortal as Portal } from '../ConfigProvider/Portal'
import { useComponentProps } from '../ConfigProvider/context'
import { Component, For, Show, createEffect, createMemo, merge } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import {
  createMentions,
  createTrigger,
  type MentionOption,
} from 'upthrust-competence'
import { useFormItem } from '../Input/context'
import { textAreaClass } from '../Input/styles'
import {
  mentionsDropdownClass,
  mentionsEmptyClass,
  mentionsOptionAvatarClass,
  mentionsOptionWrapClass,
} from './styles'

export type { MentionOption }

export interface MentionsProps {
  /** Controlled text value. */
  value?: string
  defaultValue?: string
  /** The suggestion pool. */
  options?: MentionOption[]
  /** Trigger prefix. Default '@'. */
  prefix?: string
  /** Word characters that may continue a mention token after the prefix. */
  split?: string
  disabled?: boolean
  /** (input, option) => boolean; false disables client filtering. */
  filterOption?: ((input: string, option: MentionOption) => boolean) | false
  placeholder?: string
  /** Fixed rows for the textarea. Default 3. */
  rows?: number
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
  onSelect?: (option: MentionOption, prefix: string) => void
  onSearch?: (text: string, prefix: string) => void
  onFocus?: (e: FocusEvent) => void
  onBlur?: (e: FocusEvent) => void
  ref?: (el: HTMLTextAreaElement) => void
}

/**
 * Mentions — the antd-style @-mention textarea.
 *
 * COMPOSITION: the headless createMentions owns the text buffer (IME
 * gated), caret-aware trigger detection ('@token' under the caret via
 * parseTrigger), query filtering, active-row navigation and the
 * token-replacement insertion. The dropdown layer is createTrigger; the
 * open state is DERIVED (dropdown follows trigger activity — no manual
 * open management). This layer renders a TextArea frame + the suggestion
 * listbox.
 */
const Mentions: Component<MentionsProps> = providedProps => {
  const rawProps = useComponentProps('Mentions', providedProps)
  const props = merge({ rows: 3 }, rawProps)

  const form = useFormItem({
    get value() { return props.value },
    get onChange() { return props.onChange },
    get disabled() { return props.disabled },
    get id() { return props.id },
    get size() { return undefined },
    get status() { return props.status },
  })

  const resolvedStatus = () => form.status()
  const resolvedDisabled = () => form.disabled()

  // Created ONCE (the createMemo-wraps-machine pitfall — see Select).
  const machine = createMentions({
    get value() { return form.value() as string | undefined },
    get defaultValue() { return props.defaultValue },
    get options() { return props.options },
    get prefix() { return props.prefix },
    get split() { return props.split },
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

  const m = () => machine

  // The dropdown's open state is OWNED by trigger activity — the machine
  // itself decides (caret in a token with matches). createTrigger gets NO
  // focus/click action listeners (a 'focus' action would re-open the
  // panel on every focus, fighting this effect); the trigger here is a
  // positioning + dismiss (outside click/Escape) engine only.
  const shouldShowMenu = createMemo(() =>
    m().trigger().active && m().suggestions().length > 0,
  )
  const open = () => (props.open !== undefined ? props.open : shouldShowMenu())

  const trigger = createTrigger({
    get open() { return open() },
    get defaultOpen() { return props.defaultOpen },
    get disabled() { return resolvedDisabled() },
    placement: 'bottomLeft',
    offset: 4,
    get onOpenChange() { return props.onOpenChange },
  })

  const textareaRef: { current?: HTMLTextAreaElement } = {}
  const setTextareaRef = (el: HTMLTextAreaElement) => {
    textareaRef.current = el
    props.ref?.(el)
  }

  const handleInput = (e: Event) => {
    const el = e.target as HTMLTextAreaElement
    // Combined edit — separate setText/setCaret calls read a stale value()
    // inside the same Solid 2 batch and the trigger detection fails.
    m().setTextAndCaret(el.value, el.selectionStart ?? el.value.length)
  }

  const handleSelectChange = (e: Event) => {
    const el = e.target as HTMLTextAreaElement
    m().setCaret(el.selectionStart ?? 0)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    const mm = m()
    if (resolvedDisabled()) return
    switch (e.key) {
      case 'ArrowDown':
        if (open() && mm.trigger().active) {
          e.preventDefault()
          mm.moveActive(1)
        }
        return
      case 'ArrowUp':
        if (open() && mm.trigger().active) {
          e.preventDefault()
          mm.moveActive(-1)
        }
        return
      case 'Enter':
        if (open() && mm.trigger().active && mm.activeValue() !== undefined) {
          e.preventDefault()
          mm.commitActive()
          // after insertion put the DOM caret where the machine wants it
          const el = textareaRef.current
          if (el) {
            el.focus()
            const caret = mm.caret()
            el.setSelectionRange(caret, caret)
          }
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

  const handleSelect = (option: MentionOption) => {
    if (option.disabled) return
    m().selectOption(option)
    // after insertion put the DOM caret where the machine wants it
    const el = textareaRef.current
    if (el) {
      el.focus()
      const caret = m().caret()
      el.setSelectionRange(caret, caret)
    }
  }

  return (
    <div class={twMerge('relative inline-flex w-full', props.class)} style={props.style}>
      <textarea
        ref={el => { trigger.triggerRef(el); setTextareaRef(el) }}
        id={form.id()}
        name={props.name}
        rows={props.rows}
        value={m().value()}
        placeholder={props.placeholder}
        disabled={resolvedDisabled()}
        class={twMerge(
          textAreaClass({ status: resolvedStatus(), disabled: !!resolvedDisabled() }),
        )}
        style={props.style}
        onInput={handleInput}
        onSelect={handleSelectChange}
        onClick={handleSelectChange}
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
            class={mentionsDropdownClass({ visible: open(), placement: trigger.actualPlacement() })}
            style={trigger.layerStyle()}
            role="listbox"
            tabindex={-1}
          >
            <Show
              when={m().suggestions().length > 0}
              fallback={<div class={mentionsEmptyClass()}>无匹配结果</div>}
            >
              <For each={m().suggestions()}>
                {option => (
                  <div
                    class={mentionsOptionWrapClass({
                      active: m().activeValue() === option.value,
                      disabled: option.disabled,
                    })}
                    role="option"
                    aria-selected={m().activeValue() === option.value ? 'true' : 'false'}
                    aria-disabled={option.disabled ? 'true' : 'false'}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => m().setActiveValue(option.value)}
                  >
                    <span class={mentionsOptionAvatarClass()}>
                      {(option.label ?? option.value).slice(0, 1).toUpperCase()}
                    </span>
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

export default Mentions
