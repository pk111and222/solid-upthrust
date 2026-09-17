import { createMemo, createSignal } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { parseColor } from 'upthrust-competence'
import { ConfigContext, useConfig, type ConfigContextValue } from './context'
import type { ConfigProviderProps, ConfigTheme } from './types'
export type { ConfigProviderProps, ConfigTheme, ComponentDefaults, ConfigComponentName } from './types'
export { useConfig, useComponentProps } from './context'
/** Converts the palette to the RGB-channel variables consumed by our UnoCSS preset. */
export function themeStyle(theme?: ConfigTheme): JSX.CSSProperties {
  const result: Record<string, string> = {}
  const prefix = theme?.prefix ?? '--upthrust'
  for (const [key, value] of Object.entries(theme?.colors ?? {})) {
    const color = parseColor(value)
    if (!color) continue
    const name = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
    const { r, g, b, a } = color.toRgb()
    result[`${prefix}-colors-${name}`] = `${r} ${g} ${b}`
    result[`${prefix}-colors-${name}--alpha`] = String(a)
    result[`--colors-${name}`] = color.toRgbString()
  }
  return result
}
export default function ConfigProvider(props: ConfigProviderProps) {
  const parent = useConfig()
  const [element, setElement] = createSignal<HTMLDivElement | undefined>(undefined, { ownedWrite: true })
  const defaults = createMemo(() => {
    const inherited = props.inherit === false ? {} : parent?.defaults() ?? {}
    const result = { ...inherited }
    for (const key of Object.keys(props.components ?? {}) as (keyof typeof result)[]) {
      // Each component merges one level; individual prop objects are replaced.
      Object.assign(result, { [key]: { ...inherited[key], ...props.components?.[key] } })
    }
    return result
  })
  const context: ConfigContextValue = {
    componentSize: () => props.componentSize ?? (props.inherit === false ? undefined : parent?.componentSize()),
    componentDisabled: () => props.componentDisabled ?? (props.inherit === false ? undefined : parent?.componentDisabled()),
    defaults,
    element: () => props.wrapper === false
      ? parent ? parent.element() : typeof document === 'undefined' ? undefined : document.body
      : element(),
  }
  return <ConfigContext value={context}>{props.wrapper === false ? props.children : <div ref={setElement} class={props.class} style={{ ...themeStyle(props.theme), ...props.style }} data-upthrust-config="">
    {props.children}
  </div>}</ConfigContext>
}
