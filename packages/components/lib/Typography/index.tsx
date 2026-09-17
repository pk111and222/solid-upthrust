import { Component, Show, createMemo, merge } from 'solid-js'
import { createTypography, type TypographyCopyConfig, type TypographyEditableConfig } from 'upthrust-competence'
import type { JSX } from '@solidjs/web'
import { Dynamic } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import { typographyClass, titleClass, linkClass, paragraphClass } from './styles'

export interface TypographyBaseProps {
  copyable?: boolean | (TypographyCopyConfig & { icon?: JSX.Element; tooltips?: string | false })
  editable?: boolean | (TypographyEditableConfig & { icon?: JSX.Element; tooltip?: string | false })
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

const TypographyContent: Component<TypographyBaseProps> = props => {
  let content: HTMLSpanElement | undefined
  const state = createTypography({
    text: () => typeof props.children === 'string' || typeof props.children === 'number' ? String(props.children) : content?.textContent ?? '',
    get disabled() { return props.disabled },
    get copyable() { return props.copyable },
    get editable() { return props.editable },
    async writeClipboard(text) {
      if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return }
      const previous = document.activeElement as HTMLElement | null
      const field = document.createElement('textarea')
      field.value = text; field.setAttribute('aria-hidden', 'true'); field.className = 'fixed opacity-0 pointer-events-none'
      document.body.append(field); field.select()
      try { if (!document.execCommand('copy')) throw new Error('Clipboard is unavailable') }
      finally { field.remove(); previous?.focus() }
    },
  })
  const editOptions = () => typeof props.editable === 'object' ? props.editable : {}
  const copyOptions = () => typeof props.copyable === 'object' ? props.copyable : {}
  return <Show when={state.editing()} fallback={<>
    <span ref={content}>{wrapDecorations(editOptions().text ?? state.localText() ?? props.children, props)}</span>
    <Show when={props.editable && !props.disabled}>
      <button type="button" class="inline-flex align-middle ml-1 p-0 border-0 bg-transparent text-primary cursor-pointer" aria-label="编辑"
        title={editOptions().tooltip || undefined} onClick={state.startEdit}>{editOptions().icon ?? <span class="i-mdi-pencil-outline" />}</button>
    </Show>
    <Show when={props.copyable && !props.disabled}>
      <button type="button" class="inline-flex align-middle ml-1 p-0 border-0 bg-transparent text-primary cursor-pointer" aria-label={state.copied() ? '已复制' : '复制'}
        title={copyOptions().tooltips || undefined} disabled={state.copying()} onClick={() => void state.copy()}>
        <Show when={state.copied()} fallback={copyOptions().icon ?? <span class="i-mdi-content-copy" />}><span class="i-mdi-check text-green-600" /></Show>
      </button>
      <span role="status" class="sr-only">{state.copied() ? '已复制' : ''}</span>
    </Show>
  </>}>
    <textarea aria-label="编辑文本" class="w-full box-border rounded border border-solid border-primary bg-transparent text-inherit p-1 outline-none"
      ref={el => { el.value = state.text(); state.setDraft(state.text()); queueMicrotask(() => { if (el.isConnected) { el.focus(); el.setSelectionRange(el.value.length, el.value.length) } }) }}
      value={state.draft()} maxlength={editOptions().maxLength}
      onInput={e => state.setDraft(e.currentTarget.value)} onBlur={e => state.finishEdit(e.currentTarget.value)}
      onKeyDown={e => { if (e.isComposing) return; if (e.key === 'Escape') { e.preventDefault(); state.cancelEdit() } else if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); state.finishEdit(e.currentTarget.value) } }} />
  </Show>
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
    <TypographyContent {...props} />
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
    <TypographyContent {...props} />
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
    <TypographyContent {...props} />
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
