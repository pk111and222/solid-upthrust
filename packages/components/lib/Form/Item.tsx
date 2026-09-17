import { Component, For, Show, createMemo, merge, untrack } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import {
  type FormFieldRule,
  type InternalNamePath,
  type NamePath,
  createFormField,
  isRequiredRule,
} from 'upthrust-competence'
import { FormItemContext } from '../Input/context'
import { useFormContext, useFormListContext } from './context'
import {
  formItemClass,
  formItemColonClass,
  formItemControlClass,
  formItemControlContentClass,
  formItemControlInputClass,
  formItemExplainClass,
  formItemExplainItemClass,
  formItemExtraClass,
  formItemFeedbackIconClass,
  formItemFeedbackIconWrapClass,
  formItemLabelClass,
  formItemLabelWrapClass,
  formItemOptionalMarkClass,
  formItemRequiredMarkClass,
  formItemTooltipClass,
} from './styles'
import Tooltip from '../Tooltip'

export interface FormItemProps {
  /** Field name path; omit for a pure render-region Item (no value bound). */
  name?: NamePath
  label?: JSX.Element
  /** Label alignment override (form default applies otherwise). */
  labelAlign?: 'left' | 'right'
  /** Label column width override (horizontal layout only). */
  labelWidth?: string
  /** Let this item's label wrap (form default applies otherwise). */
  labelWrap?: boolean
  /** Show the required asterisk; defaults to detecting `required` in rules. */
  required?: boolean
  /** Show `:` after the label. Default follows the Form (true). */
  colon?: boolean
  rules?: FormFieldRule[]
  initialValue?: unknown
  dependencies?: NamePath[]
  validateTrigger?: string | string[] | false
  validateFirst?: boolean | 'parallel'
  validateDebounce?: number
  messageVariables?: Record<string, any>
  normalize?: (value: any, prevValue: any, allValues: any) => any
  getValueFromEvent?: (...args: any[]) => any
  preserve?: boolean
  /** Force the validation status display (overrides the field's own state). */
  validateStatus?: 'error' | 'warning' | 'validating' | 'success'
  /** Show the status icon in the widget's suffix area. */
  hasFeedback?: boolean
  /** Custom help text; overrides the validation messages when non-empty. */
  help?: JSX.Element
  /** Persistent hint under the validation row. */
  extra?: JSX.Element
  /** Question-mark tooltip next to the label. */
  tooltip?: JSX.Element
  htmlFor?: string
  hidden?: boolean
  disabled?: boolean
  class?: string
  children: JSX.Element | ((value: any, form: unknown) => JSX.Element)
  onReset?: () => void
}

/** antd trims a trailing user-supplied colon (ASCII or full-width) from labels. */
const trimColon = (label: JSX.Element): JSX.Element =>
  typeof label === 'string' ? label.replace(/[:|：]\s*$/, '') : label

