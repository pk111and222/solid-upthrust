import { createSignal, For } from 'solid-js'
import type { JSX } from '@solidjs/web'
import Flex from 'upthrust-ui/source/Flex'

// 自定义宿主组件：透传全部属性，并在 Flex 计算出的 class 后追加自身样式。
const Panel = (props: JSX.HTMLAttributes<HTMLElement>) =>
  <section {...props} class={`${props.class ?? ''} rounded-lg border border-dashed border-outline p-3`} />

export default function Element() {
  const [clicks, setClicks] = createSignal(0)
  const [width, setWidth] = createSignal(0)
  return <Flex vertical gap="middle">
    {/* component 渲染语义标签：ul 的直接子元素就是 li，Flex 不额外包裹。 */}
    <Flex component="ul" data-flex-list gap="small" wrap class="m-0 list-none p-0">
      <For each={['首页', '订单', '客户', '报表']}>{item =>
        <li class="rounded bg-primary/10 px-3 py-1 text-sm text-primary">{item}</li>}
      </For>
    </Flex>
    {/* 原生属性、aria、事件与 ref 透传到宿主元素。 */}
    <Flex component="nav" role="toolbar" aria-label="批量操作" data-flex-toolbar tabindex={0} gap="small" align="center"
      class="rounded-lg border border-outline-variant px-3 py-2 text-sm"
      ref={el => requestAnimationFrame(() => setWidth(Math.round(el.getBoundingClientRect().width)))}
      onClick={() => setClicks(count => count + 1)}>
      <span>点击工具栏</span>
      <output class="text-on-surface-variant">点击 {clicks()} 次 · 宽 {width()}px</output>
    </Flex>
    {/* component 也可以是自定义组件，Flex 计算出的 class/style 会一并传入。 */}
    <Flex component={Panel} aria-label="自定义组件容器" data-flex-custom justify="space-between" gap={12}>
      <span class="text-sm">自定义 Panel 组件</span>
      <span class="text-sm text-on-surface-variant">justify="space-between"</span>
    </Flex>
  </Flex>
}
