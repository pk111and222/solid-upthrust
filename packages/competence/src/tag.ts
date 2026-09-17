import { createSignal } from 'solid-js'

export interface TagConfig {
  disabled?: boolean
  onClose?: (event: MouseEvent) => void
}

/** Closing may be cancelled with preventDefault, for confirmation flows. */
export const createTag = (config: TagConfig = {}) => {
  const [visible, setVisible] = createSignal(true, { ownedWrite: true })
  const close = (event: MouseEvent) => {
    event.stopPropagation()
    if (config.disabled || !visible()) return
    config.onClose?.(event)
    if (!event.defaultPrevented) setVisible(false)
  }
  return { visible, close }
}

export interface CheckableTagConfig {
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  onChange?: (checked: boolean) => void
}

export const createCheckableTag = (config: CheckableTagConfig = {}) => {
  const [internal, setInternal] = createSignal(config.defaultChecked ?? false, { ownedWrite: true })
  const checked = () => config.checked ?? internal()
  const toggle = () => {
    if (config.disabled) return
    const next = !checked()
    if (config.checked === undefined) setInternal(next)
    config.onChange?.(next)
  }
  return { checked, toggle }
}
