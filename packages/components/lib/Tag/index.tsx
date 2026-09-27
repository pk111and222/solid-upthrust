import { For, Show, children as resolveChildren, createMemo, omit } from 'solid-js'
import { Dynamic, type JSX } from '@solidjs/web'
import {
  createCheckableTag, createCheckableTagGroup, createTag, normalizeCheckableTagOptions, resolveTagClosable, resolveTagColor,
  type CheckableTagConfig, type CheckableTagValue, type PresetColor, type PresetStatusColor, type TagClosableConfig, type TagVariant,
} from 'upthrust-competence'
import { mergeClass } from '../../common/merge'
import { numberToText } from '../../common/renderable'
import { checkableTagClass, checkableTagGroupClass, tagClass, tagCloseClass, tagContentClass, tagIconClass } from './styles'

export type { TagVariant, CheckableTagValue } from 'upthrust-competence'
export type TagSemanticName = 'root' | 'icon' | 'content' | 'close'
export type TagColor = PresetColor | `${PresetColor}-inverse` | PresetStatusColor | (string & {})

type Handler<E extends Event> = JSX.EventHandlerUnion<HTMLElement, E>

/** 同时支持普通处理器与 Solid 的 [handler, data] 绑定形式。 */
const callHandler = <E extends Event>(handler: Handler<E> | undefined, event: E) => {
  if (typeof handler === 'function') (handler as (event: E) => void)(event)
  else if (handler) (handler[0] as (data: unknown, event: E) => void)(handler[1], event)
}

const isRenderable = (node: unknown) => node !== undefined && node !== null && node !== false && node !== true && node !== ''

export interface TagClosable extends Omit<TagClosableConfig, 'closeIcon'> {
  closeIcon?: JSX.Element
}

export interface TagProps extends Omit<JSX.HTMLAttributes<HTMLElement>, 'color' | 'children' | 'class' | 'style' | 'onClick' | 'onClose'> {
  children?: JSX.Element
  /** 预设色板（blue…gold）、状态色（success/processing/error/warning/default）或任意 CSS 颜色。 */
  color?: TagColor
  /** 标签变体，默认 filled。 */
  variant?: TagVariant
  /** @deprecated 使用 variant="filled"。antd 6 中 bordered 不再产生描边。 */
  bordered?: boolean
  /** true 显示默认关闭图标；对象可设置 closeIcon 与 aria-label。 */
  closable?: boolean | TagClosable
  /** 自定义关闭图标；未设 closable 时，传入图标即可关闭，false/null 隐藏。 */
  closeIcon?: JSX.Element | boolean | null
  /** 关闭按钮的无障碍名称，closable 对象的 aria-label 优先。默认“关闭标签”。 */
  closeLabel?: string
  icon?: JSX.Element
  disabled?: boolean
  /** 设置后渲染为 <a>。 */
  href?: string
  target?: string
  rel?: string
  onClose?: (event: MouseEvent) => void
  onClick?: Handler<MouseEvent>
  classNames?: Partial<Record<TagSemanticName, string>>
  styles?: Partial<Record<TagSemanticName, JSX.CSSProperties>>
  class?: string
  style?: JSX.CSSProperties
}

const TAG_OWN = [
  'children', 'color', 'variant', 'bordered', 'closable', 'closeIcon', 'closeLabel', 'icon', 'disabled',
  'href', 'target', 'rel', 'onClose', 'onClick', 'classNames', 'styles', 'class', 'style',
] as const

