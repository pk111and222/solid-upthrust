import { createSignal, For, Show } from 'solid-js'
import Flex from 'upthrust-ui/source/Flex'
import Button from 'upthrust-ui/source/Button'
import Segmented from 'upthrust-ui/source/Segmented'
import Slider from 'upthrust-ui/source/Slider'

type GapMode = 'small' | 'middle' | 'large' | 'customize'

export default function Gap() {
  const [mode, setMode] = createSignal<GapMode>('small')
  const [custom, setCustom] = createSignal(0)
  return <Flex gap="middle" vertical>
    {/* 窄屏下四个选项放不下时横向滚动，避免被示例卡片裁掉。 */}
    <div class="max-w-full overflow-x-auto">
      <Segmented aria-label="间距档位" value={mode()} onChange={value => setMode(value as GapMode)}
        options={[{ label: 'small 8px', value: 'small' }, { label: 'middle 16px', value: 'middle' }, { label: 'large 24px', value: 'large' }, { label: '自定义', value: 'customize' }]} />
    </div>
    <Show when={mode() === 'customize'}>
      <Slider aria-label="自定义间距" value={custom()} onChange={setCustom} min={0} max={40} />
    </Show>
    <Flex data-flex-gap gap={mode() === 'customize' ? custom() : mode()} wrap>
      <For each={['Primary', 'Default', 'Dashed', 'Link']}>{label =>
        <Button type={label.toLowerCase() as 'primary' | 'default' | 'dashed' | 'link'}>{label}</Button>}
      </For>
    </Flex>
    <p class="m-0 text-xs text-on-surface-variant">当前 gap：{mode() === 'customize' ? `${custom()}（数字按 px）` : mode()}</p>
  </Flex>
}
