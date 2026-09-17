import { createMemo, createSignal } from 'solid-js'
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
  createOwnerCleanup()(() => { alive = false; clearTimeout(timer) })
  const startEdit = () => {
    if (!config.editable || config.disabled) return
    setDraft(text()); setLocalEditing(true); editable().onStart?.()
  }
  const finishEdit = (value = draft()) => {
    if (!editing()) return
    const next = editable().maxLength === undefined ? value : value.slice(0, editable().maxLength)
    if (editable().text === undefined) setLocalText(next)
    setLocalEditing(false)
    editable().onChange?.(next); editable().onEnd?.()
  }
  const cancelEdit = () => {
    if (!editing()) return
    setLocalEditing(false); setDraft(text()); editable().onCancel?.()
  }
  const copy = async () => {
    if (!config.copyable || config.disabled || copying()) return
    setCopying(true)
    try {
      const source = copyable().text
      const value = typeof source === 'function' ? await source() : source ?? text()
      await config.writeClipboard(value)
      if (!alive) return
      setCopied(true); copyable().onCopy?.(value)
      clearTimeout(timer); timer = setTimeout(() => setCopied(false), 2000)
    } catch (error) { if (alive) copyable().onError?.(error) }
    finally { if (alive) setCopying(false) }
  }
  return { text, localText, editing, draft, setDraft, copied, copying, startEdit, finishEdit, cancelEdit, copy }
}
