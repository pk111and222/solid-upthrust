import { Show } from 'solid-js'
import { createOwnerCleanup } from 'upthrust-competence'
import type { SizeType } from '../../common/type'
import { createDelayedArrow } from '../../utils/clearableArrow'
import { selectorClearWrapClass, selectorSuffixWrapClass } from './styles'

export function PickerSuffix(props: {
  size: SizeType
  allowClear?: boolean
  hasValue: boolean
  disabled?: boolean
  icon: string
  onClear: () => void
}) {
  const showClear = () => !!props.allowClear && props.hasValue && !props.disabled
  const showArrow = createDelayedArrow(showClear)
  const onOwnerCleanup = createOwnerCleanup()
  const bindClear = (element: HTMLButtonElement) => {
    const handleClick = (event: MouseEvent) => {
      event.stopPropagation()
      props.onClear()
    }
    element.addEventListener('click', handleClick)
    onOwnerCleanup(() => element.removeEventListener('click', handleClick))
  }

  return <span class={selectorSuffixWrapClass({ size: props.size })}>
    <Show when={props.allowClear}>
      <button type="button" ref={bindClear}
        class={`${selectorClearWrapClass({ visible: showClear() })} border-none bg-transparent p-0`}
        aria-label="清空" tabindex={showClear() ? 0 : -1}
        onPointerDown={event => { event.preventDefault(); event.stopPropagation() }}>
        <span class="i-mdi-close" />
      </button>
    </Show>
    <Show when={!showClear() && showArrow()}>
      <span class={`${props.icon} pointer-events-none`} />
    </Show>
  </span>
}
