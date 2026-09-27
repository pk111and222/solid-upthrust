import { createSignal, Show } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Segmented from 'upthrust-ui/source/Segmented'
import Slider from 'upthrust-ui/source/Slider'
import Space, { type SpaceSize } from 'upthrust-ui/source/Space'

type Mode = 'small' | 'middle' | 'large' | 'customize'

export default function Size() {
  const [mode, setMode] = createSignal<Mode>('small')
  const [custom, setCustom] = createSignal(40)
  const size = (): SpaceSize => (mode() === 'customize' ? custom() : mode())
  return <div class="flex flex-col gap-md">
    <div class="max-w-full overflow-x-auto">
      <Segmented aria-label="间距" value={mode()} onChange={value => setMode(value as Mode)}
        options={[{ label: 'small 8px', value: 'small' }, { label: 'middle 16px', value: 'middle' }, { label: 'large 24px', value: 'large' }, { label: '自定义', value: 'customize' }]} />
    </div>
    <Show when={mode() === 'customize'}>
      <Slider aria-label="自定义间距" min={0} max={64} value={custom()} onChange={setCustom} class="max-w-[320px]" />
    </Show>
    <Space size={size()} data-space-size>
      <Button type="primary">主按钮</Button>
      <Button>次按钮</Button>
      <Button type="dashed">虚线按钮</Button>
      <Button type="link">链接按钮</Button>
    </Space>
  </div>
}
