import { Component, Show, createMemo, merge } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { resultContainerClass, resultIconClass, resultTitleClass, resultSubtitleClass, resultExtraClass, resultImageClass } from './styles'
import { twMerge } from 'tailwind-merge'

export type ResultStatus = 'success' | 'error' | 'warning' | 'info' | '404' | '403' | '500'

export interface ResultProps {
  /** Status drives the built-in icon and tint; page codes render a wordmark. */
  status?: ResultStatus
  title?: JSX.Element
  subTitle?: JSX.Element
  /** Custom icon replaces the built-in one. */
  icon?: JSX.Element
  /** Action area, usually buttons. */
  extra?: JSX.Element
  children?: JSX.Element
  class?: string
  style?: JSX.CSSProperties
}

const STATUS_ICON: Record<string, string> = {
  success: 'i-mdi-check-circle',
  error: 'i-mdi-close-circle',
  warning: 'i-mdi-alert-circle',
  info: 'i-mdi-information',
}

const PAGE_TITLES: Record<string, { title: string; subTitle: string }> = {
  '404': { title: '404', subTitle: '抱歉，您访问的页面不存在' },
  '403': { title: '403', subTitle: '抱歉，您没有权限访问此页面' },
  '500': { title: '500', subTitle: '抱歉，服务器出错了' },
}

const Result: Component<ResultProps> = (rawProps) => {
  const props = merge({ status: 'info' as ResultStatus }, rawProps)

  const isPage = createMemo(() => ['404', '403', '500'].includes(props.status!))
  const resolvedTitle = createMemo(() => {
    if (props.title !== undefined) return props.title
    const page = PAGE_TITLES[props.status!]
    return page ? page.title : undefined
  })
  const resolvedSubTitle = createMemo(() => {
    if (props.subTitle !== undefined) return props.subTitle
    const page = PAGE_TITLES[props.status!]
    return page ? page.subTitle : undefined
  })

  return (
    <div class={twMerge(resultContainerClass({}), props.class)} style={props.style}>
      <Show
        when={isPage()}
        fallback={
          <Show when={props.icon} fallback={<div class={resultIconClass({ status: props.status })}><span class={STATUS_ICON[props.status!] ?? STATUS_ICON.info} /></div>}>
            <div class={resultIconClass({ status: props.status })}>{props.icon}</div>
          </Show>
        }
      >
        <div class={resultImageClass({ status: props.status })}>{props.status}</div>
      </Show>

      <Show when={resolvedTitle()}>
        <div class={resultTitleClass({})}>{resolvedTitle()}</div>
      </Show>
      <Show when={resolvedSubTitle()}>
        <div class={resultSubtitleClass({})}>{resolvedSubTitle()}</div>
      </Show>
      <Show when={props.extra}>
        <div class={resultExtraClass({})}>{props.extra}</div>
      </Show>
      <Show when={props.children}>
        <div class="mt-[16px]">{props.children}</div>
      </Show>
    </div>
  )
}

export default Result