const FormItem: Component<FormItemProps> = rawProps => {
  const props = merge({}, rawProps)
  const formCtx = useFormContext()
  const listCtx = useFormListContext()

  // A field needs a store. Outside <Form> the headless layer is the intended
  // usage path — catch the wiring mistake with a clear message instead of a
  // context crash from deep inside createFormField.
  if (!formCtx) {
    throw new Error('[upthrust-ui] Form.Item must be rendered inside a <Form> (or use the headless createFormField from upthrust-competence).')
  }

  // Resolve the namePath: List prefix + own name.
  const namePath = createMemo<InternalNamePath>(() => {
    if (props.name === undefined) return []
    const prefix = listCtx?.prefixName() ?? []
    const own = Array.isArray(props.name) ? props.name : [props.name]
    return [...prefix, ...own]
  })

  // untrack: component bodies run untracked in Solid 2 — reading the form()
  // memo directly here would trip STRICT_READ_UNTRACKED in dev. The form
  // instance is static for the Item's lifetime (the form prop never swaps),
  // so a one-time untracked read is semantically exact.
  const field = createFormField(untrack(() => formCtx.form()), {
    get name() { return props.name === undefined ? undefined : namePath() },
    get rules() { return props.rules },
    get initialValue() { return props.initialValue },
    get dependencies() { return props.dependencies },
    get validateTrigger() { return props.validateTrigger ?? formCtx?.validateTrigger() },
    get validateFirst() { return props.validateFirst },
    get validateDebounce() { return props.validateDebounce },
    get messageVariables() { return props.messageVariables },
    get normalize() { return props.normalize },
    get getValueFromEvent() { return props.getValueFromEvent },
    get preserve() { return props.preserve },
    get disabled() { return props.disabled },
    get onReset() { return props.onReset },
  })

  // Resolve the DOM id: htmlFor > form name + namePath.
  const itemId = createMemo(() => {
    if (props.htmlFor) return props.htmlFor
    if (props.name === undefined) return undefined
    return `upthrust-form-item-${namePath().join('-')}`
  })

  const layout = () => formCtx.layout?.() ?? 'horizontal'
  const size = () => formCtx.size()

  // Required asterisk: antd requiredMark resolves per item —
  // form-level mark (true/false/'optional') × item required state.
  const itemRequired = createMemo(() =>
    props.required ?? isRequiredRule(props.rules, props.name),
  )
  const formRequiredMark = () => formCtx.requiredMark?.() ?? true
  // show the `*`: form mark is truthy AND the item is required
  const showRequiredMark = createMemo(() =>
    formRequiredMark() !== false && itemRequired(),
  )
  // show `(optional)`: form mark is 'optional' AND the item is NOT required
  const showOptionalMark = createMemo(() =>
    formRequiredMark() === 'optional' && !itemRequired(),
  )

  const showColon = createMemo(() => {
    if (layout() === 'vertical') return false
    if (props.colon !== undefined) return props.colon
    return formCtx.colon?.() ?? true
  })

  // Effective validate status: prop override > field state.
  const validateStatus = createMemo<'error' | 'warning' | 'validating' | 'success' | undefined>(() => {
    if (props.validateStatus) return props.validateStatus
    const meta = field.meta()
    if (meta.validating) return 'validating'
    if (meta.errors.length) return 'error'
    if (meta.warnings.length) return 'warning'
    if (meta.validated && meta.touched) return 'success'
    return undefined
  })

  const helpMessage = createMemo<JSX.Element>(() => {
    if (props.help !== undefined) return props.help
    const errors = field.errors()
    if (errors.length) return <For each={errors}>{(msg) => <div class={formItemExplainItemClass()}>{msg}</div>}</For>
    const warnings = field.warnings()
    if (warnings.length) return <For each={warnings}>{(msg) => <div class={formItemExplainItemClass()}>{msg}</div>}</For>
    return undefined
  })

  const hasLabel = () => props.label !== undefined || props.tooltip !== undefined

  const control = {
    value: () => field.value(),
    onChange: (value: any, event?: Event) => {
      // Form widgets pass the value directly; event is advisory.
      void event
      field.onChange(value)
    },
    validateStatus,
    id: itemId,
    disabled: () => props.disabled ?? formCtx?.disabled(),
    size: () => formCtx?.size(),
  }

  const renderChildren = (): JSX.Element => {
    if (typeof props.children === 'function') {
      return (props.children as (value: any, form: unknown) => JSX.Element)(field.value(), formCtx.form())
    }
    return props.children as JSX.Element
  }

  // Fixed label column width — an inline style, because a runtime CSS length
  // (e.g. '96px') can't be a static UnoCSS class (arbitrary values built at
  // runtime are invisible to the extractor).
  const labelWidth = () => (layout() === 'horizontal' ? (props.labelWidth ?? formCtx.labelWidth?.()) : undefined)

  const labelNode = (
    <Show when={hasLabel()}>
      <div
        style={labelWidth() ? { 'flex-basis': labelWidth(), width: labelWidth() } : undefined}
        class={formItemLabelWrapClass({
          layout: layout(),
          labelAlign: props.labelAlign ?? formCtx.labelAlign(),
          labelWrap: props.labelWrap ?? formCtx.labelWrap?.(),
        })}
      >
        <label
          class={formItemLabelClass({ size: size() })}
          for={itemId()}
        >
          <Show when={showRequiredMark()}>
            <span class={formItemRequiredMarkClass()}>*</span>
          </Show>
          {trimColon(props.label)}
          <Show when={showColon() && props.label !== undefined && props.label !== ''}>
            <span class={formItemColonClass()}>:</span>
          </Show>
          <Show when={showOptionalMark()}>
            <span class={formItemOptionalMarkClass()}>(可选)</span>
          </Show>
          <Show when={props.tooltip !== undefined} keyed>
            <Tooltip title={props.tooltip}>
              <span class={twMerge('i-mdi-help-circle-outline', formItemTooltipClass())} />
            </Tooltip>
          </Show>
        </label>
      </div>
    </Show>
  )

  return (
    <div class={formItemClass({ layout: layout(), hidden: props.hidden, class_: props.class })}>
      {labelNode}

      <div class={formItemControlClass({ layout: layout() })}>
        <div class={formItemControlInputClass({ size: size() })}>
          <div class={formItemControlContentClass()}>
            <FormItemContext value={control}>
              {renderChildren()}
            </FormItemContext>
          </div>
          <Show when={props.hasFeedback && validateStatus()}>
            <span class={formItemFeedbackIconWrapClass({ size: size() })}>
              <span class={formItemFeedbackIconClass(validateStatus())}>
                <Show when={validateStatus() === 'error'} fallback={
                  <Show when={validateStatus() === 'warning'} fallback={
                    <Show when={validateStatus() === 'validating'} fallback={<span class="i-mdi-check-circle" />}>
                      <span class="i-mdi-loading animate-spin-upthrust" />
                    </Show>
                  }>
                    <span class="i-mdi-alert" />
                  </Show>
                }>
                  <span class="i-mdi-close-circle" />
                </Show>
              </span>
            </span>
          </Show>
        </div>

        <Show when={helpMessage() !== undefined || props.extra !== undefined}>
          <div>
            <div class={formItemExplainClass(
              validateStatus() === 'error' ? 'error' : validateStatus() === 'warning' ? 'warning' : 'default',
            )}>
              {helpMessage()}
            </div>
            <Show when={props.extra !== undefined}>
              <div class={formItemExtraClass()}>{props.extra}</div>
            </Show>
          </div>
        </Show>
      </div>
    </div>
  )
}

export default FormItem
