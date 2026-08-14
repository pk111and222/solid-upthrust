import { Component, JSX, For, Show, mergeProps, children as resolveChildren } from 'solid-js'
import { breadcrumbClass, breadcrumbItemClass, breadcrumbSeparatorClass } from './styles'
import { twMerge } from 'tailwind-merge'

export interface BreadcrumbItemType {
  title: string | JSX.Element
  href?: string
  onClick?: (e: MouseEvent) => void
}

export interface BreadcrumbProps {
  separator?: JSX.Element
  items?: BreadcrumbItemType[]
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

export interface BreadcrumbItemProps {
  href?: string
  onClick?: (e: MouseEvent) => void
  class?: string
  children?: JSX.Element
}

const BreadcrumbItem: Component<BreadcrumbItemProps> = (rawProps) => {
  const props = mergeProps({}, rawProps)

  return (
    <Show
      when={props.href}
      fallback={<span class={twMerge(breadcrumbItemClass({ active: true }), props.class)}>{props.children}</span>}
    >
      <a
        href={props.href}
        onClick={props.onClick}
        class={twMerge(breadcrumbItemClass({ active: false }), props.class)}
      >
        {props.children}
      </a>
    </Show>
  )
}

const Breadcrumb: Component<BreadcrumbProps> & { Item: typeof BreadcrumbItem } = (rawProps) => {
  const props = mergeProps({ separator: '/' as JSX.Element }, rawProps)

  return (
    <nav class={twMerge(breadcrumbClass({}), props.class)} style={props.style}>
      <Show when={props.items} fallback={props.children}>
        <For each={props.items}>
          {(item, index) => (
            <>
              <Show when={index() > 0}>
                <span class={breadcrumbSeparatorClass({})}>{props.separator}</span>
              </Show>
              <Show
                when={item.href && index() < props.items!.length - 1}
                fallback={
                  <span class={breadcrumbItemClass({ active: index() === props.items!.length - 1 })}>
                    {item.title}
                  </span>
                }
              >
                <a
                  href={item.href}
                  onClick={item.onClick}
                  class={breadcrumbItemClass({ active: false })}
                >
                  {item.title}
                </a>
              </Show>
            </>
          )}
        </For>
      </Show>
    </nav>
  )
}

Object.assign(Breadcrumb, { Item: BreadcrumbItem })

export { BreadcrumbItem }
export default Breadcrumb
