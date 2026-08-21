import { Component, Show, merge } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { emptyClass, emptyDescriptionClass, emptyFooterClass } from './styles'

/**
 * Built-in empty-state illustrations, redrawn as inline SVG with
 * currentColor wiring so they follow the theme (no external assets).
 */
const SimpleImage: Component = () => (
  <svg width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="33" rx="32" ry="8" class="fill-outline-variant/40" />
    <path
      d="M55 12.76L44.854 14.6L45.4 5L55 12.76Z M55 12.76 L44.854 14.6 L45.4 5 Z"
      class="fill-outline-variant"
      transform="translate(0 3)"
    />
    <path
      d="M18.7 5.8C18.7 5.8 7 8.7 7 20.4C7 24.4 9.2 29.6 12.9 29.6C16.6 29.6 15.9 25.9 15.9 25.9C15.9 25.9 9.9 24.3 11.7 16.5C13.4 8.7 22.4 7.2 22.4 7.2"
      class="stroke-outline-variant"
      fill="none"
      stroke-width="2.5"
      stroke-linecap="round"
      transform="translate(26 4) rotate(4)"
    />
    <path
      d="M49.7 21.7c0 8.9-8.9 16.1-19.9 16.1S9.9 30.6 9.9 21.7 18.8 5.6 29.8 5.6s19.9 7.2 19.9 16.1Z"
      class="fill-surface stroke-outline"
      stroke-width="2"
    />
    <path d="M43 30.4c1.7-1.7 2.7-3.9 2.7-6.6 0-6-5.6-10.5-12.4-10.5S21 17.8 21 23.8s5.6 10.5 12.4 10.5c1.4 0 2.7-.2 3.9-.5l5.7 3.4-.6-4.4c.2-.1.4-.2.6-.4Z" class="fill-outline-variant/60" />
    <circle cx="25" cy="23" r="2" class="fill-outline" />
    <circle cx="32" cy="23" r="2" class="fill-outline" />
    <circle cx="39" cy="23" r="2" class="fill-outline" />
  </svg>
)

const DefaultImage: Component = () => (
  <svg width="161" height="117" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ut-empty-a" x1="50%" x2="50%" y1="0%" y2="100%">
        <stop offset="0%" class="stop-color-outline-variant/70" />
        <stop offset="100%" class="stop-color-outline-variant/30" />
      </linearGradient>
    </defs>
    <ellipse cx="32" cy="33" rx="32" ry="8" class="fill-outline-variant/30" />
    <path d="M55 12.83L44.354 14.6L45.26 5.04L55 12.83Z" class="fill-outline-variant" />
    <path
      d="M18.26 3.76C18.26 3.76 6.66 6.62 6.66 18.15C6.66 22.04 8.83 27.13 12.44 27.13C16.05 27.13 15.38 23.5 15.38 23.5C15.38 23.5 9.51 21.97 11.26 14.35C13.01 6.73 21.9 5.24 21.9 5.24"
      fill="none"
      class="stroke-outline-variant"
      stroke-width="2.2"
      stroke-linecap="round"
    />
    <path
      d="M50.32 21.69c0 8.84-8.86 16-19.79 16-10.93 0-19.79-7.16-19.79-16s8.86-16 19.79-16c10.93 0 19.79 7.16 19.79 16Z"
      fill="url(#ut-empty-a)"
      class="stroke-outline"
      stroke-width="2"
    />
    <path d="M36.14 29.66c-1.7.4-3.5.6-5.4.6-6.7 0-12.1-3.6-12.1-8.1s5.4-8.1 12.1-8.1 12.1 3.6 12.1 8.1c0 1.5-.6 2.9-1.6 4.1l2.8 5.2-5.9-1.8Z" class="fill-surface" />
    <circle cx="24.5" cy="22" r="1.8" class="fill-outline" />
    <circle cx="30.9" cy="22" r="1.8" class="fill-outline" />
    <circle cx="37.3" cy="22" r="1.8" class="fill-outline" />
  </svg>
)

export const PRESENTED_IMAGE_DEFAULT = DefaultImage
export const PRESENTED_IMAGE_SIMPLE = SimpleImage

export interface EmptyProps {
  /** Custom image node; false disables the image entirely */
  image?: JSX.Element | false
  /** Inline styles applied to the image wrapper */
  imageStyle?: JSX.CSSProperties
  /** Description text; false hides it */
  description?: JSX.Element | false
  /** Footer content (e.g. action buttons) */
  children?: JSX.Element
  class?: string
  style?: JSX.CSSProperties
}

const Empty: Component<EmptyProps> = (rawProps) => {
  const props = merge({ image: DefaultImage as JSX.Element }, rawProps)

  const imageNode = createImageNode()

  function createImageNode(): JSX.Element {
    if (props.image === false) return null as unknown as JSX.Element
    if (props.image === undefined) return <DefaultImage />
    return props.image
  }

  return (
    <div class={emptyClass({})} style={props.style}>
      <Show when={imageNode}>
        <div class="flex items-center justify-center" style={props.imageStyle}>
          {imageNode}
        </div>
      </Show>
      <Show when={props.description !== false}>
        <div class={emptyDescriptionClass({})}>{props.description ?? '暂无数据'}</div>
      </Show>
      <Show when={props.children}>
        <div class={emptyFooterClass({})}>{props.children}</div>
      </Show>
    </div>
  )
}

export default Empty
