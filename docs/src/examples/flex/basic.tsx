import { createSignal, For } from 'solid-js'
import Flex, { type FlexOrientation } from 'upthrust-ui/source/Flex'
import Segmented from 'upthrust-ui/source/Segmented'

export default function Basic() {
  const [orientation, setOrientation] = createSignal<FlexOrientation>('horizontal')
  return <Flex gap="middle" vertical>
    <div class="max-w-full overflow-x-auto">
      <Segmented aria-label="排列方向" value={orientation()} onChange={value => setOrientation(value as FlexOrientation)}
        options={[{ label: '水平 horizontal', value: 'horizontal' }, { label: '垂直 vertical', value: 'vertical' }]} />
    </div>
    <Flex orientation={orientation()} data-flex-basic>
      <For each={[0, 1, 2, 3]}>{item =>
        <div class={`h-[54px] ${orientation() === 'horizontal' ? 'w-1/4' : ''} ${item % 2 ? 'bg-primary/75' : 'bg-primary'}`} />}
      </For>
    </Flex>
  </Flex>
}
