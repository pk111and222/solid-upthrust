import { createEffect, untrack } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { createAffix, type AffixConfig, type AffixIns } from 'upthrust-competence'
import { twMerge } from 'tailwind-merge'
export interface AffixProps extends AffixConfig {
  children: JSX.Element
  zIndex?: number
  class?: string
  style?: JSX.CSSProperties
  affixClass?: string
  ref?: (instance: AffixIns) => void
}
const Affix = (props: AffixProps) => {
  const machine = createAffix(props)
  createEffect(() => true, () => { untrack(() => props.ref?.(machine)) })
  return <div ref={machine.placeholderRef} class={twMerge('relative', props.class)} style={{ ...props.style, position: 'relative', height: machine.position() ? `${machine.position()!.height}px` : props.style?.height }}>
    <div ref={machine.contentRef} data-affixed={machine.affixed() ? 'true' : 'false'} class={machine.affixed() ? props.affixClass : undefined}
      style={machine.position() ? {
        position: machine.elementTarget() ? 'absolute' : 'fixed',
        top: `${machine.elementTarget() ? machine.position()!.relativeTop : machine.position()!.top}px`,
        left: machine.elementTarget() ? '0px' : `${machine.position()!.left}px`,
        width: `${machine.position()!.width}px`, 'z-index': props.zIndex ?? 10,
      } : undefined}>
      {props.children}
    </div>
  </div>
}
export default Affix
