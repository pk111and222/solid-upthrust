import { createContext, useContext } from 'solid-js'
import type { FormInstance } from 'upthrust-competence'
import type { SizeType } from '../../common/type'

/**
 * FormContext — the form instance + form-level defaults shared by every
 * Form.Item below the <Form>.
 */
export type FormContextValue = {
  form: () => FormInstance
  validateTrigger: () => string | string[] | false
  size: () => SizeType
  disabled: () => boolean
  layout: () => 'horizontal' | 'vertical' | 'inline'
  labelAlign: () => 'left' | 'right'
  /** Fixed label column width (e.g. '120px'); undefined = label sizes to content. */
  labelWidth: () => string | undefined
  labelWrap: () => boolean
  /** true (default): `*` on required; false: hidden; 'optional': `(optional)` on optional. */
  requiredMark: () => boolean | 'optional'
  /** Show `:` after labels. Default true (antd colon default). */
  colon: () => boolean
}

// null defaults: Solid 2's useContext throws ContextNotFoundError when a
// context has neither a default nor a provider — consumers must tolerate
// running outside a <Form> (headless standalone usage).
export const FormContext = createContext<FormContextValue | null>(null)

export const useFormContext = () => useContext(FormContext)

/**
 * ListContext — Form.List nesting support. Each List level contributes a
 * prefix (its name) and a key manager; child Items and nested Lists resolve
 * their full namePath through it. getKey maps an inner path index to the
 * stable row key (so keyed For rows survive add/remove/move).
 */
export type FormListContextValue = {
  prefixName: () => (string | number)[]
  getKey: (namePath: (string | number)[]) => [number, (string | number)[]]
}

export const FormListContext = createContext<FormListContextValue | null>(null)

export const useFormListContext = () => useContext(FormListContext)
