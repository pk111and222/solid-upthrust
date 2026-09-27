import { createEffect, createMemo, createSignal, untrack } from 'solid-js'
import { createOwnerCleanup } from './utils'

export interface TypographyEditableConfig {
  text?: string
  editing?: boolean
  maxLength?: number
  onStart?: () => void
  onChange?: (value: string) => void
  onCancel?: () => void
  onEnd?: () => void
}
export interface TypographyCopyConfig {
  text?: string | (() => string | Promise<string>)
  onCopy?: (text: string) => void
  onError?: (error: unknown) => void
}
export interface TypographyConfig {
  text: () => string
  disabled?: boolean
  editable?: boolean | TypographyEditableConfig
  copyable?: boolean | TypographyCopyConfig
  writeClipboard: (text: string) => Promise<void>
}
export function createTypography(config: TypographyConfig) {
  const editable = () => typeof config.editable === 'object' ? config.editable : {}
  const copyable = () => typeof config.copyable === 'object' ? config.copyable : {}
  const [localText, setLocalText] = createSignal<string | undefined>(undefined, { ownedWrite: true })
  const [localEditing, setLocalEditing] = createSignal(false, { ownedWrite: true })
  const [draft, setDraft] = createSignal('', { ownedWrite: true })
  const [copied, setCopied] = createSignal(false, { ownedWrite: true })
  const [copying, setCopying] = createSignal(false, { ownedWrite: true })
  const text = () => editable().text ?? localText() ?? config.text()
  const editing = createMemo(() => !!config.editable && !config.disabled && (editable().editing ?? localEditing()))
  let timer: ReturnType<typeof setTimeout> | undefined
  let alive = true
  let copyPending = false
  let editFinished = false
  createEffect(editing, active => {
    if (active) { editFinished = false; setDraft(untrack(text)) }
  })
  createOwnerCleanup()(() => { alive = false; clearTimeout(timer) })
  const startEdit = () => {
    if (!alive || !config.editable || config.disabled) return
    editFinished = false; setDraft(text());
    if (editable().editing === undefined) setLocalEditing(true)
    editable().onStart?.()
  }
  const finishEdit = (value = draft()) => {
    if (!alive || !editing() || editFinished) return
    editFinished = true
    const next = editable().maxLength === undefined ? value : value.slice(0, Math.max(0, editable().maxLength!))
    if (editable().text === undefined) setLocalText(next)
    setLocalEditing(false)
    editable().onChange?.(next); editable().onEnd?.()
  }
  const cancelEdit = () => {
    if (!alive || !editing() || editFinished) return
    editFinished = true
    setLocalEditing(false); setDraft(text()); editable().onCancel?.()
  }
  const copy = async () => {
    if (!alive || !config.copyable || config.disabled || copyPending) return
    copyPending = true; clearTimeout(timer); setCopied(false); setCopying(true)
    try {
      const source = copyable().text
      const value = typeof source === 'function' ? await source() : source ?? text()
      if (!alive || config.disabled || !config.copyable) return
      await config.writeClipboard(value)
      if (!alive) return
      setCopied(true)
      timer = setTimeout(() => setCopied(false), 2000)
      copyable().onCopy?.(value)
    } catch (error) { if (alive) copyable().onError?.(error) }
    finally { copyPending = false; if (alive) setCopying(false) }
  }
  return { text, localText, editing, draft, setDraft, copied, copying, startEdit, finishEdit, cancelEdit, copy }
}
