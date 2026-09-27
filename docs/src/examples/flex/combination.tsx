import Flex from 'upthrust-ui/source/Flex'
import Button from 'upthrust-ui/source/Button'

export default function Combination() {
  return <div data-flex-combination class="max-w-[620px] overflow-hidden rounded-lg border border-outline-variant">
    <Flex justify="space-between" wrap>
      <div class="flex h-[180px] w-[273px] max-w-full items-center justify-center bg-primary text-4xl text-on-primary" role="img" aria-label="封面占位">
        <span class="i-mdi-rocket-launch-outline" />
      </div>
      <Flex vertical align="flex-end" justify="space-between" flex={1} class="min-w-[220px] p-8">
        <h3 class="m-0 text-lg font-medium leading-7 text-on-surface">
          “Solid Upthrust 基于 Solid 2 与 UnoCSS，为企业后台提供细粒度响应式的组件。”
        </h3>
        <Button type="primary">开始使用</Button>
      </Flex>
    </Flex>
  </div>
}
