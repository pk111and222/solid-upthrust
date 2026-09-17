import { useComponentProps } from '../ConfigProvider/context'
import { Component, Show, createMemo, merge, untrack } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { type FormInstance, createForm } from 'upthrust-competence'
import type { SizeType } from '../../common/type'
import { FormContext, type FormContextValue } from './context'
import {
  type FormCallbacks,
  type FormValidateErrorEntity,
  type Store,
} from 'upthrust-competence'
import { formClass } from './styles'
import FormItem, { type FormItemProps } from './Item'

export interface FormProps {
  /** External form instance (createForm()). One is created when omitted. */
  form?: FormInstance
  /** Form name (id prefix). */
  name?: string
  initialValues?: Store
  /** Default 'onChange'. */
  validateTrigger?: string | string[] | false
  validateMessages?: Record<string, any>
  preserve?: boolean
  clearOnDestroy?: boolean
  /** 'horizontal' (default) | 'vertical' | 'inline' — label placement. */
  layout?: 'horizontal' | 'vertical' | 'inline'
  size?: SizeType
  disabled?: boolean
  labelAlign?: 'left' | 'right'
  /** Fixed label column width, e.g. '120px' (horizontal layout only). */
  labelWidth?: string
  /** Let long labels wrap instead of ellipsis (horizontal). Default false. */
  labelWrap?: boolean
  /** true (default): `*` on required; false: hidden; 'optional': `(optional)` hint. */
  requiredMark?: boolean | 'optional'
  /** Show `:` after labels. Default true. */
  colon?: boolean
  onValuesChange?: FormCallbacks['onValuesChange']
  onFieldsChange?: FormCallbacks['onFieldsChange']
  onFinish?: (values: Store) => void
  onFinishFailed?: (errorInfo: FormValidateErrorEntity) => void
  /** Render a plain div (block) instead of a <form> element. */
  component?: 'form' | 'div' | false
  class?: string
  style?: JSX.CSSProperties
  children: JSX.Element
  ref?: (form: FormInstance) => void
}

/**
 * Form — the container that owns (or borrows) a headless createForm()
 * instance and provides it to every Form.Item below through FormContext.
 *
 * Native submit/reset are wired: submit validates everything first and only
 * calls onFinish when every field passes (antd semantics).
 */
const Form: Component<FormProps> = providedProps => {
  const rawProps = useComponentProps('Form', providedProps)
  const props = merge(
    {
      validateTrigger: 'onChange' as string | string[] | false,
      component: 'form' as 'form' | 'div' | false,
      layout: 'horizontal' as 'horizontal' | 'vertical' | 'inline',
    },
    rawProps,
  )

  const internalForm = createForm({
    get initialValues() { return props.initialValues },
    get preserve() { return props.preserve },
    get validateMessages() { return props.validateMessages },
    get callbacks() {
      return {
        onValuesChange: props.onValuesChange,
        onFieldsChange: props.onFieldsChange,
        onFinish: props.onFinish,
        onFinishFailed: props.onFinishFailed,
      }
    },
  })

  // The effective instance: external when provided, internal otherwise.
  // The internal form is created unconditionally to keep hook order stable.
  const form = createMemo<FormInstance>(() => props.form ?? internalForm)

  // Expose the effective form through ref (runs once; form prop is static).
  // untrack: component bodies run untracked in Solid 2 — a one-time memo read
  // here would trip STRICT_READ_UNTRACKED in dev.
  props.ref?.(untrack(() => form()))

  const ctx: FormContextValue = {
    form: () => form(),
    validateTrigger: () => props.validateTrigger,
    size: () => props.size ?? 'middle',
    disabled: () => !!props.disabled,
    layout: () => props.layout,
    labelAlign: () => props.labelAlign ?? 'right',
    labelWidth: () => props.labelWidth,
    labelWrap: () => !!props.labelWrap,
    requiredMark: () => props.requiredMark ?? true,
    colon: () => props.colon ?? true,
  }

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // submit() intentionally rejects on validation failure (rc-field-form
    // semantics); swallow it here — onFinishFailed already ran — so a native
    // form submit doesn't surface "Uncaught (in promise)" in the console.
    void form().submit().catch(() => {})
  }

  const handleReset = (e: Event) => {
    e.preventDefault()
    form().resetFields()
  }

  const content = (
    <FormContext value={ctx}>
      {props.children}
    </FormContext>
  )

  return (
    <Show
      when={props.component !== false}
      fallback={content}
    >
      <form
        class={formClass(props.class)}
        style={props.style}
        name={props.name}
        novalidate
        onSubmit={handleSubmit}
        onReset={handleReset}
      >
        {content}
      </form>
    </Show>
  )
}

export default Form
export { FormItem }
export type { FormItemProps }
export { default as FormList } from './List'
export type { FormListProps } from './List'
