import { ConfigPortal as Portal } from '../ConfigProvider/Portal'
import { useComponentProps } from '../ConfigProvider/context'
import { Component, For, Show, createEffect, createMemo, createSignal, createUniqueId, merge } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import {
  createMentions,
  createOwnerCleanup,
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
  'aria-label'?: string
  'aria-labelledby'?: string
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
    onChange: value => {
      if (props.onChange) props.onChange(value)
      else form.onChange(value)
    },
    get onSelect() { return props.onSelect },
    get onSearch() { return props.onSearch },
  })

  const m = () => machine

  // The dropdown's open state is OWNED by trigger activity — the machine
  // itself decides (caret in a token with matches). createTrigger gets NO
  // focus/click action listeners (a 'focus' action would re-open the
  // panel on every focus, fighting this effect); the trigger here is a
  // positioning + dismiss (outside click/Escape) engine only.
  const [focused, setFocused] = createSignal(props.defaultOpen ?? false, { ownedWrite: true })
  const [dismissed, setDismissed] = createSignal(false, { ownedWrite: true })
  const listId = `mentions-list-${createUniqueId()}`
  const shouldShowMenu = createMemo(() =>
    focused() && !dismissed() && m().trigger().active && m().suggestions().length > 0,
  )
  const open = () => !resolvedDisabled() && (props.open !== undefined ? props.open : shouldShowMenu())
  let observedOpen = open()
  createEffect(() => open(), next => {
    if (props.open === undefined && next !== observedOpen) props.onOpenChange?.(next)
    observedOpen = next
  })

  const trigger = createTrigger({
    get open() { return open() },
    get defaultOpen() { return props.defaultOpen },
    get disabled() { return resolvedDisabled() },
    action: 'manual',
    placement: 'bottomLeft',
    offset: 4,
    onOpenChange: next => {
      if (!next) setDismissed(true)
      if (props.open !== undefined) props.onOpenChange?.(next)
    },
  })

  const textareaRef: { current?: HTMLTextAreaElement } = {}
  let suppressSelection = false
  const [textareaWidth, setTextareaWidth] = createSignal(0, { ownedWrite: true })
  const onOwnerCleanup = createOwnerCleanup()
  let sizeObserver: ResizeObserver | undefined
  const setTextareaRef = (el: HTMLTextAreaElement) => {
    textareaRef.current = el
    const measure = () => setTextareaWidth(el.getBoundingClientRect().width)
    measure()
    if (typeof ResizeObserver !== 'undefined') {
      sizeObserver?.disconnect()
      sizeObserver = new ResizeObserver(measure)
      sizeObserver.observe(el)
    }
    props.ref?.(el)
  }
  onOwnerCleanup(() => sizeObserver?.disconnect())

  const activeIndex = () => m().suggestions().findIndex(option => option.value === m().activeValue())
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

  const handleInput = (e: Event) => {
    const el = e.target as HTMLTextAreaElement
    suppressSelection = false
    if (skipCompositionInput === el.value) { skipCompositionInput = undefined; return }
    skipCompositionInput = undefined
    setFocused(true)
    setDismissed(false)
    // Combined edit — separate setText/setCaret calls read a stale value()
    // inside the same Solid 2 batch and the trigger detection fails.
    m().setTextAndCaret(el.value, el.selectionStart ?? el.value.length)
    // A controlled parent may reject the proposed text. Native textarea
    // editing already changed the DOM, so restore the accepted prop now.
    if (props.value !== undefined && el.value !== props.value) el.value = props.value
  }

  const handleSelectChange = (e: Event) => {
    if (suppressSelection) return
    const el = e.target as HTMLTextAreaElement
    setDismissed(false)
    m().setCaret(el.selectionStart ?? 0)
  }

  let skipCompositionInput: string | undefined
  const restoreCaret = (caret: number) => {
    const el = textareaRef.current
    if (!el) return
    suppressSelection = true
    el.focus()
    queueMicrotask(() => { if (el.isConnected) el.setSelectionRange(caret, caret) })
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    const mm = m()
    if (resolvedDisabled()) return
    if (mm.isComposing()) return
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
          const caret = mm.commitActive()
          if (caret === undefined) return
          setDismissed(true)
          // Use the returned target: a signal read in this event batch can
          // still expose the caret from before the insertion.
          restoreCaret(caret)
        }
        return
      case 'Escape':
        if (open()) {
          e.preventDefault()
          e.stopPropagation()
          trigger.setOpen(false)
        }
        return
    }
  }

  const handleSelect = (option: MentionOption) => {
    if (option.disabled) return
    const caret = m().selectOption(option)
    if (caret === undefined) return
    setDismissed(true)
    // Restore after DOM text reconciliation, using the target from this edit.
    restoreCaret(caret)
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
        role="combobox"
        aria-label={props['aria-label']}
        aria-labelledby={props['aria-labelledby']}
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-expanded={open() ? 'true' : 'false'}
        aria-controls={open() ? listId : undefined}
        aria-activedescendant={open() && activeIndex() >= 0 ? `${listId}-option-${activeIndex()}` : undefined}
        aria-invalid={resolvedStatus() === 'error' ? 'true' : undefined}
        class={twMerge(
          textAreaClass({ status: resolvedStatus(), disabled: !!resolvedDisabled() }),
        )}
        onInput={handleInput}
        onSelect={handleSelectChange}
        onClick={e => { suppressSelection = false; handleSelectChange(e) }}
        onKeyDown={handleKeyDown}
        onKeyUp={e => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) { suppressSelection = false; handleSelectChange(e) } }}
        onFocus={e => { setFocused(true); setDismissed(false); m().notifyFocus(); props.onFocus?.(e) }}
        onBlur={e => { setFocused(false); m().notifyBlur(); props.onBlur?.(e) }}
        onCompositionStart={() => m().notifyCompositionStart()}
        onCompositionEnd={e => { const el = e.target as HTMLTextAreaElement; m().notifyCompositionEnd(el.selectionStart ?? el.value.length); skipCompositionInput = el.value }}
      />
      <Portal>
        <Show when={trigger.mounted()}>
          <div
            ref={(el) => { trigger.layerRef(el) }}
            class={mentionsDropdownClass({ visible: open(), placement: trigger.actualPlacement() })}
            style={{ ...trigger.layerStyle(), width: textareaWidth() > 0 ? `${textareaWidth()}px` : undefined }}
            role="listbox"
            id={listId}
            aria-hidden={open() ? 'false' : 'true'}
            inert={!open()}
            tabindex={-1}
          >
            <Show
              when={m().suggestions().length > 0}
              fallback={<div class={mentionsEmptyClass()}>无匹配结果</div>}
            >
              <For each={m().suggestions()}>
                {(option, index) => (
                  <div
                    id={`${listId}-option-${index()}`}
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
