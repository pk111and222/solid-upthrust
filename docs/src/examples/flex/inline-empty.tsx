import { createSignal, Show } from 'solid-js'
import Flex from 'upthrust-ui/source/Flex'
import Button from 'upthrust-ui/source/Button'

export default function InlineEmpty() {
  const [filled, setFilled] = createSignal(false)
  return <Flex vertical gap="middle" align="flex-start">
    {/* inline 使用 inline-flex，容器与周围文字处在同一行。 */}
    <p class="m-0 text-sm leading-8">
      订单状态
      <Flex inline data-flex-inline gap="small" align="center" class="mx-2 rounded bg-surface-variant px-2 align-middle">
        <span class="i-mdi-check-circle text-primary" aria-hidden="true" />
        <span>已支付</span>
      </Flex>
      后将自动进入发货流程。
    </p>
    {/* 没有任何子节点时容器 display:none，不留下 gap 或边框占位。 */}
    <Button onClick={() => setFilled(value => !value)}>{filled() ? '清空容器' : '填充容器'}</Button>
    <Flex data-flex-empty gap="small" class="rounded-lg border border-dashed border-outline p-3">
      <Show when={filled()}><span class="text-sm">现在有内容了，容器显示出来。</span></Show>
    </Flex>
    <p class="m-0 text-xs text-on-surface-variant">上方虚线框仅在有子节点时出现；空白文本节点也算子节点。</p>
  </Flex>
}