const TagRoot = (props: TagProps) => {
  const rest = omit(props, ...TAG_OWN)
  const machine = createTag({
    get disabled() { return !!props.disabled },
    get href() { return props.href },
    onClose: event => props.onClose?.(event),
  })
  // JSX 属性每次读取都会重新创建节点：children、icon、closeIcon、closable 各读一次后复用。
  const content = resolveChildren(() => props.children)
  const icon = resolveChildren(() => props.icon)
  const closeIconProp = resolveChildren(() => props.closeIcon as JSX.Element)
  const closableProp = createMemo(() => props.closable)
  const hasContent = createMemo(() => content.toArray().some(isRenderable))
  const hasIcon = createMemo(() => icon.toArray().some(isRenderable))

  const colorState = createMemo(() => resolveTagColor({ color: props.color, variant: props.variant, bordered: props.bordered }))
  const tone = createMemo(() => {
    const { variant, color, isPreset, isStatus } = colorState()
    if (props.disabled) return `disabled-${variant}` as const
    if (isPreset || isStatus) return `${variant}-${color}` as never
    return color ? `${variant}-custom` as const : `${variant}-default` as const
  })
  const closable = createMemo(() => {
    const own = closeIconProp()
    const config = closableProp()
    const objectIcon = config && typeof config === 'object' ? config.closeIcon : undefined
    return resolveTagClosable(config && typeof config === 'object' ? { ...config, closeIcon: objectIcon } : config, own)
  })

  const rootStyle = createMemo((): JSX.CSSProperties | undefined => {
    const custom = props.disabled ? undefined : colorState().customStyle
    if (!custom?.['background-color'] && !props.styles?.root && !props.style) return undefined
    return { ...custom, ...props.styles?.root, ...props.style }
  })

  const onClick = (event: MouseEvent) => {
    if (props.disabled) return
    callHandler(props.onClick, event)
  }

  const rel = () => props.rel ?? (props.href && props.target === '_blank' ? 'noopener noreferrer' : undefined)

  return <Show when={machine.visible()}>
    <Dynamic
      component={props.href ? 'a' : 'span'}
      {...rest}
      class={mergeClass(tagClass({ tone: tone() }), props.classNames?.root, props.class)}
      style={rootStyle()}
      href={props.href && !props.disabled ? props.href : undefined}
      target={props.href ? props.target : undefined}
      rel={props.href ? rel() : undefined}
      aria-disabled={props.href && props.disabled ? 'true' : props['aria-disabled']}
      onClick={onClick}
    >
      <Show when={hasIcon()} fallback={numberToText(content())}>
        <span class={mergeClass(tagIconClass, props.classNames?.icon)} style={props.styles?.icon}>{icon()}</span>
        <Show when={hasContent()}>
          <span class={mergeClass(tagContentClass, props.classNames?.content)} style={props.styles?.content}>{numberToText(content())}</span>
        </Show>
      </Show>
      <Show when={closable()}>
        {state => <button
          type="button"
          class={mergeClass(tagCloseClass({ state: props.disabled ? 'disabled' : colorState().variant === 'solid' ? 'solid' : 'normal' }), props.classNames?.close)}
          style={props.styles?.close}
          disabled={props.disabled}
          aria-label={state().ariaLabel ?? props.closeLabel ?? '关闭标签'}
          onClick={machine.close}
        >
          {(state().closeIcon as JSX.Element) ?? <span class="i-mdi-close" aria-hidden="true" />}
        </button>}
      </Show>
    </Dynamic>
  </Show>
}

export interface CheckableTagProps extends Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'onChange' | 'children' | 'class' | 'style' | 'onClick' | 'onKeyDown'>, CheckableTagConfig {
  children?: JSX.Element
  icon?: JSX.Element
  onClick?: JSX.EventHandlerUnion<HTMLSpanElement, MouseEvent>
  onKeyDown?: JSX.EventHandlerUnion<HTMLSpanElement, KeyboardEvent>
  class?: string
  style?: JSX.CSSProperties
}

const CHECKABLE_OWN = ['checked', 'defaultChecked', 'disabled', 'onChange', 'children', 'icon', 'onClick', 'onKeyDown', 'class', 'style'] as const

