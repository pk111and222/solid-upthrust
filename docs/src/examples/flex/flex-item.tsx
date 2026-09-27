import Flex from 'upthrust-ui/source/Flex'

export default function FlexItem() {
  return <Flex vertical gap="middle">
    {/* 外层容器横向排布，侧栏固定宽度，内容区 flex={1} 占满剩余空间。 */}
    <Flex data-flex-item class="h-[140px] overflow-hidden rounded-lg border border-outline-variant">
      <div class="w-[120px] shrink-0 bg-primary-container p-3 text-sm text-on-primary-container">侧栏 120px</div>
      <Flex data-flex-fill flex={1} vertical justify="center" align="center" class="bg-surface-variant text-sm">
        <span>flex={'{1}'}</span>
        <span class="text-xs text-on-surface-variant">等价 CSS flex: 1（1 1 0%）</span>
      </Flex>
    </Flex>
    {/* 字符串原样写入，适合声明基准宽度。 */}
    <Flex gap="small" wrap class="text-sm">
      <Flex flex="1 1 160px" justify="center" class="rounded bg-primary/15 py-3">flex="1 1 160px"</Flex>
      <Flex flex="2 1 160px" justify="center" class="rounded bg-primary/30 py-3">flex="2 1 160px"</Flex>
      <Flex flex="none" justify="center" class="rounded bg-primary/45 px-4 py-3">flex="none"</Flex>
    </Flex>
  </Flex>
}
