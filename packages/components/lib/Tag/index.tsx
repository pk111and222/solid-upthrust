import { Show, type Component } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import { createTag, createCheckableTag, type CheckableTagConfig } from 'upthrust-competence'
import { tagClass, tagCloseClass, checkableTagClass } from './styles'

export interface TagProps {
  children?: JSX.Element
  /** Status color or any CSS color. Custom colors use a solid background. */
  color?: 'default' | 'success' | 'processing' | 'error' | 'warning' | (string & {})
  bordered?: boolean
  closable?: boolean
  closeIcon?: JSX.Element
  closeLabel?: string
  icon?: JSX.Element
  disabled?: boolean
  onClose?: (event: MouseEvent) => void
  class?: string
  style?: JSX.CSSProperties
}

export interface CheckableTagProps extends CheckableTagConfig {
  children?: JSX.Element
  icon?: JSX.Element
  class?: string
  style?: JSX.CSSProperties
}

export const CheckableTag: Component<CheckableTagProps> = props => {
  const machine = createCheckableTag(props)
  return <button type="button" class={twMerge(checkableTagClass({ checked: machine.checked() }), props.class)}
    style={props.style} disabled={props.disabled} aria-pressed={machine.checked() ? 'true' : 'false'} onClick={machine.toggle}>
    {props.icon}{props.children}
  </button>
}

const TagRoot: Component<TagProps> = props => {
  const machine = createTag(props)
  const tone = () => {
    switch (props.color) {
      case undefined: case 'default': return 'default'
      case 'success': return 'success'
      case 'processing': return 'processing'
      case 'error': return 'error'
      case 'warning': return 'warning'
      default: return 'custom'
    }
  }
  const style = (): JSX.CSSProperties => ({
    ...(tone() === 'custom' ? { 'background-color': props.color, color: '#fff', 'border-color': props.bordered === false ? 'transparent' : props.color } : {}),
    ...props.style,
  })
  return <Show when={machine.visible()}>
    <span class={twMerge(tagClass({ tone: tone(), bordered: props.bordered ?? true, disabled: props.disabled }), props.class)} style={style()}>
      {props.icon}{props.children}
      <Show when={props.closable}>
        <button type="button" class={tagCloseClass} disabled={props.disabled} aria-label={props.closeLabel ?? '关闭标签'} onClick={machine.close}>
          {props.closeIcon ?? <span class="i-mdi-close" aria-hidden="true" />}
        </button>
      </Show>
    </span>
  </Show>
}

const Tag = Object.assign(TagRoot, { CheckableTag })
export default Tag
