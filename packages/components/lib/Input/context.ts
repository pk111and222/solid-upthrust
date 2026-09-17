import { createContext, useContext } from 'solid-js'
import type { SizeType } from '../../common/type'

/**
 * FormItemControl — the injection contract between Form.Item and form
 * widgets (Input, and future Select/Checkbox/…).
 *
 * Solid has no cloneElement, so a Form.Item can't inject value/onChange
 * into an already-created child. Instead the Item exposes this context and
 * every first-party form widget consumes it via useFormItem(): explicit
 * props win, context fills the rest.
 */
export type FormItemControl = {
  /** Reactive field value (undefined when the Item has no name). */
  value: () => unknown
  /** Report a new value (marks touched, updates store, triggers validation). */
  onChange: (value: any, event?: Event) => void
  /** 'error' | 'warning' | 'validating' | 'success' | undefined */
  validateStatus: () => 'error' | 'warning' | 'validating' | 'success' | undefined
  /** id for label htmlFor association. */
  id: () => string | undefined
  disabled: () => boolean | undefined
  size: () => SizeType | undefined
}

// Solid 2's useContext THROWS (ContextNotFoundError) when a context has no
// default value and no provider is mounted — unlike Solid 1 which returned
// undefined. A standalone Input outside any Form.Item is a first-class use
// case, so the default must be null (presence is then checked with ?? / ?..).
export const FormItemContext = createContext<FormItemControl | null>(null)

/**
 * Consume the surrounding Form.Item control. Returns a partial when no Item
 * wraps the widget (standalone usage).
 */
export const useFormItem = (props: {
  value?: unknown
  onChange?: (value: any, event?: Event) => void
  disabled?: boolean
  id?: string
  size?: SizeType
  status?: 'error' | 'warning'
}) => {
  const ctx = useContext(FormItemContext)

  const value = () => (props.value !== undefined ? props.value : ctx?.value?.())
  const onChange = (next: any, event?: Event) => {
    if (props.onChange) {
      props.onChange(next, event)
      return
    }
    ctx?.onChange?.(next, event)
  }
  const disabled = () => props.disabled ?? ctx?.disabled?.()
  const id = () => props.id ?? ctx?.id?.()
  const size = () => props.size ?? ctx?.size?.()
  // The widget's visual status: explicit prop wins, then the Item's
  // validateStatus (error/warning only), then none.
  const status = (): 'error' | 'warning' | undefined => {
    if (props.status === 'error' || props.status === 'warning') return props.status
    const vs = ctx?.validateStatus?.()
    if (vs === 'error' || vs === 'warning') return vs
    return undefined
  }

  return { value, onChange, disabled, id, size, status }
}
