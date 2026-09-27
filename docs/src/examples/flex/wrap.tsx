import { createSignal, For } from 'solid-js'
import Flex, { type FlexWrap } from 'upthrust-ui/source/Flex'
import Button from 'upthrust-ui/source/Button'
import Segmented from 'upthrust-ui/source/Segmented'

export default function Wrap() {
  const [wrap, setWrap] = createSignal<FlexWrap>('wrap')
  return <Flex gap="middle" vertical>
    <div class="max-w-full overflow-x-auto">
      <Segmented aria-label="换行方式" value={wrap()} onChange={value => setWrap(value as FlexWrap)} options={['wrap', 'nowrap', 'wrap-reverse']} />
    </div>
    {/* nowrap 时子项会被压缩或溢出，外层裁剪以免撑开页面。 */}
    <div class="overflow-hidden">
      <Flex data-flex-wrap wrap={wrap()} gap="small">
        <For each={Array.from({ length: 24 }, (_, index) => index + 1)}>{item =>
          <Button type="primary">按钮 {item}</Button>}
        </For>
      </Flex>
    </div>
    <p class="m-0 text-xs text-on-surface-variant">wrap 也接受布尔值：wrap 等价 "wrap"，wrap={'{false}'} 等价 "nowrap"。</p>
  </Flex>
}
