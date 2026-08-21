import { Component,  createMemo, merge } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { Dynamic } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import { typographyClass, titleClass, linkClass, paragraphClass } from './styles'

interface TypographyBaseProps {
  type?: 'secondary' | 'success' | 'warning' | 'danger'
  strong?: boolean
  italic?: boolean
  underline?: boolean
  delete?: boolean
  code?: boolean
  mark?: boolean
  keyboard?: boolean
  disabled?: boolean
  ellipsis?: boolean | { rows?: number }
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

export interface TextProps extends TypographyBaseProps {}

export interface TitleProps extends TypographyBaseProps {
  level?: 1 | 2 | 3 | 4 | 5
}

export interface ParagraphProps extends TypographyBaseProps {}

export interface LinkProps extends TypographyBaseProps {
  href?: string
  target?: HTMLAnchorElement['target']
  rel?: string
}

function wrapDecorations(children: JSX.Element, props: TypographyBaseProps): JSX.Element {
  let content = children
  if (props.strong) content = <strong>{content}</strong>
  if (props.italic) content = <em>{content}</em>
  if (props.underline) content = <u>{content}</u>
  if (props.delete) content = <del>{content}</del>
  if (props.code) content = <code class="px-[0.2em] py-[0.1em] text-[85%] bg-on-surface/4 border border-solid border-outline-variant/30 rounded-xs font-mono">{content}</code>
  if (props.mark) content = <mark class="px-[0.1em] bg-amber-200/80 rounded-xs">{content}</mark>
  if (props.keyboard) content = <kbd class="px-[0.4em] py-[0.15em] text-[90%] bg-on-surface/4 border border-solid border-outline-variant/30 rounded-xs font-mono">{content}</kbd>
  return content
}

function ellipsisStyle(ellipsis?: boolean | { rows?: number }): JSX.CSSProperties {
  if (typeof ellipsis === 'object' && ellipsis.rows && ellipsis.rows > 1) {
    return {
      display: '-webkit-box',
      '-webkit-line-clamp': String(ellipsis.rows),
      '-webkit-box-orient': 'vertical',
      overflow: 'hidden',
    }
  }
  return {}
}

export const Text: Component<TextProps> = (rawProps) => {
  const props = merge({}, rawProps)

  const _class = createMemo(() =>
    twMerge(
      typographyClass({ type: props.type, disabled: !!props.disabled, ellipsis: props.ellipsis === true }),
      props.class || ''
    )
  )

  const _style = createMemo((): JSX.CSSProperties => ({
    ...ellipsisStyle(props.ellipsis),
    ...props.style,
  }))

  return <span class={_class()} style={_style()}>
    {wrapDecorations(props.children, props)}
  </span>
}

export const Title: Component<TitleProps> = (rawProps) => {
  const props = merge({ level: 1 as const }, rawProps)

  const _tag = createMemo(() => `h${props.level}` as keyof JSX.IntrinsicElements)

  const _class = createMemo(() =>
    twMerge(
      typographyClass({ type: props.type, disabled: !!props.disabled, ellipsis: props.ellipsis === true }),
      titleClass({ level: props.level }),
      props.class || ''
    )
  )

  const _style = createMemo((): JSX.CSSProperties => ({
    ...ellipsisStyle(props.ellipsis),
    ...props.style,
  }))

  return <Dynamic component={_tag()} class={_class()} style={_style()}>
    {wrapDecorations(props.children, props)}
  </Dynamic>
}

export const Paragraph: Component<ParagraphProps> = (rawProps) => {
  const props = merge({}, rawProps)

  const _class = createMemo(() =>
    twMerge(
      typographyClass({ type: props.type, disabled: !!props.disabled, ellipsis: props.ellipsis === true }),
      paragraphClass({}),
      props.class || ''
    )
  )

  const _style = createMemo((): JSX.CSSProperties => ({
    ...ellipsisStyle(props.ellipsis),
    ...props.style,
  }))

  return <div class={_class()} style={_style()}>
    {wrapDecorations(props.children, props)}
  </div>
}

export const Link: Component<LinkProps> = (rawProps) => {
  const props = merge({}, rawProps)

  const _class = createMemo(() =>
    twMerge(
      typographyClass({ type: props.type, disabled: !!props.disabled, ellipsis: props.ellipsis === true }),
      linkClass({ disabled: !!props.disabled }),
      props.class || ''
    )
  )

  return <a href={props.href} target={props.target} rel={props.rel} class={_class()} style={props.style}>
    {wrapDecorations(props.children, props)}
  </a>
}

const Typography = { Text, Title, Paragraph, Link }
export default Typography