/** 与 antd 一致使用 checkbox 语义：点击或 Space 切换，Enter 不切换；禁用时移出 Tab 序列。 */
export const CheckableTag = (props: CheckableTagProps) => {
  const rest = omit(props, ...CHECKABLE_OWN)
  const machine = createCheckableTag({
    get checked() { return props.checked },
    get defaultChecked() { return props.defaultChecked },
    get disabled() { return !!props.disabled },
    onChange: checked => props.onChange?.(checked),
  })
  const icon = resolveChildren(() => props.icon)
  const label = resolveChildren(() => props.children)
  const hasIcon = createMemo(() => icon.toArray().some(isRenderable))
  const state = () => `${props.disabled ? 'disabled-' : ''}${machine.checked() ? 'checked' : 'unchecked'}` as const
  const onClick = (event: MouseEvent) => {
    if (props.disabled) return
    machine.toggle()
    callHandler(props.onClick as Handler<MouseEvent>, event)
  }
  const onKeyDown = (event: KeyboardEvent) => {
    callHandler(props.onKeyDown as Handler<KeyboardEvent>, event)
    if (event.defaultPrevented || props.disabled) return
    if (event.key === ' ') {
      event.preventDefault()
      if (!event.repeat) machine.toggle()
    }
  }
  return <span
    {...rest}
    role="checkbox"
    aria-checked={machine.checked() ? 'true' : 'false'}
    aria-disabled={props.disabled ? 'true' : undefined}
    tabindex={props.disabled ? -1 : 0}
    class={mergeClass(checkableTagClass({ state: state() }), props.class)}
    style={props.style}
    onClick={onClick}
    onKeyDown={onKeyDown}
  >
    {icon()}
    <span class={hasIcon() ? tagContentClass : undefined}>{numberToText(label())}</span>
  </span>
}

export interface CheckableTagOption<V extends CheckableTagValue = CheckableTagValue> {
  value: V
  label: JSX.Element
  class?: string
  style?: JSX.CSSProperties
}

interface CheckableTagGroupBase<V extends CheckableTagValue> extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onChange' | 'children' | 'class' | 'style' | 'defaultValue'> {
  /** 选项；原始值会同时作为 value 与 label。 */
  options?: (CheckableTagOption<V> | V)[]
  disabled?: boolean
  classNames?: { root?: string; item?: string }
  styles?: { root?: JSX.CSSProperties; item?: JSX.CSSProperties }
  class?: string
  style?: JSX.CSSProperties
}

export interface CheckableTagGroupSingleProps<V extends CheckableTagValue = CheckableTagValue> extends CheckableTagGroupBase<V> {
  multiple?: false
  value?: V | null
  defaultValue?: V | null
  onChange?: (value: V | null) => void
}

export interface CheckableTagGroupMultipleProps<V extends CheckableTagValue = CheckableTagValue> extends CheckableTagGroupBase<V> {
  multiple: true
  value?: V[]
  defaultValue?: V[]
  onChange?: (value: V[]) => void
}

export type CheckableTagGroupProps<V extends CheckableTagValue = CheckableTagValue> = CheckableTagGroupSingleProps<V> | CheckableTagGroupMultipleProps<V>

const GROUP_OWN = ['options', 'disabled', 'classNames', 'styles', 'class', 'style', 'multiple', 'value', 'defaultValue', 'onChange'] as const

/** antd 6 CheckableTagGroup：单选再次点击取消为 null，多选返回数组；value 受控（含 null）。 */
export const CheckableTagGroup = <V extends CheckableTagValue = CheckableTagValue>(props: CheckableTagGroupProps<V>) => {
  const rest = omit(props as CheckableTagGroupSingleProps<V>, ...GROUP_OWN)
  const group = createCheckableTagGroup<V>({
    get multiple() { return !!props.multiple },
    get value() { return props.value },
    get defaultValue() { return props.defaultValue },
    get disabled() { return !!props.disabled },
    onChange: value => (props.onChange as ((value: unknown) => void) | undefined)?.(value),
  })
  const options = createMemo(() => normalizeCheckableTagOptions<V>(props.options) as CheckableTagOption<V>[])
  return <div
    {...rest}
    class={mergeClass(checkableTagGroupClass, props.class, props.classNames?.root)}
    style={props.styles?.root || props.style ? { ...props.styles?.root, ...props.style } : undefined}
  >
    <For each={options()}>
      {option => <CheckableTag
        class={mergeClass(props.classNames?.item, option.class)}
        style={props.styles?.item || option.style ? { ...props.styles?.item, ...option.style } : undefined}
        checked={group.isChecked(option.value)}
        disabled={props.disabled}
        onChange={checked => group.change(option.value, checked)}
      >{option.label}</CheckableTag>}
    </For>
  </div>
}

const Tag = Object.assign(TagRoot, { CheckableTag, CheckableTagGroup })
export default Tag
