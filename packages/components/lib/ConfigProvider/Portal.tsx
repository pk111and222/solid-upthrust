import { Show } from 'solid-js'
import { Portal as SolidPortal } from '@solidjs/web'
import type { ComponentProps } from 'solid-js'
import { useConfig } from './context'
/** Keep the actual DOM under its theme scope, including nested/custom UnoCSS themes. */
export function ConfigPortal(props: ComponentProps<typeof SolidPortal>) {
  const config = useConfig()
  return <Show when={!config || config.element()}><SolidPortal {...props} mount={props.mount ?? config?.element()}>{props.children}</SolidPortal></Show>
}
