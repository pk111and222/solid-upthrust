import { createSignal, untrack } from 'solid-js'

export interface InputConfig {
  value?: string
  defaultValue?: string
  disabled?: boolean
  readonly?: boolean
  onChange?: (value: string, event?: Event) => void
}

/** Shared text value/IME contract; the UI owns native nodes and focus. */
export function createInput(config: InputConfig = {}) {
  const [inner, setInner] = createSignal(untrack(() => config.defaultValue ?? ''), { ownedWrite: true })
  const [draft, setDraft] = createSignal<string | undefined>(undefined, { ownedWrite: true })
  const [revision, setRevision] = createSignal(0, { ownedWrite: true })
  let composing = false
  let compositionCommit: string | undefined
  const value = () => draft() ?? config.value ?? inner()
  const blocked = () => !!config.disabled || !!config.readonly
  const commit = (next: string, event?: Event) => {
    if (blocked()) { setRevision(v => v + 1); return }
    if (config.value === undefined) setInner(next)
    config.onChange?.(next, event)
    setRevision(v => v + 1)
  }
  const input = (next: string, event?: Event) => {
    if (composing) { if (!blocked()) setDraft(next); return }
    if (compositionCommit === next) { compositionCommit = undefined; setRevision(v => v + 1); return }
    compositionCommit = undefined
    commit(next, event)
  }
  const compositionStart = () => { composing = true; compositionCommit = undefined }
  const compositionEnd = (next: string, event?: Event) => {
    composing = false
    setDraft(undefined)
    compositionCommit = next
    commit(next, event)
  }
  const clear = (event?: Event) => {
    if (blocked()) return
    composing = false
    compositionCommit = undefined
    setDraft(undefined)
    commit('', event)
  }
  const canEnter = (event: KeyboardEvent) => !config.disabled && !composing && !event.isComposing && event.keyCode !== 229
  return { value, revision, input, compositionStart, compositionEnd, clear, canEnter }
}

export interface PasswordConfig {
  visible?: boolean
  disabled?: boolean
  action?: 'click' | 'hover'
  onVisibleChange?: (visible: boolean) => void
}

/** Visibility requests are separate from the text value contract. */
export function createPassword(config: PasswordConfig = {}) {
  const [inner, setInner] = createSignal(false, { ownedWrite: true })
  const visible = () => config.visible ?? inner()
  let beforeHover: boolean | undefined
  const request = (next: boolean) => {
    if (next === visible()) return
    if (config.visible === undefined) setInner(next)
    config.onVisibleChange?.(next)
  }
  const toggle = () => { if (!config.disabled) request(!visible()) }
  const enter = () => {
    if (config.disabled || config.action !== 'hover') return
    beforeHover ??= visible()
    request(true)
  }
  const leave = () => {
    if (beforeHover === undefined) return
    const restore = beforeHover
    beforeHover = undefined
    request(restore)
  }
  return { visible, toggle, enter, leave }
}
